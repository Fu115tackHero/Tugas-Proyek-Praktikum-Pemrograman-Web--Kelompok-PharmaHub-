// Coupon Service - Database operations for coupons
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

// Use centralized database configuration
const pool = require("../config/database");

const couponService = {
  /**
   * Get all active coupons
   * @returns {Promise<Array>} Active coupons
   */
  async getActiveCoupons() {
    try {
      console.log("🎫 [CouponService] Fetching active coupons...");

      const query = `
        SELECT 
          c.coupon_id,
          c.code,
          c.description,
          c.discount_type,
          c.discount_value,
          c.min_purchase,
          c.max_discount,
          c.usage_limit,
          c.usage_per_user,
          c.start_date,
          c.end_date,
          c.is_active,
          (
            SELECT COUNT(*) 
            FROM coupon_usage cu 
            WHERE cu.coupon_id = c.coupon_id
          ) as total_usage
        FROM coupons c
        WHERE c.is_active = TRUE
          AND c.start_date <= CURRENT_TIMESTAMP
          AND c.end_date >= CURRENT_TIMESTAMP
        ORDER BY c.code
      `;

      const result = await pool.query(query);

      console.log(
        `✅ [CouponService] Found ${result.rows.length} active coupons`
      );

      return result.rows.map((coupon) => ({
        coupon_id: coupon.coupon_id,
        code: coupon.code,
        description: coupon.description,
        discount_type: coupon.discount_type,
        discount_value: parseFloat(coupon.discount_value),
        min_purchase: coupon.min_purchase ? parseFloat(coupon.min_purchase) : 0,
        max_discount: coupon.max_discount
          ? parseFloat(coupon.max_discount)
          : null,
        usage_limit: coupon.usage_limit,
        usage_per_user: coupon.usage_per_user || 1,
        start_date: coupon.start_date,
        end_date: coupon.end_date,
        is_active: coupon.is_active,
        total_usage: parseInt(coupon.total_usage),
        remaining_usage: coupon.usage_limit
          ? coupon.usage_limit - parseInt(coupon.total_usage)
          : null,
      }));
    } catch (error) {
      console.error(
        "❌ [CouponService] Error fetching coupons:",
        error.message
      );
      throw error;
    }
  },

  /**
   * Validate and apply coupon
   * @param {string} couponCode - Coupon code
   * @param {number} userId - User ID
   * @param {number} cartTotal - Cart total amount
   * @returns {Promise<Object>} Coupon details with discount
   */
  async validateCoupon(couponCode, userId, cartTotal) {
    const client = await pool.connect();

    try {
      console.log(
        `🎫 [CouponService] Validating coupon ${couponCode} for user ${userId}, cart total: Rp ${cartTotal}`
      );

      await client.query("BEGIN");

      // Get coupon details
      const couponQuery = `
        SELECT 
          coupon_id,
          code,
          description,
          discount_type,
          discount_value,
          min_purchase,
          max_discount,
          usage_limit,
          usage_per_user,
          start_date,
          end_date,
          is_active
        FROM coupons
        WHERE UPPER(code) = UPPER($1)
      `;

      const couponResult = await client.query(couponQuery, [couponCode]);

      if (couponResult.rows.length === 0) {
        throw new Error("Coupon code not found");
      }

      const coupon = couponResult.rows[0];

      // Check if active
      if (!coupon.is_active) {
        throw new Error("Coupon is no longer active");
      }

      // Check date validity
      const now = new Date();
      if (now < new Date(coupon.start_date)) {
        throw new Error("Coupon is not yet valid");
      }
      if (now > new Date(coupon.end_date)) {
        throw new Error("Coupon has expired");
      }

      // Check minimum purchase
      if (coupon.min_purchase && cartTotal < parseFloat(coupon.min_purchase)) {
        throw new Error(
          `Minimum purchase of Rp ${parseFloat(
            coupon.min_purchase
          ).toLocaleString()} required`
        );
      }

      // Check global usage limit
      if (coupon.usage_limit) {
        const totalUsageResult = await client.query(
          "SELECT COUNT(*) as count FROM coupon_usage WHERE coupon_id = $1",
          [coupon.coupon_id]
        );

        if (parseInt(totalUsageResult.rows[0].count) >= coupon.usage_limit) {
          throw new Error("Coupon usage limit reached");
        }
      }

      // Check user usage limit
      if (coupon.usage_per_user) {
        const userUsageResult = await client.query(
          "SELECT COUNT(*) as count FROM coupon_usage WHERE coupon_id = $1 AND user_id = $2",
          [coupon.coupon_id, userId]
        );

        const userUsageCount = parseInt(userUsageResult.rows[0].count);
        
        if (userUsageCount >= coupon.usage_per_user) {
          throw new Error(
            `Kupon ${coupon.code} sudah kamu gunakan ${userUsageCount}x (maksimal ${coupon.usage_per_user}x per user)`
          );
        }
      }

      // Calculate discount
      let discountAmount = 0;

      if (coupon.discount_type === "percentage") {
        discountAmount = cartTotal * (parseFloat(coupon.discount_value) / 100);

        // Apply max discount cap
        if (
          coupon.max_discount &&
          discountAmount > parseFloat(coupon.max_discount)
        ) {
          discountAmount = parseFloat(coupon.max_discount);
        }
      } else if (coupon.discount_type === "fixed") {
        discountAmount = Math.min(parseFloat(coupon.discount_value), cartTotal);
      }

      discountAmount = Math.round(discountAmount);

      await client.query("COMMIT");

      console.log(
        `✅ [CouponService] Coupon valid - Discount: Rp ${discountAmount.toLocaleString()}`
      );

      return {
        valid: true,
        coupon: {
          coupon_id: coupon.coupon_id,
          code: coupon.code,
          description: coupon.description,
          discount_type: coupon.discount_type,
          discount_value: parseFloat(coupon.discount_value),
          min_purchase: coupon.min_purchase
            ? parseFloat(coupon.min_purchase)
            : 0,
          max_discount: coupon.max_discount
            ? parseFloat(coupon.max_discount)
            : null,
        },
        discountAmount,
        finalTotal: cartTotal - discountAmount,
      };
    } catch (error) {
      await client.query("ROLLBACK");
      console.error(
        `❌ [CouponService] Coupon validation failed: ${error.message}`
      );
      throw error;
    } finally {
      client.release();
    }
  },

  /**
   * Record coupon usage
   * @param {number} couponId - Coupon ID
   * @param {number} userId - User ID
   * @param {number} orderId - Order ID
   * @param {number} discountAmount - Discount amount
   * @returns {Promise<Object>} Coupon usage record
   */
  async recordCouponUsage(couponId, userId, orderId, discountAmount) {
    try {
      console.log(
        `📝 [CouponService] Recording coupon usage - Coupon: ${couponId}, User: ${userId}, Order: ${orderId}`
      );

      const query = `
        INSERT INTO coupon_usage (coupon_id, user_id, order_id, discount_amount)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `;

      const result = await pool.query(query, [
        couponId,
        userId,
        orderId,
        discountAmount,
      ]);

      console.log(
        `✅ [CouponService] Coupon usage recorded (usage_id: ${result.rows[0].usage_id})`
      );

      return result.rows[0];
    } catch (error) {
      console.error(
        "❌ [CouponService] Error recording coupon usage:",
        error.message
      );
      throw error;
    }
  },

  /**
   * Get user's coupon usage history
   * @param {number} userId - User ID
   * @returns {Promise<Array>} Coupon usage history
   */
  async getUserCouponHistory(userId) {
    try {
      console.log(
        `📜 [CouponService] Fetching coupon history for user ${userId}`
      );

      const query = `
        SELECT 
          cu.usage_id,
          cu.discount_amount,
          cu.used_at,
          cu.order_id,
          c.code,
          c.description,
          c.discount_type,
          c.discount_value
        FROM coupon_usage cu
        INNER JOIN coupons c ON cu.coupon_id = c.coupon_id
        WHERE cu.user_id = $1
        ORDER BY cu.used_at DESC
      `;

      const result = await pool.query(query, [userId]);

      console.log(
        `✅ [CouponService] Found ${result.rows.length} coupon usage records`
      );

      return result.rows.map((record) => ({
        usage_id: record.usage_id,
        code: record.code,
        description: record.description,
        discount_type: record.discount_type,
        discount_value: parseFloat(record.discount_value),
        discount_amount: parseFloat(record.discount_amount),
        order_id: record.order_id,
        used_at: record.used_at,
      }));
    } catch (error) {
      console.error(
        "❌ [CouponService] Error fetching coupon history:",
        error.message
      );
      throw error;
    }
  },

  /**
   * Get coupon by code
   * @param {string} code - Coupon code
   * @returns {Promise<Object|null>} Coupon row or null
   */
  async getCouponByCode(code) {
    try {
      const res = await pool.query(
        `SELECT * FROM coupons WHERE UPPER(code) = UPPER($1)`,
        [code]
      );
      return res.rows[0] || null;
    } catch (error) {
      console.error(
        "❌ [CouponService] Error fetching coupon by code:",
        error.message
      );
      throw error;
    }
  },

  /**
   * Create new coupon
   */
  async createCoupon(couponData) {
    try {
      console.log("🎫 [CouponService] Creating coupon:", couponData.code);

      const query = `
        INSERT INTO coupons (
          code, description, discount_type, discount_value,
          min_purchase, max_discount, usage_limit, usage_per_user,
          start_date, end_date, is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
      `;

      const values = [
        couponData.code.toUpperCase(),
        couponData.description || null,
        couponData.discount_type,
        couponData.discount_value,
        couponData.min_purchase || 0,
        couponData.max_discount || null,
        couponData.usage_limit || null,
        couponData.usage_per_user || 1,
        couponData.start_date,
        couponData.end_date,
        couponData.is_active !== false,
      ];

      const result = await pool.query(query, values);
      console.log("✅ [CouponService] Coupon created successfully");

      return result.rows[0];
    } catch (error) {
      console.error("❌ [CouponService] Error creating coupon:", error.message);
      if (error.code === "23505") {
        // Unique violation
        throw new Error("Kode kupon sudah digunakan");
      }
      throw error;
    }
  },

  /**
   * Update coupon
   */
  async updateCoupon(couponId, couponData) {
    try {
      console.log("🎫 [CouponService] Updating coupon:", couponId);

      const query = `
        UPDATE coupons SET
          code = $1,
          description = $2,
          discount_type = $3,
          discount_value = $4,
          min_purchase = $5,
          max_discount = $6,
          usage_limit = $7,
          usage_per_user = $8,
          start_date = $9,
          end_date = $10,
          is_active = $11
        WHERE coupon_id = $12
        RETURNING *
      `;

      const values = [
        couponData.code.toUpperCase(),
        couponData.description || null,
        couponData.discount_type,
        couponData.discount_value,
        couponData.min_purchase || 0,
        couponData.max_discount || null,
        couponData.usage_limit || null,
        couponData.usage_per_user || 1,
        couponData.start_date,
        couponData.end_date,
        couponData.is_active !== false,
        couponId,
      ];

      const result = await pool.query(query, values);

      if (result.rows.length === 0) {
        throw new Error("Kupon tidak ditemukan");
      }

      console.log("✅ [CouponService] Coupon updated successfully");
      return result.rows[0];
    } catch (error) {
      console.error("❌ [CouponService] Error updating coupon:", error.message);
      if (error.code === "23505") {
        throw new Error("Kode kupon sudah digunakan");
      }
      throw error;
    }
  },

  /**
   * Delete coupon
   */
  async deleteCoupon(couponId) {
    try {
      console.log("🎫 [CouponService] Deleting coupon:", couponId);

      // Check if coupon has been used
      const usageCheck = await pool.query(
        `SELECT COUNT(*) as usage_count FROM coupon_usage WHERE coupon_id = $1`,
        [couponId]
      );

      if (parseInt(usageCheck.rows[0].usage_count) > 0) {
        throw new Error(
          "Kupon tidak dapat dihapus karena sudah digunakan oleh user. Nonaktifkan saja."
        );
      }

      const result = await pool.query(
        `DELETE FROM coupons WHERE coupon_id = $1 RETURNING *`,
        [couponId]
      );

      if (result.rows.length === 0) {
        throw new Error("Kupon tidak ditemukan");
      }

      console.log("✅ [CouponService] Coupon deleted successfully");
      return result.rows[0];
    } catch (error) {
      console.error("❌ [CouponService] Error deleting coupon:", error.message);
      throw error;
    }
  },

  /**
   * Toggle coupon active status
   */
  async toggleCouponStatus(couponId) {
    try {
      console.log("🎫 [CouponService] Toggling coupon status:", couponId);

      const result = await pool.query(
        `UPDATE coupons SET is_active = NOT is_active WHERE coupon_id = $1 RETURNING *`,
        [couponId]
      );

      if (result.rows.length === 0) {
        throw new Error("Kupon tidak ditemukan");
      }

      console.log("✅ [CouponService] Coupon status toggled successfully");
      return result.rows[0];
    } catch (error) {
      console.error("❌ [CouponService] Error toggling coupon:", error.message);
      throw error;
    }
  },
};

module.exports = couponService;

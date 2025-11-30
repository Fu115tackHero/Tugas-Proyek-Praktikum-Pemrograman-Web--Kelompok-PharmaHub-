// Coupon Service - Database operations for coupons
const { Pool } = require("pg");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME,
});

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

        if (parseInt(userUsageResult.rows[0].count) >= coupon.usage_per_user) {
          throw new Error("You have reached the usage limit for this coupon");
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
      console.error("❌ [CouponService] Error fetching coupon by code:", error.message);
      throw error;
    }
  },
};

module.exports = couponService;

// Coupon Controller - HTTP handlers for coupon endpoints
const couponService = require("../services/couponService");
const cartService = require("../services/cartService");

const couponController = {
  /**
   * GET /api/coupons - Get all active coupons
   */
  async getActiveCoupons(req, res) {
    try {
      console.log("🎫 [CouponController] GET active coupons");

      const coupons = await couponService.getActiveCoupons();

      res.status(200).json({
        success: true,
        data: {
          coupons,
          count: coupons.length,
        },
      });
    } catch (error) {
      console.error(
        "❌ [CouponController] Error getting coupons:",
        error.message
      );
      res.status(500).json({
        success: false,
        message: "Failed to retrieve coupons",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  },

  /**
   * POST /api/coupons/validate - Validate coupon code
   * Body: { coupon_code, cart_total }
   */
  async validateCoupon(req, res) {
    try {
      const userId = req.user.userId;
      const { coupon_code, cart_total } = req.body;

      console.log(
        `🎫 [CouponController] POST validate coupon - User: ${userId}, Code: ${coupon_code}`
      );

      // Validation
      if (!coupon_code) {
        return res.status(400).json({
          success: false,
          message: "Coupon code is required",
        });
      }

      // If cart_total not provided, calculate from user's cart
      let cartTotal = cart_total;
      if (!cartTotal) {
        const cartItems = await cartService.getCartByUserId(userId);
        cartTotal = cartItems.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
      }

      if (cartTotal <= 0) {
        return res.status(400).json({
          success: false,
          message: "Cart is empty",
        });
      }

      const result = await couponService.validateCoupon(
        coupon_code,
        userId,
        cartTotal
      );

      res.status(200).json({
        success: true,
        message: "Coupon is valid",
        data: result,
      });
    } catch (error) {
      console.error(
        "❌ [CouponController] Coupon validation error:",
        error.message
      );

      // Return specific validation errors
      if (
        error.message.includes("not found") ||
        error.message.includes("not active") ||
        error.message.includes("expired") ||
        error.message.includes("not yet valid") ||
        error.message.includes("Minimum purchase") ||
        error.message.includes("limit")
      ) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: "Failed to validate coupon",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  },

  /**
   * GET /api/coupons/history - Get user's coupon usage history
   */
  async getCouponHistory(req, res) {
    try {
      const userId = req.user.userId;

      console.log(`📜 [CouponController] GET coupon history - User: ${userId}`);

      const history = await couponService.getUserCouponHistory(userId);

      res.status(200).json({
        success: true,
        data: {
          history,
          count: history.length,
        },
      });
    } catch (error) {
      console.error(
        "❌ [CouponController] Error getting coupon history:",
        error.message
      );
      res.status(500).json({
        success: false,
        message: "Failed to retrieve coupon history",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  },

  /**
   * POST /api/coupons/record-usage - Record coupon usage after successful order
   * Body: { coupon_code, order_id, discount_amount }
   */
  async recordUsage(req, res) {
    try {
      const userId = req.user.userId;
      const { coupon_code, order_id, discount_amount } = req.body;

      console.log(
        `📝 [CouponController] POST record usage - User: ${userId}, Code: ${coupon_code}, Order: ${order_id}, Discount: ${discount_amount}`
      );

      if (!coupon_code || !order_id || discount_amount == null) {
        return res.status(400).json({
          success: false,
          message: "coupon_code, order_id, and discount_amount are required",
        });
      }

      const coupon = await couponService.getCouponByCode(coupon_code);
      if (!coupon) {
        return res
          .status(404)
          .json({ success: false, message: "Coupon not found" });
      }

      const usage = await couponService.recordCouponUsage(
        coupon.coupon_id,
        userId,
        order_id,
        Math.round(Number(discount_amount))
      );

      res.status(201).json({ success: true, data: usage });
    } catch (error) {
      console.error(
        "❌ [CouponController] Error recording usage:",
        error.message
      );
      res
        .status(500)
        .json({ success: false, message: "Failed to record coupon usage" });
    }
  },
};

module.exports = couponController;

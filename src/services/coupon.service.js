import api from "./api";

const CouponService = {
  async recordUsage({ couponCode, orderId, discountAmount }) {
    return api.post("/coupons/record-usage", {
      coupon_code: couponCode,
      order_id: orderId,
      discount_amount: discountAmount,
    });
  },

  /**
   * Get all active coupons (Admin feature for sending to users)
   */
  async getActiveCoupons() {
    return api.get("/coupons");
  },
};

export default CouponService;

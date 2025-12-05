import api from "./api";

const CouponService = {
  async recordUsage({ couponCode, orderId, discountAmount }) {
    return api.post("/coupons/record-usage", {
      coupon_code: couponCode,
      order_id: orderId,
      discount_amount: discountAmount,
    });
  },
};

export default CouponService;

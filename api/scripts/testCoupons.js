require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const couponService = require('../services/couponService');

(async () => {
  try {
    console.log('=== Test getActiveCoupons ===');
    const coupons = await couponService.getActiveCoupons();
    console.log('Active coupons:', coupons);
  } catch (e) {
    console.error('getActiveCoupons error:', e.stack || e.message);
  }

  try {
    console.log('\n=== Test validateCoupon (SEHAT10) ===');
    const res = await couponService.validateCoupon('SEHAT10', 2, 100000);
    console.log('validateCoupon result:', res);
  } catch (e) {
    console.error('validateCoupon error:', e.stack || e.message);
  }
})();

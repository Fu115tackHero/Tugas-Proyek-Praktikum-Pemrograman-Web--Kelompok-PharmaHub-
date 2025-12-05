// Coupon Routes
const express = require("express");
const router = express.Router();
const couponController = require("../controllers/couponController");
const authMiddleware = require("../middleware/authMiddleware");

// All coupon routes require authentication
router.use(authMiddleware);

router.get("/", couponController.getActiveCoupons); // GET /api/coupons - Get active coupons
router.post("/validate", couponController.validateCoupon); // POST /api/coupons/validate - Validate coupon
router.get("/history", couponController.getCouponHistory); // GET /api/coupons/history - Get usage history
router.post("/record-usage", couponController.recordUsage); // POST /api/coupons/record-usage - Record usage

module.exports = router;

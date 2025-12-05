// Admin Coupon Routes - Routes for admin coupon management
const express = require("express");
const router = express.Router();
const couponController = require("../controllers/couponController");
const authMiddleware = require("../middleware/authMiddleware");
const requireAdmin = require("../middleware/requireAdmin");

// All routes require authentication and admin role
router.use(authMiddleware);
router.use(requireAdmin);

/**
 * POST /api/admin/coupons - Create new coupon
 */
router.post("/", couponController.createCoupon);

/**
 * PUT /api/admin/coupons/:id - Update coupon
 */
router.put("/:id", couponController.updateCoupon);

/**
 * DELETE /api/admin/coupons/:id - Delete coupon
 */
router.delete("/:id", couponController.deleteCoupon);

/**
 * PATCH /api/admin/coupons/:id/toggle - Toggle coupon active status
 */
router.patch("/:id/toggle", couponController.toggleCouponStatus);

module.exports = router;

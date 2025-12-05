const express = require("express");
const router = express.Router();

// Import route modules
const authRoutes = require("./authRoutes");
const paymentRoutes = require("./paymentRoutes");
const productRoutes = require("./productRoutes");
const categoryRoutes = require("./categoryRoutes");
const cartRoutes = require("./cartRoutes");
const couponRoutes = require("./couponRoutes");
const orderRoutes = require("./orderRoutes");
const notificationRoutes = require("./notificationRoutes");
const salesReportRoutes = require("./salesReportRoutes");
const autoSalesReportRoutes = require("./autoSalesReportRoutes");
const adminDashboardRoutes = require("./adminDashboardRoutes");
const activityRoutes = require("./activityRoutes");
const adminCouponRoutes = require("./adminCouponRoutes");

/**
 * Health check endpoint
 */
router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "PharmaHub API is running",
    timestamp: new Date().toISOString(),
  });
});

/**
 * Mount route modules
 */
router.use("/auth", authRoutes);
router.use(paymentRoutes);
router.use(productRoutes);
router.use(categoryRoutes);
router.use("/cart", cartRoutes);
router.use("/coupons", couponRoutes);
router.use("/orders", orderRoutes);
router.use("/notifications", notificationRoutes);
router.use("/sales-reports", salesReportRoutes);
router.use("/auto-sales-reports", autoSalesReportRoutes);
router.use("/admin/dashboard", adminDashboardRoutes);
router.use("/admin/activities", activityRoutes);
router.use("/admin/coupons", adminCouponRoutes);

module.exports = router;

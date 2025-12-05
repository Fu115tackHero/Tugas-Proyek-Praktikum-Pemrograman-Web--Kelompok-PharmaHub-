const express = require("express");
const router = express.Router();
const adminDashboardController = require("../controllers/adminDashboardController");

/**
 * ============================================
 * ADMIN DASHBOARD ROUTES
 * ============================================
 * Routes for admin dashboard data
 */

// Get dashboard statistics
router.get("/stats", adminDashboardController.getDashboardStats);

// Get top selling products
router.get("/top-products", adminDashboardController.getTopProducts);

// Get recent activity
router.get("/recent-activity", adminDashboardController.getRecentActivity);

// Get low stock alerts
router.get("/low-stock", adminDashboardController.getLowStockAlerts);

module.exports = router;

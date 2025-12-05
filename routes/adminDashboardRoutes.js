const express = require("express");
const router = express.Router();
const adminDashboardController = require("../controllers/adminDashboardController");
const authMiddleware = require("../middleware/authMiddleware");
const requireAdmin = require("../middleware/requireAdmin");

/**
 * ============================================
 * ADMIN DASHBOARD ROUTES
 * ============================================
 * Routes for admin dashboard data
 * All routes require admin authentication
 */

// Apply authentication middleware first, then admin check
router.use(authMiddleware);
router.use(requireAdmin);

// Get dashboard statistics
router.get("/stats", adminDashboardController.getDashboardStats);

// Get top selling products
router.get("/top-products", adminDashboardController.getTopProducts);

// Get recent activity
router.get("/recent-activity", adminDashboardController.getRecentActivity);

// Get low stock alerts
router.get("/low-stock", adminDashboardController.getLowStockAlerts);

// User Management Routes
// Get all users (customers)
router.get("/users", adminDashboardController.getUsers);

// Toggle user active status (Suspend/Activate)
router.patch("/users/:id/status", adminDashboardController.updateUserStatus);

module.exports = router;

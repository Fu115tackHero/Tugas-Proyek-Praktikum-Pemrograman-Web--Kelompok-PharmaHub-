const adminDashboardService = require("../services/adminDashboardService");

/**
 * ============================================
 * ADMIN DASHBOARD CONTROLLER
 * ============================================
 * Handles admin dashboard data requests
 */

/**
 * GET /api/admin/dashboard/stats
 * Get dashboard statistics from VIEW
 */
async function getDashboardStats(req, res) {
  console.log("📊 [AdminDashboardController] GET dashboard stats");

  try {
    const stats = await adminDashboardService.getDashboardStats();

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("❌ [AdminDashboardController] Error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

/**
 * GET /api/admin/dashboard/top-products
 * Get top selling products
 */
async function getTopProducts(req, res) {
  console.log("📊 [AdminDashboardController] GET top products");
  console.log("   Query params:", JSON.stringify(req.query, null, 2));

  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const products = await adminDashboardService.getTopSellingProducts(limit);

    res.status(200).json({
      success: true,
      data: products,
      count: products.length,
    });
  } catch (error) {
    console.error("❌ [AdminDashboardController] Error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

/**
 * GET /api/admin/dashboard/recent-activity
 * Get recent system activity
 */
async function getRecentActivity(req, res) {
  console.log("📊 [AdminDashboardController] GET recent activity");
  console.log("   Query params:", JSON.stringify(req.query, null, 2));

  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const activities = await adminDashboardService.getRecentActivity(limit);

    res.status(200).json({
      success: true,
      data: activities,
      count: activities.length,
    });
  } catch (error) {
    console.error("❌ [AdminDashboardController] Error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

/**
 * GET /api/admin/dashboard/low-stock
 * Get low stock alerts
 */
async function getLowStockAlerts(req, res) {
  console.log("📊 [AdminDashboardController] GET low stock alerts");

  try {
    const alerts = await adminDashboardService.getLowStockAlerts();

    res.status(200).json({
      success: true,
      data: alerts,
      count: alerts.length,
    });
  } catch (error) {
    console.error("❌ [AdminDashboardController] Error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

module.exports = {
  getDashboardStats,
  getTopProducts,
  getRecentActivity,
  getLowStockAlerts,
};

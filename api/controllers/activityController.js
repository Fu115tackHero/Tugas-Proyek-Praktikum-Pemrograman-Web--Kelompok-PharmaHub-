/**
 * Activity Controller
 * Handles HTTP requests for admin activity logs
 */

const activityService = require("../services/activityService");

/**
 * Get admin activities with pagination and filters
 * GET /api/admin/activities
 */
async function getActivities(req, res) {
  try {
    const {
      page = 1,
      limit = 50,
      adminId,
      entityType,
      actionType,
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const activities = await activityService.getActivities({
      limit: parseInt(limit),
      offset,
      adminId: adminId ? parseInt(adminId) : undefined,
      entityType,
      actionType,
    });

    const totalCount = await activityService.getActivityCount({
      adminId: adminId ? parseInt(adminId) : undefined,
      entityType,
      actionType,
    });

    res.status(200).json({
      success: true,
      data: activities,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        totalPages: Math.ceil(totalCount / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("❌ Error fetching activities:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch activities",
    });
  }
}

/**
 * Get activity statistics
 * GET /api/admin/activities/stats
 */
async function getActivityStats(req, res) {
  try {
    const { adminId, days = 30 } = req.query;

    const stats = await activityService.getActivityStats({
      adminId: adminId ? parseInt(adminId) : undefined,
      days: parseInt(days),
    });

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("❌ Error fetching activity stats:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch activity statistics",
    });
  }
}

module.exports = {
  getActivities,
  getActivityStats,
};

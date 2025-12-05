/**
 * Activity Routes
 * API endpoints for admin activity logs
 */

const express = require("express");
const router = express.Router();
const activityController = require("../controllers/activityController");
// Temporarily disable auth for activity viewing in dev
// const authMiddleware = require("../middleware/authMiddleware");
// const requireAdmin = require("../middleware/requireAdmin");

/**
 * GET /api/admin/activities
 * Get admin activities with pagination and filters
 * Query params: page, limit, adminId, entityType, actionType
 */
// Public (dev): make activities visible without auth to unblock UI
router.get("/", activityController.getActivities);

/**
 * GET /api/admin/activities/stats
 * Get activity statistics
 * Query params: adminId, days
 */
// Public (dev): stats without auth
router.get("/stats", activityController.getActivityStats);

module.exports = router;

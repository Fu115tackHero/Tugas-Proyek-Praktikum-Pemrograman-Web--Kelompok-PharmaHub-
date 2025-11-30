const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const authMiddleware = require("../middleware/authMiddleware");

// All notification routes require authentication
router.use(authMiddleware);

// GET /api/notifications/unread-count - Get unread count (must come before /:id)
router.get("/unread-count", notificationController.getUnreadCount);

// PUT /api/notifications/mark-all-read - Mark all as read (must come before /:id)
router.put("/mark-all-read", notificationController.markAllAsRead);

// GET /api/notifications - Get all notifications for current user
router.get("/", notificationController.getNotifications);

// PUT /api/notifications/:id/read - Mark specific notification as read
router.put("/:id/read", notificationController.markAsRead);

// DELETE /api/notifications/:id - Delete a notification
router.delete("/:id", notificationController.deleteNotification);

module.exports = router;

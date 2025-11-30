const notificationService = require("../services/notificationService");

/**
 * GET /api/notifications - Get all notifications for current user
 */
async function getNotifications(req, res) {
  try {
    const userId = req.user.userId;

    console.log(
      "[NotificationController] Fetching notifications for user:",
      userId
    );

    const notifications = await notificationService.getNotificationsByUserId(
      userId
    );

    res.status(200).json({
      success: true,
      notifications,
      count: notifications.length,
    });
  } catch (error) {
    console.error(
      "[NotificationController] Error fetching notifications:",
      error.message
    );
    res.status(500).json({
      success: false,
      message: "Gagal mengambil notifikasi",
      error: error.message,
    });
  }
}

/**
 * GET /api/notifications/unread-count - Get unread notification count
 */
async function getUnreadCount(req, res) {
  try {
    const userId = req.user.userId;

    console.log(
      "[NotificationController] Getting unread count for user:",
      userId
    );

    const count = await notificationService.getUnreadCount(userId);

    res.status(200).json({
      success: true,
      unreadCount: count,
    });
  } catch (error) {
    console.error(
      "[NotificationController] Error getting unread count:",
      error.message
    );
    res.status(500).json({
      success: false,
      message: "Gagal mengambil jumlah notifikasi belum dibaca",
      error: error.message,
    });
  }
}

/**
 * PUT /api/notifications/:id/read - Mark notification as read
 */
async function markAsRead(req, res) {
  try {
    const userId = req.user.userId;
    const notificationId = parseInt(req.params.id);

    console.log(
      `[NotificationController] Marking notification ${notificationId} as read for user ${userId}`
    );

    if (isNaN(notificationId)) {
      return res.status(400).json({
        success: false,
        message: "ID notifikasi tidak valid",
      });
    }

    const result = await notificationService.markAsRead(userId, notificationId);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Notifikasi tidak ditemukan",
      });
    }

    res.status(200).json({
      success: true,
      notification: result,
    });
  } catch (error) {
    console.error(
      "[NotificationController] Error marking notification as read:",
      error.message
    );
    res.status(500).json({
      success: false,
      message: "Gagal menandai notifikasi sebagai sudah dibaca",
      error: error.message,
    });
  }
}

/**
 * PUT /api/notifications/mark-all-read - Mark all notifications as read
 */
async function markAllAsRead(req, res) {
  try {
    const userId = req.user.userId;

    console.log(
      "[NotificationController] Marking all notifications as read for user:",
      userId
    );

    const count = await notificationService.markAllAsRead(userId);

    res.status(200).json({
      success: true,
      message: `${count} notifikasi ditandai sebagai sudah dibaca`,
      markedCount: count,
    });
  } catch (error) {
    console.error(
      "[NotificationController] Error marking all as read:",
      error.message
    );
    res.status(500).json({
      success: false,
      message: "Gagal menandai semua notifikasi sebagai sudah dibaca",
      error: error.message,
    });
  }
}

/**
 * DELETE /api/notifications/:id - Delete a notification
 */
async function deleteNotification(req, res) {
  try {
    const userId = req.user.userId;
    const notificationId = parseInt(req.params.id);

    console.log(
      `[NotificationController] Deleting notification ${notificationId} for user ${userId}`
    );

    if (isNaN(notificationId)) {
      return res.status(400).json({
        success: false,
        message: "ID notifikasi tidak valid",
      });
    }

    const result = await notificationService.deleteNotification(
      userId,
      notificationId
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Notifikasi tidak ditemukan",
      });
    }

    res.status(200).json({
      success: true,
      message: "Notifikasi berhasil dihapus",
    });
  } catch (error) {
    console.error(
      "[NotificationController] Error deleting notification:",
      error.message
    );
    res.status(500).json({
      success: false,
      message: "Gagal menghapus notifikasi",
      error: error.message,
    });
  }
}

/**
 * PUT /api/notifications/:id/archive
 * Archive notification (soft delete)
 */
async function archiveNotification(req, res) {
  console.log("🗄️ [NotificationController] Archive notification");
  console.log("   Notification ID:", req.params.id);
  console.log("   User ID:", req.user.userId);

  try {
    const notificationId = parseInt(req.params.id);
    const userId = req.user.userId;

    const notification = await notificationService.archiveNotification(
      userId,
      notificationId
    );

    res.status(200).json({
      success: true,
      message: "Notification archived successfully",
      data: notification,
    });
  } catch (error) {
    console.error("❌ [NotificationController] Error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

/**
 * POST /api/notifications/archive-all
 * Archive all notifications for user
 */
async function archiveAllNotifications(req, res) {
  console.log("🗄️ [NotificationController] Archive all notifications");
  console.log("   User ID:", req.user.userId);

  try {
    const userId = req.user.userId;

    const result = await notificationService.archiveAllNotifications(userId);

    res.status(200).json({
      success: true,
      message: `${result.archived_count} notifications archived successfully`,
      data: result,
    });
  } catch (error) {
    console.error("❌ [NotificationController] Error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

/**
 * POST /api/notifications/archive-read
 * Archive all read notifications for user
 */
async function archiveReadNotifications(req, res) {
  console.log("🗄️ [NotificationController] Archive read notifications");
  console.log("   User ID:", req.user.userId);

  try {
    const userId = req.user.userId;

    const result = await notificationService.archiveReadNotifications(userId);

    res.status(200).json({
      success: true,
      message: `${result.archived_count} read notifications archived successfully`,
      data: result,
    });
  } catch (error) {
    console.error("❌ [NotificationController] Error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  archiveNotification,
  archiveAllNotifications,
  archiveReadNotifications,
};

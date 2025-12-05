const pool = require("../config/database");

/**
 * Get all notifications for a specific user
 */
async function getNotificationsByUserId(userId) {
  try {
    console.log(
      "[NotificationService] Fetching notifications for user:",
      userId
    );

    const query = `
      SELECT 
        n.notification_id,
        n.user_id,
        n.type,
        n.title,
        n.message,
        n.related_order_id,
        n.related_product_id,
        n.related_coupon_id,
        n.order_status,
        n.customer_name,
        n.icon_type,
        n.is_read,
        n.read_at,
        n.action_url,
        n.admin_notes,
        n.created_at,
        n.expires_at,
        n.is_archived,
        o.order_number
      FROM notifications n
      LEFT JOIN orders o ON n.related_order_id = o.order_id
      WHERE n.user_id = $1
        AND n.is_archived = FALSE
        AND (n.expires_at IS NULL OR n.expires_at > NOW())
      ORDER BY n.created_at DESC
    `;

    const result = await pool.query(query, [userId]);

    console.log(
      `[NotificationService] Found ${result.rows.length} notifications for user:`,
      userId
    );

    return result.rows;
  } catch (error) {
    console.error(
      "[NotificationService] Error fetching notifications:",
      error.message
    );
    throw error;
  }
}

/**
 * Get unread notification count for a user
 */
async function getUnreadCount(userId) {
  try {
    console.log("[NotificationService] Getting unread count for user:", userId);

    const query = `
      SELECT COUNT(*) as unread_count
      FROM notifications
      WHERE user_id = $1 
        AND is_read = false
        AND is_archived = FALSE
        AND (expires_at IS NULL OR expires_at > NOW())
    `;

    const result = await pool.query(query, [userId]);

    const count = parseInt(result.rows[0].unread_count);

    console.log("[NotificationService] Unread count:", count);

    return count;
  } catch (error) {
    console.error(
      "[NotificationService] Error getting unread count:",
      error.message
    );
    throw error;
  }
}

/**
 * Mark a specific notification as read
 */
async function markAsRead(userId, notificationId) {
  try {
    console.log(
      `[NotificationService] Marking notification ${notificationId} as read for user ${userId}`
    );

    const query = `
      UPDATE notifications
      SET 
        is_read = true,
        read_at = NOW()
      WHERE notification_id = $1 AND user_id = $2
      RETURNING notification_id, is_read, read_at
    `;

    const result = await pool.query(query, [notificationId, userId]);

    if (result.rows.length === 0) {
      return null;
    }

    console.log(
      "[NotificationService] Notification marked as read:",
      result.rows[0]
    );

    return result.rows[0];
  } catch (error) {
    console.error(
      "[NotificationService] Error marking notification as read:",
      error.message
    );
    throw error;
  }
}

/**
 * Mark all notifications as read for a user
 */
async function markAllAsRead(userId) {
  try {
    console.log(
      "[NotificationService] Marking all notifications as read for user:",
      userId
    );

    const query = `
      UPDATE notifications
      SET 
        is_read = true,
        read_at = NOW()
      WHERE user_id = $1 AND is_read = false
      RETURNING notification_id
    `;

    const result = await pool.query(query, [userId]);

    console.log(
      `[NotificationService] Marked ${result.rows.length} notifications as read`
    );

    return result.rows.length;
  } catch (error) {
    console.error(
      "[NotificationService] Error marking all notifications as read:",
      error.message
    );
    throw error;
  }
}

/**
 * Create a new notification
 * This is used internally by other services (e.g., order service)
 */
async function createNotification(notificationData) {
  try {
    console.log("[NotificationService] Creating notification");

    const {
      userId,
      type,
      title,
      message,
      relatedOrderId = null,
      relatedProductId = null,
      relatedCouponId = null,
      orderStatus = null,
      customerName = null,
      iconType = "bell",
      actionUrl = null,
      expiresAt = null,
    } = notificationData;

    const query = `
      INSERT INTO notifications (
        user_id,
        type,
        title,
        message,
        related_order_id,
        related_product_id,
        related_coupon_id,
        order_status,
        customer_name,
        icon_type,
        action_url,
        expires_at,
        is_read,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, false, NOW())
      RETURNING notification_id, created_at
    `;

    const values = [
      userId,
      type,
      title,
      message,
      relatedOrderId,
      relatedProductId,
      relatedCouponId,
      orderStatus,
      customerName,
      iconType,
      actionUrl,
      expiresAt,
    ];

    const result = await pool.query(query, values);

    console.log("[NotificationService] Notification created:", result.rows[0]);

    return result.rows[0];
  } catch (error) {
    console.error(
      "[NotificationService] Error creating notification:",
      error.message
    );
    throw error;
  }
}

/**
 * Delete a notification
 */
async function deleteNotification(userId, notificationId) {
  try {
    console.log(
      `[NotificationService] Deleting notification ${notificationId} for user ${userId}`
    );

    const query = `
      DELETE FROM notifications
      WHERE notification_id = $1 AND user_id = $2
      RETURNING notification_id
    `;

    const result = await pool.query(query, [notificationId, userId]);

    if (result.rows.length === 0) {
      return null;
    }

    console.log("[NotificationService] Notification deleted:", result.rows[0]);

    return result.rows[0];
  } catch (error) {
    console.error(
      "[NotificationService] Error deleting notification:",
      error.message
    );
    throw error;
  }
}

/**
 * Archive notification (soft delete for user)
 * @param {number} userId - User ID
 * @param {number} notificationId - Notification ID to archive
 * @returns {object} - Updated notification
 */
async function archiveNotification(userId, notificationId) {
  try {
    console.log(
      "[NotificationService] Archiving notification:",
      notificationId
    );

    const query = `
      UPDATE notifications
      SET is_archived = TRUE
      WHERE notification_id = $1 AND user_id = $2
      RETURNING *
    `;

    const result = await pool.query(query, [notificationId, userId]);

    if (result.rows.length === 0) {
      throw new Error("Notification not found or you don't have permission");
    }

    console.log("[NotificationService] Notification archived:", notificationId);
    return result.rows[0];
  } catch (error) {
    console.error(
      "[NotificationService] Error archiving notification:",
      error.message
    );
    throw error;
  }
}

/**
 * Archive all notifications for a user (bulk soft delete)
 * @param {number} userId - User ID
 * @returns {object} - Archive result
 */
async function archiveAllNotifications(userId) {
  try {
    console.log(
      "[NotificationService] Archiving all notifications for user:",
      userId
    );

    const query = `
      UPDATE notifications
      SET is_archived = TRUE
      WHERE user_id = $1 AND is_archived = FALSE
      RETURNING notification_id
    `;

    const result = await pool.query(query, [userId]);

    console.log(
      `[NotificationService] Archived ${result.rows.length} notifications`
    );
    return {
      archived_count: result.rows.length,
      archived_notification_ids: result.rows.map((r) => r.notification_id),
    };
  } catch (error) {
    console.error(
      "[NotificationService] Error archiving all notifications:",
      error.message
    );
    throw error;
  }
}

/**
 * Archive read notifications for a user
 * @param {number} userId - User ID
 * @returns {object} - Archive result
 */
async function archiveReadNotifications(userId) {
  try {
    console.log(
      "[NotificationService] Archiving read notifications for user:",
      userId
    );

    const query = `
      UPDATE notifications
      SET is_archived = TRUE
      WHERE user_id = $1 
        AND is_read = TRUE 
        AND is_archived = FALSE
      RETURNING notification_id
    `;

    const result = await pool.query(query, [userId]);

    console.log(
      `[NotificationService] Archived ${result.rows.length} read notifications`
    );
    return {
      archived_count: result.rows.length,
      archived_notification_ids: result.rows.map((r) => r.notification_id),
    };
  } catch (error) {
    console.error(
      "[NotificationService] Error archiving read notifications:",
      error.message
    );
    throw error;
  }
}

/**
 * Send notification to a specific user (Admin feature)
 * This allows admin to manually send notifications to users
 */
async function sendNotificationToUser(notificationData) {
  try {
    console.log("[NotificationService] Admin sending notification to user");

    const {
      userId,
      type,
      title,
      message,
      relatedCouponId = null,
    } = notificationData;

    // Validate input
    if (!userId || !type || !title || !message) {
      throw new Error("Missing required fields for notification");
    }

    const query = `
      INSERT INTO notifications (
        user_id,
        type,
        title,
        message,
        related_coupon_id,
        icon_type,
        is_read,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, false, NOW())
      RETURNING notification_id, user_id, type, title, message, related_coupon_id, created_at
    `;

    const iconType = type === "promotion" ? "gift" : "bell";
    const values = [userId, type, title, message, relatedCouponId, iconType];

    const result = await pool.query(query, values);

    console.log(
      "[NotificationService] Notification sent to user:",
      result.rows[0]
    );

    return result.rows[0];
  } catch (error) {
    console.error(
      "[NotificationService] Error sending notification to user:",
      error.message
    );
    throw error;
  }
}

/**
 * Broadcast notification to all active users
 */
async function broadcastNotification({ type, title, message, relatedCouponId = null }) {
  try {
    console.log("[NotificationService] Broadcasting notification to all users");

    // Get all active users
    const usersQuery = `
      SELECT user_id 
      FROM users 
      WHERE role = 'customer' 
        AND is_active = TRUE
    `;
    
    const usersResult = await pool.query(usersQuery);
    const userIds = usersResult.rows.map(row => row.user_id);

    if (userIds.length === 0) {
      return { count: 0, notifications: [] };
    }

    console.log(`[NotificationService] Broadcasting to ${userIds.length} users`);

    // Insert notifications for all users
    const insertQuery = `
      INSERT INTO notifications (
        user_id, 
        type, 
        title, 
        message,
        related_coupon_id,
        is_read
      )
      SELECT 
        unnest($1::integer[]),
        $2,
        $3,
        $4,
        $5,
        FALSE
      RETURNING *
    `;

    const values = [
      userIds,
      type,
      title,
      message,
      relatedCouponId,
    ];

    const result = await pool.query(insertQuery, values);

    console.log(`✅ [NotificationService] Broadcast sent to ${result.rows.length} users`);

    return {
      count: result.rows.length,
      notifications: result.rows,
    };
  } catch (error) {
    console.error(
      "[NotificationService] Error broadcasting notification:",
      error.message
    );
    throw error;
  }
}

module.exports = {
  getNotificationsByUserId,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  createNotification,
  deleteNotification,
  archiveNotification,
  archiveAllNotifications,
  archiveReadNotifications,
  sendNotificationToUser,
  broadcastNotification,
};

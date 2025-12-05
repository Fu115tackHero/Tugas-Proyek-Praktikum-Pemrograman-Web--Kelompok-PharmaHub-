import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

/**
 * Notification Service
 * Handles all notification-related API calls
 */

/**
 * Get all notifications for current user
 * @param {string} token - JWT authentication token
 * @returns {Promise<Array>} - Array of notifications
 */
export async function getNotifications(token) {
  try {
    const response = await axios.get(`${API_URL}/notifications`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error("[NotificationService] Error fetching notifications:", error);
    throw error.response?.data || error.message;
  }
}

/**
 * Get unread notification count
 * @param {string} token - JWT authentication token
 * @returns {Promise<number>} - Count of unread notifications
 */
export async function getUnreadCount(token) {
  try {
    const response = await axios.get(`${API_URL}/notifications/unread-count`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.unreadCount;
  } catch (error) {
    console.error("[NotificationService] Error fetching unread count:", error);
    throw error.response?.data || error.message;
  }
}

/**
 * Mark a notification as read
 * @param {number} notificationId - Notification ID
 * @param {string} token - JWT authentication token
 * @returns {Promise<Object>} - Updated notification
 */
export async function markAsRead(notificationId, token) {
  try {
    const response = await axios.put(
      `${API_URL}/notifications/${notificationId}/read`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      `[NotificationService] Error marking notification ${notificationId} as read:`,
      error
    );
    throw error.response?.data || error.message;
  }
}

/**
 * Mark all notifications as read
 * @param {string} token - JWT authentication token
 * @returns {Promise<Object>} - Response with count of marked notifications
 */
export async function markAllAsRead(token) {
  try {
    const response = await axios.put(
      `${API_URL}/notifications/mark-all-read`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("[NotificationService] Error marking all as read:", error);
    throw error.response?.data || error.message;
  }
}

/**
 * Delete a notification
 * @param {number} notificationId - Notification ID
 * @param {string} token - JWT authentication token
 * @returns {Promise<Object>} - Success response
 */
export async function deleteNotification(notificationId, token) {
  try {
    const response = await axios.delete(
      `${API_URL}/notifications/${notificationId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      `[NotificationService] Error deleting notification ${notificationId}:`,
      error
    );
    throw error.response?.data || error.message;
  }
}

/**
 * Archive a single notification (soft delete)
 * @param {number} notificationId - Notification ID
 * @param {string} token - JWT authentication token
 * @returns {Promise<Object>} - Success response
 */
export async function archiveNotification(notificationId, token) {
  try {
    const response = await axios.put(
      `${API_URL}/notifications/${notificationId}/archive`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      `[NotificationService] Error archiving notification ${notificationId}:`,
      error
    );
    throw error.response?.data || error.message;
  }
}

/**
 * Archive all notifications for current user
 * @param {string} token - JWT authentication token
 * @returns {Promise<Object>} - Response with count of archived notifications
 */
export async function archiveAllNotifications(token) {
  try {
    const response = await axios.post(
      `${API_URL}/notifications/archive-all`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "[NotificationService] Error archiving all notifications:",
      error
    );
    throw error.response?.data || error.message;
  }
}

/**
 * Archive only read notifications for current user
 * @param {string} token - JWT authentication token
 * @returns {Promise<Object>} - Response with count of archived notifications
 */
export async function archiveReadNotifications(token) {
  try {
    const response = await axios.post(
      `${API_URL}/notifications/archive-read`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "[NotificationService] Error archiving read notifications:",
      error
    );
    throw error.response?.data || error.message;
  }
}

/**
 * Send notification to a specific user (Admin only)
 * @param {Object} notificationData - Notification data
 * @param {number} notificationData.userId - Target user ID
 * @param {string} notificationData.type - Notification type (promotion/system)
 * @param {string} notificationData.title - Notification title
 * @param {string} notificationData.message - Notification message
 * @param {number} [notificationData.relatedCouponId] - Optional coupon ID
 * @param {string} token - JWT authentication token
 * @returns {Promise<Object>} - Created notification
 */
export async function sendNotification(notificationData, token) {
  try {
    const response = await axios.post(
      `${API_URL}/notifications/send`,
      notificationData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("[NotificationService] Error sending notification:", error);
    throw error.response?.data || error.message;
  }
}

const NotificationService = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  archiveNotification,
  archiveAllNotifications,
  archiveReadNotifications,
  sendNotification,
};

export default NotificationService;

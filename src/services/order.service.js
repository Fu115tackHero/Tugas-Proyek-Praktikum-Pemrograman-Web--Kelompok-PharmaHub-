import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

/**
 * Order Service
 * Handles all order-related API calls
 */

/**
 * Create a new order
 * @param {Object} orderData - Order data including items, customer info, payment details
 * @param {string} token - JWT authentication token
 * @returns {Promise<Object>} - Response with order details
 */
export async function createOrder(orderData, token) {
  try {
    const response = await axios.post(`${API_URL}/orders`, orderData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error) {
    console.error("[OrderService] Error creating order:", error);
    throw error.response?.data || error.message;
  }
}

/**
 * Get all orders for current user
 * @param {string} token - JWT authentication token
 * @returns {Promise<Array>} - Array of user's orders
 */
export async function getOrders(token) {
  try {
    const response = await axios.get(`${API_URL}/orders`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error("[OrderService] Error fetching orders:", error);
    throw error.response?.data || error.message;
  }
}

/**
 * Get all orders (admin only)
 * @param {string} token - JWT authentication token
 * @returns {Promise<Array>} - Array of all orders
 */
export async function getAllOrders(token) {
  try {
    const response = await axios.get(`${API_URL}/orders/admin/all`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error("[OrderService] Error fetching all orders:", error);
    throw error.response?.data || error.message;
  }
}

/**
 * Get specific order by ID
 * @param {number} orderId - Order ID
 * @param {string} token - JWT authentication token
 * @returns {Promise<Object>} - Order details with items
 */
export async function getOrderById(orderId, token) {
  try {
    const response = await axios.get(`${API_URL}/orders/${orderId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error(`[OrderService] Error fetching order ${orderId}:`, error);
    throw error.response?.data || error.message;
  }
}

/**
 * Update order status (admin only)
 * @param {number} orderId - Order ID
 * @param {string} status - New status (pending, confirmed, preparing, ready, completed, cancelled, delivered)
 * @param {string} token - JWT authentication token
 * @returns {Promise<Object>} - Updated order
 */
export async function updateOrderStatus(orderId, status, token) {
  try {
    const response = await axios.put(
      `${API_URL}/orders/${orderId}/status`,
      { status },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      `[OrderService] Error updating order ${orderId} status:`,
      error
    );
    throw error.response?.data || error.message;
  }
}

/**
 * Cancel an order
 * @param {number} orderId - Order ID
 * @param {string} cancellationReason - Reason for cancellation
 * @param {string} token - JWT authentication token
 * @returns {Promise<Object>} - Cancelled order
 */
export async function cancelOrder(orderId, cancellationReason, token) {
  try {
    const response = await axios.post(
      `${API_URL}/orders/${orderId}/cancel`,
      { cancellationReason },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(`[OrderService] Error cancelling order ${orderId}:`, error);
    throw error.response?.data || error.message;
  }
}

/**
 * Archive an order (soft delete for ADMIN only)
 * This hides order from admin OrderManagement panel
 * @param {number} orderId - Order ID
 * @param {string} token - JWT authentication token
 * @returns {Promise<Object>} - Archived order
 */
export async function archiveOrder(orderId, token) {
  try {
    const response = await axios.put(
      `${API_URL}/orders/${orderId}/archive`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(`[OrderService] Error archiving order ${orderId}:`, error);
    throw error.response?.data || error.message;
  }
}

/**
 * Hide order from user's history view (USER-SIDE deletion)
 * This marks order as hidden in order_status_history
 * Does NOT affect admin's OrderManagement view
 * @param {number} orderId - Order ID
 * @param {string} token - JWT authentication token
 * @returns {Promise<Object>} - Result status
 */
export async function hideOrderFromUser(orderId, token) {
  try {
    const response = await axios.put(
      `${API_URL}/orders/${orderId}/hide-from-user`,
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
      `[OrderService] Error hiding order from user ${orderId}:`,
      error
    );
    throw error.response?.data || error.message;
  }
}

/**
 * Restore order to user's history view
 * @param {number} orderId - Order ID
 * @param {string} token - JWT authentication token
 * @returns {Promise<Object>} - Result status
 */
export async function restoreOrderToUser(orderId, token) {
  try {
    const response = await axios.put(
      `${API_URL}/orders/${orderId}/restore-to-user`,
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
      `[OrderService] Error restoring order to user ${orderId}:`,
      error
    );
    throw error.response?.data || error.message;
  }
}

/**
 * Unarchive an order (restore from archive)
 * @param {number} orderId - Order ID
 * @param {string} token - JWT authentication token
 * @returns {Promise<Object>} - Unarchived order
 */
export async function unarchiveOrder(orderId, token) {
  try {
    const response = await axios.put(
      `${API_URL}/orders/${orderId}/unarchive`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(`[OrderService] Error unarchiving order ${orderId}:`, error);
    throw error.response?.data || error.message;
  }
}

/**
 * Get order details for admin (includes items)
 * @param {number} orderId - Order ID
 * @param {string} token - JWT authentication token
 * @returns {Promise<Object>} - Order details with items
 */
export async function getOrderDetails(orderId, token) {
  try {
    const response = await axios.get(`${API_URL}/orders/admin/${orderId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error(`[OrderService] Error fetching order details ${orderId}:`, error);
    throw error.response?.data || error.message;
  }
}

/**
 * Bulk archive orders (admin only)
 * @param {Array<number>} orderIds - Array of order IDs to archive
 * @param {string} token - JWT authentication token
 * @returns {Promise<Object>} - Archive result
 */
export async function bulkArchiveOrders(orderIds, token) {
  try {
    const response = await axios.post(
      `${API_URL}/orders/bulk-archive`,
      { orderIds },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(`[OrderService] Error bulk archiving orders:`, error);
    throw error.response?.data || error.message;
  }
}

const OrderService = {
  createOrder,
  getOrders,
  getAllOrders,
  getOrderById,
  getOrderDetails, // Admin get order with items
  updateOrderStatus,
  cancelOrder,
  archiveOrder, // Admin archive
  unarchiveOrder, // Admin unarchive
  bulkArchiveOrders, // Admin bulk archive
  hideOrderFromUser, // User hide from history
  restoreOrderToUser, // User restore to history
};

export default OrderService;

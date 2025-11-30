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

const OrderService = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
};

export default OrderService;

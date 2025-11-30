const pool = require("../config/database");

/**
 * Generate unique order number with format: ORD-YYYYMMDD-XXXXX
 */
function generateOrderNumber() {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
  const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `ORD-${dateStr}-${randomStr}`;
}

/**
 * Create a new order with order items and notification
 * Uses transaction to ensure all or nothing
 */
async function createOrder(userId, orderData) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    console.log("[OrderService] Creating order for user:", userId);

    const {
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
      items, // Array of {product_id, product_name, product_price, quantity}
      subtotal,
      taxAmount = 0,
      discountAmount = 0,
      totalAmount,
      couponCode = null,
      paymentMethod,
      paymentStatus = "pending",
      prescriptionImage = null,
      notes = null,
    } = orderData;

    // Validate required fields
    if (!customerName || !customerPhone || !items || items.length === 0) {
      throw new Error("Missing required order fields");
    }

    // Generate unique order number
    const orderNumber = generateOrderNumber();

    // Insert order
    const orderQuery = `
      INSERT INTO orders (
        order_number,
        user_id,
        customer_name,
        customer_email,
        customer_phone,
        customer_address,
        subtotal,
        tax_amount,
        discount_amount,
        total_amount,
        coupon_code,
        payment_method,
        payment_status,
        prescription_image,
        order_status,
        notes,
        created_at,
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW(), NOW())
      RETURNING order_id, order_number, created_at
    `;

    const orderValues = [
      orderNumber,
      userId,
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
      subtotal,
      taxAmount,
      discountAmount,
      totalAmount,
      couponCode,
      paymentMethod,
      paymentStatus,
      prescriptionImage,
      "pending", // Default order status
      notes,
    ];

    const orderResult = await client.query(orderQuery, orderValues);
    const { order_id, order_number, created_at } = orderResult.rows[0];

    console.log("[OrderService] Order created:", order_number);

    // Insert order items
    for (const item of items) {
      const itemQuery = `
        INSERT INTO order_items (
          order_id,
          product_id,
          product_name,
          product_price,
          quantity,
          subtotal
        ) VALUES ($1, $2, $3, $4, $5, $6)
      `;

      const itemSubtotal = item.product_price * item.quantity;
      const itemValues = [
        order_id,
        item.product_id,
        item.product_name,
        item.product_price,
        item.quantity,
        itemSubtotal,
      ];

      await client.query(itemQuery, itemValues);
    }

    console.log(`[OrderService] Inserted ${items.length} order items`);

    // Create notification for the user
    const notificationQuery = `
      INSERT INTO notifications (
        user_id,
        type,
        title,
        message,
        related_order_id,
        order_status,
        customer_name,
        icon_type,
        is_read,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
      RETURNING notification_id
    `;

    const notificationValues = [
      userId,
      "order", // Valid type from CHECK constraint
      "Pesanan Berhasil Dibuat",
      `Pesanan ${order_number} telah berhasil dibuat. Total: Rp ${totalAmount.toLocaleString(
        "id-ID"
      )}`,
      order_id,
      "pending",
      customerName,
      "shopping-bag",
      false,
    ];

    const notifResult = await client.query(
      notificationQuery,
      notificationValues
    );

    console.log(
      "[OrderService] Notification created:",
      notifResult.rows[0].notification_id
    );

    // If payment is online and successful, clear the cart
    if (paymentMethod !== "bayar_ditempat") {
      await client.query("DELETE FROM cart_items WHERE user_id = $1", [userId]);
      console.log("[OrderService] Cart cleared for user:", userId);
    }

    await client.query("COMMIT");

    return {
      success: true,
      order: {
        order_id,
        order_number,
        created_at,
        total_amount: totalAmount,
        payment_method: paymentMethod,
        payment_status: paymentStatus,
        order_status: "pending",
      },
    };
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("[OrderService] Error creating order:", error.message);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Get all orders for a specific user
 */
async function getOrdersByUserId(userId) {
  try {
    console.log("[OrderService] Fetching orders for user:", userId);

    // Query modified to filter by order_status_history.is_hidden_from_user
    // This ensures user sees orders EVEN IF admin has archived them
    // User-side deletion is independent from admin-side archiving
    const query = `
      SELECT 
        o.order_id,
        o.order_number,
        o.customer_name,
        o.customer_phone,
        o.customer_address,
        o.subtotal,
        o.tax_amount,
        o.discount_amount,
        o.total_amount,
        o.coupon_code,
        o.payment_method,
        o.payment_status,
        o.order_status,
        o.prescription_image,
        o.prescription_verified,
        o.notes,
        o.created_at,
        o.completed_at,
        o.cancelled_at,
        o.cancellation_reason,
        o.is_archived,
        COUNT(oi.order_item_id) as total_items,
        SUM(oi.quantity) as total_quantity
      FROM orders o
      LEFT JOIN order_items oi ON o.order_id = oi.order_id
      WHERE o.user_id = $1 
        AND NOT EXISTS (
          SELECT 1 FROM order_status_history osh 
          WHERE osh.order_id = o.order_id 
          AND osh.is_hidden_from_user = TRUE
        )
      GROUP BY o.order_id
      ORDER BY o.created_at DESC
    `;

    const result = await pool.query(query, [userId]);

    console.log(
      `[OrderService] Found ${result.rows.length} orders for user:`,
      userId
    );

    return result.rows;
  } catch (error) {
    console.error(
      "[OrderService] Error fetching orders for user:",
      error.message
    );
    throw error;
  }
}

/**
 * Get all orders (for admin)
 * Option to include archived orders
 */
async function getAllOrders(includeArchived = false) {
  try {
    console.log("[OrderService] Fetching all orders for admin");

    const query = `
      SELECT 
        o.order_id,
        o.order_number,
        o.user_id,
        o.customer_name,
        o.customer_email,
        o.customer_phone,
        o.customer_address,
        o.subtotal,
        o.tax_amount,
        o.discount_amount,
        o.total_amount,
        o.coupon_code,
        o.payment_method,
        o.payment_status,
        o.order_status,
        o.prescription_image,
        o.prescription_verified,
        o.notes,
        o.created_at,
        o.completed_at,
        o.cancelled_at,
        o.cancellation_reason,
        o.is_archived,
        COUNT(oi.order_item_id) as total_items,
        SUM(oi.quantity) as total_quantity
      FROM orders o
      LEFT JOIN order_items oi ON o.order_id = oi.order_id
      ${!includeArchived ? "WHERE o.is_archived = FALSE" : ""}
      GROUP BY o.order_id
      ORDER BY o.created_at DESC
    `;

    const result = await pool.query(query);

    console.log(
      `[OrderService] Found ${result.rows.length} total orders (includeArchived: ${includeArchived})`
    );

    return result.rows;
  } catch (error) {
    console.error("[OrderService] Error fetching all orders:", error.message);
    throw error;
  }
}

/**
 * Get specific order by ID with all items
 */
async function getOrderById(userId, orderId) {
  try {
    console.log(`[OrderService] Fetching order ${orderId} for user ${userId}`);

    // Get order details
    const orderQuery = `
      SELECT 
        o.*,
        COUNT(oi.order_item_id) as total_items,
        SUM(oi.quantity) as total_quantity
      FROM orders o
      LEFT JOIN order_items oi ON o.order_id = oi.order_id
      WHERE o.order_id = $1 AND o.user_id = $2
      GROUP BY o.order_id
    `;

    const orderResult = await pool.query(orderQuery, [orderId, userId]);

    if (orderResult.rows.length === 0) {
      return null;
    }

    const order = orderResult.rows[0];

    // Get order items with product images
    const itemsQuery = `
      SELECT 
        oi.order_item_id,
        oi.product_id,
        oi.product_name,
        oi.product_price,
        oi.quantity,
        oi.subtotal,
        p.main_image_url as product_image
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.product_id
      WHERE oi.order_id = $1
      ORDER BY oi.order_item_id
    `;

    const itemsResult = await pool.query(itemsQuery, [orderId]);

    order.items = itemsResult.rows;

    console.log(
      `[OrderService] Order ${orderId} found with ${itemsResult.rows.length} items`
    );
    console.log(
      "[OrderService] Sample item:",
      JSON.stringify(itemsResult.rows[0], null, 2)
    );

    return order;
  } catch (error) {
    console.error("[OrderService] Error fetching order:", error.message);
    throw error;
  }
}

/**
 * Update order status (for admin or system updates)
 */
async function updateOrderStatus(orderId, newStatus) {
  try {
    console.log(
      `[OrderService] Updating order ${orderId} status to:`,
      newStatus
    );

    const query = `
      UPDATE orders
      SET 
        order_status = $1::varchar,
        updated_at = NOW(),
        completed_at = CASE WHEN $1::varchar = 'completed' THEN NOW() ELSE completed_at END,
        cancelled_at = CASE WHEN $1::varchar = 'cancelled' THEN NOW() ELSE cancelled_at END
      WHERE order_id = $2
      RETURNING order_id, order_number, order_status, updated_at
    `;

    const result = await pool.query(query, [newStatus, orderId]);

    if (result.rows.length === 0) {
      return null;
    }

    console.log("[OrderService] Order status updated:", result.rows[0]);

    return result.rows[0];
  } catch (error) {
    console.error("[OrderService] Error updating order status:", error.message);
    throw error;
  }
}

/**
 * Cancel an order (only if still pending)
 */
async function cancelOrder(userId, orderId, cancellationReason) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    console.log(
      `[OrderService] Cancelling order ${orderId} for user ${userId}`
    );

    // Check if order exists and belongs to user
    const checkQuery = `
      SELECT order_id, order_status, user_id
      FROM orders
      WHERE order_id = $1 AND user_id = $2
    `;

    const checkResult = await client.query(checkQuery, [orderId, userId]);

    if (checkResult.rows.length === 0) {
      throw new Error("Order not found");
    }

    const order = checkResult.rows[0];

    if (order.order_status !== "pending") {
      throw new Error("Only pending orders can be cancelled");
    }

    // Update order status
    const updateQuery = `
      UPDATE orders
      SET 
        order_status = 'cancelled',
        cancelled_at = NOW(),
        cancellation_reason = $1,
        updated_at = NOW()
      WHERE order_id = $2
      RETURNING order_id, order_number, order_status
    `;

    const updateResult = await client.query(updateQuery, [
      cancellationReason,
      orderId,
    ]);

    // Create cancellation notification
    const notificationQuery = `
      INSERT INTO notifications (
        user_id,
        type,
        title,
        message,
        related_order_id,
        order_status,
        icon_type,
        is_read,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
    `;

    const notificationValues = [
      userId,
      "order", // Valid type from CHECK constraint
      "Pesanan Dibatalkan",
      `Pesanan ${updateResult.rows[0].order_number} telah dibatalkan. Alasan: ${cancellationReason}`,
      orderId,
      "cancelled",
      "x-circle",
      false,
    ];

    await client.query(notificationQuery, notificationValues);

    await client.query("COMMIT");

    console.log("[OrderService] Order cancelled:", updateResult.rows[0]);

    return updateResult.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("[OrderService] Error cancelling order:", error.message);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Archive order (soft delete for ADMIN ONLY)
 * This hides the order from admin panel OrderManagement
 * Does NOT affect user's History view
 * @param {number} orderId - Order ID to archive
 * @returns {object} - Updated order
 */
async function archiveOrder(orderId) {
  try {
    console.log("[OrderService] Admin archiving order:", orderId);

    const query = `
      UPDATE orders
      SET is_archived = TRUE,
          updated_at = CURRENT_TIMESTAMP
      WHERE order_id = $1
      RETURNING *
    `;

    const result = await pool.query(query, [orderId]);

    if (result.rows.length === 0) {
      throw new Error("Order not found");
    }

    console.log(
      "[OrderService] Order archived by admin successfully:",
      orderId
    );
    return result.rows[0];
  } catch (error) {
    console.error("[OrderService] Error archiving order:", error.message);
    throw error;
  }
}

/**
 * Hide order from user's history view (USER-SIDE deletion)
 * This marks order as hidden in order_status_history table
 * Does NOT affect admin's OrderManagement view
 * @param {number} orderId - Order ID to hide
 * @param {number} userId - User ID (for verification)
 * @returns {object} - Result status
 */
async function archiveOrderForUser(orderId, userId) {
  try {
    console.log(
      `[OrderService] User ${userId} hiding order ${orderId} from history`
    );

    // First verify the order belongs to the user
    const verifyQuery = `
      SELECT order_id, order_status FROM orders WHERE order_id = $1 AND user_id = $2
    `;
    const verifyResult = await pool.query(verifyQuery, [orderId, userId]);

    if (verifyResult.rows.length === 0) {
      throw new Error("Order not found or does not belong to user");
    }

    const orderStatus = verifyResult.rows[0].order_status;

    // Check if already hidden
    const checkQuery = `
      SELECT history_id, is_hidden_from_user 
      FROM order_status_history 
      WHERE order_id = $1 
      ORDER BY changed_at DESC 
      LIMIT 1
    `;
    const checkResult = await pool.query(checkQuery, [orderId]);

    if (
      checkResult.rows.length > 0 &&
      checkResult.rows[0].is_hidden_from_user
    ) {
      return {
        success: true,
        message: "Order already hidden from history",
        orderId: orderId,
      };
    }

    // Insert new history entry to mark as hidden
    const hideQuery = `
      INSERT INTO order_status_history (
        order_id, 
        old_status, 
        new_status, 
        notes, 
        is_hidden_from_user
      )
      VALUES ($1, $2, $2, 'Hidden from user history view', TRUE)
      RETURNING *
    `;

    const result = await pool.query(hideQuery, [orderId, orderStatus]);

    console.log(
      `[OrderService] Order ${orderId} hidden from user ${userId} successfully`
    );
    return {
      success: true,
      message: "Order hidden from history",
      orderId: orderId,
    };
  } catch (error) {
    console.error("[OrderService] Error hiding order for user:", error.message);
    throw error;
  }
}

/**
 * Unhide order from user's history view (restore to user history)
 * @param {number} orderId - Order ID to unhide
 * @param {number} userId - User ID (for verification)
 * @returns {object} - Result status
 */
async function unarchiveOrderForUser(orderId, userId) {
  try {
    console.log(
      `[OrderService] User ${userId} restoring order ${orderId} to history`
    );

    // Verify order belongs to user
    const verifyQuery = `
      SELECT order_id FROM orders WHERE order_id = $1 AND user_id = $2
    `;
    const verifyResult = await pool.query(verifyQuery, [orderId, userId]);

    if (verifyResult.rows.length === 0) {
      throw new Error("Order not found or does not belong to user");
    }

    // Update order_status_history to unhide
    const unhideQuery = `
      UPDATE order_status_history
      SET is_hidden_from_user = FALSE
      WHERE order_id = $1
      RETURNING *
    `;

    const result = await pool.query(unhideQuery, [orderId]);

    console.log(
      `[OrderService] Order ${orderId} restored to user ${userId} history`
    );
    return {
      success: true,
      message: "Order restored to history",
      orderId: orderId,
    };
  } catch (error) {
    console.error(
      "[OrderService] Error restoring order for user:",
      error.message
    );
    throw error;
  }
}

/**
 * Unarchive order (restore from archive)
 * @param {number} orderId - Order ID to unarchive
 * @returns {object} - Updated order
 */
async function unarchiveOrder(orderId) {
  try {
    console.log("[OrderService] Unarchiving order:", orderId);

    const query = `
      UPDATE orders
      SET is_archived = FALSE,
          updated_at = CURRENT_TIMESTAMP
      WHERE order_id = $1
      RETURNING *
    `;

    const result = await pool.query(query, [orderId]);

    if (result.rows.length === 0) {
      throw new Error("Order not found");
    }

    console.log("[OrderService] Order unarchived successfully:", orderId);
    return result.rows[0];
  } catch (error) {
    console.error("[OrderService] Error unarchiving order:", error.message);
    throw error;
  }
}

/**
 * Archive multiple orders in bulk
 * @param {number[]} orderIds - Array of order IDs to archive
 * @returns {object} - Archive result
 */
async function bulkArchiveOrders(orderIds) {
  try {
    console.log("[OrderService] Bulk archiving orders:", orderIds);

    const query = `
      UPDATE orders
      SET is_archived = TRUE,
          updated_at = CURRENT_TIMESTAMP
      WHERE order_id = ANY($1::int[])
      RETURNING order_id
    `;

    const result = await pool.query(query, [orderIds]);

    console.log(`[OrderService] Archived ${result.rows.length} orders`);
    return {
      archived_count: result.rows.length,
      archived_order_ids: result.rows.map((r) => r.order_id),
    };
  } catch (error) {
    console.error("[OrderService] Error bulk archiving orders:", error.message);
    throw error;
  }
}

module.exports = {
  createOrder,
  getOrdersByUserId,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  archiveOrder, // Admin-side archive
  unarchiveOrder, // Admin-side unarchive
  archiveOrderForUser, // User-side hide from history
  unarchiveOrderForUser, // User-side restore to history
  bulkArchiveOrders,
};

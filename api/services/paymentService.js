const { snap } = require("../config/midtrans");

/**
 * Create Midtrans transaction
 * @param {Object} data - Transaction data
 * @param {string} data.order_id - Unique order ID
 * @param {number} data.gross_amount - Total amount
 * @param {Array} data.items - Array of items
 * @param {Object} data.customer - Customer details
 * @returns {Promise<Object>} Transaction result with token and redirect_url
 */
const createTransaction = async (data) => {
  const { order_id, gross_amount, items, customer } = data;

  // ============================================
  // VALIDATION
  // ============================================
  if (!order_id) {
    throw new Error("Missing required field: order_id");
  }

  if (!gross_amount || gross_amount <= 0) {
    throw new Error("Missing or invalid field: gross_amount (must be > 0)");
  }

  if (!Array.isArray(items) || items.length === 0) {
    throw new Error(
      "Missing or invalid field: items (must be non-empty array)"
    );
  }

  if (!customer || !customer.first_name || !customer.email || !customer.phone) {
    throw new Error(
      "Missing customer details: first_name, email, phone required"
    );
  }

  console.log("📝 Creating Midtrans transaction:", {
    order_id,
    gross_amount,
    customer: customer.first_name,
    items: items.length,
  });

  // ============================================
  // BUILD MIDTRANS PARAMETER
  // ============================================
  const baseUrl = process.env.FRONTEND_URL || "http://localhost:5173";

  const parameter = {
    transaction_details: {
      order_id: String(order_id),
      gross_amount: parseInt(gross_amount),
    },
    customer_details: {
      first_name: customer.first_name || "Customer",
      last_name: customer.last_name || "",
      email: customer.email,
      phone: customer.phone,
      billing_address: customer.address
        ? {
            full_address: customer.address,
          }
        : undefined,
    },
    item_details: items.map((item) => ({
      id: String(item.id || `ITEM-${Date.now()}-${Math.random()}`),
      price: parseInt(item.price) || 0,
      quantity: parseInt(item.quantity) || 1,
      name: String(item.name || "Product").substring(0, 100),
    })),
    callbacks: {
      finish: `${baseUrl}/history?payment=success`,
      error: `${baseUrl}/history?payment=error`,
      pending: `${baseUrl}/history?payment=pending`,
    },
  };

  // Filter undefined values
  if (!parameter.customer_details.billing_address) {
    delete parameter.customer_details.billing_address;
  }

  // ============================================
  // CREATE TRANSACTION WITH MIDTRANS
  // ============================================
  const transaction = await snap.createTransaction(parameter);

  console.log("✅ Transaction created successfully");
  console.log("🎟️  Token:", transaction.token.substring(0, 20) + "...");

  return {
    success: true,
    token: transaction.token,
    redirect_url: transaction.redirect_url,
    order_id: order_id,
  };
};

/**
 * Process Midtrans notification webhook
 * @param {Object} notification - Notification data from Midtrans
 * @returns {Promise<Object>} Processing result
 */
const processNotification = async (notification) => {
  const pool = require("../config/database");

  console.log("🔔 Midtrans notification received:", {
    order_id: notification.order_id,
    transaction_status: notification.transaction_status,
    payment_type: notification.payment_type,
    fraud_status: notification.fraud_status,
  });

  const { order_id, transaction_status, fraud_status } = notification;

  try {
    // Extract original order_number from transaction ID
    // Format: ORDER_NUMBER-TIMESTAMP (e.g., ORD-20241205-001-1733400000000)
    // We need to get everything before the last hyphen and timestamp
    let orderNumber = order_id;

    // Check if order_id contains timestamp (ends with 13-digit number)
    const parts = order_id.split("-");
    const lastPart = parts[parts.length - 1];

    // If last part is a timestamp (13 digits), remove it to get order_number
    if (lastPart && /^\d{13}$/.test(lastPart)) {
      orderNumber = parts.slice(0, -1).join("-");
      console.log("📝 Extracted order_number from transaction_id:", {
        transaction_id: order_id,
        order_number: orderNumber,
      });
    }

    // Get order by order_number
    const orderQuery = `
      SELECT order_id, user_id, payment_status, order_status, total_amount, order_number
      FROM orders 
      WHERE order_number = $1
    `;
    const orderResult = await pool.query(orderQuery, [orderNumber]);

    if (orderResult.rows.length === 0) {
      console.error("❌ Order not found for order_number:", orderNumber);
      return {
        success: false,
        message: "Order not found",
      };
    }

    const order = orderResult.rows[0];
    let newPaymentStatus = order.payment_status;
    let newOrderStatus = order.order_status;

    // Handle different transaction statuses
    switch (transaction_status) {
      case "capture":
        if (fraud_status === "accept") {
          newPaymentStatus = "paid";
          if (newOrderStatus === "pending") {
            newOrderStatus = "preparing";
          }
          console.log("✅ Payment captured and accepted for order:", order_id);
        }
        break;

      case "settlement":
        newPaymentStatus = "paid";
        if (newOrderStatus === "pending") {
          newOrderStatus = "preparing";
        }
        console.log("✅ Payment settled for order:", order_id);
        break;

      case "pending":
        newPaymentStatus = "pending";
        console.log("⏳ Payment pending for order:", order_id);
        break;

      case "deny":
      case "cancel":
      case "expire":
        newPaymentStatus = "failed";
        newOrderStatus = "cancelled";
        console.log("❌ Payment failed/cancelled/expired for order:", order_id);
        break;
    }

    // Update order status in database
    const updateQuery = `
      UPDATE orders
      SET 
        payment_status = $1,
        order_status = $2,
        updated_at = NOW()
      WHERE order_id = $3
      RETURNING *
    `;

    const updateResult = await pool.query(updateQuery, [
      newPaymentStatus,
      newOrderStatus,
      order.order_id,
    ]);

    // Create notification for user
    if (newPaymentStatus === "paid") {
      const notifQuery = `
        INSERT INTO notifications (
          user_id, title, message, type, related_id, related_type, icon_type
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      `;

      await pool.query(notifQuery, [
        order.user_id,
        "Pembayaran Berhasil",
        `Pembayaran untuk pesanan #${order.order_number} telah berhasil dikonfirmasi. Pesanan Anda sedang diproses.`,
        "success",
        order.order_id,
        "order",
        "check-circle",
      ]);
    }

    console.log("✅ Order updated:", {
      transaction_id: order_id,
      order_number: order.order_number,
      payment_status: newPaymentStatus,
      order_status: newOrderStatus,
    });

    return {
      success: true,
      message: "Notification processed successfully",
      data: updateResult.rows[0],
    };
  } catch (error) {
    console.error("❌ Error processing notification:", error.message);
    throw error;
  }
};

module.exports = {
  createTransaction,
  processNotification,
};

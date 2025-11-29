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
  console.log("🔔 Midtrans notification received:", {
    order_id: notification.order_id,
    transaction_status: notification.transaction_status,
    payment_type: notification.payment_type,
  });

  const { order_id, transaction_status, payment_type } = notification;

  // Handle different statuses
  switch (transaction_status) {
    case "capture":
    case "settlement":
      console.log("✅ Payment successful for order:", order_id);
      break;
    case "pending":
      console.log("⏳ Payment pending for order:", order_id);
      break;
    case "deny":
    case "cancel":
      console.log("❌ Payment failed for order:", order_id);
      break;
    case "expire":
      console.log("⏰ Payment expired for order:", order_id);
      break;
  }

  // TODO: Verify signature with Midtrans
  // TODO: Update order status in database
  // TODO: Send confirmation email

  return {
    success: true,
    message: "Notification processed",
  };
};

module.exports = {
  createTransaction,
  processNotification,
};

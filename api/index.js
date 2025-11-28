/**
 * PharmaHub Backend API
 * Vercel Serverless Function
 * Integration: Midtrans Payment Gateway (Sandbox/Production)
 *
 * SENSITIVE KEYS REMOVED.
 * Gunakan environment variables:
 *   MIDTRANS_SERVER_KEY
 *   MIDTRANS_CLIENT_KEY
 *   MIDTRANS_IS_PRODUCTION ("true" / "false")
 *
 * Jangan commit nilai asli key ke repository publik.
 */

const express = require("express");
const cors = require("cors");
const midtransClient = require("midtrans-client");
require("dotenv").config();

const app = express();

// ============================================
// MIDDLEWARE
// ============================================
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "https://pharmahub.vercel.app",
      process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "",
    ].filter(Boolean),
    credentials: true,
  })
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// ============================================
// ENVIRONMENT VARIABLES
// ============================================
const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY;
const MIDTRANS_CLIENT_KEY = process.env.MIDTRANS_CLIENT_KEY;
if (!MIDTRANS_SERVER_KEY || !MIDTRANS_CLIENT_KEY) {
  console.error(
    "❌ Missing payment keys. Set MIDTRANS_SERVER_KEY and MIDTRANS_CLIENT_KEY in environment."
  );
}
const IS_PRODUCTION = process.env.MIDTRANS_IS_PRODUCTION === "true";

// ============================================
// MIDTRANS CONFIGURATION
// ============================================
const snap = new midtransClient.Snap({
  isProduction: IS_PRODUCTION,
  serverKey: MIDTRANS_SERVER_KEY,
  clientKey: MIDTRANS_CLIENT_KEY,
});

console.log("🚀 PharmaHub API Started");
console.log(`📍 Mode: ${IS_PRODUCTION ? "PRODUCTION" : "SANDBOX"}`);
if (MIDTRANS_SERVER_KEY) {
  console.log(`🔑 Server Key: ${MIDTRANS_SERVER_KEY.substring(0, 10)}********`);
}

// ============================================
// HEALTH CHECK ENDPOINT
// ============================================
app.get("/api", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "PharmaHub API Server is running",
    mode: IS_PRODUCTION ? "production" : "sandbox",
    timestamp: new Date().toISOString(),
  });
});

// ============================================
// CREATE TRANSACTION ENDPOINT
// ============================================
/**
 * POST /api/create-transaction
 * Create new Midtrans transaction
 *
 * Request body:
 * {
 *   order_id: "PHARMAHUB-20250101-00001",
 *   gross_amount: 150000,
 *   items: [
 *     { id: "PROD-1", price: 12000, quantity: 1, name: "Paracetamol 500mg" },
 *     { id: "PROD-2", price: 15000, quantity: 2, name: "Amoxicillin 500mg" }
 *   ],
 *   customer: {
 *     first_name: "John",
 *     last_name: "Doe",
 *     email: "john@example.com",
 *     phone: "08123456789"
 *   }
 * }
 */
app.post("/api/create-transaction", async (req, res) => {
  try {
    const { order_id, gross_amount, items, customer } = req.body;

    // ============================================
    // VALIDATION
    // ============================================
    if (!order_id) {
      return res.status(400).json({
        success: false,
        message: "Missing required field: order_id",
      });
    }

    if (!gross_amount || gross_amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Missing or invalid field: gross_amount (must be > 0)",
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Missing or invalid field: items (must be non-empty array)",
      });
    }

    if (
      !customer ||
      !customer.first_name ||
      !customer.email ||
      !customer.phone
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing customer details: first_name, email, phone required",
      });
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

    res.status(200).json({
      success: true,
      token: transaction.token,
      redirect_url: transaction.redirect_url,
      order_id: order_id,
    });
  } catch (error) {
    console.error("❌ Error creating transaction:", error.message);

    // Handle Midtrans specific errors
    if (error.ApiResponse) {
      console.error("Midtrans API Error:", error.ApiResponse);
      return res.status(error.ApiResponse.status_code || 500).json({
        success: false,
        message: error.ApiResponse.error_description || error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || "Failed to create transaction",
    });
  }
});

// ============================================
// NOTIFICATION WEBHOOK ENDPOINT
// ============================================
/**
 * POST /api/midtrans-notification
 * Webhook dari Midtrans untuk payment status updates
 */
app.post("/api/midtrans-notification", async (req, res) => {
  try {
    const notification = req.body;

    console.log("🔔 Midtrans notification received:", {
      order_id: notification.order_id,
      transaction_status: notification.transaction_status,
      payment_type: notification.payment_type,
    });

    // TODO: Verify signature with Midtrans
    // TODO: Update order status di database
    // TODO: Send confirmation email

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

    res.status(200).json({
      success: true,
      message: "Notification processed",
    });
  } catch (error) {
    console.error("❌ Error processing notification:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to process notification",
    });
  }
});

// ============================================
// ERROR HANDLING MIDDLEWARE
// ============================================
app.use((err, req, res, next) => {
  console.error("🔴 Server error:", err);

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

// ============================================
// 404 HANDLER
// ============================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint not found",
    path: req.path,
  });
});

// ============================================
// EXPORT FOR VERCEL SERVERLESS
// ============================================
module.exports = app;

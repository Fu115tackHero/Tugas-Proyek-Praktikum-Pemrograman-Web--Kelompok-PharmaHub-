const express = require("express");
const cors = require("cors");
const midtransClient = require("midtrans-client");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Mode demo untuk testing tanpa kredensial Midtrans yang valid
const DEMO_MODE = process.env.DEMO_MODE !== "false"; // Default true untuk development

// Inisialisasi Midtrans Snap (hanya jika bukan demo mode)
let snap = null;
if (!DEMO_MODE) {
  snap = new midtransClient.Snap({
    isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true" || false,
    serverKey: process.env.MIDTRANS_SERVER_KEY,
    clientKey: process.env.MIDTRANS_CLIENT_KEY,
  });
}

// Health check endpoint
app.get("/api", (req, res) => {
  res.json({
    status: "ok",
    message: "PharmaHub API is running",
    mode: DEMO_MODE ? "demo" : "production",
    timestamp: new Date().toISOString(),
  });
});

// Endpoint untuk membuat transaksi Midtrans
app.post("/api/create-transaction", async (req, res) => {
  try {
    const { transaction_details, customer_details, item_details } = req.body;

    // Validasi input
    if (!transaction_details || !customer_details || !item_details) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: transaction_details, customer_details, or item_details",
      });
    }

    if (!transaction_details.order_id || !transaction_details.gross_amount) {
      return res.status(400).json({
        success: false,
        message: "transaction_details must include order_id and gross_amount",
      });
    }

    // DEMO MODE: Generate fake token untuk testing
    if (DEMO_MODE) {
      console.log("⚠️  DEMO MODE: Generating fake Midtrans token");
      console.log("Order ID:", transaction_details.order_id);
      console.log("Amount:", transaction_details.gross_amount);

      // Simulate token generation
      const fakeToken = `demo-${Buffer.from(transaction_details.order_id)
        .toString("base64")
        .substring(0, 20)}-${Date.now()}`;

      return res.json({
        success: true,
        token: fakeToken,
        redirect_url: `https://app.sandbox.midtrans.com/snap/v2/vtweb/${fakeToken}`,
        demo_mode: true,
        message:
          "Demo mode: Using simulated payment. Set DEMO_MODE=false and provide valid Midtrans credentials for real payments.",
      });
    }

    // PRODUCTION MODE: Call real Midtrans API
    const parameter = {
      transaction_details: {
        order_id: transaction_details.order_id,
        gross_amount: transaction_details.gross_amount,
      },
      customer_details: {
        first_name: customer_details.first_name || "Customer",
        email: customer_details.email || "customer@pharmahub.com",
        phone: customer_details.phone || "08123456789",
      },
      item_details: item_details,
      callbacks: {
        finish: `${req.headers.origin || "http://localhost:5173"}/history`,
      },
    };

    // Membuat transaksi ke Midtrans
    const transaction = await snap.createTransaction(parameter);

    // Mengembalikan token ke frontend
    res.json({
      success: true,
      token: transaction.token,
      redirect_url: transaction.redirect_url,
    });
  } catch (error) {
    console.error("Midtrans Error:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Failed to create transaction",
      error: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Export untuk Vercel Serverless Functions
module.exports = app;

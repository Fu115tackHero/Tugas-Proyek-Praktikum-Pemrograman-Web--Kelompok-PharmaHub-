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
// ROUTES
// ============================================
const router = require("./routes");
app.use("/api", router);

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

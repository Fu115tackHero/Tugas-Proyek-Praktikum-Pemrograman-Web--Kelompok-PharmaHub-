const midtransClient = require("midtrans-client");
require("dotenv").config();

// ============================================
// ENVIRONMENT VARIABLES
// ============================================
const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY;
const MIDTRANS_CLIENT_KEY = process.env.MIDTRANS_CLIENT_KEY;
const IS_PRODUCTION = process.env.MIDTRANS_IS_PRODUCTION === "true";

if (!MIDTRANS_SERVER_KEY || !MIDTRANS_CLIENT_KEY) {
  console.error(
    "❌ Missing payment keys. Set MIDTRANS_SERVER_KEY and MIDTRANS_CLIENT_KEY in environment."
  );
}

// ============================================
// MIDTRANS CONFIGURATION
// ============================================
const snap = new midtransClient.Snap({
  isProduction: IS_PRODUCTION,
  serverKey: MIDTRANS_SERVER_KEY,
  clientKey: MIDTRANS_CLIENT_KEY,
});

console.log("🚀 Midtrans Configuration Loaded");
console.log(`📍 Mode: ${IS_PRODUCTION ? "PRODUCTION" : "SANDBOX"}`);
if (MIDTRANS_SERVER_KEY) {
  console.log(`🔑 Server Key: ${MIDTRANS_SERVER_KEY.substring(0, 10)}********`);
}

module.exports = {
  snap,
  IS_PRODUCTION,
  MIDTRANS_SERVER_KEY,
  MIDTRANS_CLIENT_KEY,
};

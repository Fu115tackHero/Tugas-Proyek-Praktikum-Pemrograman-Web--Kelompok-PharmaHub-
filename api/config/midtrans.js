const midtransClient = require("midtrans-client");
require("dotenv").config();

// ============================================
// ENVIRONMENT VARIABLES
// ============================================
const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY;
const MIDTRANS_CLIENT_KEY = process.env.MIDTRANS_CLIENT_KEY;
const IS_PRODUCTION = process.env.MIDTRANS_IS_PRODUCTION === "true";

// Local/dev fallback: don't break the server if keys are missing
const IS_LOCAL_DEV = !IS_PRODUCTION; // treat non-production as safe mode

if (!MIDTRANS_SERVER_KEY || !MIDTRANS_CLIENT_KEY) {
  const msg =
    "Missing Midtrans keys. Set MIDTRANS_SERVER_KEY and MIDTRANS_CLIENT_KEY.";
  if (IS_LOCAL_DEV) {
    console.warn(`⚠️  ${msg} Using stub Snap client for local development.`);
  } else {
    console.error(`❌ ${msg}`);
  }
}

// ============================================
// MIDTRANS CONFIGURATION
// ============================================
// Provide a stub when keys are missing in local dev to avoid crashes
let snap;
if (!MIDTRANS_SERVER_KEY || !MIDTRANS_CLIENT_KEY) {
  if (IS_LOCAL_DEV) {
    snap = {
      createTransactionToken: async () => {
        return "stub-transaction-token";
      },
    };
  } else {
    // In production, still initialize to surface config errors early
    snap = new midtransClient.Snap({
      isProduction: IS_PRODUCTION,
      serverKey: MIDTRANS_SERVER_KEY,
      clientKey: MIDTRANS_CLIENT_KEY,
    });
  }
} else {
  snap = new midtransClient.Snap({
    isProduction: IS_PRODUCTION,
    serverKey: MIDTRANS_SERVER_KEY,
    clientKey: MIDTRANS_CLIENT_KEY,
  });
}

console.log("🚀 Midtrans Configuration Loaded");
console.log(`📍 Mode: ${IS_PRODUCTION ? "PRODUCTION" : "SANDBOX"}`);
if (MIDTRANS_SERVER_KEY) {
  console.log(`🔑 Server Key: ${MIDTRANS_SERVER_KEY.substring(0, 10)}********`);
} else if (IS_LOCAL_DEV) {
  console.log("🔧 Using stub Snap client (local dev without keys)");
}

module.exports = {
  snap,
  IS_PRODUCTION,
  MIDTRANS_SERVER_KEY,
  MIDTRANS_CLIENT_KEY,
};

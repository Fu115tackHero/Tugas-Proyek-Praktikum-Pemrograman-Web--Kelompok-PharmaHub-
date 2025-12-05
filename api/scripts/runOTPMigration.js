/**
 * Run OTP table migration
 */

const pool = require("../config/database");
const fs = require("fs");
const path = require("path");

async function runMigration() {
  try {
    console.log("🔧 Running OTP table migration...");

    const migrationSQL = fs.readFileSync(
      path.join(__dirname, "../../database/migrations/add_otp_table.sql"),
      "utf8"
    );

    await pool.query(migrationSQL);

    console.log("✅ OTP table migration completed successfully");
    console.log("📋 Created:");
    console.log("  - otp_codes table");
    console.log("  - email_verified column in users");
    console.log("  - pending_verification column in users");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    process.exit(1);
  }
}

runMigration();

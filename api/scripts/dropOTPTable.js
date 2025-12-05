/**
 * Drop OTP-related tables and columns from database
 */

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const pool = require("../config/database");

async function dropOTPTable() {
  const client = await pool.connect();
  
  try {
    console.log("🗑️ Starting cleanup of OTP-related database objects...");
    
    await client.query("BEGIN");

    // Drop otp_codes table if exists
    console.log("Dropping otp_codes table...");
    await client.query("DROP TABLE IF EXISTS otp_codes CASCADE");

    // Remove OTP-related columns from users table
    console.log("Removing OTP columns from users table...");
    await client.query("ALTER TABLE users DROP COLUMN IF EXISTS email_verified CASCADE");
    await client.query("ALTER TABLE users DROP COLUMN IF EXISTS pending_verification CASCADE");

    await client.query("COMMIT");
    
    console.log("✅ OTP cleanup completed successfully");
    process.exit(0);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Error cleaning up OTP tables:", error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

dropOTPTable();

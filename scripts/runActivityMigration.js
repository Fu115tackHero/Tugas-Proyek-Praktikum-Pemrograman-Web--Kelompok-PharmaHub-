/**
 * Run admin activity logs migration
 */

const path = require("path");
const fs = require("fs");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const pool = require("../config/database");

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log("🚀 Running admin activity logs migration...");
    
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, "../../database/migrations/create_admin_activity_logs.sql"),
      "utf8"
    );

    await client.query(migrationSQL);
    
    console.log("✅ Admin activity logs table created successfully");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration error:", error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();

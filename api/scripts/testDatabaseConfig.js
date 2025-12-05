require("dotenv").config({ path: "../.env" });
require("dotenv").config({ path: ".env" });
const pool = require("../config/database");

async function testDatabaseConnection() {
  console.log("=== Testing Database Connection ===\n");

  try {
    // Test basic connection
    console.log("📡 Connecting to database...");
    const result = await pool.query("SELECT NOW(), version()");

    console.log("✅ Database connected successfully!\n");
    console.log("📊 Database Info:");
    console.log(`   Timestamp: ${result.rows[0].now}`);
    console.log(`   Version: ${result.rows[0].version}\n`);

    // Test if tables exist
    console.log("📋 Checking tables...");
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;

    const tables = await pool.query(tablesQuery);
    console.log(`✅ Found ${tables.rows.length} tables:\n`);

    tables.rows.forEach((row, idx) => {
      console.log(`   ${idx + 1}. ${row.table_name}`);
    });

    console.log("\n✅ Database configuration is working correctly!");
  } catch (error) {
    console.error("❌ Database connection failed!");
    console.error("Error:", error.message);
    console.error("\nTroubleshooting:");
    console.error("1. Check if DATABASE_URL or DB_* variables are set in .env");
    console.error("2. Verify database credentials");
    console.error(
      "3. Ensure PostgreSQL is running (local) or accessible (Neon)"
    );
  } finally {
    await pool.end();
  }
}

testDatabaseConnection();

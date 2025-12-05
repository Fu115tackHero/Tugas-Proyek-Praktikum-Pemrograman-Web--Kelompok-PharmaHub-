require("dotenv").config({ path: "./api/.env" });
require("dotenv").config({ path: "./.env" });

const pool = require("../config/database");

async function checkNotificationsTable() {
  try {
    const result = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'notifications' 
      ORDER BY ordinal_position
    `);

    console.log("\n📋 Notifications table columns:");
    result.rows.forEach((col) => {
      console.log(`   ${col.column_name}: ${col.data_type}`);
    });

    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

checkNotificationsTable();

require("dotenv").config({ path: "./api/.env" });
require("dotenv").config({ path: "./.env" });
const pool = require("../config/database");

async function verifyAdminNotesColumn() {
  try {
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'notifications' 
        AND column_name = 'admin_notes'
    `);

    if (result.rows.length > 0) {
      console.log("✅ admin_notes column exists in notifications table:");
      console.table(result.rows);
    } else {
      console.log("❌ admin_notes column NOT FOUND in notifications table");
    }

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    await pool.end();
    process.exit(1);
  }
}

verifyAdminNotesColumn();

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const pool = require("../config/database");

async function show() {
  const client = await pool.connect();
  try {
    const countRes = await client.query("SELECT COUNT(*) AS c FROM admin_activity_logs");
    const total = parseInt(countRes.rows[0].c || 0);
    console.log(`Total activity logs: ${total}`);

    const res = await client.query(
      `SELECT log_id, admin_id, action_type, entity_type, entity_name, created_at
       FROM admin_activity_logs
       ORDER BY created_at DESC
       LIMIT 10`
    );

    console.table(res.rows);
  } catch (e) {
    console.error("Error showing activities:", e.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

show();

// Simple DB health check using existing pool config
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });

const pool = require("../config/database");

(async () => {
  try {
    const start = Date.now();
    const res = await pool.query("SELECT version(), current_database(), current_user");
    const ms = Date.now() - start;
    console.log("✅ DB connection OK (", ms, "ms)");
    console.table({
      version: res.rows[0].version,
      database: res.rows[0].current_database,
      user: res.rows[0].current_user,
      host: process.env.DB_HOST,
      ssl: process.env.DB_SSL_MODE,
    });
    process.exit(0);
  } catch (err) {
    console.error("❌ DB connection failed:", err.message);
    process.exit(1);
  }
})();

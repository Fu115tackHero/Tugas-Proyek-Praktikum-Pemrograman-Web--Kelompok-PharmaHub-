const { Pool } = require("pg");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

// Konfigurasi koneksi database PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || "pharmahub_db",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "",
  max: parseInt(process.env.DB_MAX_CONNECTIONS) || 20,
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT) || 30000,
  connectionTimeoutMillis:
    parseInt(process.env.DB_CONNECTION_TIMEOUT) || 2000,
});

// Test koneksi database
pool.on("connect", () => {
  console.log("✅ Connected to PostgreSQL database");
});

pool.on("error", (err) => {
  console.error("❌ Unexpected error on idle client", err);
  process.exit(-1);
});

// Helper function untuk query dengan error handling
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;

    if (process.env.DEBUG_SQL === "true") {
      console.log("📊 Query executed:", { text, duration, rows: res.rowCount });
    }

    return res;
  } catch (error) {
    console.error("❌ Database query error:", error);
    throw error;
  }
};

// Test koneksi saat startup
const testConnection = async () => {
  try {
    const result = await query("SELECT NOW() as current_time, version()");
    console.log("🎉 Database connection successful!");
    console.log("⏰ Server time:", result.rows[0].current_time);
    console.log("📦 PostgreSQL version:", result.rows[0].version.split(",")[0]);
    return true;
  } catch (error) {
    console.error("💥 Failed to connect to database:", error.message);
    return false;
  }
};

module.exports = {
  pool,
  query,
  testConnection,
};

/**
 * Database Configuration for PharmaHub
 * Supports both development (individual credentials) and production (DATABASE_URL)
 * Production: Neon Database via Vercel
 */

const { Pool } = require("pg");
const path = require("path");

// Load environment variables from ROOT directory (project root, not api folder)
require("dotenv").config({ path: path.join(__dirname, "../../.env") });

// Check if we're using connection string (Vercel/Production) or individual credentials (Local)
const useConnectionString = process.env.DATABASE_URL;

let pool;

if (useConnectionString) {
  // Production: Use DATABASE_URL from Neon/Vercel
  console.log("🔗 Using DATABASE_URL for PostgreSQL connection");
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false, // Required for Neon
    },
    // Set timezone to Asia/Jakarta (WIB)
    options: "-c timezone=Asia/Jakarta",
  });
} else {
  // Development: Use individual credentials
  console.log("🔗 Using individual DB credentials for PostgreSQL connection");
  pool = new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    // Enable SSL for Neon when DB_SSL_MODE=require
    ssl:
      process.env.DB_SSL_MODE === "require"
        ? { rejectUnauthorized: false }
        : undefined,
    // Set timezone to Asia/Jakarta (WIB)
    options: "-c timezone=Asia/Jakarta",
  });
}

// Test connection on startup
pool.on("connect", () => {
  console.log("✅ Database connected successfully");
});

pool.on("error", (err) => {
  console.error("❌ Unexpected database error:", err);
  process.exit(-1);
});

module.exports = pool;

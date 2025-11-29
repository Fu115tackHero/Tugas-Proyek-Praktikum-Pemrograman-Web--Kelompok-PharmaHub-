/**
 * Reset Database Script
 * Drops existing database and recreates with new schema
 * Run: node api/scripts/resetDb.js
 */

const { Client } = require("pg");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_HOST = process.env.DB_HOST || "localhost";
const DB_PORT = process.env.DB_PORT || 5432;
const DB_NAME = process.env.DB_NAME;

async function resetDatabase() {
  console.log("🔄 Resetting database...\n");

  const defaultClient = new Client({
    user: DB_USER,
    password: DB_PASSWORD,
    host: DB_HOST,
    port: DB_PORT,
    database: "postgres",
  });

  try {
    await defaultClient.connect();
    console.log("✅ Connected to default 'postgres' database");

    // Terminate all connections to the database
    console.log(`🔌 Terminating all connections to '${DB_NAME}'...`);
    await defaultClient.query(`
      SELECT pg_terminate_backend(pg_stat_activity.pid)
      FROM pg_stat_activity
      WHERE pg_stat_activity.datname = '${DB_NAME}'
        AND pid <> pg_backend_pid();
    `);
    console.log("✅ Connections terminated");

    // Drop database if exists
    console.log(`🗑️  Dropping database '${DB_NAME}' if exists...`);
    await defaultClient.query(`DROP DATABASE IF EXISTS "${DB_NAME}";`);
    console.log(`✅ Database '${DB_NAME}' dropped`);

    // Create database
    console.log(`📦 Creating database '${DB_NAME}'...`);
    await defaultClient.query(`CREATE DATABASE "${DB_NAME}";`);
    console.log(`✅ Database '${DB_NAME}' created`);

    await defaultClient.end();

    console.log("\n🎉 Database reset complete!");
    console.log(
      "📌 Next step: Run 'node api/scripts/setupDb.js' to create tables"
    );
  } catch (error) {
    console.error("❌ Error resetting database:", error.message);
    throw error;
  }
}

resetDatabase().catch((error) => {
  console.error(error);
  process.exit(1);
});

/**
 * Database Setup Script
 * Automatically creates database and tables for PharmaHub
 *
 * Usage: node api/scripts/setupDb.js
 */

const { Client, Pool } = require("pg");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

// Database configuration from environment
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_HOST = process.env.DB_HOST || "localhost";
const DB_PORT = process.env.DB_PORT || 5432;
const DB_NAME = process.env.DB_NAME;

// Validate environment variables
if (!DB_USER || !DB_PASSWORD || !DB_NAME) {
  console.error("❌ Missing required environment variables:");
  console.error("   DB_USER, DB_PASSWORD, DB_NAME are required");
  console.error("   Please check your .env file");
  process.exit(1);
}

// SQL Schema - Replace this with your complete schema
const SCHEMA = `
-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  address TEXT,
  profile_photo_url TEXT,
  role VARCHAR(50) DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  stock INTEGER DEFAULT 0,
  category VARCHAR(100),
  image_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  order_id VARCHAR(100) UNIQUE NOT NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  total_amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  payment_method VARCHAR(50),
  payment_status VARCHAR(50) DEFAULT 'pending',
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50) NOT NULL,
  customer_address TEXT,
  notes TEXT,
  admin_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
  product_name VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  order_id VARCHAR(100),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_id ON orders(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
`;

/**
 * Step 1: Check if database exists, create if not
 */
async function setupDatabase() {
  console.log("🔍 Step 1: Checking if database exists...");

  const defaultClient = new Client({
    user: DB_USER,
    password: DB_PASSWORD,
    host: DB_HOST,
    port: DB_PORT,
    database: "postgres", // Connect to default database
  });

  try {
    await defaultClient.connect();
    console.log("✅ Connected to default 'postgres' database");

    // Check if database exists
    const checkDbQuery = `
      SELECT 1 FROM pg_database WHERE datname = $1;
    `;
    const result = await defaultClient.query(checkDbQuery, [DB_NAME]);

    if (result.rows.length === 0) {
      // Database doesn't exist, create it
      console.log(`📦 Database '${DB_NAME}' does not exist. Creating...`);
      await defaultClient.query(`CREATE DATABASE "${DB_NAME}";`);
      console.log(`✅ Database '${DB_NAME}' created successfully`);
    } else {
      console.log(`✅ Database '${DB_NAME}' already exists`);
    }
  } catch (error) {
    console.error("❌ Error in database setup:", error.message);
    throw error;
  } finally {
    await defaultClient.end();
    console.log("🔌 Disconnected from 'postgres' database");
  }
}

/**
 * Step 2 & 3: Connect to target database and create tables
 */
async function setupTables() {
  console.log("\n🔍 Step 2: Connecting to target database...");

  const pool = new Pool({
    user: DB_USER,
    password: DB_PASSWORD,
    host: DB_HOST,
    port: DB_PORT,
    database: DB_NAME,
  });

  try {
    // Test connection
    const client = await pool.connect();
    console.log(`✅ Connected to '${DB_NAME}' database`);
    client.release();

    console.log("\n🔍 Step 3: Creating tables...");

    // Execute schema
    await pool.query(SCHEMA);

    console.log("✅ All tables created successfully");
    console.log("\n📋 Tables created:");
    console.log("   - users");
    console.log("   - products");
    console.log("   - orders");
    console.log("   - order_items");
    console.log("   - notifications");
    console.log("\n✅ Database and Tables setup complete!");
  } catch (error) {
    console.error("❌ Error creating tables:", error.message);
    throw error;
  } finally {
    await pool.end();
    console.log("🔌 Disconnected from target database");
  }
}

/**
 * Main execution
 */
async function main() {
  console.log("🚀 PharmaHub Database Setup");
  console.log("=".repeat(50));
  console.log(`📍 Host: ${DB_HOST}:${DB_PORT}`);
  console.log(`📍 Database: ${DB_NAME}`);
  console.log(`📍 User: ${DB_USER}`);
  console.log("=".repeat(50) + "\n");

  try {
    await setupDatabase();
    await setupTables();

    console.log("\n" + "=".repeat(50));
    console.log("🎉 Setup completed successfully!");
    console.log("=".repeat(50));
    process.exit(0);
  } catch (error) {
    console.error("\n" + "=".repeat(50));
    console.error("💥 Setup failed!");
    console.error("=".repeat(50));
    console.error(error);
    process.exit(1);
  }
}

// Run setup
main();

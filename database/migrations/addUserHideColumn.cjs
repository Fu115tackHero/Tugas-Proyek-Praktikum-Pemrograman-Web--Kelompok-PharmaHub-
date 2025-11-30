require("dotenv").config({ path: "../.env" });
require("dotenv").config({ path: ".env" });

const { Pool } = require("pg");

// Create PostgreSQL connection pool using individual credentials
const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "admin",
  database: process.env.DB_NAME || "pharmahub_db",
});

async function addUserHideColumn() {
  console.log(
    "\n🔧 Adding is_hidden_from_user column to order_status_history...\n"
  );

  try {
    // Add column
    await pool.query(`
      ALTER TABLE order_status_history
      ADD COLUMN IF NOT EXISTS is_hidden_from_user BOOLEAN DEFAULT FALSE;
    `);
    console.log("✅ Column is_hidden_from_user added");

    // Create index
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_order_status_history_hidden 
      ON order_status_history(order_id, is_hidden_from_user);
    `);
    console.log("✅ Index idx_order_status_history_hidden created");

    // Add comment
    await pool.query(`
      COMMENT ON COLUMN order_status_history.is_hidden_from_user IS 
      'TRUE when user deletes order from their history view. Independent from orders.is_archived (admin archive).';
    `);
    console.log("✅ Column comment added");

    // Verify
    const result = await pool.query(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns 
      WHERE table_name = 'order_status_history' 
      AND column_name = 'is_hidden_from_user'
    `);

    if (result.rows.length > 0) {
      console.log("\n✅ Migration successful!");
      console.log("Column details:", result.rows[0]);
    } else {
      console.log("\n❌ Column not found after migration");
    }
  } catch (error) {
    console.error("❌ Migration error:", error.message);
  } finally {
    await pool.end();
  }
}

addUserHideColumn();

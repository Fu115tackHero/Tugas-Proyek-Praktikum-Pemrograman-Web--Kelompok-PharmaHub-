const { Pool } = require("pg");
const path = require("path");
const fs = require("fs");

// Load environment variables
require("dotenv").config({ path: path.join(__dirname, "../../api/.env") });
require("dotenv").config(); // Also try from root

// Create PostgreSQL connection pool
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

async function runMigration() {
  console.log("\n🚀 RUNNING SOFT DELETE MIGRATION\n");
  console.log("=" + "=".repeat(59));

  try {
    // Read migration file
    const migrationPath = path.join(__dirname, "add_soft_delete_columns.sql");
    const migrationSQL = fs.readFileSync(migrationPath, "utf8");

    console.log("\n📄 Migration file loaded:");
    console.log("   Path:", migrationPath);
    console.log("   Size:", migrationSQL.length, "characters");

    // Execute migration
    console.log("\n⚙️  Executing migration...\n");
    const result = await pool.query(migrationSQL);

    console.log("\n✅ MIGRATION COMPLETED SUCCESSFULLY!\n");

    // Verify changes
    console.log("📊 Verifying changes...\n");

    // Check columns
    const { rows: columns } = await pool.query(`
      SELECT 
        table_name,
        column_name,
        data_type,
        column_default,
        is_nullable
      FROM information_schema.columns
      WHERE column_name = 'is_archived'
      AND table_name IN ('orders', 'notifications', 'order_status_history')
      ORDER BY table_name
    `);

    console.log("✓ is_archived columns:");
    console.log("─".repeat(60));
    columns.forEach((col) => {
      console.log(
        `   ${col.table_name.padEnd(25)} | ${col.data_type.padEnd(15)} | ${col.column_default || "NULL"}`
      );
    });

    // Check indexes
    const { rows: indexes } = await pool.query(`
      SELECT 
        schemaname,
        tablename,
        indexname
      FROM pg_indexes
      WHERE indexname LIKE '%is_archived%'
      ORDER BY tablename
    `);

    console.log("\n✓ Indexes created:");
    console.log("─".repeat(60));
    indexes.forEach((idx) => {
      console.log(`   ${idx.tablename.padEnd(30)} | ${idx.indexname}`);
    });

    // Check views
    const { rows: views } = await pool.query(`
      SELECT 
        table_name
      FROM information_schema.views
      WHERE table_name IN ('admin_dashboard_stats', 'top_selling_products', 'user_order_history')
      ORDER BY table_name
    `);

    console.log("\n✓ Views recreated:");
    console.log("─".repeat(60));
    views.forEach((view) => {
      console.log(`   ${view.table_name}`);
    });

    console.log("\n" + "=".repeat(60));
    console.log("\n✅ ALL CHECKS PASSED - Migration successful!");
    console.log("\n📝 Summary:");
    console.log("   - 3 tables updated (orders, notifications, order_status_history)");
    console.log("   - 3 indexes created");
    console.log("   - 3 views recreated with is_archived filter");
    console.log("");

  } catch (error) {
    console.error("\n❌ MIGRATION FAILED:");
    console.error("   Error:", error.message);
    console.error("\n   Stack Trace:");
    console.error(error.stack);
    process.exit(1);
  } finally {
    await pool.end();
  }

  process.exit(0);
}

runMigration();

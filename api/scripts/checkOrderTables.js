require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME,
});

(async () => {
  try {
    console.log(
      "🔍 Checking database tables related to orders, notifications, history...\n"
    );
    console.log("=".repeat(80));

    // Get all tables
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

    console.log("\n📊 All Tables in Database:\n");
    tablesResult.rows.forEach((row) => {
      console.log(`   - ${row.table_name}`);
    });

    // Check if orders-related tables exist
    const orderTables = [
      "orders",
      "order_items",
      "notifications",
      "order_history",
    ];
    console.log("\n\n🔎 Checking for Order-Related Tables:\n");

    for (const tableName of orderTables) {
      const check = await pool.query(
        `
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        )
      `,
        [tableName]
      );

      if (check.rows[0].exists) {
        console.log(`   ✅ ${tableName} - EXISTS`);

        // Get column info
        const cols = await pool.query(
          `
          SELECT column_name, data_type, is_nullable
          FROM information_schema.columns
          WHERE table_name = $1
          ORDER BY ordinal_position
        `,
          [tableName]
        );

        console.log(`      Columns (${cols.rows.length}):`);
        cols.rows.forEach((col) => {
          console.log(
            `      - ${col.column_name}: ${col.data_type} ${
              col.is_nullable === "NO" ? "(NOT NULL)" : ""
            }`
          );
        });

        // Get row count
        const count = await pool.query(
          `SELECT COUNT(*) as count FROM ${tableName}`
        );
        console.log(`      Rows: ${count.rows[0].count}\n`);
      } else {
        console.log(`   ❌ ${tableName} - NOT EXISTS\n`);
      }
    }

    console.log("=".repeat(80));
    console.log("✅ Database check complete!\n");

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error checking database:", error.message);
    await pool.end();
    process.exit(1);
  }
})();

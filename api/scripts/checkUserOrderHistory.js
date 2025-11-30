require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

async function checkUserOrderHistory() {
  console.log("\n🔍 Checking user_order_history table...\n");

  try {
    const columnsQuery = `
      SELECT 
        column_name,
        data_type,
        is_nullable
      FROM information_schema.columns
      WHERE table_name = 'user_order_history'
      ORDER BY ordinal_position;
    `;
    const columnsResult = await pool.query(columnsQuery);

    console.log("   Columns:");
    columnsResult.rows.forEach((col) => {
      console.log(
        `   - ${col.column_name}: ${col.data_type}${
          col.is_nullable === "NO" ? " (NOT NULL)" : ""
        }`
      );
    });

    const countResult = await pool.query(
      "SELECT COUNT(*) FROM user_order_history"
    );
    console.log(`   Rows: ${countResult.rows[0].count}\n`);

    // Check sample data if exists
    const sampleResult = await pool.query(
      "SELECT * FROM user_order_history LIMIT 3"
    );
    if (sampleResult.rows.length > 0) {
      console.log("   Sample data:");
      sampleResult.rows.forEach((row, idx) => {
        console.log(`   ${idx + 1}.`, JSON.stringify(row, null, 2));
      });
    } else {
      console.log("   No data yet in this table.");
    }

    console.log("\n✅ Check complete!");
  } catch (error) {
    console.error("❌ Error checking user_order_history:", error.message);
  } finally {
    await pool.end();
  }
}

checkUserOrderHistory();

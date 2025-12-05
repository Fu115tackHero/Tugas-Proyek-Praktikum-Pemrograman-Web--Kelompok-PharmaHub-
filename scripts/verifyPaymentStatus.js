/**
 * Verify Payment Status Migration
 * Quick check to ensure migration worked correctly
 */

const pool = require("../config/database");

async function verifyMigration() {
  try {
    console.log("🔍 Verifying payment status migration...\n");

    // Check all orders
    const query = `
      SELECT 
        order_number,
        payment_method,
        payment_status,
        order_status,
        total_amount,
        TO_CHAR(created_at, 'DD Mon YYYY') as created_date
      FROM orders
      ORDER BY created_at DESC
      LIMIT 20
    `;

    const result = await pool.query(query);

    console.log("📊 Recent Orders (Last 20):\n");
    console.table(result.rows);

    // Count by status
    const countQuery = `
      SELECT 
        payment_status,
        payment_method,
        COUNT(*) as total,
        SUM(total_amount) as total_revenue
      FROM orders
      GROUP BY payment_status, payment_method
      ORDER BY payment_status, payment_method
    `;

    const counts = await pool.query(countQuery);
    console.log("\n📈 Summary by Payment Status:\n");
    console.table(counts.rows);

    console.log("\n✅ Verification complete!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

verifyMigration();

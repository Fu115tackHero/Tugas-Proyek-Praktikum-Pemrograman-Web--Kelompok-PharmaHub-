const pool = require("../config/database");

async function checkMultiProductOrders() {
  console.log("🔍 Checking orders with multiple products\n");

  try {
    const { rows } = await pool.query(`
      SELECT 
        o.order_number,
        o.customer_name,
        COUNT(oi.order_item_id) as item_count,
        SUM(oi.quantity) as total_quantity
      FROM orders o
      JOIN order_items oi ON o.order_id = oi.order_id
      WHERE o.order_status = 'completed'
      GROUP BY o.order_id, o.order_number, o.customer_name
      ORDER BY item_count DESC
      LIMIT 10
    `);

    console.log("📦 Orders with products:");
    console.log("─".repeat(70));
    console.log(
      "Order Number".padEnd(25) +
        "Customer".padEnd(20) +
        "Products".padEnd(12) +
        "Total Qty"
    );
    console.log("─".repeat(70));

    rows.forEach((row) => {
      console.log(
        row.order_number.padEnd(25) +
          row.customer_name.padEnd(20) +
          row.item_count.toString().padEnd(12) +
          row.total_quantity
      );
    });

    console.log("─".repeat(70));
    console.log(`\n✅ Found ${rows.length} completed orders`);

    const maxProducts = rows.length > 0 ? rows[0].item_count : 0;
    if (maxProducts > 1) {
      console.log(`📊 Maximum products in one order: ${maxProducts}`);
    } else if (maxProducts === 1) {
      console.log("ℹ️  All orders have only 1 product each");
    } else {
      console.log("⚠️  No completed orders found");
    }

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    await pool.end();
    process.exit(1);
  }
}

checkMultiProductOrders();

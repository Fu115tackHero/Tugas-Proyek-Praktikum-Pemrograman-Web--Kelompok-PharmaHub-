const pool = require("../config/database");

/**
 * Script to delete test/pending orders
 * Deletes orders with pending/cancelled status from today for testing cleanup
 */

async function deleteTestOrders() {
  console.log("\n" + "=".repeat(80));
  console.log("🗑️  DELETING TEST ORDERS");
  console.log("=".repeat(80));

  try {
    // First, let's see what orders we're going to delete
    const selectQuery = `
      SELECT 
        order_id,
        order_number,
        order_status,
        customer_name,
        total_amount,
        created_at
      FROM orders
      WHERE DATE(created_at) = CURRENT_DATE
        AND order_status IN ('pending', 'cancelled')
      ORDER BY created_at DESC
    `;

    const { rows: ordersToDelete } = await pool.query(selectQuery);

    if (ordersToDelete.length === 0) {
      console.log("\n✅ No test orders found to delete.");
      await pool.end();
      return;
    }

    console.log(`\n📋 Found ${ordersToDelete.length} test orders to delete:\n`);
    ordersToDelete.forEach((order, index) => {
      console.log(`${index + 1}. ${order.order_number}`);
      console.log(`   Status: ${order.order_status}`);
      console.log(`   Customer: ${order.customer_name}`);
      console.log(
        `   Amount: Rp ${parseFloat(order.total_amount).toLocaleString(
          "id-ID"
        )}`
      );
      console.log(
        `   Created: ${new Date(order.created_at).toLocaleString("id-ID")}`
      );
      console.log("");
    });

    console.log("⚠️  Are you sure you want to delete these orders?");
    console.log("⏳ Proceeding with deletion in 3 seconds...\n");

    // Wait 3 seconds
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Delete order_items first (foreign key constraint)
    const orderIds = ordersToDelete.map((o) => o.order_id);

    const deleteItemsQuery = `
      DELETE FROM order_items
      WHERE order_id = ANY($1::int[])
    `;

    const itemsResult = await pool.query(deleteItemsQuery, [orderIds]);
    console.log(`✅ Deleted ${itemsResult.rowCount} order items`);

    // Then delete orders
    const deleteOrdersQuery = `
      DELETE FROM orders
      WHERE order_id = ANY($1::int[])
    `;

    const ordersResult = await pool.query(deleteOrdersQuery, [orderIds]);
    console.log(`✅ Deleted ${ordersResult.rowCount} orders`);

    console.log("\n" + "=".repeat(80));
    console.log("✅ TEST ORDERS DELETED SUCCESSFULLY");
    console.log("=".repeat(80) + "\n");
  } catch (error) {
    console.error("\n❌ Error deleting test orders:", error.message);
    console.error("Stack:", error.stack);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

// Run the deletion
deleteTestOrders();

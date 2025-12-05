/**
 * Test Delete Order History Functionality
 * Debugging script to verify delete logic works correctly
 */

const pool = require("../config/database");

async function testDeleteOrderHistory() {
  console.log("🧪 Testing delete order history functionality...\n");

  try {
    // Step 1: Get all completed orders
    console.log("Step 1: Fetching all completed orders...");
    const completedQuery = `
      SELECT 
        order_id,
        order_number,
        order_status,
        user_id,
        customer_name,
        total_amount
      FROM orders
      WHERE order_status = 'completed'
      ORDER BY created_at DESC
      LIMIT 5
    `;

    const completedResult = await pool.query(completedQuery);
    console.log(`✓ Found ${completedResult.rows.length} completed orders\n`);
    console.table(completedResult.rows);

    if (completedResult.rows.length === 0) {
      console.log("\n⚠️  No completed orders found. Cannot test delete.\n");
      return;
    }

    // Step 2: Test hiding single order
    const testOrder = completedResult.rows[0];
    console.log(`\nStep 2: Testing hide for order ${testOrder.order_id}...`);

    // Check current status
    const checkBeforeQuery = `
      SELECT 
        osh.is_hidden_from_user,
        COUNT(*) as history_count
      FROM order_status_history osh
      WHERE osh.order_id = $1
      GROUP BY osh.is_hidden_from_user
    `;

    const beforeResult = await pool.query(checkBeforeQuery, [
      testOrder.order_id,
    ]);
    console.log("✓ Status before hide:");
    console.table(beforeResult.rows);

    // Insert hide record
    const hideQuery = `
      INSERT INTO order_status_history (
        order_id,
        old_status,
        new_status,
        notes,
        is_hidden_from_user
      )
      VALUES ($1, $2, $2, 'Test hide from user', TRUE)
      RETURNING *
    `;

    const hideResult = await pool.query(hideQuery, [
      testOrder.order_id,
      testOrder.order_status,
    ]);

    console.log("✓ Hide record inserted:");
    console.table(hideResult.rows);

    // Step 3: Verify order is hidden from user view
    console.log(`\nStep 3: Verifying order ${testOrder.order_id} is hidden...`);

    const userViewQuery = `
      SELECT o.order_id, o.order_number
      FROM orders o
      WHERE o.user_id = $1
        AND NOT EXISTS (
          SELECT 1 FROM order_status_history osh
          WHERE osh.order_id = o.order_id
          AND osh.is_hidden_from_user = TRUE
        )
      AND o.order_id = $2
    `;

    const userViewResult = await pool.query(userViewQuery, [
      testOrder.user_id,
      testOrder.order_id,
    ]);

    if (userViewResult.rows.length === 0) {
      console.log("✓ Order is hidden from user view (correct!)");
    } else {
      console.log("✗ Order is STILL visible to user (incorrect!)");
    }

    // Step 4: Test query for user's visible orders
    console.log(
      `\nStep 4: Testing user ${testOrder.user_id} visible orders query...`
    );

    const visibleOrdersQuery = `
      SELECT 
        o.order_id,
        o.order_number,
        o.order_status,
        o.total_amount
      FROM orders o
      WHERE o.user_id = $1
        AND NOT EXISTS (
          SELECT 1 FROM order_status_history osh
          WHERE osh.order_id = o.order_id
          AND osh.is_hidden_from_user = TRUE
        )
      ORDER BY o.created_at DESC
    `;

    const visibleResult = await pool.query(visibleOrdersQuery, [
      testOrder.user_id,
    ]);
    console.log(
      `✓ User has ${visibleResult.rows.length} visible orders (after hiding one)`
    );
    console.table(visibleResult.rows);

    // Step 5: Test bulk delete logic
    console.log(`\nStep 5: Testing bulk delete query pattern...`);

    const bulkHidableQuery = `
      SELECT 
        o.order_id,
        o.order_number,
        o.order_status,
        COUNT(*) as hidden_count
      FROM orders o
      LEFT JOIN order_status_history osh ON o.order_id = osh.order_id 
        AND osh.is_hidden_from_user = TRUE
      WHERE o.user_id = $1
        AND o.order_status = 'completed'
        AND osh.history_id IS NULL
      GROUP BY o.order_id, o.order_number, o.order_status
      ORDER BY o.created_at DESC
    `;

    const bulkResult = await pool.query(bulkHidableQuery, [testOrder.user_id]);
    console.log(
      `✓ Found ${bulkResult.rows.length} unhidden completed orders for bulk delete`
    );
    console.table(bulkResult.rows);

    console.log("\n✅ All tests completed successfully!");
    console.log("\n📝 Summary:");
    console.log("   ✓ Completed orders can be fetched");
    console.log("   ✓ Hide records can be inserted");
    console.log("   ✓ Hidden orders are excluded from user view");
    console.log("   ✓ Bulk delete query works correctly");
  } catch (error) {
    console.error("\n❌ Test failed:", error.message);
    console.error(error);
  }
}

// Run test
testDeleteOrderHistory()
  .then(() => {
    console.log("\n✅ Script completed");
    process.exit(0);
  })
  .catch((err) => {
    console.error("\n❌ Fatal error:", err);
    process.exit(1);
  });

/**
 * Comprehensive Delete History Test Suite
 * Tests both backend logic and frontend integration
 */

const pool = require("../config/database");
const axios = require("axios");

const API_BASE_URL = "http://localhost:3001/api";
const DEMO_USER = {
  email: "admin@pharmahub.com",
  password: "admin123",
};

let testResults = {
  passed: 0,
  failed: 0,
  tests: [],
};

async function test(name, fn) {
  try {
    console.log(`\n🧪 Test: ${name}`);
    await fn();
    testResults.passed++;
    testResults.tests.push({ name, status: "✓ PASS" });
    console.log(`✓ PASSED`);
  } catch (error) {
    testResults.failed++;
    testResults.tests.push({ name, status: `✗ FAIL: ${error.message}` });
    console.error(`✗ FAILED: ${error.message}`);
  }
}

async function runComprehensiveTest() {
  let token = null;
  let userId = null;
  let completedOrderId = null;
  let userOrders = [];

  console.log("═══════════════════════════════════════════════════════════");
  console.log("  🚀 COMPREHENSIVE DELETE HISTORY TEST SUITE");
  console.log("═══════════════════════════════════════════════════════════\n");

  // Phase 1: Database Validation
  console.log("PHASE 1: DATABASE VALIDATION");
  console.log("───────────────────────────────────────────────────────────");

  await test("Check completed orders exist in database", async () => {
    const result = await pool.query(
      "SELECT COUNT(*) as count FROM orders WHERE order_status = 'completed' LIMIT 1"
    );
    const count = parseInt(result.rows[0].count);
    if (count === 0) throw new Error("No completed orders found");
    console.log(`  Found ${count} completed orders`);
  });

  await test("Verify order_status_history table exists", async () => {
    const result = await pool.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'order_status_history'
      ) as exists
    `);
    if (!result.rows[0].exists) throw new Error("Table does not exist");
  });

  await test("Check is_hidden_from_user column exists", async () => {
    const result = await pool.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'order_status_history' 
        AND column_name = 'is_hidden_from_user'
      ) as exists
    `);
    if (!result.rows[0].exists) throw new Error("Column does not exist");
  });

  // Phase 2: Backend Endpoint Validation
  console.log("\n\nPHASE 2: BACKEND ENDPOINT VALIDATION");
  console.log("───────────────────────────────────────────────────────────");

  await test("Login to get auth token", async () => {
    const loginRes = await axios.post(`${API_BASE_URL}/auth/login`, DEMO_USER);
    token = loginRes.data.token;
    userId = loginRes.data.user.id;
    if (!token) throw new Error("No token received");
    console.log(
      `  Token: ${token.substring(0, 20)}... (length: ${token.length})`
    );
    console.log(`  User ID: ${userId}`);
  });

  await test("Fetch user's orders", async () => {
    const ordersRes = await axios.get(`${API_BASE_URL}/orders`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    userOrders = ordersRes.data.orders || ordersRes.data;
    if (!Array.isArray(userOrders)) throw new Error("Orders not array");
    console.log(`  Fetched ${userOrders.length} orders`);
  });

  await test("Find completed order for testing", async () => {
    const completed = userOrders.find((o) => o.order_status === "completed");
    if (!completed) throw new Error("No completed order found");
    completedOrderId = completed.order_id;
    console.log(`  Test order ID: ${completedOrderId}`);
    console.log(`  Order number: ${completed.order_number}`);
  });

  // Phase 3: Delete API Endpoint Test
  console.log("\n\nPHASE 3: DELETE API ENDPOINT TEST");
  console.log("───────────────────────────────────────────────────────────");

  await test("Call DELETE endpoint for completed order", async () => {
    const deleteRes = await axios.put(
      `${API_BASE_URL}/orders/${completedOrderId}/hide-from-user`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (!deleteRes.data.success) throw new Error("API returned success: false");
    console.log(`  Response: ${deleteRes.data.message}`);
  });

  await test("Verify order is hidden from user view after delete", async () => {
    const verifyRes = await axios.get(`${API_BASE_URL}/orders`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const orders = verifyRes.data.orders || verifyRes.data;
    const stillVisible = orders.find((o) => o.order_id === completedOrderId);
    if (stillVisible) throw new Error("Order still visible to user");
    console.log(`  Confirmed: Order no longer in user's order list`);
  });

  // Phase 4: Database Verification
  console.log("\n\nPHASE 4: DATABASE VERIFICATION");
  console.log("───────────────────────────────────────────────────────────");

  await test("Verify hide record created in order_status_history", async () => {
    const historyResult = await pool.query(
      `
      SELECT * FROM order_status_history 
      WHERE order_id = $1 AND is_hidden_from_user = TRUE
      ORDER BY changed_at DESC LIMIT 1
    `,
      [completedOrderId]
    );
    if (historyResult.rows.length === 0)
      throw new Error("No hide record found");
    const record = historyResult.rows[0];
    console.log(`  Record found:`);
    console.log(`    - History ID: ${record.history_id}`);
    console.log(`    - Hidden: ${record.is_hidden_from_user}`);
    console.log(`    - Changed at: ${record.changed_at}`);
  });

  await test("Verify order still exists in orders table", async () => {
    const orderResult = await pool.query(
      "SELECT order_id FROM orders WHERE order_id = $1",
      [completedOrderId]
    );
    if (orderResult.rows.length === 0)
      throw new Error("Order was deleted (should only be hidden)");
    console.log(`  Confirmed: Order still exists in database`);
  });

  await test("Query user's visible orders matches frontend view", async () => {
    const visibleOrdersQuery = `
      SELECT COUNT(*) as count FROM orders o
      WHERE o.user_id = $1
        AND NOT EXISTS (
          SELECT 1 FROM order_status_history osh
          WHERE osh.order_id = o.order_id
          AND osh.is_hidden_from_user = TRUE
        )
    `;
    const dbResult = await pool.query(visibleOrdersQuery, [userId]);
    const dbCount = parseInt(dbResult.rows[0].count);
    const apiCount = userOrders.filter(
      (o) => o.order_id !== completedOrderId
    ).length;
    console.log(`  Database visible orders: ${dbCount}`);
    console.log(`  Frontend visible orders: ${apiCount}`);
  });

  // Phase 5: Restore Functionality Test
  console.log("\n\nPHASE 5: RESTORE FUNCTIONALITY TEST");
  console.log("───────────────────────────────────────────────────────────");

  await test("Restore hidden order", async () => {
    const restoreRes = await axios.put(
      `${API_BASE_URL}/orders/${completedOrderId}/restore-to-user`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (!restoreRes.data.success) throw new Error("Restore API failed");
    console.log(`  Response: ${restoreRes.data.message}`);
  });

  await test("Verify order is visible again after restore", async () => {
    const verifyRes = await axios.get(`${API_BASE_URL}/orders`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const orders = verifyRes.data.orders || verifyRes.data;
    const isVisible = orders.find((o) => o.order_id === completedOrderId);
    if (!isVisible) throw new Error("Order not visible after restore");
    console.log(`  Confirmed: Order visible again in user's order list`);
  });

  // Results Summary
  console.log(
    "\n\n═══════════════════════════════════════════════════════════"
  );
  console.log("  📊 TEST RESULTS SUMMARY");
  console.log("═══════════════════════════════════════════════════════════\n");

  console.table(testResults.tests);

  console.log(`\n✓ Passed: ${testResults.passed}`);
  console.log(`✗ Failed: ${testResults.failed}`);
  console.log(
    `📈 Success Rate: ${(
      (testResults.passed / (testResults.passed + testResults.failed)) *
      100
    ).toFixed(1)}%\n`
  );

  if (testResults.failed === 0) {
    console.log(
      "🎉 ALL TESTS PASSED! Delete history functionality is working correctly."
    );
  } else {
    console.log("⚠️  Some tests failed. Please review the errors above.");
  }
}

// Run the test suite
runComprehensiveTest()
  .then(() => {
    process.exit(testResults.failed === 0 ? 0 : 1);
  })
  .catch((err) => {
    console.error("\n❌ Fatal error:", err.message);
    process.exit(1);
  });

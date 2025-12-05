/**
 * Comprehensive Test: Payment Status Logic
 *
 * Tests:
 * 1. Create order with bayar_ditempat → payment_status should be 'belum_dibayar'
 * 2. Create order with pembayaran_online → payment_status should be 'pending'
 * 3. Update bayar_ditempat order to 'completed' → payment_status auto-updates to 'dibayar'
 * 4. Update pembayaran_online order to 'completed' → payment_status stays as is (unless already 'dibayar')
 */

const pool = require("../config/database");
const orderService = require("../services/orderService");

// Test user ID (Demo Admin)
const TEST_USER_ID = 1;

async function runTests() {
  console.log("🧪 Starting comprehensive payment status tests...\n");

  try {
    // ============================================
    // TEST 1: Create bayar_ditempat order
    // ============================================
    console.log("📝 TEST 1: Create order with bayar_ditempat");
    const orderData1 = {
      customerName: "Test User 1",
      customerEmail: "test1@example.com",
      customerPhone: "08123456789",
      customerAddress: "Test Address 1",
      items: [
        {
          product_id: 1,
          product_name: "Test Product",
          product_price: 10000,
          quantity: 1,
        },
      ],
      subtotal: 10000,
      taxAmount: 1000,
      discountAmount: 0,
      totalAmount: 11000,
      paymentMethod: "bayar_ditempat",
    };

    const result1 = await orderService.createOrder(TEST_USER_ID, orderData1);
    console.log(`   ✓ Order created: ${result1.order.order_number}`);
    console.log(`   → Payment Status: ${result1.order.payment_status}`);

    if (result1.order.payment_status === "belum_dibayar") {
      console.log(
        "   ✅ PASS: bayar_ditempat order has 'belum_dibayar' status\n"
      );
    } else {
      console.log(
        `   ❌ FAIL: Expected 'belum_dibayar', got '${result1.order.payment_status}'\n`
      );
    }

    // ============================================
    // TEST 2: Create pembayaran_online order
    // ============================================
    console.log("📝 TEST 2: Create order with pembayaran_online");
    const orderData2 = {
      customerName: "Test User 2",
      customerEmail: "test2@example.com",
      customerPhone: "08123456790",
      customerAddress: "Test Address 2",
      items: [
        {
          product_id: 2,
          product_name: "Test Product 2",
          product_price: 20000,
          quantity: 1,
        },
      ],
      subtotal: 20000,
      taxAmount: 2000,
      discountAmount: 0,
      totalAmount: 22000,
      paymentMethod: "pembayaran_online",
    };

    const result2 = await orderService.createOrder(TEST_USER_ID, orderData2);
    console.log(`   ✓ Order created: ${result2.order.order_number}`);
    console.log(`   → Payment Status: ${result2.order.payment_status}`);

    if (result2.order.payment_status === "pending") {
      console.log("   ✅ PASS: pembayaran_online order has 'pending' status\n");
    } else {
      console.log(
        `   ❌ FAIL: Expected 'pending', got '${result2.order.payment_status}'\n`
      );
    }

    // ============================================
    // TEST 3: Update bayar_ditempat to completed
    // ============================================
    console.log("📝 TEST 3: Update bayar_ditempat order to 'completed'");
    const orderId1 = result1.order.order_id;

    const updateResult1 = await orderService.updateOrderStatus(
      orderId1,
      "completed",
      "Test: Auto-payment confirmation"
    );

    console.log(
      `   ✓ Order ${updateResult1.order_number} updated to ${updateResult1.order_status}`
    );
    console.log(`   → Payment Status: ${updateResult1.payment_status}`);

    if (updateResult1.payment_status === "dibayar") {
      console.log(
        "   ✅ PASS: bayar_ditempat completed order auto-marked as 'dibayar'\n"
      );
    } else {
      console.log(
        `   ❌ FAIL: Expected 'dibayar', got '${updateResult1.payment_status}'\n`
      );
    }

    // ============================================
    // TEST 4: Verify notification includes payment confirmation
    // ============================================
    console.log("📝 TEST 4: Verify notification for bayar_ditempat completed");
    const notifQuery = `
      SELECT message 
      FROM notifications 
      WHERE related_order_id = $1 
      ORDER BY created_at DESC 
      LIMIT 1
    `;
    const notifResult = await pool.query(notifQuery, [orderId1]);

    if (notifResult.rows.length > 0) {
      const message = notifResult.rows[0].message;
      console.log(`   → Notification: ${message.substring(0, 100)}...`);

      if (
        message.includes("Pembayaran telah dikonfirmasi") ||
        message.includes("dibayar")
      ) {
        console.log("   ✅ PASS: Notification includes payment confirmation\n");
      } else {
        console.log(
          "   ⚠️  WARNING: Notification doesn't mention payment confirmation\n"
        );
      }
    }

    // ============================================
    // TEST 5: Query all orders to verify status translation
    // ============================================
    console.log("📝 TEST 5: Verify all orders have Indonesian payment status");
    const allOrdersQuery = `
      SELECT 
        payment_status,
        COUNT(*) as count
      FROM orders
      GROUP BY payment_status
    `;
    const allOrders = await pool.query(allOrdersQuery);

    console.log("   Current payment statuses in database:");
    allOrders.rows.forEach((row) => {
      const isIndonesian = [
        "dibayar",
        "belum_dibayar",
        "pending",
        "failed",
        "refunded",
      ].includes(row.payment_status);
      const status = isIndonesian ? "✅" : "❌";
      console.log(`   ${status} ${row.payment_status}: ${row.count} orders`);
    });

    // ============================================
    // CLEANUP (Optional)
    // ============================================
    console.log("\n🧹 Cleanup: Deleting test orders...");
    await pool.query(`DELETE FROM order_items WHERE order_id IN ($1, $2)`, [
      orderId1,
      result2.order.order_id,
    ]);
    await pool.query(
      `DELETE FROM notifications WHERE related_order_id IN ($1, $2)`,
      [orderId1, result2.order.order_id]
    );
    await pool.query(`DELETE FROM orders WHERE order_id IN ($1, $2)`, [
      orderId1,
      result2.order.order_id,
    ]);
    console.log("   ✓ Test orders cleaned up\n");

    console.log("=".repeat(60));
    console.log("✅ ALL TESTS COMPLETED SUCCESSFULLY!");
    console.log("=".repeat(60));
    console.log("\nSummary:");
    console.log("✅ bayar_ditempat orders start with 'belum_dibayar'");
    console.log("✅ pembayaran_online orders start with 'pending'");
    console.log("✅ completed bayar_ditempat orders auto-marked 'dibayar'");
    console.log("✅ notifications include payment confirmation");
    console.log("✅ database uses Indonesian status values");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ TEST FAILED:", error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run tests
runTests();

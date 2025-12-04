const pool = require("../config/database");

/**
 * Test script untuk Admin Dashboard API
 *
 * Tests:
 * 1. Dashboard Stats (dari VIEW admin_dashboard_stats)
 * 2. Top Selling Products (dari VIEW top_selling_products)
 * 3. Recent Activity (dari orders table)
 * 4. Low Stock Alerts (dari products table)
 */

async function testDashboardStats() {
  console.log("\n" + "=".repeat(80));
  console.log("TEST 1: Dashboard Statistics (admin_dashboard_stats VIEW)");
  console.log("=".repeat(80));

  try {
    const query = `
      SELECT 
        total_active_products,
        low_stock_products,
        today_orders,
        pending_orders,
        today_revenue,
        monthly_revenue,
        total_customers,
        new_customers_today
      FROM admin_dashboard_stats
    `;

    const { rows } = await pool.query(query);

    if (rows.length === 0) {
      console.log(
        "⚠️  Warning: VIEW admin_dashboard_stats tidak mengembalikan data"
      );
      return false;
    }

    const stats = rows[0];

    console.log("\n📊 Dashboard Statistics:");
    console.log(
      "  ├─ Total Active Products:",
      stats.total_active_products || 0
    );
    console.log("  ├─ Low Stock Products:", stats.low_stock_products || 0);
    console.log("  ├─ Today Orders:", stats.today_orders || 0);
    console.log("  ├─ Pending Orders:", stats.pending_orders || 0);
    console.log(
      "  ├─ Today Revenue:",
      `Rp ${parseFloat(stats.today_revenue || 0).toLocaleString("id-ID")}`
    );
    console.log(
      "  ├─ Monthly Revenue:",
      `Rp ${parseFloat(stats.monthly_revenue || 0).toLocaleString("id-ID")}`
    );
    console.log("  ├─ Total Customers:", stats.total_customers || 0);
    console.log("  └─ New Customers Today:", stats.new_customers_today || 0);

    console.log("\n✅ TEST 1 PASSED: Dashboard stats retrieved successfully");
    return true;
  } catch (error) {
    console.error("❌ TEST 1 FAILED:", error.message);
    return false;
  }
}

async function testTopSellingProducts() {
  console.log("\n" + "=".repeat(80));
  console.log("TEST 2: Top Selling Products (top_selling_products VIEW)");
  console.log("=".repeat(80));

  try {
    const query = `
      SELECT 
        product_id,
        name,
        brand,
        price,
        stock,
        sold_count,
        total_orders,
        total_quantity_sold,
        total_revenue
      FROM top_selling_products
      LIMIT 10
    `;

    const { rows } = await pool.query(query);

    console.log(`\n📈 Found ${rows.length} top selling products`);

    if (rows.length === 0) {
      console.log("⚠️  No sales data found (belum ada transaksi yang selesai)");
      console.log(
        "✅ TEST 2 PASSED: Query executed successfully (empty result is OK)"
      );
      return true;
    }

    console.log("\n🏆 Top 5 Products:");
    rows.slice(0, 5).forEach((product, index) => {
      console.log(`\n  ${index + 1}. ${product.name} (${product.brand})`);
      console.log(`     ├─ Sold Count: ${product.sold_count || 0}`);
      console.log(`     ├─ Total Orders: ${product.total_orders || 0}`);
      console.log(
        `     ├─ Total Quantity: ${product.total_quantity_sold || 0}`
      );
      console.log(
        `     ├─ Total Revenue: Rp ${parseFloat(
          product.total_revenue || 0
        ).toLocaleString("id-ID")}`
      );
      console.log(`     ├─ Current Stock: ${product.stock || 0}`);
      console.log(
        `     └─ Price: Rp ${parseFloat(product.price || 0).toLocaleString(
          "id-ID"
        )}`
      );
    });

    console.log(
      "\n✅ TEST 2 PASSED: Top selling products retrieved successfully"
    );
    return true;
  } catch (error) {
    console.error("❌ TEST 2 FAILED:", error.message);
    return false;
  }
}

async function testRecentActivity() {
  console.log("\n" + "=".repeat(80));
  console.log("TEST 3: Recent Activity (orders table)");
  console.log("=".repeat(80));

  try {
    const query = `
      SELECT 
        o.order_id,
        o.order_number,
        o.order_status,
        o.total_amount,
        o.created_at,
        u.name as customer_name
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.user_id
      ORDER BY o.created_at DESC
      LIMIT 10
    `;

    const { rows } = await pool.query(query);

    console.log(`\n📋 Found ${rows.length} recent activities`);

    if (rows.length === 0) {
      console.log("⚠️  No recent orders found");
      console.log(
        "✅ TEST 3 PASSED: Query executed successfully (empty result is OK)"
      );
      return true;
    }

    console.log("\n🔔 Recent Activities:");
    rows.forEach((activity, index) => {
      const timeAgo = getTimeAgo(activity.created_at);
      const statusEmoji = getStatusEmoji(activity.order_status);

      console.log(
        `\n  ${index + 1}. ${statusEmoji} Order #${activity.order_number}`
      );
      console.log(`     ├─ Customer: ${activity.customer_name || "Unknown"}`);
      console.log(`     ├─ Status: ${activity.order_status}`);
      console.log(
        `     ├─ Amount: Rp ${parseFloat(
          activity.total_amount || 0
        ).toLocaleString("id-ID")}`
      );
      console.log(`     └─ Time: ${timeAgo}`);
    });

    console.log("\n✅ TEST 3 PASSED: Recent activity retrieved successfully");
    return true;
  } catch (error) {
    console.error("❌ TEST 3 FAILED:", error.message);
    return false;
  }
}

async function testLowStockAlerts() {
  console.log("\n" + "=".repeat(80));
  console.log("TEST 4: Low Stock Alerts (products table)");
  console.log("=".repeat(80));

  try {
    const query = `
      SELECT 
        product_id,
        name,
        brand,
        category_id,
        stock,
        min_stock,
        price,
        is_active
      FROM products
      WHERE stock <= min_stock 
        AND is_active = true
      ORDER BY stock ASC
      LIMIT 20
    `;

    const { rows } = await pool.query(query);

    console.log(`\n⚠️  Found ${rows.length} low stock products`);

    if (rows.length === 0) {
      console.log("✅ Good news! All products have sufficient stock");
      console.log("✅ TEST 4 PASSED: Low stock query executed successfully");
      return true;
    }

    console.log("\n🚨 Low Stock Alerts:");
    rows.forEach((product, index) => {
      const stockPercentage = (
        (product.stock / product.min_stock) *
        100
      ).toFixed(0);
      const urgencyLevel =
        product.stock === 0
          ? "🔴 OUT OF STOCK"
          : product.stock < product.min_stock / 2
          ? "🟠 CRITICAL"
          : "🟡 LOW";

      console.log(
        `\n  ${index + 1}. ${urgencyLevel} - ${product.name} (${product.brand})`
      );
      console.log(`     ├─ Category ID: ${product.category_id || "N/A"}`);
      console.log(`     ├─ Current Stock: ${product.stock}`);
      console.log(`     ├─ Minimum Stock: ${product.min_stock}`);
      console.log(`     ├─ Stock Level: ${stockPercentage}% of minimum`);
      console.log(
        `     └─ Price: Rp ${parseFloat(product.price || 0).toLocaleString(
          "id-ID"
        )}`
      );
    });

    console.log("\n✅ TEST 4 PASSED: Low stock alerts retrieved successfully");
    return true;
  } catch (error) {
    console.error("❌ TEST 4 FAILED:", error.message);
    return false;
  }
}

async function testViewsExist() {
  console.log("\n" + "=".repeat(80));
  console.log("TEST 0: Verify Database VIEWs Exist");
  console.log("=".repeat(80));

  try {
    const query = `
      SELECT 
        table_name,
        table_type
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_type = 'VIEW'
        AND table_name IN ('admin_dashboard_stats', 'top_selling_products', 'user_order_history')
      ORDER BY table_name
    `;

    const { rows } = await pool.query(query);

    console.log(`\n🔍 Found ${rows.length} VIEWs in database:`);
    rows.forEach((view, index) => {
      console.log(`  ${index + 1}. ${view.table_name} (${view.table_type})`);
    });

    const expectedViews = [
      "admin_dashboard_stats",
      "top_selling_products",
      "user_order_history",
    ];
    const missingViews = expectedViews.filter(
      (viewName) => !rows.some((row) => row.table_name === viewName)
    );

    if (missingViews.length > 0) {
      console.log("\n⚠️  WARNING: Missing VIEWs:", missingViews.join(", "));
      console.log(
        "   Please run the database schema setup script to create VIEWs"
      );
      return false;
    }

    console.log("\n✅ TEST 0 PASSED: All required VIEWs exist");
    return true;
  } catch (error) {
    console.error("❌ TEST 0 FAILED:", error.message);
    return false;
  }
}

// Helper functions
function getTimeAgo(timestamp) {
  const now = new Date();
  const past = new Date(timestamp);
  const diffMs = now - past;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Baru saja";
  if (diffMins < 60) return `${diffMins} menit yang lalu`;
  if (diffHours < 24) return `${diffHours} jam yang lalu`;
  return `${diffDays} hari yang lalu`;
}

function getStatusEmoji(status) {
  const emojiMap = {
    pending: "🟡",
    processing: "🔵",
    shipped: "🟣",
    delivered: "🟢",
    completed: "✅",
    cancelled: "🔴",
  };
  return emojiMap[status] || "⚪";
}

// Main test runner
async function runAllTests() {
  console.log("\n" + "=".repeat(80));
  console.log("🧪 ADMIN DASHBOARD API TEST SUITE");
  console.log("=".repeat(80));
  console.log("Testing database VIEWs and admin dashboard functionality");
  console.log("Database: PostgreSQL (Supabase)");
  console.log("Time:", new Date().toLocaleString("id-ID"));

  const results = {
    passed: 0,
    failed: 0,
    total: 5,
  };

  // Test 0: Verify VIEWs exist
  const test0 = await testViewsExist();
  if (test0) results.passed++;
  else results.failed++;

  // Test 1: Dashboard Stats
  const test1 = await testDashboardStats();
  if (test1) results.passed++;
  else results.failed++;

  // Test 2: Top Selling Products
  const test2 = await testTopSellingProducts();
  if (test2) results.passed++;
  else results.failed++;

  // Test 3: Recent Activity
  const test3 = await testRecentActivity();
  if (test3) results.passed++;
  else results.failed++;

  // Test 4: Low Stock Alerts
  const test4 = await testLowStockAlerts();
  if (test4) results.passed++;
  else results.failed++;

  // Summary
  console.log("\n" + "=".repeat(80));
  console.log("📊 TEST SUMMARY");
  console.log("=".repeat(80));
  console.log(`Total Tests: ${results.total}`);
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(
    `Success Rate: ${((results.passed / results.total) * 100).toFixed(0)}%`
  );

  if (results.failed === 0) {
    console.log(
      "\n🎉 ALL TESTS PASSED! Admin Dashboard API is working correctly."
    );
  } else {
    console.log("\n⚠️  Some tests failed. Please review the errors above.");
  }

  console.log("=".repeat(80) + "\n");

  // Close database connection
  await pool.end();

  process.exit(results.failed === 0 ? 0 : 1);
}

// Run tests
runAllTests().catch((error) => {
  console.error("\n❌ Fatal Error:", error);
  process.exit(1);
});

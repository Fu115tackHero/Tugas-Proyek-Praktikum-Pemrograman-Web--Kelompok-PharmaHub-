/**
 * ============================================
 * AUTO SALES REPORT API TEST SCRIPT
 * ============================================
 * Tests auto-generated sales report endpoints
 */

require("dotenv").config();
const axios = require("axios");

const API_URL = "http://localhost:3001/api";

async function runTests() {
  console.log("=== Testing Auto Sales Report API ===\n");

  let testPassed = 0;
  let testFailed = 0;

  try {
    // TEST 1: Generate Sales Report
    console.log("📊 TEST 1: GENERATE REPORT - Auto-generating from orders...");
    try {
      const response = await axios.get(
        `${API_URL}/auto-sales-reports/generate`
      );
      console.log("✅ GENERATE REPORT Success:");
      console.log("   Total Orders:", response.data.data.total_orders);
      console.log("   Completed Orders:", response.data.data.completed_orders);
      console.log("   Total Revenue:", response.data.data.total_revenue);
      console.log("   Net Revenue:", response.data.data.net_revenue);
      console.log(
        "   Top Product:",
        response.data.data.top_selling_product_name
      );
      console.log("   Top Quantity:", response.data.data.top_selling_quantity);
      console.log("");
      testPassed++;
    } catch (error) {
      console.error("❌ TEST FAILED!");
      console.error(
        "   Error:",
        error.response?.data?.message || error.message
      );
      console.log("");
      testFailed++;
    }

    // TEST 2: Get Low Stock Products
    console.log("📦 TEST 2: LOW STOCK - Fetching products with stock < 10...");
    try {
      const response = await axios.get(
        `${API_URL}/auto-sales-reports/low-stock`
      );
      console.log("✅ LOW STOCK Success:");
      console.log("   Found:", response.data.count, "low stock products");
      if (response.data.data.length > 0) {
        console.log(
          "   Example:",
          response.data.data[0].name,
          "- Stock:",
          response.data.data[0].stock
        );
      }
      console.log("");
      testPassed++;
    } catch (error) {
      console.error("❌ TEST FAILED!");
      console.error(
        "   Error:",
        error.response?.data?.message || error.message
      );
      console.log("");
      testFailed++;
    }

    // TEST 3: Get Completed Transactions
    console.log("🧾 TEST 3: TRANSACTIONS - Fetching completed orders...");
    try {
      const response = await axios.get(
        `${API_URL}/auto-sales-reports/transactions`,
        {
          params: { limit: 5 },
        }
      );
      console.log("✅ TRANSACTIONS Success:");
      console.log("   Found:", response.data.count, "completed transactions");
      if (response.data.data.length > 0) {
        const first = response.data.data[0];
        console.log("   First transaction:");
        console.log("     Order:", first.order_number);
        console.log("     Customer:", first.customer_name);
        console.log("     Total:", first.total_amount);
        console.log("     Items:", first.total_items);
      }
      console.log("");
      testPassed++;
    } catch (error) {
      console.error("❌ TEST FAILED!");
      console.error(
        "   Error:",
        error.response?.data?.message || error.message
      );
      console.log("");
      testFailed++;
    }

    // TEST 4: Get Transaction Details (if transactions exist)
    console.log("🔍 TEST 4: TRANSACTION DETAILS - Fetching order items...");
    try {
      // First get a transaction
      const transResponse = await axios.get(
        `${API_URL}/auto-sales-reports/transactions`,
        {
          params: { limit: 1 },
        }
      );

      if (transResponse.data.data.length > 0) {
        const orderId = transResponse.data.data[0].order_id;
        const detailsResponse = await axios.get(
          `${API_URL}/auto-sales-reports/transactions/${orderId}`
        );
        console.log("✅ TRANSACTION DETAILS Success:");
        console.log("   Order ID:", orderId);
        console.log("   Items:", detailsResponse.data.count);
        if (detailsResponse.data.data.length > 0) {
          const item = detailsResponse.data.data[0];
          console.log("   First item:", item.product_name);
          console.log("     Quantity:", item.quantity);
          console.log("     Price:", item.product_price);
          console.log("     Subtotal:", item.subtotal);
        }
        console.log("");
        testPassed++;
      } else {
        console.log("⚠️  SKIPPED: No transactions found");
        console.log("");
      }
    } catch (error) {
      console.error("❌ TEST FAILED!");
      console.error(
        "   Error:",
        error.response?.data?.message || error.message
      );
      console.log("");
      testFailed++;
    }

    // TEST 5: Generate with Date Filter
    console.log(
      "📅 TEST 5: DATE FILTER - Generate report for specific period..."
    );
    try {
      const endDate = new Date().toISOString().split("T")[0];
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];

      const response = await axios.get(
        `${API_URL}/auto-sales-reports/generate`,
        {
          params: { startDate, endDate },
        }
      );
      console.log("✅ DATE FILTER Success:");
      console.log("   Period:", startDate, "to", endDate);
      console.log("   Total Orders:", response.data.data.total_orders);
      console.log("   Total Revenue:", response.data.data.total_revenue);
      console.log("");
      testPassed++;
    } catch (error) {
      console.error("❌ TEST FAILED!");
      console.error(
        "   Error:",
        error.response?.data?.message || error.message
      );
      console.log("");
      testFailed++;
    }

    // TEST 6: Export CSV
    console.log("📄 TEST 6: EXPORT CSV - Testing CSV export...");
    try {
      const response = await axios.get(
        `${API_URL}/auto-sales-reports/export/csv`,
        {
          params: { limit: 5 },
        }
      );
      console.log("✅ EXPORT CSV Success:");
      console.log("   CSV length:", response.data.length, "characters");
      const lines = response.data.split("\n").length - 1;
      console.log("   CSV lines:", lines, "(including header)");
      console.log("");
      testPassed++;
    } catch (error) {
      console.error("❌ TEST FAILED!");
      console.error(
        "   Error:",
        error.response?.data?.message || error.message
      );
      console.log("");
      testFailed++;
    }

    // TEST 7: Export JSON
    console.log("📄 TEST 7: EXPORT JSON - Testing JSON export...");
    try {
      const response = await axios.get(
        `${API_URL}/auto-sales-reports/export/json`,
        {
          params: { limit: 5 },
        }
      );
      console.log("✅ EXPORT JSON Success:");
      console.log("   Has summary:", !!response.data.summary);
      console.log("   Transactions:", response.data.transactions?.length || 0);
      console.log(
        "   Low stock products:",
        response.data.low_stock_products?.length || 0
      );
      console.log("   Generated at:", response.data.generated_at);
      console.log("");
      testPassed++;
    } catch (error) {
      console.error("❌ TEST FAILED!");
      console.error(
        "   Error:",
        error.response?.data?.message || error.message
      );
      console.log("");
      testFailed++;
    }

    // Summary
    console.log("=".repeat(50));
    console.log("🎉 === TEST SUMMARY ===");
    console.log("✅ Tests Passed:", testPassed);
    if (testFailed > 0) {
      console.log("❌ Tests Failed:", testFailed);
    }
    console.log("=".repeat(50));

    if (testFailed === 0) {
      console.log(
        "\n🎊 ALL TESTS PASSED! Auto Sales Report API is working correctly.\n"
      );
    } else {
      console.log("\n⚠️  Some tests failed. Please check the errors above.\n");
    }
  } catch (error) {
    console.error("\n❌ CRITICAL ERROR during testing!");
    console.error("Error:", error.message);
    console.error("\nMake sure:");
    console.error("1. API server is running on http://localhost:3001");
    console.error("2. Database is connected");
    console.error("3. Orders table has completed orders");
    process.exit(1);
  }
}

// Run tests
runTests();

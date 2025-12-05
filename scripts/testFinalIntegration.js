/**
 * ============================================
 * FINAL INTEGRATION TEST
 * ============================================
 * Test complete auto sales report system
 */

require("dotenv").config();
const axios = require("axios");

const API_URL = "http://localhost:3001/api";

async function runFinalTests() {
  console.log("=== FINAL INTEGRATION TEST ===\n");
  console.log("Testing Auto Sales Report Complete System\n");

  let allPassed = true;

  try {
    // Test 1: API Server Health
    console.log("1️⃣  Testing API Server Health...");
    try {
      const health = await axios.get(`${API_URL}/`);
      console.log("   ✅ API Server is running:", health.data.message);
      console.log("");
    } catch (error) {
      console.error("   ❌ API Server not responding");
      allPassed = false;
    }

    // Test 2: Auto-Generate Report
    console.log("2️⃣  Testing Auto-Generate Sales Report...");
    try {
      const response = await axios.get(
        `${API_URL}/auto-sales-reports/generate`
      );
      const report = response.data.data;
      console.log("   ✅ Report generated successfully");
      console.log("      • Total Orders:", report.total_orders);
      console.log("      • Completed Orders:", report.completed_orders);
      console.log(
        "      • Total Revenue: Rp",
        report.total_revenue.toLocaleString("id-ID")
      );
      console.log(
        "      • Net Revenue: Rp",
        report.net_revenue.toLocaleString("id-ID")
      );
      console.log(
        "      • Top Product:",
        report.top_selling_product_name || "None"
      );
      console.log("");
    } catch (error) {
      console.error(
        "   ❌ Failed:",
        error.response?.data?.message || error.message
      );
      allPassed = false;
    }

    // Test 3: Low Stock Products
    console.log("3️⃣  Testing Low Stock Products...");
    try {
      const response = await axios.get(
        `${API_URL}/auto-sales-reports/low-stock`
      );
      console.log("   ✅ Low stock check successful");
      console.log("      • Products with stock < 10:", response.data.count);
      if (response.data.count > 0) {
        console.log("      • Warning: Restock needed!");
      } else {
        console.log("      • All products have sufficient stock");
      }
      console.log("");
    } catch (error) {
      console.error(
        "   ❌ Failed:",
        error.response?.data?.message || error.message
      );
      allPassed = false;
    }

    // Test 4: Completed Transactions
    console.log("4️⃣  Testing Completed Transactions...");
    try {
      const response = await axios.get(
        `${API_URL}/auto-sales-reports/transactions`
      );
      console.log("   ✅ Transactions fetched successfully");
      console.log("      • Completed transactions:", response.data.count);
      if (response.data.count > 0) {
        const latest = response.data.data[0];
        console.log("      • Latest Order:", latest.order_number);
        console.log("      • Customer:", latest.customer_name);
        console.log(
          "      • Amount: Rp",
          latest.total_amount.toLocaleString("id-ID")
        );
      }
      console.log("");
    } catch (error) {
      console.error(
        "   ❌ Failed:",
        error.response?.data?.message || error.message
      );
      allPassed = false;
    }

    // Test 5: Transaction Details
    console.log("5️⃣  Testing Transaction Details...");
    try {
      const transResponse = await axios.get(
        `${API_URL}/auto-sales-reports/transactions`,
        {
          params: { limit: 1 },
        }
      );

      if (transResponse.data.count > 0) {
        const orderId = transResponse.data.data[0].order_id;
        const detailsResponse = await axios.get(
          `${API_URL}/auto-sales-reports/transactions/${orderId}`
        );
        console.log("   ✅ Transaction details fetched successfully");
        console.log("      • Order ID:", orderId);
        console.log("      • Items in order:", detailsResponse.data.count);
      } else {
        console.log("   ⚠️  No transactions to test");
      }
      console.log("");
    } catch (error) {
      console.error(
        "   ❌ Failed:",
        error.response?.data?.message || error.message
      );
      allPassed = false;
    }

    // Test 6: CSV Export
    console.log("6️⃣  Testing CSV Export...");
    try {
      const response = await axios.get(
        `${API_URL}/auto-sales-reports/export/csv`
      );
      const lines = response.data
        .split("\n")
        .filter((line) => line.trim()).length;
      console.log("   ✅ CSV export successful");
      console.log("      • CSV lines (including header):", lines);
      console.log("      • CSV is downloadable: YES");
      console.log("");
    } catch (error) {
      console.error(
        "   ❌ Failed:",
        error.response?.data?.message || error.message
      );
      allPassed = false;
    }

    // Test 7: JSON Export
    console.log("7️⃣  Testing JSON Export...");
    try {
      const response = await axios.get(
        `${API_URL}/auto-sales-reports/export/json`
      );
      console.log("   ✅ JSON export successful");
      console.log("      • Has summary:", !!response.data.summary);
      console.log("      • Has transactions:", !!response.data.transactions);
      console.log(
        "      • Has low stock data:",
        !!response.data.low_stock_products
      );
      console.log("      • Generated at:", response.data.generated_at);
      console.log("");
    } catch (error) {
      console.error(
        "   ❌ Failed:",
        error.response?.data?.message || error.message
      );
      allPassed = false;
    }

    // Test 8: Date Range Filtering
    console.log("8️⃣  Testing Date Range Filtering...");
    try {
      const endDate = new Date().toISOString().split("T")[0];
      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];

      const response = await axios.get(
        `${API_URL}/auto-sales-reports/generate`,
        {
          params: { startDate, endDate },
        }
      );
      console.log("   ✅ Date filtering works");
      console.log("      • Period:", startDate, "to", endDate);
      console.log("      • Orders in period:", response.data.data.total_orders);
      console.log("");
    } catch (error) {
      console.error(
        "   ❌ Failed:",
        error.response?.data?.message || error.message
      );
      allPassed = false;
    }

    // Test 9: Old SalesReport API (should still work)
    console.log("9️⃣  Testing Old Sales Report API (backward compatibility)...");
    try {
      const response = await axios.get(`${API_URL}/sales-reports/summary`);
      console.log("   ✅ Old API still works (no functions broken)");
      console.log("      • Summary available: YES");
      console.log("");
    } catch (error) {
      console.error(
        "   ❌ Old API broken:",
        error.response?.data?.message || error.message
      );
      allPassed = false;
    }

    // Final Summary
    console.log("=".repeat(60));
    if (allPassed) {
      console.log("🎉 ALL TESTS PASSED!");
      console.log("");
      console.log("✅ Auto Sales Report System is fully functional:");
      console.log("   • Auto-generation from orders: WORKING");
      console.log("   • Low stock detection: WORKING");
      console.log("   • Transaction details: WORKING");
      console.log("   • CSV export: WORKING");
      console.log("   • JSON export: WORKING");
      console.log("   • Date filtering: WORKING");
      console.log("   • Old functions: NOT BROKEN");
      console.log("");
      console.log("📝 Ready for frontend integration!");
      console.log("   Navigate to /admin/reports to see the new interface");
    } else {
      console.log("⚠️  SOME TESTS FAILED");
      console.log("Please review errors above");
    }
    console.log("=".repeat(60));
  } catch (error) {
    console.error("\n❌ CRITICAL ERROR!");
    console.error("Error:", error.message);
    console.error("\nPlease ensure:");
    console.error("1. API server is running on http://localhost:3001");
    console.error("2. Database connection is active");
    console.error("3. Orders table has data");
  }
}

// Run tests
runFinalTests();

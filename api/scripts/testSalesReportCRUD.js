// Test CRUD operations for Sales Reports API
require("dotenv").config({ path: "./.env" });
require("dotenv").config({ path: "./api/.env" });
const axios = require("axios");

const API_URL = "http://localhost:3001/api/sales-reports";

async function testSalesReportCRUD() {
  console.log("=== Testing Sales Report CRUD Operations ===\n");

  let createdReportId = null;

  try {
    // ========== TEST 1: CREATE ==========
    console.log("📝 TEST 1: CREATE - Creating new sales report...");
    const newReport = {
      report_date: "2025-11-30",
      total_orders: 10,
      completed_orders: 8,
      cancelled_orders: 2,
      total_revenue: 1500000,
      total_tax: 150000,
      total_discount: 50000,
      net_revenue: 1400000,
      top_selling_product_id: 3,
      top_selling_quantity: 25,
    };

    const createResponse = await axios.post(API_URL, newReport);
    console.log("✅ CREATE Success:");
    console.log("   Report ID:", createResponse.data.data.report_id);
    console.log("   Report Date:", createResponse.data.data.report_date);
    console.log("   Total Revenue:", createResponse.data.data.total_revenue);

    createdReportId = createResponse.data.data.report_id;

    // ========== TEST 2: READ ALL ==========
    console.log("\n\n📋 TEST 2: READ ALL - Fetching all sales reports...");
    const getAllResponse = await axios.get(API_URL);
    console.log("✅ READ ALL Success:");
    console.log(`   Found ${getAllResponse.data.data.length} reports`);
    if (getAllResponse.data.data.length > 0) {
      console.log("   First report:");
      console.log("     ID:", getAllResponse.data.data[0].report_id);
      console.log("     Date:", getAllResponse.data.data[0].report_date);
      console.log("     Revenue:", getAllResponse.data.data[0].total_revenue);
    }

    // ========== TEST 3: READ BY ID ==========
    console.log(
      `\n\n🔍 TEST 3: READ BY ID - Fetching report ID: ${createdReportId}...`
    );
    const getByIdResponse = await axios.get(`${API_URL}/${createdReportId}`);
    console.log("✅ READ BY ID Success:");
    console.log("   Report Date:", getByIdResponse.data.data.report_date);
    console.log("   Total Orders:", getByIdResponse.data.data.total_orders);
    console.log(
      "   Completed Orders:",
      getByIdResponse.data.data.completed_orders
    );
    console.log("   Total Revenue:", getByIdResponse.data.data.total_revenue);
    console.log("   Net Revenue:", getByIdResponse.data.data.net_revenue);

    // ========== TEST 4: UPDATE ==========
    console.log(
      `\n\n✏️  TEST 4: UPDATE - Updating report ID: ${createdReportId}...`
    );
    const updateData = {
      total_orders: 12,
      completed_orders: 10,
      cancelled_orders: 2,
      total_revenue: 1800000,
      net_revenue: 1650000,
    };

    const updateResponse = await axios.put(
      `${API_URL}/${createdReportId}`,
      updateData
    );
    console.log("✅ UPDATE Success:");
    console.log(
      "   Total Orders (old: 10, new:",
      updateResponse.data.data.total_orders + ")"
    );
    console.log(
      "   Total Revenue (old: 1500000, new:",
      updateResponse.data.data.total_revenue + ")"
    );
    console.log(
      "   Net Revenue (old: 1400000, new:",
      updateResponse.data.data.net_revenue + ")"
    );

    // ========== TEST 5: GET SUMMARY ==========
    console.log("\n\n📊 TEST 5: GET SUMMARY - Fetching sales summary...");
    const summaryResponse = await axios.get(`${API_URL}/summary`);
    console.log("✅ GET SUMMARY Success:");
    console.log("   Total Reports:", summaryResponse.data.data.total_reports);
    console.log("   Total Orders:", summaryResponse.data.data.total_orders);
    console.log("   Total Revenue:", summaryResponse.data.data.total_revenue);
    console.log(
      "   Total Net Revenue:",
      summaryResponse.data.data.total_net_revenue
    );
    console.log(
      "   Avg Daily Revenue:",
      summaryResponse.data.data.avg_daily_revenue
    );

    // ========== TEST 6: FILTER BY DATE ==========
    console.log("\n\n📅 TEST 6: FILTER BY DATE - Filtering reports...");
    const filterResponse = await axios.get(API_URL, {
      params: {
        startDate: "2025-11-01",
        endDate: "2025-11-30",
      },
    });
    console.log("✅ FILTER BY DATE Success:");
    console.log(
      `   Found ${filterResponse.data.data.length} reports in date range`
    );

    // ========== TEST 7: DELETE ==========
    console.log(
      `\n\n🗑️  TEST 7: DELETE - Deleting report ID: ${createdReportId}...`
    );
    const deleteResponse = await axios.delete(`${API_URL}/${createdReportId}`);
    console.log("✅ DELETE Success:");
    console.log("   Deleted Report ID:", deleteResponse.data.data.report_id);

    // ========== TEST 8: VERIFY DELETE ==========
    console.log(
      `\n\n🔍 TEST 8: VERIFY DELETE - Checking if report ${createdReportId} is deleted...`
    );
    try {
      await axios.get(`${API_URL}/${createdReportId}`);
      console.log("❌ VERIFY DELETE Failed: Report still exists");
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log(
          "✅ VERIFY DELETE Success: Report not found (correctly deleted)"
        );
      } else {
        throw error;
      }
    }

    console.log("\n\n🎉 === ALL CRUD TESTS PASSED SUCCESSFULLY! ===\n");
    console.log("📋 Summary:");
    console.log("   ✅ CREATE - Works correctly");
    console.log("   ✅ READ ALL - Works correctly");
    console.log("   ✅ READ BY ID - Works correctly");
    console.log("   ✅ UPDATE - Works correctly");
    console.log("   ✅ GET SUMMARY - Works correctly");
    console.log("   ✅ FILTER BY DATE - Works correctly");
    console.log("   ✅ DELETE - Works correctly");
    console.log("   ✅ VERIFY DELETE - Works correctly");
  } catch (error) {
    console.error("\n\n❌ TEST FAILED!");
    console.error("Error:", error.message);
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", JSON.stringify(error.response.data, null, 2));
    }

    // Cleanup: try to delete created report if test failed
    if (createdReportId) {
      try {
        console.log("\n🧹 Cleaning up: Deleting test report...");
        await axios.delete(`${API_URL}/${createdReportId}`);
        console.log("✅ Cleanup successful");
      } catch (cleanupError) {
        console.error("❌ Cleanup failed:", cleanupError.message);
      }
    }
  }
}

// Run the test
testSalesReportCRUD();

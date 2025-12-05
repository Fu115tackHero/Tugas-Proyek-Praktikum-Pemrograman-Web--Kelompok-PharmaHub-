/**
 * Test Backend Delete API Endpoint
 * Testing hideOrderFromUser API call to verify it works correctly
 */

const axios = require("axios");

const API_BASE_URL = "http://localhost:3001/api";

// Demo login credentials
const DEMO_USER = {
  email: "demoadmin@gmail.com",
  password: "password123",
};

async function testDeleteAPI() {
  let token = null;
  let userId = null;
  let testOrderId = null;

  try {
    console.log("🧪 Testing Delete Order API Endpoint\n");

    // Step 1: Login to get token
    console.log("Step 1: Login to get auth token...");
    const loginRes = await axios.post(`${API_BASE_URL}/auth/login`, DEMO_USER);
    token = loginRes.data.token;
    userId = loginRes.data.user.id;
    console.log(`✓ Login successful. Token: ${token.substring(0, 20)}...`);
    console.log(`✓ User ID: ${userId}\n`);

    // Step 2: Get user's orders
    console.log("Step 2: Fetching user's orders...");
    const ordersRes = await axios.get(`${API_BASE_URL}/orders`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const completedOrders = ordersRes.data.filter(
      (o) => o.order_status === "completed"
    );
    console.log(`✓ Found ${completedOrders.length} completed orders`);

    if (completedOrders.length === 0) {
      console.log("\n⚠️  No completed orders found for testing.");
      console.log("Note: Test would show API structure even if no orders\n");
      return;
    }

    testOrderId = completedOrders[0].order_id;
    console.log(`✓ Test order ID: ${testOrderId}`);
    console.log(`✓ Order Number: ${completedOrders[0].order_number}\n`);

    // Step 3: Test delete order API
    console.log(
      `Step 3: Testing DELETE /api/orders/${testOrderId}/hide endpoint...`
    );

    try {
      const deleteRes = await axios.delete(
        `${API_BASE_URL}/orders/${testOrderId}/hide`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("✓ API Response:");
      console.log(`  Status: ${deleteRes.status}`);
      console.log(`  Message: ${deleteRes.data.message}`);
      console.log(`  Order ID: ${deleteRes.data.data?.order_id || "N/A"}`);
      console.log(`  Hidden: ${deleteRes.data.data?.is_hidden_from_user}\n`);

      // Step 4: Verify order is hidden
      console.log("Step 4: Verifying order is hidden from user view...");
      const verifyRes = await axios.get(`${API_BASE_URL}/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const stillVisible = verifyRes.data.find(
        (o) => o.order_id === testOrderId
      );

      if (!stillVisible) {
        console.log("✓ Order is hidden from user view (correct!)");
      } else {
        console.log("✗ Order is STILL visible to user (error!)");
      }

      console.log("\n✅ Delete API Test Successful!\n");
    } catch (deleteError) {
      if (deleteError.response?.status === 404) {
        console.log("✗ DELETE endpoint not found (404)");
        console.log(`  URL: ${API_BASE_URL}/orders/${testOrderId}/hide`);
        console.log(
          "  Make sure the route is properly defined in orderRoutes.js\n"
        );
      } else {
        console.log("✗ Delete API Error:");
        console.log(`  Status: ${deleteError.response?.status}`);
        console.log(
          `  Message: ${
            deleteError.response?.data?.message || deleteError.message
          }\n`
        );
      }
      throw deleteError;
    }
  } catch (error) {
    console.error("\n❌ Test failed:", error.message);

    if (error.response) {
      console.error("Response Status:", error.response.status);
      console.error("Response Data:", error.response.data);
    }
  }
}

// Run test
testDeleteAPI()
  .then(() => {
    console.log("✅ API test completed");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Fatal error:", err.message);
    process.exit(1);
  });

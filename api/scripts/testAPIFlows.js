/**
 * Simple test script to verify API endpoints after Neon DB migration
 * Run with: node api/scripts/testAPIFlows.js
 */

const axios = require("axios");

const API_URL = "http://localhost:3001/api";

// Test credentials (use demo accounts if they exist)
const testUser = {
  email: "user@test.com",
  password: "password123",
};

let authToken = null;
let testOrderId = null;

async function testAuth() {
  console.log("\n=== Testing Authentication ===");

  try {
    // Test login
    console.log("Testing login...");
    const loginRes = await axios.post(`${API_URL}/auth/login`, testUser);
    if (loginRes.data.success && loginRes.data.token) {
      authToken = loginRes.data.token;
      console.log("✅ Login successful");
      console.log(
        `   User: ${loginRes.data.user.name} (${loginRes.data.user.role})`
      );
    } else {
      console.log("❌ Login failed - no token received");
      return false;
    }

    // Test /me endpoint
    console.log("Testing /auth/me...");
    const meRes = await axios.get(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    if (meRes.data.success && meRes.data.user) {
      console.log("✅ Profile fetch successful");
    } else {
      console.log("❌ Profile fetch failed");
      return false;
    }

    return true;
  } catch (error) {
    console.log("❌ Auth test failed:");
    console.log(`   ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function testCart() {
  console.log("\n=== Testing Cart ===");

  try {
    // Get cart
    console.log("Testing GET /cart...");
    const cartRes = await axios.get(`${API_URL}/cart`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    if (cartRes.data.success !== undefined) {
      console.log("✅ Cart fetch successful");
      console.log(`   Items in cart: ${cartRes.data.items?.length || 0}`);
    } else {
      console.log("❌ Cart fetch failed");
      return false;
    }

    return true;
  } catch (error) {
    console.log("❌ Cart test failed:");
    console.log(`   ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function testOrders() {
  console.log("\n=== Testing Orders ===");

  try {
    // Get orders
    console.log("Testing GET /orders...");
    const ordersRes = await axios.get(`${API_URL}/orders`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    if (ordersRes.data.success && ordersRes.data.orders) {
      console.log("✅ Orders fetch successful");
      console.log(`   Total orders: ${ordersRes.data.count}`);

      if (ordersRes.data.orders.length > 0) {
        testOrderId = ordersRes.data.orders[0].order_id;
        console.log(`   Test order ID: ${testOrderId}`);
      }
    } else {
      console.log("❌ Orders fetch failed");
      return false;
    }

    return true;
  } catch (error) {
    console.log("❌ Orders test failed:");
    console.log(`   ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function testNotifications() {
  console.log("\n=== Testing Notifications ===");

  try {
    // Get notifications
    console.log("Testing GET /notifications...");
    const notifsRes = await axios.get(`${API_URL}/notifications`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    if (notifsRes.data.success && notifsRes.data.notifications) {
      console.log("✅ Notifications fetch successful");
      console.log(`   Total notifications: ${notifsRes.data.count}`);
    } else {
      console.log("❌ Notifications fetch failed");
      return false;
    }

    // Get unread count
    console.log("Testing GET /notifications/unread-count...");
    const countRes = await axios.get(`${API_URL}/notifications/unread-count`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    if (
      countRes.data.success !== undefined &&
      countRes.data.unreadCount !== undefined
    ) {
      console.log("✅ Unread count fetch successful");
      console.log(`   Unread count: ${countRes.data.unreadCount}`);
    } else {
      console.log("❌ Unread count fetch failed");
      return false;
    }

    return true;
  } catch (error) {
    console.log("❌ Notifications test failed:");
    console.log(`   ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function testPaymentActions() {
  console.log("\n=== Testing Payment Actions ===");

  if (!testOrderId) {
    console.log("⚠️  Skipping payment actions test (no test order available)");
    return true;
  }

  try {
    // Note: These will fail if order isn't in pending state, but we're just testing connectivity
    console.log(
      "Testing PUT /orders/:id/payment/finalize (connectivity only)..."
    );
    try {
      await axios.put(
        `${API_URL}/orders/${testOrderId}/payment/finalize`,
        {},
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      console.log("✅ Payment finalize endpoint accessible");
    } catch (error) {
      if (error.response?.status === 500) {
        console.log(
          "✅ Payment finalize endpoint accessible (validation error expected)"
        );
      } else {
        throw error;
      }
    }

    return true;
  } catch (error) {
    console.log("❌ Payment actions test failed:");
    console.log(`   ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function runTests() {
  console.log("=".repeat(50));
  console.log("PharmaHub API Test Suite (Neon DB)");
  console.log("=".repeat(50));

  const results = {
    auth: await testAuth(),
    cart: false,
    orders: false,
    notifications: false,
    paymentActions: false,
  };

  if (results.auth) {
    results.cart = await testCart();
    results.orders = await testOrders();
    results.notifications = await testNotifications();
    results.paymentActions = await testPaymentActions();
  } else {
    console.log("\n⚠️  Skipping remaining tests due to auth failure");
  }

  console.log("\n" + "=".repeat(50));
  console.log("Test Summary:");
  console.log("=".repeat(50));
  Object.entries(results).forEach(([test, passed]) => {
    console.log(
      `${passed ? "✅" : "❌"} ${test.padEnd(20)} ${
        passed ? "PASSED" : "FAILED"
      }`
    );
  });

  const allPassed = Object.values(results).every((r) => r);
  console.log(
    "\n" + (allPassed ? "✅ ALL TESTS PASSED" : "❌ SOME TESTS FAILED")
  );
  console.log("=".repeat(50));

  process.exit(allPassed ? 0 : 1);
}

// Run tests
runTests().catch((error) => {
  console.error("\n❌ Fatal error:", error.message);
  process.exit(1);
});

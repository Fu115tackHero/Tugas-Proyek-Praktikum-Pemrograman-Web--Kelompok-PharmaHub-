require("dotenv").config();
const axios = require("axios");

const API_URL = "http://localhost:3001/api";

// Test credentials - using demo account from seedDemoAccounts.js
const TEST_USER = {
  email: "customer@pharmahub.com",
  password: "customer123",
};

let authToken = null;
let createdOrderId = null;
let createdNotificationId = null;

/**
 * Login to get auth token
 */
async function login() {
  console.log("\n🔐 Step 1: Login to get auth token...\n");

  try {
    const response = await axios.post(`${API_URL}/auth/login`, TEST_USER);

    if (response.data.success && response.data.token) {
      authToken = response.data.token;
      console.log("✅ Login successful");
      console.log("   Token:", authToken.substring(0, 20) + "...");
      console.log("   User ID:", response.data.user.user_id);
      console.log("   Email:", response.data.user.email);
      return true;
    } else {
      console.error("❌ Login failed: No token received");
      return false;
    }
  } catch (error) {
    console.error("❌ Login error:", error.response?.data || error.message);
    return false;
  }
}

/**
 * Test 1: Create new order
 */
async function testCreateOrder() {
  console.log("\n📦 Test 1: Create new order...\n");

  try {
    const orderData = {
      customerName: "Demo Customer",
      customerEmail: "customer@pharmahub.com",
      customerPhone: "081234567890",
      customerAddress: "Jl. Test No. 123, Jakarta",
      items: [
        {
          product_id: 1,
          product_name: "Paracetamol 500mg",
          product_price: 15000,
          quantity: 2,
        },
        {
          product_id: 2,
          product_name: "Amoxicillin 500mg",
          product_price: 25000,
          quantity: 1,
        },
      ],
      subtotal: 55000,
      taxAmount: 0,
      discountAmount: 0,
      totalAmount: 55000,
      couponCode: null,
      paymentMethod: "bayar_ditempat",
      paymentStatus: "pending",
      notes: "Test order from API test script",
    };

    const response = await axios.post(`${API_URL}/orders`, orderData, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (response.data.success) {
      createdOrderId = response.data.order.order_id;
      console.log("✅ Order created successfully");
      console.log("   Order ID:", response.data.order.order_id);
      console.log("   Order Number:", response.data.order.order_number);
      console.log("   Total Amount:", response.data.order.total_amount);
      console.log("   Payment Method:", response.data.order.payment_method);
      console.log("   Status:", response.data.order.order_status);
      return true;
    } else {
      console.error("❌ Order creation failed:", response.data.message);
      return false;
    }
  } catch (error) {
    console.error(
      "❌ Create order error:",
      error.response?.data || error.message
    );
    return false;
  }
}

/**
 * Test 2: Get all orders for user
 */
async function testGetOrders() {
  console.log("\n📋 Test 2: Get all orders for user...\n");

  try {
    const response = await axios.get(`${API_URL}/orders`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (response.data.success) {
      console.log("✅ Orders retrieved successfully");
      console.log("   Total Orders:", response.data.count);

      if (response.data.orders.length > 0) {
        const firstOrder = response.data.orders[0];
        console.log("\n   Latest Order:");
        console.log("   - Order Number:", firstOrder.order_number);
        console.log("   - Customer Name:", firstOrder.customer_name);
        console.log("   - Total Amount:", firstOrder.total_amount);
        console.log("   - Status:", firstOrder.order_status);
        console.log("   - Payment Status:", firstOrder.payment_status);
        console.log("   - Total Items:", firstOrder.total_items);
        console.log("   - Total Quantity:", firstOrder.total_quantity);
        console.log("   - Created At:", firstOrder.created_at);
      }
      return true;
    } else {
      console.error("❌ Get orders failed:", response.data.message);
      return false;
    }
  } catch (error) {
    console.error(
      "❌ Get orders error:",
      error.response?.data || error.message
    );
    return false;
  }
}

/**
 * Test 3: Get specific order by ID
 */
async function testGetOrderById() {
  console.log("\n🔍 Test 3: Get specific order by ID...\n");

  if (!createdOrderId) {
    console.error("❌ No order ID available for testing");
    return false;
  }

  try {
    const response = await axios.get(`${API_URL}/orders/${createdOrderId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (response.data.success) {
      const order = response.data.order;
      console.log("✅ Order retrieved successfully");
      console.log("   Order Number:", order.order_number);
      console.log("   Customer Name:", order.customer_name);
      console.log("   Customer Phone:", order.customer_phone);
      console.log("   Customer Address:", order.customer_address);
      console.log("   Subtotal:", order.subtotal);
      console.log("   Total Amount:", order.total_amount);
      console.log("   Payment Method:", order.payment_method);
      console.log("   Payment Status:", order.payment_status);
      console.log("   Order Status:", order.order_status);

      console.log("\n   Order Items:");
      order.items.forEach((item, idx) => {
        console.log(`   ${idx + 1}. ${item.product_name}`);
        console.log(`      - Price: ${item.product_price}`);
        console.log(`      - Quantity: ${item.quantity}`);
        console.log(`      - Subtotal: ${item.subtotal}`);
      });

      return true;
    } else {
      console.error("❌ Get order by ID failed:", response.data.message);
      return false;
    }
  } catch (error) {
    console.error(
      "❌ Get order by ID error:",
      error.response?.data || error.message
    );
    return false;
  }
}

/**
 * Test 4: Get all notifications
 */
async function testGetNotifications() {
  console.log("\n🔔 Test 4: Get all notifications...\n");

  try {
    const response = await axios.get(`${API_URL}/notifications`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (response.data.success) {
      console.log("✅ Notifications retrieved successfully");
      console.log("   Total Notifications:", response.data.count);

      if (response.data.notifications.length > 0) {
        const firstNotif = response.data.notifications[0];
        createdNotificationId = firstNotif.notification_id;

        console.log("\n   Latest Notification:");
        console.log("   - ID:", firstNotif.notification_id);
        console.log("   - Type:", firstNotif.type);
        console.log("   - Title:", firstNotif.title);
        console.log("   - Message:", firstNotif.message);
        console.log("   - Order Number:", firstNotif.order_number || "N/A");
        console.log("   - Is Read:", firstNotif.is_read);
        console.log("   - Created At:", firstNotif.created_at);
      }
      return true;
    } else {
      console.error("❌ Get notifications failed:", response.data.message);
      return false;
    }
  } catch (error) {
    console.error(
      "❌ Get notifications error:",
      error.response?.data || error.message
    );
    return false;
  }
}

/**
 * Test 5: Get unread notification count
 */
async function testGetUnreadCount() {
  console.log("\n📊 Test 5: Get unread notification count...\n");

  try {
    const response = await axios.get(`${API_URL}/notifications/unread-count`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (response.data.success) {
      console.log("✅ Unread count retrieved successfully");
      console.log("   Unread Notifications:", response.data.unreadCount);
      return true;
    } else {
      console.error("❌ Get unread count failed:", response.data.message);
      return false;
    }
  } catch (error) {
    console.error(
      "❌ Get unread count error:",
      error.response?.data || error.message
    );
    return false;
  }
}

/**
 * Test 6: Mark notification as read
 */
async function testMarkNotificationAsRead() {
  console.log("\n✔️ Test 6: Mark notification as read...\n");

  if (!createdNotificationId) {
    console.error("❌ No notification ID available for testing");
    return false;
  }

  try {
    const response = await axios.put(
      `${API_URL}/notifications/${createdNotificationId}/read`,
      {},
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    if (response.data.success) {
      console.log("✅ Notification marked as read successfully");
      console.log(
        "   Notification ID:",
        response.data.notification.notification_id
      );
      console.log("   Is Read:", response.data.notification.is_read);
      console.log("   Read At:", response.data.notification.read_at);
      return true;
    } else {
      console.error("❌ Mark as read failed:", response.data.message);
      return false;
    }
  } catch (error) {
    console.error(
      "❌ Mark as read error:",
      error.response?.data || error.message
    );
    return false;
  }
}

/**
 * Test 7: Update order status
 */
async function testUpdateOrderStatus() {
  console.log("\n🔄 Test 7: Update order status...\n");

  if (!createdOrderId) {
    console.error("❌ No order ID available for testing");
    return false;
  }

  try {
    const response = await axios.put(
      `${API_URL}/orders/${createdOrderId}/status`,
      { status: "confirmed" }, // Valid status from CHECK constraint
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    if (response.data.success) {
      console.log("✅ Order status updated successfully");
      console.log("   Order Number:", response.data.order.order_number);
      console.log("   New Status:", response.data.order.order_status);
      console.log("   Updated At:", response.data.order.updated_at);
      return true;
    } else {
      console.error("❌ Update order status failed:", response.data.message);
      return false;
    }
  } catch (error) {
    console.error(
      "❌ Update order status error:",
      error.response?.data || error.message
    );
    return false;
  }
}

/**
 * Test 8: Cancel order
 */
async function testCancelOrder() {
  console.log("\n❌ Test 8: Cancel order...\n");

  if (!createdOrderId) {
    console.error("❌ No order ID available for testing");
    return false;
  }

  // First, update status back to pending so it can be cancelled
  try {
    await axios.put(
      `${API_URL}/orders/${createdOrderId}/status`,
      { status: "pending" },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    console.log("   Order status reset to pending for cancellation test");
  } catch (error) {
    console.error(
      "   Failed to reset status:",
      error.response?.data || error.message
    );
  }

  try {
    const response = await axios.post(
      `${API_URL}/orders/${createdOrderId}/cancel`,
      { cancellationReason: "Test cancellation from API test script" },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    if (response.data.success) {
      console.log("✅ Order cancelled successfully");
      console.log("   Order Number:", response.data.order.order_number);
      console.log("   Status:", response.data.order.order_status);
      return true;
    } else {
      console.error("❌ Cancel order failed:", response.data.message);
      return false;
    }
  } catch (error) {
    console.error(
      "❌ Cancel order error:",
      error.response?.data || error.message
    );
    return false;
  }
}

/**
 * Test 9: Mark all notifications as read
 */
async function testMarkAllNotificationsAsRead() {
  console.log("\n✔️✔️ Test 9: Mark all notifications as read...\n");

  try {
    const response = await axios.put(
      `${API_URL}/notifications/mark-all-read`,
      {},
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    if (response.data.success) {
      console.log("✅ All notifications marked as read successfully");
      console.log("   Message:", response.data.message);
      console.log("   Marked Count:", response.data.markedCount);
      return true;
    } else {
      console.error("❌ Mark all as read failed:", response.data.message);
      return false;
    }
  } catch (error) {
    console.error(
      "❌ Mark all as read error:",
      error.response?.data || error.message
    );
    return false;
  }
}

/**
 * Main test runner
 */
async function runTests() {
  console.log(
    "================================================================================"
  );
  console.log("🧪 Order & Notification API Test Suite");
  console.log(
    "================================================================================"
  );

  const results = [];

  // Login first
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.error("\n❌ Cannot proceed without authentication");
    return;
  }

  // Run all tests
  results.push({ name: "Create Order", passed: await testCreateOrder() });
  results.push({ name: "Get Orders", passed: await testGetOrders() });
  results.push({ name: "Get Order by ID", passed: await testGetOrderById() });
  results.push({
    name: "Get Notifications",
    passed: await testGetNotifications(),
  });
  results.push({
    name: "Get Unread Count",
    passed: await testGetUnreadCount(),
  });
  results.push({
    name: "Mark Notification as Read",
    passed: await testMarkNotificationAsRead(),
  });
  results.push({
    name: "Update Order Status",
    passed: await testUpdateOrderStatus(),
  });
  results.push({ name: "Cancel Order", passed: await testCancelOrder() });
  results.push({
    name: "Mark All as Read",
    passed: await testMarkAllNotificationsAsRead(),
  });

  // Print summary
  console.log(
    "\n================================================================================"
  );
  console.log("📊 Test Summary");
  console.log(
    "================================================================================\n"
  );

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  results.forEach((result) => {
    const icon = result.passed ? "✅" : "❌";
    console.log(`${icon} ${result.name}`);
  });

  console.log(
    "\n--------------------------------------------------------------------------------"
  );
  console.log(`Total Tests: ${results.length}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(
    "--------------------------------------------------------------------------------\n"
  );

  if (failed === 0) {
    console.log("🎉 All tests passed!");
  } else {
    console.log("⚠️  Some tests failed. Please check the errors above.");
  }

  console.log(
    "\n================================================================================"
  );
}

// Run the tests
runTests().catch(console.error);

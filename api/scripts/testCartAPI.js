// Comprehensive Cart & Coupon API Test
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const BASE_URL = "http://localhost:3001/api";
let authToken = "";
let testUserId = "";
let testProductId = 1; // Assuming product 1 exists

// Test credentials
const testUser = {
  email: "cart.test@pharmahub.com",
  password: "TestPassword123",
  name: "Cart Test User",
};

// Helper function to make authenticated requests
async function request(endpoint, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(authToken && { Authorization: `Bearer ${authToken}` }),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();
  return { status: response.status, data };
}

// Test functions
async function testServerHealth() {
  console.log("\n🏥 Test 0: Server Health Check");
  console.log("=".repeat(80));

  try {
    const response = await fetch(`${BASE_URL.replace("/api", "")}/api`);
    const data = await response.json();

    if (response.ok && data.success) {
      console.log("✅ API server is running");
      return true;
    } else {
      console.log("❌ API server is not responding correctly");
      return false;
    }
  } catch (error) {
    console.log("❌ API server is not running");
    console.log(`   Error: ${error.message}`);
    console.log("\n💡 Please start the API server: cd api && node server.js\n");
    return false;
  }
}

async function registerOrLoginTestUser() {
  console.log("\n👤 Test 1: Register/Login Test User");
  console.log("=".repeat(80));

  try {
    // Try to register
    const registerRes = await request("/auth/register", {
      method: "POST",
      body: JSON.stringify(testUser),
    });

    if (registerRes.status === 201 || registerRes.status === 409) {
      console.log("✅ User exists or created successfully");

      // Login
      const loginRes = await request("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: testUser.email,
          password: testUser.password,
        }),
      });

      if (loginRes.status === 200 && loginRes.data.token) {
        authToken = loginRes.data.token;
        testUserId = loginRes.data.user.user_id;
        console.log(`✅ Logged in as user ${testUserId}`);
        console.log(`   Token: ${authToken.substring(0, 20)}...`);
        return true;
      }
    }

    console.log("❌ Failed to login test user");
    return false;
  } catch (error) {
    console.error("❌ Error in user setup:", error.message);
    return false;
  }
}

async function testGetEmptyCart() {
  console.log("\n🛒 Test 2: GET Empty Cart");
  console.log("=".repeat(80));

  try {
    // First, clear cart
    await request("/cart", { method: "DELETE" });

    // Get cart
    const { status, data } = await request("/cart");

    console.log(`✅ Status: ${status}`);
    console.log(`   Items in cart: ${data.data.items.length}`);
    console.log(`   Subtotal: Rp ${data.data.subtotal.toLocaleString()}`);
    console.log(`   Item count: ${data.data.itemCount}`);

    return status === 200;
  } catch (error) {
    console.error("❌ Error:", error.message);
    return false;
  }
}

async function testAddToCart() {
  console.log("\n➕ Test 3: POST Add Product to Cart");
  console.log("=".repeat(80));

  try {
    const { status, data } = await request("/cart", {
      method: "POST",
      body: JSON.stringify({
        product_id: testProductId,
        quantity: 2,
      }),
    });

    console.log(`✅ Status: ${status}`);
    console.log(`   Message: ${data.message}`);
    console.log(`   Cart items: ${data.data.cart.length}`);

    if (data.data.cart.length > 0) {
      const item = data.data.cart[0];
      console.log(
        `   First item: ${item.name} x${
          item.quantity
        } @ Rp ${item.price.toLocaleString()}`
      );
    }

    return status === 201;
  } catch (error) {
    console.error("❌ Error:", error.message);
    return false;
  }
}

async function testUpdateQuantity() {
  console.log("\n🔄 Test 4: PUT Update Cart Item Quantity");
  console.log("=".repeat(80));

  try {
    const { status, data } = await request(`/cart/${testProductId}`, {
      method: "PUT",
      body: JSON.stringify({
        quantity: 5,
      }),
    });

    console.log(`✅ Status: ${status}`);
    console.log(`   Message: ${data.message}`);

    if (data.data.cart.length > 0) {
      const item = data.data.cart.find((i) => i.product_id === testProductId);
      if (item) {
        console.log(`   Updated quantity: ${item.quantity}`);
      }
    }

    return status === 200;
  } catch (error) {
    console.error("❌ Error:", error.message);
    return false;
  }
}

async function testGetCoupons() {
  console.log("\n🎫 Test 5: GET Active Coupons");
  console.log("=".repeat(80));

  try {
    const { status, data } = await request("/coupons");

    console.log(`✅ Status: ${status}`);
    console.log(`   Active coupons: ${data.data.count}`);

    if (data.data.coupons.length > 0) {
      data.data.coupons.forEach((coupon) => {
        const discount =
          coupon.discount_type === "percentage"
            ? `${coupon.discount_value}%`
            : `Rp ${coupon.discount_value.toLocaleString()}`;
        console.log(`   • ${coupon.code}: ${discount} - ${coupon.description}`);
      });
    }

    return status === 200;
  } catch (error) {
    console.error("❌ Error:", error.message);
    return false;
  }
}

async function testValidateCoupon() {
  console.log("\n✔️  Test 6: POST Validate Coupon");
  console.log("=".repeat(80));

  try {
    // Get current cart total
    const cartRes = await request("/cart");
    const cartTotal = cartRes.data.data.subtotal;

    console.log(`   Cart total: Rp ${cartTotal.toLocaleString()}`);

    const { status, data } = await request("/coupons/validate", {
      method: "POST",
      body: JSON.stringify({
        coupon_code: "SEHAT10",
        cart_total: cartTotal,
      }),
    });

    console.log(`✅ Status: ${status}`);
    console.log(`   Message: ${data.message}`);

    if (data.success) {
      console.log(`   Coupon: ${data.data.coupon.code}`);
      console.log(
        `   Discount: Rp ${data.data.discountAmount.toLocaleString()}`
      );
      console.log(
        `   Final total: Rp ${data.data.finalTotal.toLocaleString()}`
      );
    }

    return status === 200;
  } catch (error) {
    console.error("❌ Error:", error.message);
    return false;
  }
}

async function testSaveForLater() {
  console.log("\n💾 Test 7: POST Save Item for Later");
  console.log("=".repeat(80));

  try {
    const { status, data } = await request("/cart/save-for-later", {
      method: "POST",
      body: JSON.stringify({
        product_id: testProductId,
      }),
    });

    console.log(`✅ Status: ${status}`);
    console.log(`   Message: ${data.message}`);
    console.log(`   Cart items: ${data.data.cart.length}`);
    console.log(`   Saved items: ${data.data.savedItems.length}`);

    return status === 201;
  } catch (error) {
    console.error("❌ Error:", error.message);
    return false;
  }
}

async function testGetSavedForLater() {
  console.log("\n📋 Test 8: GET Saved For Later Items");
  console.log("=".repeat(80));

  try {
    const { status, data } = await request("/cart/saved");

    console.log(`✅ Status: ${status}`);
    console.log(`   Saved items: ${data.data.count}`);

    if (data.data.items.length > 0) {
      data.data.items.forEach((item) => {
        console.log(`   • ${item.name} - Rp ${item.price.toLocaleString()}`);
      });
    }

    return status === 200;
  } catch (error) {
    console.error("❌ Error:", error.message);
    return false;
  }
}

async function testMoveToCart() {
  console.log("\n🔄 Test 9: POST Move Saved Item Back to Cart");
  console.log("=".repeat(80));

  try {
    const { status, data } = await request("/cart/move-to-cart", {
      method: "POST",
      body: JSON.stringify({
        product_id: testProductId,
        quantity: 3,
      }),
    });

    console.log(`✅ Status: ${status}`);
    console.log(`   Message: ${data.message}`);
    console.log(`   Cart items: ${data.data.cart.length}`);
    console.log(`   Saved items: ${data.data.savedItems.length}`);

    return status === 200;
  } catch (error) {
    console.error("❌ Error:", error.message);
    return false;
  }
}

async function testRemoveFromCart() {
  console.log("\n🗑️  Test 10: DELETE Remove Item from Cart");
  console.log("=".repeat(80));

  try {
    const { status, data } = await request(`/cart/${testProductId}`, {
      method: "DELETE",
    });

    console.log(`✅ Status: ${status}`);
    console.log(`   Message: ${data.message}`);
    console.log(`   Remaining items: ${data.data.cart.length}`);

    return status === 200;
  } catch (error) {
    console.error("❌ Error:", error.message);
    return false;
  }
}

async function testClearCart() {
  console.log("\n🧹 Test 11: DELETE Clear Entire Cart");
  console.log("=".repeat(80));

  try {
    // Add some items first
    await request("/cart", {
      method: "POST",
      body: JSON.stringify({ product_id: testProductId, quantity: 1 }),
    });

    // Clear cart
    const { status, data } = await request("/cart", {
      method: "DELETE",
    });

    console.log(`✅ Status: ${status}`);
    console.log(`   Message: ${data.message}`);
    console.log(`   Deleted items: ${data.data.deletedCount}`);

    // Verify empty
    const cartRes = await request("/cart");
    console.log(
      `   Cart is now empty: ${
        cartRes.data.data.items.length === 0 ? "Yes" : "No"
      }`
    );

    return status === 200;
  } catch (error) {
    console.error("❌ Error:", error.message);
    return false;
  }
}

async function testInvalidCoupon() {
  console.log("\n❌ Test 12: POST Validate Invalid Coupon (Error Handling)");
  console.log("=".repeat(80));

  try {
    const { status, data } = await request("/coupons/validate", {
      method: "POST",
      body: JSON.stringify({
        coupon_code: "INVALID_CODE",
        cart_total: 100000,
      }),
    });

    console.log(`✅ Status: ${status} (Expected 400)`);
    console.log(`   Message: ${data.message}`);

    return status === 400; // Should fail
  } catch (error) {
    console.error("❌ Error:", error.message);
    return false;
  }
}

// Main test execution
async function runAllTests() {
  console.log("\n" + "=".repeat(80));
  console.log("🧪 Testing Cart & Coupon API Endpoints");
  console.log("=".repeat(80));

  const serverHealthy = await testServerHealth();
  if (!serverHealthy) {
    console.log("\n❌ Server is not running. Tests cannot proceed.\n");
    process.exit(1);
  }

  const userReady = await registerOrLoginTestUser();
  if (!userReady) {
    console.log("\n❌ User setup failed. Tests cannot proceed.\n");
    process.exit(1);
  }

  const tests = [
    testGetEmptyCart,
    testAddToCart,
    testUpdateQuantity,
    testGetCoupons,
    testValidateCoupon,
    testSaveForLater,
    testGetSavedForLater,
    testMoveToCart,
    testRemoveFromCart,
    testClearCart,
    testInvalidCoupon,
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    const result = await test();
    if (result) {
      passed++;
    } else {
      failed++;
    }
  }

  console.log("\n" + "=".repeat(80));
  console.log("📊 Test Summary");
  console.log("=".repeat(80));
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(
    `📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`
  );

  if (failed === 0) {
    console.log("\n🎉 All Cart & Coupon API tests passed!\n");
  } else {
    console.log("\n⚠️  Some tests failed. Please check the logs above.\n");
  }
}

// Run tests
runAllTests().catch((error) => {
  console.error("\n❌ Test execution failed:", error);
  process.exit(1);
});

require("dotenv").config({ path: "../.env" });
require("dotenv").config({ path: ".env" });
const axios = require("axios");

const API_URL = process.env.API_URL || "http://localhost:3001";

async function testOrderDetailAPI() {
  console.log("=== Testing Order Detail API ===\n");

  try {
    // Login dulu untuk dapat token
    console.log("📝 Logging in...");
    const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
      email: "customer@pharmahub.com",
      password: "customer123",
    });

    const token = loginResponse.data.token;
    console.log("✅ Login successful");
    console.log(`   Token: ${token.substring(0, 20)}...\n`);

    // Get list orders
    console.log("📋 Getting order list...");
    const ordersResponse = await axios.get(`${API_URL}/api/orders`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const orders = ordersResponse.data.orders;
    console.log(`✅ Found ${orders.length} orders\n`);

    if (orders.length === 0) {
      console.log("❌ No orders to test with");
      return;
    }

    const firstOrder = orders[0];
    console.log(`📦 Testing with order: ${firstOrder.order_number}`);
    console.log(`   Order ID: ${firstOrder.order_id}`);
    console.log(
      `   Total: Rp ${parseFloat(firstOrder.total_amount).toLocaleString(
        "id-ID"
      )}\n`
    );

    // Get order detail
    console.log("🔍 Getting order detail with items...");
    const detailResponse = await axios.get(
      `${API_URL}/api/orders/${firstOrder.order_id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const orderDetail = detailResponse.data.order;
    console.log("✅ Order detail retrieved successfully\n");

    // Display order info
    console.log("📄 Order Information:");
    console.log(`   Order Number: ${orderDetail.order_number}`);
    console.log(`   Customer: ${orderDetail.customer_name}`);
    console.log(`   Phone: ${orderDetail.customer_phone}`);
    console.log(`   Status: ${orderDetail.status}`);
    console.log(`   Payment Status: ${orderDetail.payment_status}\n`);

    // Display items
    console.log(`📦 Order Items (${orderDetail.items.length} items):\n`);
    orderDetail.items.forEach((item, idx) => {
      console.log(`${idx + 1}. ${item.product_name}`);
      console.log(`   Product ID: ${item.product_id}`);
      console.log(`   Quantity: ${item.quantity}x`);
      console.log(
        `   Price: Rp ${parseFloat(item.product_price).toLocaleString("id-ID")}`
      );
      console.log(
        `   Subtotal: Rp ${parseFloat(item.subtotal).toLocaleString("id-ID")}`
      );
      console.log(`   Image: ${item.product_image ? "✅ Yes" : "❌ No"}`);
      if (item.product_image) {
        console.log(`   Image URL: ${item.product_image}`);
      }
      console.log("");
    });

    // Display totals
    console.log("💰 Order Totals:");
    console.log(
      `   Subtotal: Rp ${parseFloat(orderDetail.subtotal).toLocaleString(
        "id-ID"
      )}`
    );
    console.log(
      `   Discount: Rp ${parseFloat(orderDetail.discount_amount).toLocaleString(
        "id-ID"
      )}`
    );
    console.log(
      `   Tax: Rp ${parseFloat(orderDetail.tax_amount).toLocaleString("id-ID")}`
    );
    console.log(
      `   Total: Rp ${parseFloat(orderDetail.total_amount).toLocaleString(
        "id-ID"
      )}\n`
    );

    // Validate
    const itemsWithImages = orderDetail.items.filter(
      (item) => item.product_image
    );
    console.log("✅ Validation:");
    console.log(
      `   Items with images: ${itemsWithImages.length}/${orderDetail.items.length}`
    );

    if (itemsWithImages.length === orderDetail.items.length) {
      console.log("   🎉 All items have product images!");
    } else if (itemsWithImages.length > 0) {
      console.log("   ⚠️  Some items missing images (products may be deleted)");
    } else {
      console.log("   ❌ No items have images");
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
    if (error.response) {
      console.error("   Status:", error.response.status);
      console.error("   Data:", error.response.data);
    }
  }
}

testOrderDetailAPI();

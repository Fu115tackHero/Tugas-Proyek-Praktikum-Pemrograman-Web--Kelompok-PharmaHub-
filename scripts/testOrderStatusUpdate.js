require("dotenv").config({ path: "./api/.env" });
require("dotenv").config({ path: "./.env" });

const orderService = require("../services/orderService");

async function testUpdateStatus() {
  try {
    console.log("🧪 Testing order status update with notification...\n");

    // Update order 30 status to "confirmed"
    const orderId = 30;
    const newStatus = "confirmed";

    console.log(`📝 Updating order ${orderId} to status: ${newStatus}`);

    const result = await orderService.updateOrderStatus(orderId, newStatus);

    if (result) {
      console.log("\n✅ Order status updated successfully:");
      console.log("   Order Number:", result.order_number);
      console.log("   New Status:", result.order_status);
      console.log(
        "\n💡 Check the notifications table for the new notification!"
      );
      console.log("   Expected: notification for user_id from this order");
    } else {
      console.log("\n❌ Order not found");
    }

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    process.exit(1);
  }
}

testUpdateStatus();

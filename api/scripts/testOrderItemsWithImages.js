require("dotenv").config({ path: "../.env" });
require("dotenv").config({ path: ".env" });
const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

async function testOrderItemsWithImages() {
  console.log("=== Testing Order Items with Product Images ===\n");

  try {
    // Get first order
    const orderQuery = `
      SELECT order_id, order_number, customer_name
      FROM orders
      ORDER BY created_at DESC
      LIMIT 1
    `;

    const orderResult = await pool.query(orderQuery);
    if (orderResult.rows.length === 0) {
      console.log("❌ No orders found in database");
      return;
    }

    const order = orderResult.rows[0];
    console.log(`✅ Found order: ${order.order_number}`);
    console.log(`   Customer: ${order.customer_name}`);
    console.log(`   Order ID: ${order.order_id}\n`);

    // Get order items with product images
    const itemsQuery = `
      SELECT 
        oi.order_item_id,
        oi.product_id,
        oi.product_name,
        oi.product_price,
        oi.quantity,
        oi.subtotal,
        p.main_image_url as product_image,
        p.name as current_product_name
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.product_id
      WHERE oi.order_id = $1
      ORDER BY oi.order_item_id
    `;

    const itemsResult = await pool.query(itemsQuery, [order.order_id]);

    console.log(`📦 Order Items (${itemsResult.rows.length} items):\n`);

    itemsResult.rows.forEach((item, idx) => {
      console.log(`${idx + 1}. ${item.product_name}`);
      console.log(`   Product ID: ${item.product_id}`);
      console.log(`   Price: Rp ${item.product_price.toLocaleString("id-ID")}`);
      console.log(`   Quantity: ${item.quantity}x`);
      console.log(`   Subtotal: Rp ${item.subtotal.toLocaleString("id-ID")}`);
      console.log(`   Image: ${item.product_image || "❌ No image"}`);
      console.log(
        `   Current Product Name: ${item.current_product_name || "❌ Product deleted/not found"}`
      );
      console.log("");
    });

    // Verify that images are present
    const itemsWithImages = itemsResult.rows.filter((item) => item.product_image);
    console.log(`\n📊 Summary:`);
    console.log(`   Total items: ${itemsResult.rows.length}`);
    console.log(`   Items with images: ${itemsWithImages.length}`);
    console.log(
      `   Items without images: ${itemsResult.rows.length - itemsWithImages.length}`
    );

    if (itemsWithImages.length === itemsResult.rows.length) {
      console.log(`\n✅ All order items have product images!`);
    } else if (itemsWithImages.length > 0) {
      console.log(`\n⚠️  Some order items are missing product images`);
    } else {
      console.log(
        `\n❌ No order items have product images (products may have been deleted)`
      );
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error(error);
  } finally {
    await pool.end();
  }
}

testOrderItemsWithImages();

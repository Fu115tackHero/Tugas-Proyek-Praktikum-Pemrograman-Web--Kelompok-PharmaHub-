// Test product service function directly
require("dotenv").config({ path: "./.env" });
require("dotenv").config({ path: "./api/.env" });
const productService = require("./api/services/productService");

async function testProductService() {
  console.log("=== Testing Product Service Functions ===\n");

  try {
    // 1. Test getProductById
    console.log("📋 Getting product by ID (product_id = 3)...");
    const product = await productService.getProductById(3);

    if (!product) {
      console.log("❌ Product not found");
      return;
    }

    console.log(`✅ Product retrieved: ${product.name}\n`);
    console.log("📊 Product data structure:");
    console.log(JSON.stringify(product, null, 2));

    console.log("\n\n🔍 Checking important_info field...");
    if (product.importantInfo) {
      console.log(`✅ importantInfo field exists (${product.importantInfo.length} items):\n`);
      product.importantInfo.forEach((info, idx) => {
        console.log(`   ${idx + 1}. ${info}`);
      });
    } else if (product.important_info) {
      console.log(`✅ important_info field exists (${product.important_info.length} items):\n`);
      product.important_info.forEach((info, idx) => {
        console.log(`   ${idx + 1}. ${info}`);
      });
    } else {
      console.log("❌ No important_info field found in response");
    }

    console.log("\n\n🎉 Service test completed!");
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error(error.stack);
  }
}

testProductService();

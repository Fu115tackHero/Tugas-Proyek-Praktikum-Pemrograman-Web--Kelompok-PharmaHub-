// Simple API test to verify important_info is returned
require("dotenv").config({ path: "./.env" });
require("dotenv").config({ path: "./api/.env" });
const axios = require("axios");

const API_URL = "http://localhost:3001";

async function testAPI() {
  console.log("=== Testing API Endpoint for importantInfo ===\n");

  try {
    // Test GET /api/products/3
    console.log("📡 GET /api/products/3");
    const response = await axios.get(`${API_URL}/api/products/3`);

    const product = response.data.data || response.data;

    console.log("\n✅ API Response received\n");
    console.log("Product Name:", product.name);
    console.log("Product ID:", product.product_id || product.id);

    console.log("\n🔍 Checking for importantInfo field...");

    // Check both field names
    if (product.importantInfo) {
      console.log(
        `✅ importantInfo field found (${product.importantInfo.length} items):`
      );
      product.importantInfo.forEach((info, idx) => {
        console.log(`   ${idx + 1}. ${info}`);
      });
    } else if (product.important_info) {
      console.log(
        `✅ important_info field found (${product.important_info.length} items):`
      );
      product.important_info.forEach((info, idx) => {
        console.log(`   ${idx + 1}. ${info}`);
      });
    } else {
      console.log("❌ No importantInfo or important_info field in response");
      console.log("\n📋 Available fields:");
      console.log(Object.keys(product).join(", "));
    }

    console.log("\n\n🎉 API Test Complete!");
  } catch (error) {
    console.error("\n❌ API Test Failed!");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    } else {
      console.error("Error:", error.message);
    }
  }
}

testAPI();

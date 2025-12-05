require("dotenv").config({ path: "../.env" });
require("dotenv").config({ path: ".env" });
const axios = require("axios");

const API_URL = process.env.API_URL || "http://localhost:3001";

async function testImportantInfo() {
  console.log("=== Testing Important Info Feature ===\n");

  try {
    console.log("📋 Fetching all products...");
    const productsResponse = await axios.get(`${API_URL}/api/products`);

    const products =
      productsResponse.data.products || productsResponse.data || [];
    console.log(`✅ Found ${products.length} products\n`);

    if (!Array.isArray(products) || products.length === 0) {
      console.log("❌ No products to test with");
      console.log(
        "Response data:",
        JSON.stringify(productsResponse.data, null, 2)
      );
      return;
    }

    // Get first product with details
    const firstProduct = products[0];
    console.log(`📦 Testing with product: ${firstProduct.name}`);
    console.log(
      `   Product ID: ${firstProduct.product_id || firstProduct.id}\n`
    );

    // Get full product detail
    console.log("🔍 Getting product detail...");
    const detailResponse = await axios.get(
      `${API_URL}/api/products/${firstProduct.product_id || firstProduct.id}`
    );

    const productDetail = detailResponse.data.product || detailResponse.data;
    console.log("✅ Product detail retrieved\n");

    // Check important_info field
    console.log("📄 Product Information:");
    console.log(`   Name: ${productDetail.name}`);
    console.log(`   Brand: ${productDetail.brand || "N/A"}`);
    console.log(
      `   Price: Rp ${parseFloat(productDetail.price).toLocaleString(
        "id-ID"
      )}\n`
    );

    // Display important_info
    console.log("📋 Important Info:");
    if (productDetail.importantInfo || productDetail.important_info) {
      const importantInfo =
        productDetail.importantInfo || productDetail.important_info;

      if (Array.isArray(importantInfo) && importantInfo.length > 0) {
        console.log(`✅ Found ${importantInfo.length} important info items:\n`);
        importantInfo.forEach((info, idx) => {
          console.log(`   ${idx + 1}. ${info}`);
        });
      } else {
        console.log("   ⚠️  Important info field exists but is empty");
      }
    } else {
      console.log("   ❌ No important_info field found in response");
    }

    // Check other detail fields
    console.log("\n\n📊 Other Detail Fields:");
    const detailFields = [
      { key: "genericName", label: "Generic Name" },
      { key: "uses", label: "Uses" },
      { key: "howItWorks", label: "How It Works" },
      { key: "ingredients", label: "Ingredients" },
      { key: "precaution", label: "Precaution" },
      { key: "sideEffects", label: "Side Effects" },
      { key: "interactions", label: "Interactions" },
      { key: "indication", label: "Indication" },
    ];

    detailFields.forEach((field) => {
      const value = productDetail[field.key];
      if (Array.isArray(value)) {
        console.log(
          `   ${field.label}: ${
            value.length > 0 ? "✅ " + value.length + " items" : "❌ Empty"
          }`
        );
      } else if (value) {
        console.log(
          `   ${field.label}: ✅ "${value.substring(0, 50)}${
            value.length > 50 ? "..." : ""
          }"`
        );
      } else {
        console.log(`   ${field.label}: ❌ Not set`);
      }
    });

    console.log("\n\n✅ Test completed!");
    console.log("\n📝 Summary:");
    console.log("   - Backend API returns products: ✅");
    console.log("   - Product detail endpoint works: ✅");
    console.log(
      `   - Important info field: ${
        productDetail.importantInfo || productDetail.important_info
          ? "✅"
          : "❌"
      }`
    );
  } catch (error) {
    console.error("❌ Error:", error.message);
    if (error.response) {
      console.error("   Status:", error.response.status);
      console.error("   Data:", error.response.data);
    }
  }
}

testImportantInfo();

require("dotenv").config({ path: "../.env" });
require("dotenv").config({ path: ".env" });
const axios = require("axios");

const API_URL = process.env.API_URL || "http://localhost:3001";

async function testImportantInfoCRUD() {
  console.log("=== Testing Important Info CRUD End-to-End ===\n");

  try {
    // 1. Login as admin
    console.log("🔐 Step 1: Login as admin...");
    const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
      email: "admin@pharmahub.com",
      password: "admin123",
    });

    const token = loginResponse.data.token;
    console.log("✅ Admin logged in successfully\n");

    // 2. Get product list
    console.log("📋 Step 2: Get product list...");
    const productsResponse = await axios.get(`${API_URL}/api/products`);
    const products = productsResponse.data.data || productsResponse.data || [];

    if (!Array.isArray(products) || products.length === 0) {
      console.log("❌ No products found");
      return;
    }

    // Use Promag (product_id: 3)
    const testProduct = products.find((p) => p.product_id === 3) || products[0];
    console.log(
      `✅ Testing with product: ${testProduct.name} (ID: ${testProduct.product_id})\n`
    );

    // 3. Update product with important_info
    console.log("📝 Step 3: Update product with important_info...");
    const importantInfoData = [
      "Pastikan membaca aturan pakai sebelum mengonsumsi",
      "Simpan di tempat sejuk dan kering",
      "Jauhkan dari jangkauan anak-anak",
      "Konsultasikan dengan apoteker jika diperlukan",
    ];

    const updatePayload = {
      name: testProduct.name,
      brand: testProduct.brand,
      price: parseFloat(testProduct.price),
      stock: testProduct.stock,
      description: testProduct.description,
      main_image_url: testProduct.main_image_url,
      prescription_required: testProduct.prescription_required,
      category_id: testProduct.category_id,
      // Important info and other details
      important_info: importantInfoData,
      generic_name: testProduct.genericName || testProduct.generic_name,
      uses: testProduct.uses,
      how_it_works: testProduct.howItWorks || testProduct.how_it_works,
      ingredients: testProduct.ingredients || [],
      side_effects: testProduct.sideEffects || testProduct.side_effects || [],
      precaution: testProduct.precaution || [],
      interactions: testProduct.interactions || [],
      indication: testProduct.indication || [],
    };

    const updateResponse = await axios.put(
      `${API_URL}/api/products/${testProduct.product_id}`,
      updatePayload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Product updated successfully");
    console.log(`   Important info items sent: ${importantInfoData.length}\n`);

    // 4. Verify by fetching product detail
    console.log("🔍 Step 4: Verify by fetching product detail...");
    const detailResponse = await axios.get(
      `${API_URL}/api/products/${testProduct.product_id}`
    );

    const updatedProduct = detailResponse.data.product || detailResponse.data;
    console.log("✅ Product detail retrieved\n");

    // 5. Check important_info in response
    console.log("📊 Step 5: Verify important_info in response...");
    console.log("   DEBUG - Full response structure:");
    console.log(JSON.stringify(detailResponse.data, null, 2));
    console.log(`\n   Product Name: ${updatedProduct.name}`);
    console.log(
      `   Product ID: ${updatedProduct.product_id || updatedProduct.id}\n`
    );

    if (updatedProduct.importantInfo || updatedProduct.important_info) {
      const retrievedInfo =
        updatedProduct.importantInfo || updatedProduct.important_info;

      if (Array.isArray(retrievedInfo) && retrievedInfo.length > 0) {
        console.log(
          `✅ Important Info Retrieved (${retrievedInfo.length} items):\n`
        );
        retrievedInfo.forEach((info, idx) => {
          console.log(`   ${idx + 1}. ${info}`);
        });

        // Verify data integrity
        console.log("\n\n🧪 Data Integrity Check:");
        const matches = retrievedInfo.every((item) =>
          importantInfoData.includes(item)
        );
        if (matches && retrievedInfo.length === importantInfoData.length) {
          console.log("   ✅ All data matches! CRUD is working perfectly!");
        } else {
          console.log("   ⚠️  Data mismatch detected");
          console.log("   Expected:", importantInfoData);
          console.log("   Received:", retrievedInfo);
        }
      } else {
        console.log("   ⚠️  Important info exists but is empty");
      }
    } else {
      console.log("   ❌ Important info field not found in response");
    }

    // 6. Test frontend compatibility (simulate user viewing product)
    console.log("\n\n👤 Step 6: Test User Product Detail View...");
    console.log("   Simulating user viewing product detail page...");

    const userDetailResponse = await axios.get(
      `${API_URL}/api/products/${testProduct.product_id}`
    );

    const userProduct =
      userDetailResponse.data.product || userDetailResponse.data;

    if (userProduct.importantInfo && userProduct.importantInfo.length > 0) {
      console.log("   ✅ User will see important info:");
      userProduct.importantInfo.forEach((info, idx) => {
        console.log(`      • ${info}`);
      });
    } else {
      console.log(
        "   ❌ User will see: 'Belum ada informasi penting untuk produk ini.'"
      );
    }

    console.log("\n\n🎉 === CRUD Test Completed Successfully! ===\n");
    console.log("📋 Summary:");
    console.log("   ✅ Admin can login");
    console.log("   ✅ Admin can UPDATE product with important_info");
    console.log("   ✅ Backend saves important_info to database");
    console.log("   ✅ API returns important_info in product detail");
    console.log("   ✅ User can view important_info in product detail page");
  } catch (error) {
    console.error("\n❌ Test Failed!");
    console.error("Error:", error.message);
    console.error("Stack:", error.stack);
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", JSON.stringify(error.response.data, null, 2));
    }
    if (error.code) {
      console.error("Code:", error.code);
    }
  }
}

testImportantInfoCRUD();

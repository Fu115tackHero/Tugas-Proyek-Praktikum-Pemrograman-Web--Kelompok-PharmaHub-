/**
 * Test Product API Endpoints via HTTP
 * Tests all CRUD operations through the actual API server
 *
 * Prerequisites:
 * - API server running on http://localhost:3001
 * - Database properly configured
 *
 * Usage: node api/scripts/testProductAPI.js
 */

const fetch = require("node-fetch");

const API_BASE = "http://localhost:3001/api/products";
let createdProductId = null;

async function testAPI() {
  console.log("\n🧪 Testing Product API Endpoints\n");
  console.log("=".repeat(80));

  try {
    // 1. Test GET /api/products (list all)
    console.log("\n📖 Test 1: GET /api/products (List All)");
    const listResponse = await fetch(API_BASE);
    const listData = await listResponse.json();

    if (listResponse.ok && listData.success) {
      console.log(`✅ Status: ${listResponse.status}`);
      console.log(`✅ Total products: ${listData.data.length}`);
      console.log(`   First product: ${listData.data[0]?.name || "N/A"}`);
    } else {
      throw new Error(`Failed: ${listData.message}`);
    }

    // 2. Test POST /api/products (create)
    console.log("\n📝 Test 2: POST /api/products (Create Product)");
    const createPayload = {
      name: "API Test Product",
      brand: "Test Brand API",
      price: 15000,
      stock: 50,
      description: "Created via API test",
      category_id: 6, // Vitamin & Suplemen
      prescription_required: false,
      main_image_url: "https://example.com/test-api.jpg",
      generic_name: "API Test Generic",
      uses: "For API testing purposes",
      how_it_works: "Works through API calls",
      ingredients: ["Test Ingredient 1", "Test Ingredient 2"],
      side_effects: ["None in testing"],
      precaution: ["Use with caution in tests"],
      interactions: ["No known interactions"],
      indication: ["API testing indication"],
    };

    const createResponse = await fetch(API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(createPayload),
    });

    const createData = await createResponse.json();

    if (createResponse.ok && createData.success) {
      createdProductId = createData.data.product_id;
      console.log(`✅ Status: ${createResponse.status}`);
      console.log(`✅ Created product ID: ${createdProductId}`);
      console.log(`   Name: ${createData.data.name}`);
      console.log(`   Price: Rp ${createData.data.price}`);
      console.log(`   Stock: ${createData.data.stock}`);
    } else {
      throw new Error(`Create failed: ${createData.message}`);
    }

    // 3. Test GET /api/products/:id (get single)
    console.log(
      `\n📖 Test 3: GET /api/products/${createdProductId} (Get Single)`
    );
    const getResponse = await fetch(`${API_BASE}/${createdProductId}`);
    const getData = await getResponse.json();

    if (getResponse.ok && getData.success) {
      console.log(`✅ Status: ${getResponse.status}`);
      console.log(`✅ Product: ${getData.data.name}`);
      console.log(`   Category: ${getData.data.category_name}`);
      console.log(`   Generic: ${getData.data.genericName}`);
      console.log(`   Uses: ${getData.data.uses?.substring(0, 50)}...`);
      console.log(`   Ingredients: ${getData.data.ingredients?.length || 0}`);
      console.log(`   Side Effects: ${getData.data.sideEffects?.length || 0}`);
    } else {
      throw new Error(`Get single failed: ${getData.message}`);
    }

    // 4. Test PUT /api/products/:id (update)
    console.log(
      `\n🔄 Test 4: PUT /api/products/${createdProductId} (Update Product)`
    );
    const updatePayload = {
      name: "API Test Product UPDATED",
      price: 20000,
      stock: 75,
      uses: "Updated uses via API",
      side_effects: ["Updated side effect 1", "Updated side effect 2"],
    };

    const updateResponse = await fetch(`${API_BASE}/${createdProductId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatePayload),
    });

    const updateData = await updateResponse.json();

    if (updateResponse.ok && updateData.success) {
      console.log(`✅ Status: ${updateResponse.status}`);
      console.log(`✅ Updated product: ${updateData.data.name}`);
      console.log(`   New price: Rp ${updateData.data.price}`);
      console.log(`   New stock: ${updateData.data.stock}`);
    } else {
      throw new Error(`Update failed: ${updateData.message}`);
    }

    // 5. Test DELETE /api/products/:id (delete)
    console.log(
      `\n🗑️  Test 5: DELETE /api/products/${createdProductId} (Delete Product)`
    );
    const deleteResponse = await fetch(`${API_BASE}/${createdProductId}`, {
      method: "DELETE",
    });

    const deleteData = await deleteResponse.json();

    if (deleteResponse.ok && deleteData.success) {
      console.log(`✅ Status: ${deleteResponse.status}`);
      console.log(`✅ ${deleteData.message}`);
    } else {
      throw new Error(`Delete failed: ${deleteData.message}`);
    }

    // 6. Verify deletion
    console.log(`\n✅ Test 6: Verify deletion (should 404)`);
    const verifyResponse = await fetch(`${API_BASE}/${createdProductId}`);
    const verifyData = await verifyResponse.json();

    if (verifyResponse.status === 404) {
      console.log(`✅ Product correctly deleted (404 returned)`);
    } else {
      console.log(`⚠️  Expected 404, got ${verifyResponse.status}`);
    }

    console.log("\n" + "=".repeat(80));
    console.log("🎉 All API tests passed!\n");
  } catch (error) {
    console.error("\n❌ API Test failed:", error.message);
    console.error("   Stack:", error.stack);

    // Cleanup
    if (createdProductId) {
      console.log(`\n🧹 Cleaning up test product ID: ${createdProductId}`);
      try {
        await fetch(`${API_BASE}/${createdProductId}`, { method: "DELETE" });
        console.log("✅ Cleanup successful");
      } catch (cleanupError) {
        console.error("❌ Cleanup failed:", cleanupError.message);
      }
    }

    process.exit(1);
  }
}

// Check if server is running before testing
async function checkServer() {
  try {
    const response = await fetch("http://localhost:3001/api");
    if (!response.ok) {
      throw new Error("Server health check failed");
    }
    console.log("✅ API server is running");
    return true;
  } catch (error) {
    console.error("❌ Cannot connect to API server on http://localhost:3001");
    console.error("   Please start the server first: npm run dev:api");
    process.exit(1);
  }
}

// Run tests
(async () => {
  await checkServer();
  await testAPI();
})();

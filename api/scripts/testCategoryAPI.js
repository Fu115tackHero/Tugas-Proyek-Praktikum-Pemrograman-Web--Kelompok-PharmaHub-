/**
 * Test Category Creation via API
 */

const fetch = require("node-fetch");

async function testCategoryAPI() {
  const BASE_URL = "http://localhost:3001/api";

  try {
    console.log("\n🧪 Testing Category Management API\n");
    console.log("=".repeat(70));

    // Test 1: Get all categories
    console.log("\n📋 Test 1: GET /api/categories");
    const getResponse = await fetch(`${BASE_URL}/categories`);
    const getResult = await getResponse.json();
    
    if (getResult.success) {
      console.log(`✅ Found ${getResult.data.length} categories:`);
      getResult.data.slice(0, 5).forEach((cat) => {
        console.log(`   - ${cat.category_id}: ${cat.category_name}`);
      });
      if (getResult.data.length > 5) {
        console.log(`   ... and ${getResult.data.length - 5} more`);
      }
    } else {
      console.log("❌ Failed to get categories");
      return;
    }

    // Test 2: Create new category
    console.log("\n📝 Test 2: POST /api/categories (Create new category)");
    const testCategoryName = `Test Category ${Date.now()}`;
    const createResponse = await fetch(`${BASE_URL}/categories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category_name: testCategoryName,
        description: "This is a test category created by automated test",
      }),
    });
    const createResult = await createResponse.json();

    if (createResult.success) {
      console.log(`✅ Category created successfully!`);
      console.log(`   ID: ${createResult.data.category_id}`);
      console.log(`   Name: ${createResult.data.category_name}`);
      console.log(`   Description: ${createResult.data.description}`);

      const newCategoryId = createResult.data.category_id;

      // Test 3: Get specific category
      console.log(`\n🔍 Test 3: GET /api/categories/${newCategoryId}`);
      const getOneResponse = await fetch(`${BASE_URL}/categories/${newCategoryId}`);
      const getOneResult = await getOneResponse.json();

      if (getOneResult.success) {
        console.log(`✅ Category retrieved:`);
        console.log(`   Name: ${getOneResult.data.category_name}`);
        console.log(`   Active: ${getOneResult.data.is_active}`);
      } else {
        console.log("❌ Failed to get specific category");
      }

      // Test 4: Update category
      console.log(`\n✏️  Test 4: PUT /api/categories/${newCategoryId}`);
      const updateResponse = await fetch(`${BASE_URL}/categories/${newCategoryId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: "Updated description by automated test",
        }),
      });
      const updateResult = await updateResponse.json();

      if (updateResult.success) {
        console.log(`✅ Category updated successfully!`);
        console.log(`   New Description: ${updateResult.data.description}`);
      } else {
        console.log("❌ Failed to update category");
      }

      // Test 5: Delete category
      console.log(`\n🗑️  Test 5: DELETE /api/categories/${newCategoryId}`);
      const deleteResponse = await fetch(`${BASE_URL}/categories/${newCategoryId}`, {
        method: "DELETE",
      });
      const deleteResult = await deleteResponse.json();

      if (deleteResult.success) {
        console.log(`✅ Category deleted successfully!`);
        console.log(`   Deleted: ${deleteResult.data.category_name}`);
      } else {
        console.log("❌ Failed to delete category");
        console.log(`   Reason: ${deleteResult.message}`);
      }
    } else {
      console.log("❌ Failed to create category");
      console.log(`   Error: ${createResult.message}`);
    }

    // Test 6: Try to create duplicate
    console.log("\n🚫 Test 6: Try to create duplicate category");
    const dupResponse = await fetch(`${BASE_URL}/categories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category_name: "Obat Nyeri & Demam", // Existing category
        description: "This should fail",
      }),
    });
    const dupResult = await dupResponse.json();

    if (!dupResult.success) {
      console.log(`✅ Duplicate prevention works!`);
      console.log(`   Message: ${dupResult.message}`);
    } else {
      console.log("❌ Duplicate prevention failed - should have rejected");
    }

    console.log("\n" + "=".repeat(70));
    console.log("\n🎉 All tests completed!\n");
  } catch (error) {
    console.error("\n❌ Test error:", error.message);
  }
}

testCategoryAPI();

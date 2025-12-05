require("dotenv").config({ path: "../.env" });
require("dotenv").config({ path: ".env" });

const productService = require("../services/productService");

async function testCRUD() {
  console.log("=== Testing Product CRUD Operations ===\n");

  let createdProductId = null;

  try {
    // TEST 1: CREATE Product
    console.log("📝 TEST 1: Creating a new product...");
    const testProduct = {
      name: "Test Medicine CRUD",
      brand: "Test Brand",
      price: 50000,
      stock: 100,
      description: "This is a test product for CRUD operations",
      category_id: 1, // Make sure category ID 1 exists
      prescription_required: true,
      min_stock: 10,
      main_image_url: "https://example.com/test-image.jpg",
      // Product details
      generic_name: "Test Generic Name",
      uses: "Test uses description",
      how_it_works: "Test how it works description",
      important_info: [
        "Test important info 1",
        "Test important info 2",
        "Test important info 3",
      ],
      ingredients: ["Test ingredient 1", "Test ingredient 2"],
      side_effects: ["Test side effect 1", "Test side effect 2"],
      precaution: ["Test precaution 1", "Test precaution 2"],
      interactions: ["Test interaction 1", "Test interaction 2"],
      indication: ["Test indication 1", "Test indication 2"],
    };

    const createdProduct = await productService.createProduct(testProduct);
    createdProductId = createdProduct.product_id;
    console.log("✅ Product created successfully!");
    console.log(`   Product ID: ${createdProductId}`);
    console.log(`   Name: ${createdProduct.name}`);
    console.log(`   Price: ${createdProduct.price}`);
    console.log("");

    // TEST 2: READ Product by ID
    console.log("📖 TEST 2: Reading product by ID...");
    const readProduct = await productService.getProductById(createdProductId);
    if (readProduct) {
      console.log("✅ Product retrieved successfully!");
      console.log(`   Name: ${readProduct.name}`);
      console.log(`   Brand: ${readProduct.brand}`);
      console.log(`   Generic Name: ${readProduct.generic_name}`);
      console.log(
        `   Important Info: ${JSON.stringify(readProduct.important_info)}`
      );
      console.log(`   Ingredients: ${JSON.stringify(readProduct.ingredients)}`);
      console.log(
        `   Side Effects: ${JSON.stringify(readProduct.side_effects)}`
      );
    } else {
      console.log("❌ Failed to retrieve product");
    }
    console.log("");

    // TEST 3: READ All Products
    console.log("📚 TEST 3: Reading all products...");
    const allProducts = await productService.getAllProducts();
    console.log(`✅ Retrieved ${allProducts.length} products`);
    const testProductInList = allProducts.find(
      (p) => p.product_id === createdProductId
    );
    if (testProductInList) {
      console.log("✅ Test product found in list");
    } else {
      console.log("❌ Test product NOT found in list");
    }
    console.log("");

    // TEST 4: UPDATE Product
    console.log("🔄 TEST 4: Updating product...");
    const updateData = {
      name: "Test Medicine CRUD - UPDATED",
      price: 75000,
      stock: 150,
      description: "Updated description",
      generic_name: "Updated Generic Name",
      uses: "Updated uses",
      how_it_works: "Updated how it works",
      important_info: [
        "Updated important info 1",
        "Updated important info 2",
        "New important info 3",
        "New important info 4",
      ],
      ingredients: ["Updated ingredient 1", "Updated ingredient 2"],
      side_effects: [
        "Updated side effect 1",
        "Updated side effect 2",
        "New side effect 3",
      ],
      precaution: ["Updated precaution 1", "Updated precaution 2"],
      interactions: ["Updated interaction 1", "Updated interaction 2"],
      indication: ["Updated indication 1", "Updated indication 2"],
    };

    const updatedProduct = await productService.updateProduct(
      createdProductId,
      updateData
    );
    if (updatedProduct) {
      console.log("✅ Product updated successfully!");
      console.log(`   Updated Name: ${updatedProduct.name}`);
      console.log(`   Updated Price: ${updatedProduct.price}`);

      // Verify update by reading again
      const verifyUpdate = await productService.getProductById(
        createdProductId
      );
      console.log(`   Verified Generic Name: ${verifyUpdate.generic_name}`);
      console.log(
        `   Verified Important Info Count: ${
          verifyUpdate.important_info?.length || 0
        }`
      );
    } else {
      console.log("❌ Failed to update product");
    }
    console.log("");

    // TEST 5: DELETE Product
    console.log("🗑️  TEST 5: Deleting product...");
    const deletedProduct = await productService.deleteProduct(createdProductId);
    if (deletedProduct) {
      console.log("✅ Product deleted successfully!");
      console.log(`   Deleted Product ID: ${deletedProduct.product_id}`);

      // Verify deletion
      const verifyDelete = await productService.getProductById(
        createdProductId
      );
      if (!verifyDelete) {
        console.log("✅ Verified: Product no longer exists");
      } else {
        console.log("❌ Warning: Product still exists after deletion");
      }
    } else {
      console.log("❌ Failed to delete product");
    }
    console.log("");

    console.log("✅ All CRUD tests completed successfully!");
  } catch (error) {
    console.error("❌ Test failed with error:");
    console.error(`   Message: ${error.message}`);
    console.error(`   Stack: ${error.stack}`);

    // Cleanup if product was created
    if (createdProductId) {
      try {
        console.log("\n🧹 Cleaning up test product...");
        await productService.deleteProduct(createdProductId);
        console.log("✅ Cleanup successful");
      } catch (cleanupError) {
        console.log("⚠️  Cleanup failed:", cleanupError.message);
      }
    }
  }

  process.exit(0);
}

testCRUD();

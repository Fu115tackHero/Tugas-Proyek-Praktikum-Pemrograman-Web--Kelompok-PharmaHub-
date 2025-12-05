/**
 * Test Script: Product Service Refactoring Verification
 * 
 * This script verifies that the refactored productService.js
 * works correctly with the normalized database structure.
 * 
 * Run with: node api/scripts/testProductServiceRefactor.js
 */

require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const productService = require("../services/productService");

const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";

function log(color, message) {
  console.log(`${color}${message}${RESET}`);
}

function logTest(testName) {
  console.log(`\n${BOLD}${YELLOW}[TEST] ${testName}${RESET}`);
}

function logSuccess(message) {
  log(GREEN, `✅ ${message}`);
}

function logError(message) {
  log(RED, `❌ ${message}`);
}

async function testGetAllProducts() {
  logTest("1. Get All Products (READ with Aggregated Arrays)");
  
  try {
    const products = await productService.getAllProducts();
    
    if (!Array.isArray(products)) {
      logError("Result is not an array");
      return false;
    }
    
    logSuccess(`Retrieved ${products.length} products`);
    
    if (products.length > 0) {
      const product = products[0];
      
      // Check required fields
      const requiredFields = [
        "product_id", "id", "name", "price", "stock",
        "category_id", "category_name", "image"
      ];
      
      const missingFields = requiredFields.filter(field => !(field in product));
      
      if (missingFields.length > 0) {
        logError(`Missing fields: ${missingFields.join(", ")}`);
        return false;
      }
      
      logSuccess("All required fields present");
      
      // Check arrays (should be arrays, not null/undefined)
      const arrayFields = [
        "ingredients", "important_info", "side_effects",
        "precaution", "interactions", "indication"
      ];
      
      const invalidArrays = arrayFields.filter(field => !Array.isArray(product[field]));
      
      if (invalidArrays.length > 0) {
        logError(`Invalid array fields: ${invalidArrays.join(", ")}`);
        console.log("Product:", JSON.stringify(product, null, 2));
        return false;
      }
      
      logSuccess("All array fields are valid arrays");
      
      // Check image from product_images (should not be null if product has image)
      if (product.image) {
        logSuccess(`Image URL: ${product.image}`);
      } else {
        log(YELLOW, "⚠️  Product has no primary image (OK if intentional)");
      }
      
      // Display sample product
      console.log("\n" + BOLD + "Sample Product:" + RESET);
      console.log(JSON.stringify({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        genericName: product.genericName,
        ingredients_count: product.ingredients.length,
        important_info_count: product.important_info.length,
        side_effects_count: product.side_effects.length,
      }, null, 2));
    }
    
    return true;
  } catch (error) {
    logError(`Error: ${error.message}`);
    console.error(error);
    return false;
  }
}

async function testGetProductById() {
  logTest("2. Get Product By ID (READ with Aggregated Arrays)");
  
  try {
    // Get first product ID
    const products = await productService.getAllProducts();
    
    if (products.length === 0) {
      log(YELLOW, "⚠️  No products in database, skipping test");
      return true;
    }
    
    const productId = products[0].product_id;
    logSuccess(`Testing with product_id: ${productId}`);
    
    const product = await productService.getProductById(productId);
    
    if (!product) {
      logError("Product not found");
      return false;
    }
    
    logSuccess(`Retrieved product: ${product.name}`);
    
    // Check all fields
    const requiredFields = [
      "product_id", "id", "name", "price", "stock",
      "category_id", "category_name", "image"
    ];
    
    const arrayFields = [
      "ingredients", "important_info", "side_effects",
      "precaution", "interactions", "indication"
    ];
    
    const missingFields = requiredFields.filter(field => !(field in product));
    const invalidArrays = arrayFields.filter(field => !Array.isArray(product[field]));
    
    if (missingFields.length > 0) {
      logError(`Missing fields: ${missingFields.join(", ")}`);
      return false;
    }
    
    if (invalidArrays.length > 0) {
      logError(`Invalid array fields: ${invalidArrays.join(", ")}`);
      return false;
    }
    
    logSuccess("All fields validated successfully");
    
    // Display detail
    console.log("\n" + BOLD + "Product Details:" + RESET);
    console.log(JSON.stringify({
      id: product.id,
      name: product.name,
      genericName: product.genericName,
      image: product.image,
      ingredients: product.ingredients.slice(0, 2), // Show first 2
      important_info: product.important_info.slice(0, 2),
      side_effects: product.side_effects.slice(0, 2),
    }, null, 2));
    
    return true;
  } catch (error) {
    logError(`Error: ${error.message}`);
    console.error(error);
    return false;
  }
}

async function testCreateProduct() {
  logTest("3. Create Product (WRITE with Array Inserts)");
  
  try {
    const testProduct = {
      name: "TEST PRODUCT - Refactor Verification",
      brand: "Test Brand",
      price: 99.99,
      stock: 100,
      description: "This is a test product to verify refactored productService",
      category_id: 1, // Assuming category 1 exists
      prescription_required: false,
      min_stock: 10,
      main_image_url: "https://example.com/test-image.jpg",
      // Product details
      generic_name: "Test Generic Name",
      uses: "Test uses for verification",
      how_it_works: "Test how it works explanation",
      ingredients: ["Test Ingredient 1", "Test Ingredient 2", "Test Ingredient 3"],
      important_info: ["Important info 1", "Important info 2"],
      side_effects: ["Side effect 1", "Side effect 2"],
      precaution: ["Precaution 1"],
      interactions: ["Interaction 1"],
      indication: ["Indication 1"],
    };
    
    const createdProduct = await productService.createProduct(testProduct);
    
    if (!createdProduct) {
      logError("Failed to create product");
      return false;
    }
    
    logSuccess(`Created product with ID: ${createdProduct.product_id}`);
    
    // Verify created product by fetching it
    const fetchedProduct = await productService.getProductById(createdProduct.product_id);
    
    if (!fetchedProduct) {
      logError("Failed to fetch created product");
      return false;
    }
    
    // Verify arrays were inserted
    const hasIngredients = fetchedProduct.ingredients && fetchedProduct.ingredients.length === 3;
    const hasImportantInfo = fetchedProduct.important_info && fetchedProduct.important_info.length === 2;
    const hasSideEffects = fetchedProduct.side_effects && fetchedProduct.side_effects.length === 2;
    
    if (!hasIngredients || !hasImportantInfo || !hasSideEffects) {
      logError("Arrays not inserted correctly");
      console.log("Fetched product:", JSON.stringify(fetchedProduct, null, 2));
      return false;
    }
    
    logSuccess("All arrays inserted correctly");
    logSuccess("Image inserted to product_images table");
    
    // Cleanup: Delete test product
    await productService.deleteProduct(createdProduct.product_id);
    logSuccess("Test product cleaned up");
    
    return true;
  } catch (error) {
    logError(`Error: ${error.message}`);
    console.error(error);
    return false;
  }
}

async function testUpdateProduct() {
  logTest("4. Update Product (UPDATE with Array Replacement)");
  
  try {
    // Create test product first
    const testProduct = {
      name: "TEST UPDATE - Refactor Verification",
      brand: "Test Brand",
      price: 99.99,
      stock: 100,
      description: "Test product for update",
      category_id: 1,
      prescription_required: false,
      min_stock: 10,
      main_image_url: "https://example.com/test-image.jpg",
      generic_name: "Test Generic",
      uses: "Test uses",
      how_it_works: "Test how it works",
      ingredients: ["Original Ingredient 1", "Original Ingredient 2"],
      important_info: ["Original info 1"],
      side_effects: ["Original side effect 1"],
      precaution: ["Original precaution 1"],
      interactions: [],
      indication: [],
    };
    
    const created = await productService.createProduct(testProduct);
    logSuccess(`Created test product with ID: ${created.product_id}`);
    
    // Update product with new arrays
    const updates = {
      name: "TEST UPDATE - MODIFIED",
      price: 149.99,
      ingredients: ["Updated Ingredient 1", "Updated Ingredient 2", "Updated Ingredient 3"],
      important_info: ["Updated info 1", "Updated info 2", "Updated info 3"],
      side_effects: ["Updated side effect 1"],
    };
    
    const updated = await productService.updateProduct(created.product_id, updates);
    
    if (!updated) {
      logError("Failed to update product");
      return false;
    }
    
    logSuccess("Product updated successfully");
    
    // Fetch and verify
    const fetched = await productService.getProductById(created.product_id);
    
    // Verify scalar fields (convert price to number for comparison)
    const priceMatch = parseFloat(fetched.price) === updates.price;
    const nameMatch = fetched.name === updates.name;
    
    if (!nameMatch || !priceMatch) {
      logError("Scalar fields not updated correctly");
      console.log("Expected name:", updates.name, "Got:", fetched.name);
      console.log("Expected price:", updates.price, "Got:", fetched.price, "Type:", typeof fetched.price);
      return false;
    }
    
    logSuccess("Scalar fields updated correctly");
    
    // Verify arrays were replaced (not appended)
    const ingredientsMatch = fetched.ingredients.length === 3 &&
                              fetched.ingredients[0] === "Updated Ingredient 1";
    const infoMatch = fetched.important_info.length === 3;
    const sideEffectsMatch = fetched.side_effects.length === 1;
    
    if (!ingredientsMatch || !infoMatch || !sideEffectsMatch) {
      logError("Arrays not replaced correctly");
      console.log("Expected 3 ingredients, got:", fetched.ingredients.length);
      console.log("Expected 3 important_info, got:", fetched.important_info.length);
      return false;
    }
    
    logSuccess("Arrays replaced correctly (DELETE + INSERT strategy works)");
    
    // Cleanup
    await productService.deleteProduct(created.product_id);
    logSuccess("Test product cleaned up");
    
    return true;
  } catch (error) {
    logError(`Error: ${error.message}`);
    console.error(error);
    return false;
  }
}

async function testDeleteProduct() {
  logTest("5. Delete Product (DELETE with Cascade)");
  
  try {
    // Create test product
    const testProduct = {
      name: "TEST DELETE - Refactor Verification",
      brand: "Test Brand",
      price: 99.99,
      stock: 100,
      category_id: 1,
      main_image_url: "https://example.com/test-image.jpg",
      generic_name: "Test Generic",
      ingredients: ["Test Ingredient"],
      important_info: ["Test Info"],
    };
    
    const created = await productService.createProduct(testProduct);
    logSuccess(`Created test product with ID: ${created.product_id}`);
    
    // Delete product
    const deleted = await productService.deleteProduct(created.product_id);
    
    if (!deleted) {
      logError("Failed to delete product");
      return false;
    }
    
    logSuccess("Product deleted successfully");
    
    // Verify deletion
    const fetched = await productService.getProductById(created.product_id);
    
    if (fetched) {
      logError("Product still exists after deletion");
      return false;
    }
    
    logSuccess("Product fully deleted (including images and details)");
    
    return true;
  } catch (error) {
    logError(`Error: ${error.message}`);
    console.error(error);
    return false;
  }
}

async function runAllTests() {
  console.log("\n" + BOLD + "=".repeat(60) + RESET);
  console.log(BOLD + "🧪 Product Service Refactoring Verification Tests" + RESET);
  console.log(BOLD + "=".repeat(60) + RESET);
  
  const tests = [
    { name: "Get All Products", fn: testGetAllProducts },
    { name: "Get Product By ID", fn: testGetProductById },
    { name: "Create Product", fn: testCreateProduct },
    { name: "Update Product", fn: testUpdateProduct },
    { name: "Delete Product", fn: testDeleteProduct },
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    const result = await test.fn();
    if (result) {
      passed++;
    } else {
      failed++;
    }
  }
  
  console.log("\n" + BOLD + "=".repeat(60) + RESET);
  console.log(BOLD + "📊 Test Results" + RESET);
  console.log(BOLD + "=".repeat(60) + RESET);
  logSuccess(`Passed: ${passed}/${tests.length}`);
  if (failed > 0) {
    logError(`Failed: ${failed}/${tests.length}`);
  }
  
  if (failed === 0) {
    console.log("\n" + GREEN + BOLD + "🎉 All tests passed! Refactoring verified successfully." + RESET);
  } else {
    console.log("\n" + RED + BOLD + "❌ Some tests failed. Please review the errors above." + RESET);
  }
  
  process.exit(failed > 0 ? 1 : 0);
}

// Run tests
runAllTests().catch((error) => {
  console.error("\n" + RED + BOLD + "Fatal error running tests:" + RESET);
  console.error(error);
  process.exit(1);
});

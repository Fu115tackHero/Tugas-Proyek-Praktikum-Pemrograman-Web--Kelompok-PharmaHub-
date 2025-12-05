/**
 * Test Product Update
 */

const { Pool } = require("pg");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const productService = require("../services/productService");

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME,
});

async function testProductUpdate() {
  const client = await pool.connect();
  try {
    console.log("🧪 Testing product update...\n");

    // Create a test product
    console.log("📝 Creating test product...");
    const testProduct = {
      name: "Original Product Name",
      brand: "Original Brand",
      price: 10000,
      stock: 50,
      description: "Original description",
      category_id: 1,
      prescription_required: false,
      main_image_url: "https://via.placeholder.com/150",
      generic_name: "Original Generic",
      uses: "Original uses",
      ingredients: ["Ingredient 1"],
      side_effects: ["Effect 1"],
      precaution: ["Precaution 1"],
      interactions: ["Interaction 1"],
      indication: ["Indication 1"],
    };

    const created = await productService.createProduct(testProduct);
    const productId = created.product_id;
    console.log(`✅ Test product created with ID: ${productId}`);

    // Check original data
    let checkQuery = `
      SELECT 
        p.product_id,
        p.name,
        p.brand,
        p.price,
        p.stock,
        p.description,
        pd.generic_name,
        pd.uses
      FROM products p
      LEFT JOIN product_details pd ON p.product_id = pd.product_id
      WHERE p.product_id = $1;
    `;
    let result = await client.query(checkQuery, [productId]);
    console.log(`\n📋 Before update:`);
    console.log(`   Name: ${result.rows[0].name}`);
    console.log(`   Brand: ${result.rows[0].brand}`);
    console.log(`   Price: ${result.rows[0].price}`);
    console.log(`   Stock: ${result.rows[0].stock}`);
    console.log(`   Description: ${result.rows[0].description}`);
    console.log(`   Generic Name: ${result.rows[0].generic_name}`);

    // Update the product
    console.log(`\n✏️  Updating product...`);
    const updatePayload = {
      name: "Updated Product Name",
      brand: "Updated Brand",
      price: 25000,
      stock: 100,
      description: "Updated description",
      category_id: 1,
      prescription_required: true,
      main_image_url: "https://via.placeholder.com/150?updated=true",
      generic_name: "Updated Generic",
      uses: "Updated uses",
      ingredients: ["New Ingredient 1", "New Ingredient 2"],
      side_effects: ["New Effect 1", "New Effect 2"],
      precaution: ["New Precaution 1"],
      interactions: ["New Interaction 1"],
      indication: ["New Indication 1", "New Indication 2"],
    };

    const updated = await productService.updateProduct(productId, updatePayload);
    
    if (updated) {
      console.log(`✅ Product updated successfully`);
    } else {
      console.log(`❌ Product update failed`);
      return;
    }

    // Check updated data
    result = await client.query(checkQuery, [productId]);
    console.log(`\n📋 After update:`);
    console.log(`   Name: ${result.rows[0].name}`);
    console.log(`   Brand: ${result.rows[0].brand}`);
    console.log(`   Price: ${result.rows[0].price}`);
    console.log(`   Stock: ${result.rows[0].stock}`);
    console.log(`   Description: ${result.rows[0].description}`);
    console.log(`   Generic Name: ${result.rows[0].generic_name}`);

    // Verify changes
    const nameChanged = result.rows[0].name === "Updated Product Name";
    const brandChanged = result.rows[0].brand === "Updated Brand";
    const priceChanged = result.rows[0].price === "25000.00";
    const stockChanged = result.rows[0].stock === 100;
    const genericChanged = result.rows[0].generic_name === "Updated Generic";

    if (nameChanged && brandChanged && priceChanged && stockChanged && genericChanged) {
      console.log(`\n✅ All fields updated correctly!`);
    } else {
      console.log(`\n⚠️  Some fields were not updated correctly`);
      console.log(`   Name: ${nameChanged ? "✅" : "❌"}`);
      console.log(`   Brand: ${brandChanged ? "✅" : "❌"}`);
      console.log(`   Price: ${priceChanged ? "✅" : "❌"}`);
      console.log(`   Stock: ${stockChanged ? "✅" : "❌"}`);
      console.log(`   Generic: ${genericChanged ? "✅" : "❌"}`);
    }

    // Clean up
    console.log("\n🧹 Cleaning up test data...");
    await client.query("DELETE FROM products WHERE product_id = $1", [productId]);
    console.log("✅ Test data cleaned up");

    console.log("\n✅ Update test completed successfully!");
  } catch (error) {
    console.error("❌ Test failed:", error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

testProductUpdate().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});

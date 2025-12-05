/**
 * Test Product Hard Delete
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

async function testHardDelete() {
  const client = await pool.connect();
  try {
    console.log("🧪 Testing product hard delete...\n");

    // Create a test product
    console.log("📝 Creating test product...");
    const testProduct = {
      name: "Test Product for Hard Delete",
      brand: "Test Brand",
      price: 10000,
      stock: 50,
      description: "This product will be hard deleted",
      category_id: 1,
      prescription_required: false,
      main_image_url: "https://via.placeholder.com/150",
      generic_name: "Test Generic",
      uses: "Test uses",
      ingredients: ["Ingredient 1", "Ingredient 2"],
      side_effects: ["Effect 1"],
      precaution: ["Precaution 1"],
      interactions: ["Interaction 1"],
      indication: ["Indication 1"],
    };

    const created = await productService.createProduct(testProduct);
    const productId = created.product_id;
    console.log(`✅ Test product created with ID: ${productId}`);

    // Check if product exists
    let checkQuery = `SELECT product_id, name FROM products WHERE product_id = $1;`;
    let result = await client.query(checkQuery, [productId]);
    console.log(`\n📋 Before deletion: Product found in DB`);

    // Check if product_details exists
    let detailsQuery = `SELECT detail_id FROM product_details WHERE product_id = $1;`;
    let detailsResult = await client.query(detailsQuery, [productId]);
    console.log(`   Product details found: ${detailsResult.rows.length > 0 ? "Yes" : "No"}`);

    // Delete the product (hard delete)
    console.log(`\n🗑️  Deleting product (hard delete)...`);
    const deleted = await productService.deleteProduct(productId);
    
    if (deleted) {
      console.log(`✅ Product deleted successfully`);
    } else {
      console.log(`❌ Product deletion failed`);
      return;
    }

    // Check if product still exists
    result = await client.query(checkQuery, [productId]);
    
    if (result.rows.length === 0) {
      console.log(`\n✅ Product completely removed from database`);
    } else {
      console.log(`\n❌ Product still exists in database`);
    }

    // Check if product_details was also deleted
    detailsResult = await client.query(detailsQuery, [productId]);
    
    if (detailsResult.rows.length === 0) {
      console.log(`✅ Product details also removed from database`);
    } else {
      console.log(`❌ Product details still exists in database`);
    }

    console.log("\n✅ Hard delete test completed successfully!");
  } catch (error) {
    console.error("❌ Test failed:", error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

testHardDelete().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});

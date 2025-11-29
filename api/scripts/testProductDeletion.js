/**
 * Test Product Deletion
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

async function testProductDeletion() {
  const client = await pool.connect();
  try {
    console.log("🧪 Testing product deletion (soft delete)...\n");

    // First, create a test product
    console.log("📝 Creating test product...");
    const testProduct = {
      name: "Test Product to Delete",
      brand: "Test Brand",
      price: 10000,
      stock: 50,
      description: "This product will be deleted",
      category_id: 1,
      prescription_required: false,
      main_image_url: "https://via.placeholder.com/150",
    };

    const created = await productService.createProduct(testProduct);
    console.log(`✅ Test product created with ID: ${created.product_id}`);

    // Check if product is active
    let checkQuery = `SELECT product_id, name, is_active FROM products WHERE product_id = $1;`;
    let result = await client.query(checkQuery, [created.product_id]);
    console.log(`\n📋 Before deletion:`);
    console.log(`   Product: ${result.rows[0].name}`);
    console.log(`   Is Active: ${result.rows[0].is_active}`);

    // Delete the product (soft delete)
    console.log(`\n🗑️  Deleting product...`);
    const deleted = await productService.deleteProduct(created.product_id);
    
    if (deleted) {
      console.log(`✅ Product soft-deleted successfully`);
    } else {
      console.log(`❌ Product deletion failed`);
      return;
    }

    // Check if product is now inactive
    result = await client.query(checkQuery, [created.product_id]);
    console.log(`\n📋 After deletion:`);
    console.log(`   Product: ${result.rows[0].name}`);
    console.log(`   Is Active: ${result.rows[0].is_active}`);

    // Verify product doesn't show in getAllProducts (which filters is_active = true)
    const allProducts = await productService.getAllProducts();
    const foundInList = allProducts.find(p => p.id === created.product_id);
    
    if (!foundInList) {
      console.log(`\n✅ Product correctly hidden from active product list`);
    } else {
      console.log(`\n❌ Product still appears in active product list`);
    }

    // Clean up - hard delete
    console.log("\n🧹 Cleaning up test data (hard delete)...");
    await client.query("DELETE FROM products WHERE product_id = $1", [
      created.product_id,
    ]);
    console.log("✅ Test data cleaned up");

    console.log("\n✅ Test completed successfully!");
  } catch (error) {
    console.error("❌ Test failed:", error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

testProductDeletion().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});

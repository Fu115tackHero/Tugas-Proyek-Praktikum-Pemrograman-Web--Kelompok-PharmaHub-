/**
 * Test Product Creation with Details
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

async function testProductCreation() {
  try {
    console.log("🧪 Testing product creation with details...\n");

    const testProduct = {
      name: "Test Medicine",
      brand: "Test Pharma",
      price: 50000,
      stock: 100,
      description: "This is a test medicine for testing purposes",
      category_id: 1, // Obat Nyeri & Demam
      prescription_required: false,
      main_image_url: "https://via.placeholder.com/150",
      // Details
      generic_name: "Test Generic",
      uses: "Used for testing the product creation system",
      ingredients: ["Test ingredient 1", "Test ingredient 2", "Test ingredient 3"],
      side_effects: ["Side effect 1", "Side effect 2"],
      precaution: ["Precaution 1", "Precaution 2", "Precaution 3"],
      interactions: ["Interaction 1"],
      indication: ["Indication 1", "Indication 2"],
    };

    // Create product
    console.log("📝 Creating product...");
    const created = await productService.createProduct(testProduct);
    console.log("✅ Product created:", created);

    // Verify product_details was also created
    const client = await pool.connect();
    try {
      const detailsQuery = `
        SELECT 
          pd.*,
          p.name as product_name
        FROM product_details pd
        JOIN products p ON pd.product_id = p.product_id
        WHERE pd.product_id = $1;
      `;
      const result = await client.query(detailsQuery, [created.product_id]);

      if (result.rows.length > 0) {
        const details = result.rows[0];
        console.log("\n✅ Product details verified:");
        console.log(`   Product: ${details.product_name}`);
        console.log(`   Generic Name: ${details.generic_name}`);
        console.log(`   Uses: ${details.uses}`);
        console.log(`   Ingredients: ${details.ingredients.length} items`);
        console.log(`   Side Effects: ${details.side_effects.length} items`);
        console.log(`   Precautions: ${details.precaution.length} items`);
        console.log(`   Interactions: ${details.interactions.length} items`);
        console.log(`   Indications: ${details.indication.length} items`);
      } else {
        console.log("❌ Product details not found!");
      }

      // Clean up - delete test product
      console.log("\n🧹 Cleaning up test data...");
      await client.query("DELETE FROM products WHERE product_id = $1", [
        created.product_id,
      ]);
      console.log("✅ Test data cleaned up");
    } finally {
      client.release();
    }

    console.log("\n✅ Test completed successfully!");
  } catch (error) {
    console.error("❌ Test failed:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

testProductCreation().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});

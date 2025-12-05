/**
 * Test Full CRUD Operations for Products API
 * Tests create, read, update, delete endpoints
 */

const { Pool } = require("pg");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME,
});

async function testCRUD() {
  const client = await pool.connect();
  let createdProductId = null;

  try {
    console.log("\n🧪 Testing Product CRUD Operations\n");
    console.log("=".repeat(80));

    // 1. Test CREATE (INSERT)
    console.log("\n📝 Test 1: CREATE Product");
    const createQuery = `
      INSERT INTO products (
        name, brand, price, stock, description, 
        category_id, prescription_required, main_image_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING product_id, name, price, stock;
    `;

    const createValues = [
      "Test Product CRUD",
      "Test Brand",
      25000.5, // DECIMAL test
      100, // INTEGER test
      "Test description for CRUD",
      1, // Category ID (Obat Nyeri & Demam)
      false,
      "https://example.com/test.jpg",
    ];

    const createResult = await client.query(createQuery, createValues);
    createdProductId = createResult.rows[0].product_id;

    console.log("✅ Product created:");
    console.log(`   ID: ${createdProductId}`);
    console.log(`   Name: ${createResult.rows[0].name}`);
    console.log(`   Price: ${createResult.rows[0].price}`);
    console.log(`   Stock: ${createResult.rows[0].stock}`);

    // Insert product_details for the test product
    const detailQuery = `
      INSERT INTO product_details (
        product_id, generic_name, uses, ingredients, side_effects, precaution
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING detail_id;
    `;

    const detailResult = await client.query(detailQuery, [
      createdProductId,
      "Test Generic",
      "Test uses for CRUD testing",
      ["Ingredient 1", "Ingredient 2"],
      ["Side Effect 1", "Side Effect 2"],
      ["Precaution 1", "Precaution 2"],
    ]);

    console.log(
      `✅ Product details created with ID: ${detailResult.rows[0].detail_id}`
    );

    // 2. Test READ (SELECT)
    console.log("\n📖 Test 2: READ Product");
    const readQuery = `
      SELECT 
        p.product_id, p.name, p.brand, p.price, p.stock, p.description,
        p.prescription_required, p.main_image_url, p.category_id,
        c.category_name,
        pd.generic_name, pd.uses,
        array_length(pd.ingredients, 1) as ingredient_count,
        array_length(pd.side_effects, 1) as side_effect_count
      FROM products p
      LEFT JOIN product_categories c ON p.category_id = c.category_id
      LEFT JOIN product_details pd ON p.product_id = pd.product_id
      WHERE p.product_id = $1;
    `;

    const readResult = await client.query(readQuery, [createdProductId]);
    const product = readResult.rows[0];

    console.log("✅ Product retrieved:");
    console.log(`   ID: ${product.product_id}`);
    console.log(`   Name: ${product.name}`);
    console.log(`   Brand: ${product.brand}`);
    console.log(
      `   Category: ${product.category_name} (ID: ${product.category_id})`
    );
    console.log(`   Price: Rp ${product.price}`);
    console.log(`   Stock: ${product.stock}`);
    console.log(`   Generic: ${product.generic_name}`);
    console.log(`   Ingredients: ${product.ingredient_count || 0}`);
    console.log(`   Side Effects: ${product.side_effect_count || 0}`);

    // 3. Test UPDATE
    console.log("\n🔄 Test 3: UPDATE Product");
    const updateQuery = `
      UPDATE products
      SET 
        name = $1,
        price = $2,
        stock = $3,
        updated_at = CURRENT_TIMESTAMP
      WHERE product_id = $4
      RETURNING product_id, name, price, stock, updated_at;
    `;

    const updateResult = await client.query(updateQuery, [
      "Test Product UPDATED",
      30000.75,
      150,
      createdProductId,
    ]);

    console.log("✅ Product updated:");
    console.log(`   ID: ${updateResult.rows[0].product_id}`);
    console.log(`   New Name: ${updateResult.rows[0].name}`);
    console.log(`   New Price: ${updateResult.rows[0].price}`);
    console.log(`   New Stock: ${updateResult.rows[0].stock}`);

    // Update product_details
    const updateDetailQuery = `
      UPDATE product_details
      SET 
        generic_name = $1,
        uses = $2,
        updated_at = CURRENT_TIMESTAMP
      WHERE product_id = $3
      RETURNING detail_id, generic_name;
    `;

    const updateDetailResult = await client.query(updateDetailQuery, [
      "Test Generic UPDATED",
      "Test uses UPDATED",
      createdProductId,
    ]);

    console.log(
      `✅ Product details updated: ${updateDetailResult.rows[0].generic_name}`
    );

    // 4. Test DELETE (Hard delete for test cleanup)
    console.log("\n🗑️  Test 4: DELETE Product");

    // Delete details first
    await client.query("DELETE FROM product_details WHERE product_id = $1", [
      createdProductId,
    ]);
    console.log("✅ Product details deleted");

    // Delete product
    const deleteResult = await client.query(
      "DELETE FROM products WHERE product_id = $1 RETURNING product_id, name",
      [createdProductId]
    );

    console.log("✅ Product deleted:");
    console.log(`   ID: ${deleteResult.rows[0].product_id}`);
    console.log(`   Name: ${deleteResult.rows[0].name}`);

    // Verify deletion
    const verifyResult = await client.query(
      "SELECT COUNT(*) as count FROM products WHERE product_id = $1",
      [createdProductId]
    );

    console.log(
      `✅ Deletion verified: ${
        verifyResult.rows[0].count === "0" ? "Success" : "Failed"
      }`
    );

    console.log("\n" + "=".repeat(80));
    console.log("🎉 All CRUD tests passed!\n");
  } catch (error) {
    console.error("\n❌ Test failed:", error.message);
    console.error("   Detail:", error.detail || error.stack);

    // Cleanup if test failed midway
    if (createdProductId) {
      try {
        await client.query(
          "DELETE FROM product_details WHERE product_id = $1",
          [createdProductId]
        );
        await client.query("DELETE FROM products WHERE product_id = $1", [
          createdProductId,
        ]);
        console.log("✅ Cleanup: Test product removed");
      } catch (cleanupError) {
        console.error("❌ Cleanup failed:", cleanupError.message);
      }
    }
  } finally {
    client.release();
    await pool.end();
  }
}

testCRUD();

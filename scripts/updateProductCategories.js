/**
 * Update products with correct category_id based on category names from products.js
 */

const { Pool } = require("pg");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
require("dotenv").config({ path: path.join(__dirname, "../../.env") });

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME,
});

// Product to category mapping from products.js
const productCategoryMap = {
  1: "Obat Nyeri & Demam",      // Paracetamol
  2: "Obat Nyeri & Demam",      // Ibuprofen
  3: "Obat Pencernaan",         // Promag
  4: "Obat Pencernaan",         // Loperamide
  5: "Obat Alergi",             // Cetirizine
  6: "Obat Pernapasan",         // Salbutamol
  7: "Antiseptik",              // Betadine
  8: "Obat Pencernaan",         // Oralit
  9: "Vitamin & Suplemen",      // Vitamin C
  10: "Antibiotik",             // Amoxicillin
  11: "Obat Pencernaan",        // Omeprazole
  12: "Vitamin & Suplemen",     // Vitamin D3
  13: "Vitamin & Suplemen",     // Multivitamin
  14: "Antiseptik",             // Alcohol
  15: "Obat Jantung & Hipertensi", // Captopril
};

async function updateProductCategories() {
  const client = await pool.connect();

  try {
    console.log("\n🔄 Updating Product Categories\n");
    console.log("=".repeat(70));

    await client.query("BEGIN");

    // Get all categories
    const categoriesResult = await client.query(
      "SELECT category_id, category_name FROM product_categories WHERE is_active = true"
    );
    const categories = categoriesResult.rows;

    console.log(`\nFound ${categories.length} categories in database\n`);

    let updatedCount = 0;
    let errorCount = 0;

    for (const [productId, categoryName] of Object.entries(productCategoryMap)) {
      // Find matching category
      const category = categories.find(
        (c) => c.category_name === categoryName
      );

      if (!category) {
        console.log(`❌ Product ID ${productId}: Category "${categoryName}" not found`);
        errorCount++;
        continue;
      }

      // Get product name
      const productResult = await client.query(
        "SELECT name FROM products WHERE product_id = $1",
        [productId]
      );

      if (productResult.rows.length === 0) {
        console.log(`⚠️  Product ID ${productId} not found in database`);
        continue;
      }

      const productName = productResult.rows[0].name;

      // Update product category
      await client.query(
        "UPDATE products SET category_id = $1 WHERE product_id = $2",
        [category.category_id, productId]
      );

      console.log(`✅ ID ${productId}: ${productName} → ${categoryName} (cat_id: ${category.category_id})`);
      updatedCount++;
    }

    await client.query("COMMIT");

    console.log("\n" + "=".repeat(70));
    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Updated: ${updatedCount} products`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log();

    // Verify results
    console.log("📋 Verification - Products with Categories:\n");
    const verifyResult = await client.query(`
      SELECT 
        p.product_id,
        p.name,
        c.category_name
      FROM products p
      LEFT JOIN product_categories c ON p.category_id = c.category_id
      ORDER BY p.product_id
    `);

    verifyResult.rows.forEach((row) => {
      const icon = row.category_name ? "✅" : "❌";
      const category = row.category_name || "NO CATEGORY";
      console.log(`${icon} ${row.product_id}. ${row.name} - ${category}`);
    });
    console.log();

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("\n❌ Error:", error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

updateProductCategories();

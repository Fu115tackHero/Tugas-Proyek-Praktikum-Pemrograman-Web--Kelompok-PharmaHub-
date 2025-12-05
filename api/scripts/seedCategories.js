/**
 * Seed Product Categories from frontend products.js
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

// Categories from products.js
const categories = [
  "Obat Nyeri & Demam",
  "Obat Pencernaan",
  "Obat Alergi",
  "Obat Pernapasan",
  "Antiseptik",
  "Vitamin & Suplemen",
  "Antibiotik",
  "Obat Jantung & Hipertensi",
];

async function seedCategories() {
  const client = await pool.connect();
  
  try {
    console.log("\n🏷️  Seeding Product Categories\n");
    console.log("=".repeat(60));

    await client.query("BEGIN");

    // Check if categories already exist
    const existingResult = await client.query(
      "SELECT category_name FROM product_categories"
    );
    const existing = existingResult.rows.map(r => r.category_name);

    console.log(`\nExisting categories in DB: ${existing.length}`);

    let insertedCount = 0;
    let skippedCount = 0;

    for (const categoryName of categories) {
      if (existing.includes(categoryName)) {
        console.log(`⏭️  Skipped: ${categoryName} (already exists)`);
        skippedCount++;
        continue;
      }

      const insertQuery = `
        INSERT INTO product_categories (category_name, description, is_active)
        VALUES ($1, $2, $3)
        RETURNING category_id, category_name;
      `;

      const description = `Kategori untuk ${categoryName.toLowerCase()}`;
      const result = await client.query(insertQuery, [
        categoryName,
        description,
        true,
      ]);

      console.log(`✅ Inserted: ${result.rows[0].category_name} (ID: ${result.rows[0].category_id})`);
      insertedCount++;
    }

    await client.query("COMMIT");

    console.log("\n" + "=".repeat(60));
    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Inserted: ${insertedCount}`);
    console.log(`   ⏭️  Skipped: ${skippedCount}`);
    console.log(`   📦 Total: ${categories.length}\n`);

    // Show all categories
    const allCategories = await client.query(
      "SELECT category_id, category_name FROM product_categories ORDER BY category_id"
    );

    console.log("📋 All Categories in Database:\n");
    allCategories.rows.forEach(cat => {
      console.log(`   ${cat.category_id}. ${cat.category_name}`);
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

seedCategories();

/**
 * Check and insert missing categories
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

const categories = [
  { id: 1, name: "Obat Nyeri & Demam", description: "Obat untuk meredakan nyeri dan demam" },
  { id: 2, name: "Obat Pencernaan", description: "Obat untuk gangguan pencernaan" },
  { id: 3, name: "Obat Alergi", description: "Obat untuk mengatasi alergi" },
  { id: 4, name: "Obat Pernapasan", description: "Obat untuk masalah pernapasan" },
  { id: 5, name: "Antiseptik", description: "Antiseptik dan disinfektan" },
  { id: 6, name: "Vitamin & Suplemen", description: "Vitamin dan suplemen kesehatan" },
  { id: 7, name: "Antibiotik", description: "Antibiotik untuk infeksi bakteri" },
  { id: 8, name: "Obat Jantung & Hipertensi", description: "Obat untuk jantung dan tekanan darah" },
];

async function checkAndInsertCategories() {
  const client = await pool.connect();
  try {
    console.log("🔄 Checking categories in database...\n");

    for (const cat of categories) {
      // Check if category exists
      const checkQuery = `SELECT category_id FROM product_categories WHERE category_id = $1;`;
      const checkResult = await client.query(checkQuery, [cat.id]);

      if (checkResult.rows.length === 0) {
        // Insert missing category
        const insertQuery = `
          INSERT INTO product_categories (category_id, category_name, description)
          VALUES ($1, $2, $3)
          ON CONFLICT (category_id) DO NOTHING;
        `;
        await client.query(insertQuery, [cat.id, cat.name, cat.description]);
        console.log(`✅ Inserted category: ${cat.name} (ID: ${cat.id})`);
      } else {
        console.log(`✓ Category already exists: ${cat.name} (ID: ${cat.id})`);
      }
    }

    // Reset sequence if needed
    const maxIdQuery = `SELECT MAX(category_id) as max_id FROM product_categories;`;
    const maxIdResult = await client.query(maxIdQuery);
    const maxId = maxIdResult.rows[0].max_id || 0;
    
    const resetSeqQuery = `SELECT setval('product_categories_category_id_seq', $1, true);`;
    await client.query(resetSeqQuery, [maxId]);
    
    console.log(`\n✅ Category sequence reset to ${maxId}`);
    console.log("\n✅ All categories checked and inserted!");
  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

checkAndInsertCategories().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});

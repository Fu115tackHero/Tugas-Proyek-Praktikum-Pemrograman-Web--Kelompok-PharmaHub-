/**
 * Check existing categories in database
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

async function checkCategories() {
  const client = await pool.connect();
  try {
    const query = `SELECT category_id, category_name, description FROM product_categories ORDER BY category_id;`;
    const result = await client.query(query);
    
    console.log("\n📋 Current categories in database:\n");
    result.rows.forEach(cat => {
      console.log(`ID: ${cat.category_id} | Name: ${cat.category_name} | Desc: ${cat.description || 'N/A'}`);
    });
    console.log(`\n✅ Total: ${result.rows.length} categories\n`);
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    client.release();
    await pool.end();
  }
}

checkCategories();

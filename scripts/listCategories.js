/**
 * List categories from product_categories table with IDs.
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

async function main() {
  const client = await pool.connect();
  try {
    const res = await client.query(
      "SELECT category_id, category_name FROM product_categories ORDER BY category_id"
    );
    console.log("\n📋 Categories (ID -> Name)\n");
    res.rows.forEach((r) => {
      console.log(`${r.category_id} -> ${r.category_name}`);
    });
    console.log(`\nTotal: ${res.rows.length}`);
  } catch (e) {
    console.error("❌ Error listing categories:", e.message);
  } finally {
    client.release();
    await pool.end();
  }
}

main();

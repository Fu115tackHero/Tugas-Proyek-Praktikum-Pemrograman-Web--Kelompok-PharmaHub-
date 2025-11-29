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

async function checkColumns() {
  const client = await pool.connect();
  try {
    console.log("\n📋 Database Table Structures:\n");
    console.log("=".repeat(80));
    
    // Check products table
    const productsResult = await client.query(`
      SELECT column_name, data_type, character_maximum_length
      FROM information_schema.columns 
      WHERE table_name = 'products' 
      ORDER BY ordinal_position
    `);

    console.log("\n🏷️  PRODUCTS Table:");
    productsResult.rows.forEach((row) => {
      const length = row.character_maximum_length ? `(${row.character_maximum_length})` : "";
      console.log(`  - ${row.column_name}: ${row.data_type}${length}`);
    });

    // Check product_details table
    const detailsResult = await client.query(`
      SELECT column_name, data_type, character_maximum_length
      FROM information_schema.columns 
      WHERE table_name = 'product_details' 
      ORDER BY ordinal_position
    `);

    console.log("\n📝 PRODUCT_DETAILS Table:");
    detailsResult.rows.forEach((row) => {
      const length = row.character_maximum_length ? `(${row.character_maximum_length})` : "";
      console.log(`  - ${row.column_name}: ${row.data_type}${length}`);
    });
    
    console.log("\n" + "=".repeat(80) + "\n");
  } finally {
    client.release();
    await pool.end();
  }
}

checkColumns();

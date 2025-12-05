require("dotenv").config({ path: "../.env" });
require("dotenv").config({ path: ".env" });
const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

async function checkProductDetailsTable() {
  console.log("=== Checking Product Details Table Structure ===\n");

  try {
    // Get table columns
    const columnsQuery = `
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'product_details'
      ORDER BY ordinal_position
    `;

    const result = await pool.query(columnsQuery);

    console.log("Columns in 'product_details' table:\n");
    result.rows.forEach((col) => {
      console.log(
        `  ${col.column_name} (${col.data_type}) ${
          col.is_nullable === "NO" ? "NOT NULL" : "NULL"
        }`
      );
    });

    // Get sample product detail
    console.log("\n\n=== Sample Product Detail Data ===\n");
    const sampleQuery = `SELECT * FROM product_details LIMIT 1`;
    const sampleResult = await pool.query(sampleQuery);

    if (sampleResult.rows.length > 0) {
      const detail = sampleResult.rows[0];
      Object.keys(detail).forEach((key) => {
        console.log(`  ${key}: ${JSON.stringify(detail[key])}`);
      });
    } else {
      console.log("  No product details found");
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await pool.end();
  }
}

checkProductDetailsTable();

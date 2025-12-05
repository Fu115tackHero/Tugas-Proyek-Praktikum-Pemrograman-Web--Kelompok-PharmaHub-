require("dotenv").config({ path: "../.env" });
require("dotenv").config({ path: ".env" });
const { Pool } = require("pg");

// Create database pool
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

async function checkImportantInfo() {
  console.log("=== Checking important_info in Database ===\n");

  try {
    // Check product_details table for product_id = 3 (Promag)
    const query = `
      SELECT 
        product_id,
        generic_name,
        important_info,
        array_length(important_info, 1) as important_info_count
      FROM product_details
      WHERE product_id = 3
    `;

    const result = await pool.query(query);

    if (result.rows.length === 0) {
      console.log("❌ No product_details found for product_id = 3");
    } else {
      const row = result.rows[0];
      console.log("✅ Product Details found for Promag (ID: 3):\n");
      console.log(`   Generic Name: ${row.generic_name}`);
      console.log(`   Important Info Count: ${row.important_info_count || 0}`);
      console.log(`   Important Info Value:`);
      console.log(JSON.stringify(row.important_info, null, 2));
      console.log("\n");

      if (row.important_info && row.important_info.length > 0) {
        console.log("✅ Important info exists in database:");
        row.important_info.forEach((info, idx) => {
          console.log(`   ${idx + 1}. ${info}`);
        });
      } else {
        console.log("⚠️  Important info is NULL or empty in database");
      }
    }

    // Also check all products with important_info
    console.log("\n\n=== All Products with Important Info ===\n");
    const allQuery = `
      SELECT 
        p.product_id,
        p.name,
        pd.important_info,
        array_length(pd.important_info, 1) as info_count
      FROM products p
      LEFT JOIN product_details pd ON p.product_id = pd.product_id
      WHERE pd.important_info IS NOT NULL AND array_length(pd.important_info, 1) > 0
    `;

    const allResult = await pool.query(allQuery);

    if (allResult.rows.length === 0) {
      console.log("⚠️  No products have important_info yet");
    } else {
      console.log(
        `✅ Found ${allResult.rows.length} products with important_info:\n`
      );
      allResult.rows.forEach((row) => {
        console.log(`   Product: ${row.name} (ID: ${row.product_id})`);
        console.log(`   Count: ${row.info_count} items`);
        row.important_info.forEach((info, idx) => {
          console.log(`      ${idx + 1}. ${info}`);
        });
        console.log("");
      });
    }

    await pool.end();
  } catch (error) {
    console.error("❌ Error:", error.message);
    await pool.end();
  }
}

checkImportantInfo();

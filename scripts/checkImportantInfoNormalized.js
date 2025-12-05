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

async function checkImportantInfoNormalized() {
  console.log("=== Checking product_important_info table (Normalized) ===\n");

  try {
    // Get the last 3 products
    const productsQuery = `
      SELECT p.product_id, p.name, pd.detail_id
      FROM products p
      LEFT JOIN product_details pd ON p.product_id = pd.product_id
      WHERE p.deleted_at IS NULL
      ORDER BY p.product_id DESC
      LIMIT 3
    `;

    const productsResult = await pool.query(productsQuery);

    if (productsResult.rows.length === 0) {
      console.log("❌ No products found");
      return;
    }

    for (const product of productsResult.rows) {
      console.log(`\n📦 Product: ${product.name} (ID: ${product.product_id})`);
      console.log(`   Detail ID: ${product.detail_id || 'N/A'}`);

      if (!product.detail_id) {
        console.log("   ⚠️  No product_details record found");
        continue;
      }

      // Check important_info for this product
      const importantInfoQuery = `
        SELECT info_id, info_text, display_order
        FROM product_important_info
        WHERE detail_id = $1
        ORDER BY display_order
      `;

      const importantInfoResult = await pool.query(importantInfoQuery, [product.detail_id]);

      if (importantInfoResult.rows.length === 0) {
        console.log("   ⚠️  No important_info records found");
      } else {
        console.log(`   ✅ Important Info Count: ${importantInfoResult.rows.length}`);
        importantInfoResult.rows.forEach((info) => {
          console.log(`      ${info.display_order + 1}. ${info.info_text} (ID: ${info.info_id})`);
        });
      }
    }

    console.log("\n=== Summary of all important_info records ===");
    const countQuery = `
      SELECT detail_id, COUNT(*) as count
      FROM product_important_info
      GROUP BY detail_id
      ORDER BY detail_id DESC
      LIMIT 10
    `;
    const countResult = await pool.query(countQuery);
    
    if (countResult.rows.length === 0) {
      console.log("❌ No important_info records found in entire table");
    } else {
      console.log("\nDetail ID | Count");
      console.log("----------|------");
      countResult.rows.forEach(row => {
        console.log(`${row.detail_id.toString().padEnd(10)}| ${row.count}`);
      });
    }

  } catch (error) {
    console.error("❌ Error checking important_info:", error);
  } finally {
    await pool.end();
  }
}

checkImportantInfoNormalized();

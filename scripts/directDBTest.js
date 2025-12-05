// Manual test - direct database update
require("dotenv").config({ path: "./.env" });
require("dotenv").config({ path: "./api/.env" });
const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

async function directDatabaseTest() {
  console.log("=== Direct Database Update Test ===\n");

  const client = await pool.connect();
  try {
    // 1. Update important_info directly
    console.log("📝 Updating important_info for product_id = 3...");

    const importantInfoData = [
      "Pastikan membaca aturan pakai sebelum mengonsumsi",
      "Simpan di tempat sejuk dan kering",
      "Jauhkan dari jangkauan anak-anak",
      "Konsultasikan dengan apoteker jika diperlukan",
    ];

    const updateQuery = `
      UPDATE product_details
      SET important_info = $1
      WHERE product_id = 3
    `;

    await client.query(updateQuery, [importantInfoData]);
    console.log("✅ Update successful\n");

    // 2. Verify
    console.log("🔍 Verifying update...");
    const selectQuery = `
      SELECT 
        p.product_id,
        p.name,
        pd.important_info,
        array_length(pd.important_info, 1) as info_count
      FROM products p
      LEFT JOIN product_details pd ON p.product_id = pd.product_id
      WHERE p.product_id = 3
    `;

    const result = await client.query(selectQuery);
    const row = result.rows[0];

    if (row.important_info && row.important_info.length > 0) {
      console.log(`✅ Important info saved successfully for "${row.name}":\n`);
      row.important_info.forEach((info, idx) => {
        console.log(`   ${idx + 1}. ${info}`);
      });
      console.log(`\n   Total items: ${row.info_count}`);
    } else {
      console.log("❌ Important info is still NULL");
    }

    console.log("\n\n🎉 Database test completed!");
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

directDatabaseTest();

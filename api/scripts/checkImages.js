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

async function checkImages() {
  const client = await pool.connect();
  try {
    const result = await client.query(
      "SELECT product_id, name, main_image_url FROM products ORDER BY product_id"
    );

    console.log("\n📊 Product Image Status:\n");
    console.log("=".repeat(80));

    let hasImage = 0;
    let noImage = 0;

    result.rows.forEach((row) => {
      if (row.main_image_url) {
        console.log(`✅ ID ${row.product_id}: ${row.name}`);
        console.log(`   ${row.main_image_url.substring(0, 75)}...`);
        hasImage++;
      } else {
        console.log(`❌ ID ${row.product_id}: ${row.name}`);
        console.log(`   No image URL`);
        noImage++;
      }
      console.log();
    });

    console.log("=".repeat(80));
    console.log(`\n📈 Summary: ${hasImage} with images, ${noImage} without images\n`);
  } finally {
    client.release();
    await pool.end();
  }
}

checkImages();

/**
 * Fix Missing Images and Upload to Supabase
 * Update database dengan nama file yang benar dan upload
 */

const { Pool } = require("pg");
const path = require("path");
const fs = require("fs");
const fetch = require("node-fetch");

// Load env
require("dotenv").config({ path: path.join(__dirname, "../.env") });
require("dotenv").config({ path: path.join(__dirname, "../../.env") });

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME,
});

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const BUCKET_NAME = "product-images";

// Mapping file yang salah nama
const FILE_MAPPING = {
  7: { // Cetirizine
    wrong: "/images/allproducts/cetirizine-10mg.jpg",
    correct: "cetirizine.jpg"
  },
  10: { // Betadine
    wrong: "/images/allproducts/betadine-solution.jpg",
    correct: "betadine.jpg"
  },
  5: { // Vitamin C
    wrong: "/images/allproducts/vitamin-c-1000mg.jpg",
    correct: "vitamin-c-500mg.jpg"
  }
};

function getMimeType(ext) {
  const types = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
  };
  return types[ext.toLowerCase()] || "application/octet-stream";
}

async function uploadToSupabase(filePath, fileName) {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const fileExt = path.extname(fileName);
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 9);
    const uniqueFileName = `${timestamp}_${randomString}${fileExt}`;

    console.log(`   📤 Uploading: ${fileName} -> ${uniqueFileName}`);

    const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${BUCKET_NAME}/${uniqueFileName}`;
    
    const response = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": getMimeType(fileExt),
      },
      body: fileBuffer,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Upload failed: ${response.status} - ${error}`);
    }

    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${uniqueFileName}`;
    console.log(`   ✅ Uploaded: ${publicUrl}`);
    return publicUrl;
  } catch (error) {
    console.error(`   ❌ Error uploading ${fileName}:`, error.message);
    return null;
  }
}

async function main() {
  let client;
  
  try {
    console.log("\n🔧 Fixing Missing Images and Uploading to Supabase\n");
    console.log("==================================================\n");

    client = await pool.connect();

    for (const [productId, mapping] of Object.entries(FILE_MAPPING)) {
      console.log(`\n🔍 Processing Product ID: ${productId}`);
      
      // Get product info
      const productQuery = "SELECT name FROM products WHERE product_id = $1";
      const productResult = await client.query(productQuery, [productId]);
      
      if (productResult.rows.length === 0) {
        console.log(`   ⚠️  Product not found`);
        continue;
      }

      const productName = productResult.rows[0].name;
      console.log(`   📦 Product: ${productName}`);
      console.log(`   🔍 Looking for: ${mapping.correct}`);

      // Check if file exists
      const filePath = path.join(__dirname, "../../public/images/allproducts", mapping.correct);
      
      if (!fs.existsSync(filePath)) {
        console.log(`   ❌ File not found: ${filePath}`);
        continue;
      }

      console.log(`   ✅ File found!`);

      // Upload to Supabase
      const supabaseUrl = await uploadToSupabase(filePath, mapping.correct);

      if (supabaseUrl) {
        // Update database
        const updateQuery = `
          UPDATE products 
          SET main_image_url = $1, updated_at = CURRENT_TIMESTAMP
          WHERE product_id = $2;
        `;
        
        await client.query(updateQuery, [supabaseUrl, productId]);
        console.log(`   💾 Database updated with Supabase URL`);
      }
    }

    console.log("\n==================================================");
    console.log("🎉 Fix Complete!");
    console.log("==================================================\n");

  } catch (error) {
    console.error("\n❌ Fatal error:", error.message);
    process.exit(1);
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

main();

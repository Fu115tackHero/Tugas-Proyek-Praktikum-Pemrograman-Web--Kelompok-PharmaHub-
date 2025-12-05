/**
 * Upload Product Images to Supabase Storage
 * Script untuk upload gambar produk dari folder lokal ke Supabase
 * dan update database dengan URL Supabase
 * 
 * Usage: node api/scripts/uploadImagesToSupabase.js
 */

const { Pool } = require("pg");
const path = require("path");
const fs = require("fs");
const FormData = require("form-data");
const fetch = require("node-fetch");

// Load from both .env files
require("dotenv").config({ path: path.join(__dirname, "../.env") }); // DB config
require("dotenv").config({ path: path.join(__dirname, "../../.env") }); // Supabase config

// Database configuration
const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME,
});

// Supabase configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const BUCKET_NAME = "product-images";

// Validate Supabase config
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("❌ Supabase belum dikonfigurasi!");
  console.error("   Set VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY di file .env");
  process.exit(1);
}

console.log("🔧 Supabase Configuration:");
console.log("   URL:", SUPABASE_URL);
console.log("   Key:", SUPABASE_ANON_KEY.substring(0, 20) + "...");

/**
 * Upload file to Supabase Storage
 */
async function uploadToSupabase(filePath, fileName) {
  try {
    // Read file
    const fileBuffer = fs.readFileSync(filePath);
    const fileExt = path.extname(fileName);
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 9);
    const uniqueFileName = `${timestamp}_${randomString}${fileExt}`;

    console.log(`   📤 Uploading: ${fileName} -> ${uniqueFileName}`);

    // Upload to Supabase
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

    // Get public URL
    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${uniqueFileName}`;
    
    console.log(`   ✅ Uploaded: ${publicUrl}`);
    return publicUrl;
  } catch (error) {
    console.error(`   ❌ Error uploading ${fileName}:`, error.message);
    return null;
  }
}

/**
 * Get MIME type from file extension
 */
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

/**
 * Main function
 */
async function main() {
  let client;
  
  try {
    console.log("\n🚀 Starting Image Upload to Supabase\n");
    console.log("==================================================\n");

    client = await pool.connect();

    // Get all products with local image paths
    const query = `
      SELECT product_id, name, main_image_url 
      FROM products 
      WHERE main_image_url LIKE '/images/%' OR main_image_url LIKE '%allproducts%'
      ORDER BY product_id;
    `;
    
    const result = await client.query(query);
    const products = result.rows;

    console.log(`📦 Found ${products.length} products with local images\n`);

    let successCount = 0;
    let failCount = 0;

    for (const product of products) {
      console.log(`\n🔍 Processing: ${product.name} (ID: ${product.product_id})`);
      console.log(`   Current URL: ${product.main_image_url}`);

      // Extract filename from path
      const localPath = product.main_image_url;
      const fileName = path.basename(localPath);
      
      // Try multiple possible local paths
      const possiblePaths = [
        path.join(__dirname, "../../public", localPath),
        path.join(__dirname, "../../public/images/allproducts", fileName),
        path.join(__dirname, "../../public/images/products", fileName),
      ];

      let filePath = null;
      for (const testPath of possiblePaths) {
        if (fs.existsSync(testPath)) {
          filePath = testPath;
          break;
        }
      }

      if (!filePath) {
        console.log(`   ⚠️  File not found locally, skipping...`);
        failCount++;
        continue;
      }

      console.log(`   📁 Found file: ${filePath}`);

      // Upload to Supabase
      const supabaseUrl = await uploadToSupabase(filePath, fileName);

      if (supabaseUrl) {
        // Update database
        const updateQuery = `
          UPDATE products 
          SET main_image_url = $1, updated_at = CURRENT_TIMESTAMP
          WHERE product_id = $2;
        `;
        
        await client.query(updateQuery, [supabaseUrl, product.product_id]);
        console.log(`   💾 Database updated with Supabase URL`);
        successCount++;
      } else {
        failCount++;
      }
    }

    console.log("\n==================================================");
    console.log("🎉 Upload Complete!");
    console.log("==================================================");
    console.log(`✅ Success: ${successCount} images`);
    console.log(`❌ Failed: ${failCount} images`);
    console.log("==================================================\n");

  } catch (error) {
    console.error("\n❌ Fatal error:", error.message);
    console.error(error);
    process.exit(1);
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

// Run the script
main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

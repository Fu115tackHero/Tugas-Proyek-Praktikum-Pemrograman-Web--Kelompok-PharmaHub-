/**
 * Setup Supabase Storage Bucket
 * Script untuk membuat bucket product-images jika belum ada
 * 
 * Usage: node api/scripts/setupSupabaseBucket.js
 */

const fetch = require("node-fetch");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const BUCKET_NAME = "product-images";

async function setupBucket() {
  console.log("\n🔧 Setup Supabase Storage Bucket\n");
  console.log("==================================================\n");

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error("❌ Supabase belum dikonfigurasi!");
    console.error("   Set VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY di file .env");
    process.exit(1);
  }

  console.log("📍 Supabase URL:", SUPABASE_URL);
  console.log("🔑 API Key:", SUPABASE_ANON_KEY.substring(0, 20) + "...\n");

  try {
    // Check if bucket exists
    console.log(`🔍 Checking if bucket '${BUCKET_NAME}' exists...`);
    
    const listUrl = `${SUPABASE_URL}/storage/v1/bucket`;
    const listResponse = await fetch(listUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (listResponse.ok) {
      const buckets = await listResponse.json();
      const bucketExists = buckets.some(b => b.name === BUCKET_NAME);

      if (bucketExists) {
        console.log(`✅ Bucket '${BUCKET_NAME}' sudah ada!`);
        console.log("\n📋 Test upload gambar:");
        console.log(`   node api/scripts/uploadImagesToSupabase.js`);
        return;
      }
    }

    console.log(`⚠️  Bucket '${BUCKET_NAME}' belum ada. Mencoba membuat...\n`);

    // Create bucket
    const createUrl = `${SUPABASE_URL}/storage/v1/bucket`;
    const createResponse = await fetch(createUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: BUCKET_NAME,
        public: true,
        file_size_limit: 5242880, // 5MB
        allowed_mime_types: ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"],
      }),
    });

    if (!createResponse.ok) {
      const error = await createResponse.text();
      throw new Error(`Failed to create bucket: ${createResponse.status} - ${error}`);
    }

    console.log(`✅ Bucket '${BUCKET_NAME}' berhasil dibuat!`);
    console.log("\n📝 Bucket Configuration:");
    console.log("   - Public access: ✅ Enabled");
    console.log("   - Max file size: 5MB");
    console.log("   - Allowed types: JPG, PNG, WebP, GIF");

    console.log("\n🎉 Setup complete!");
    console.log("\n📋 Next steps:");
    console.log("   1. Pastikan bucket policy di Supabase Dashboard sudah public read");
    console.log("   2. Jalankan: node api/scripts/uploadImagesToSupabase.js");

  } catch (error) {
    console.error("\n❌ Error:", error.message);
    console.error("\n💡 Manual Setup:");
    console.error("   1. Login ke Supabase Dashboard: https://app.supabase.com");
    console.error("   2. Pilih project Anda");
    console.error("   3. Buka Storage");
    console.error("   4. Create new bucket:");
    console.error(`      - Name: ${BUCKET_NAME}`);
    console.error("      - Public bucket: ✅ (PENTING!)");
    console.error("   5. Set bucket policy untuk public read access");
    process.exit(1);
  }
}

setupBucket();

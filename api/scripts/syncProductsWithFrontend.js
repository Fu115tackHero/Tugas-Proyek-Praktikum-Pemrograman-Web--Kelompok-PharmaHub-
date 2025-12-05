/**
 * Sync Database Products with Frontend products.js
 * 1. Delete existing products
 * 2. Seed products from products.js structure
 * 3. Upload images to Supabase
 */

const { Pool } = require("pg");
const path = require("path");
const fs = require("fs");
const fetch = require("node-fetch");

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

// Data products sesuai products.js
const products = [
  {
    id: 1,
    name: "Paracetamol 500mg",
    brand: "Sanbe Farma",
    price: 12000,
    image: "/images/allproducts/paracetamol-500mg.jpg",
    description: "Untuk menurunkan demam dan meredakan sakit kepala atau nyeri ringan.",
    uses: "Menurunkan demam, meredakan nyeri ringan hingga sedang seperti sakit kepala, sakit gigi, nyeri otot.",
    genericName: "Paracetamol",
    prescriptionRequired: false,
    category: "Obat Nyeri & Demam",
    stock: 100,
  },
  {
    id: 2,
    name: "Ibuprofen 400mg",
    brand: "Kimia Farma",
    price: 15000,
    image: "/images/allproducts/ibuprofen-400mg.jpg",
    description: "Obat antiinflamasi non-steroid untuk nyeri otot, sendi, atau sakit gigi.",
    uses: "Mengurangi peradangan, menurunkan demam, meredakan nyeri otot dan sendi.",
    genericName: "Ibuprofen",
    prescriptionRequired: false,
    category: "Obat Nyeri & Demam",
    stock: 75,
  },
  {
    id: 3,
    name: "Promag",
    brand: "Kalbe Farma",
    price: 8000,
    image: "/images/allproducts/promag.jpg",
    description: "Meredakan sakit maag, nyeri ulu hati, dan gangguan asam lambung.",
    uses: "Meredakan sakit maag, nyeri ulu hati, kembung, dan mual akibat asam lambung berlebih.",
    genericName: "Antasida",
    prescriptionRequired: false,
    category: "Obat Pencernaan",
    stock: 120,
  },
  {
    id: 4,
    name: "Loperamide (Imodium)",
    brand: "Johnson & Johnson",
    price: 20000,
    image: "/images/allproducts/loperamide-imodium.jpg",
    description: "Untuk mengatasi diare akut.",
    uses: "Mengatasi diare akut dengan mengurangi pergerakan usus dan meningkatkan penyerapan air.",
    genericName: "Loperamide",
    prescriptionRequired: false,
    category: "Obat Pencernaan",
    stock: 60,
  },
  {
    id: 5,
    name: "Cetirizine",
    brand: "Dexa Medica",
    price: 25000,
    image: "/images/allproducts/cetirizine.jpg",
    description: "Antihistamin untuk alergi, bersin, atau gatal-gatal.",
    uses: "Meredakan gejala alergi seperti bersin, hidung tersumbat, mata berair, dan gatal-gatal.",
    genericName: "Cetirizine",
    prescriptionRequired: false,
    category: "Obat Alergi",
    stock: 90,
  },
  {
    id: 6,
    name: "Salbutamol Inhaler",
    brand: "Glaxo Smith Kline",
    price: 45000,
    image: "/images/allproducts/salbutamol-inhaler.jpg",
    description: "Membantu meredakan sesak napas akibat asma atau bronkitis.",
    uses: "Meredakan sesak napas, bronkospasme, dan gejala asma akut.",
    genericName: "Salbutamol",
    prescriptionRequired: false,
    category: "Obat Pernapasan",
    stock: 45,
  },
  {
    id: 7,
    name: "Betadine",
    brand: "Mahakam Beta Farma",
    price: 18000,
    image: "/images/allproducts/betadine.jpg",
    description: "Antiseptik luar untuk membersihkan luka ringan atau goresan.",
    uses: "Antiseptik untuk luka kecil, goresan, dan pencegahan infeksi pada luka luar.",
    genericName: "Povidone Iodine",
    prescriptionRequired: false,
    category: "Antiseptik",
    stock: 150,
  },
  {
    id: 8,
    name: "Oralit",
    brand: "Pharos Indonesia",
    price: 5000,
    image: "/images/allproducts/oralit.jpg",
    description: "Larutan rehidrasi untuk mencegah dehidrasi akibat diare atau muntah.",
    uses: "Mengganti cairan dan elektrolit yang hilang akibat diare, muntah, atau berkeringat berlebihan.",
    genericName: "Oralit",
    prescriptionRequired: false,
    category: "Obat Pencernaan",
    stock: 200,
  },
  {
    id: 9,
    name: "Vitamin C 500mg",
    brand: "Blackmores",
    price: 25000,
    image: "/images/allproducts/vitamin-c-500mg.jpg",
    description: "Meningkatkan daya tahan tubuh dan membantu penyembuhan.",
    uses: "Meningkatkan sistem imun, membantu penyembuhan luka, dan melindungi dari radikal bebas.",
    genericName: "Vitamin C",
    prescriptionRequired: false,
    category: "Vitamin & Suplemen",
    stock: 95,
  },
  {
    id: 10,
    name: "Amoxicillin 500mg",
    brand: "Sanbe Farma",
    price: 40000,
    image: "/images/allproducts/amoxicillin-500mg.jpg",
    description: "Untuk infeksi bakteri ringan, seperti infeksi tenggorokan atau kulit.",
    uses: "Mengobati infeksi bakteri pada saluran pernapasan, kulit, dan saluran kemih.",
    genericName: "Amoxicillin",
    prescriptionRequired: true,
    category: "Antibiotik",
    stock: 50,
  },
  {
    id: 11,
    name: "Omeprazole 20mg",
    brand: "Dexa Medica",
    price: 35000,
    image: "/images/allproducts/omeprazole-20mg.jpg",
    description: "Untuk mengatasi asam lambung berlebih dan maag kronis.",
    uses: "Mengurangi produksi asam lambung, mengobati tukak lambung dan GERD.",
    genericName: "Omeprazole",
    prescriptionRequired: true,
    category: "Obat Pencernaan",
    stock: 40,
  },
  {
    id: 12,
    name: "Vitamin D3 1000 IU",
    brand: "Nature Made",
    price: 45000,
    image: "/images/allproducts/vitamin-d3-1000-iu.jpg",
    description: "Membantu penyerapan kalsium dan kesehatan tulang.",
    uses: "Mendukung kesehatan tulang, gigi, dan sistem imun.",
    genericName: "Vitamin D3",
    prescriptionRequired: false,
    category: "Vitamin & Suplemen",
    stock: 110,
  },
  {
    id: 13,
    name: "Multivitamin Complete",
    brand: "Centrum",
    price: 55000,
    image: "/images/allproducts/multivitamin-complete.jpg",
    description: "Kombinasi lengkap vitamin dan mineral untuk kesehatan optimal.",
    uses: "Memenuhi kebutuhan vitamin dan mineral harian untuk menjaga kesehatan tubuh.",
    genericName: "Multivitamin",
    prescriptionRequired: false,
    category: "Vitamin & Suplemen",
    stock: 130,
  },
  {
    id: 14,
    name: "Alcohol 70%",
    brand: "OneMed",
    price: 15000,
    image: "/images/allproducts/alcohol-70-percent.jpg",
    description: "Antiseptik untuk membersihkan tangan dan permukaan.",
    uses: "Membersihkan tangan, sterilisasi alat, dan desinfeksi permukaan.",
    genericName: "Alcohol",
    prescriptionRequired: false,
    category: "Antiseptik",
    stock: 300,
  },
  {
    id: 15,
    name: "Captopril 25mg",
    brand: "Indofarma",
    price: 30000,
    image: "/images/allproducts/captopril-25mg.jpg",
    description: "Obat untuk menurunkan tekanan darah tinggi.",
    uses: "Mengontrol tekanan darah tinggi dan mencegah komplikasi jantung.",
    genericName: "Captopril",
    prescriptionRequired: true,
    category: "Obat Jantung & Hipertensi",
    stock: 40,
  },
];

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
    if (!fs.existsSync(filePath)) {
      console.log(`   ⚠️  File not found: ${fileName}`);
      return null;
    }

    const fileBuffer = fs.readFileSync(filePath);
    const fileExt = path.extname(fileName);
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 9);
    const uniqueFileName = `${timestamp}_${randomString}${fileExt}`;

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
    return publicUrl;
  } catch (error) {
    console.error(`   ❌ Error uploading ${fileName}:`, error.message);
    return null;
  }
}

async function main() {
  let client;

  try {
    console.log("\n🔄 Syncing Database with Frontend products.js\n");
    console.log("=".repeat(80));

    client = await pool.connect();

    // Step 1: Delete existing products and details
    console.log("\n📦 Step 1: Clearing existing products...");
    await client.query("DELETE FROM product_details"); // Delete details first (foreign key)
    await client.query("DELETE FROM products");
    console.log("   ✅ All products and details deleted");

    // Step 2: Reset sequence
    console.log("\n🔢 Step 2: Resetting product_id sequence...");
    await client.query("ALTER SEQUENCE products_product_id_seq RESTART WITH 1");
    console.log("   ✅ Sequence reset");

    // Step 3: Insert products and upload images
    console.log("\n📤 Step 3: Inserting products and uploading images...\n");

    let successCount = 0;
    let failedCount = 0;
    const failed = [];

    for (const product of products) {
      console.log(`\n[${product.id}/15] Processing: ${product.name}`);

      // Extract filename from image path
      const imageFileName = path.basename(product.image);
      const imagePath = path.join(__dirname, "../../public/images/allproducts", imageFileName);

      console.log(`   📁 Looking for: ${imageFileName}`);

      // Upload to Supabase
      const supabaseUrl = await uploadToSupabase(imagePath, imageFileName);

      if (supabaseUrl) {
        console.log(`   ✅ Uploaded to Supabase`);
      } else {
        console.log(`   ⚠️  Using original path (file not found)`);
        failedCount++;
        failed.push(product.name);
      }

      // Insert into products table
      const insertProductQuery = `
        INSERT INTO products (
          name, brand, price, description, 
          prescription_required, stock, main_image_url, is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING product_id;
      `;

      const productValues = [
        product.name,
        product.brand,
        product.price,
        product.description,
        product.prescriptionRequired,
        product.stock,
        supabaseUrl || product.image, // Use Supabase URL or fallback to original path
        true, // is_active
      ];

      const result = await client.query(insertProductQuery, productValues);
      const productId = result.rows[0].product_id;
      console.log(`   💾 Inserted into products with ID: ${productId}`);

      // Insert into product_details table (if genericName or uses exists)
      if (product.genericName || product.uses) {
        const insertDetailsQuery = `
          INSERT INTO product_details (
            product_id, generic_name, uses
          ) VALUES ($1, $2, $3)
          RETURNING detail_id;
        `;

        const detailsValues = [
          productId,
          product.genericName || null,
          product.uses || null,
        ];

        const detailsResult = await client.query(insertDetailsQuery, detailsValues);
        console.log(`   📋 Inserted details with ID: ${detailsResult.rows[0].detail_id}`);
      }
      
      if (supabaseUrl) {
        successCount++;
      }
    }

    console.log("\n" + "=".repeat(80));
    console.log("\n🎉 Sync Complete!\n");
    console.log(`📊 Summary:`);
    console.log(`   ✅ Total products: ${products.length}`);
    console.log(`   ✅ Images uploaded to Supabase: ${successCount}`);
    console.log(`   ⚠️  Images not found: ${failedCount}`);
    
    if (failed.length > 0) {
      console.log(`\n⚠️  Products with missing images:`);
      failed.forEach(name => console.log(`   - ${name}`));
    }
    
    console.log("\n" + "=".repeat(80) + "\n");

  } catch (error) {
    console.error("\n❌ Fatal error:", error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

main();

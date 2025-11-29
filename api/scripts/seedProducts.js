/**
 * Seed Products Script
 * Populates products table with data from src/data/products.js
 *
 * Usage: node api/scripts/seedProducts.js
 */

const { Pool } = require("pg");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

// Database configuration
const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME,
});

// Products data (copied from src/data/products.js)
const products = [
  {
    id: 1,
    name: "Paracetamol 500mg",
    brand: "Sanbe Farma",
    price: 12000,
    image: "/images/allproducts/paracetamol-500mg.jpg",
    description:
      "Untuk menurunkan demam dan meredakan sakit kepala atau nyeri ringan.",
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
    description:
      "Obat antiinflamasi non-steroid untuk nyeri otot, sendi, atau sakit gigi.",
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
    description:
      "Meredakan sakit maag, nyeri ulu hati, dan gangguan asam lambung.",
    uses: "Meredakan gejala maag, heartburn, mual akibat asam lambung.",
    genericName: "Antasida",
    prescriptionRequired: false,
    category: "Obat Pencernaan",
    stock: 120,
  },
  {
    id: 4,
    name: "Amoxicillin 500mg",
    brand: "Indo Farma",
    price: 25000,
    image: "/images/allproducts/amoxicillin-500mg.jpg",
    description:
      "Antibiotik untuk infeksi bakteri seperti radang tenggorokan dan infeksi saluran kemih.",
    uses: "Mengobati infeksi bakteri pada saluran pernapasan, kulit, dan saluran kemih.",
    genericName: "Amoxicillin",
    prescriptionRequired: true,
    category: "Antibiotik",
    stock: 50,
  },
  {
    id: 5,
    name: "Vitamin C 1000mg",
    brand: "Wellness",
    price: 45000,
    image: "/images/allproducts/vitamin-c-1000mg.jpg",
    description:
      "Suplemen vitamin C untuk meningkatkan daya tahan tubuh dan kesehatan kulit.",
    uses: "Meningkatkan imunitas, antioksidan, membantu penyerapan zat besi.",
    genericName: "Ascorbic Acid",
    prescriptionRequired: false,
    category: "Vitamin & Suplemen",
    stock: 200,
  },
  {
    id: 6,
    name: "Omeprazole 20mg",
    brand: "Dexa Medica",
    price: 35000,
    image: "/images/allproducts/omeprazole-20mg.jpg",
    description:
      "Obat untuk mengurangi produksi asam lambung pada penderita GERD dan tukak lambung.",
    uses: "Mengobati GERD, tukak lambung, tukak duodenum.",
    genericName: "Omeprazole",
    prescriptionRequired: true,
    category: "Obat Pencernaan",
    stock: 60,
  },
  {
    id: 7,
    name: "Cetirizine 10mg",
    brand: "Hexpharm",
    price: 18000,
    image: "/images/allproducts/cetirizine-10mg.jpg",
    description: "Antihistamin untuk mengatasi alergi seperti gatal, bersin, dan mata berair.",
    uses: "Meredakan gejala alergi: rhinitis alergi, urtikaria.",
    genericName: "Cetirizine",
    prescriptionRequired: false,
    category: "Obat Alergi",
    stock: 90,
  },
  {
    id: 8,
    name: "Metformin 500mg",
    brand: "Pharos",
    price: 20000,
    image: "/images/allproducts/metformin-500mg.jpg",
    description: "Obat untuk menurunkan kadar gula darah pada penderita diabetes tipe 2.",
    uses: "Mengontrol kadar gula darah pada diabetes melitus tipe 2.",
    genericName: "Metformin",
    prescriptionRequired: true,
    category: "Obat Diabetes",
    stock: 80,
  },
  {
    id: 9,
    name: "Salbutamol Inhaler",
    brand: "Glaxo",
    price: 75000,
    image: "/images/allproducts/salbutamol-inhaler.jpg",
    description: "Inhaler untuk melegakan pernapasan pada penderita asma.",
    uses: "Meredakan sesak napas akut pada asma dan PPOK.",
    genericName: "Salbutamol",
    prescriptionRequired: true,
    category: "Obat Pernapasan",
    stock: 40,
  },
  {
    id: 10,
    name: "Betadine Solution 30ml",
    brand: "Mundipharma",
    price: 22000,
    image: "/images/allproducts/betadine-solution.jpg",
    description: "Antiseptik untuk luka, mencegah infeksi pada luka ringan.",
    uses: "Desinfeksi luka, luka bakar ringan, luka lecet.",
    genericName: "Povidone Iodine",
    prescriptionRequired: false,
    category: "Obat Luar",
    stock: 110,
  },
];

async function seedProducts() {
  let client;
  
  try {
    console.log("🌱 Seeding products...\n");

    client = await pool.connect();

    // Check if category exists, if not create
    for (const product of products) {
      // Insert/update category
      const categoryQuery = `
        INSERT INTO product_categories (category_name, description)
        VALUES ($1, $2)
        ON CONFLICT (category_name) DO NOTHING;
      `;
      await client.query(categoryQuery, [
        product.category,
        `${product.category} products`,
      ]);

      // Get category_id
      const categoryResult = await client.query(
        "SELECT category_id FROM product_categories WHERE category_name = $1",
        [product.category]
      );
      const categoryId = categoryResult.rows[0].category_id;

      // Insert product
      const productQuery = `
        INSERT INTO products (
          product_id, name, brand, category_id,
          price, stock, description, prescription_required, main_image_url
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (product_id) 
        DO UPDATE SET
          name = EXCLUDED.name,
          brand = EXCLUDED.brand,
          category_id = EXCLUDED.category_id,
          price = EXCLUDED.price,
          stock = EXCLUDED.stock,
          description = EXCLUDED.description,
          prescription_required = EXCLUDED.prescription_required,
          main_image_url = EXCLUDED.main_image_url;
      `;

      await client.query(productQuery, [
        product.id,
        product.name,
        product.brand,
        categoryId,
        product.price,
        product.stock,
        product.description,
        product.prescriptionRequired,
        product.image, // This is the URL path
      ]);

      console.log(`✅ Seeded: ${product.name}`);
    }

    console.log(`\n🎉 Successfully seeded ${products.length} products!`);
  } catch (error) {
    console.error("❌ Error seeding products:", error.message);
    throw error;
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

// Run the seed function
seedProducts().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

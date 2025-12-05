require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const pool = require("../config/database");

/**
 * Script to fill important info for products that don't have any
 * Based on product type and common medical information
 */

// Template informasi penting berdasarkan jenis obat
const importantInfoTemplates = {
  // Pain Relief / Analgesic
  paracetamol: [
    "Jangan melebihi dosis yang dianjurkan",
    "Konsultasikan dengan dokter jika gejala berlanjut lebih dari 3 hari",
    "Hindari penggunaan bersamaan dengan obat lain yang mengandung paracetamol",
    "Hati-hati pada pasien dengan gangguan fungsi hati",
    "Simpan pada suhu ruangan, terhindar dari cahaya langsung"
  ],
  
  // Antibiotics
  amoxicillin: [
    "Habiskan seluruh dosis antibiotik sesuai anjuran dokter",
    "Jangan menghentikan pengobatan meskipun gejala sudah membaik",
    "Konsultasikan dengan dokter jika alergi terhadap penisilin",
    "Minum dengan atau tanpa makanan",
    "Simpan di tempat sejuk dan kering"
  ],
  
  amoxsan: [
    "Habiskan seluruh dosis antibiotik sesuai anjuran dokter",
    "Konsultasikan dengan dokter jika memiliki riwayat alergi antibiotik",
    "Minum bersama makanan untuk mengurangi efek samping lambung",
    "Jangan berbagi obat ini dengan orang lain",
    "Simpan pada suhu ruangan"
  ],
  
  // Antihypertensive
  captopril: [
    "Minum secara teratur pada waktu yang sama setiap hari",
    "Jangan menghentikan obat tanpa konsultasi dokter",
    "Hindari makanan tinggi kalium selama pengobatan",
    "Pantau tekanan darah secara rutin",
    "Hindari perubahan posisi mendadak untuk mencegah pusing"
  ],
  
  amlodipine: [
    "Konsumsi pada waktu yang sama setiap hari",
    "Jangan menghentikan penggunaan tanpa instruksi dokter",
    "Pantau tekanan darah dan detak jantung secara berkala",
    "Laporkan segera jika terjadi pembengkakan kaki atau pergelangan kaki",
    "Hindari konsumsi grapefruit selama pengobatan"
  ],
  
  // Diabetes
  metformin: [
    "Minum bersama atau setelah makan untuk mengurangi efek samping",
    "Pantau kadar gula darah secara teratur",
    "Hindari konsumsi alkohol berlebihan",
    "Laporkan segera jika mengalami mual, muntah, atau nyeri perut",
    "Jangan menghentikan obat tanpa konsultasi dokter"
  ],
  
  glimepiride: [
    "Konsumsi sebelum makan pertama dalam sehari",
    "Selalu bawa makanan ringan untuk mencegah hipoglikemia",
    "Pantau kadar gula darah secara rutin",
    "Hindari melewatkan waktu makan",
    "Konsultasikan dengan dokter sebelum berpuasa"
  ],
  
  // Gastric
  omeprazole: [
    "Minum 30-60 menit sebelum makan",
    "Telan kapsul utuh, jangan dikunyah atau dihancurkan",
    "Konsultasikan dengan dokter jika gejala berlanjut lebih dari 2 minggu",
    "Hindari makanan pedas dan asam selama pengobatan",
    "Jangan gunakan lebih dari 14 hari tanpa konsultasi dokter"
  ],
  
  antasida: [
    "Minum 1-2 jam sebelum atau sesudah obat lain",
    "Kocok suspensi sebelum diminum",
    "Jangan gunakan lebih dari 2 minggu tanpa konsultasi dokter",
    "Hindari makanan yang dapat memicu asam lambung",
    "Konsultasikan dengan dokter jika gejala memburuk"
  ],
  
  // Vitamins
  vitamin: [
    "Konsumsi sesuai dosis yang dianjurkan",
    "Minum bersama makanan untuk penyerapan optimal",
    "Simpan di tempat sejuk dan kering",
    "Jauhkan dari jangkauan anak-anak",
    "Konsultasikan dengan dokter jika sedang hamil atau menyusui"
  ],
  
  // Cough & Cold
  obh: [
    "Kocok botol sebelum digunakan",
    "Gunakan sendok takar yang disediakan",
    "Jangan gunakan lebih dari 7 hari berturut-turut",
    "Hindari mengemudi atau mengoperasikan mesin berat",
    "Konsultasikan dengan dokter jika batuk berlanjut"
  ],
  
  // Antiseptic
  betadine: [
    "Hanya untuk penggunaan luar",
    "Hindari kontak dengan mata",
    "Hentikan penggunaan jika terjadi iritasi",
    "Jangan digunakan pada luka bakar parah",
    "Tutup luka dengan perban steril setelah aplikasi"
  ],
  
  alkohol: [
    "Hanya untuk penggunaan luar",
    "Jauhkan dari api dan sumber panas",
    "Hindari kontak dengan mata dan membran mukosa",
    "Gunakan di area berventilasi baik",
    "Tutup rapat setelah penggunaan"
  ],
  
  // Default/Generic
  default: [
    "Gunakan sesuai petunjuk dokter atau apoteker",
    "Simpan pada suhu ruangan, terhindar dari cahaya dan kelembaban",
    "Jauhkan dari jangkauan anak-anak",
    "Jangan gunakan setelah tanggal kadaluarsa",
    "Konsultasikan dengan dokter jika gejala tidak membaik"
  ]
};

/**
 * Determine which template to use based on product name
 */
function getTemplateKey(productName) {
  const nameLower = productName.toLowerCase();
  
  // Check for specific medications
  if (nameLower.includes('paracetamol') || nameLower.includes('panadol')) return 'paracetamol';
  if (nameLower.includes('amoxicillin')) return 'amoxicillin';
  if (nameLower.includes('amoxsan')) return 'amoxsan';
  if (nameLower.includes('captopril')) return 'captopril';
  if (nameLower.includes('amlodipine')) return 'amlodipine';
  if (nameLower.includes('metformin')) return 'metformin';
  if (nameLower.includes('glimepiride')) return 'glimepiride';
  if (nameLower.includes('omeprazole') || nameLower.includes('promag')) return 'omeprazole';
  if (nameLower.includes('antasida') || nameLower.includes('antacid')) return 'antasida';
  if (nameLower.includes('vitamin')) return 'vitamin';
  if (nameLower.includes('obh') || nameLower.includes('batuk')) return 'obh';
  if (nameLower.includes('betadine') || nameLower.includes('povidone')) return 'betadine';
  if (nameLower.includes('alkohol') || nameLower.includes('alcohol')) return 'alkohol';
  
  return 'default';
}

async function fillImportantInfo() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Checking products without important info...\n');
    
    // Get all products with their detail_id
    const productsQuery = `
      SELECT 
        p.product_id,
        p.name,
        pd.detail_id
      FROM products p
      LEFT JOIN product_details pd ON p.product_id = pd.product_id
      WHERE p.is_active = TRUE
      ORDER BY p.product_id
    `;
    
    const { rows: products } = await client.query(productsQuery);
    console.log(`📦 Found ${products.length} active products\n`);
    
    let addedCount = 0;
    let skippedCount = 0;
    
    for (const product of products) {
      // Check if product already has important info
      const checkQuery = `
        SELECT COUNT(*) as count
        FROM product_important_info
        WHERE detail_id = $1
      `;
      
      const { rows: checkResult } = await client.query(checkQuery, [product.detail_id]);
      const hasInfo = parseInt(checkResult[0].count) > 0;
      
      if (hasInfo) {
        console.log(`⏭️  ${product.name} - Already has important info`);
        skippedCount++;
        continue;
      }
      
      // Get appropriate template
      const templateKey = getTemplateKey(product.name);
      const infoArray = importantInfoTemplates[templateKey];
      
      console.log(`✨ ${product.name} - Adding ${infoArray.length} important info items (template: ${templateKey})`);
      
      // Insert important info
      for (let i = 0; i < infoArray.length; i++) {
        const insertQuery = `
          INSERT INTO product_important_info (detail_id, info_text, display_order)
          VALUES ($1, $2, $3)
          ON CONFLICT DO NOTHING
        `;
        
        await client.query(insertQuery, [product.detail_id, infoArray[i], i]);
      }
      
      addedCount++;
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Important info filling completed!');
    console.log('='.repeat(60));
    console.log(`📊 Summary:`);
    console.log(`   - Total products checked: ${products.length}`);
    console.log(`   - Products updated: ${addedCount}`);
    console.log(`   - Products skipped (already has info): ${skippedCount}`);
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the script
fillImportantInfo()
  .then(() => {
    console.log('\n✅ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });

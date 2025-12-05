/**
 * Script to populate uses field for existing products
 */

require("dotenv").config({ path: "../.env" });
const pool = require("../config/database");

// Data kegunaan untuk berbagai jenis obat
const usesData = {
  // Pain Relief / Analgesik
  "Paracetamol": "Meredakan demam, sakit kepala, sakit gigi, nyeri otot, dan nyeri ringan hingga sedang lainnya. Dapat digunakan untuk menurunkan demam pada anak-anak dan dewasa.",
  "Ibuprofen": "Meredakan nyeri dan peradangan pada kondisi seperti sakit kepala, sakit gigi, nyeri haid, nyeri otot, arthritis, dan menurunkan demam.",
  "Aspirin": "Meredakan nyeri ringan hingga sedang, menurunkan demam, mengurangi peradangan, dan mencegah pembekuan darah (untuk pencegahan stroke dan serangan jantung).",
  "Asam Mefenamat": "Meredakan nyeri ringan hingga sedang, terutama nyeri haid (dismenore), sakit kepala, sakit gigi, dan nyeri pasca operasi.",
  
  // Antibiotik
  "Amoxicillin": "Mengobati berbagai infeksi bakteri seperti infeksi saluran pernapasan (bronkitis, pneumonia), infeksi telinga, infeksi kulit, dan infeksi saluran kemih.",
  "Ciprofloxacin": "Mengobati infeksi bakteri seperti infeksi saluran kemih, infeksi saluran pencernaan, infeksi tulang dan sendi, dan infeksi kulit.",
  "Azithromycin": "Mengobati infeksi bakteri pada saluran pernapasan, kulit, telinga, dan penyakit menular seksual tertentu.",
  "Cefixime": "Mengobati infeksi bakteri pada saluran pernapasan, telinga, tenggorokan, saluran kemih, dan gonore.",
  
  // Antihistamin / Alergi
  "Cetirizine": "Meredakan gejala alergi seperti bersin, hidung tersumbat, gatal-gatal, mata berair, dan ruam kulit (urtikaria). Efektif untuk rhinitis alergi dan alergi kulit.",
  "Loratadine": "Meredakan gejala alergi musiman dan sepanjang tahun seperti bersin, hidung gatal dan meler, mata gatal dan berair, serta gatal-gatal pada kulit.",
  "Chlorpheniramine Maleate": "Meredakan gejala alergi seperti bersin, hidung meler, mata berair, dan gatal-gatal. Juga digunakan dalam obat flu kombinasi.",
  "Diphenhydramine": "Meredakan gejala alergi, membantu mengatasi insomnia ringan, mengurangi mual dan muntah, serta meredakan batuk.",
  
  // Pencernaan
  "Omeprazole": "Mengobati penyakit asam lambung (GERD), tukak lambung dan duodenum, sindrom Zollinger-Ellison, dan mencegah kerusakan lambung akibat NSAID.",
  "Ranitidine": "Mengurangi produksi asam lambung untuk mengobati tukak lambung, GERD, dan kondisi produksi asam berlebih lainnya.",
  "Antasida": "Menetralkan asam lambung untuk meredakan heartburn, maag, dan gangguan pencernaan dengan cepat.",
  "Domperidone": "Meredakan mual, muntah, rasa penuh di perut, dan kembung. Membantu mempercepat pengosongan lambung.",
  "Loperamide": "Mengobati diare akut dan kronis dengan memperlambat gerakan usus, mengurangi frekuensi buang air besar.",
  
  // Diabetes
  "Metformin": "Mengontrol kadar gula darah pada pasien diabetes tipe 2, meningkatkan sensitivitas insulin, dan membantu menurunkan berat badan.",
  "Glimepiride": "Menurunkan kadar gula darah pada diabetes tipe 2 dengan merangsang pelepasan insulin dari pankreas.",
  "Insulin": "Menggantikan atau menambah insulin alami untuk mengontrol kadar gula darah pada diabetes tipe 1 dan tipe 2.",
  
  // Hipertensi / Kardiovaskular
  "Amlodipine": "Menurunkan tekanan darah tinggi (hipertensi) dan mengobati angina (nyeri dada) dengan merelaksasi pembuluh darah.",
  "Captopril": "Menurunkan tekanan darah, mengobati gagal jantung, dan melindungi ginjal pada pasien diabetes dengan nefropati.",
  "Bisoprolol": "Menurunkan tekanan darah dan mengobati gagal jantung kronik dengan mengurangi beban kerja jantung.",
  "Valsartan": "Menurunkan tekanan darah dan mengobati gagal jantung, serta melindungi ginjal pada pasien diabetes.",
  
  // Vitamin & Suplemen
  "Ascorbic Acid": "Mencegah dan mengobati defisiensi vitamin C, meningkatkan sistem kekebalan tubuh, membantu penyerapan zat besi, dan sebagai antioksidan.",
  "Vitamin D": "Menjaga kesehatan tulang dan gigi, mencegah osteoporosis, mendukung fungsi sistem imun dan kesehatan otot.",
  "Vitamin B Complex": "Mendukung metabolisme energi, kesehatan sistem saraf, pembentukan sel darah merah, dan fungsi kognitif.",
  "Zinc": "Meningkatkan sistem kekebalan tubuh, mempercepat penyembuhan luka, mendukung pertumbuhan dan perkembangan normal.",
  
  // Batuk & Flu
  "Dextromethorphan": "Meredakan batuk kering yang tidak produktif dengan menekan refleks batuk di otak.",
  "Guaifenesin": "Mengencerkan dahak dan lendir di saluran pernapasan, memudahkan pengeluaran dahak (ekspektoran).",
  "Bromhexine": "Mengencerkan dahak dan mempermudah pengeluarannya, efektif untuk batuk berdahak.",
  "Pseudoephedrine": "Meredakan hidung tersumbat dan kongesti sinus dengan menyempitkan pembuluh darah di hidung.",
  
  // Obat Tidur & Sedatif
  "Diazepam": "Meredakan kecemasan, insomnia, kejang, spasme otot, dan sebagai premedikasi sebelum prosedur medis.",
  "Alprazolam": "Mengobati gangguan kecemasan dan gangguan panik dengan efek menenangkan.",
  "Melatonin": "Membantu mengatur pola tidur, mengobati insomnia, dan jet lag dengan merangsang rasa kantuk alami.",
  
  // Anti-inflamasi
  "Dexamethasone": "Mengobati berbagai kondisi peradangan, alergi berat, penyakit autoimun, dan mengurangi pembengkakan.",
  "Prednisone": "Mengobati peradangan, alergi, penyakit autoimun seperti lupus dan rheumatoid arthritis, serta asma.",
  "Methylprednisolone": "Mengurangi peradangan pada kondisi seperti arthritis, alergi berat, masalah kulit, dan penyakit autoimun.",
  
  // Obat Asma
  "Salbutamol": "Meredakan sesak napas dan mengi pada asma dan PPOK dengan membuka saluran napas.",
  "Budesonide": "Mencegah serangan asma dengan mengurangi peradangan saluran napas (penggunaan jangka panjang).",
  "Montelukast": "Mencegah serangan asma dan meredakan gejala rhinitis alergi dengan memblokir leukotriene.",
  
  // Obat Maag
  "Sucralfate": "Melindungi dan menyembuhkan tukak lambung dan duodenum dengan membentuk lapisan pelindung pada area yang rusak.",
  "Lansoprazole": "Mengurangi produksi asam lambung untuk mengobati GERD, tukak lambung, dan duodenum.",
  
  // Obat Kolesterol
  "Simvastatin": "Menurunkan kolesterol LDL (jahat) dan trigliserida, meningkatkan kolesterol HDL (baik) untuk mencegah penyakit jantung.",
  "Atorvastatin": "Menurunkan kolesterol tinggi dan mengurangi risiko stroke, serangan jantung, dan komplikasi kardiovaskular lainnya.",
  
  // Obat Kencing Manis
  "Acarbose": "Menurunkan gula darah dengan memperlambat pencernaan dan penyerapan karbohidrat.",
  "Pioglitazone": "Meningkatkan sensitivitas tubuh terhadap insulin untuk mengontrol gula darah pada diabetes tipe 2.",
  
  // Obat Jantung
  "Digoxin": "Mengobati gagal jantung dan aritmia tertentu dengan meningkatkan kekuatan kontraksi jantung.",
  "Nitroglycerin": "Meredakan dan mencegah nyeri dada (angina) dengan merelaksasi pembuluh darah dan meningkatkan aliran darah ke jantung.",
  
  // Obat Infeksi Jamur
  "Fluconazole": "Mengobati infeksi jamur pada mulut (oral thrush), tenggorokan, kerongkongan, paru-paru, saluran kemih, dan vagina.",
  "Ketoconazole": "Mengobati infeksi jamur pada kulit, rambut, kuku, dan sistemik. Juga untuk ketombe yang disebabkan jamur.",
  
  // Obat Cacing
  "Mebendazole": "Mengobati infeksi cacing gelang, cacing kremi, cacing tambang, dan cacing cambuk.",
  "Albendazole": "Mengobati berbagai infeksi cacing termasuk cacing pita, cacing gelang, dan parasit lainnya.",
  
  // Antiseptik & Perawatan Luka
  "Povidone Iodine": "Antiseptik untuk membersihkan dan mendisinfeksi luka, luka bakar ringan, luka operasi, dan mencegah infeksi.",
  "Ethyl Alcohol": "Antiseptik untuk membersihkan kulit sebelum injeksi, mensterilkan permukaan, dan membunuh kuman.",
  "Hydrogen Peroxide": "Membersihkan dan mendisinfeksi luka ringan, luka bakar, dan goresan dengan membunuh bakteri.",
  
  // Rehidrasi
  "Oral Rehydration Salts": "Menggantikan cairan dan elektrolit yang hilang akibat diare dan muntah untuk mencegah dehidrasi.",
  
  // Generic fallback
  "default": "Digunakan untuk mengobati kondisi medis sesuai indikasi dokter. Konsultasikan dengan dokter atau apoteker untuk informasi detail kegunaan obat ini."
};

async function populateUses() {
  const client = await pool.connect();
  try {
    console.log("🔄 Starting to populate uses data...\n");

    // Get all products with their details
    const query = `
      SELECT 
        p.product_id,
        p.name,
        pd.detail_id,
        pd.generic_name,
        pd.uses
      FROM products p
      LEFT JOIN product_details pd ON p.product_id = pd.product_id
      WHERE p.is_active = TRUE
      ORDER BY p.product_id
    `;
    
    const result = await client.query(query);
    const products = result.rows;

    console.log(`📊 Found ${products.length} active products\n`);

    let updated = 0;
    let created = 0;
    let skipped = 0;

    for (const product of products) {
      // Skip if already has uses
      if (product.uses && product.uses.trim() !== "") {
        console.log(`⏭️  Skipped: ${product.name} (already has uses data)`);
        skipped++;
        continue;
      }

      // Find matching uses data
      let usesText = null;
      
      // Try to match by product name or generic name
      for (const [key, value] of Object.entries(usesData)) {
        if (product.name.toLowerCase().includes(key.toLowerCase()) ||
            (product.generic_name && product.generic_name.toLowerCase().includes(key.toLowerCase()))) {
          usesText = value;
          break;
        }
      }

      // Use default if no match found
      if (!usesText) {
        usesText = usesData.default;
      }

      // Update or insert
      if (product.detail_id) {
        // Update existing detail
        await client.query(
          `UPDATE product_details SET uses = $1, updated_at = CURRENT_TIMESTAMP WHERE detail_id = $2`,
          [usesText, product.detail_id]
        );
        console.log(`✅ Updated: ${product.name}`);
        updated++;
      } else {
        // Create new detail
        await client.query(
          `INSERT INTO product_details (product_id, uses) VALUES ($1, $2)`,
          [product.product_id, usesText]
        );
        console.log(`✨ Created: ${product.name}`);
        created++;
      }
    }

    console.log("\n✅ Population complete!");
    console.log(`📈 Summary:`);
    console.log(`   - Updated: ${updated}`);
    console.log(`   - Created: ${created}`);
    console.log(`   - Skipped: ${skipped}`);
    console.log(`   - Total processed: ${products.length}`);

  } catch (error) {
    console.error("❌ Error:", error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the script
populateUses()
  .then(() => {
    console.log("\n🎉 Script completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Script failed:", error);
    process.exit(1);
  });

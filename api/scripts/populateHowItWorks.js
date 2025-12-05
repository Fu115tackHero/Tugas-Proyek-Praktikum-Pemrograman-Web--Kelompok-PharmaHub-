/**
 * Script to populate how_it_works field for existing products
 */

require("dotenv").config({ path: "../.env" });
const pool = require("../config/database");

// Data cara kerja untuk berbagai jenis obat
const howItWorksData = {
  // Pain Relief / Analgesik
  "Paracetamol": "Bekerja dengan menghambat enzim siklooksigenase (COX) di sistem saraf pusat, sehingga mengurangi produksi prostaglandin yang menyebabkan rasa sakit dan demam.",
  "Ibuprofen": "Menghambat enzim COX-1 dan COX-2, mengurangi produksi prostaglandin yang menyebabkan peradangan, nyeri, dan demam.",
  "Aspirin": "Menghambat enzim siklooksigenase secara permanen, mengurangi peradangan, nyeri, dan mencegah pembekuan darah.",
  "Asam Mefenamat": "Menghambat sintesis prostaglandin dengan memblokir enzim COX, efektif untuk mengurangi nyeri dan peradangan.",
  
  // Antibiotik
  "Amoxicillin": "Antibiotik golongan penisilin yang bekerja dengan menghambat sintesis dinding sel bakteri, menyebabkan bakteri tidak dapat berkembang dan akhirnya mati.",
  "Ciprofloxacin": "Antibiotik fluoroquinolone yang menghambat enzim DNA gyrase dan topoisomerase IV, menghentikan replikasi DNA bakteri.",
  "Azithromycin": "Antibiotik makrolida yang menghambat sintesis protein bakteri dengan berikatan pada ribosom 50S, menghentikan pertumbuhan bakteri.",
  "Cefixime": "Antibiotik sefalosporin generasi ketiga yang menghambat sintesis dinding sel bakteri dengan mengikat protein pengikat penisilin (PBP).",
  
  // Antihistamin / Alergi
  "Cetirizine": "Antihistamin generasi kedua yang memblokir reseptor histamin H1, mengurangi gejala alergi seperti gatal, bersin, dan hidung tersumbat tanpa menyebabkan kantuk berlebihan.",
  "Loratadine": "Antihistamin non-sedatif yang memblokir reseptor H1 perifer, mengurangi respons alergi tanpa mempengaruhi sistem saraf pusat.",
  "Chlorpheniramine Maleate": "Antihistamin generasi pertama yang memblokir reseptor histamin H1, efektif untuk alergi tetapi dapat menyebabkan kantuk.",
  "Diphenhydramine": "Antihistamin yang bekerja dengan memblokir efek histamin di tubuh, mengurangi gejala alergi dan memiliki efek sedatif.",
  
  // Pencernaan
  "Omeprazole": "Proton pump inhibitor (PPI) yang menghambat pompa proton H+/K+ ATPase di sel parietal lambung, mengurangi produksi asam lambung secara signifikan.",
  "Ranitidine": "H2-receptor antagonist yang memblokir reseptor histamin H2 di lambung, mengurangi produksi asam lambung.",
  "Antasida": "Menetralkan asam lambung dengan mengandung senyawa alkali seperti magnesium hidroksida dan aluminium hidroksida, memberikan relief cepat dari heartburn.",
  "Domperidone": "Antagonis reseptor dopamin yang meningkatkan motilitas saluran cerna atas, membantu pengosongan lambung dan mengurangi mual.",
  
  // Diabetes
  "Metformin": "Bekerja dengan mengurangi produksi glukosa di hati, meningkatkan sensitivitas insulin di jaringan perifer, dan mengurangi penyerapan glukosa di usus.",
  "Glimepiride": "Sulfonilurea yang merangsang sel beta pankreas untuk melepaskan insulin, membantu menurunkan kadar gula darah.",
  "Insulin": "Hormon yang memfasilitasi pengambilan glukosa oleh sel-sel tubuh, menurunkan kadar gula darah dengan meningkatkan penyimpanan glikogen.",
  
  // Hipertensi / Kardiovaskular
  "Amlodipine": "Calcium channel blocker yang menghambat masuknya ion kalsium ke sel otot polos pembuluh darah dan jantung, menyebabkan vasodilatasi dan menurunkan tekanan darah.",
  "Captopril": "ACE inhibitor yang menghambat konversi angiotensin I menjadi angiotensin II, menyebabkan vasodilatasi dan penurunan tekanan darah.",
  "Bisoprolol": "Beta-blocker selektif yang memblokir reseptor beta-1 adrenergik di jantung, mengurangi denyut jantung dan kontraktilitas, menurunkan tekanan darah.",
  "Valsartan": "Angiotensin II receptor blocker (ARB) yang memblokir reseptor AT1, mencegah efek vasokonstriktor angiotensin II.",
  
  // Vitamin & Suplemen
  "Ascorbic Acid": "Vitamin C yang berperan sebagai antioksidan, mendukung sistem kekebalan tubuh, membantu sintesis kolagen, dan meningkatkan penyerapan zat besi.",
  "Vitamin D": "Meningkatkan penyerapan kalsium dan fosfor di usus, penting untuk kesehatan tulang dan fungsi sistem imun.",
  "Vitamin B Complex": "Kumpulan vitamin B (B1, B2, B3, B5, B6, B7, B9, B12) yang berperan dalam metabolisme energi, fungsi saraf, dan produksi sel darah merah.",
  "Zinc": "Mineral esensial yang berperan dalam fungsi imun, sintesis protein, penyembuhan luka, dan metabolisme DNA.",
  
  // Batuk & Flu
  "Dextromethorphan": "Antitusif yang bekerja di pusat batuk di medulla oblongata, menekan refleks batuk tanpa efek analgesik atau adiktif seperti opioid.",
  "Guaifenesin": "Ekspektoran yang mengencerkan lendir di saluran pernapasan dengan meningkatkan hidrasi sekret, memudahkan pengeluaran dahak.",
  "Bromhexine": "Mukolitik yang memecah struktur mukoprotein dan mukopolisakarida dalam dahak, mengencerkan dan memudahkan ekspektorasi.",
  "Pseudoephedrine": "Dekongestan yang bekerja sebagai agonis reseptor alfa-adrenergik, menyebabkan vasokonstriksi pembuluh darah di mukosa hidung, mengurangi kongesti.",
  
  // Obat Tidur & Sedatif
  "Diazepam": "Benzodiazepin yang bekerja dengan meningkatkan efek neurotransmitter GABA di otak, menghasilkan efek sedatif, anxiolytic, dan muscle relaxant.",
  "Alprazolam": "Benzodiazepin yang meningkatkan aktivitas GABA, efektif untuk mengurangi kecemasan dan gangguan panik.",
  "Melatonin": "Hormon yang mengatur ritme sirkadian, membantu menginduksi tidur dengan berikatan pada reseptor melatonin di otak.",
  
  // Anti-inflamasi
  "Dexamethasone": "Kortikosteroid yang menghambat fosfolipase A2, mengurangi produksi prostaglandin dan leukotrien, memiliki efek anti-inflamasi dan imunosupresif kuat.",
  "Prednisone": "Kortikosteroid sintetik yang menekan respons imun dan inflamasi dengan menghambat berbagai mediator inflamasi.",
  "Methylprednisolone": "Kortikosteroid yang bekerja dengan mengaktifkan reseptor glukokortikoid, mengurangi peradangan dan menekan sistem imun.",
  
  // Obat Asma
  "Salbutamol": "Beta-2 agonist yang merelaksasi otot polos bronkial dengan merangsang reseptor beta-2 adrenergik, menyebabkan bronkodilatasi dan meredakan serangan asma.",
  "Budesonide": "Kortikosteroid inhalasi yang mengurangi inflamasi saluran napas dengan menekan respons imun lokal.",
  "Montelukast": "Leukotriene receptor antagonist yang memblokir reseptor cysteinyl leukotriene, mengurangi bronkokonstriksi dan inflamasi saluran napas.",
  
  // Obat Maag
  "Sucralfate": "Membentuk lapisan protektif pada ulkus dengan berikatan pada protein di area yang rusak, melindungi dari asam lambung dan pepsin.",
  "Lansoprazole": "Proton pump inhibitor yang menghambat H+/K+ ATPase secara irreversible, mengurangi sekresi asam lambung hingga 90%.",
  
  // Obat Kolesterol
  "Simvastatin": "Statin yang menghambat enzim HMG-CoA reductase, mengurangi sintesis kolesterol di hati dan meningkatkan pengambilan LDL dari darah.",
  "Atorvastatin": "Statin yang menghambat HMG-CoA reductase, menurunkan kolesterol LDL dan trigliserida, meningkatkan kolesterol HDL.",
  
  // Obat Kencing Manis
  "Acarbose": "Alpha-glucosidase inhibitor yang menghambat enzim yang memecah karbohidrat kompleks di usus, memperlambat penyerapan glukosa.",
  "Pioglitazone": "Thiazolidinedione yang meningkatkan sensitivitas insulin dengan mengaktivasi reseptor PPAR-gamma di jaringan adiposa dan otot.",
  
  // Obat Jantung
  "Digoxin": "Glikosida jantung yang menghambat pompa Na+/K+ ATPase, meningkatkan kontraktilitas jantung dan memperlambat konduksi AV node.",
  "Nitroglycerin": "Vasodilator yang melepaskan nitric oxide, menyebabkan relaksasi otot polos vaskular, mengurangi preload dan afterload jantung.",
  
  // Obat Infeksi Jamur
  "Fluconazole": "Antifungal azole yang menghambat enzim 14-alpha-demethylase, mengganggu sintesis ergosterol dalam membran sel jamur.",
  "Ketoconazole": "Antifungal yang menghambat sintesis ergosterol, merusak integritas membran sel jamur.",
  
  // Obat Cacing
  "Mebendazole": "Anthelmintik yang menghambat polimerisasi tubulin, mengganggu absorpsi glukosa pada cacing, menyebabkan kematian cacing.",
  "Albendazole": "Anthelmintik broad-spectrum yang menghambat polimerisasi mikrotubulus, mengganggu metabolisme glukosa cacing.",
  
  // Generic fallback
  "default": "Bekerja sesuai dengan mekanisme farmakologis yang spesifik untuk kondisi yang diobati. Konsultasikan dengan dokter atau apoteker untuk informasi detail cara kerja obat ini."
};

async function populateHowItWorks() {
  const client = await pool.connect();
  try {
    console.log("🔄 Starting to populate how_it_works data...\n");

    // Get all products with their details
    const query = `
      SELECT 
        p.product_id,
        p.name,
        pd.detail_id,
        pd.generic_name,
        pd.how_it_works
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
      // Skip if already has how_it_works
      if (product.how_it_works && product.how_it_works.trim() !== "") {
        console.log(`⏭️  Skipped: ${product.name} (already has data)`);
        skipped++;
        continue;
      }

      // Find matching how_it_works data
      let howItWorksText = null;
      
      // Try to match by product name
      for (const [key, value] of Object.entries(howItWorksData)) {
        if (product.name.toLowerCase().includes(key.toLowerCase()) ||
            (product.generic_name && product.generic_name.toLowerCase().includes(key.toLowerCase()))) {
          howItWorksText = value;
          break;
        }
      }

      // Use default if no match found
      if (!howItWorksText) {
        howItWorksText = howItWorksData.default;
      }

      // Update or insert
      if (product.detail_id) {
        // Update existing detail
        await client.query(
          `UPDATE product_details SET how_it_works = $1, updated_at = CURRENT_TIMESTAMP WHERE detail_id = $2`,
          [howItWorksText, product.detail_id]
        );
        console.log(`✅ Updated: ${product.name}`);
        updated++;
      } else {
        // Create new detail
        await client.query(
          `INSERT INTO product_details (product_id, how_it_works) VALUES ($1, $2)`,
          [product.product_id, howItWorksText]
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
populateHowItWorks()
  .then(() => {
    console.log("\n🎉 Script completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Script failed:", error);
    process.exit(1);
  });

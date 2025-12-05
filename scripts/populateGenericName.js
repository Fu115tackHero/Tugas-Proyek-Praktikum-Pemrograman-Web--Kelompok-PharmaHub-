/**
 * Script to populate generic_name field for existing products
 */

require("dotenv").config({ path: "../.env" });
const pool = require("../config/database");

// Data nama generik untuk berbagai produk obat
const genericNameData = {
  // Pain Relief / Analgesik
  "Paracetamol": "Paracetamol",
  "Acetaminophen": "Paracetamol",
  "Panadol": "Paracetamol",
  "Biogesic": "Paracetamol",
  "Sanmol": "Paracetamol",
  
  "Ibuprofen": "Ibuprofen",
  "Proris": "Ibuprofen",
  "Brufen": "Ibuprofen",
  
  "Aspirin": "Asam Asetilsalisilat",
  "Aspilet": "Asam Asetilsalisilat",
  
  "Asam Mefenamat": "Asam Mefenamat",
  "Ponstan": "Asam Mefenamat",
  "Mefinal": "Asam Mefenamat",
  
  // Antibiotik
  "Amoxicillin": "Amoxicillin",
  "Amoxan": "Amoxicillin",
  "Hufanoxil": "Amoxicillin",
  
  "Ciprofloxacin": "Ciprofloxacin",
  "Baquinor": "Ciprofloxacin",
  
  "Azithromycin": "Azithromycin",
  "Zithromax": "Azithromycin",
  
  "Cefixime": "Cefixime",
  "Cefspan": "Cefixime",
  
  // Antihistamin / Alergi
  "Cetirizine": "Cetirizine",
  "Incidal": "Cetirizine",
  
  "Loratadine": "Loratadine",
  "Claritin": "Loratadine",
  
  "Chlorpheniramine": "Chlorpheniramine Maleate",
  "CTM": "Chlorpheniramine Maleate",
  
  "Diphenhydramine": "Diphenhydramine",
  "Benadryl": "Diphenhydramine",
  
  // Pencernaan
  "Omeprazole": "Omeprazole",
  "Prilosec": "Omeprazole",
  
  "Ranitidine": "Ranitidine",
  "Zantac": "Ranitidine",
  
  "Promag": "Aluminium Hidroksida + Magnesium Hidroksida",
  "Antasida": "Aluminium Hidroksida + Magnesium Hidroksida",
  "Magtral": "Aluminium Hidroksida + Magnesium Hidroksida",
  
  "Domperidone": "Domperidone",
  "Motilium": "Domperidone",
  
  "Loperamide": "Loperamide",
  "Imodium": "Loperamide",
  
  // Diabetes
  "Metformin": "Metformin",
  "Glucophage": "Metformin",
  
  "Glimepiride": "Glimepiride",
  "Amaryl": "Glimepiride",
  
  // Hipertensi / Kardiovaskular
  "Amlodipine": "Amlodipine",
  "Norvasc": "Amlodipine",
  
  "Captopril": "Captopril",
  "Capoten": "Captopril",
  
  "Bisoprolol": "Bisoprolol",
  "Concor": "Bisoprolol",
  
  "Valsartan": "Valsartan",
  "Diovan": "Valsartan",
  
  // Vitamin & Suplemen
  "Vitamin C": "Ascorbic Acid",
  "Ascorbic": "Ascorbic Acid",
  "Vit C": "Ascorbic Acid",
  
  "Vitamin D": "Cholecalciferol",
  "Vit D": "Cholecalciferol",
  "Vitamin D3": "Cholecalciferol",
  
  "Vitamin B": "Vitamin B Complex",
  "Neurobion": "Vitamin B Complex",
  "Becombion": "Vitamin B Complex",
  
  "Zinc": "Zinc Sulfate",
  
  // Batuk & Flu
  "Dextromethorphan": "Dextromethorphan",
  "DMP": "Dextromethorphan",
  
  "Guaifenesin": "Guaifenesin",
  
  "Bromhexine": "Bromhexine",
  "Bisolvon": "Bromhexine",
  
  "Pseudoephedrine": "Pseudoephedrine",
  
  // Obat Tidur & Sedatif
  "Diazepam": "Diazepam",
  "Valium": "Diazepam",
  
  "Alprazolam": "Alprazolam",
  "Xanax": "Alprazolam",
  
  "Melatonin": "Melatonin",
  
  // Anti-inflamasi
  "Dexamethasone": "Dexamethasone",
  "Decadron": "Dexamethasone",
  
  "Prednisone": "Prednisone",
  
  "Methylprednisolone": "Methylprednisolone",
  "Medrol": "Methylprednisolone",
  
  // Obat Asma
  "Salbutamol": "Salbutamol",
  "Ventolin": "Salbutamol",
  "Astharol": "Salbutamol",
  
  "Budesonide": "Budesonide",
  "Pulmicort": "Budesonide",
  
  "Montelukast": "Montelukast",
  "Singulair": "Montelukast",
  
  // Obat Maag
  "Sucralfate": "Sucralfate",
  "Inpepsa": "Sucralfate",
  
  "Lansoprazole": "Lansoprazole",
  "Prevacid": "Lansoprazole",
  
  // Obat Kolesterol
  "Simvastatin": "Simvastatin",
  "Zocor": "Simvastatin",
  
  "Atorvastatin": "Atorvastatin",
  "Lipitor": "Atorvastatin",
  
  // Obat Jantung
  "Digoxin": "Digoxin",
  "Lanoxin": "Digoxin",
  
  "Nitroglycerin": "Nitroglycerin",
  "Nitrostat": "Nitroglycerin",
  
  // Obat Infeksi Jamur
  "Fluconazole": "Fluconazole",
  "Diflucan": "Fluconazole",
  
  "Ketoconazole": "Ketoconazole",
  "Nizoral": "Ketoconazole",
  
  // Obat Cacing
  "Mebendazole": "Mebendazole",
  "Vermox": "Mebendazole",
  
  "Albendazole": "Albendazole",
  
  // Antiseptik & Perawatan Luka
  "Betadine": "Povidone Iodine",
  "Povidone": "Povidone Iodine",
  
  "Alcohol": "Ethyl Alcohol",
  "Ethanol": "Ethyl Alcohol",
  
  "Hydrogen Peroxide": "Hydrogen Peroxide",
  
  // Rehidrasi
  "Oralit": "Oral Rehydration Salts",
  "ORS": "Oral Rehydration Salts",
};

async function populateGenericName() {
  const client = await pool.connect();
  try {
    console.log("🔄 Starting to populate generic_name data...\n");

    // Get all products with their details
    const query = `
      SELECT 
        p.product_id,
        p.name,
        p.brand,
        pd.detail_id,
        pd.generic_name
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
    let notFound = 0;

    for (const product of products) {
      // Skip if already has generic_name
      if (product.generic_name && product.generic_name.trim() !== "") {
        console.log(`⏭️  Skipped: ${product.name} (already has generic: ${product.generic_name})`);
        skipped++;
        continue;
      }

      // Find matching generic name
      let genericName = null;
      
      // Try to match by product name or brand
      const searchText = `${product.name} ${product.brand || ""}`.toLowerCase();
      
      for (const [key, value] of Object.entries(genericNameData)) {
        if (searchText.includes(key.toLowerCase())) {
          genericName = value;
          break;
        }
      }

      if (!genericName) {
        console.log(`❓ Not found: ${product.name} - No matching generic name`);
        notFound++;
        continue;
      }

      // Update or insert
      if (product.detail_id) {
        // Update existing detail
        await client.query(
          `UPDATE product_details SET generic_name = $1, updated_at = CURRENT_TIMESTAMP WHERE detail_id = $2`,
          [genericName, product.detail_id]
        );
        console.log(`✅ Updated: ${product.name} → ${genericName}`);
        updated++;
      } else {
        // Create new detail
        await client.query(
          `INSERT INTO product_details (product_id, generic_name) VALUES ($1, $2)`,
          [product.product_id, genericName]
        );
        console.log(`✨ Created: ${product.name} → ${genericName}`);
        created++;
      }
    }

    console.log("\n✅ Population complete!");
    console.log(`📈 Summary:`);
    console.log(`   - Updated: ${updated}`);
    console.log(`   - Created: ${created}`);
    console.log(`   - Skipped: ${skipped}`);
    console.log(`   - Not found: ${notFound}`);
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
populateGenericName()
  .then(() => {
    console.log("\n🎉 Script completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Script failed:", error);
    process.exit(1);
  });

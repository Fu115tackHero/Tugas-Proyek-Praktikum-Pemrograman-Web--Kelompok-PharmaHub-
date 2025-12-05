/**
 * Simple Update Product Details
 * Updates only existing 10 products with detailed information
 */

const { Pool } = require("pg");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME,
});

// Product details for existing 10 products
const productDetails = [
  {
    product_id: 1,
    generic_name: "Paracetamol",
    uses: "Menurunkan demam, meredakan nyeri ringan hingga sedang seperti sakit kepala, sakit gigi, nyeri otot.",
    how_it_works:
      "Bekerja dengan menghambat produksi prostaglandin di otak yang menyebabkan rasa sakit dan demam.",
    ingredients: [
      "Paracetamol 500 mg",
      "Mikrokristalin selulosa",
      "Natrium starch glikolat",
      "Polivinilpirolidon",
      "Magnesium stearat",
      "Talk",
    ],
    precaution: [
      "Jangan melebihi dosis yang dianjurkan (maksimal 4 gram per hari untuk dewasa)",
      "Konsultasikan dengan dokter jika memiliki riwayat penyakit hati",
      "Hindari konsumsi alkohol selama pengobatan",
    ],
    side_effects: [
      "Jarang terjadi efek samping jika digunakan sesuai dosis",
      "Reaksi alergi kulit (ruam, gatal) pada beberapa orang",
      "Gangguan hati jika dikonsumsi berlebihan",
    ],
    interactions: [
      "Warfarin: dapat meningkatkan risiko perdarahan",
      "Obat epilepsi: dapat mengurangi efektivitas paracetamol",
      "Alkohol: meningkatkan risiko kerusakan hati",
    ],
    indication: [
      "Demam pada anak dan dewasa",
      "Sakit kepala ringan hingga sedang",
      "Nyeri otot dan sendi ringan",
      "Sakit gigi",
    ],
  },
  {
    product_id: 2,
    generic_name: "Ibuprofen",
    uses: "Mengurangi peradangan, menurunkan demam, meredakan nyeri otot dan sendi.",
    how_it_works:
      "Menghambat enzim COX yang menghasilkan prostaglandin penyebab nyeri dan peradangan.",
    ingredients: [
      "Ibuprofen 400 mg",
      "Laktosa monohidrat",
      "Pati jagung",
      "Natrium kroskarmelosa",
      "Silika koloid anhidrat",
      "Magnesium stearat",
    ],
    precaution: [
      "Konsumsi bersama makanan untuk mengurangi iritasi lambung",
      "Hindari jika memiliki riwayat tukak lambung",
      "Hati-hati pada penderita hipertensi dan penyakit jantung",
    ],
    side_effects: [
      "Gangguan pencernaan (mual, nyeri perut)",
      "Pusing dan sakit kepala",
      "Ruam kulit pada beberapa kasus",
    ],
    interactions: [
      "Aspirin: meningkatkan risiko perdarahan",
      "ACE inhibitor: dapat mengurangi efek penurun tekanan darah",
      "Lithium: dapat meningkatkan kadar lithium dalam darah",
    ],
    indication: [
      "Nyeri dan peradangan pada arthritis",
      "Nyeri otot dan keseleo",
      "Sakit gigi",
      "Demam",
    ],
  },
  {
    product_id: 3,
    generic_name: "Antasida",
    uses: "Meredakan gejala maag, heartburn, mual akibat asam lambung.",
    how_it_works:
      "Menetralkan asam lambung berlebih dan melindungi dinding lambung.",
    ingredients: ["Aluminium hydroxide", "Magnesium hydroxide", "Simethicone"],
    precaution: [
      "Konsumsi 1-2 jam sebelum atau setelah makan",
      "Jangan dikonsumsi bersamaan dengan antibiotik",
      "Konsultasi dokter jika gejala berlanjut lebih dari 2 minggu",
    ],
    side_effects: [
      "Diare atau konstipasi (tergantung kandungan)",
      "Perut kembung ringan",
      "Mual ringan",
    ],
    interactions: [
      "Antibiotik: dapat mengurangi penyerapan",
      "Obat jantung: dapat mempengaruhi efektivitas",
      "Suplemen zat besi: mengurangi penyerapan",
    ],
    indication: ["Maag akut", "Heartburn", "GERD ringan", "Dispepsia"],
  },
  {
    product_id: 4,
    generic_name: "Amoxicillin",
    uses: "Mengobati infeksi bakteri pada saluran pernapasan, kulit, dan saluran kemih.",
    how_it_works:
      "Antibiotik beta-laktam yang menghambat pembentukan dinding sel bakteri.",
    ingredients: ["Amoxicillin trihydrate 500 mg"],
    precaution: [
      "Habiskan antibiotik sesuai resep dokter",
      "Jangan gunakan untuk infeksi virus seperti flu",
      "Beri tahu dokter jika alergi penisilin",
    ],
    side_effects: [
      "Diare ringan",
      "Mual dan muntah",
      "Ruam kulit (segera hentikan jika terjadi)",
    ],
    interactions: [
      "Kontrasepsi oral: dapat mengurangi efektivitas",
      "Allopurinol: meningkatkan risiko ruam kulit",
      "Warfarin: dapat meningkatkan efek antikoagulan",
    ],
    indication: [
      "Infeksi saluran pernapasan",
      "Infeksi saluran kemih",
      "Infeksi kulit dan jaringan lunak",
      "Otitis media",
    ],
  },
  {
    product_id: 5,
    generic_name: "Ascorbic Acid",
    uses: "Meningkatkan imunitas, antioksidan, membantu penyerapan zat besi.",
    how_it_works:
      "Vitamin C berperan sebagai antioksidan dan mendukung fungsi kekebalan tubuh.",
    ingredients: [
      "Ascorbic Acid 1000 mg",
      "Sodium ascorbate",
      "Citrus bioflavonoids",
    ],
    precaution: [
      "Dosis tinggi dapat menyebabkan diare",
      "Kurangi dosis jika mengalami gangguan pencernaan",
      "Konsultasi dokter jika memiliki riwayat batu ginjal",
    ],
    side_effects: ["Diare jika dosis berlebihan", "Mual ringan", "Kram perut"],
    interactions: [
      "Aspirin: dapat mengurangi penyerapan vitamin C",
      "Aluminium antasida: vitamin C meningkatkan penyerapan aluminium",
      "Warfarin: dosis tinggi dapat mempengaruhi efek",
    ],
    indication: [
      "Meningkatkan daya tahan tubuh",
      "Membantu penyembuhan luka",
      "Antioksidan",
      "Pencegahan flu",
    ],
  },
  {
    product_id: 6,
    generic_name: "Omeprazole",
    uses: "Mengobati GERD, tukak lambung, tukak duodenum.",
    how_it_works:
      "Proton pump inhibitor yang mengurangi produksi asam lambung.",
    ingredients: ["Omeprazole 20 mg"],
    precaution: [
      "Konsumsi sebelum makan",
      "Jangan dikunyah, telan utuh",
      "Penggunaan jangka panjang memerlukan pengawasan dokter",
    ],
    side_effects: ["Sakit kepala", "Mual dan diare", "Nyeri perut"],
    interactions: [
      "Clopidogrel: omeprazole dapat mengurangi efektivitas",
      "Diazepam: dapat meningkatkan kadar diazepam",
      "Warfarin: dapat mempengaruhi waktu pembekuan",
    ],
    indication: [
      "GERD",
      "Tukak lambung",
      "Tukak duodenum",
      "Sindrom Zollinger-Ellison",
    ],
  },
  {
    product_id: 7,
    generic_name: "Cetirizine",
    uses: "Meredakan gejala alergi: rhinitis alergi, urtikaria.",
    how_it_works:
      "Antihistamin generasi kedua yang memblokir reseptor histamin H1.",
    ingredients: ["Cetirizine dihydrochloride 10 mg"],
    precaution: [
      "Dapat menyebabkan kantuk ringan",
      "Hindari mengemudi jika mengantuk",
      "Kurangi dosis pada gangguan ginjal",
    ],
    side_effects: ["Kantuk ringan", "Mulut kering", "Sakit kepala"],
    interactions: [
      "Alkohol: meningkatkan efek sedasi",
      "Teofilin: dapat mengurangi clearance cetirizine",
      "Ritonavir: meningkatkan konsentrasi cetirizine",
    ],
    indication: [
      "Rhinitis alergi",
      "Urtikaria kronik",
      "Alergi kulit",
      "Hay fever",
    ],
  },
  {
    product_id: 8,
    generic_name: "Metformin",
    uses: "Mengontrol kadar gula darah pada diabetes melitus tipe 2.",
    how_it_works:
      "Mengurangi produksi glukosa di hati dan meningkatkan sensitivitas insulin.",
    ingredients: ["Metformin HCl 500 mg"],
    precaution: [
      "Konsumsi bersama atau setelah makan",
      "Monitor fungsi ginjal secara berkala",
      "Hentikan sementara sebelum prosedur menggunakan kontras",
    ],
    side_effects: [
      "Mual dan diare (terutama awal pengobatan)",
      "Kembung",
      "Rasa logam di mulut",
    ],
    interactions: [
      "Alkohol: meningkatkan risiko asidosis laktat",
      "Kontras radiologi: hentikan sementara",
      "Insulin: dapat meningkatkan risiko hipoglikemia",
    ],
    indication: [
      "Diabetes mellitus tipe 2",
      "PCOS (dengan pengawasan dokter)",
      "Prediabetes (dengan pengawasan dokter)",
    ],
  },
  {
    product_id: 9,
    generic_name: "Salbutamol",
    uses: "Meredakan sesak napas akut pada asma dan PPOK.",
    how_it_works: "Bronkodilator yang merelaksasi otot-otot saluran napas.",
    ingredients: ["Salbutamol sulfate 100 mcg per actuation"],
    precaution: [
      "Kocok inhaler sebelum digunakan",
      "Bilas mulut setelah penggunaan",
      "Jangan melebihi dosis yang dianjurkan",
    ],
    side_effects: ["Tremor tangan ringan", "Jantung berdebar", "Sakit kepala"],
    interactions: [
      "Beta-blocker: dapat mengurangi efektivitas salbutamol",
      "Diuretik: meningkatkan risiko hipokalemia",
      "Antidepresan: dapat meningkatkan efek kardiovaskular",
    ],
    indication: [
      "Asma akut",
      "PPOK",
      "Bronkospasme",
      "Exercise-induced bronchoconstriction",
    ],
  },
  {
    product_id: 10,
    generic_name: "Povidone Iodine",
    uses: "Desinfeksi luka, luka bakar ringan, luka lecet.",
    how_it_works:
      "Antiseptik spektrum luas yang membunuh bakteri, virus, dan jamur.",
    ingredients: ["Povidone iodine 10%"],
    precaution: [
      "Hanya untuk penggunaan luar",
      "Hindari kontak dengan mata",
      "Jangan gunakan pada luka dalam atau luka bakar berat",
    ],
    side_effects: [
      "Iritasi kulit pada beberapa orang",
      "Reaksi alergi (jarang)",
      "Pewarnaan kulit sementara",
    ],
    interactions: [
      "Antiseptik lain: hindari penggunaan bersamaan",
      "Lithium: hindari penggunaan jangka panjang",
    ],
    indication: [
      "Desinfeksi luka ringan",
      "Luka lecet",
      "Luka bakar tingkat 1",
      "Antisepsis pra-operasi",
    ],
  },
];

async function updateDetails() {
  const client = await pool.connect();

  try {
    console.log("\n🔄 Updating product details...\n");

    await client.query("BEGIN");

    for (const detail of productDetails) {
      // Insert or update product_details
      const query = `
        INSERT INTO product_details (
          product_id, generic_name, uses, how_it_works,
          ingredients, precaution, side_effects, interactions, indication
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (product_id)
        DO UPDATE SET
          generic_name = EXCLUDED.generic_name,
          uses = EXCLUDED.uses,
          how_it_works = EXCLUDED.how_it_works,
          ingredients = EXCLUDED.ingredients,
          precaution = EXCLUDED.precaution,
          side_effects = EXCLUDED.side_effects,
          interactions = EXCLUDED.interactions,
          indication = EXCLUDED.indication,
          updated_at = CURRENT_TIMESTAMP;
      `;

      await client.query(query, [
        detail.product_id,
        detail.generic_name,
        detail.uses,
        detail.how_it_works,
        detail.ingredients,
        detail.precaution,
        detail.side_effects,
        detail.interactions,
        detail.indication,
      ]);

      console.log(`✅ Updated details for product ID ${detail.product_id}`);
    }

    await client.query("COMMIT");
    console.log(
      `\n🎉 Successfully updated ${productDetails.length} product details!\n`
    );
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Error updating product details:", error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

updateDetails().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

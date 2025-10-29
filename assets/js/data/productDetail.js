/**
 * Product data for detail pages
 */

export const productData = {
  1: {
    name: "Paracetamol 500mg",
    brand: "Kimia Farma",
    price: 12000,
    description:
      "Paracetamol bekerja dengan cara menghambat produksi prostaglandin yang menyebabkan nyeri dan demam.",
    uses: [
      "Menurunkan demam",
      "Meredakan sakit kepala",
      "Mengurangi nyeri ringan",
    ],
    generic: "Paracetamol",
    prescriptionRequired: false,
    precaution: [
      "Jangan melebihi dosis yang dianjurkan (maksimal 4 gram per hari untuk dewasa)",
      "Konsultasikan dengan dokter jika memiliki riwayat penyakit hati",
      "Hindari konsumsi alkohol selama pengobatan",
    ],
    sideEffects: [
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
  2: {
    name: "Ibuprofen 400mg",
    brand: "Kalbe Farma",
    price: 15000,
    description:
      "Ibuprofen adalah obat antiinflamasi non-steroid (NSAID) yang bekerja menghambat enzim cyclooxygenase untuk mengurangi peradangan dan nyeri.",
    uses: [
      "Mengurangi peradangan",
      "Meredakan nyeri otot dan sendi",
      "Menurunkan demam",
    ],
    generic: "Ibuprofen",
    prescriptionRequired: false,
    precaution: [
      "Konsumsi bersama makanan untuk mengurangi iritasi lambung",
      "Hindari jika memiliki riwayat tukak lambung",
      "Hati-hati pada penderita hipertensi dan penyakit jantung",
    ],
    sideEffects: [
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
      "Sakit gigi dan nyeri pascaoperasi",
      "Demam",
    ],
  },
  3: {
    name: "Promag",
    brand: "Kalbe Farma",
    price: 8000,
    description:
      "Promag bekerja menetralkan asam lambung berlebih dan melapisi dinding lambung untuk mengurangi iritasi.",
    uses: [
      "Meredakan sakit maag",
      "Mengurangi nyeri ulu hati",
      "Mengatasi gangguan asam lambung",
    ],
    generic: "Antasida",
    prescriptionRequired: false,
    precaution: [
      "Hindari penggunaan berlebihan",
      "Konsultasi dengan dokter jika gejala berlanjut lebih dari 2 minggu",
      "Hati-hati pada penderita gangguan ginjal",
    ],
    sideEffects: [
      "Konstipasi atau diare ringan",
      "Mual pada beberapa kasus",
      "Perut kembung",
    ],
    interactions: [
      "Antibiotik: dapat mengurangi penyerapan antibiotik",
      "Obat jantung: dapat mengurangi efektivitas",
      "Suplemen zat besi: mengurangi penyerapan",
    ],
    indication: [
      "Sakit maag",
      "Heartburn atau nyeri ulu hati",
      "Gangguan pencernaan akibat asam lambung",
    ],
  },
  4: {
    name: "Loperamide (Imodium)",
    brand: "Johnson & Johnson",
    price: 20000,
    description:
      "Loperamide bekerja memperlambat pergerakan usus untuk mengurangi frekuensi buang air besar.",
    uses: [
      "Mengatasi diare akut",
      "Mengurangi frekuensi BAB",
      "Meredakan kram perut",
    ],
    generic: "Loperamide HCl",
    prescriptionRequired: false,
    precaution: [
      "Jangan gunakan lebih dari 2 hari tanpa konsultasi dokter",
      "Hindari jika ada demam atau darah dalam tinja",
      "Perbanyak minum air untuk mencegah dehidrasi",
    ],
    sideEffects: [
      "Konstipasi jika berlebihan",
      "Pusing atau mengantuk",
      "Kram perut ringan",
    ],
    interactions: [
      "Antibiotik: dapat mengurangi efektivitas",
      "Obat HIV: meningkatkan kadar loperamide dalam darah",
      "Quinidine: meningkatkan risiko efek samping",
    ],
    indication: [
      "Diare akut non-spesifik",
      "Diare pelancong",
      "Mengurangi output ileostomy",
    ],
  },
  5: {
    name: "Cetirizine",
    brand: "Dexa Medica",
    price: 25000,
    description:
      "Cetirizine adalah antihistamin generasi kedua yang bekerja memblokir histamin untuk meredakan gejala alergi.",
    uses: [
      "Meredakan gejala alergi",
      "Mengurangi bersin dan hidung meler",
      "Mengatasi gatal-gatal",
    ],
    generic: "Cetirizine HCl",
    prescriptionRequired: false,
    precaution: [
      "Dapat menyebabkan kantuk pada beberapa orang",
      "Hindari mengemudi setelah konsumsi",
      "Hati-hati pada penderita gangguan ginjal",
    ],
    sideEffects: ["Kantuk ringan", "Mulut kering", "Sakit kepala", "Kelelahan"],
    interactions: [
      "Alkohol: meningkatkan efek sedasi",
      "Obat penenang: meningkatkan rasa kantuk",
      "Teofilin: dapat meningkatkan efek samping",
    ],
    indication: [
      "Rhinitis alergi (hay fever)",
      "Urtikaria (biduran)",
      "Gatal-gatal akibat alergi",
      "Dermatitis alergi",
    ],
  },
  6: {
    name: "Salbutamol Inhaler",
    brand: "GlaxoSmithKline",
    price: 45000,
    description:
      "Salbutamol adalah bronkodilator yang bekerja merelaksasi otot-otot saluran napas untuk memudahkan pernapasan.",
    uses: [
      "Meredakan sesak napas",
      "Mengatasi serangan asma",
      "Melegakan saluran pernapasan",
    ],
    generic: "Salbutamol Sulfate",
    prescriptionRequired: false,
    precaution: [
      "Jangan melebihi dosis yang dianjurkan",
      "Kumur mulut setelah penggunaan",
      "Konsultasi jika gejala tidak membaik",
    ],
    sideEffects: [
      "Jantung berdebar",
      "Tremor ringan pada tangan",
      "Sakit kepala",
      "Kram otot",
    ],
    interactions: [
      "Beta-blocker: dapat mengurangi efektivitas",
      "Diuretik: meningkatkan risiko hipokalemia",
      "Antidepresan: meningkatkan efek pada jantung",
    ],
    indication: [
      "Asma bronkial",
      "Bronkospasme",
      "COPD (Chronic Obstructive Pulmonary Disease)",
      "Sesak napas akibat olahraga",
    ],
  },
  7: {
    name: "Betadine",
    brand: "Mundipharma",
    price: 18000,
    description:
      "Betadine (Povidone Iodine) adalah antiseptik spektrum luas yang efektif membunuh bakteri, virus, dan jamur.",
    uses: ["Membersihkan luka", "Antiseptik kulit", "Mencegah infeksi"],
    generic: "Povidone Iodine",
    prescriptionRequired: false,
    precaution: [
      "Hindari kontak dengan mata",
      "Jangan gunakan pada luka bakar luas",
      "Hentikan jika terjadi iritasi",
    ],
    sideEffects: [
      "Iritasi kulit ringan",
      "Reaksi alergi pada beberapa orang",
      "Kemerahan pada area aplikasi",
    ],
    interactions: [
      "Hidrogen peroksida: dapat mengurangi efektivitas",
      "Antiseptik lain: hindari penggunaan bersamaan",
      "Lithium: dapat meningkatkan kadar lithium",
    ],
    indication: [
      "Luka ringan dan goresan",
      "Antisepsis kulit sebelum tindakan medis",
      "Luka bakar ringan",
      "Infeksi kulit ringan",
    ],
  },
  8: {
    name: "Oralit",
    brand: "Pharos",
    price: 5000,
    description:
      "Oralit adalah larutan elektrolit untuk rehidrasi oral yang mengandung garam dan glukosa untuk mengganti cairan tubuh yang hilang.",
    uses: [
      "Mencegah dehidrasi",
      "Mengganti cairan tubuh",
      "Rehidrasi saat diare",
    ],
    generic: "Elektrolit Oral",
    prescriptionRequired: false,
    precaution: [
      "Larutkan dalam air matang",
      "Gunakan segera setelah dilarutkan",
      "Konsultasi dokter jika diare tidak membaik dalam 24 jam",
    ],
    sideEffects: [
      "Jarang terjadi efek samping",
      "Mual jika diminum terlalu cepat",
      "Muntah pada kasus tertentu",
    ],
    interactions: [
      "Tidak ada interaksi obat yang signifikan",
      "Aman digunakan bersama obat lain",
    ],
    indication: [
      "Dehidrasi ringan hingga sedang",
      "Diare akut",
      "Muntah-muntah",
      "Kehilangan cairan akibat olahraga berat",
    ],
  },
  9: {
    name: "Vitamin C 500mg",
    brand: "Kalbe Farma",
    price: 25000,
    description:
      "Vitamin C adalah antioksidan penting yang membantu meningkatkan sistem kekebalan tubuh dan mempercepat penyembuhan luka.",
    uses: [
      "Meningkatkan daya tahan tubuh",
      "Antioksidan",
      "Membantu penyembuhan luka",
    ],
    generic: "Ascorbic Acid",
    prescriptionRequired: false,
    precaution: [
      "Jangan melebihi dosis harian yang dianjurkan",
      "Hati-hati pada penderita batu ginjal",
      "Konsumsi setelah makan",
    ],
    sideEffects: [
      "Gangguan pencernaan jika berlebihan",
      "Diare pada dosis tinggi",
      "Mual",
    ],
    interactions: [
      "Aspirin: dapat menurunkan kadar vitamin C",
      "Suplemen besi: meningkatkan penyerapan besi",
      "Antasida: dapat meningkatkan penyerapan aluminium",
    ],
    indication: [
      "Defisiensi vitamin C",
      "Meningkatkan daya tahan tubuh",
      "Pemulihan pasca sakit",
      "Antioksidan",
    ],
  },
  10: {
    name: "Amoxicillin 500mg",
    brand: "Kimia Farma",
    price: 40000,
    description:
      "Amoxicillin adalah antibiotik golongan penisilin yang bekerja membunuh bakteri penyebab infeksi.",
    uses: [
      "Mengatasi infeksi bakteri",
      "Infeksi saluran pernapasan",
      "Infeksi kulit",
    ],
    generic: "Amoxicillin",
    prescriptionRequired: true,
    precaution: [
      "Habiskan antibiotik sesuai resep dokter",
      "Jangan gunakan jika alergi penisilin",
      "Konsumsi sesuai jadwal",
    ],
    sideEffects: ["Diare", "Mual dan muntah", "Ruam kulit", "Reaksi alergi"],
    interactions: [
      "Kontrasepsi oral: dapat mengurangi efektivitas",
      "Methotrexate: meningkatkan toksisitas",
      "Allopurinol: meningkatkan risiko ruam kulit",
    ],
    indication: [
      "Infeksi saluran pernapasan",
      "Infeksi telinga",
      "Infeksi saluran kemih",
      "Infeksi kulit dan jaringan lunak",
    ],
  },
  11: {
    name: "Omeprazole 20mg",
    brand: "Dexa Medica",
    price: 35000,
    description:
      "Omeprazole adalah proton pump inhibitor (PPI) yang mengurangi produksi asam lambung.",
    uses: [
      "Mengurangi asam lambung",
      "Mengobati GERD",
      "Mengatasi tukak lambung",
    ],
    generic: "Omeprazole",
    prescriptionRequired: true,
    precaution: [
      "Konsumsi 30 menit sebelum makan",
      "Jangan dihancurkan atau dikunyah",
      "Konsultasi untuk penggunaan jangka panjang",
    ],
    sideEffects: [
      "Sakit kepala",
      "Diare atau konstipasi",
      "Mual",
      "Nyeri perut",
    ],
    interactions: [
      "Warfarin: meningkatkan risiko perdarahan",
      "Clopidogrel: mengurangi efektivitas",
      "Ketoconazole: mengurangi penyerapan",
    ],
    indication: [
      "GERD (Gastroesophageal Reflux Disease)",
      "Tukak lambung dan duodenum",
      "Sindrom Zollinger-Ellison",
      "Dispepsia",
    ],
  },
  12: {
    name: "Vitamin D3 1000 IU",
    brand: "Blackmores",
    price: 45000,
    description:
      "Vitamin D3 membantu penyerapan kalsium untuk kesehatan tulang dan gigi.",
    uses: ["Kesehatan tulang", "Penyerapan kalsium", "Meningkatkan imunitas"],
    generic: "Cholecalciferol",
    prescriptionRequired: false,
    precaution: [
      "Jangan melebihi dosis harian",
      "Konsumsi bersama makanan berlemak",
      "Konsultasi jika ada riwayat batu ginjal",
    ],
    sideEffects: [
      "Jarang terjadi pada dosis normal",
      "Mual jika berlebihan",
      "Sembelit pada dosis tinggi",
    ],
    interactions: [
      "Suplemen kalsium: meningkatkan penyerapan",
      "Obat jantung: hati-hati pada penderita jantung",
      "Kortikosteroid: mengurangi efektivitas",
    ],
    indication: [
      "Defisiensi vitamin D",
      "Osteoporosis",
      "Rakhitis",
      "Meningkatkan kesehatan tulang",
    ],
  },
  13: {
    name: "Multivitamin Complete",
    brand: "Wellness",
    price: 55000,
    description:
      "Kombinasi lengkap vitamin dan mineral untuk mendukung kesehatan optimal sehari-hari.",
    uses: [
      "Melengkapi nutrisi harian",
      "Meningkatkan energi",
      "Mendukung kesehatan optimal",
    ],
    generic: "Multivitamin & Mineral",
    prescriptionRequired: false,
    precaution: [
      "Konsumsi setelah makan",
      "Jangan dikonsumsi bersamaan dengan susu",
      "Simpan di tempat sejuk dan kering",
    ],
    sideEffects: [
      "Mual jika diminum saat perut kosong",
      "Perubahan warna urin (normal)",
      "Gangguan pencernaan ringan",
    ],
    interactions: [
      "Antibiotik: berikan jeda 2 jam",
      "Obat tiroid: kurangi penyerapan",
      "Antasida: kurangi efektivitas",
    ],
    indication: [
      "Suplemen nutrisi harian",
      "Defisiensi vitamin dan mineral",
      "Pemulihan pasca sakit",
      "Meningkatkan stamina",
    ],
  },
  14: {
    name: "Alcohol 70%",
    brand: "OneMed",
    price: 15000,
    description:
      "Alkohol 70% adalah antiseptik yang efektif untuk membersihkan tangan dan permukaan dari kuman.",
    uses: ["Antiseptik tangan", "Membersihkan permukaan", "Disinfeksi"],
    generic: "Ethyl Alcohol 70%",
    prescriptionRequired: false,
    precaution: [
      "Jauhkan dari api dan panas",
      "Hindari kontak dengan mata",
      "Simpan di tempat sejuk",
    ],
    sideEffects: [
      "Kulit kering jika sering digunakan",
      "Iritasi pada kulit sensitif",
      "Rasa terbakar saat digunakan pada luka",
    ],
    interactions: [
      "Tidak ada interaksi obat signifikan",
      "Hindari penggunaan bersamaan dengan antiseptik lain",
    ],
    indication: [
      "Antisepsis tangan",
      "Disinfeksi permukaan",
      "Membersihkan area kulit sebelum injeksi",
      "Sanitasi",
    ],
  },
  15: {
    name: "Captopril 25mg",
    brand: "Dexa Medica",
    price: 30000,
    description:
      "Captopril adalah ACE inhibitor yang bekerja menurunkan tekanan darah dan mengurangi beban kerja jantung.",
    uses: ["Menurunkan tekanan darah", "Mengatasi hipertensi", "Gagal jantung"],
    generic: "Captopril",
    prescriptionRequired: true,
    precaution: [
      "Harus dengan resep dokter",
      "Pantau tekanan darah secara rutin",
      "Hindari suplemen kalium tinggi",
    ],
    sideEffects: [
      "Batuk kering",
      "Pusing",
      "Hipotensi (tekanan darah rendah)",
      "Ruam kulit",
    ],
    interactions: [
      "Diuretik: meningkatkan efek penurun tekanan darah",
      "Suplemen kalium: risiko hiperkalemia",
      "NSAIDs: mengurangi efektivitas",
    ],
    indication: [
      "Hipertensi",
      "Gagal jantung kongestif",
      "Pasca serangan jantung",
      "Nefropati diabetik",
    ],
  },
};

/**
 * Product data for PharmaHub application
 */

export const products = [
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
    precaution: [
      "Jangan melebihi dosis yang dianjurkan (maksimal 4 gram per hari untuk dewasa)",
      "Konsultasikan dengan dokter jika memiliki riwayat penyakit hati",
      "Hindari konsumsi alkohol selama pengobatan"
    ],
    sideEffects: [
      "Jarang terjadi efek samping jika digunakan sesuai dosis",
      "Reaksi alergi kulit (ruam, gatal) pada beberapa orang",
      "Gangguan hati jika dikonsumsi berlebihan"
    ],
    interactions: [
      "Warfarin: dapat meningkatkan risiko perdarahan",
      "Obat epilepsi: dapat mengurangi efektivitas paracetamol",
      "Alkohol: meningkatkan risiko kerusakan hati"
    ],
    indication: [
      "Demam pada anak dan dewasa",
      "Sakit kepala ringan hingga sedang",
      "Nyeri otot dan sendi ringan",
      "Sakit gigi"
    ]
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
    stock: 85,
    precaution: [
      "Konsumsi bersama makanan untuk mengurangi iritasi lambung",
      "Hindari jika memiliki riwayat tukak lambung",
      "Hati-hati pada penderita hipertensi dan penyakit jantung"
    ],
    sideEffects: [
      "Gangguan pencernaan (mual, nyeri perut)",
      "Pusing dan sakit kepala",
      "Ruam kulit pada beberapa kasus"
    ],
    interactions: [
      "Aspirin: meningkatkan risiko perdarahan",
      "ACE inhibitor: dapat mengurangi efek penurun tekanan darah",
      "Lithium: dapat meningkatkan kadar lithium dalam darah"
    ],
    indication: [
      "Nyeri dan peradangan pada arthritis",
      "Nyeri otot dan keseleo",
      "Sakit gigi dan nyeri pascaoperasi",
      "Demam"
    ]
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
    precaution: [
      "Konsumsi 1-2 jam setelah makan atau saat gejala muncul",
      "Hindari konsumsi bersamaan dengan obat lain (jarak minimal 2 jam)",
      "Konsultasikan dengan dokter jika gejala berlanjut lebih dari 2 minggu"
    ],
    sideEffects: [
      "Konstipasi atau diare ringan",
      "Mual pada beberapa kasus",
      "Perubahan warna feses menjadi kehitaman (normal)"
    ],
    interactions: [
      "Antibiotik: dapat mengurangi penyerapan antibiotik",
      "Digoxin: dapat mengurangi efektivitas digoxin",
      "Obat tiroid: dapat mengganggu penyerapan hormon tiroid"
    ],
    indication: [
      "Gastritis dan sakit maag",
      "Nyeri ulu hati (heartburn)",
      "Kembung dan begah",
      "Gangguan pencernaan akibat asam lambung"
    ]
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
    stock: 75,
    precaution: [
      "Jangan gunakan jika diare disertai demam tinggi atau darah",
      "Hentikan penggunaan jika gejala memburuk setelah 2 hari",
      "Perbanyak minum air untuk mencegah dehidrasi"
    ],
    sideEffects: [
      "Konstipasi jika digunakan berlebihan",
      "Pusing dan mengantuk",
      "Mual dan kembung ringan"
    ],
    interactions: [
      "Antibiotik: hindari penggunaan bersamaan tanpa konsultasi dokter",
      "Opioid: dapat meningkatkan efek sedasi",
      "Quinidine: dapat meningkatkan konsentrasi loperamide"
    ],
    indication: [
      "Diare akut non-spesifik",
      "Diare wisatawan",
      "Diare kronik (dengan pengawasan dokter)",
      "Mengurangi output ileostomi"
    ]
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
    precaution: [
      "Dapat menyebabkan kantuk pada beberapa orang",
      "Hindari mengemudi atau mengoperasikan mesin berat",
      "Kurangi dosis pada penderita gangguan ginjal"
    ],
    sideEffects: [
      "Kantuk ringan (lebih jarang daripada antihistamin generasi pertama)",
      "Mulut kering",
      "Sakit kepala ringan"
    ],
    interactions: [
      "Alkohol: dapat meningkatkan efek sedasi",
      "Teofilin: dapat mengurangi clearance cetirizine",
      "Ritonavir: dapat meningkatkan konsentrasi cetirizine"
    ],
    indication: [
      "Rhinitis alergi musiman dan tahunan",
      "Urtikaria kronik",
      "Dermatitis atopik",
      "Alergi makanan ringan"
    ]
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
    stock: 50,
    precaution: [
      "Kocok inhaler sebelum digunakan",
      "Bilas mulut setelah penggunaan",
      "Jangan melebihi dosis yang dianjurkan"
    ],
    sideEffects: [
      "Tremor ringan pada tangan",
      "Jantung berdebar",
      "Sakit kepala ringan"
    ],
    interactions: [
      "Beta-blocker: dapat mengurangi efektivitas salbutamol",
      "Diuretik: dapat meningkatkan risiko hipokalemia",
      "Antidepresan trisiklik: dapat meningkatkan efek kardiovaskular"
    ],
    indication: [
      "Asma bronkial",
      "Penyakit paru obstruktif kronik (PPOK)",
      "Bronkospasme akut",
      "Pencegahan asma akibat aktivitas"
    ]
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
    stock: 110,
    precaution: [
      "Hanya untuk penggunaan luar",
      "Hindari kontak dengan mata",
      "Jangan gunakan pada luka yang luas atau dalam"
    ],
    sideEffects: [
      "Iritasi kulit ringan pada penggunaan pertama",
      "Reaksi alergi pada orang sensitif terhadap iodine",
      "Perubahan warna kulit sementara"
    ],
    interactions: [
      "Hidrogen peroksida: dapat mengurangi efektivitas",
      "Obat topikal lain: hindari penggunaan bersamaan",
      "Silver sulfadiazine: dapat bereaksi dan mengurangi efektivitas"
    ],
    indication: [
      "Luka kecil dan goresan",
      "Antiseptik sebelum injeksi",
      "Pembersihan kulit sebelum operasi kecil",
      "Pencegahan infeksi pada luka minor"
    ]
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
    stock: 150,
    precaution: [
      "Larutkan dalam air matang dingin",
      "Habiskan dalam 24 jam setelah dilarutkan",
      "Konsultasikan dokter jika dehidrasi berat"
    ],
    sideEffects: [
      "Mual jika diminum terlalu cepat",
      "Muntah pada kasus dehidrasi berat",
      "Rasa tidak enak di mulut (normal)"
    ],
    interactions: [
      "Tidak ada interaksi obat yang signifikan",
      "Aman dikombinasikan dengan obat diare",
      "Dapat diberikan bersama antibiotik jika diperlukan"
    ],
    indication: [
      "Dehidrasi ringan hingga sedang",
      "Diare akut pada anak dan dewasa",
      "Muntah-muntah",
      "Kehilangan cairan akibat berkeringat berlebihan"
    ]
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
    precaution: [
      "Konsumsi setelah makan untuk mengurangi iritasi lambung",
      "Jangan melebihi dosis yang dianjurkan",
      "Konsultasikan dengan dokter jika sedang hamil atau menyusui"
    ],
    sideEffects: [
      "Gangguan pencernaan ringan pada dosis tinggi",
      "Diare jika dikonsumsi berlebihan",
      "Batu ginjal pada konsumsi jangka panjang dosis tinggi"
    ],
    interactions: [
      "Warfarin: dapat meningkatkan efek antikoagulan",
      "Aspirin: dapat mengurangi penyerapan vitamin C",
      "Suplemen zat besi: dapat meningkatkan penyerapan zat besi"
    ],
    indication: [
      "Defisiensi vitamin C",
      "Meningkatkan daya tahan tubuh",
      "Membantu penyembuhan luka",
      "Pencegahan sariawan"
    ]
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
    stock: 60,
    precaution: [
      "WAJIB dengan resep dokter",
      "Habiskan antibiotik sesuai durasi yang diresepkan",
      "Jangan gunakan jika alergi penisilin"
    ],
    sideEffects: [
      "Diare ringan",
      "Mual dan muntah",
      "Ruam kulit (reaksi alergi)"
    ],
    interactions: [
      "Probenecid: dapat meningkatkan kadar amoxicillin",
      "Warfarin: dapat meningkatkan efek antikoagulan",
      "Pil KB: dapat mengurangi efektivitas kontrasepsi"
    ],
    indication: [
      "Infeksi saluran pernapasan",
      "Infeksi kulit dan jaringan lunak",
      "Infeksi saluran kemih",
      "Otitis media"
    ]
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
    stock: 70,
    precaution: [
      "WAJIB dengan resep dokter",
      "Konsumsi 30 menit sebelum makan",
      "Hindari penggunaan jangka panjang tanpa pengawasan dokter"
    ],
    sideEffects: [
      "Sakit kepala",
      "Diare atau konstipasi",
      "Mual ringan"
    ],
    interactions: [
      "Warfarin: dapat meningkatkan risiko perdarahan",
      "Clopidogrel: dapat mengurangi efektivitas clopidogrel",
      "Ketoconazole: dapat mengurangi penyerapan ketoconazole"
    ],
    indication: [
      "Tukak lambung dan duodenum",
      "GERD (Gastroesophageal Reflux Disease)",
      "Sindrom Zollinger-Ellison",
      "Eradikasi H. pylori"
    ]
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
    stock: 80,
    precaution: [
      "Konsumsi bersama makanan berlemak untuk penyerapan optimal",
      "Pantau kadar vitamin D dalam darah secara berkala",
      "Hindari overdosis vitamin D"
    ],
    sideEffects: [
      "Mual jika overdosis",
      "Konstipasi pada dosis tinggi",
      "Hiperkalsemia jika dikonsumsi berlebihan"
    ],
    interactions: [
      "Thiazide diuretics: dapat meningkatkan risiko hiperkalsemia",
      "Digoxin: peningkatan kalsium dapat meningkatkan toksisitas digoxin",
      "Suplemen kalsium: dapat meningkatkan penyerapan kalsium"
    ],
    indication: [
      "Defisiensi vitamin D",
      "Osteoporosis dan osteomalacia",
      "Rakhitis pada anak",
      "Hipoparatiroidisme"
    ]
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
    stock: 100,
    precaution: [
      "Konsumsi setelah makan",
      "Jangan melebihi dosis yang dianjurkan",
      "Simpan di tempat sejuk dan kering"
    ],
    sideEffects: [
      "Mual jika dikonsumsi saat perut kosong",
      "Perubahan warna urin (normal)",
      "Gangguan pencernaan ringan"
    ],
    interactions: [
      "Antibiotik: dapat mengurangi penyerapan beberapa antibiotik",
      "Warfarin: vitamin K dapat mempengaruhi efek antikoagulan",
      "Levothyroxine: dapat mengurangi penyerapan hormon tiroid"
    ],
    indication: [
      "Defisiensi vitamin dan mineral",
      "Malnutrisi",
      "Periode pemulihan setelah sakit",
      "Kebutuhan nutrisi meningkat"
    ]
  },
  {
    id: 14,
    name: "Alcohol 70%",
    brand: "OneMed",
    price: 15000,
    image: "/images/allproducts/alcohol-70%.jpg",
    description: "Antiseptik untuk membersihkan tangan dan permukaan.",
    uses: "Membersihkan tangan, sterilisasi alat, dan desinfeksi permukaan.",
    genericName: "Alcohol",
    prescriptionRequired: false,
    category: "Antiseptik",
    stock: 130,
    precaution: [
      "Hanya untuk penggunaan luar",
      "Hindari kontak dengan mata",
      "Jauhkan dari api dan sumber panas"
    ],
    sideEffects: [
      "Kulit kering dengan penggunaan berlebihan",
      "Iritasi pada kulit sensitif",
      "Dermatitis kontak pada penggunaan berulang"
    ],
    interactions: [
      "Tidak ada interaksi obat yang signifikan",
      "Dapat merusak beberapa jenis plastik",
      "Dapat mengurangi efektivitas hand sanitizer berbasis alkohol lain"
    ],
    indication: [
      "Antiseptik tangan",
      "Sterilisasi alat medis",
      "Desinfeksi permukaan",
      "Pembersihan sebelum injeksi"
    ]
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
    stock: 65,
    precaution: [
      "WAJIB dengan resep dokter",
      "Monitor tekanan darah secara teratur",
      "Konsumsi 1 jam sebelum makan"
    ],
    sideEffects: [
      "Batuk kering",
      "Hipotensi (tekanan darah rendah)",
      "Peningkatan kadar kalium"
    ],
    interactions: [
      "Diuretik: dapat meningkatkan efek penurun tekanan darah",
      "Suplemen kalium: dapat menyebabkan hiperkalemia",
      "NSAIDs: dapat mengurangi efek antihipertensi"
    ],
    indication: [
      "Hipertensi (tekanan darah tinggi)",
      "Gagal jantung",
      "Nefropati diabetik",
      "Pasca infark miokard"
    ]
  }
];

// Product categories
export const categories = [
  "Semua Produk",
  "Obat Nyeri & Demam",
  "Obat Pencernaan",
  "Obat Alergi",
  "Obat Pernapasan",
  "Antiseptik",
  "Vitamin & Suplemen",
  "Antibiotik",
  "Obat Jantung & Hipertensi"
];

// Helper function to get product by ID
export const getProductById = (id) => {
  return products.find(product => product.id === parseInt(id));
};

// Helper function to filter products by category
export const getProductsByCategory = (category) => {
  if (category === "Semua Produk") return products;
  return products.filter(product => product.category === category);
};

// Helper function to search products
export const searchProducts = (query) => {
  const lowerQuery = query.toLowerCase();
  return products.filter(product => 
    product.name.toLowerCase().includes(lowerQuery) ||
    product.description.toLowerCase().includes(lowerQuery) ||
    product.brand.toLowerCase().includes(lowerQuery)
  );
};

/**
 * Product data for detail pages
 */

export const productData = {
    1: {
        name: "Paracetamol 500mg",
        brand: "Kimia Farma",
        price: 12000,
        description: "Paracetamol bekerja dengan cara menghambat produksi prostaglandin yang menyebabkan nyeri dan demam.",
        uses: ["Menurunkan demam", "Meredakan sakit kepala", "Mengurangi nyeri ringan"],
        generic: "Paracetamol",
        prescriptionRequired: false,
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
    2: {
        name: "Ibuprofen 400mg",
        brand: "Kalbe Farma",
        price: 15000,
        description: "Ibuprofen adalah obat antiinflamasi non-steroid (NSAID) yang bekerja menghambat enzim cyclooxygenase untuk mengurangi peradangan dan nyeri.",
        uses: ["Mengurangi peradangan", "Meredakan nyeri otot dan sendi", "Menurunkan demam"],
        generic: "Ibuprofen",
        prescriptionRequired: false,
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
    3: {
        name: "Promag",
        brand: "Kalbe Farma",
        price: 8000,
        description: "Promag adalah antasida yang bekerja menetralisir asam lambung berlebih dan membentuk lapisan pelindung pada dinding lambung.",
        uses: ["Meredakan sakit maag", "Mengatasi nyeri ulu hati", "Mengurangi kembung"],
        generic: "Antasida",
        prescriptionRequired: false,
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
    4: {
        name: "Loperamide (Imodium)",
        brand: "Johnson & Johnson",
        price: 20000,
        description: "Loperamide bekerja dengan memperlambat pergerakan usus sehingga mengurangi frekuensi buang air besar dan meningkatkan konsistensi feses.",
        uses: ["Mengatasi diare akut", "Mengurangi frekuensi BAB", "Mengontrol diare kronis"],
        generic: "Loperamide",
        prescriptionRequired: false,
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
    5: {
        name: "Cetirizine",
        brand: "Dexa Medica",
        price: 25000,
        description: "Cetirizine adalah antihistamin generasi kedua yang bekerja memblokir reseptor histamin H1 untuk mengurangi reaksi alergi.",
        uses: ["Meredakan rhinitis alergi", "Mengatasi urtikaria", "Mengurangi gatal akibat alergi"],
        generic: "Cetirizine",
        prescriptionRequired: false,
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
    6: {
        name: "Salbutamol Inhaler",
        brand: "Glaxo Smith Kline",
        price: 45000,
        description: "Salbutamol adalah bronkodilator beta-2 agonis yang bekerja merelaksasi otot polos saluran napas untuk mengatasi bronkospasme.",
        uses: ["Meredakan sesak napas", "Mengatasi serangan asma", "Terapi bronkospasme"],
        generic: "Salbutamol",
        prescriptionRequired: false,
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
    7: {
        name: "Betadine",
        brand: "Mahakam Beta Farma",
        price: 18000,
        description: "Betadine mengandung povidone iodine yang memiliki spektrum antimikroba luas untuk membunuh bakteri, virus, dan jamur.",
        uses: ["Antiseptik luka", "Pencegahan infeksi", "Pembersihan kulit"],
        generic: "Povidone Iodine",
        prescriptionRequired: false,
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
    8: {
        name: "Oralit",
        brand: "Pharos Indonesia",
        price: 5000,
        description: "Oralit adalah larutan rehidrasi oral yang mengandung elektrolit seimbang untuk mengganti cairan dan garam yang hilang akibat diare atau dehidrasi.",
        uses: ["Rehidrasi oral", "Mengganti elektrolit", "Pencegahan dehidrasi"],
        generic: "Oralit",
        prescriptionRequired: false,
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
    9: {
        name: "Vitamin C 500mg",
        brand: "Blackmores",
        price: 25000,
        description: "Vitamin C adalah antioksidan yang membantu meningkatkan sistem kekebalan tubuh dan melindungi sel dari kerusakan radikal bebas.",
        uses: ["Meningkatkan sistem imun", "Membantu penyembuhan luka", "Melindungi dari radikal bebas"],
        generic: "Vitamin C",
        prescriptionRequired: false,
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
    10: {
        name: "Amoxicillin 500mg",
        brand: "Sanbe Farma",
        price: 40000,
        description: "Amoxicillin adalah antibiotik beta-laktam yang bekerja menghambat sintesis dinding sel bakteri.",
        uses: ["Mengobati infeksi bakteri", "Infeksi saluran pernapasan", "Infeksi kulit dan jaringan lunak"],
        generic: "Amoxicillin",
        prescriptionRequired: true,
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
    11: {
        name: "Omeprazole 20mg",
        brand: "Dexa Medica",
        price: 35000,
        description: "Omeprazole adalah proton pump inhibitor yang mengurangi produksi asam lambung dengan menghambat pompa proton.",
        uses: ["Mengurangi asam lambung", "Mengobati tukak lambung", "Terapi GERD"],
        generic: "Omeprazole",
        prescriptionRequired: true,
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
    12: {
        name: "Vitamin D3 1000 IU",
        brand: "Nature Made",
        price: 45000,
        description: "Vitamin D3 membantu penyerapan kalsium dan fosfat untuk menjaga kesehatan tulang dan gigi.",
        uses: ["Mendukung kesehatan tulang", "Meningkatkan penyerapan kalsium", "Mendukung sistem imun"],
        generic: "Vitamin D3",
        prescriptionRequired: false,
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
    13: {
        name: "Multivitamin Complete",
        brand: "Centrum",
        price: 55000,
        description: "Kombinasi lengkap vitamin dan mineral essensial untuk memenuhi kebutuhan nutrisi harian tubuh.",
        uses: ["Memenuhi kebutuhan vitamin harian", "Mendukung energi", "Meningkatkan kesehatan secara keseluruhan"],
        generic: "Multivitamin",
        prescriptionRequired: false,
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
    14: {
        name: "Alcohol 70%",
        brand: "OneMed",
        price: 15000,
        description: "Alkohol 70% adalah antiseptik dengan konsentrasi optimal untuk membunuh bakteri, virus, dan jamur.",
        uses: ["Antiseptik tangan", "Sterilisasi alat", "Desinfeksi permukaan"],
        generic: "Alcohol",
        prescriptionRequired: false,
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
    15: {
        name: "Captopril 25mg",
        brand: "Indofarma",
        price: 30000,
        description: "Captopril adalah ACE inhibitor yang bekerja menghambat konversi angiotensin I menjadi angiotensin II untuk menurunkan tekanan darah.",
        uses: ["Menurunkan tekanan darah", "Mencegah komplikasi jantung", "Terapi gagal jantung"],
        generic: "Captopril",
        prescriptionRequired: true,
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
    },
};
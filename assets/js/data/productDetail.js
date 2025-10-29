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
};
/**
 * Centralized product data for PharmaHub
 * This file contains all product information used across the application
 */

// Complete product data as object for easy lookup by ID
export const productsById = {
    '1': {
        id: '1',
        name: 'Paracetamol 500mg',
        brand: 'Sanbe Farma',
        price: 12000,
        description: 'Untuk menurunkan demam dan meredakan sakit kepala atau nyeri ringan.',
        uses: 'Menurunkan demam, meredakan nyeri ringan hingga sedang seperti sakit kepala, sakit gigi, nyeri otot.',
        genericName: 'Paracetamol',
        category: 'obat-bebas',
        prescriptionRequired: false
    },
    '2': {
        id: '2',
        name: 'Ibuprofen 400mg',
        brand: 'Kimia Farma',
        price: 15000,
        description: 'Obat antiinflamasi non-steroid untuk nyeri otot, sendi, atau sakit gigi.',
        uses: 'Mengurangi peradangan, menurunkan demam, meredakan nyeri otot dan sendi.',
        genericName: 'Ibuprofen',
        category: 'obat-bebas',
        prescriptionRequired: false
    },
    '3': {
        id: '3',
        name: 'Promag',
        brand: 'Kalbe Farma',
        price: 8000,
        description: 'Meredakan sakit maag, nyeri ulu hati, dan gangguan asam lambung.',
        uses: 'Meredakan sakit maag, nyeri ulu hati, kembung, dan mual akibat asam lambung berlebih.',
        genericName: 'Antasida',
        category: 'obat-bebas',
        prescriptionRequired: false
    },
    '4': {
        id: '4',
        name: 'Loperamide (Imodium)',
        brand: 'Johnson & Johnson',
        price: 20000,
        description: 'Untuk mengatasi diare akut.',
        uses: 'Mengatasi diare akut dengan mengurangi pergerakan usus dan meningkatkan penyerapan air.',
        genericName: 'Loperamide',
        category: 'obat-bebas',
        prescriptionRequired: false
    },
    '5': {
        id: '5',
        name: 'Cetirizine',
        brand: 'Dexa Medica',
        price: 25000,
        description: 'Antihistamin untuk alergi, bersin, atau gatal-gatal.',
        uses: 'Meredakan gejala alergi seperti bersin, hidung tersumbat, mata berair, dan gatal-gatal.',
        genericName: 'Cetirizine',
        category: 'obat-bebas',
        prescriptionRequired: false
    },
    '6': {
        id: '6',
        name: 'Salbutamol Inhaler',
        brand: 'Glaxo Smith Kline',
        price: 45000,
        description: 'Membantu meredakan sesak napas akibat asma atau bronkitis.',
        uses: 'Meredakan sesak napas, bronkospasme, dan gejala asma akut.',
        genericName: 'Salbutamol',
        category: 'obat-keras',
        prescriptionRequired: false
    },
    '7': {
        id: '7',
        name: 'Betadine',
        brand: 'Mahakam Beta Farma',
        price: 18000,
        description: 'Antiseptik luar untuk membersihkan luka ringan atau goresan.',
        uses: 'Antiseptik untuk luka kecil, goresan, dan pencegahan infeksi pada luka luar.',
        genericName: 'Povidone Iodine',
        category: 'antiseptik',
        prescriptionRequired: false
    },
    '8': {
        id: '8',
        name: 'Oralit',
        brand: 'Pharos Indonesia',
        price: 5000,
        description: 'Larutan rehidrasi untuk mencegah dehidrasi akibat diare atau muntah.',
        uses: 'Mengganti cairan dan elektrolit yang hilang akibat diare, muntah, atau berkeringat berlebihan.',
        genericName: 'Oralit',
        category: 'obat-bebas',
        prescriptionRequired: false
    },
    '9': {
        id: '9',
        name: 'Vitamin C 500mg',
        brand: 'Blackmores',
        price: 25000,
        description: 'Meningkatkan daya tahan tubuh dan membantu penyembuhan.',
        uses: 'Meningkatkan sistem imun, membantu penyembuhan luka, dan melindungi dari radikal bebas.',
        genericName: 'Vitamin C',
        category: 'suplemen',
        prescriptionRequired: false
    },
    '10': {
        id: '10',
        name: 'Amoxicillin 500mg',
        brand: 'Sanbe Farma',
        price: 40000,
        description: 'Untuk infeksi bakteri ringan, seperti infeksi tenggorokan atau kulit.',
        uses: 'Mengobati infeksi bakteri pada saluran pernapasan, kulit, dan saluran kemih.',
        genericName: 'Amoxicillin',
        category: 'obat-keras',
        prescriptionRequired: true
    },
    '11': {
        id: '11',
        name: 'Omeprazole 20mg',
        brand: 'Dexa Medica',
        price: 35000,
        description: 'Untuk mengatasi asam lambung berlebih dan maag kronis.',
        uses: 'Mengurangi produksi asam lambung, mengobati tukak lambung dan GERD.',
        genericName: 'Omeprazole',
        category: 'obat-keras',
        prescriptionRequired: true
    },
    '12': {
        id: '12',
        name: 'Vitamin D3 1000 IU',
        brand: 'Nature Made',
        price: 45000,
        description: 'Membantu penyerapan kalsium dan kesehatan tulang.',
        uses: 'Mendukung kesehatan tulang, gigi, dan sistem imun.',
        genericName: 'Vitamin D3',
        category: 'suplemen',
        prescriptionRequired: false
    },
    '13': {
        id: '13',
        name: 'Multivitamin Complete',
        brand: 'Centrum',
        price: 55000,
        description: 'Kombinasi lengkap vitamin dan mineral untuk kesehatan optimal.',
        uses: 'Memenuhi kebutuhan vitamin dan mineral harian untuk menjaga kesehatan tubuh.',
        genericName: 'Multivitamin',
        category: 'suplemen',
        prescriptionRequired: false
    },
    '14': {
        id: '14',
        name: 'Alcohol 70%',
        brand: 'OneMed',
        price: 15000,
        description: 'Antiseptik untuk membersihkan tangan dan permukaan.',
        uses: 'Membersihkan tangan, sterilisasi alat, dan desinfeksi permukaan.',
        genericName: 'Alcohol',
        category: 'antiseptik',
        prescriptionRequired: false
    },
    '15': {
        id: '15',
        name: 'Captopril 25mg',
        brand: 'Indofarma',
        price: 30000,
        description: 'Obat untuk menurunkan tekanan darah tinggi.',
        uses: 'Mengontrol tekanan darah tinggi dan mencegah komplikasi jantung.',
        genericName: 'Captopril',
        category: 'obat-keras',
        prescriptionRequired: true
    },
};

// Product data as array for listings and iterations
export const products = Object.values(productsById);

// Helper function to get product by ID
export function getProductById(productId) {
    return productsById[productId] || null;
}

// Helper function to get all products as array
export function getAllProducts() {
    return products;
}

// Helper function to get products by category
export function getProductsByCategory(category) {
    return products.filter(product => product.category === category);
}

// Helper function to search products
export function searchProducts(query) {
    const searchTerm = query.toLowerCase();
    return products.filter(product =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm) ||
        product.genericName.toLowerCase().includes(searchTerm)
    );
}
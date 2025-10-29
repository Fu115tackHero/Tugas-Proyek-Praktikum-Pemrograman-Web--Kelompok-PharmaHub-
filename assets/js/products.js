/**
 * PharmaHub Product Page JavaScript
 * File ini berisi logika khusus untuk halaman produk dan filtering
 */

// ==========================================
// PRODUCT DATA
// ==========================================

const allProducts = [
    {
        id: '1',
        name: 'Paracetamol 500mg',
        price: 12000,
        category: 'obat-bebas',
        brand: 'Sanbe Farma',
        description: 'Untuk menurunkan demam dan meredakan sakit kepala atau nyeri ringan.',
        prescriptionRequired: false
    },
    {
        id: '2',
        name: 'Ibuprofen 400mg',
        price: 15000,
        category: 'obat-bebas',
        brand: 'Kimia Farma',
        description: 'Obat antiinflamasi non-steroid untuk nyeri otot, sendi, atau sakit gigi.',
        prescriptionRequired: false
    },
    {
        id: '3',
        name: 'Promag',
        price: 8000,
        category: 'obat-bebas',
        brand: 'Kalbe Farma',
        description: 'Meredakan sakit maag, nyeri ulu hati, dan gangguan asam lambung.',
        prescriptionRequired: false
    },
    {
        id: '4',
        name: 'Loperamide (Imodium)',
        price: 20000,
        category: 'obat-keras',
        brand: 'Johnson & Johnson',
        description: 'Untuk mengatasi diare akut.',
        prescriptionRequired: true
    },
    {
        id: '5',
        name: 'Cetirizine 10mg',
        price: 25000,
        category: 'obat-keras',
        brand: 'Dexa Medica',
        description: 'Antihistamin untuk alergi, bersin, atau gatal-gatal.',
        prescriptionRequired: true
    },
    {
        id: '6',
        name: 'Salbutamol Inhaler',
        price: 45000,
        category: 'obat-keras',
        brand: 'GlaxoSmithKline',
        description: 'Membantu meredakan sesak napas akibat asma atau bronkitis.',
        prescriptionRequired: true
    },
    {
        id: '7',
        name: 'Povidone Iodine',
        price: 18000,
        category: 'obat-bebas',
        brand: 'Mahakam Beta Farma',
        description: 'Antiseptik untuk membersihkan luka dan mencegah infeksi.',
        prescriptionRequired: false
    },
    {
        id: '8',
        name: 'Oralit',
        price: 5000,
        category: 'obat-bebas',
        brand: 'Pharos',
        description: 'Larutan rehidrasi untuk mencegah dehidrasi akibat diare atau muntab.',
        prescriptionRequired: false
    },
    {
        id: '9',
        name: 'Vitamin C 500mg',
        price: 30000,
        category: 'vitamin',
        brand: 'Blackmores',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        prescriptionRequired: false
    },
    {
        id: '10',
        name: 'Amoxicillin 500mg',
        price: 35000,
        category: 'obat-keras',
        brand: 'Kimia Farma',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        prescriptionRequired: true
    },
    {
        id: '11',
        name: 'Omeprazole 20mg',
        price: 40000,
        category: 'obat-keras',
        brand: 'Dexa Medica',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        prescriptionRequired: true
    },
    {
        id: '12',
        name: 'Vitamin D3 1000 IU',
        price: 45000,
        category: 'vitamin',
        brand: 'Nature\'s Plus',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        prescriptionRequired: false
    },
    {
        id: '13',
        name: 'Multivitamin Complete',
        price: 50000,
        category: 'vitamin',
        brand: 'Centrum',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        prescriptionRequired: false
    },
    {
        id: '14',
        name: 'Alcohol 70%',
        price: 15000,
        category: 'alat-kesehatan',
        brand: 'OneMed',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        prescriptionRequired: false
    },
    {
        id: '15',
        name: 'Captopril 25mg',
        price: 25000,
        category: 'obat-keras',
        brand: 'Indofarma',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        prescriptionRequired: true
    }
];

// ==========================================
// FILTER & SEARCH FUNCTIONS
// ==========================================

let filteredProducts = [...allProducts];
let currentCategory = 'all';
let currentSort = 'name';
let currentSearch = '';

/**
 * Filter products by category
 * @param {string} category - Category to filter by
 */
function filterByCategory(category) {
    currentCategory = category;
    applyFilters();
    
    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('bg-blue-600', 'text-white');
        btn.classList.add('bg-gray-200', 'text-gray-700');
    });
    
    const activeBtn = document.querySelector(`[onclick="filterByCategory('${category}')"]`);
    if (activeBtn) {
        activeBtn.classList.remove('bg-gray-200', 'text-gray-700');
        activeBtn.classList.add('bg-blue-600', 'text-white');
    }
}
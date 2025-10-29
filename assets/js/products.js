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

/**
 * Sort products
 * @param {string} sortBy - Sort criteria (name, price-low, price-high)
 */
function sortProducts(sortBy) {
    currentSort = sortBy;
    applyFilters();
}

/**
 * Search products
 * @param {string} searchTerm - Search term
 */
function searchProducts(searchTerm) {
    currentSearch = searchTerm.toLowerCase();
    applyFilters();
}

/**
 * Apply all filters and sorting
 */
function applyFilters() {
    // Start with all products
    filteredProducts = [...allProducts];
    
    // Apply category filter
    if (currentCategory !== 'all') {
        filteredProducts = filteredProducts.filter(product => 
            product.category === currentCategory
        );
    }
    
    // Apply search filter
    if (currentSearch) {
        filteredProducts = filteredProducts.filter(product =>
            product.name.toLowerCase().includes(currentSearch) ||
            product.description.toLowerCase().includes(currentSearch) ||
            product.brand.toLowerCase().includes(currentSearch)
        );
    }
    
    // Apply sorting
    switch (currentSort) {
        case 'price-low':
            filteredProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            filteredProducts.sort((a, b) => b.price - a.price);
            break;
        case 'name':
        default:
            filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
            break;
    }
    
    renderProducts();
    updateProductCount();
}

/**
 * Render filtered products
 */
function renderProducts() {
    const container = document.getElementById('products-container');
    if (!container) return;
    
    if (filteredProducts.length === 0) {
        container.innerHTML = `
            <div class="col-span-full text-center py-12">
                <i class="fas fa-search text-6xl text-gray-300 mb-4"></i>
                <h3 class="text-xl font-semibold text-gray-600 mb-2">Produk tidak ditemukan</h3>
                <p class="text-gray-500">Coba ubah filter atau kata kunci pencarian</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = filteredProducts.map(product => `
        <div class="bg-white rounded-xl shadow hover:shadow-lg transition p-5 text-center flex flex-col">
            <img
              src="https://cdn-icons-png.flaticon.com/512/2966/2966388.png"
              alt="${product.name}"
              class="w-20 mx-auto mb-4"
            />
            <h3 class="font-semibold text-gray-800">${product.name}</h3>
            <p class="text-gray-600 text-sm mt-1">${product.description}</p>
            ${product.prescriptionRequired ? 
              '<div class="mt-2 mb-2"><span class="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded">Perlu Resep Dokter</span></div>' : 
              ''
            }
            <div class="mt-auto">
              <p class="text-blue-600 font-bold mt-4">Rp ${product.price.toLocaleString()}</p>
              <a
                href="detail-produk.html?id=${product.id}"
                class="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition w-full flex items-center justify-center"
              >
                <i class="fas fa-shopping-cart"></i>
              </a>
            </div>
          </div>
    `).join('');
}

/**
 * Update product count display
 */
function updateProductCount() {
    const countElement = document.getElementById('product-count');
    if (countElement) {
        countElement.textContent = `${filteredProducts.length} produk ditemukan`;
    }
}

// ==========================================
// EVENT LISTENERS SETUP
// ==========================================

/**
 * Setup search functionality
 */
function setupSearch() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchProducts(e.target.value);
        });
    }
}

/**
 * Setup sort functionality
 */
function setupSort() {
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            sortProducts(e.target.value);
        });
    }
}

// ==========================================
// INITIALIZATION
// ==========================================

/**
 * Initialize product page
 */
function initProductPage() {
    renderProducts();
    updateProductCount();
    setupSearch();
    setupSort();
    
    // Set initial active filter
    filterByCategory('all');
}

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize if we're on the product page
    if (document.getElementById('products-container')) {
        initProductPage();
    }
});

// ==========================================
// EXPORT FUNCTIONS
// ==========================================

// Make functions available globally
window.ProductPage = {
    filterByCategory,
    sortProducts,
    searchProducts,
    allProducts,
    filteredProducts
};
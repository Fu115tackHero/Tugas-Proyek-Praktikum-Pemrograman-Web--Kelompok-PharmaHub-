// ==========================================
// GLOBAL VARIABLES & CONSTANTS
// ==========================================

let cart = JSON.parse(localStorage.getItem("pharmahub-cart")) || [];
const TAX_RATE = 0.1; // 10% tax
let currentDiscount = 0;
let currentDiscountPercent = 0;

// Coupon codes configuration
const coupons = {
    'SEHAT10': { discount: 10, minAmount: 50000 },
    'OBAT20': { discount: 20, minAmount: 100000 },
    'PHARMAHUB15': { discount: 15, minAmount: 75000 }
};

// Product data for detail pages
const products = {
    '1': {
        id: '1',
        name: 'Paracetamol 500mg',
        brand: 'Sanbe Farma',
        price: 12000,
        description: 'Untuk menurunkan demam dan meredakan sakit kepala atau nyeri ringan.',
        uses: 'Menurunkan demam, meredakan nyeri ringan hingga sedang seperti sakit kepala, sakit gigi, nyeri otot.',
        genericName: 'Paracetamol',
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
        prescriptionRequired: false
    },
};

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
function formatCurrency(amount) {
    return 'Rp ' + amount.toLocaleString('id-ID');
}

/**
 * Show toast notification
 * @param {string} message - Message to display
 * @param {string} type - Type of notification (success, error, info)
 */
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    
    if (!toast || !toastMessage) return;
    
    toast.className = `fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300 ${
        type === 'success' ? 'bg-green-600' : type === 'error' ? 'bg-red-600' : 'bg-blue-600'
    } text-white`;
    
    toastMessage.textContent = message;
    toast.classList.remove('translate-y-full', 'opacity-0');
    
    setTimeout(() => {
        toast.classList.add('translate-y-full', 'opacity-0');
    }, 3000);
}

/**
 * Get product data by ID
 * @param {string} productId - Product ID
 * @returns {object|null} Product data or null if not found
 */
function getProductById(productId) {
    return products[productId] || null;
}

// ==========================================
// CART MANAGEMENT FUNCTIONS
// ==========================================

/**
 * Add item to cart
 * @param {string} productId - Product ID
 * @param {number} quantity - Quantity to add
 */
function addToCart(productId, quantity = 1) {
    const product = getProductById(productId);
    if (!product) {
        showToast('Produk tidak ditemukan', 'error');
        return;
    }

    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: productId,
            name: product.name,
            price: product.price,
            quantity: quantity
        });
    }
    
    localStorage.setItem("pharmahub-cart", JSON.stringify(cart));
    updateCartItemCount();
    showToast(`${product.name} ditambahkan ke keranjang`);
}

/**
 * Update quantity of item in cart
 * @param {string} id - Product ID
 * @param {number} change - Change in quantity (+1, -1)
 */
function updateQuantity(id, change) {
    const item = cart.find(item => item.id === id);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeItem(id);
        } else {
            localStorage.setItem("pharmahub-cart", JSON.stringify(cart));
            renderCart();
            updateSummary();
        }
    }
}

/**
 * Remove item from cart
 * @param {string} id - Product ID
 */
function removeItem(id) {
    cart = cart.filter(item => item.id !== id);
    localStorage.setItem("pharmahub-cart", JSON.stringify(cart));
    renderCart();
    updateSummary();
    showToast('Item berhasil dihapus');
}

/**
 * Remove all items from cart
 */
function removeAllItems() {
    if (confirm('Apakah Anda yakin ingin menghapus semua item dari keranjang?')) {
        cart = [];
        localStorage.setItem("pharmahub-cart", JSON.stringify(cart));
        renderCart();
        updateSummary();
        showToast('Semua item berhasil dihapus');
    }
}

/**
 * Update cart item count in header
 */
function updateCartItemCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountElement = document.getElementById('cart-item-count');
    if (cartCountElement) {
        cartCountElement.textContent = totalItems;
    }
}
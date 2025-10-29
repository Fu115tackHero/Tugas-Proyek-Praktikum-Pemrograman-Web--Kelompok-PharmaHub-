// ==========================================
// IMPORTS
// ==========================================

// Import product data from centralized location
import { getProductById } from './data/products.js';

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
    
    // Reset toast classes
    toast.className = 'toast';
    
    // Add type-specific styling
    const typeClass = type === 'success' ? 'bg-green-600' : type === 'error' ? 'bg-red-600' : 'bg-blue-600';
    toast.classList.add('fixed', 'bottom-4', 'right-4', 'px-6', 'py-3', 'rounded-lg', 'shadow-lg', 'transform', 'transition-all', 'duration-300', typeClass, 'text-white');
    
    toastMessage.textContent = message;
    
    // Show toast
    toast.classList.add('show');
    
    // Hide toast after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
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

// ==========================================
// CART RENDERING FUNCTIONS
// ==========================================

/**
 * Render cart items in cart page
 */
function renderCart() {
    const cartItemsContainer = document.getElementById('cart-items');
    const emptyCartSection = document.getElementById('empty-cart');
    const removeAllSection = document.getElementById('remove-all-section');

    if (!cartItemsContainer) return;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '';
        if (emptyCartSection) emptyCartSection.classList.remove('hidden');
        if (removeAllSection) removeAllSection.classList.add('hidden');
        return;
    }

    if (emptyCartSection) emptyCartSection.classList.add('hidden');
    if (removeAllSection) removeAllSection.classList.remove('hidden');

    cartItemsContainer.innerHTML = cart.map(item => `
        <div class="cart-item p-4 hover:bg-gray-50">
            <div class="flex items-start space-x-4">
                <!-- Product Image -->
                <div class="flex-shrink-0">
                    <img src="https://cdn-icons-png.flaticon.com/512/2966/2966388.png" 
                         alt="${item.name}" 
                         class="w-16 h-16 object-contain bg-gray-100 rounded-lg p-2">
                </div>

                <!-- Product Details -->
                <div class="flex-1 min-w-0">
                    <h3 class="font-semibold text-gray-800 mb-1">${item.name}</h3>
                    <p class="text-sm text-gray-600 mb-2">Obat untuk kesehatan</p>
                    
                    <!-- Actions -->
                    <div class="flex items-center space-x-4 text-sm">
                        <button onclick="removeItem('${item.id}')" class="text-red-600 hover:text-red-700 font-medium">
                            Remove
                        </button>
                        <button onclick="saveForLater('${item.id}')" class="text-blue-600 hover:text-blue-700 font-medium">
                            Save for later
                        </button>
                    </div>
                </div>

                <!-- Price and Quantity -->
                <div class="text-right">
                    <div class="font-semibold text-gray-800 mb-2">${formatCurrency(item.price)}</div>
                    
                    <!-- Quantity Controls -->
                    <div class="flex items-center space-x-2 mb-2">
                        <span class="text-sm text-gray-600">Qty</span>
                        <div class="flex items-center border border-gray-300 rounded">
                            <button onclick="updateQuantity('${item.id}', -1)" 
                                    class="quantity-btn w-8 h-8 flex items-center justify-center hover:bg-gray-100">
                                <i class="fas fa-minus text-xs"></i>
                            </button>
                            <span class="w-12 text-center py-1 text-sm">${item.quantity}</span>
                            <button onclick="updateQuantity('${item.id}', 1)" 
                                    class="quantity-btn w-8 h-8 flex items-center justify-center hover:bg-gray-100">
                                <i class="fas fa-plus text-xs"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
    
    updateCartItemCount();
}

// ==========================================
// COUPON FUNCTIONS
// ==========================================

/**
 * Apply coupon to cart
 */
function applyCoupon() {
    const couponInput = document.getElementById('coupon-input');
    const couponCode = couponInput?.value.trim().toUpperCase();
    
    if (!couponCode) {
        showCouponMessage('Masukkan kode kupon', 'error');
        return;
    }

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const coupon = coupons[couponCode];

    if (!coupon) {
        showCouponMessage('Kode kupon tidak valid', 'error');
        return;
    }

    if (subtotal < coupon.minAmount) {
        showCouponMessage(`Minimal belanja ${formatCurrency(coupon.minAmount)} untuk menggunakan kupon ini`, 'error');
        return;
    }

    currentDiscountPercent = coupon.discount;
    currentDiscount = Math.floor(subtotal * (coupon.discount / 100));
    
    showCouponMessage(`Kupon berhasil diterapkan! Diskon ${coupon.discount}%`, 'success');
    if (couponInput) couponInput.value = '';
    updateSummary();
    showToast(`Kupon ${couponCode} berhasil diterapkan!`);
}

/**
 * Show coupon message
 * @param {string} message - Message to display
 * @param {string} type - Type of message (success, error)
 */
function showCouponMessage(message, type) {
    const couponMessage = document.getElementById('coupon-message');
    if (!couponMessage) return;
    
    couponMessage.className = `mt-2 text-sm ${type === 'success' ? 'text-green-600' : 'text-red-600'}`;
    couponMessage.textContent = message;
    couponMessage.classList.remove('hidden');
    
    setTimeout(() => {
        couponMessage.classList.add('hidden');
    }, 5000);
}

// ==========================================
// ORDER SUMMARY FUNCTIONS
// ==========================================

/**
 * Update order summary
 */
function updateSummary() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discountAmount = Math.floor(subtotal * (currentDiscountPercent / 100));
    const taxableAmount = subtotal - discountAmount;
    const tax = Math.floor(taxableAmount * TAX_RATE);
    const total = taxableAmount + tax;

    // Update summary elements
    const elements = {
        subtotal: document.getElementById('subtotal'),
        discount: document.getElementById('discount'),
        tax: document.getElementById('tax'),
        total: document.getElementById('total')
    };

    if (elements.subtotal) elements.subtotal.textContent = formatCurrency(subtotal);
    if (elements.discount) elements.discount.textContent = discountAmount > 0 ? `-${formatCurrency(discountAmount)}` : formatCurrency(0);
    if (elements.tax) elements.tax.textContent = `+ ${formatCurrency(tax)}`;
    if (elements.total) elements.total.textContent = formatCurrency(total);

    // Enable/disable checkout button (now a link)
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        if (cart.length === 0) {
            checkoutBtn.classList.add('opacity-50', 'cursor-not-allowed', 'pointer-events-none');
            checkoutBtn.classList.remove('hover:bg-blue-900');
        } else {
            checkoutBtn.classList.remove('opacity-50', 'cursor-not-allowed', 'pointer-events-none');
            checkoutBtn.classList.add('hover:bg-blue-900');
        }
    }
    
    updateCartItemCount();
}

// ==========================================
// ADDITIONAL FEATURES
// ==========================================

/**
 * Save item for later (placeholder function)
 * @param {string} id - Product ID
 */
function saveForLater(id) {
    showToast('Fitur "Save for later" akan segera hadir!', 'info');
}

/**
 * Checkout function
 */
function checkout() {
    if (cart.length === 0) return;
    
    // Here you would typically redirect to payment page
    alert('Fitur checkout akan segera hadir! Terima kasih telah berbelanja di PharmaHub.');
}

// ==========================================
// MOBILE MENU FUNCTIONS
// ==========================================

/**
 * Initialize mobile menu toggle
 */
function initializeMobileMenu() {
    const btn = document.getElementById("menu-btn");
    const menu = document.getElementById("menu");
    
    if (btn && menu) {
        btn.addEventListener("click", () => {
            menu.classList.toggle("hidden");
        });
    }
}

// ==========================================
// PRODUCT DETAIL FUNCTIONS
// ==========================================

/**
 * Load product details on detail page
 */
function loadProductDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (!productId) return;
    
    const product = getProductById(productId);
    if (!product) return;
    
    // Update page elements with product data
    const elements = {
        name: document.getElementById('product-name'),
        brand: document.getElementById('product-brand'),
        price: document.getElementById('product-price'),
        description: document.getElementById('product-description')
    };
    
    if (elements.name) elements.name.textContent = product.name;
    if (elements.brand) elements.brand.textContent = product.brand;
    if (elements.price) elements.price.textContent = formatCurrency(product.price);
    if (elements.description) elements.description.textContent = product.description;
}

// ==========================================
// INITIALIZATION
// ==========================================

/**
 * Initialize application when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', function() {
    // Initialize mobile menu
    initializeMobileMenu();
    
    // Initialize cart if on cart page
    if (document.getElementById('cart-items')) {
        renderCart();
        updateSummary();
    }
    
    // Initialize product details if on product detail page
    if (document.getElementById('product-name')) {
        loadProductDetails();
    }
    
    // Update cart count on all pages
    updateCartItemCount();

    // Setup event listeners
    const applyCouponBtn = document.getElementById('apply-coupon-btn');
    if (applyCouponBtn) {
        applyCouponBtn.addEventListener('click', applyCoupon);
    }
    
    const couponInput = document.getElementById('coupon-input');
    if (couponInput) {
        couponInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                applyCoupon();
            }
        });
    }
    
    const removeAllBtn = document.getElementById('remove-all-btn');
    if (removeAllBtn) {
        removeAllBtn.addEventListener('click', removeAllItems);
    }
    
});

// ==========================================
// EXPORT FUNCTIONS (for use in other scripts)
// ==========================================

// Make functions available globally
window.PharmaHub = {
    addToCart,
    updateQuantity,
    removeItem,
    removeAllItems,
    applyCoupon,
    checkout,
    saveForLater,
    formatCurrency,
    showToast
};
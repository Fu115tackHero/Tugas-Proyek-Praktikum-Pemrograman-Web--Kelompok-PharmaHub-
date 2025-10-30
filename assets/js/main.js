// ==========================================
// IMPORTS & CONSTANTS
// ==========================================

import { productsDetailed } from './data/productData.js';

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
    return productsDetailed[productId] || null;
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
            quantity: quantity,
            savedForLater: false
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
    // Only count items that are not saved for later
    const activeItems = cart.filter(item => !item.savedForLater);
    const totalItems = activeItems.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
        if (totalItems > 0) {
            cartCountElement.textContent = totalItems;
            cartCountElement.classList.remove('hidden');
        } else {
            cartCountElement.classList.add('hidden');
        }
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

    cartItemsContainer.innerHTML = cart.map(item => {
        const isDisabled = item.savedForLater;
        const savedBadge = isDisabled ? '<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 ml-2 opacity-50"><i class="fas fa-bookmark mr-1"></i>Saved for later</span>' : '';
        const actionButtonText = isDisabled ? 'Unsave' : 'Save for later';
        const actionButtonIcon = isDisabled ? 'fas fa-undo' : 'fas fa-bookmark';
        
        return `
        <div class="cart-item p-4 hover:bg-gray-50 ${isDisabled ? 'bg-gray-50' : ''}">
            <div class="flex items-start space-x-4">
                <!-- Product Image -->
                <div class="flex-shrink-0">
                    <img src="https://cdn-icons-png.flaticon.com/512/2966/2966388.png" 
                         alt="${item.name}" 
                         class="w-16 h-16 object-contain bg-gray-100 rounded-lg p-2 ${isDisabled ? 'grayscale opacity-50' : ''}">
                </div>

                <!-- Product Details -->
                <div class="flex-1 min-w-0">
                    <div class="flex items-center mb-1">
                        <h3 class="font-semibold text-gray-800 ${isDisabled ? 'text-gray-500 opacity-50' : ''}">${item.name}</h3>
                        ${savedBadge}
                    </div>
                    <p class="text-sm text-gray-600 mb-2 ${isDisabled ? 'opacity-50' : ''}">Obat untuk kesehatan</p>
                    
                    <!-- Actions -->
                    <div class="flex items-center space-x-4 text-sm">
                        <button onclick="removeItem('${item.id}')" class="text-red-600 hover:text-red-700 font-medium">
                            <i class="fas fa-trash mr-1"></i>Remove
                        </button>
                        <button onclick="saveForLater('${item.id}')" class="text-blue-600 hover:text-blue-700 font-medium">
                            <i class="${actionButtonIcon} mr-1"></i>${actionButtonText}
                        </button>
                    </div>
                </div>

                <!-- Price and Quantity -->
                <div class="text-right">
                    <div class="font-semibold text-gray-800 mb-2 ${isDisabled ? 'text-gray-500 opacity-50' : ''}">${formatCurrency(item.price)}</div>
                    
                    <!-- Quantity Controls -->
                    <div class="flex items-center space-x-2 mb-2">
                        <span class="text-sm text-gray-600 ${isDisabled ? 'opacity-50' : ''}">Qty</span>
                        <div class="flex items-center border border-gray-300 rounded ${isDisabled ? 'opacity-50 pointer-events-none' : ''}">
                            <button onclick="updateQuantity('${item.id}', -1)" 
                                    class="quantity-btn w-8 h-8 flex items-center justify-center hover:bg-gray-100"
                                    ${isDisabled ? 'disabled' : ''}>
                                <i class="fas fa-minus text-xs"></i>
                            </button>
                            <span class="w-12 text-center py-1 text-sm">${item.quantity}</span>
                            <button onclick="updateQuantity('${item.id}', 1)" 
                                    class="quantity-btn w-8 h-8 flex items-center justify-center hover:bg-gray-100"
                                    ${isDisabled ? 'disabled' : ''}>
                                <i class="fas fa-plus text-xs"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `;
    }).join('');
    
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

    const activeItems = cart.filter(item => !item.savedForLater);
    const subtotal = activeItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
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
    // Only calculate items that are not saved for later
    const activeItems = cart.filter(item => !item.savedForLater);
    const subtotal = activeItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
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
        // Disable checkout if no active items (items not saved for later)
        if (activeItems.length === 0) {
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
    const item = cart.find(item => item.id === id);
    if (item) {
        // Toggle saved for later status
        item.savedForLater = !item.savedForLater;
        
        // Save to localStorage
        localStorage.setItem("pharmahub-cart", JSON.stringify(cart));
        
        // Re-render cart and update summary
        renderCart();
        updateSummary();
        
        // Show appropriate toast message
        const action = item.savedForLater ? 'disimpan untuk nanti' : 'dikembalikan ke keranjang';
        showToast(`${item.name} ${action}`);
    }
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
// PROFILE NAVIGATION FUNCTIONS
// ==========================================

// Initialize profile display
function initializeProfile() {
    const currentUser = getCurrentUser();
    updateProfileDisplay(currentUser);
    
    // Only setup profile dropdown if user is logged in
    if (currentUser) {
        setupProfileDropdown();
    }
}

function setupProfileDropdown() {
    const profileBtn = document.getElementById('profileBtn');
    const profileDropdown = document.getElementById('profileDropdown');
    
    if (profileBtn && profileDropdown) {
        let hoverTimeout;
        
        // Show dropdown on hover
        profileBtn.addEventListener('mouseenter', function() {
            clearTimeout(hoverTimeout);
            profileDropdown.classList.remove('hidden');
            profileDropdown.classList.add('show');
        });
        
        // Hide dropdown when mouse leaves (with delay)
        profileBtn.addEventListener('mouseleave', function() {
            hoverTimeout = setTimeout(() => {
                profileDropdown.classList.add('hidden');
                profileDropdown.classList.remove('show');
            }, 300); // 300ms delay before hiding
        });
        
        // Keep dropdown open when hovering over it
        profileDropdown.addEventListener('mouseenter', function() {
            clearTimeout(hoverTimeout);
            profileDropdown.classList.remove('hidden');
            profileDropdown.classList.add('show');
        });
        
        // Hide dropdown when mouse leaves dropdown
        profileDropdown.addEventListener('mouseleave', function() {
            hoverTimeout = setTimeout(() => {
                profileDropdown.classList.add('hidden');
                profileDropdown.classList.remove('show');
            }, 300);
        });
        
        // Toggle dropdown on click (fallback for mobile)
        profileBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            profileDropdown.classList.toggle('hidden');
            profileDropdown.classList.toggle('show');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function() {
            profileDropdown.classList.add('hidden');
            profileDropdown.classList.remove('show');
        });
        
        // Prevent dropdown from closing when clicking inside it
        profileDropdown.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }
}

function updateProfileDisplay(user) {
    const loginButtonContainer = document.getElementById('loginButtonContainer');
    const profileContainer = document.getElementById('profileContainer');
    const mobileLoginContainer = document.getElementById('mobileLoginContainer');
    const mobileProfileContainer = document.getElementById('mobileProfileContainer');
    const navProfileImage = document.getElementById('navProfileImage');
    const navUserName = document.getElementById('navUserName');
    const navUserEmail = document.getElementById('navUserEmail');
    
    if (user) {
        // User is logged in - show profile circle, hide login button
        if (loginButtonContainer) loginButtonContainer.classList.add('hidden');
        if (profileContainer) profileContainer.classList.remove('hidden');
        if (mobileLoginContainer) mobileLoginContainer.classList.add('hidden');
        if (mobileProfileContainer) mobileProfileContainer.classList.remove('hidden');
        
        if (navUserName) navUserName.textContent = user.name || 'User';
        if (navUserEmail) navUserEmail.textContent = user.email || 'user@email.com';
        
        // Update profile image
        if (navProfileImage) {
            const profileData = JSON.parse(localStorage.getItem('userProfile')) || {};
            if (profileData.profileImage) {
                navProfileImage.src = profileData.profileImage;
            } else {
                const userName = user.name || 'User';
                navProfileImage.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=3b82f6&color=fff&size=40&rounded=true`;
            }
        }
    } else {
        // User is not logged in - show login button, hide profile circle
        if (loginButtonContainer) loginButtonContainer.classList.remove('hidden');
        if (profileContainer) profileContainer.classList.add('hidden');
        if (mobileLoginContainer) mobileLoginContainer.classList.remove('hidden');
        if (mobileProfileContainer) mobileProfileContainer.classList.add('hidden');
    }
}

function getCurrentUser() {
    const userSession = localStorage.getItem('pharmaHubUser');
    if (!userSession) return null;
    
    try {
        const user = JSON.parse(userSession);
        
        // Check if session is still valid (24 hours)
        const loginTime = new Date(user.loginTime);
        const now = new Date();
        const hoursDiff = (now - loginTime) / (1000 * 60 * 60);
        
        if (hoursDiff > 24) {
            localStorage.removeItem('pharmaHubUser');
            return null;
        }
        
        return user;
    } catch (error) {
        localStorage.removeItem('pharmaHubUser');
        return null;
    }
}

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
    showToast,
    initializeProfile,
    updateProfileDisplay,
    getCurrentUser,
    updateCartItemCount
};

// Make critical functions available globally for onclick handlers
window.removeItem = removeItem;
window.updateQuantity = updateQuantity;
window.saveForLater = saveForLater;

// Profile navigation functions
window.goToProfile = function() {
    window.location.href = 'profile.html';
};

window.handleNavLogout = function() {
    if (confirm('Apakah Anda yakin ingin logout?')) {
        // Remove user data from localStorage
        localStorage.removeItem('pharmaHubUser');
        localStorage.removeItem('userProfile');
        
        // Clear any other session data
        localStorage.removeItem('pharmahub-remember-user');
        
        showToast('Logout berhasil!', 'success');
        
        // Redirect to index page after a short delay
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 800);
    }
};

// Initialize profile when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeProfile();
});
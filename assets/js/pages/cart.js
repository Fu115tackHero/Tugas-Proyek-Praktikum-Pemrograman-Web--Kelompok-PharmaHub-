/**
 * PharmaHub Cart Page JavaScript
 */
import { initializeMobileMenu, updateCartCount, showToast } from '../components/utils.js';

// Initialize cart from localStorage
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Render cart items
function renderCartItems() {
    const cartItemsContainer = document.getElementById('cart-items');
    const emptyCartMessage = document.getElementById('empty-cart');
    const removeAllSection = document.getElementById('remove-all-section');
    const cartItemCount = document.getElementById('cart-item-count');

    if (!cartItemsContainer) return;

    if (cart.length === 0) {
        emptyCartMessage.classList.remove('hidden');
        removeAllSection.classList.add('hidden');
        cartItemsContainer.innerHTML = '';
        cartItemCount.textContent = '0';
        updateTotals();
        return;
    }

    emptyCartMessage.classList.add('hidden');
    removeAllSection.classList.remove('hidden');
    cartItemCount.textContent = cart.length.toString();

    cartItemsContainer.innerHTML = cart.map((item, index) => `
        <div class="p-4 flex items-center justify-between" data-index="${index}">
            <div class="flex items-center space-x-4">
                <img
                    src="assets/images/allproducts/${item.name.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, '')}.jpg"
                    alt="${item.name}"
                    class="w-16 h-16 object-cover rounded-lg"
                />
                <div>
                    <h3 class="font-medium text-gray-800">${item.name}</h3>
                    <p class="text-sm text-gray-600">Obat untuk kesehatan</p>
                    <div class="flex items-center mt-2">
                        <button class="text-red-600 hover:text-red-700 text-sm font-medium remove-item">
                            <i class="fas fa-trash mr-1"></i> Remove
                        </button>
                        <button class="text-blue-600 hover:text-blue-700 text-sm font-medium ml-4 save-for-later">
                            <i class="far fa-bookmark mr-1"></i> Save for later
                        </button>
                    </div>
                </div>
            </div>
            <div class="flex items-center space-x-6">
                <div class="flex items-center space-x-2">
                    <button class="quantity-btn minus w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100">
                        <i class="fas fa-minus text-gray-600"></i>
                    </button>
                    <span class="quantity-value w-8 text-center">${item.quantity}</span>
                    <button class="quantity-btn plus w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100">
                        <i class="fas fa-plus text-gray-600"></i>
                    </button>
                </div>
                <div class="text-right">
                    <p class="font-medium text-gray-800">Rp ${(item.price * item.quantity).toLocaleString()}</p>
                    <p class="text-sm text-gray-500">Rp ${item.price.toLocaleString()}/pcs</p>
                </div>
            </div>
        </div>
    `).join('');

    updateTotals();
    attachEventListeners();
}

// Update totals
function updateTotals() {
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const discount = 0; // Implement discount logic here
    const tax = Math.round(subtotal * 0.1); // 10% tax
    const total = subtotal + tax - discount;

    document.getElementById('subtotal').textContent = `Rp ${subtotal.toLocaleString()}`;
    document.getElementById('discount').textContent = `-Rp ${discount.toLocaleString()}`;
    document.getElementById('tax').textContent = `+Rp ${tax.toLocaleString()}`;
    document.getElementById('total').textContent = `Rp ${total.toLocaleString()}`;
}

// Attach event listeners to buttons
function attachEventListeners() {
    // Quantity buttons
    document.querySelectorAll('.quantity-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const itemContainer = this.closest('[data-index]');
            const index = parseInt(itemContainer.dataset.index);
            const isPlus = this.classList.contains('plus');
            
            if (isPlus) {
                cart[index].quantity++;
            } else if (cart[index].quantity > 1) {
                cart[index].quantity--;
            }
            
            localStorage.setItem('cart', JSON.stringify(cart));
            renderCartItems();
            updateCartCount();
        });
    });

    // Remove item buttons
    document.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', function() {
            const itemContainer = this.closest('[data-index]');
            const index = parseInt(itemContainer.dataset.index);
            
            cart.splice(index, 1);
            localStorage.setItem('cart', JSON.stringify(cart));
            renderCartItems();
            updateCartCount();
            showToast('Item removed from cart');
        });
    });

    // Remove all button
    const removeAllBtn = document.getElementById('remove-all-btn');
    if (removeAllBtn) {
        removeAllBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to remove all items?')) {
                cart = [];
                localStorage.setItem('cart', JSON.stringify(cart));
                renderCartItems();
                updateCartCount();
                showToast('All items removed from cart');
            }
        });
    }
}

// Checkout button
document.getElementById('checkout-btn')?.addEventListener('click', function() {
    if (cart.length === 0) {
        alert('Your cart is empty');
        return;
    }
    window.location.href = 'checkout.html';
});

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    initializeMobileMenu();
    renderCartItems();
    updateCartCount();
});
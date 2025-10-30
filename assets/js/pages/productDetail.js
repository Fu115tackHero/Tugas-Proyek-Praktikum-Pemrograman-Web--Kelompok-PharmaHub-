/**
 * PharmaHub Product Details JavaScript
 * File ini berisi logika khusus untuk halaman detail produk
 */

import { productData } from '../data/productDetailData.js';
import { initializeMobileMenu, showToast, formatCurrency } from '../components/utils.js';

let quantity = 1;

// Load product data
function loadProductData(productId) {
    const product = productData[productId];
    if (!product) {
        alert('Produk tidak ditemukan');
        window.location.href = 'produk.html';
        return;
    }

    // Update breadcrumb
    document.getElementById('breadcrumb-product').textContent = product.name;

    // Update product info
    document.getElementById('product-name').textContent = product.name;
    document.getElementById('product-brand').textContent = `Brand: ${product.brand}`;
    document.getElementById('product-price').textContent = formatCurrency(product.price);
    document.getElementById('product-description').textContent = product.description;
    document.getElementById('product-generic').textContent = product.generic;

    // Update uses
    const usesList = document.getElementById('product-uses');
    usesList.innerHTML = product.uses.map(use => `<li>${use}</li>`).join('');

    // Show prescription badge if required
    if (product.prescriptionRequired) {
        document.getElementById('prescription-badge').classList.remove('hidden');
    }

    // Update tab contents
    document.getElementById('precaution-content').innerHTML = 
        product.precaution.map(item => `<p>• ${item}</p>`).join('');
    
    document.getElementById('side-effects-content').innerHTML = 
        product.sideEffects.map(item => `<p>• ${item}</p>`).join('');
    
    document.getElementById('interactions-content').innerHTML = 
        product.interactions.map(item => `<p>• ${item}</p>`).join('');
    
    document.getElementById('indication-content').innerHTML = 
        product.indication.map(item => `<p>• ${item}</p>`).join('');

    return product;
}

// Tab functionality
function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');

            // Remove active class from all tabs
            tabBtns.forEach(b => {
                b.classList.remove('active', 'text-blue-600', 'border-blue-600');
                b.classList.add('text-gray-600');
            });

            // Add active class to clicked tab
            btn.classList.add('active', 'text-blue-600', 'border-blue-600');
            btn.classList.remove('text-gray-600');

            // Hide all tab contents
            tabContents.forEach(content => content.classList.add('hidden'));

            // Show target tab content
            document.getElementById(targetTab).classList.remove('hidden');
        });
    });
}

// Quantity controls
function initQuantityControls() {
    document.getElementById('decrease-btn').addEventListener('click', () => {
        if (quantity > 1) {
            quantity--;
            document.getElementById('quantity-display').textContent = quantity;
        }
    });

    document.getElementById('increase-btn').addEventListener('click', () => {
        quantity++;
        document.getElementById('quantity-display').textContent = quantity;
    });
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    // Get product ID from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id') || '1';
    const product = loadProductData(productId);

    // Initialize mobile menu
    initializeMobileMenu();
    
    // Initialize tabs and quantity controls
    initTabs();
    initQuantityControls();

    // Update cart count using main.js function
    if (window.PharmaHub && window.PharmaHub.updateCartItemCount) {
        window.PharmaHub.updateCartItemCount();
    }

    // Add to cart button event listener
    document.getElementById('add-to-cart-btn').addEventListener('click', () => {
        // Read cart from localStorage and add item
        const cart = JSON.parse(localStorage.getItem('pharmahub-cart')) || [];
        const existing = cart.find(i => i.id === productId);

        if (existing) {
            existing.quantity += quantity;
        } else {
            cart.push({ id: productId, name: product.name, price: product.price, quantity });
        }

        localStorage.setItem('pharmahub-cart', JSON.stringify(cart));
        if (window.PharmaHub && window.PharmaHub.updateCartItemCount) {
            window.PharmaHub.updateCartItemCount();
        }
        showToast(`${product.name} berhasil ditambahkan ke keranjang!`);

        // Reset quantity to 1
        quantity = 1;
        document.getElementById('quantity-display').textContent = quantity;
    });
});
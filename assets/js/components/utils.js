/**
 * Utility functions used across different pages
 */

// Mobile menu toggle
export function initializeMobileMenu() {
    const btn = document.getElementById("menu-btn");
    const menu = document.getElementById("menu");
    if (btn && menu) {
        btn.addEventListener("click", () => {
            menu.classList.toggle("hidden");
        });
    }
}

// Update cart count display
export function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem("pharmahub-cart")) || [];
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    const cartCount = document.getElementById("cart-count");
    const cartCountMobile = document.getElementById("cart-count-mobile");

    if (totalItems > 0) {
        if (cartCount) {
            cartCount.textContent = totalItems;
            cartCount.classList.remove("hidden");
        }
        if (cartCountMobile) {
            cartCountMobile.textContent = totalItems;
            cartCountMobile.classList.remove("hidden");
        }
    } else {
        if (cartCount) cartCount.classList.add("hidden");
        if (cartCountMobile) cartCountMobile.classList.add("hidden");
    }
}

// Show toast notification
export function showToast(message) {
    const toast = document.getElementById("toast");
    const toastMessage = document.getElementById("toast-message");

    if (!toast || !toastMessage) return;

    toastMessage.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}

// Format currency
export function formatCurrency(amount) {
    return 'Rp ' + amount.toLocaleString('id-ID');
}
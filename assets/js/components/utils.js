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
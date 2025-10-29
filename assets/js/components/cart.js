// Cart functionality
export function initializeCart() {
    let cart = JSON.parse(localStorage.getItem("pharmahub-cart")) || [];

    // Update cart count display
    function updateCartCount() {
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        const cartCount = document.getElementById("cart-count");
        const cartCountMobile = document.getElementById("cart-count-mobile");

        if (totalItems > 0) {
            cartCount.textContent = totalItems;
            cartCount.classList.remove("hidden");
            cartCountMobile.textContent = totalItems;
            cartCountMobile.classList.remove("hidden");
        } else {
            cartCount.classList.add("hidden");
            cartCountMobile.classList.add("hidden");
        }
    }

    // Show toast notification
    function showToast(message) {
        const toast = document.getElementById("toast");
        const toastMessage = document.getElementById("toast-message");

        toastMessage.textContent = message;
        toast.classList.add("show");

        setTimeout(() => {
            toast.classList.remove("show");
        }, 3000);
    }

    // Initialize cart count on page load
    updateCartCount();

    return {
        updateCartCount,
        showToast,
        cart
    };
}
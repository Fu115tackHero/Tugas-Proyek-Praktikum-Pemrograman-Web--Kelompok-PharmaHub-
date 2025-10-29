// Mobile menu toggle
export function initializeMobileMenu() {
    const btn = document.getElementById("menu-btn");
    const menu = document.getElementById("menu");
    btn.addEventListener("click", () => {
        menu.classList.toggle("hidden");
    });

    // Mobile search toggle
    const mobileSearchBtn = document.getElementById("mobile-search-btn");
    const mobileSearch = document.getElementById("mobile-search");
    mobileSearchBtn.addEventListener("click", () => {
        mobileSearch.classList.toggle("hidden");
    });
}
import { products } from '../data/products.js';

// Search functionality
export function initializeSearch(inputId, resultsId) {
    const searchInput = document.getElementById(inputId);
    const searchResults = document.getElementById(resultsId);

    searchInput.addEventListener("input", function () {
        const query = this.value.toLowerCase();

        if (query.length < 2) {
            searchResults.classList.remove("active");
            return;
        }

        const filteredProducts = products.filter(
            (product) =>
                product.name.toLowerCase().includes(query) ||
                product.description.toLowerCase().includes(query)
        );

        if (filteredProducts.length > 0) {
            searchResults.innerHTML = filteredProducts
                .map(
                    (product) => `
                <div class="p-3 border-b border-gray-200 hover:bg-blue-50 cursor-pointer" data-id="${product.id}">
                    <div class="font-medium">${product.name}</div>
                    <div class="text-sm text-gray-600">${product.description}</div>
                    <div class="text-blue-600 font-bold mt-1">Rp ${product.price.toLocaleString()}</div>
                </div>
            `
                )
                .join("");

            // Add click event to search results
            searchResults.querySelectorAll("div[data-id]").forEach((item) => {
                item.addEventListener("click", function () {
                    const productId = this.getAttribute("data-id");
                    const product = products.find((p) => p.id == productId);

                    if (product) {
                        // Scroll to product
                        const productElement = document
                            .querySelector(`.add-to-cart-btn[data-id="${productId}"]`)
                            .closest(".bg-white");
                        productElement.scrollIntoView({ behavior: "smooth" });

                        // Highlight product
                        productElement.classList.add("ring-2", "ring-blue-500");
                        setTimeout(() => {
                            productElement.classList.remove("ring-2", "ring-blue-500");
                        }, 2000);

                        // Hide search results
                        searchResults.classList.remove("active");
                        searchInput.value = "";
                    }
                });
            });

            searchResults.classList.add("active");
        } else {
            searchResults.innerHTML =
                '<div class="p-3 text-center text-gray-500">Produk tidak ditemukan</div>';
            searchResults.classList.add("active");
        }
    });

    // Hide search results when clicking outside
    document.addEventListener("click", function (e) {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.classList.remove("active");
        }
    });
}
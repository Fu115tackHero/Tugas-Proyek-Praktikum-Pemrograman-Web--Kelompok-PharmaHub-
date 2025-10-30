/**
 * PharmaHub Products Page JavaScript
 * File ini berisi logika khusus untuk halaman produk dan filtering
 */

import {
  initializeMobileMenu,
  updateCartCount,
  showToast,
} from "../components/utils.js";
import { products } from "../data/productData.js";

// Add category and prescriptionRequired properties to imported products
const allProducts = products.map((product) => ({
  ...product,
  category: getCategoryForProduct(product.id),
  prescriptionRequired: getPresrcitonRequired(product.id),
}));

// Helper function to get category for each product
function getCategoryForProduct(id) {
  const categoryMap = {
    1: "obat-bebas",
    2: "obat-bebas",
    3: "obat-bebas",
    4: "obat-bebas",
    5: "obat-bebas",
    6: "obat-keras",
    7: "antiseptik",
    8: "obat-bebas",
    9: "suplemen",
    10: "obat-keras",
    11: "obat-keras",
    12: "suplemen",
    13: "suplemen",
    14: "antiseptik",
    15: "obat-keras",
  };
  return categoryMap[id] || "obat-bebas";
}

// Helper function to get prescription requirement for each product
function getPresrcitonRequired(id) {
  const prescriptionMap = {
    10: true,
    11: true,
    15: true,
  };
  return prescriptionMap[id] || false;
}

let filteredProducts = [...allProducts];

// Render products
function renderProducts(products) {
  const grid = document.getElementById("products-grid");

  grid.innerHTML = products
    .map(
      (product) => `
        <div class="bg-white rounded-xl shadow hover:shadow-lg transition p-5 text-center flex flex-col${
          product.prescriptionRequired ? " border-l-4 border-red-500" : ""
        }">
            <img
                src="assets/images/allproducts/${product.name
                  .toLowerCase()
                  .replace(/\s+/g, "-")
                  .replace(/[()]/g, "")}.jpg"
                alt="${product.name}"
                class="w-32 h-32 object-cover mx-auto mb-4 rounded-lg"
            />
            <h3 class="font-semibold text-gray-800">${product.name}</h3>
            <p class="text-gray-600 text-sm mt-1">${product.description}</p>
            ${
              product.prescriptionRequired
                ? '<div class="mt-2 mb-2"><span class="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded">Perlu Resep Dokter</span></div>'
                : ""
            }
            <div class="mt-auto">
                <p class="text-blue-600 font-bold mt-4">Rp ${product.price.toLocaleString()}</p>
                <a
                    href="detail-produk.html?id=${product.id}"
                    class="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition w-full flex items-center justify-center"
                >
                    <i class="fas fa-shopping-cart"></i>
                </a>
            </div>
        </div>
    `
    )
    .join("");
}

// Filter functions
function applyFilters() {
  const categoryFilter =
    document.getElementById("category-filter")?.value || "";
  const priceFilter = document.getElementById("price-filter")?.value || "";
  const sortFilter = document.getElementById("sort-filter")?.value || "";

  let filtered = [...allProducts];

  // Category filter
  if (categoryFilter) {
    filtered = filtered.filter(
      (product) => product.category === categoryFilter
    );
  }

  // Price filter
  if (priceFilter) {
    if (priceFilter === "0-15000") {
      filtered = filtered.filter((product) => product.price < 15000);
    } else if (priceFilter === "15000-30000") {
      filtered = filtered.filter(
        (product) => product.price >= 15000 && product.price <= 30000
      );
    } else if (priceFilter === "30000-50000") {
      filtered = filtered.filter(
        (product) => product.price > 30000 && product.price <= 50000
      );
    } else if (priceFilter === "50000+") {
      filtered = filtered.filter((product) => product.price > 50000);
    }
  }

  // Sort
  if (sortFilter === "name-asc") {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortFilter === "name-desc") {
    filtered.sort((a, b) => b.name.localeCompare(a.name));
  } else if (sortFilter === "price-low") {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sortFilter === "price-high") {
    filtered.sort((a, b) => b.price - a.price);
  }

  filteredProducts = filtered;
  renderProducts(filteredProducts);
}

// Search functionality
function setupSearch(inputId, resultsId) {
  const searchInput = document.getElementById(inputId);
  const searchResults = document.getElementById(resultsId);

  if (!searchInput || !searchResults) return;

  searchInput.addEventListener("input", function () {
    const query = this.value.toLowerCase();

    if (query.length < 2) {
      searchResults.classList.remove("active");
      return;
    }

    const filteredProducts = allProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query)
    );

    if (filteredProducts.length > 0) {
      searchResults.innerHTML = filteredProducts
        .map(
          (product) => `
                <div class="p-3 border-b border-gray-200 hover:bg-blue-50 cursor-pointer" data-id="${
                  product.id
                }">
                    <div class="font-medium">${product.name}</div>
                    <div class="text-sm text-gray-600">${
                      product.description
                    }</div>
                    <div class="text-blue-600 font-bold mt-1">Rp ${product.price.toLocaleString()}</div>
                </div>
            `
        )
        .join("");

      // Add click event to search results
      searchResults.querySelectorAll("div[data-id]").forEach((item) => {
        item.addEventListener("click", function () {
          const productId = this.getAttribute("data-id");
          // Redirect to product detail page
          window.location.href = `detail-produk.html?id=${productId}`;
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

// Initialize page
document.addEventListener("DOMContentLoaded", function () {
  // Initialize mobile menu
  initializeMobileMenu();

  // Render products and update cart count
  renderProducts(allProducts);
  updateCartCount();

  // Setup search functionality
  setupSearch("search-input", "search-results");
  setupSearch("mobile-search-input", "mobile-search-results");

  // Attach filter event listeners
  const categoryFilter = document.getElementById("category-filter");
  const priceFilter = document.getElementById("price-filter");
  const sortFilter = document.getElementById("sort-filter");

  if (categoryFilter) categoryFilter.addEventListener("change", applyFilters);
  if (priceFilter) priceFilter.addEventListener("change", applyFilters);
  if (sortFilter) sortFilter.addEventListener("change", applyFilters);

  // Mobile search toggle
  const mobileSearchBtn = document.getElementById("mobile-search-btn");
  const mobileSearch = document.getElementById("mobile-search");
  if (mobileSearchBtn && mobileSearch) {
    mobileSearchBtn.addEventListener("click", () => {
      mobileSearch.classList.toggle("hidden");
    });
  }
});

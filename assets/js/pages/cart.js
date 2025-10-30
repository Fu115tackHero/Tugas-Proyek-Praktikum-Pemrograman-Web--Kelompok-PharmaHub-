/**
 * PharmaHub Cart Page JavaScript
 */
import { initializeMobileMenu, showToast } from "../components/utils.js";

// Initialize cart from localStorage
let cart = JSON.parse(localStorage.getItem("pharmahub-cart")) || [];

// Get active cart items (not saved for later)
function getActiveCartItems() {
  return cart.filter((item) => !item.savedForLater);
}

// Get saved for later items
function getSavedForLaterItems() {
  return cart.filter((item) => item.savedForLater);
}

// Render cart items
function renderCartItems() {
  const cartItemsContainer = document.getElementById("cart-items");
  const emptyCartMessage = document.getElementById("empty-cart");
  const removeAllSection = document.getElementById("remove-all-section");
  const cartItemCount = document.getElementById("cart-item-count");

  if (!cartItemsContainer) return;

  const activeItems = getActiveCartItems();

  if (activeItems.length === 0) {
    if (emptyCartMessage) emptyCartMessage.classList.remove("hidden");
    if (removeAllSection) removeAllSection.classList.add("hidden");
    cartItemsContainer.innerHTML = "";
    if (cartItemCount) cartItemCount.textContent = "0";
    updateTotals();
    return;
  }

  if (emptyCartMessage) emptyCartMessage.classList.add("hidden");
  if (removeAllSection) removeAllSection.classList.remove("hidden");
  if (cartItemCount) cartItemCount.textContent = activeItems.length.toString();

  cartItemsContainer.innerHTML = activeItems
    .map((item, index) => {
      const cartIndex = cart.findIndex(
        (c) => c.id === item.id && !c.savedForLater
      );
      return `
        <div class="p-4 flex items-center justify-between border-b border-gray-200" data-index="${cartIndex}">
            <div class="flex items-center space-x-4">
                <img
                    src="assets/images/allproducts/${item.name
                      .toLowerCase()
                      .replace(/\s+/g, "-")
                      .replace(/[()%]/g, "")}.jpg"
                    alt="${item.name}"
                    class="w-16 h-16 object-cover rounded-lg"
                    onerror="this.src='assets/images/placeholder.jpg'"
                />
                <div>
                    <h3 class="font-medium text-gray-800">${item.name}</h3>
                    <p class="text-sm text-gray-600">Produk Farmasi</p>
                    <div class="flex items-center mt-2">
                        <button class="text-red-600 hover:text-red-700 text-sm font-medium remove-item">
                            <i class="fas fa-trash mr-1"></i> Hapus
                        </button>
                        <button class="text-blue-600 hover:text-blue-700 text-sm font-medium ml-4 save-for-later">
                            <i class="far fa-bookmark mr-1"></i> Simpan untuk nanti
                        </button>
                    </div>
                </div>
            </div>
            <div class="flex items-center space-x-6">
                <div class="flex items-center space-x-2">
                    <button class="quantity-btn minus w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100">
                        <i class="fas fa-minus text-gray-600"></i>
                    </button>
                    <span class="quantity-value w-8 text-center font-medium">${
                      item.quantity
                    }</span>
                    <button class="quantity-btn plus w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100">
                        <i class="fas fa-plus text-gray-600"></i>
                    </button>
                </div>
                <div class="text-right">
                    <p class="font-medium text-gray-800">Rp ${(
                      item.price * item.quantity
                    ).toLocaleString("id-ID")}</p>
                    <p class="text-sm text-gray-500">Rp ${item.price.toLocaleString(
                      "id-ID"
                    )}/pcs</p>
                </div>
            </div>
        </div>
    `;
    })
    .join("");

  updateTotals();
  attachEventListeners();
}

// Update totals
function updateTotals() {
  const activeItems = getActiveCartItems();
  const subtotal = activeItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const discount = 0; // Implement discount logic here
  const shipping = subtotal > 100000 ? 0 : 15000; // Free shipping over 100k
  const total = subtotal + shipping - discount;

  const subtotalEl = document.getElementById("subtotal");
  const discountEl = document.getElementById("discount");
  const shippingEl = document.getElementById("shipping");
  const totalEl = document.getElementById("total");

  if (subtotalEl)
    subtotalEl.textContent = `Rp ${subtotal.toLocaleString("id-ID")}`;
  if (discountEl)
    discountEl.textContent =
      discount > 0 ? `-Rp ${discount.toLocaleString("id-ID")}` : "Rp 0";
  if (shippingEl)
    shippingEl.textContent =
      shipping === 0 ? "GRATIS" : `Rp ${shipping.toLocaleString("id-ID")}`;
  if (totalEl) totalEl.textContent = `Rp ${total.toLocaleString("id-ID")}`;
}

// Save cart to localStorage
function saveCart() {
  localStorage.setItem("pharmahub-cart", JSON.stringify(cart));
  // Update cart badge
  if (window.PharmaHub && window.PharmaHub.updateCartItemCount) {
    window.PharmaHub.updateCartItemCount();
  }
}

// Attach event listeners to buttons
function attachEventListeners() {
  // Quantity buttons
  document.querySelectorAll(".quantity-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const itemContainer = this.closest("[data-index]");
      const index = parseInt(itemContainer.dataset.index);
      const isPlus = this.classList.contains("plus");

      if (isPlus) {
        cart[index].quantity++;
      } else if (cart[index].quantity > 1) {
        cart[index].quantity--;
      }

      saveCart();
      renderCartItems();
    });
  });

  // Remove item buttons
  document.querySelectorAll(".remove-item").forEach((btn) => {
    btn.addEventListener("click", function () {
      const itemContainer = this.closest("[data-index]");
      const index = parseInt(itemContainer.dataset.index);
      const itemName = cart[index].name;

      cart.splice(index, 1);
      saveCart();
      renderCartItems();
      showToast(`${itemName} dihapus dari keranjang`, "success");
    });
  });

  // Save for later buttons
  document.querySelectorAll(".save-for-later").forEach((btn) => {
    btn.addEventListener("click", function () {
      const itemContainer = this.closest("[data-index]");
      const index = parseInt(itemContainer.dataset.index);
      const itemName = cart[index].name;

      cart[index].savedForLater = true;
      saveCart();
      renderCartItems();
      showToast(`${itemName} disimpan untuk nanti`, "success");
    });
  });

  // Remove all button
  const removeAllBtn = document.getElementById("remove-all-btn");
  if (removeAllBtn) {
    removeAllBtn.addEventListener("click", function () {
      if (confirm("Apakah Anda yakin ingin menghapus semua item?")) {
        cart = cart.filter((item) => item.savedForLater);
        saveCart();
        renderCartItems();
        showToast("Semua item dihapus dari keranjang", "success");
      }
    });
  }
}

// Checkout button
const checkoutBtn = document.getElementById("checkout-btn");
if (checkoutBtn) {
  checkoutBtn.addEventListener("click", function () {
    const activeItems = getActiveCartItems();
    if (activeItems.length === 0) {
      showToast("Keranjang Anda kosong", "error");
      return;
    }
    window.location.href = "checkout.html";
  });
}

// Initialize page
document.addEventListener("DOMContentLoaded", function () {
  initializeMobileMenu();
  renderCartItems();
});

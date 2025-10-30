/**
 * PharmaHub Checkout Page JavaScript
 */
import { initializeMobileMenu, updateCartCount } from "../components/utils.js";

function initPaymentToggle() {
  document.querySelectorAll('input[name="payment"]').forEach((radio) => {
    radio.addEventListener("change", function () {
      const creditCardForm = document.getElementById("credit-card-form");
      if (this.value === "credit-card") {
        creditCardForm.classList.remove("hidden");
      } else {
        creditCardForm.classList.add("hidden");
      }
    });
  });
}

// Render cart items in checkout
function renderCartItems() {
  const orderItems = document.getElementById("order-items");
  if (!orderItems) return;

  // Get cart items from localStorage
  const cartItems = JSON.parse(localStorage.getItem("cart")) || [];

  orderItems.innerHTML = cartItems
    .map(
      (item) => `
    <div class="flex justify-between items-center py-2">
      <div class="flex items-center space-x-4">
        <img
          src="assets/images/allproducts/${item.name
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[()]/g, "")}.jpg"
          alt="${item.name}"
          class="w-12 h-12 object-cover rounded-lg"
        />
        <div>
          <h4 class="font-medium">${item.name}</h4>
          <p class="text-gray-500 text-sm">Rp ${item.price.toLocaleString()}/pcs</p>
          <p class="text-sm text-gray-600">Jumlah: ${item.quantity}</p>
        </div>
      </div>
      <span class="font-medium">Rp ${(
        item.price * item.quantity
      ).toLocaleString()}</span>
    </div>
  `
    )
    .join("");

  // Update totals
  updateTotals(cartItems);
}

function initQuantityControls() {
  // plus buttons
  document.querySelectorAll(".fa-plus").forEach((icon) => {
    const btn = icon.parentElement;
    if (!btn) return;
    btn.addEventListener("click", function () {
      const span =
        this.querySelector && this.querySelector("span")
          ? this.querySelector("span")
          : this.previousElementSibling;
      // try to find the number span nearby
      const qtySpan = this.parentElement.querySelector("span") || span;
      const current = parseInt(qtySpan.textContent) || 0;
      qtySpan.textContent = current + 1;
      updateItemTotal(this);
    });
  });

  // minus buttons
  document.querySelectorAll(".fa-minus").forEach((icon) => {
    const btn = icon.parentElement;
    if (!btn) return;
    btn.addEventListener("click", function () {
      const qtySpan = this.parentElement.querySelector("span");
      const current = parseInt(qtySpan.textContent) || 0;
      if (current > 1) {
        qtySpan.textContent = current - 1;
        updateItemTotal(this);
      }
    });
  });
}

function checkout() {
  // Mengambil semua item di keranjang
  const cartItems = JSON.parse(localStorage.getItem("cart")) || [];

  // Menghapus item yang checkout dari keranjang
  const checkoutItem = document.querySelector(".checkout-item");
  if (checkoutItem) {
    const itemName = checkoutItem.querySelector("h4").textContent;
    const itemQuantity = parseInt(checkoutItem.querySelector("p").textContent);
    const itemIndex = cartItems.findIndex((item) => item.name === itemName);
    if (itemIndex !== -1) {
      if (cartItems[itemIndex].savedForLater) {
        // Jika item disimpan untuk nanti, hapus dari savedForLater
        const savedForLaterIndex = cartItems.findIndex(
          (item) => item.name === itemName && item.savedForLater
        );
        if (savedForLaterIndex !== -1) {
          cartItems.splice(savedForLaterIndex, 1);
          showToast(`${itemName} berhasil dihapus dari keranjang`);
        } else {
          showToast(`${itemName} tidak ditemukan di keranjang Anda`);
        }
      } else {
        // Jika item tidak disimpan untuk nanti, kurangi jumlahnya dari keranjang
        cartItems[itemIndex].quantity -= itemQuantity;
        if (cartItems[itemIndex].quantity === 0) {
          cartItems.splice(itemIndex, 1);
          showToast(`${itemName} berhasil dihapus dari keranjang`);
        } else {
          showToast(`${itemName} berhasil dihapus dari keranjang`);
        }
      }
    }
  }

  // Update jumlah barang di halaman
  renderCartItems();

  // Hapus item checkout dari halaman
  checkoutItem.remove();
}

function updateItemTotal(element) {
  // Placeholder: put real calculation here using price data
  console.log("Updating totals...");
}

function initPage() {
  initializeMobileMenu();
  initPaymentToggle();
  initQuantityControls();
  // Use the global updateCartItemCount function from main.js
  if (window.PharmaHub && window.PharmaHub.updateCartItemCount) {
    window.PharmaHub.updateCartItemCount();
  }
}

document.addEventListener("DOMContentLoaded", initPage);

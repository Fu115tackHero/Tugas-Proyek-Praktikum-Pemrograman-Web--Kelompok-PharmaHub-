/**
 * PharmaHub Checkout Page JavaScript
 */
import {
  initializeMobileMenu,
  updateCartCount,
  formatCurrency,
  showToast,
} from "../components/utils.js";

let cart = [];

/**
 * Load cart data from localStorage
 */
function loadCartData() {
  cart = JSON.parse(localStorage.getItem("pharmahub-cart")) || [];

  // Redirect to cart page if cart is empty
  if (cart.length === 0) {
    showToast(
      "Keranjang Anda kosong. Silakan tambahkan produk terlebih dahulu.",
      "error"
    );
    setTimeout(() => {
      window.location.href = "keranjang.html";
    }, 2000);
    return;
  }

  renderOrderItems();
  updateOrderSummary();
}

/**
 * Render order items in summary section
 */
function renderOrderItems() {
  const orderItemsContainer = document.getElementById("order-items");
  if (!orderItemsContainer) return;

  orderItemsContainer.innerHTML = cart
    .map(
      (item) => `
    <div class="flex items-center space-x-3 pb-3 border-b border-gray-200">
      <img
        src="https://cdn-icons-png.flaticon.com/512/2966/2966388.png"
        alt="${item.name}"
        class="w-12 h-12 object-contain bg-gray-100 rounded p-1"
      />
      <div class="flex-1 min-w-0">
        <h3 class="text-sm font-medium text-gray-800 truncate">${item.name}</h3>
        <p class="text-xs text-gray-500">Qty: ${item.quantity}</p>
      </div>
      <div class="text-right">
        <p class="text-sm font-semibold text-gray-800">${formatCurrency(
          item.price * item.quantity
        )}</p>
        <p class="text-xs text-gray-500">${formatCurrency(item.price)}/pcs</p>
      </div>
    </div>
  `
    )
    .join("");
}

/**
 * Update order summary calculations
 */
function updateOrderSummary() {
  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Get discount from localStorage if exists
  const discountData = JSON.parse(
    localStorage.getItem("pharmahub-discount")
  ) || { amount: 0, percent: 0 };
  const discountAmount = discountData.amount || 0;

  // Calculate total (no tax)
  const total = subtotal - discountAmount;

  // Update summary elements
  const subtotalEl = document.getElementById("subtotal");
  const discountEl = document.getElementById("discount");
  const totalEl = document.getElementById("total");

  if (subtotalEl) subtotalEl.textContent = formatCurrency(subtotal);
  if (discountEl)
    discountEl.textContent =
      discountAmount > 0
        ? `-${formatCurrency(discountAmount)}`
        : formatCurrency(0);
  if (totalEl) totalEl.textContent = formatCurrency(total);
}

/**
 * Handle payment method change
 */
function handlePaymentChange() {
  const paymentSelect = document.getElementById("payment");
  const bankOptions = document.getElementById("bank-options");
  const ewalletOptions = document.getElementById("ewallet-options");

  if (!paymentSelect) return;

  paymentSelect.addEventListener("change", function () {
    const selectedMethod = this.value;

    // Hide all options first
    if (bankOptions) bankOptions.classList.add("hidden");
    if (ewalletOptions) ewalletOptions.classList.add("hidden");

    // Show relevant options
    if (selectedMethod === "transfer" && bankOptions) {
      bankOptions.classList.remove("hidden");
    } else if (selectedMethod === "ewallet" && ewalletOptions) {
      ewalletOptions.classList.remove("hidden");
    }
  });
}

/**
 * Handle form submission
 */
function handleFormSubmit() {
  const form = document.getElementById("checkout-form");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    // Get form data
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // Validate payment method
    if (!data.payment) {
      showToast("Silakan pilih metode pembayaran!", "error");
      return;
    }

    // Validate bank selection if transfer
    if (data.payment === "transfer" && !data.bank) {
      showToast("Silakan pilih bank untuk transfer!", "error");
      return;
    }

    // Validate e-wallet selection
    if (data.payment === "ewallet" && !data.ewallet) {
      showToast("Silakan pilih e-wallet!", "error");
      return;
    }

    // Create order object
    const order = {
      id: "ORD-" + Date.now(),
      date: new Date().toISOString(),
      customer: {
        name: data.nama,
        email: data.email,
        phone: data.telepon,
      },
      payment: {
        method: data.payment,
        bank: data.bank || null,
        ewallet: data.ewallet || null,
      },
      items: cart,
      subtotal: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
      discount:
        JSON.parse(localStorage.getItem("pharmahub-discount"))?.amount || 0,
      total:
        cart.reduce((sum, item) => sum + item.price * item.quantity, 0) -
        (JSON.parse(localStorage.getItem("pharmahub-discount"))?.amount || 0),
      status: "pending",
    };

    // Save order to localStorage
    const orders = JSON.parse(localStorage.getItem("pharmahub-orders")) || [];
    orders.push(order);
    localStorage.setItem("pharmahub-orders", JSON.stringify(orders));

    // Create notification for the order
    const notifications =
      JSON.parse(localStorage.getItem("pharmahub-notifications")) || [];
    const notification = {
      id: "NOTIF-" + Date.now(),
      type: "order",
      orderId: order.id,
      title: "Pesanan Berhasil Dibuat",
      message: `Pesanan ${
        order.id
      } telah berhasil dibuat. Total: ${formatCurrency(
        order.total
      )}. Silakan ambil obat di apotek setelah melakukan pembayaran.`,
      date: new Date().toISOString(),
      read: false,
    };
    notifications.unshift(notification); // Add to beginning of array
    localStorage.setItem(
      "pharmahub-notifications",
      JSON.stringify(notifications)
    );

    // Clear cart and discount
    localStorage.removeItem("pharmahub-cart");
    localStorage.removeItem("pharmahub-discount");

    // Show success message
    showToast("Pesanan berhasil dibuat! ID: " + order.id, "success");

    // Redirect to history page
    setTimeout(() => {
      window.location.href = "riwayat.html";
    }, 2000);
  });
}

/**
 * Initialize page
 */
function initPage() {
  initializeMobileMenu();
  updateCartCount();
  loadCartData();
  handlePaymentChange();
  handleFormSubmit();
}

// Make function globally available for inline handlers
window.handlePaymentChange = function () {
  const paymentSelect = document.getElementById("payment");
  const bankOptions = document.getElementById("bank-options");
  const ewalletOptions = document.getElementById("ewallet-options");

  const selectedMethod = paymentSelect.value;

  // Hide all options first
  if (bankOptions) bankOptions.classList.add("hidden");
  if (ewalletOptions) ewalletOptions.classList.add("hidden");

  // Show relevant options
  if (selectedMethod === "transfer" && bankOptions) {
    bankOptions.classList.remove("hidden");
  } else if (selectedMethod === "ewallet" && ewalletOptions) {
    ewalletOptions.classList.remove("hidden");
  }
};

document.addEventListener("DOMContentLoaded", initPage);

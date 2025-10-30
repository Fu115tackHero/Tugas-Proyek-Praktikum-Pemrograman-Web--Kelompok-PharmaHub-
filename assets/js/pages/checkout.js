/**
 * PharmaHub Checkout Page JavaScript
 */
import { initializeMobileMenu, showToast } from "../components/utils.js";

// Load cart items
function loadCartData() {
  const cart = JSON.parse(localStorage.getItem("pharmahub-cart")) || [];
  return cart.filter((item) => !item.savedForLater);
}

// Render cart items in checkout
function renderOrderItems() {
  const orderItems = document.getElementById("order-items");
  if (!orderItems) return;

  const cartItems = loadCartData();

  if (cartItems.length === 0) {
    orderItems.innerHTML = `
      <div class="text-center py-8 text-gray-500">
        <i class="fas fa-shopping-cart text-4xl mb-3"></i>
        <p>Keranjang Anda kosong</p>
        <a href="produk.html" class="text-blue-600 hover:text-blue-800 mt-2 inline-block">Belanja Sekarang</a>
      </div>
    `;
    return;
  }

  orderItems.innerHTML = cartItems
    .map(
      (item) => `
    <div class="flex justify-between items-center py-3 border-b border-gray-100">
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
          <h4 class="font-medium text-gray-800">${item.name}</h4>
          <p class="text-gray-500 text-sm">Rp ${item.price.toLocaleString(
            "id-ID"
          )}/pcs</p>
          <p class="text-sm text-gray-600">Jumlah: ${item.quantity}</p>
        </div>
      </div>
      <span class="font-semibold text-gray-800">Rp ${(
        item.price * item.quantity
      ).toLocaleString("id-ID")}</span>
    </div>
  `
    )
    .join("");

  updateOrderSummary(cartItems);
}

// Update order summary
function updateOrderSummary(cartItems) {
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const discount = JSON.parse(localStorage.getItem("pharmahub-discount")) || 0;
  const shipping = subtotal > 100000 ? 0 : 15000;
  const total = subtotal - discount + shipping;

  // Update UI
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

// Handle form submission
function handleFormSubmit(e) {
  e.preventDefault();

  const cartItems = loadCartData();
  if (cartItems.length === 0) {
    showToast("Keranjang Anda kosong", "error");
    return;
  }

  // Get form data
  const formData = new FormData(e.target);
  const customerName = formData.get("name");
  const customerPhone = formData.get("phone");
  const customerAddress = formData.get("address");
  const paymentMethod = formData.get("payment");

  // Validate
  if (!customerName || !customerPhone || !customerAddress || !paymentMethod) {
    showToast("Mohon lengkapi semua data", "error");
    return;
  }

  // Calculate totals
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const discount = JSON.parse(localStorage.getItem("pharmahub-discount")) || 0;
  const shipping = subtotal > 100000 ? 0 : 15000;
  const total = subtotal - discount + shipping;

  // Create order
  const order = {
    orderId: "ORD-" + Date.now(),
    date: new Date().toISOString(),
    customerName,
    customerPhone,
    customerAddress,
    paymentMethod,
    items: cartItems.map((item) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
    })),
    subtotal,
    discount,
    shipping,
    total,
    status: "processing",
  };

  // Save order to localStorage
  const orders = JSON.parse(localStorage.getItem("pharmahub-orders")) || [];
  orders.push(order);
  localStorage.setItem("pharmahub-orders", JSON.stringify(orders));

  // Create notification
  const notification = {
    id: "notif-" + Date.now(),
    type: "order",
    title: "Pesanan Berhasil",
    message: `Pesanan ${
      order.orderId
    } telah diterima dan sedang diproses. Total pembayaran: Rp ${total.toLocaleString(
      "id-ID"
    )}`,
    orderId: order.orderId,
    date: new Date().toISOString(),
    read: false,
  };

  const notifications =
    JSON.parse(localStorage.getItem("pharmahub-notifications")) || [];
  notifications.unshift(notification);
  localStorage.setItem(
    "pharmahub-notifications",
    JSON.stringify(notifications)
  );

  // Clear cart and discount
  localStorage.removeItem("pharmahub-cart");
  localStorage.removeItem("pharmahub-discount");

  // Update cart badge
  if (window.PharmaHub && window.PharmaHub.updateCartItemCount) {
    window.PharmaHub.updateCartItemCount();
  }

  // Show success message
  showToast("Pesanan berhasil! Redirecting...", "success");

  // Redirect to order success page or history
  setTimeout(() => {
    window.location.href = "riwayat.html";
  }, 2000);
}

// Initialize payment toggle
function initPaymentToggle() {
  document.querySelectorAll('input[name="payment"]').forEach((radio) => {
    radio.addEventListener("change", function () {
      const creditCardForm = document.getElementById("credit-card-form");
      if (creditCardForm) {
        if (this.value === "credit-card") {
          creditCardForm.classList.remove("hidden");
        } else {
          creditCardForm.classList.add("hidden");
        }
      }
    });
  });
}

// Initialize checkout page
document.addEventListener("DOMContentLoaded", function () {
  initializeMobileMenu();
  renderOrderItems();
  initPaymentToggle();

  // Handle form submission
  const checkoutForm = document.getElementById("checkout-form");
  if (checkoutForm) {
    checkoutForm.addEventListener("submit", handleFormSubmit);
  }
});

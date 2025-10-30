/**
 * PharmaHub History Page JavaScript
 * File ini berisi logika khusus untuk halaman riwayat transaksi
 */

import { initializeMobileMenu, showToast } from "../components/utils.js";

let allOrders = [];
let currentFilter = "all";

// Load orders from localStorage
function loadOrders() {
  allOrders = JSON.parse(localStorage.getItem("pharmahub-orders")) || [];
  console.log("Orders loaded:", allOrders.length, "orders");
  console.log(
    "Order statuses:",
    allOrders.map((o) => o.status)
  );
  updateTabCounts();
  renderOrders();
}

// Update tab counts
function updateTabCounts() {
  const allCount = allOrders.length;
  const completedCount = allOrders.filter(
    (o) => o.status === "delivered"
  ).length;
  const processingCount = allOrders.filter(
    (o) => o.status === "processing"
  ).length;
  const cancelledCount = allOrders.filter(
    (o) => o.status === "cancelled"
  ).length;

  // Update badge counts
  const tabs = document.querySelectorAll(".tab-btn");
  tabs.forEach((tab) => {
    const badge = tab.querySelector("span");
    if (!badge) return;

    const tabType = tab.dataset.tab;
    let count = 0;

    switch (tabType) {
      case "all":
        count = allCount;
        break;
      case "completed":
        count = completedCount;
        break;
      case "processing":
        count = processingCount;
        break;
      case "cancelled":
        count = cancelledCount;
        break;
    }

    badge.textContent = count;
  });
}

// Render orders based on filter
function renderOrders() {
  const historyContainer = document.getElementById("history-container");
  const emptyState = document.getElementById("empty-state");

  if (!historyContainer) return;

  let filteredOrders = allOrders;

  console.log("Current filter:", currentFilter);
  console.log("All orders:", allOrders.length);

  // Filter by status - map HTML tab values to order status values
  if (currentFilter !== "all") {
    const statusMap = {
      completed: "delivered",
      processing: "processing",
      cancelled: "cancelled",
      shipped: "shipped",
    };
    const actualStatus = statusMap[currentFilter] || currentFilter;
    filteredOrders = allOrders.filter((order) => order.status === actualStatus);
  }

  console.log("Filtered orders:", filteredOrders.length);

  // Sort by date (newest first)
  filteredOrders.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Check if there are orders to display
  if (filteredOrders.length === 0) {
    // No orders - show empty state
    console.log("Showing empty state");
    historyContainer.innerHTML = "";
    historyContainer.classList.add("hidden");
    if (emptyState) {
      emptyState.classList.remove("hidden");
    }
    return;
  }

  // Has orders - show orders list, hide empty state
  console.log("Showing orders list");
  historyContainer.classList.remove("hidden");
  if (emptyState) {
    emptyState.classList.add("hidden");
  }

  // Render orders
  historyContainer.innerHTML = filteredOrders
    .map(
      (order) => `
        <div class="bg-white rounded-lg shadow-md p-6 mb-4 border-l-4 ${getStatusBorderColor(
          order.status
        )}">
            <div class="flex justify-between items-start mb-4">
                <div>
                    <h3 class="text-lg font-semibold text-gray-800">${
                      order.orderId
                    }</h3>
                    <p class="text-sm text-gray-500">${formatDate(
                      order.date
                    )}</p>
                </div>
                <span class="px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(
                  order.status
                )}">
                    ${getStatusText(order.status)}
                </span>
            </div>
            
            <div class="border-t border-gray-200 pt-4">
                <div class="space-y-2 mb-4">
                    ${order.items
                      .map(
                        (item) => `
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-700">${item.name} × ${
                          item.quantity
                        }</span>
                            <span class="text-gray-600">Rp ${(
                              item.price * item.quantity
                            ).toLocaleString("id-ID")}</span>
                        </div>
                    `
                      )
                      .join("")}
                </div>
                
                <div class="border-t border-gray-200 pt-3">
                    <div class="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Subtotal</span>
                        <span>Rp ${order.subtotal.toLocaleString(
                          "id-ID"
                        )}</span>
                    </div>
                    ${
                      order.discount > 0
                        ? `
                        <div class="flex justify-between text-sm text-green-600 mb-1">
                            <span>Diskon</span>
                            <span>-Rp ${order.discount.toLocaleString(
                              "id-ID"
                            )}</span>
                        </div>
                    `
                        : ""
                    }
                    <div class="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Ongkir</span>
                        <span>${
                          order.shipping === 0
                            ? "GRATIS"
                            : "Rp " + order.shipping.toLocaleString("id-ID")
                        }</span>
                    </div>
                    <div class="flex justify-between font-semibold text-gray-800 text-lg">
                        <span>Total</span>
                        <span>Rp ${order.total.toLocaleString("id-ID")}</span>
                    </div>
                </div>
                
                <div class="mt-4 pt-4 border-t border-gray-200">
                    <p class="text-sm text-gray-600"><strong>Nama:</strong> ${
                      order.customerName
                    }</p>
                    <p class="text-sm text-gray-600"><strong>Telepon:</strong> ${
                      order.customerPhone
                    }</p>
                    <p class="text-sm text-gray-600"><strong>Alamat:</strong> ${
                      order.customerAddress
                    }</p>
                    <p class="text-sm text-gray-600"><strong>Pembayaran:</strong> ${getPaymentMethodText(
                      order.paymentMethod
                    )}</p>
                </div>
                
                <div class="mt-4 flex justify-end space-x-2">
                    <button onclick="window.reorderItems('${
                      order.orderId
                    }')" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                        <i class="fas fa-redo mr-1"></i> Pesan Lagi
                    </button>
                    <button onclick="window.deleteOrder('${
                      order.orderId
                    }')" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm">
                        <i class="fas fa-trash mr-1"></i> Hapus
                    </button>
                </div>
            </div>
        </div>
    `
    )
    .join("");
}

// Helper functions
function formatDate(dateString) {
  const date = new Date(dateString);
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return date.toLocaleDateString("id-ID", options);
}

function getStatusText(status) {
  const statusMap = {
    processing: "Diproses",
    shipped: "Dikirim",
    delivered: "Selesai",
    cancelled: "Dibatalkan",
  };
  return statusMap[status] || status;
}

function getStatusBadgeClass(status) {
  const classMap = {
    processing: "bg-yellow-100 text-yellow-800",
    shipped: "bg-blue-100 text-blue-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };
  return classMap[status] || "bg-gray-100 text-gray-800";
}

function getStatusBorderColor(status) {
  const colorMap = {
    processing: "border-yellow-500",
    shipped: "border-blue-500",
    delivered: "border-green-500",
    cancelled: "border-red-500",
  };
  return colorMap[status] || "border-gray-500";
}

function getPaymentMethodText(method) {
  const methodMap = {
    "bank-transfer": "Transfer Bank",
    "credit-card": "Kartu Kredit",
    "e-wallet": "E-Wallet",
    cod: "Cash on Delivery",
  };
  return methodMap[method] || method;
}

// Delete order
window.deleteOrder = function (orderId) {
  if (!confirm("Apakah Anda yakin ingin menghapus riwayat pesanan ini?")) {
    return;
  }

  allOrders = allOrders.filter((order) => order.orderId !== orderId);
  localStorage.setItem("pharmahub-orders", JSON.stringify(allOrders));

  showToast("Riwayat pesanan berhasil dihapus", "success");
  updateTabCounts();
  renderOrders();
};

// Reorder items
window.reorderItems = function (orderId) {
  const order = allOrders.find((o) => o.orderId === orderId);
  if (!order) return;

  // Get current cart
  const cart = JSON.parse(localStorage.getItem("pharmahub-cart")) || [];

  // Add order items to cart
  order.items.forEach((item) => {
    const existingItem = cart.find((cartItem) => cartItem.id === item.id);
    if (existingItem) {
      existingItem.quantity += item.quantity;
    } else {
      cart.push({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        savedForLater: false,
      });
    }
  });

  localStorage.setItem("pharmahub-cart", JSON.stringify(cart));

  // Update cart badge
  if (window.PharmaHub && window.PharmaHub.updateCartItemCount) {
    window.PharmaHub.updateCartItemCount();
  }

  showToast("Produk berhasil ditambahkan ke keranjang", "success");

  // Redirect to cart
  setTimeout(() => {
    window.location.href = "keranjang.html";
  }, 1500);
};

// Tab functionality
function initTabs() {
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      // Remove active class from all tabs
      document.querySelectorAll(".tab-btn").forEach((tab) => {
        tab.classList.remove("active", "border-blue-500", "text-blue-600");
        tab.classList.add("border-transparent", "text-gray-500");
      });

      // Add active class to clicked tab
      this.classList.add("active", "border-blue-500", "text-blue-600");
      this.classList.remove("border-transparent", "text-gray-500");

      // Filter history based on the selected tab
      currentFilter = this.dataset.tab;
      renderOrders();
    });
  });
}

// Initialize page
document.addEventListener("DOMContentLoaded", function () {
  initializeMobileMenu();
  initTabs();
  loadOrders();
});

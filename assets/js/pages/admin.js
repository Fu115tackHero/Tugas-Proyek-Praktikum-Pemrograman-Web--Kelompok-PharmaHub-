/**
 * PharmaHub Admin Page JavaScript
 */
import { showToast } from "../components/utils.js";

let allOrders = [];
let currentFilter = "all";
let currentSearch = "";

// Load orders from localStorage
function loadOrders() {
  allOrders = JSON.parse(localStorage.getItem("pharmahub-orders")) || [];
  updateStats();
  renderOrders();
}

// Update statistics
function updateStats() {
  const totalOrders = allOrders.length;
  const processingOrders = allOrders.filter(
    (o) => o.status === "processing"
  ).length;
  const shippedOrders = allOrders.filter((o) => o.status === "shipped").length;
  const deliveredOrders = allOrders.filter(
    (o) => o.status === "delivered"
  ).length;

  document.getElementById("total-orders").textContent = totalOrders;
  document.getElementById("processing-orders").textContent = processingOrders;
  document.getElementById("shipped-orders").textContent = shippedOrders;
  document.getElementById("delivered-orders").textContent = deliveredOrders;
}

// Render orders
function renderOrders() {
  const ordersContainer = document.getElementById("orders-container");
  if (!ordersContainer) return;

  let filteredOrders = allOrders;

  // Filter by status
  if (currentFilter !== "all") {
    filteredOrders = filteredOrders.filter(
      (order) => order.status === currentFilter
    );
  }

  // Filter by search
  if (currentSearch) {
    const searchLower = currentSearch.toLowerCase();
    filteredOrders = filteredOrders.filter(
      (order) =>
        order.orderId.toLowerCase().includes(searchLower) ||
        order.customerName.toLowerCase().includes(searchLower)
    );
  }

  // Sort by date (newest first)
  filteredOrders.sort((a, b) => new Date(b.date) - new Date(a.date));

  if (filteredOrders.length === 0) {
    ordersContainer.innerHTML = `
            <div class="p-12 text-center text-gray-500">
                <i class="fas fa-inbox text-6xl mb-4"></i>
                <p class="text-lg">Tidak ada pesanan ditemukan</p>
            </div>
        `;
    return;
  }

  ordersContainer.innerHTML = filteredOrders
    .map(
      (order) => `
        <div class="p-6 hover:bg-gray-50 transition-colors">
            <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div class="flex-1">
                    <div class="flex items-center gap-3 mb-2">
                        <span class="font-bold text-lg text-gray-800">${
                          order.orderId
                        }</span>
                        <span class="px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(
                          order.status
                        )}">
                            ${getStatusText(order.status)}
                        </span>
                    </div>
                    <div class="text-sm text-gray-600 space-y-1">
                        <p><i class="fas fa-user w-4"></i> <strong>Pelanggan:</strong> ${
                          order.customerName
                        }</p>
                        <p><i class="fas fa-phone w-4"></i> <strong>Telepon:</strong> ${
                          order.customerPhone
                        }</p>
                        <p><i class="fas fa-calendar w-4"></i> <strong>Tanggal:</strong> ${formatDate(
                          order.date
                        )}</p>
                        <p><i class="fas fa-shopping-bag w-4"></i> <strong>Item:</strong> ${
                          order.items.length
                        } produk</p>
                    </div>
                </div>
                <div class="flex flex-col items-end gap-3">
                    <div class="text-right">
                        <p class="text-sm text-gray-600">Total Pembayaran</p>
                        <p class="text-2xl font-bold text-gray-800">Rp ${order.total.toLocaleString(
                          "id-ID"
                        )}</p>
                    </div>
                    <div class="flex gap-2">
                        <button onclick="window.viewOrderDetail('${
                          order.orderId
                        }')" 
                            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                            <i class="fas fa-eye mr-1"></i> Detail
                        </button>
                        <select onchange="window.updateOrderStatus('${
                          order.orderId
                        }', this.value)" 
                            class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="">Ubah Status</option>
                            <option value="processing" ${
                              order.status === "processing" ? "selected" : ""
                            }>Diproses</option>
                            <option value="shipped" ${
                              order.status === "shipped" ? "selected" : ""
                            }>Dikirim</option>
                            <option value="delivered" ${
                              order.status === "delivered" ? "selected" : ""
                            }>Selesai</option>
                            <option value="cancelled" ${
                              order.status === "cancelled" ? "selected" : ""
                            }>Dibatalkan</option>
                        </select>
                        <button onclick="window.deleteOrderAdmin('${
                          order.orderId
                        }')" 
                            class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
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

function getPaymentMethodText(method) {
  const methodMap = {
    "bank-transfer": "Transfer Bank",
    "credit-card": "Kartu Kredit",
    "e-wallet": "E-Wallet",
    cod: "Cash on Delivery",
  };
  return methodMap[method] || method;
}

// View order detail
window.viewOrderDetail = function (orderId) {
  const order = allOrders.find((o) => o.orderId === orderId);
  if (!order) return;

  const modal = document.getElementById("order-modal");
  const content = document.getElementById("order-detail-content");

  content.innerHTML = `
        <div class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <h4 class="font-semibold text-gray-800 mb-2">Informasi Pesanan</h4>
                    <div class="space-y-2 text-sm">
                        <p><strong>Order ID:</strong> ${order.orderId}</p>
                        <p><strong>Tanggal:</strong> ${formatDate(
                          order.date
                        )}</p>
                        <p><strong>Status:</strong> <span class="px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(
                          order.status
                        )}">${getStatusText(order.status)}</span></p>
                    </div>
                </div>
                <div>
                    <h4 class="font-semibold text-gray-800 mb-2">Informasi Pelanggan</h4>
                    <div class="space-y-2 text-sm">
                        <p><strong>Nama:</strong> ${order.customerName}</p>
                        <p><strong>Telepon:</strong> ${order.customerPhone}</p>
                        <p><strong>Alamat:</strong> ${order.customerAddress}</p>
                        <p><strong>Pembayaran:</strong> ${getPaymentMethodText(
                          order.paymentMethod
                        )}</p>
                    </div>
                </div>
            </div>

            <div>
                <h4 class="font-semibold text-gray-800 mb-3">Item Pesanan</h4>
                <div class="border border-gray-200 rounded-lg divide-y divide-gray-200">
                    ${order.items
                      .map(
                        (item) => `
                        <div class="p-4 flex justify-between items-center">
                            <div>
                                <p class="font-medium text-gray-800">${
                                  item.name
                                }</p>
                                <p class="text-sm text-gray-600">Qty: ${
                                  item.quantity
                                } × Rp ${item.price.toLocaleString("id-ID")}</p>
                            </div>
                            <p class="font-semibold text-gray-800">Rp ${(
                              item.price * item.quantity
                            ).toLocaleString("id-ID")}</p>
                        </div>
                    `
                      )
                      .join("")}
                </div>
            </div>

            <div class="border-t border-gray-200 pt-4">
                <div class="space-y-2 text-sm">
                    <div class="flex justify-between">
                        <span class="text-gray-600">Subtotal</span>
                        <span class="font-medium">Rp ${order.subtotal.toLocaleString(
                          "id-ID"
                        )}</span>
                    </div>
                    ${
                      order.discount > 0
                        ? `
                        <div class="flex justify-between text-green-600">
                            <span>Diskon</span>
                            <span class="font-medium">-Rp ${order.discount.toLocaleString(
                              "id-ID"
                            )}</span>
                        </div>
                    `
                        : ""
                    }
                    <div class="flex justify-between">
                        <span class="text-gray-600">Ongkir</span>
                        <span class="font-medium">${
                          order.shipping === 0
                            ? "GRATIS"
                            : "Rp " + order.shipping.toLocaleString("id-ID")
                        }</span>
                    </div>
                    <div class="flex justify-between text-lg font-bold text-gray-800 pt-2 border-t border-gray-200">
                        <span>Total</span>
                        <span>Rp ${order.total.toLocaleString("id-ID")}</span>
                    </div>
                </div>
            </div>
        </div>
    `;

  modal.classList.remove("hidden");
  modal.classList.add("flex");
};

// Update order status
window.updateOrderStatus = function (orderId, newStatus) {
  if (!newStatus) return;

  const order = allOrders.find((o) => o.orderId === orderId);
  if (!order) return;

  order.status = newStatus;
  localStorage.setItem("pharmahub-orders", JSON.stringify(allOrders));

  loadOrders();
  showToast(
    `Status pesanan ${orderId} diubah menjadi ${getStatusText(newStatus)}`,
    "success"
  );
};

// Delete order (admin)
window.deleteOrderAdmin = function (orderId) {
  if (!confirm(`Apakah Anda yakin ingin menghapus pesanan ${orderId}?`)) {
    return;
  }

  allOrders = allOrders.filter((o) => o.orderId !== orderId);
  localStorage.setItem("pharmahub-orders", JSON.stringify(allOrders));

  loadOrders();
  showToast("Pesanan berhasil dihapus", "success");
};

// Initialize page
document.addEventListener("DOMContentLoaded", function () {
  loadOrders();

  // Search
  const searchInput = document.getElementById("search-order");
  if (searchInput) {
    searchInput.addEventListener("input", function () {
      currentSearch = this.value;
      renderOrders();
    });
  }

  // Status filter
  const statusFilter = document.getElementById("status-filter");
  if (statusFilter) {
    statusFilter.addEventListener("change", function () {
      currentFilter = this.value;
      renderOrders();
    });
  }

  // Refresh button
  const refreshBtn = document.getElementById("refresh-btn");
  if (refreshBtn) {
    refreshBtn.addEventListener("click", function () {
      loadOrders();
      showToast("Data berhasil direfresh", "success");
    });
  }

  // Modal close
  const closeModal = document.getElementById("close-modal");
  const modal = document.getElementById("order-modal");
  if (closeModal && modal) {
    closeModal.addEventListener("click", function () {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
    });

    // Close on backdrop click
    modal.addEventListener("click", function (e) {
      if (e.target === modal) {
        modal.classList.add("hidden");
        modal.classList.remove("flex");
      }
    });
  }
});

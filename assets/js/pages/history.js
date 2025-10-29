/**
 * PharmaHub History Page JavaScript
 * File ini berisi logika khusus untuk halaman riwayat transaksi
 */

import { initializeMobileMenu } from "../components/utils.js";

// Global variables
let allOrders = [];
let currentFilter = "all";

// Load orders from localStorage
function loadOrders() {
  const ordersData = localStorage.getItem("pharmahub-orders");
  allOrders = ordersData ? JSON.parse(ordersData) : [];
  renderOrders();
  updateTabCounts();
}

// Render orders based on filter
function renderOrders() {
  const container = document.getElementById("history-container");
  const emptyState = document.getElementById("empty-state");

  // Filter orders based on current filter
  let filteredOrders = allOrders;
  if (currentFilter !== "all") {
    filteredOrders = allOrders.filter(
      (order) => order.status === currentFilter
    );
  }

  // Show empty state if no orders
  if (filteredOrders.length === 0) {
    container.innerHTML = "";
    emptyState.classList.remove("hidden");
    return;
  }

  // Hide empty state and render orders
  emptyState.classList.add("hidden");

  // Sort orders by date (newest first)
  filteredOrders.sort((a, b) => new Date(b.date) - new Date(a.date));

  container.innerHTML = filteredOrders
    .map((order) => {
      const statusConfig = getStatusConfig(order.status);
      const totalItems = order.items.reduce(
        (sum, item) => sum + item.quantity,
        0
      );

      return `
            <div class="bg-white rounded-lg shadow-md overflow-hidden">
                <div class="p-6">
                    <!-- Order Header -->
                    <div class="flex justify-between items-start mb-4">
                        <div>
                            <div class="flex items-center space-x-3 mb-2">
                                <h3 class="text-lg font-semibold text-gray-800">Order #${
                                  order.orderId
                                }</h3>
                                <span class="px-3 py-1 rounded-full text-xs font-semibold ${
                                  statusConfig.bgColor
                                } ${statusConfig.textColor}">
                                    <i class="${statusConfig.icon} mr-1"></i>${
        statusConfig.label
      }
                                </span>
                            </div>
                            <p class="text-sm text-gray-500">
                                <i class="far fa-calendar mr-2"></i>${formatDate(
                                  order.date
                                )}
                            </p>
                        </div>
                        <div class="text-right">
                            <p class="text-sm text-gray-500 mb-1">Total Pembayaran</p>
                            <p class="text-xl font-bold text-gray-800">${formatCurrency(
                              order.total
                            )}</p>
                        </div>
                    </div>
                    
                    <!-- Order Items Summary -->
                    <div class="border-t border-gray-200 pt-4 mb-4">
                        <p class="text-sm text-gray-600 mb-3">
                            <i class="fas fa-box mr-2"></i>${totalItems} item${
        totalItems > 1 ? "" : ""
      }
                        </p>
                        <div class="grid grid-cols-1 gap-3">
                            ${order.items
                              .slice(0, 2)
                              .map(
                                (item) => `
                                <div class="flex items-center space-x-3">
                                    <div class="w-12 h-12 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                                        <i class="fas fa-pills text-blue-500 text-lg"></i>
                                    </div>
                                    <div class="flex-1 min-w-0">
                                        <p class="text-sm font-medium text-gray-800 truncate">${
                                          item.name
                                        }</p>
                                        <p class="text-xs text-gray-500">${
                                          item.quantity
                                        }x ${formatCurrency(item.price)}</p>
                                    </div>
                                    <div class="text-sm font-semibold text-gray-800">
                                        ${formatCurrency(
                                          item.price * item.quantity
                                        )}
                                    </div>
                                </div>
                            `
                              )
                              .join("")}
                            ${
                              order.items.length > 2
                                ? `
                                <p class="text-sm text-blue-600 font-medium">
                                    +${order.items.length - 2} produk lainnya
                                </p>
                            `
                                : ""
                            }
                        </div>
                    </div>
                    
                    <!-- Order Actions -->
                    <div class="flex items-center justify-between pt-4 border-t border-gray-200">
                        <div class="text-sm text-gray-600">
                            <i class="fas fa-shipping-fast mr-2"></i>
                            ${order.shippingMethod || "Pengiriman Standar"}
                        </div>
                        <div class="flex space-x-2">
                            <button 
                                onclick="viewOrderDetail('${order.orderId}')"
                                class="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition"
                            >
                                <i class="fas fa-eye mr-1"></i>Detail
                            </button>
                            ${
                              order.status === "completed"
                                ? `
                                <button 
                                    class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition"
                                >
                                    <i class="fas fa-redo mr-1"></i>Beli Lagi
                                </button>
                            `
                                : ""
                            }
                        </div>
                    </div>
                </div>
            </div>
        `;
    })
    .join("");
}

// Get status configuration
function getStatusConfig(status) {
  const configs = {
    completed: {
      label: "Selesai",
      icon: "fas fa-check-circle",
      bgColor: "bg-green-100",
      textColor: "text-green-700",
    },
    processing: {
      label: "Diproses",
      icon: "fas fa-clock",
      bgColor: "bg-yellow-100",
      textColor: "text-yellow-700",
    },
    cancelled: {
      label: "Dibatalkan",
      icon: "fas fa-times-circle",
      bgColor: "bg-red-100",
      textColor: "text-red-700",
    },
    shipped: {
      label: "Dikirim",
      icon: "fas fa-truck",
      bgColor: "bg-blue-100",
      textColor: "text-blue-700",
    },
  };
  return configs[status] || configs["processing"];
}

// Update tab counts
function updateTabCounts() {
  const counts = {
    all: allOrders.length,
    completed: allOrders.filter((o) => o.status === "completed").length,
    processing: allOrders.filter((o) => o.status === "processing").length,
    cancelled: allOrders.filter((o) => o.status === "cancelled").length,
  };

  // Update each tab's count badge
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    const tab = btn.dataset.tab;
    const badge = btn.querySelector("span");
    if (badge && counts[tab] !== undefined) {
      badge.textContent = counts[tab];
    }
  });
}

// Format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

// Format date
function formatDate(dateString) {
  const date = new Date(dateString);
  const options = {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return date.toLocaleDateString("id-ID", options);
}

// View order detail
window.viewOrderDetail = function (orderId) {
  const order = allOrders.find((o) => o.orderId === orderId);
  if (!order) return;

  // Create modal or navigate to detail page
  alert(
    `Detail pesanan ${orderId} akan ditampilkan di sini.\n\nTotal: ${formatCurrency(
      order.total
    )}\nStatus: ${order.status}\nJumlah item: ${order.items.length}`
  );
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
  // Initialize mobile menu
  initializeMobileMenu();

  // Initialize tabs
  initTabs();

  // Load orders
  loadOrders();
});

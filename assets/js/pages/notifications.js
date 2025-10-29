/**
 * PharmaHub Notifications Page JavaScript
 * File ini berisi logika khusus untuk halaman notifikasi
 */

import { initializeMobileMenu, formatCurrency } from "../components/utils.js";

let notifications = [];
let currentFilter = "all";

// Load notifications from localStorage
function loadNotifications() {
  notifications =
    JSON.parse(localStorage.getItem("pharmahub-notifications")) || [];
  renderNotifications();
  updateTabCounts();
  updateButtons();
}

// Render notifications
function renderNotifications() {
  const container = document.getElementById("notifications-container");
  const emptyState = document.getElementById("empty-state");
  if (!container || !emptyState) return;

  // Filter notifications
  let filtered = notifications;
  if (currentFilter === "orders") {
    filtered = notifications.filter((n) => n.type === "order");
  } else if (currentFilter === "promotions") {
    filtered = notifications.filter((n) => n.type === "promotion");
  } else if (currentFilter === "system") {
    filtered = notifications.filter((n) => n.type === "system");
  }

  if (filtered.length === 0) {
    container.innerHTML = "";
    emptyState.classList.remove("hidden");
    return;
  }

  // Hide empty state and render notifications
  emptyState.classList.add("hidden");

  // Render notifications list
  container.innerHTML = filtered
    .map(
      (notif) => `
        <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition ${
          !notif.read ? "border-l-4 border-blue-500" : ""
        }" data-id="${notif.id}">
            <div class="p-6">
                <div class="flex items-start space-x-4">
                    <div class="flex-shrink-0">
                        <div class="w-12 h-12 rounded-full flex items-center justify-center ${
                          notif.type === "order"
                            ? "bg-blue-100"
                            : notif.type === "promotion"
                            ? "bg-green-100"
                            : "bg-purple-100"
                        }">
                            <i class="fas ${
                              notif.type === "order"
                                ? "fa-shopping-bag text-blue-600"
                                : notif.type === "promotion"
                                ? "fa-tags text-green-600"
                                : "fa-info-circle text-purple-600"
                            } text-xl"></i>
                        </div>
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="flex items-start justify-between mb-2">
                            <div class="flex-1">
                                <h3 class="text-base font-semibold text-gray-800 flex items-center">
                                    ${notif.title}
                                    ${
                                      !notif.read
                                        ? '<span class="ml-2 w-2 h-2 bg-blue-500 rounded-full"></span>'
                                        : ""
                                    }
                                </h3>
                                <p class="text-sm text-gray-600 mt-1">${
                                  notif.message
                                }</p>
                            </div>
                        </div>
                        
                        <div class="flex items-center justify-between mt-3">
                            <div class="flex items-center space-x-4 text-xs text-gray-500">
                                <span>
                                    <i class="far fa-clock mr-1"></i>${formatDate(
                                      notif.date
                                    )}
                                </span>
                                ${
                                  notif.orderId
                                    ? `
                                    <span>
                                        <i class="fas fa-receipt mr-1"></i>Order #${notif.orderId}
                                    </span>
                                `
                                    : ""
                                }
                            </div>
                            
                            <div class="flex items-center space-x-2">
                                ${
                                  !notif.read
                                    ? `
                                    <button 
                                        onclick="markAsRead('${notif.id}')"
                                        class="text-xs text-blue-600 hover:text-blue-800 font-medium"
                                        title="Tandai dibaca"
                                    >
                                        <i class="fas fa-check"></i>
                                    </button>
                                `
                                    : ""
                                }
                                <button 
                                    onclick="deleteNotification('${notif.id}')"
                                    class="text-xs text-red-600 hover:text-red-800 font-medium"
                                    title="Hapus"
                                >
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                        
                        ${
                          notif.orderId
                            ? `
                            <div class="mt-3 pt-3 border-t border-gray-200">
                                <a href="riwayat.html" class="text-sm text-blue-600 hover:text-blue-800 font-medium">
                                    Lihat Detail Pesanan <i class="fas fa-arrow-right ml-1"></i>
                                </a>
                            </div>
                        `
                            : ""
                        }
                    </div>
                </div>
            </div>
        </div>
    `
    )
    .join("");
}

// Format date
function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Baru saja";
  if (minutes < 60) return `${minutes} menit yang lalu`;
  if (hours < 24) return `${hours} jam yang lalu`;
  if (days < 7) return `${days} hari yang lalu`;

  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// Update tab counts
function updateTabCounts() {
  const allCount = notifications.length;
  const ordersCount = notifications.filter((n) => n.type === "order").length;
  const promotionsCount = notifications.filter(
    (n) => n.type === "promotion"
  ).length;
  const systemCount = notifications.filter((n) => n.type === "system").length;

  document.querySelector('[data-tab="all"] span').textContent = allCount;
  document.querySelector('[data-tab="orders"] span').textContent = ordersCount;
  document.querySelector('[data-tab="promotions"] span').textContent =
    promotionsCount;
  document.querySelector('[data-tab="system"] span').textContent = systemCount;
}

// Update buttons
function updateButtons() {
  const markAllReadBtn = document.getElementById("mark-all-read");
  const clearAllBtn = document.getElementById("clear-all");

  const hasUnread = notifications.some((n) => !n.read);
  const hasNotifications = notifications.length > 0;

  if (markAllReadBtn) {
    markAllReadBtn.disabled = !hasUnread;
  }
  if (clearAllBtn) {
    clearAllBtn.disabled = !hasNotifications;
  }
}

// Mark as read
function markAsRead(id) {
  const notif = notifications.find((n) => n.id === id);
  if (notif) {
    notif.read = true;
    localStorage.setItem(
      "pharmahub-notifications",
      JSON.stringify(notifications)
    );
    loadNotifications();
  }
}

// Delete notification
function deleteNotification(id) {
  if (confirm("Hapus notifikasi ini?")) {
    notifications = notifications.filter((n) => n.id !== id);
    localStorage.setItem(
      "pharmahub-notifications",
      JSON.stringify(notifications)
    );
    loadNotifications();
  }
}

// Mark all as read
function markAllAsRead() {
  notifications.forEach((n) => (n.read = true));
  localStorage.setItem(
    "pharmahub-notifications",
    JSON.stringify(notifications)
  );
  loadNotifications();
}

// Clear all notifications
function clearAllNotifications() {
  if (confirm("Hapus semua notifikasi?")) {
    notifications = [];
    localStorage.removeItem("pharmahub-notifications");
    loadNotifications();
  }
}

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

      // Filter notifications based on the selected tab
      currentFilter = this.dataset.tab;
      renderNotifications();
    });
  });
}

// Initialize notifications functionality
function initializeNotifications() {
  const markAllReadBtn = document.getElementById("mark-all-read");
  const clearAllBtn = document.getElementById("clear-all");

  if (markAllReadBtn) {
    markAllReadBtn.addEventListener("click", markAllAsRead);
  }

  if (clearAllBtn) {
    clearAllBtn.addEventListener("click", clearAllNotifications);
  }
}

// Make functions globally accessible
window.markAsRead = markAsRead;
window.deleteNotification = deleteNotification;

// Initialize page
document.addEventListener("DOMContentLoaded", function () {
  // Initialize mobile menu
  initializeMobileMenu();

  // Initialize tabs
  initTabs();

  // Initialize notifications
  initializeNotifications();

  // Load notifications
  loadNotifications();
});

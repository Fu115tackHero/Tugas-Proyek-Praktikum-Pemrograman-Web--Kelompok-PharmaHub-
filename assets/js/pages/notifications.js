/**
 * PharmaHub Notifications Page JavaScript
 * File ini berisi logika khusus untuk halaman notifikasi
 */

import { initializeMobileMenu, showToast } from "../components/utils.js";

let allNotifications = [];
let currentFilter = "all";

// Load notifications from localStorage
function loadNotifications() {
  allNotifications =
    JSON.parse(localStorage.getItem("pharmahub-notifications")) || [];
  updateTabCounts();
  updateButtonStates();
  renderNotifications();
  updateNotificationCount();
}

// Update tab counts
function updateTabCounts() {
  const allCount = allNotifications.length;
  const ordersCount = allNotifications.filter((n) => n.type === "order").length;
  const promotionsCount = allNotifications.filter(
    (n) => n.type === "promo"
  ).length;
  const systemCount = allNotifications.filter(
    (n) => n.type === "info" || n.type === "warning"
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
      case "orders":
        count = ordersCount;
        break;
      case "promotions":
        count = promotionsCount;
        break;
      case "system":
        count = systemCount;
        break;
    }

    badge.textContent = count;
  });
}

// Update button states (enable/disable)
function updateButtonStates() {
  const markAllReadBtn = document.getElementById("mark-all-read");
  const clearAllBtn = document.getElementById("clear-all");

  if (markAllReadBtn) {
    markAllReadBtn.disabled = allNotifications.length === 0;
  }

  if (clearAllBtn) {
    clearAllBtn.disabled = allNotifications.length === 0;
  }
}

// Render notifications based on filter
function renderNotifications() {
  const notificationsContainer = document.getElementById(
    "notifications-container"
  );
  const emptyState = document.getElementById("empty-state");

  if (!notificationsContainer) return;

  let filteredNotifications = allNotifications;

  // Filter by type - map tab values to notification types
  if (currentFilter !== "all") {
    if (currentFilter === "orders") {
      filteredNotifications = allNotifications.filter(
        (notif) => notif.type === "order"
      );
    } else if (currentFilter === "promotions") {
      filteredNotifications = allNotifications.filter(
        (notif) => notif.type === "promo"
      );
    } else if (currentFilter === "system") {
      filteredNotifications = allNotifications.filter(
        (notif) => notif.type === "info" || notif.type === "warning"
      );
    }
  }

  if (filteredNotifications.length === 0) {
    notificationsContainer.innerHTML = "";
    notificationsContainer.classList.add("hidden");
    if (emptyState) {
      emptyState.classList.remove("hidden");
    }
    return;
  }

  // Show notifications, hide empty state
  notificationsContainer.classList.remove("hidden");
  if (emptyState) {
    emptyState.classList.add("hidden");
  }

  notificationsContainer.innerHTML = filteredNotifications
    .map(
      (notif) => `
        <div class="bg-white rounded-lg shadow-md p-4 mb-3 ${
          !notif.read ? "border-l-4 border-blue-500 bg-blue-50" : ""
        }">
            <div class="flex justify-between items-start">
                <div class="flex-1">
                    <div class="flex items-center mb-2">
                        <i class="fas ${getNotificationIcon(
                          notif.type
                        )} text-${getNotificationColor(
        notif.type
      )}-600 mr-2"></i>
                        <h3 class="text-lg font-semibold text-gray-800">${
                          notif.title
                        }</h3>
                        ${
                          !notif.read
                            ? '<span class="ml-2 px-2 py-1 bg-blue-600 text-white text-xs rounded-full">Baru</span>'
                            : ""
                        }
                    </div>
                    <p class="text-gray-600 mb-2">${notif.message}</p>
                    <p class="text-sm text-gray-500">
                        <i class="far fa-clock mr-1"></i>
                        ${formatDate(notif.date)}
                    </p>
                    ${
                      notif.orderId
                        ? `
                        <a href="riwayat.html" class="text-blue-600 hover:text-blue-800 text-sm font-medium mt-2 inline-block">
                            <i class="fas fa-eye mr-1"></i> Lihat Detail Pesanan
                        </a>
                    `
                        : ""
                    }
                </div>
                <div class="flex space-x-2">
                    ${
                      !notif.read
                        ? `
                        <button onclick="window.markAsRead('${notif.id}')" class="text-blue-600 hover:text-blue-800" title="Tandai sudah dibaca">
                            <i class="fas fa-check"></i>
                        </button>
                    `
                        : ""
                    }
                    <button onclick="window.deleteNotification('${
                      notif.id
                    }')" class="text-red-600 hover:text-red-800" title="Hapus notifikasi">
                        <i class="fas fa-trash"></i>
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
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Baru saja";
  if (diffMins < 60) return `${diffMins} menit yang lalu`;
  if (diffHours < 24) return `${diffHours} jam yang lalu`;
  if (diffDays < 7) return `${diffDays} hari yang lalu`;

  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return date.toLocaleDateString("id-ID", options);
}

function getNotificationIcon(type) {
  const iconMap = {
    order: "fa-shopping-bag",
    promo: "fa-tags",
    info: "fa-info-circle",
    warning: "fa-exclamation-triangle",
  };
  return iconMap[type] || "fa-bell";
}

function getNotificationColor(type) {
  const colorMap = {
    order: "blue",
    promo: "green",
    info: "blue",
    warning: "yellow",
  };
  return colorMap[type] || "gray";
}

// Update notification count
function updateNotificationCount() {
  const unreadCount = allNotifications.filter((n) => !n.read).length;
  const countBadges = document.querySelectorAll(".notification-count");

  countBadges.forEach((badge) => {
    if (unreadCount > 0) {
      badge.textContent = unreadCount;
      badge.classList.remove("hidden");
    } else {
      badge.classList.add("hidden");
    }
  });
}

// Mark notification as read
window.markAsRead = function (notifId) {
  const notif = allNotifications.find((n) => n.id === notifId);
  if (notif) {
    notif.read = true;
    localStorage.setItem(
      "pharmahub-notifications",
      JSON.stringify(allNotifications)
    );
    updateTabCounts();
    updateButtonStates();
    renderNotifications();
    updateNotificationCount();
    showToast("Notifikasi ditandai sudah dibaca", "success");
  }
};

// Delete notification
window.deleteNotification = function (notifId) {
  if (!confirm("Apakah Anda yakin ingin menghapus notifikasi ini?")) {
    return;
  }

  allNotifications = allNotifications.filter((n) => n.id !== notifId);
  localStorage.setItem(
    "pharmahub-notifications",
    JSON.stringify(allNotifications)
  );
  updateTabCounts();
  updateButtonStates();
  renderNotifications();
  updateNotificationCount();
  showToast("Notifikasi berhasil dihapus", "success");
};

// Mark all as read
function markAllAsRead() {
  if (allNotifications.length === 0) {
    return;
  }

  allNotifications.forEach((notif) => (notif.read = true));
  localStorage.setItem(
    "pharmahub-notifications",
    JSON.stringify(allNotifications)
  );
  updateTabCounts();
  updateButtonStates();
  renderNotifications();
  updateNotificationCount();
  showToast("Semua notifikasi ditandai sudah dibaca", "success");
}

// Clear all notifications
function clearAllNotifications() {
  if (allNotifications.length === 0) {
    return;
  }

  if (!confirm("Apakah Anda yakin ingin menghapus semua notifikasi?")) {
    return;
  }

  allNotifications = [];
  localStorage.setItem(
    "pharmahub-notifications",
    JSON.stringify(allNotifications)
  );
  updateTabCounts();
  updateButtonStates();
  renderNotifications();
  updateNotificationCount();
  showToast("Semua notifikasi berhasil dihapus", "success");
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

// Initialize page
document.addEventListener("DOMContentLoaded", function () {
  initializeMobileMenu();
  initTabs();
  initializeNotifications();
  loadNotifications();
});

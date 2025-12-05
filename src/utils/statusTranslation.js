/**
 * Utility functions for translating order and payment status to Bahasa Indonesia
 */

/**
 * Translate order status from English to Bahasa Indonesia
 * @param {string} status - Order status in English
 * @returns {string} - Translated status in Bahasa Indonesia
 */
export function translateOrderStatus(status) {
  if (!status) return "-";

  const statusMap = {
    pending: "Menunggu",
    confirmed: "Dikonfirmasi",
    preparing: "Diproses",
    ready: "Siap",
    delivered: "Dikirim",
    completed: "Selesai",
    cancelled: "Dibatalkan",
  };

  return statusMap[status.toLowerCase()] || status;
}

/**
 * Translate payment status from English to Bahasa Indonesia
 * @param {string} status - Payment status in English or Indonesian
 * @returns {string} - Translated status in Bahasa Indonesia
 */
export function translatePaymentStatus(status) {
  if (!status) return "-";

  const statusMap = {
    // English status
    pending: "Menunggu Pembayaran",
    paid: "Dibayar",
    cancelled: "Dibatalkan",
    failed: "Gagal",
    refunded: "Dikembalikan",
    unpaid: "Belum Dibayar",
    // Indonesian status (untuk konsistensi jika backend sudah menggunakan bahasa Indonesia)
    dibayar: "Dibayar",
    belum_dibayar: "Belum Dibayar",
  };

  return statusMap[status.toLowerCase()] || status;
}

/**
 * Get status color class for UI
 * @param {string} status - Order or payment status
 * @returns {string} - Tailwind CSS color class
 */
export function getStatusColor(status) {
  if (!status) return "bg-gray-100 text-gray-800";

  const colorMap = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-blue-100 text-blue-800",
    preparing: "bg-indigo-100 text-indigo-800",
    ready: "bg-purple-100 text-purple-800",
    delivered: "bg-cyan-100 text-cyan-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
    paid: "bg-green-100 text-green-800",
    dibayar: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-800",
    refunded: "bg-orange-100 text-orange-800",
    unpaid: "bg-yellow-100 text-yellow-800",
    belum_dibayar: "bg-yellow-100 text-yellow-800",
  };

  return colorMap[status.toLowerCase()] || "bg-gray-100 text-gray-800";
}

/**
 * Get status icon for UI
 * @param {string} status - Order status
 * @returns {string} - FontAwesome icon class
 */
export function getStatusIcon(status) {
  if (!status) return "fa-circle";

  const iconMap = {
    pending: "fa-clock",
    confirmed: "fa-check-circle",
    preparing: "fa-spinner",
    ready: "fa-box",
    delivered: "fa-truck",
    completed: "fa-check-double",
    cancelled: "fa-times-circle",
  };

  return iconMap[status.toLowerCase()] || "fa-circle";
}

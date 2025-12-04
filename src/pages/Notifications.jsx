import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import NotificationService from "../services/notification.service";

const Notifications = () => {
  const { getToken } = useAuth();
  const [activeTab, setActiveTab] = useState("all");
  const [notifications, setNotifications] = useState([]);
  const [selectedNotif, setSelectedNotif] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getToken();
      if (!token) {
        setError("Please login to view notifications");
        setNotifications([]);
        return;
      }
      const result = await NotificationService.getNotifications(token);
      if (result.success) {
        setNotifications(result.notifications || []);
      } else {
        setError(result.message || "Failed to load notifications");
      }
    } catch (err) {
      console.error("Error loading notifications:", err);
      setError("Gagal memuat notifikasi");
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const normalizeType = (t) => {
    if (!t) return "other";
    if (t === "order" || t === "pesanan") return "orders";
    if (t === "promotion" || t === "promo") return "promotions";
    if (t === "system" || t === "info") return "system";
    return "other";
  };

  const normalizedNotifications = notifications.map((n) => ({
    ...n,
    _tabType: normalizeType(n.type),
  }));

  const counts = {
    all: normalizedNotifications.length,
    orders: normalizedNotifications.filter((n) => n._tabType === "orders")
      .length,
    promotions: normalizedNotifications.filter(
      (n) => n._tabType === "promotions"
    ).length,
    system: normalizedNotifications.filter((n) => n._tabType === "system")
      .length,
  };

  const handleMarkAllRead = async () => {
    if (notifications.length === 0) return;
    try {
      const token = getToken();
      if (!token) return;
      await NotificationService.markAllAsRead(token);
      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          is_read: true,
          read_at: new Date().toISOString(),
        }))
      );
    } catch (err) {
      console.error("Error marking all as read:", err);
      alert("Gagal menandai semua notifikasi sebagai dibaca");
    }
  };

  const handleClearAll = async () => {
    if (
      !confirm("Hapus semua notifikasi? Tindakan ini tidak dapat dibatalkan.")
    )
      return;
    try {
      const token = getToken();
      if (!token) return;
      for (const notif of notifications) {
        await NotificationService.deleteNotification(
          notif.notification_id,
          token
        );
      }
      setNotifications([]);
    } catch (err) {
      console.error("Error clearing notifications:", err);
      alert("Gagal menghapus notifikasi");
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      const token = getToken();
      if (!token) return;
      await NotificationService.archiveNotification(notificationId, token);
      setNotifications((prev) =>
        prev.filter((n) => n.notification_id !== notificationId)
      );
    } catch (err) {
      console.error("Error deleting notification:", err);
      alert("Gagal menghapus notifikasi");
    }
  };

  const handleDeleteAll = async () => {
    if (
      !confirm(
        "Hapus semua notifikasi? Notifikasi akan dihapus dari daftar Anda."
      )
    )
      return;
    try {
      const token = getToken();
      if (!token) return;
      const result = await NotificationService.archiveAllNotifications(token);
      if (result.success) {
        setNotifications([]);
        alert(
          `Berhasil menghapus ${result.data?.archivedCount || 0} notifikasi`
        );
      }
    } catch (err) {
      console.error("Error deleting all notifications:", err);
      alert("Gagal menghapus notifikasi");
    }
  };

  const handleDeleteRead = async () => {
    if (
      !confirm(
        "Hapus semua notifikasi yang sudah dibaca? Notifikasi akan dihapus dari daftar Anda."
      )
    )
      return;
    try {
      const token = getToken();
      if (!token) return;
      const result = await NotificationService.archiveReadNotifications(token);
      if (result.success) {
        setNotifications((prev) => prev.filter((n) => !n.is_read));
        alert(
          `Berhasil menghapus ${result.data?.archivedCount || 0} notifikasi`
        );
      }
    } catch (err) {
      console.error("Error deleting read notifications:", err);
      alert("Gagal menghapus notifikasi");
    }
  };

  const handleViewDetail = async (notif) => {
    setSelectedNotif(notif);
    setShowPreviewModal(true);
    if (!notif.is_read) {
      try {
        const token = getToken();
        if (!token) return;
        await NotificationService.markAsRead(notif.notification_id, token);
        setNotifications((prev) =>
          prev.map((n) =>
            n.notification_id === notif.notification_id
              ? { ...n, is_read: true, read_at: new Date().toISOString() }
              : n
          )
        );
      } catch (err) {
        console.error("Error marking notification as read:", err);
      }
    }
  };

  const filteredNotifications = normalizedNotifications.filter(
    (n) => activeTab === "all" || n._tabType === activeTab
  );

  return (
    <main className="container mx-auto px-4 py-8 min-h-screen bg-gray-50">
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Notifikasi
            </h1>
            <p className="text-gray-600">
              Lihat semua notifikasi terbaru dari PharmaHub
            </p>
          </div>
          <div className="flex items-center space-x-2 flex-wrap">
            <button
              className="px-3 py-2 text-sm text-blue-600 hover:text-blue-800 transition disabled:text-gray-400 disabled:cursor-not-allowed"
              disabled={notifications.length === 0}
              onClick={handleMarkAllRead}
            >
              <i className="fas fa-check-double mr-1"></i>Tandai Dibaca
            </button>
            <button
              className="px-3 py-2 text-sm text-red-600 hover:text-red-800 transition disabled:text-gray-400 disabled:cursor-not-allowed"
              disabled={notifications.length === 0}
              onClick={handleDeleteAll}
              title="Hapus semua notifikasi"
            >
              <i className="fas fa-trash mr-1"></i>Hapus Semua
            </button>
            <button
              className="px-3 py-2 text-sm text-red-600 hover:text-red-800 transition disabled:text-gray-400 disabled:cursor-not-allowed"
              disabled={notifications.filter((n) => n.is_read).length === 0}
              onClick={handleDeleteRead}
              title="Hapus notifikasi yang sudah dibaca"
            >
              <i className="fas fa-trash mr-1"></i>Hapus Dibaca
            </button>
          </div>
        </div>
      </div>

      {loading && (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat notifikasi...</p>
        </div>
      )}

      {!loading && error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <i className="fas fa-exclamation-circle text-red-500 text-4xl mb-4"></i>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={loadNotifications}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <i className="fas fa-redo mr-2"></i>Coba Lagi
          </button>
        </div>
      )}

      {!loading && !error && (
        <div>
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 overflow-x-auto">
                {[
                  { key: "all", label: "Semua", count: counts.all },
                  { key: "orders", label: "Pesanan", count: counts.orders },
                  {
                    key: "promotions",
                    label: "Promosi",
                    count: counts.promotions,
                  },
                  { key: "system", label: "Sistem", count: counts.system },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                      activeTab === tab.key
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {tab.label}
                    <span
                      className={`ml-2 px-2 py-1 rounded-full text-xs ${
                        activeTab === tab.key
                          ? "bg-blue-100 text-blue-600"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md">
            {notifications.length === 0 ? (
              <div className="text-center py-16 px-6">
                <div className="mb-6">
                  <i className="fas fa-bell-slash text-6xl text-gray-300"></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  Belum Ada Notifikasi
                </h3>
                <p className="text-gray-500 mb-6">
                  Notifikasi Anda akan muncul di sini. Kami akan memberitahu
                  Anda tentang:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
                  <div className="flex flex-col items-center p-4 bg-blue-50 rounded-lg">
                    <i className="fas fa-shopping-bag text-blue-500 text-2xl mb-2"></i>
                    <span className="text-sm text-blue-700 font-medium">
                      Status Pesanan
                    </span>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-green-50 rounded-lg">
                    <i className="fas fa-tags text-green-500 text-2xl mb-2"></i>
                    <span className="text-sm text-green-700 font-medium">
                      Promo & Diskon
                    </span>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-purple-50 rounded-lg">
                    <i className="fas fa-info-circle text-purple-500 text-2xl mb-2"></i>
                    <span className="text-sm text-purple-700 font-medium">
                      Info Penting
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  <Link
                    to="/products"
                    className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
                  >
                    <i className="fas fa-shopping-cart mr-2"></i>Mulai Belanja
                  </Link>
                  <p className="text-sm text-gray-500">
                    Atau kembali ke{" "}
                    <Link
                      to="/"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      beranda
                    </Link>
                  </p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredNotifications.length === 0 ? (
                  <div className="py-10 text-center text-gray-500">
                    Tidak ada notifikasi untuk filter ini.
                  </div>
                ) : (
                  filteredNotifications.map((notif) => (
                    <div
                      key={notif.notification_id}
                      className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between hover:bg-blue-50 transition"
                    >
                      <div
                        className="flex-1 cursor-pointer"
                        onClick={() => handleViewDetail(notif)}
                      >
                        <p className="text-sm font-semibold text-gray-800 mb-1">
                          {notif.title ||
                            (notif._tabType === "orders"
                              ? "Status Pesanan"
                              : "Notifikasi")}
                        </p>
                        <p className="text-sm text-gray-600 mb-1">
                          {notif.message}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(notif.created_at).toLocaleString("id-ID", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <div className="mt-3 sm:mt-0 flex items-center space-x-2">
                        {notif.order_number && (
                          <span className="inline-flex px-2 py-1 rounded-full text-xs font-mono bg-gray-100 text-gray-600">
                            #{notif.order_number}
                          </span>
                        )}
                        {!notif.is_read && (
                          <span className="inline-flex px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                            Baru
                          </span>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNotification(notif.notification_id);
                          }}
                          className="px-2 py-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition text-sm"
                          title="Hapus notifikasi ini"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                        <button
                          onClick={() => handleViewDetail(notif)}
                          className="text-blue-600 hover:text-blue-800 font-semibold text-sm"
                        >
                          <i className="fas fa-chevron-right"></i>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {showPreviewModal && selectedNotif && selectedNotif.orderDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">Detail Notifikasi</h2>
                <p className="text-blue-100 text-sm">
                  {selectedNotif.order_number
                    ? `Pesanan #${selectedNotif.order_number}`
                    : selectedNotif.title}
                </p>
              </div>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="text-white hover:bg-blue-800 p-2 rounded-full transition"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-600 font-medium">
                      Waktu Pemesanan
                    </p>
                    <p className="text-sm font-semibold text-gray-800">
                      {new Date(selectedNotif.createdAt).toLocaleString(
                        "id-ID",
                        {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-medium">Status</p>
                    <p className="text-sm font-semibold text-blue-600">
                      {selectedNotif.status}
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">
                  <i className="fas fa-user-circle text-blue-600 mr-2"></i>
                  Informasi Pemesan
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium text-gray-700">Nama:</span>{" "}
                    {selectedNotif.orderDetails.customerName}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium text-gray-700">Telepon:</span>{" "}
                    {selectedNotif.orderDetails.customerPhone}
                  </p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">
                  <i className="fas fa-shopping-bag text-blue-600 mr-2"></i>
                  Produk Pesanan
                </h3>
                <div className="space-y-3">
                  {selectedNotif.orderDetails.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex gap-4 bg-gray-50 p-3 rounded-lg"
                    >
                      <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden flex items-center justify-center">
                        <img
                          src={
                            item.image?.startsWith("http") ||
                            item.image?.startsWith("/")
                              ? item.image
                              : item.image
                              ? `/images/allproducts/${item.image}`
                              : 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23eee" width="100" height="100"/%3E%3C/svg%3E'
                          }
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.parentElement.innerHTML =
                              '<i class="fas fa-image text-gray-400 text-2xl"></i>';
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">
                          {item.name}
                        </p>
                        <div className="flex justify-between items-end mt-2">
                          <div>
                            <p className="text-xs text-gray-600">Jumlah</p>
                            <p className="font-semibold text-gray-800">
                              {item.quantity}x
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-600">
                              Harga Satuan
                            </p>
                            <p className="font-semibold text-gray-800">
                              Rp {(item.price || 0).toLocaleString("id-ID")}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {selectedNotif.orderDetails.notes && (
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">
                    <i className="fas fa-sticky-note text-blue-600 mr-2"></i>
                    Catatan Pesanan
                  </h3>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-sm text-gray-700">
                      {selectedNotif.orderDetails.notes}
                    </p>
                  </div>
                </div>
              )}
              {selectedNotif.orderDetails.adminNotes && (
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">
                    <i className="fas fa-comment-dots text-orange-600 mr-2"></i>
                    Pesan dari Admin
                  </h3>
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                    <p className="text-sm text-gray-700">
                      {selectedNotif.orderDetails.adminNotes}
                    </p>
                  </div>
                </div>
              )}
              <div className="border-t pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium text-gray-800">
                      Rp{" "}
                      {(
                        Number(selectedNotif.orderDetails.subtotal) || 0
                      ).toLocaleString("id-ID")}
                    </span>
                  </div>
                  {Number(selectedNotif.orderDetails.discount) > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Diskon</span>
                      <span className="font-medium">
                        -Rp{" "}
                        {(
                          Number(selectedNotif.orderDetails.discount) || 0
                        ).toLocaleString("id-ID")}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Pajak (PPN 10%)</span>
                    <span className="font-medium text-gray-800">
                      Rp{" "}
                      {(
                        Number(selectedNotif.orderDetails.tax) || 0
                      ).toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total</span>
                    <span className="text-blue-600">
                      Rp{" "}
                      {(
                        Number(selectedNotif.orderDetails.total) || 0
                      ).toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
              >
                <i className="fas fa-check mr-2"></i>Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Notifications;

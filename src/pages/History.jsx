import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import OrderService from "../services/order.service";
import { waitForGoogleMaps } from "../utils/googleMapsLoader";
import AlertModal from "../components/AlertModal";
import ConfirmModal from "../components/ConfirmModal";
import { useAlert } from "../hooks/useAlert";
import {
  translateOrderStatus,
  translatePaymentStatus,
  getStatusColor,
} from "../utils/statusTranslation";
import PaymentService from "../services/payment.service";

const History = () => {
  const { getToken } = useAuth();
  const { alertState, showAlert, hideAlert } = useAlert();
  const [activeTab, setActiveTab] = useState("all");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trackingEnabled, setTrackingEnabled] = useState(false);
  const [trackingError, setTrackingError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "warning",
    onConfirm: null,
    confirmText: "Konfirmasi",
    showInput: false,
    inputValue: "",
  });
  const mapRef = useRef(null);
  const userMarkerRef = useRef(null);
  const pharmacyMarkerRef = useRef(null);
  const watchIdRef = useRef(null);

  useEffect(() => {
    loadOrders();

    // Check for payment status from URL query params
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get("payment");

    if (paymentStatus) {
      // Remove query params from URL
      window.history.replaceState({}, "", "/history");

      // Show alert based on payment status
      setTimeout(() => {
        if (paymentStatus === "success") {
          showAlert(
            "Pembayaran berhasil! Status pesanan Anda telah diperbarui.",
            "success"
          );
        } else if (paymentStatus === "pending") {
          showAlert(
            "Pembayaran sedang diproses. Silakan tunggu konfirmasi.",
            "info"
          );
        } else if (paymentStatus === "error") {
          showAlert(
            "Pembayaran gagal atau dibatalkan. Silakan coba lagi.",
            "error"
          );
        }
        // Reload orders to get updated status
        loadOrders();
      }, 500);
    }
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getToken();

      if (!token) {
        setError("Please login to view order history");
        setOrders([]);
        setLoading(false);
        return;
      }

      const result = await OrderService.getOrders(token);

      if (result.success) {
        // Fetch items for each order
        const ordersWithItems = await Promise.all(
          (result.orders || []).map(async (order) => {
            try {
              const detailResult = await OrderService.getOrderById(
                order.order_id,
                token
              );
              if (detailResult.success && detailResult.order) {
                return {
                  ...order,
                  items: detailResult.order.items || [],
                };
              }
              return { ...order, items: [] };
            } catch (err) {
              console.error(
                `Error fetching items for order ${order.order_id}:`,
                err
              );
              return { ...order, items: [] };
            }
          })
        );
        setOrders(ordersWithItems);
      } else {
        setError(result.message || "Failed to load orders");
      }
    } catch (error) {
      console.error("Error loading orders:", error);
      setError("Gagal memuat riwayat pesanan");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!trackingEnabled) {
      if (watchIdRef.current && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      return;
    }

    if (!navigator.geolocation) {
      setTrackingError("Browser Anda tidak mendukung fitur lokasi (GPS).");
      return;
    }

    const initializeMap = async () => {
      try {
        // Wait for Google Maps to load
        await waitForGoogleMaps(15000);

        const mapElement = document.getElementById("live-tracking-map");
        if (!mapElement) {
          setTrackingError("Area peta tidak ditemukan.");
          return;
        }

        const pharmacyAddress =
          "Gedung C Fasilkom-TI, Universitas Sumatera Utara, Jl. Alumni No.3, Padang Bulan, Kec. Medan Baru, Kota Medan, Sumatera Utara 20155";

        let map = mapRef.current;
        if (!map) {
          map = new window.google.maps.Map(mapElement, {
            center: { lat: 0, lng: 0 },
            zoom: 14,
          });

          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode({ address: pharmacyAddress }, (results, status) => {
            if (status === "OK" && results[0]) {
              const location = results[0].geometry.location;
              pharmacyMarkerRef.current = new window.google.maps.Marker({
                position: location,
                map,
                title: "Lokasi Apotek",
              });
              map.setCenter(location);
            } else {
              console.warn("Gagal geocode alamat apotek:", status);
            }
          });

          mapRef.current = map;
        }

        const successHandler = (position) => {
          const userPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          if (!userMarkerRef.current) {
            userMarkerRef.current = new window.google.maps.Marker({
              position: userPos,
              map,
              title: "Posisi Anda",
              icon: {
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 6,
                fillColor: "#2563eb",
                fillOpacity: 1,
                strokeColor: "#ffffff",
                strokeWeight: 2,
              },
            });
          } else {
            userMarkerRef.current.setPosition(userPos);
          }

          const bounds = new window.google.maps.LatLngBounds();
          if (pharmacyMarkerRef.current) {
            bounds.extend(pharmacyMarkerRef.current.getPosition());
          }
          bounds.extend(userPos);
          map.fitBounds(bounds);
          setTrackingError("");
        };

        const errorHandler = (err) => {
          console.error("Geolocation error:", err);
          setTrackingError(
            "Tidak dapat mengambil lokasi Anda. Pastikan izin lokasi sudah diberikan."
          );
        };

        watchIdRef.current = navigator.geolocation.watchPosition(
          successHandler,
          errorHandler,
          {
            enableHighAccuracy: true,
            maximumAge: 5000,
            timeout: 10000,
          }
        );
      } catch (err) {
        console.error("Error initializing Google Maps:", err);
        setTrackingError(
          "Google Maps gagal dimuat. Pastikan koneksi internet aktif dan API key valid."
        );
      }
    };

    initializeMap();

    return () => {
      if (watchIdRef.current && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [trackingEnabled]);

  const counts = {
    all: orders.length,
    completed: orders.filter(
      (o) => o.order_status?.toLowerCase() === "completed"
    ).length,
    processing: orders.filter(
      (o) =>
        o.order_status &&
        ["pending", "confirmed", "preparing", "ready"].includes(
          o.order_status.toLowerCase()
        )
    ).length,
    cancelled: orders.filter(
      (o) => o.order_status?.toLowerCase() === "cancelled"
    ).length,
  };

  const PHARMACY_ADDRESS =
    "Gedung C Fasilkom-TI, Universitas Sumatera Utara, Jl. Alumni No.3, Padang Bulan, Kec. Medan Baru, Kota Medan, Sumatera Utara 20155";
  const mapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const embedUrl = mapsApiKey
    ? `https://www.google.com/maps/embed/v1/place?key=${mapsApiKey}&q=${encodeURIComponent(
        PHARMACY_ADDRESS
      )}`
    : null;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    PHARMACY_ADDRESS
  )}`;

  const filteredOrders = orders.filter((order) => {
    if (activeTab === "all") return true;
    if (activeTab === "completed") {
      return order.order_status?.toLowerCase() === "completed";
    }
    if (activeTab === "processing") {
      return (
        order.order_status &&
        ["pending", "confirmed", "preparing", "ready"].includes(
          order.order_status.toLowerCase()
        )
      );
    }
    if (activeTab === "cancelled") {
      return order.order_status?.toLowerCase() === "cancelled";
    }
    return true;
  });

  const handleDeleteAllHistory = () => {
    localStorage.setItem("order_history", "[]");
    setOrders([]);
    setShowDeleteConfirm(false);
  };

  const handleDeleteOrder = async (orderId) => {
    const order = orders.find((o) => o.order_id === orderId);
    if (order && order.order_status !== "completed") {
      setConfirmModal({
        isOpen: true,
        title: "Tidak Bisa Menghapus Riwayat",
        message:
          "Riwayat pesanan hanya bisa dihapus jika pesanan sudah berstatus 'Selesai'. Pesanan ini masih berstatus '" +
          translateOrderStatus(order.order_status) +
          "'.",
        type: "warning",
        confirmText: "Mengerti",
        onConfirm: () => setConfirmModal({ ...confirmModal, isOpen: false }),
      });
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: "Hapus Riwayat Pesanan",
      message:
        "Apakah Anda yakin ingin menghapus pesanan ini dari riwayat? Pesanan akan dihapus dari daftar Anda.",
      type: "danger",
      confirmText: "Hapus",
      onConfirm: async () => {
        setConfirmModal({ ...confirmModal, isOpen: false });
        try {
          const token = getToken();
          if (!token) {
            showAlert(
              "Sesi login telah berakhir. Silakan login kembali.",
              "warning"
            );
            return;
          }
          const result = await OrderService.hideOrderFromUser(orderId, token);
          if (result.success) {
            setOrders((prev) => prev.filter((o) => o.order_id !== orderId));
            showAlert("Pesanan berhasil dihapus dari riwayat", "success");
          } else {
            showAlert("Gagal menghapus pesanan", "error");
          }
        } catch (err) {
          console.error("Error deleting order:", err);
          showAlert(err.message || "Gagal menghapus pesanan", "error");
        }
      },
    });
  };

  const handlePayNow = async (order) => {
    setConfirmModal({
      isOpen: true,
      title: "Lanjutkan Pembayaran",
      message: `Total pembayaran: Rp ${order.total_amount?.toLocaleString(
        "id-ID"
      )}\n\nAnda akan diarahkan ke halaman pembayaran Midtrans untuk menyelesaikan transaksi.`,
      type: "info",
      confirmText: "Bayar Sekarang",
      onConfirm: async () => {
        setConfirmModal({ ...confirmModal, isOpen: false });
        try {
          const token = getToken();
          if (!token) {
            showAlert(
              "Sesi login telah berakhir. Silakan login kembali.",
              "warning"
            );
            return;
          }

          // Calculate item total and build item array
          const items =
            order.items?.map((item) => ({
              id: item.product_id,
              name: item.product_name,
              price: item.product_price,
              quantity: item.quantity,
            })) || [];

          // Calculate subtotal from items
          const itemsTotal = items.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          );

          // Add tax as separate line item if exists
          if (order.tax_amount && order.tax_amount > 0) {
            items.push({
              id: "TAX",
              name: "Pajak",
              price: order.tax_amount,
              quantity: 1,
            });
          }

          // Add discount as negative line item if exists
          if (order.discount_amount && order.discount_amount > 0) {
            items.push({
              id: "DISCOUNT",
              name: order.coupon_code
                ? `Diskon (${order.coupon_code})`
                : "Diskon",
              price: -order.discount_amount, // negative for discount
              quantity: 1,
            });
          }

          // Calculate final gross_amount (should match order.total_amount)
          const gross_amount = items.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          );

          console.log("Payment data:", {
            order_number: order.order_number,
            items_total: itemsTotal,
            tax: order.tax_amount,
            discount: order.discount_amount,
            calculated_gross: gross_amount,
            db_total: order.total_amount,
            items: items.length,
          });

          // Generate unique transaction ID for Midtrans
          // Format: ORDER_NUMBER-TIMESTAMP to ensure uniqueness on retry
          const uniqueTransactionId = `${order.order_number}-${Date.now()}`;

          // Create Midtrans transaction
          const paymentData = {
            order_id: uniqueTransactionId,
            original_order_id: order.order_id, // Send original order ID for backend reference
            order_number: order.order_number, // Send order number for backend reference
            gross_amount: gross_amount,
            items: items,
            customer: {
              first_name: order.customer_name,
              email: order.customer_email || "customer@pharmahub.com",
              phone: order.customer_phone,
              address: order.customer_address,
            },
          };

          const result = await PaymentService.createTransaction(
            paymentData,
            token
          );

          if (result.success && result.redirect_url) {
            // Redirect to Midtrans payment page in same window
            window.location.href = result.redirect_url;
          } else {
            showAlert("Gagal membuat transaksi pembayaran", "error");
          }
        } catch (err) {
          console.error("Error creating payment:", err);
          showAlert(
            err.message || "Gagal membuat transaksi pembayaran",
            "error"
          );
        }
      },
    });
  };

  const handleCancelPayment = async (orderId) => {
    setConfirmModal({
      isOpen: true,
      title: "Batalkan Pembayaran",
      message:
        "Apakah Anda yakin ingin membatalkan pembayaran ini? Pesanan akan dibatalkan dan tidak dapat diproses.",
      type: "danger",
      confirmText: "Batalkan",
      showInput: true,
      inputPlaceholder: "Alasan pembatalan (wajib diisi)",
      inputValue: "",
      onConfirm: async () => {
        const reason = confirmModal.inputValue?.trim();
        if (!reason) {
          showAlert("Alasan pembatalan wajib diisi", "warning");
          return;
        }
        setConfirmModal({ ...confirmModal, isOpen: false });
        try {
          const token = getToken();
          if (!token) {
            showAlert(
              "Sesi login telah berakhir. Silakan login kembali.",
              "warning"
            );
            return;
          }
          const result = await OrderService.cancelPayment(
            orderId,
            reason,
            token
          );
          if (result.success) {
            await loadOrders();
            showAlert("Pembayaran berhasil dibatalkan", "success");
          } else {
            showAlert("Gagal membatalkan pembayaran", "error");
          }
        } catch (err) {
          console.error("Error canceling payment:", err);
          showAlert(err.message || "Gagal membatalkan pembayaran", "error");
        }
      },
    });
  };

  const handleCancelPaidOrder = async (order) => {
    setConfirmModal({
      isOpen: true,
      title: "Batalkan Pesanan",
      message: `Anda akan membatalkan pesanan yang sudah dibayar.\n\nTotal pembayaran: Rp ${order.total_amount?.toLocaleString(
        "id-ID"
      )}\n\nDana akan dikembalikan setelah diproses oleh admin.\n\nMohon berikan alasan pembatalan:`,
      type: "danger",
      confirmText: "Batalkan Pesanan & Minta Refund",
      showInput: true,
      inputPlaceholder: "Alasan pembatalan (wajib diisi)",
      inputValue: "",
      onConfirm: async () => {
        const reason = confirmModal.inputValue?.trim();
        if (!reason) {
          showAlert("Alasan pembatalan wajib diisi", "warning");
          return;
        }
        setConfirmModal({ ...confirmModal, isOpen: false });
        try {
          const token = getToken();
          if (!token) {
            showAlert(
              "Sesi login telah berakhir. Silakan login kembali.",
              "warning"
            );
            return;
          }

          // Call API to cancel paid order with refund
          const result = await OrderService.cancelPaidOrder(
            order.order_id,
            reason,
            token
          );

          if (result.success) {
            await loadOrders();
            showAlert(
              `Pesanan berhasil dibatalkan. Refund sebesar Rp ${order.total_amount?.toLocaleString(
                "id-ID"
              )} akan diproses oleh admin.`,
              "success"
            );
          } else {
            showAlert(result.message || "Gagal membatalkan pesanan", "error");
          }
        } catch (err) {
          console.error("Error canceling paid order:", err);
          showAlert(err.message || "Gagal membatalkan pesanan", "error");
        }
      },
    });
  };

  return (
    <main className="container mx-auto px-4 py-8 min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Riwayat Transaksi
            </h1>
            <p className="text-gray-600">
              Lihat semua riwayat pembelian dan transaksi Anda
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <select className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
              <option value="all">Semua Waktu</option>
              <option value="week">7 Hari Terakhir</option>
              <option value="month">30 Hari Terakhir</option>
              <option value="quarter">3 Bulan Terakhir</option>
            </select>
            <button
              className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800 transition disabled:text-gray-400 disabled:cursor-not-allowed"
              disabled={orders.length === 0}
            >
              <i className="fas fa-download mr-2"></i>Unduh Riwayat
            </button>
          </div>
        </div>
      </div>

      {orders.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            Panduan ke Apotek
          </h2>
          <p className="text-sm text-gray-600 mb-3">
            Lokasi apotek: Gedung C Fasilkom-TI, Universitas Sumatera Utara.
          </p>
          {embedUrl && (
            <div className="w-full h-64 md:h-80 rounded-lg overflow-hidden mb-3">
              <iframe
                title="Lokasi Apotek"
                src={embedUrl}
                width="100%"
                height="100%"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                style={{ border: 0 }}
                allowFullScreen
              ></iframe>
            </div>
          )}
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
            >
              <i className="fas fa-location-arrow mr-2"></i>
              Buka Navigasi di Google Maps
            </a>
            <button
              type="button"
              onClick={() => setTrackingEnabled((prev) => !prev)}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition"
            >
              <i className="fas fa-route mr-2"></i>
              {trackingEnabled
                ? "Matikan Live Tracking di Halaman Ini"
                : "Mulai Live Tracking di Halaman Ini"}
            </button>
          </div>
          {trackingError && (
            <p className="text-xs text-red-500 mb-2">{trackingError}</p>
          )}
          {trackingEnabled && (
            <div
              id="live-tracking-map"
              className="w-full h-64 md:h-80 rounded-lg border border-gray-200 overflow-hidden"
            ></div>
          )}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200 flex items-center justify-between">
          <nav className="flex space-x-8 overflow-x-auto flex-1">
            <button
              onClick={() => setActiveTab("all")}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === "all"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Semua
              <span
                className={`ml-2 px-2 py-1 rounded-full text-xs ${
                  activeTab === "all"
                    ? "bg-blue-100 text-blue-600"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {counts.all}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("completed")}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === "completed"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Selesai
              <span
                className={`ml-2 px-2 py-1 rounded-full text-xs ${
                  activeTab === "completed"
                    ? "bg-blue-100 text-blue-600"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {counts.completed}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("processing")}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === "processing"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Diproses
              <span
                className={`ml-2 px-2 py-1 rounded-full text-xs ${
                  activeTab === "processing"
                    ? "bg-blue-100 text-blue-600"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {counts.processing}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("cancelled")}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === "cancelled"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Dibatalkan
              <span
                className={`ml-2 px-2 py-1 rounded-full text-xs ${
                  activeTab === "cancelled"
                    ? "bg-blue-100 text-blue-600"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {counts.cancelled}
              </span>
            </button>
          </nav>

          {/* Delete All Button */}
          {orders.length > 0 && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="ml-4 px-4 py-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg font-medium text-sm transition flex items-center whitespace-nowrap border border-red-300"
            >
              <i className="fas fa-trash-alt mr-2"></i>
              Hapus Semua
            </button>
          )}
        </div>
      </div>

      {/* History Content */}
      <div className="bg-white rounded-lg shadow-md">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Memuat riwayat pesanan...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 px-6">
            <i className="fas fa-exclamation-triangle text-red-500 text-5xl mb-4"></i>
            <p className="text-red-600 font-semibold mb-2">
              Gagal memuat riwayat pesanan
            </p>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={loadOrders}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
            >
              <i className="fas fa-redo mr-2"></i>Coba Lagi
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 px-6">
            <div className="mb-6">
              <i className="fas fa-receipt text-6xl text-gray-300"></i>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Belum Ada Riwayat Transaksi
            </h3>
            <p className="text-gray-500 mb-6">
              Riwayat pembelian Anda akan muncul di sini setelah melakukan
              transaksi pertama.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
              <div className="flex flex-col items-center p-4 bg-blue-50 rounded-lg">
                <i className="fas fa-shopping-bag text-blue-500 text-2xl mb-2"></i>
                <span className="text-sm text-blue-700 font-medium">
                  Detail Pesanan
                </span>
                <p className="text-xs text-blue-600 mt-1">
                  Lihat produk yang dibeli
                </p>
              </div>
              <div className="flex flex-col items-center p-4 bg-green-50 rounded-lg">
                <i className="fas fa-truck text-green-500 text-2xl mb-2"></i>
                <span className="text-sm text-green-700 font-medium">
                  Status Pengiriman
                </span>
                <p className="text-xs text-green-600 mt-1">
                  Tracking real-time
                </p>
              </div>
              <div className="flex flex-col items-center p-4 bg-purple-50 rounded-lg">
                <i className="fas fa-star text-purple-500 text-2xl mb-2"></i>
                <span className="text-sm text-purple-700 font-medium">
                  Berikan Ulasan
                </span>
                <p className="text-xs text-purple-600 mt-1">
                  Rating & feedback
                </p>
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
            {filteredOrders.length === 0 ? (
              <div className="py-10 text-center text-gray-500">
                Tidak ada transaksi untuk filter ini.
              </div>
            ) : (
              filteredOrders.map((order) => (
                <div
                  key={order.order_id}
                  className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between hover:bg-blue-50 transition"
                >
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => {
                      setSelectedOrder(order);
                      setShowDetailModal(true);
                    }}
                  >
                    <p className="text-sm text-gray-500 mb-1">
                      ID Pesanan:{" "}
                      <span className="font-mono text-gray-700">
                        {order.order_number}
                      </span>
                    </p>
                    <p className="text-base font-semibold text-gray-800 mb-1">
                      {order.customer_name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="mt-3 sm:mt-0 flex flex-col sm:items-end space-y-2">
                    <span className="text-sm font-medium text-gray-700">
                      Total: Rp {order.total_amount?.toLocaleString("id-ID")}
                    </span>
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        order.order_status
                      )}`}
                    >
                      {translateOrderStatus(order.order_status)}
                    </span>
                    {order.payment_status === "pending" && (
                      <span className="inline-flex px-2 py-1 rounded text-xs bg-orange-100 text-orange-700">
                        {translatePaymentStatus(order.payment_status)}
                      </span>
                    )}
                    <div className="flex items-center space-x-2">
                      {order.payment_status === "pending" && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePayNow(order);
                            }}
                            className="px-3 py-1 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition font-semibold"
                            title="Bayar sekarang"
                          >
                            <i className="fas fa-credit-card mr-1"></i>Bayar
                            Sekarang
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCancelPayment(order.order_id);
                            }}
                            className="px-3 py-1 text-xs text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition"
                            title="Batalkan pembayaran"
                          >
                            <i className="fas fa-times mr-1"></i>Batal
                          </button>
                        </>
                      )}
                      {(order.order_status === "preparing" ||
                        order.order_status === "ready") &&
                        order.payment_status === "paid" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCancelPaidOrder(order);
                            }}
                            className="px-3 py-1 text-xs text-orange-600 hover:text-orange-800 hover:bg-orange-50 rounded transition font-semibold"
                            title="Batalkan pesanan & minta refund"
                          >
                            <i className="fas fa-undo mr-1"></i>Batalkan Pesanan
                          </button>
                        )}
                      {order.order_status === "completed" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteOrder(order.order_id);
                          }}
                          className="px-3 py-1 text-xs text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition"
                          title="Hapus dari riwayat"
                        >
                          <i className="fas fa-trash mr-1"></i>Hapus
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowDetailModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm font-semibold"
                      >
                        <i className="fas fa-chevron-right mr-1"></i>Lihat
                        Detail
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Statistics Cards (Hidden when empty) */}
      {orders.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-full">
                <i className="fas fa-shopping-bag text-blue-600 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Pesanan
                </p>
                <p className="text-2xl font-bold text-gray-900">{counts.all}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-full">
                <i className="fas fa-money-bill-wave text-green-600 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Belanja
                </p>
                <p className="text-2xl font-bold text-gray-900">Rp 0</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="bg-yellow-100 p-3 rounded-full">
                <i className="fas fa-clock text-yellow-600 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Dalam Proses
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {counts.processing}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-full">
                <i className="fas fa-star text-purple-600 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Perlu Ulasan
                </p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== ORDER DETAIL MODAL (HISTORY) ===== */}
      {showDetailModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">Detail Pesanan</h2>
                <p className="text-blue-100 text-sm">
                  Pesanan #{selectedOrder.order_number}
                </p>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-white hover:bg-blue-800 p-2 rounded-full transition"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Order Time & Status */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-600 font-medium">
                      Waktu Pemesanan
                    </p>
                    <p className="text-sm font-semibold text-gray-800">
                      {new Date(selectedOrder.created_at).toLocaleString(
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
                    <p
                      className={`text-sm font-semibold
                      ${
                        selectedOrder.order_status?.toLowerCase() ===
                        "completed"
                          ? "text-green-600"
                          : ""
                      }
                      ${
                        selectedOrder.order_status?.toLowerCase() === "pending"
                          ? "text-yellow-600"
                          : ""
                      }
                      ${
                        selectedOrder.order_status?.toLowerCase() ===
                        "cancelled"
                          ? "text-red-600"
                          : ""
                      }
                    `}
                    >
                      {translateOrderStatus(selectedOrder.order_status)}
                    </p>
                    {selectedOrder.payment_status && (
                      <p className="text-xs text-gray-500 mt-1">
                        Pembayaran:{" "}
                        {translatePaymentStatus(selectedOrder.payment_status)}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">
                  <i className="fas fa-user-circle text-blue-600 mr-2"></i>
                  Informasi Pemesan
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium text-gray-700">Nama:</span>{" "}
                    {selectedOrder.customer_name}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium text-gray-700">Telepon:</span>{" "}
                    {selectedOrder.customer_phone}
                  </p>
                  {selectedOrder.customer_address && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium text-gray-700">Alamat:</span>{" "}
                      {selectedOrder.customer_address}
                    </p>
                  )}
                </div>
              </div>

              {/* Products */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">
                  <i className="fas fa-shopping-bag text-blue-600 mr-2"></i>
                  Produk Pesanan
                </h3>
                <div className="space-y-3">
                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    selectedOrder.items.map((item, idx) => {
                      // Generate image URL - backend sudah return full URL dari Supabase
                      const getImageUrl = () => {
                        // product_image dari backend sudah berisi main_image_url lengkap
                        if (
                          item.product_image &&
                          item.product_image.startsWith("http")
                        ) {
                          return item.product_image;
                        }

                        // Fallback placeholder jika tidak ada gambar
                        return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E';
                      };

                      return (
                        <div
                          key={idx}
                          className="flex gap-4 bg-gray-50 p-3 rounded-lg"
                        >
                          <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden flex items-center justify-center">
                            <img
                              src={getImageUrl()}
                              alt={item.product_name}
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
                              {item.product_name}
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
                                  Rp{" "}
                                  {(item.product_price || 0).toLocaleString(
                                    "id-ID"
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <i className="fas fa-box-open text-4xl mb-3"></i>
                      <p>Tidak ada produk dalam pesanan ini</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Admin Notes - Display if available */}
              {selectedOrder.admin_notes && (
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">
                    <i className="fas fa-comment-dots text-orange-600 mr-2"></i>
                    Pesan dari Admin
                  </h3>
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <p className="text-sm text-gray-700">
                      {selectedOrder.admin_notes}
                    </p>
                  </div>
                </div>
              )}

              {/* Price Summary - Simplified */}
              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total Pembayaran</span>
                  <span className="text-blue-600">
                    Rp{" "}
                    {(Number(selectedOrder.total_amount) || 0).toLocaleString(
                      "id-ID"
                    )}
                  </span>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setShowDetailModal(false)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
              >
                <i className="fas fa-check mr-2"></i>Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete All History Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full">
            <div className="bg-red-50 border-b border-red-200 px-6 py-4">
              <h3 className="text-lg font-bold text-red-700 flex items-center">
                <i className="fas fa-exclamation-triangle mr-3 text-red-600"></i>
                Hapus Semua Riwayat
              </h3>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-2">
                Anda yakin ingin menghapus{" "}
                <strong>seluruh riwayat transaksi</strong>?
              </p>
              <p className="text-sm text-gray-500">
                Tindakan ini tidak dapat dibatalkan. Data riwayat pembelian yang
                sudah dihapus tidak bisa dipulihkan.
              </p>
            </div>
            <div className="border-t px-6 py-4 flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 hover:bg-gray-300 rounded-lg font-medium transition"
              >
                <i className="fas fa-times mr-2"></i>Batal
              </button>
              <button
                onClick={handleDeleteAllHistory}
                className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg font-medium transition"
              >
                <i className="fas fa-trash-alt mr-2"></i>Hapus Semua
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertState.isOpen}
        onClose={hideAlert}
        message={alertState.message}
        type={alertState.type}
        title={alertState.title}
      />

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        confirmText={confirmModal.confirmText}
        showInput={confirmModal.showInput}
        inputPlaceholder={confirmModal.inputPlaceholder}
        inputValue={confirmModal.inputValue}
        onInputChange={(value) =>
          setConfirmModal({ ...confirmModal, inputValue: value })
        }
      />
    </main>
  );
};

export default History;

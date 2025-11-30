import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import OrderService from "../services/order.service";

const History = () => {
  const { getToken } = useAuth();
  const [activeTab, setActiveTab] = useState("all");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trackingEnabled, setTrackingEnabled] = useState(false);
  const [trackingError, setTrackingError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const mapRef = useRef(null);
  const userMarkerRef = useRef(null);
  const pharmacyMarkerRef = useRef(null);
  const watchIdRef = useRef(null);

  useEffect(() => {
    loadOrders();
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
        setOrders(result.orders || []);
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

    if (!window.google || !window.google.maps) {
      setTrackingError("Google Maps belum siap. Coba muat ulang halaman.");
      return;
    }

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
                  onClick={() => {
                    setSelectedOrder(order);
                    setShowDetailModal(true);
                  }}
                  className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between hover:bg-blue-50 cursor-pointer transition"
                >
                  <div className="flex-1">
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
                  <div className="mt-3 sm:mt-0 flex flex-col sm:items-end space-y-1">
                    <span className="text-sm font-medium text-gray-700">
                      Total: Rp {order.total_amount?.toLocaleString("id-ID")}
                    </span>
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold
                      ${
                        order.order_status?.toLowerCase() === "completed"
                          ? "bg-green-100 text-green-700"
                          : ""
                      }
                      ${
                        order.order_status?.toLowerCase() === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : ""
                      }
                      ${
                        order.order_status?.toLowerCase() === "cancelled"
                          ? "bg-red-100 text-red-700"
                          : ""
                      }
                    `}
                    >
                      {order.order_status}
                    </span>
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-semibold mt-1">
                      <i className="fas fa-chevron-right mr-1"></i>Lihat Detail
                    </button>
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
                      {selectedOrder.order_status}
                    </p>
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
                  {selectedOrder.items &&
                    selectedOrder.items.map((item, idx) => {
                      // Generate image URL dengan fallback chain
                      const getImageUrl = () => {
                        // Order items tidak menyimpan gambar, gunakan placeholder
                        return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23eee" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-size="14"%3EProduk%3C/text%3E%3C/svg%3E';
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
                    })}
                </div>
              </div>

              {/* Order Notes */}
              {selectedOrder.notes && (
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">
                    <i className="fas fa-sticky-note text-blue-600 mr-2"></i>
                    Catatan Pesanan
                  </h3>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-sm text-gray-700">
                      {selectedOrder.notes}
                    </p>
                  </div>
                </div>
              )}

              {/* Admin Notes */}
              {selectedOrder.adminNotes && (
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">
                    <i className="fas fa-comment-dots text-orange-600 mr-2"></i>
                    Pesan dari Admin
                  </h3>
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                    <p className="text-sm text-gray-700">
                      {selectedOrder.adminNotes}
                    </p>
                  </div>
                </div>
              )}

              {/* Price Summary */}
              <div className="border-t pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium text-gray-800">
                      Rp{" "}
                      {(Number(selectedOrder.subtotal) || 0).toLocaleString(
                        "id-ID"
                      )}
                    </span>
                  </div>
                  {Number(selectedOrder.discount_amount) > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Diskon</span>
                      <span className="font-medium">
                        -Rp{" "}
                        {(
                          Number(selectedOrder.discount_amount) || 0
                        ).toLocaleString("id-ID")}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Pajak (PPN 10%)</span>
                    <span className="font-medium text-gray-800">
                      Rp{" "}
                      {(Number(selectedOrder.tax_amount) || 0).toLocaleString(
                        "id-ID"
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total</span>
                    <span className="text-blue-600">
                      Rp{" "}
                      {(Number(selectedOrder.total_amount) || 0).toLocaleString(
                        "id-ID"
                      )}
                    </span>
                  </div>
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
    </main>
  );
};

export default History;

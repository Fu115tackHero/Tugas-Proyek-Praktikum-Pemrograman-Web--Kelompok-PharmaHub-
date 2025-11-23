import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const History = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [orders, setOrders] = useState([]);
  const [trackingEnabled, setTrackingEnabled] = useState(false);
  const [trackingError, setTrackingError] = useState('');
  const mapRef = useRef(null);
  const userMarkerRef = useRef(null);
  const pharmacyMarkerRef = useRef(null);
  const watchIdRef = useRef(null);

  useEffect(() => {
    try {
      const savedOrders = JSON.parse(localStorage.getItem('order_history') || '[]');
      setOrders(savedOrders);
    } catch (error) {
      console.error('Error loading order history:', error);
      setOrders([]);
    }
  }, []);

  useEffect(() => {
    if (!trackingEnabled) {
      if (watchIdRef.current && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      return;
    }

    if (!navigator.geolocation) {
      setTrackingError('Browser Anda tidak mendukung fitur lokasi (GPS).');
      return;
    }

    if (!window.google || !window.google.maps) {
      setTrackingError('Google Maps belum siap. Coba muat ulang halaman.');
      return;
    }

    const mapElement = document.getElementById('live-tracking-map');
    if (!mapElement) {
      setTrackingError('Area peta tidak ditemukan.');
      return;
    }

    const pharmacyAddress = 'Gedung C Fasilkom-TI, Universitas Sumatera Utara, Jl. Alumni No.3, Padang Bulan, Kec. Medan Baru, Kota Medan, Sumatera Utara 20155';

    let map = mapRef.current;
    if (!map) {
      map = new window.google.maps.Map(mapElement, {
        center: { lat: 0, lng: 0 },
        zoom: 14,
      });

      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: pharmacyAddress }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const location = results[0].geometry.location;
          pharmacyMarkerRef.current = new window.google.maps.Marker({
            position: location,
            map,
            title: 'Lokasi Apotek',
          });
          map.setCenter(location);
        } else {
          console.warn('Gagal geocode alamat apotek:', status);
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
          title: 'Posisi Anda',
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 6,
            fillColor: '#2563eb',
            fillOpacity: 1,
            strokeColor: '#ffffff',
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
      setTrackingError('');
    };

    const errorHandler = (err) => {
      console.error('Geolocation error:', err);
      setTrackingError('Tidak dapat mengambil lokasi Anda. Pastikan izin lokasi sudah diberikan.');
    };

    watchIdRef.current = navigator.geolocation.watchPosition(successHandler, errorHandler, {
      enableHighAccuracy: true,
      maximumAge: 5000,
      timeout: 10000,
    });

    return () => {
      if (watchIdRef.current && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [trackingEnabled]);

  const counts = {
    all: orders.length,
    completed: orders.filter(o =>
      o.status && o.status.toLowerCase().includes('lunas')
    ).length,
    processing: orders.filter(o =>
      o.status && (
        o.status.toLowerCase().includes('menunggu') ||
        o.status.toLowerCase().includes('pending') ||
        o.status.toLowerCase().includes('processing')
      )
    ).length,
    cancelled: orders.filter(o =>
      o.status && o.status.toLowerCase().includes('batal')
    ).length,
  };

  const PHARMACY_ADDRESS = 'Gedung C Fasilkom-TI, Universitas Sumatera Utara, Jl. Alumni No.3, Padang Bulan, Kec. Medan Baru, Kota Medan, Sumatera Utara 20155';
  const mapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const embedUrl = mapsApiKey
    ? `https://www.google.com/maps/embed/v1/place?key=${mapsApiKey}&q=${encodeURIComponent(PHARMACY_ADDRESS)}`
    : null;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(PHARMACY_ADDRESS)}`;

  const filteredOrders = orders.filter((order) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'completed') {
      return order.status && order.status.toLowerCase().includes('lunas');
    }
    if (activeTab === 'processing') {
      return (
        order.status && (
          order.status.toLowerCase().includes('menunggu') ||
          order.status.toLowerCase().includes('pending') ||
          order.status.toLowerCase().includes('processing')
        )
      );
    }
    if (activeTab === 'cancelled') {
      return order.status && order.status.toLowerCase().includes('batal');
    }
    return true;
  });

  return (
    <main className="container mx-auto px-4 py-8 min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Riwayat Transaksi</h1>
            <p className="text-gray-600">Lihat semua riwayat pembelian dan transaksi Anda</p>
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
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Panduan ke Apotek</h2>
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
              onClick={() => setTrackingEnabled(prev => !prev)}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition"
            >
              <i className="fas fa-route mr-2"></i>
              {trackingEnabled ? 'Matikan Live Tracking di Halaman Ini' : 'Mulai Live Tracking di Halaman Ini'}
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
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'all'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Semua
              <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                activeTab === 'all' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
              }`}>
                {counts.all}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'completed'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Selesai
              <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                activeTab === 'completed' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
              }`}>
                {counts.completed}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('processing')}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'processing'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Diproses
              <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                activeTab === 'processing' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
              }`}>
                {counts.processing}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('cancelled')}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'cancelled'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Dibatalkan
              <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                activeTab === 'cancelled' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
              }`}>
                {counts.cancelled}
              </span>
            </button>
          </nav>
        </div>
      </div>

      {/* History Content */}
      <div className="bg-white rounded-lg shadow-md">
        {orders.length === 0 ? (
          <div className="text-center py-16 px-6">
            <div className="mb-6">
              <i className="fas fa-receipt text-6xl text-gray-300"></i>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Belum Ada Riwayat Transaksi</h3>
            <p className="text-gray-500 mb-6">
              Riwayat pembelian Anda akan muncul di sini setelah melakukan transaksi pertama.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
              <div className="flex flex-col items-center p-4 bg-blue-50 rounded-lg">
                <i className="fas fa-shopping-bag text-blue-500 text-2xl mb-2"></i>
                <span className="text-sm text-blue-700 font-medium">Detail Pesanan</span>
                <p className="text-xs text-blue-600 mt-1">Lihat produk yang dibeli</p>
              </div>
              <div className="flex flex-col items-center p-4 bg-green-50 rounded-lg">
                <i className="fas fa-truck text-green-500 text-2xl mb-2"></i>
                <span className="text-sm text-green-700 font-medium">Status Pengiriman</span>
                <p className="text-xs text-green-600 mt-1">Tracking real-time</p>
              </div>
              <div className="flex flex-col items-center p-4 bg-purple-50 rounded-lg">
                <i className="fas fa-star text-purple-500 text-2xl mb-2"></i>
                <span className="text-sm text-purple-700 font-medium">Berikan Ulasan</span>
                <p className="text-xs text-purple-600 mt-1">Rating & feedback</p>
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
                Atau kembali ke{' '}
                <Link to="/" className="text-blue-600 hover:text-blue-800 underline">
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
                <div key={order.id} className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">ID Pesanan: <span className="font-mono text-gray-700">{order.id}</span></p>
                    <p className="text-base font-semibold text-gray-800 mb-1">{order.customerName}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.date).toLocaleString('id-ID', {
                        day: '2-digit', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="mt-3 sm:mt-0 flex flex-col sm:items-end space-y-1">
                    <span className="text-sm font-medium text-gray-700">
                      Total: Rp {order.total?.toLocaleString('id-ID')}
                    </span>
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold
                      ${order.status?.toLowerCase().includes('lunas') ? 'bg-green-100 text-green-700' : ''}
                      ${order.status?.toLowerCase().includes('menunggu') || order.status?.toLowerCase().includes('pending') ? 'bg-yellow-100 text-yellow-700' : ''}
                    `}>
                      {order.status}
                    </span>
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
                <p className="text-sm font-medium text-gray-600">Total Pesanan</p>
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
                <p className="text-sm font-medium text-gray-600">Total Belanja</p>
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
                <p className="text-sm font-medium text-gray-600">Dalam Proses</p>
                <p className="text-2xl font-bold text-gray-900">{counts.processing}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-full">
                <i className="fas fa-star text-purple-600 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Perlu Ulasan</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default History;

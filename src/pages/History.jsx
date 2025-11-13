import { useState } from 'react';
import { Link } from 'react-router-dom';

const History = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [orders] = useState([]);

  const counts = {
    all: orders.length,
    completed: orders.filter(o => o.status === 'completed').length,
    processing: orders.filter(o => o.status === 'processing').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  };

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
        {/* Empty State */}
        {orders.length === 0 && (
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

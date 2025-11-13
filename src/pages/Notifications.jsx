import { useState } from 'react';
import { Link } from 'react-router-dom';

const Notifications = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [notifications] = useState([]);

  const counts = {
    all: notifications.length,
    orders: notifications.filter(n => n.type === 'order').length,
    promotions: notifications.filter(n => n.type === 'promotion').length,
    system: notifications.filter(n => n.type === 'system').length,
  };

  return (
    <main className="container mx-auto px-4 py-8 min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Notifikasi</h1>
            <p className="text-gray-600">Lihat semua notifikasi terbaru dari PharmaHub</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800 transition disabled:text-gray-400 disabled:cursor-not-allowed"
              disabled={notifications.length === 0}
            >
              <i className="fas fa-check-double mr-2"></i>Tandai Semua Dibaca
            </button>
            <button
              className="px-4 py-2 text-sm text-red-600 hover:text-red-800 transition disabled:text-gray-400 disabled:cursor-not-allowed"
              disabled={notifications.length === 0}
            >
              <i className="fas fa-trash mr-2"></i>Hapus Semua
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
              onClick={() => setActiveTab('orders')}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'orders'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Pesanan
              <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                activeTab === 'orders' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
              }`}>
                {counts.orders}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('promotions')}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'promotions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Promosi
              <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                activeTab === 'promotions' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
              }`}>
                {counts.promotions}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('system')}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'system'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Sistem
              <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                activeTab === 'system' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
              }`}>
                {counts.system}
              </span>
            </button>
          </nav>
        </div>
      </div>

      {/* Notifications Content */}
      <div className="bg-white rounded-lg shadow-md">
        {/* Empty State */}
        {notifications.length === 0 && (
          <div className="text-center py-16 px-6">
            <div className="mb-6">
              <i className="fas fa-bell-slash text-6xl text-gray-300"></i>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Belum Ada Notifikasi</h3>
            <p className="text-gray-500 mb-6">
              Notifikasi Anda akan muncul di sini. Kami akan memberitahu Anda tentang:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
              <div className="flex flex-col items-center p-4 bg-blue-50 rounded-lg">
                <i className="fas fa-shopping-bag text-blue-500 text-2xl mb-2"></i>
                <span className="text-sm text-blue-700 font-medium">Status Pesanan</span>
              </div>
              <div className="flex flex-col items-center p-4 bg-green-50 rounded-lg">
                <i className="fas fa-tags text-green-500 text-2xl mb-2"></i>
                <span className="text-sm text-green-700 font-medium">Promo & Diskon</span>
              </div>
              <div className="flex flex-col items-center p-4 bg-purple-50 rounded-lg">
                <i className="fas fa-info-circle text-purple-500 text-2xl mb-2"></i>
                <span className="text-sm text-purple-700 font-medium">Info Penting</span>
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
    </main>
  );
};

export default Notifications;

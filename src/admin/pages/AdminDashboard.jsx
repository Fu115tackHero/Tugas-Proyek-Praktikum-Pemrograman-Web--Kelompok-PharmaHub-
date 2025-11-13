import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { products } from '../../data/products';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalDrugs: 0,
    todayOrders: 0,
    pendingOrders: 0,
    monthlySales: 0,
  });

  const [recentActivity] = useState([
    {
      id: 1,
      type: 'success',
      message: 'Pesanan #12345 telah selesai',
      time: '5 menit yang lalu',
      color: 'green',
    },
    {
      id: 2,
      type: 'info',
      message: 'Obat Paracetamol ditambahkan',
      time: '15 menit yang lalu',
      color: 'blue',
    },
    {
      id: 3,
      type: 'warning',
      message: 'Pesanan #12344 sedang disiapkan',
      time: '30 menit yang lalu',
      color: 'yellow',
    },
  ]);

  useEffect(() => {
    // Calculate stats
    const orderHistory = JSON.parse(localStorage.getItem('order_history') || '[]');
    const today = new Date().toDateString();
    
    setStats({
      totalDrugs: products.length,
      todayOrders: orderHistory.filter(order => 
        new Date(order.date).toDateString() === today
      ).length,
      pendingOrders: orderHistory.filter(order => 
        order.status === 'pending' || order.status === 'processing'
      ).length,
      monthlySales: 12500000, // Example value
    });
  }, []);

  return (
    <>
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <h2 className="text-2xl font-semibold text-gray-800">Dashboard</h2>
          <p className="text-gray-600">Overview sistem apotek PharmaHub</p>
        </div>
      </header>

      {/* Dashboard Content */}
      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <i className="fas fa-pills text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Obat</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalDrugs}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <i className="fas fa-shopping-cart text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pesanan Hari Ini</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.todayOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <i className="fas fa-clock text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pesanan Pending</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.pendingOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <i className="fas fa-chart-line text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Penjualan Bulan Ini</p>
                <p className="text-2xl font-semibold text-gray-900">
                  Rp {(stats.monthlySales / 1000000).toFixed(1)}M
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-800">Aksi Cepat</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 gap-4">
                <Link
                  to="/admin/drugs"
                  className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <i className="fas fa-plus-circle text-blue-600 text-xl mr-4"></i>
                  <div>
                    <p className="font-medium text-gray-800">Tambah Obat Baru</p>
                    <p className="text-sm text-gray-600">Menambahkan produk obat ke inventory</p>
                  </div>
                </Link>
                <Link
                  to="/admin/orders"
                  className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <i className="fas fa-eye text-green-600 text-xl mr-4"></i>
                  <div>
                    <p className="font-medium text-gray-800">Lihat Pesanan</p>
                    <p className="text-sm text-gray-600">Kelola pesanan masuk dan status</p>
                  </div>
                </Link>
                <Link
                  to="/admin/reports"
                  className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <i className="fas fa-download text-purple-600 text-xl mr-4"></i>
                  <div>
                    <p className="font-medium text-gray-800">Export Laporan</p>
                    <p className="text-sm text-gray-600">Download laporan penjualan</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-800">Aktivitas Terbaru</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center">
                    <div className={`w-2 h-2 bg-${activity.color}-500 rounded-full mr-3`}></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-800">{activity.message}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;

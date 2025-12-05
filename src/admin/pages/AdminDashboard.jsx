import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../services/api";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalDrugs: 0,
    lowStockDrugs: 0,
    todayOrders: 0,
    pendingOrders: 0,
    todayRevenue: 0,
    monthlyRevenue: 0,
    totalCustomers: 0,
    newCustomersToday: 0,
  });

  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    console.log("🔄 [AdminDashboard] Stats state changed:", stats);
  }, [stats]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("🔄 [AdminDashboard] Fetching dashboard data...");

      // Fetch dashboard stats from database VIEW
      const statsResponse = await api.get("/admin/dashboard/stats");
      console.log("📊 [AdminDashboard] Stats response:", statsResponse);
      console.log("📊 [AdminDashboard] Stats data:", statsResponse.data);
      console.log(
        "📊 [AdminDashboard] Is success?",
        statsResponse.data?.success
      );
      console.log("📊 [AdminDashboard] Has data?", statsResponse.data?.data);
      console.log(
        "📊 [AdminDashboard] Full response structure:",
        JSON.stringify(statsResponse.data, null, 2)
      );

      // Check if response has direct data (not nested in success/data)
      const statsData = statsResponse.data?.data || statsResponse.data;
      console.log("📊 [AdminDashboard] Extracted stats data:", statsData);

      if (
        statsData &&
        (statsData.totalDrugs !== undefined ||
          statsData.totaldrugs !== undefined)
      ) {
        console.log("✅ [AdminDashboard] Setting stats from:", statsData);
        const newStats = {
          totalDrugs: statsData.totalDrugs || statsData.totaldrugs || 0,
          lowStockDrugs:
            statsData.lowStockDrugs || statsData.lowstockdrugs || 0,
          todayOrders: statsData.todayOrders || statsData.todayorders || 0,
          pendingOrders:
            statsData.pendingOrders || statsData.pendingorders || 0,
          todayRevenue: statsData.todayRevenue || statsData.todayrevenue || 0,
          monthlyRevenue:
            statsData.monthlyRevenue || statsData.monthlyrevenue || 0,
          totalCustomers:
            statsData.totalCustomers || statsData.totalcustomers || 0,
          newCustomersToday:
            statsData.newCustomersToday || statsData.newcustomerstoday || 0,
        };
        console.log("🔧 [AdminDashboard] New stats object:", newStats);
        setStats(newStats);
        console.log("✅ [AdminDashboard] Stats state updated");
      } else {
        console.warn("⚠️ [AdminDashboard] Invalid stats response structure");
        console.warn("   statsData:", statsData);
      }

      // Fetch recent activity from database
      const activityResponse = await api.get(
        "/admin/dashboard/recent-activity?limit=10"
      );
      console.log(
        "📋 [AdminDashboard] Activity response:",
        activityResponse.data
      );

      if (
        activityResponse.data &&
        activityResponse.data.success &&
        activityResponse.data.data
      ) {
        console.log(
          "✅ [AdminDashboard] Setting activity:",
          activityResponse.data.data
        );
        setRecentActivity(activityResponse.data.data);
      }

      console.log("✅ [AdminDashboard] Data fetch completed");
    } catch (err) {
      console.error("❌ [AdminDashboard] Error fetching dashboard data:", err);
      console.error("❌ [AdminDashboard] Error details:", err.message);
      console.error("❌ [AdminDashboard] Error response:", err.response);
      setError("Gagal memuat data dashboard. Silakan refresh halaman.");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-blue-600 mb-4"></i>
          <p className="text-gray-600">Memuat data dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Error</p>
          <p>{error}</p>
          <button
            onClick={fetchDashboardData}
            className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">Dashboard</h2>
            <p className="text-gray-600">
              Overview sistem apotek PharmaHub - Data Real-Time dari Database
            </p>
          </div>
          <button
            onClick={fetchDashboardData}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            <i className="fas fa-sync-alt"></i>
            Refresh Data
          </button>
        </div>
      </header>

      {/* Dashboard Content */}
      <div className="p-6">
        {/* Stats Cards - Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <i className="fas fa-pills text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Obat Aktif
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.totalDrugs}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-orange-100 text-orange-600">
                <i className="fas fa-exclamation-triangle text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Stok Rendah</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.lowStockDrugs}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <i className="fas fa-shopping-cart text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Pesanan Hari Ini
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.todayOrders}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <i className="fas fa-clock text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Pesanan Pending
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.pendingOrders}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards - Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-emerald-100 text-emerald-600">
                <i className="fas fa-dollar-sign text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Revenue Hari Ini
                </p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatCurrency(stats.todayRevenue)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <i className="fas fa-chart-line text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Revenue Bulan Ini
                </p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatCurrency(stats.monthlyRevenue)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">
                <i className="fas fa-users text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Pelanggan
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.totalCustomers}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-pink-100 text-pink-600">
                <i className="fas fa-user-plus text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Pelanggan Baru Hari Ini
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.newCustomersToday}
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
              <h3 className="text-lg font-semibold text-gray-800">
                Aksi Cepat
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 gap-4">
                <Link
                  to="/admin/drugs"
                  className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <i className="fas fa-plus-circle text-blue-600 text-xl mr-4"></i>
                  <div>
                    <p className="font-medium text-gray-800">
                      Tambah Obat Baru
                    </p>
                    <p className="text-sm text-gray-600">
                      Menambahkan produk obat ke inventory
                    </p>
                  </div>
                </Link>
                <Link
                  to="/admin/orders"
                  className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <i className="fas fa-eye text-green-600 text-xl mr-4"></i>
                  <div>
                    <p className="font-medium text-gray-800">Lihat Pesanan</p>
                    <p className="text-sm text-gray-600">
                      Kelola pesanan masuk dan status
                    </p>
                  </div>
                </Link>
                <Link
                  to="/admin/reports"
                  className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <i className="fas fa-download text-purple-600 text-xl mr-4"></i>
                  <div>
                    <p className="font-medium text-gray-800">Export Laporan</p>
                    <p className="text-sm text-gray-600">
                      Download laporan penjualan
                    </p>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-800">
                Aktivitas Terbaru
              </h3>
            </div>
            <div className="p-6">
              {recentActivity.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <i className="fas fa-inbox text-4xl mb-3"></i>
                  <p>Belum ada aktivitas terbaru</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start">
                      <div
                        className={`w-2 h-2 mt-2 bg-${activity.color}-500 rounded-full mr-3 flex-shrink-0`}
                      ></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 break-words">
                          {activity.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;

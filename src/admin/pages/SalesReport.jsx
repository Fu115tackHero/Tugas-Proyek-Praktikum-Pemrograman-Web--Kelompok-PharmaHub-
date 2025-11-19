import { useState, useEffect } from 'react';

const SalesReport = () => {
  const [salesData, setSalesData] = useState({
    totalSales: 0,
    todaySales: 0,
    monthSales: 0,
    totalOrders: 0,
    completedOrders: 0,
    averageOrderValue: 0
  });
  const [bestSellingProducts, setBestSellingProducts] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [allTransactions, setAllTransactions] = useState([]);
  const [lowStockDrugs, setLowStockDrugs] = useState([]);
  const [periodFilter, setPeriodFilter] = useState('month');
  const [showCustomDate, setShowCustomDate] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    // Set default dates
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    setStartDate(firstDayOfMonth.toISOString().split('T')[0]);
    setEndDate(today.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    loadSalesData();
  }, [periodFilter, startDate, endDate]);

  const handlePeriodChange = (value) => {
    setPeriodFilter(value);
    if (value === 'custom') {
      setShowCustomDate(true);
    } else {
      setShowCustomDate(false);
      setDatesByPeriod(value);
    }
  };

  const setDatesByPeriod = (period) => {
    const today = new Date();
    let start = new Date();
    
    switch (period) {
      case 'today':
        start = today;
        break;
      case 'week':
        start = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      case 'quarter':
        start = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        start = new Date(today.getFullYear(), 0, 1);
        break;
      default:
        start = new Date(today.getFullYear(), today.getMonth(), 1);
    }
    
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(today.toISOString().split('T')[0]);
  };

  const loadSalesData = () => {
    // Load orders from localStorage
    const orders = JSON.parse(localStorage.getItem('adminOrders')) || [];
    
    // Filter by date range
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // Include full end date
    
    const filteredOrders = orders.filter(o => {
      const orderDate = new Date(o.date);
      return o.status === 'completed' && orderDate >= start && orderDate <= end;
    });
    
    // Calculate total sales from filtered orders
    const totalSales = filteredOrders.reduce((sum, order) => sum + order.total, 0);
    
    // Calculate today's sales
    const today = new Date().toDateString();
    const todayOrders = filteredOrders.filter(o => new Date(o.date).toDateString() === today);
    const todaySales = todayOrders.reduce((sum, order) => sum + order.total, 0);
    
    // Calculate this month's sales
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthOrders = filteredOrders.filter(o => {
      const orderDate = new Date(o.date);
      return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
    });
    const monthSales = monthOrders.reduce((sum, order) => sum + order.total, 0);
    
    // Calculate average order value
    const averageOrderValue = filteredOrders.length > 0 
      ? totalSales / filteredOrders.length 
      : 0;

    setSalesData({
      totalSales,
      todaySales,
      monthSales,
      totalOrders: filteredOrders.length,
      completedOrders: filteredOrders.length,
      averageOrderValue
    });

    // Calculate best selling products
    const productSales = {};
    filteredOrders.forEach(order => {
      order.items.forEach(item => {
        if (productSales[item.name]) {
          productSales[item.name].quantity += item.quantity;
          productSales[item.name].revenue += item.price * item.quantity;
        } else {
          productSales[item.name] = {
            name: item.name,
            quantity: item.quantity,
            revenue: item.price * item.quantity
          };
        }
      });
    });

    const bestSelling = Object.values(productSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
    setBestSellingProducts(bestSelling);

    // Get recent transactions (top 10)
    const recent = filteredOrders
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10);
    setRecentTransactions(recent);

    // Get all transactions for detail table
    const allTrans = filteredOrders
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    setAllTransactions(allTrans);

    // Load drugs and check for low stock
    const drugs = JSON.parse(localStorage.getItem('adminDrugs')) || [];
    const lowStock = drugs.filter(drug => drug.stock < 10).sort((a, b) => a.stock - b.stock);
    setLowStockDrugs(lowStock);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount).replace('IDR', 'Rp');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const downloadReport = () => {
    const reportData = {
      generatedAt: new Date().toISOString(),
      period: periodFilter,
      salesData,
      bestSellingProducts,
      recentTransactions
    };
    
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sales-report-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  return (
    <div>
      {/* Header */}
      <header className="bg-white shadow-sm border-b mb-6">
        <div className="px-6 py-4">
          <h2 className="text-2xl font-semibold text-gray-800">Laporan Penjualan</h2>
          <p className="text-gray-600">Analisis data transaksi dan monitoring penjualan</p>
        </div>
      </header>

      {/* Filter Section */}
      <div className="mx-6 mb-6 bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Periode Laporan</label>
              <select
                value={periodFilter}
                onChange={(e) => handlePeriodChange(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="today">Hari Ini</option>
                <option value="week">Minggu Ini</option>
                <option value="month">Bulan Ini</option>
                <option value="quarter">3 Bulan Terakhir</option>
                <option value="year">Tahun Ini</option>
                <option value="custom">Periode Kustom</option>
              </select>
            </div>
            {showCustomDate && (
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Rentang Tanggal</label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            )}
            <div className="flex items-end gap-2">
              <button
                onClick={loadSalesData}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg whitespace-nowrap"
              >
                Generate Report
              </button>
              <button
                onClick={downloadReport}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center"
              >
                <i className="fas fa-download mr-2"></i>
                Download
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sales Statistics Cards */}
      <div className="mx-6 grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Penjualan Hari Ini</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(salesData.todaySales)}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <i className="fas fa-calendar-day text-blue-600 text-2xl"></i>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Penjualan Bulan Ini</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(salesData.monthSales)}</p>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <i className="fas fa-calendar-alt text-green-600 text-2xl"></i>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Penjualan</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(salesData.totalSales)}</p>
            </div>
            <div className="p-3 rounded-full bg-purple-100">
              <i className="fas fa-money-bill-wave text-purple-600 text-2xl"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Order Statistics */}
      <div className="mx-6 grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Pesanan</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{salesData.totalOrders}</p>
            </div>
            <div className="p-3 rounded-full bg-yellow-100">
              <i className="fas fa-shopping-cart text-yellow-600 text-2xl"></i>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pesanan Selesai</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{salesData.completedOrders}</p>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <i className="fas fa-check-circle text-green-600 text-2xl"></i>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Rata-rata Nilai Pesanan</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(salesData.averageOrderValue)}</p>
            </div>
            <div className="p-3 rounded-full bg-indigo-100">
              <i className="fas fa-chart-line text-indigo-600 text-2xl"></i>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Best Selling Products */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Produk Terlaris</h3>
          </div>
          <div className="p-6">
            {bestSellingProducts.length === 0 ? (
              <p className="text-center text-gray-500 py-4">Belum ada data penjualan</p>
            ) : (
              <div className="space-y-4">
                {bestSellingProducts.map((product, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                        <span className="text-blue-600 font-bold">{idx + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-500">{product.quantity} terjual</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatCurrency(product.revenue)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Transaksi Terbaru</h3>
          </div>
          <div className="p-6">
            {recentTransactions.length === 0 ? (
              <p className="text-center text-gray-500 py-4">Belum ada transaksi</p>
            ) : (
              <div className="space-y-4">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between pb-4 border-b last:border-0">
                    <div>
                      <p className="font-medium text-gray-900">#{transaction.id}</p>
                      <p className="text-sm text-gray-500">{transaction.customerName}</p>
                      <p className="text-xs text-gray-400">{formatDate(transaction.date)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatCurrency(transaction.total)}</p>
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Selesai
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sales Chart Placeholder */}
      <div className="mx-6 bg-white rounded-lg shadow mt-6">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Grafik Penjualan</h3>
        </div>
        <div className="p-6">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8 text-center">
            <i className="fas fa-chart-area text-4xl text-blue-400 mb-3"></i>
            <p className="text-gray-600">
              Grafik penjualan akan ditampilkan di sini
            </p>
          </div>
        </div>
      </div>

      {/* Stock Alert Section */}
      <div className="mx-6 bg-white rounded-lg shadow mt-6">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            <i className="fas fa-exclamation-triangle text-yellow-500 mr-2"></i>
            Peringatan Stok
          </h3>
          <p className="text-sm text-gray-600">Obat dengan stok menipis yang perlu direstock</p>
        </div>
        <div className="p-6">
          {lowStockDrugs.length === 0 ? (
            <div className="text-center py-8">
              <i className="fas fa-check-circle text-4xl text-green-400 mb-3"></i>
              <p className="text-gray-600">Semua obat memiliki stok yang cukup</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Obat
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kategori
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stok Saat Ini
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {lowStockDrugs.map((drug) => (
                    <tr key={drug.id} className={drug.stock < 5 ? 'bg-red-50' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={drug.image || 'https://via.placeholder.com/40'}
                              alt={drug.name}
                              onError={(e) => e.target.src = 'https://via.placeholder.com/40'}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{drug.name}</div>
                            <div className="text-sm text-gray-500">{formatCurrency(drug.price)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {drug.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-sm font-semibold text-gray-900">{drug.stock}</span>
                          <span className="text-sm text-gray-500 ml-1">unit</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            drug.stock < 5
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {drug.stock < 5 ? 'Kritis' : 'Rendah'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => window.location.href = '/admin/drugs'}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <i className="fas fa-boxes mr-1"></i>
                          Restock
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Detailed Transactions Section */}
      <div className="mx-6 bg-white rounded-lg shadow mt-6 mb-6">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            <i className="fas fa-file-invoice text-blue-500 mr-2"></i>
            Detail Transaksi
          </h3>
          <p className="text-sm text-gray-600">Daftar lengkap semua transaksi dalam periode terpilih</p>
        </div>
        <div className="p-6">
          {allTransactions.length === 0 ? (
            <div className="text-center py-8">
              <i className="fas fa-inbox text-4xl text-gray-300 mb-3"></i>
              <p className="text-gray-600">Tidak ada transaksi dalam periode ini</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID Transaksi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tanggal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pelanggan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Items
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {allTransactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{transaction.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(transaction.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{transaction.customerName}</div>
                        <div className="text-sm text-gray-500">{transaction.customerPhone}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {transaction.items.map((item, idx) => (
                            <div key={idx} className="mb-1">
                              {item.name} x{item.quantity}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {formatCurrency(transaction.total)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          Selesai
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {allTransactions.length > 0 && (
                <div className="mt-4 text-sm text-gray-600 text-center">
                  Total: {allTransactions.length} transaksi | 
                  Total Penjualan: {formatCurrency(allTransactions.reduce((sum, t) => sum + t.total, 0))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalesReport;

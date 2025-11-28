import { useState, useEffect } from 'react';
import { getOrders, updateOrderStatus } from '../../utils/api';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [statusCounts, setStatusCounts] = useState({
    pending: 0,
    preparing: 0,
    ready: 0,
    completed: 0
  });

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    filterOrders();
    updateStatusCounts();
  }, [orders, searchTerm, statusFilter, dateFilter]);

  const loadOrders = async () => {
    try {
      const data = await getOrders();
      // Ensure orders are sorted by date descending (newest first)
      // The API already does this, but good to be safe or if API changes
      const sortedOrders = data.sort((a, b) => new Date(b.date) - new Date(a.date));
      setOrders(sortedOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
      alert('Gagal memuat pesanan.');
    }
  };

  const filterOrders = () => {
    let filtered = orders.filter(order => {
      const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          order.customerPhone.includes(searchTerm);
      const matchesStatus = !statusFilter || order.status === statusFilter;
      const matchesDate = filterByDate(order.date, dateFilter);
      
      return matchesSearch && matchesStatus && matchesDate;
    });
    setFilteredOrders(filtered);
  };

  const filterByDate = (orderDate, filter) => {
    const orderDay = new Date(orderDate);
    const today = new Date();
    
    switch (filter) {
      case 'today':
        return orderDay.toDateString() === today.toDateString();
      case 'week':
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        return orderDay >= weekAgo;
      case 'month':
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        return orderDay >= monthAgo;
      default:
        return true;
    }
  };

  const updateStatusCounts = () => {
    const counts = {
      pending: orders.filter(o => o.status === 'pending').length,
      preparing: orders.filter(o => o.status === 'preparing').length,
      ready: orders.filter(o => o.status === 'ready').length,
      completed: orders.filter(o => o.status === 'completed').length
    };
    setStatusCounts(counts);
  };

  const openDetailModal = (order) => {
    setCurrentOrder(order);
    setShowDetailModal(true);
  };

  const openStatusModal = (order) => {
    setCurrentOrder(order);
    setNewStatus(order.status);
    setStatusNote('');
    setShowStatusModal(true);
  };

  const handleStatusUpdate = async () => {
    if (!currentOrder) return;

    try {
      // Use API to update status
      // Note: currentOrder.dbId is the numeric ID from database, currentOrder.id is the string ID (ORD-...)
      // The API controller expects the ID used in the route. 
      // If we use /api/orders/:id/status, and pass currentOrder.id (string), the controller handles it.
      await updateOrderStatus(currentOrder.id, newStatus);
      
      // Refresh orders
      await loadOrders();
      setShowStatusModal(false);
      alert('Status pesanan berhasil diperbarui!');
      
      // Sync logic (optional, if you still want to keep local sync for some reason, but better to rely on API)
      // For now, we'll skip the complex syncOrderHistoryAndNotifications as it relies on localStorage
      // which might not be relevant if we are fully moving to backend.
      // But if the user app still uses localStorage for history, we might need it.
      // Let's keep it simple for now and assume backend handles everything.
      
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Gagal memperbarui status pesanan.');
    }
  };

  const cancelOrder = async (orderId) => {
    if (!confirm('Apakah Anda yakin ingin membatalkan pesanan ini?')) return;

    try {
      await updateOrderStatus(orderId, 'cancelled');
      await loadOrders();
      alert('Pesanan berhasil dibatalkan!');
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert('Gagal membatalkan pesanan.');
    }
  };

  const getStatusClass = (status) => {
    const classes = {
      pending: 'bg-yellow-100 text-yellow-800',
      preparing: 'bg-blue-100 text-blue-800',
      ready: 'bg-green-100 text-green-800',
      completed: 'bg-purple-100 text-purple-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'Pending',
      preparing: 'Sedang Disiapkan',
      ready: 'Siap Diambil',
      completed: 'Selesai',
      cancelled: 'Dibatalkan'
    };
    return texts[status] || status;
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
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };





  return (
    <div>
      {/* Header */}
      <header className="bg-white shadow-sm border-b mb-6">
        <div className="px-6 py-4">
          <h2 className="text-2xl font-semibold text-gray-800">Manajemen Pesanan</h2>
          <p className="text-gray-600">Kelola pesanan masuk dan update status</p>
        </div>
      </header>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari pesanan (ID, nama pelanggan)..."
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Semua Status</option>
                <option value="pending">Pending</option>
                <option value="preparing">Sedang Disiapkan</option>
                <option value="ready">Siap Diambil</option>
                <option value="completed">Selesai</option>
                <option value="cancelled">Dibatalkan</option>
              </select>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="today">Hari Ini</option>
                <option value="week">Minggu Ini</option>
                <option value="month">Bulan Ini</option>
                <option value="all">Semua</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-yellow-100 text-yellow-600">
              <i className="fas fa-clock text-lg"></i>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-xl font-semibold text-gray-900">{statusCounts.pending}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-blue-100 text-blue-600">
              <i className="fas fa-cog text-lg"></i>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Disiapkan</p>
              <p className="text-xl font-semibold text-gray-900">{statusCounts.preparing}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-green-100 text-green-600">
              <i className="fas fa-check text-lg"></i>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Siap Diambil</p>
              <p className="text-xl font-semibold text-gray-900">{statusCounts.ready}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-purple-100 text-purple-600">
              <i className="fas fa-check-double text-lg"></i>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Selesai</p>
              <p className="text-xl font-semibold text-gray-900">{statusCounts.completed}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <i className="fas fa-shopping-cart text-gray-400 text-4xl mb-4"></i>
            <p className="text-gray-500">Tidak ada pesanan ditemukan</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Pesanan #{order.id}</h3>
                    <p className="text-sm text-gray-600">{formatDate(order.date)} • {order.customerName}</p>
                    <p className="text-sm text-gray-600">{order.customerPhone}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        order.paymentMethod === 'bayar_ditempat' || order.paymentMethod === 'cod'
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {order.paymentMethod === 'bayar_ditempat' || order.paymentMethod === 'cod' ? 'Bayar di Tempat' : 'Transfer Online'}
                      </span>
                      {(order.paymentMethod === 'bayar_ditempat' || order.paymentMethod === 'cod') && (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">
                          <i className="fas fa-money-bill-wave mr-1"></i>
                          Belum Dibayar
                        </span>
                      )}
                      {(order.paymentMethod === 'pembayaran_online' || order.paymentMethod === 'online') && order.paymentStatus === 'paid' && (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          <i className="fas fa-check-circle mr-1"></i>
                          Lunas
                        </span>
                      )}
                      {(order.paymentMethod === 'pembayaran_online' || order.paymentMethod === 'online') && order.paymentStatus === 'pending' && (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          <i className="fas fa-clock mr-1"></i>
                          Menunggu
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">{formatCurrency(order.total)}</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-2">Item Pesanan:</h4>
                  <div className="space-y-2">
                    {order.items && order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-gray-600">{item.product_name || item.name} x{item.quantity}</span>
                        <span className="text-gray-900">{formatCurrency((item.price || item.product_price) * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {order.notes && (
                  <div className="border-t pt-4 mt-4">
                    <h4 className="font-medium text-gray-900 mb-2">Catatan:</h4>
                    <p className="text-sm text-gray-600">{order.notes}</p>
                  </div>
                )}
                
                <div className="flex justify-between items-center mt-6 pt-4 border-t">
                  <button
                    onClick={() => openDetailModal(order)}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    <i className="fas fa-eye mr-1"></i>
                    Lihat Detail
                  </button>
                  <div className="flex gap-2">
                    {order.status !== 'completed' && order.status !== 'cancelled' && (
                      <button
                        onClick={() => openStatusModal(order)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
                      >
                        <i className="fas fa-edit mr-1"></i>
                        Update Status
                      </button>
                    )}
                    {order.status === 'pending' && (
                      <button
                        onClick={() => cancelOrder(order.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm"
                      >
                        <i className="fas fa-times mr-1"></i>
                        Batalkan
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Order Detail Modal */}
      {showDetailModal && currentOrder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Detail Pesanan #{currentOrder.id}</h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Informasi Pelanggan</h4>
                  <p className="text-sm text-gray-600">Nama: {currentOrder.customerName}</p>
                  <p className="text-sm text-gray-600">Email: {currentOrder.customerEmail}</p>
                  <p className="text-sm text-gray-600">Telepon: {currentOrder.customerPhone}</p>
                  <p className="text-sm text-gray-600">Tanggal: {formatDate(currentOrder.date)}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Informasi Pembayaran</h4>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      currentOrder.paymentMethod === 'bayar_ditempat' || currentOrder.paymentMethod === 'cod'
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {currentOrder.paymentMethod === 'bayar_ditempat' || currentOrder.paymentMethod === 'cod' ? 'Bayar di Tempat' : 'Transfer Online'}
                    </span>
                    
                    {(currentOrder.paymentMethod === 'bayar_ditempat' || currentOrder.paymentMethod === 'cod') ? (
                      <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">
                        <i className="fas fa-money-bill-wave mr-1"></i>
                        Belum Dibayar
                      </span>
                    ) : (
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        currentOrder.paymentStatus === 'paid' 
                          ? 'bg-green-100 text-green-800' 
                          : currentOrder.paymentStatus === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        <i className={`fas ${
                          currentOrder.paymentStatus === 'paid' 
                            ? 'fa-check-circle' 
                            : currentOrder.paymentStatus === 'pending'
                            ? 'fa-clock'
                            : 'fa-times-circle'
                        } mr-1`}></i>
                        {currentOrder.paymentStatus === 'paid' 
                          ? 'Pembayaran Terverifikasi' 
                          : currentOrder.paymentStatus === 'pending'
                          ? 'Menunggu Pembayaran'
                          : 'Pembayaran Gagal'}
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Item Pesanan</h4>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Produk</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Harga</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {currentOrder.items && currentOrder.items.map((item, idx) => (
                          <tr key={idx}>
                            <td className="px-4 py-2 text-sm text-gray-900">{item.product_name || item.name}</td>
                            <td className="px-4 py-2 text-sm text-gray-900">{item.quantity}</td>
                            <td className="px-4 py-2 text-sm text-gray-900">{formatCurrency(item.price || item.product_price)}</td>
                            <td className="px-4 py-2 text-sm text-gray-900">{formatCurrency((item.price || item.product_price) * item.quantity)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-2 text-right">
                    <p className="text-lg font-semibold text-gray-900">Total: {formatCurrency(currentOrder.total)}</p>
                  </div>
                </div>

                {currentOrder.notes && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Catatan</h4>
                    <p className="text-sm text-gray-600">{currentOrder.notes}</p>
                  </div>
                )}

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Status</h4>
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusClass(currentOrder.status)}`}>
                    {getStatusText(currentOrder.status)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && currentOrder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Update Status Pesanan</h3>
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Status Baru</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="pending">Pending</option>
                  <option value="preparing">Sedang Disiapkan</option>
                  <option value="ready">Siap Diambil</option>
                  <option value="completed">Selesai</option>
                  <option value="cancelled">Dibatalkan</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Catatan (Opsional)</label>
                <textarea
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  rows="3"
                  placeholder="Tambahkan catatan untuk customer..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  onClick={handleStatusUpdate}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Update Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;

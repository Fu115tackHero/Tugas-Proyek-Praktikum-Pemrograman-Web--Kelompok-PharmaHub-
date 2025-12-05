import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import OrderService from "../../services/order.service";

const OrderManagement = () => {
  const { getToken } = useAuth();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [statusNote, setStatusNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [statusCounts, setStatusCounts] = useState({
    pending: 0,
    preparing: 0,
    ready: 0,
    completed: 0,
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
      setLoading(true);
      setError("");
      const token = getToken();

      if (!token) {
        setError("Sesi login telah berakhir. Silakan login kembali.");
        return;
      }

      const result = await OrderService.getAllOrders(token);

      if (result.success && result.orders) {
        setOrders(result.orders);
      } else {
        setError("Format response tidak valid");
      }
    } catch (err) {
      console.error("Error loading orders:", err);
      setError(err.message || "Gagal memuat data pesanan");
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = orders.filter((order) => {
      const matchesSearch =
        order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer_phone?.includes(searchTerm);
      const matchesStatus =
        !statusFilter || order.order_status === statusFilter;
      const matchesDate = filterByDate(order.created_at, dateFilter);

      return matchesSearch && matchesStatus && matchesDate;
    });
    setFilteredOrders(filtered);
  };

  const filterByDate = (orderDate, filter) => {
    const orderDay = new Date(orderDate);
    const today = new Date();

    switch (filter) {
      case "today":
        return orderDay.toDateString() === today.toDateString();
      case "week":
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        return orderDay >= weekAgo;
      case "month":
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        return orderDay >= monthAgo;
      default:
        return true;
    }
  };

  const updateStatusCounts = () => {
    const counts = {
      pending: orders.filter((o) => o.order_status === "pending").length,
      preparing: orders.filter((o) => o.order_status === "preparing").length,
      ready: orders.filter((o) => o.order_status === "ready").length,
      completed: orders.filter((o) => o.order_status === "completed").length,
    };
    setStatusCounts(counts);
  };

  const openDetailModal = async (order) => {
    setCurrentOrder(order);
    setShowDetailModal(true);
    
    // Fetch full order details with items
    try {
      const token = getToken();
      const detailResult = await OrderService.getOrderDetails(order.order_id, token);
      
      if (detailResult.success && detailResult.order) {
        setCurrentOrder(detailResult.order);
      }
    } catch (err) {
      console.error("Error fetching order details:", err);
    }
  };

  const openStatusModal = (order) => {
    setCurrentOrder(order);
    setNewStatus(order.order_status);
    setStatusNote("");
    setShowStatusModal(true);
  };

  const handleStatusUpdate = async () => {
    if (!currentOrder) return;

    try {
      setLoading(true);
      const token = getToken();

      if (!token) {
        alert("Sesi login telah berakhir. Silakan login kembali.");
        return;
      }

      const result = await OrderService.updateOrderStatus(
        currentOrder.order_id,
        newStatus,
        token,
        statusNote // Send admin notes to backend
      );

      if (result.success) {
        // Reload orders to get fresh data
        await loadOrders();
        setShowStatusModal(false);
        alert("Status pesanan berhasil diperbarui!");
      } else {
        alert("Gagal memperbarui status pesanan");
      }
    } catch (err) {
      console.error("Error updating order status:", err);
      alert(err.message || "Gagal memperbarui status pesanan");
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (orderId) => {
    if (!confirm("Apakah Anda yakin ingin membatalkan pesanan ini?")) return;

    try {
      setLoading(true);
      const token = getToken();

      if (!token) {
        alert("Sesi login telah berakhir. Silakan login kembali.");
        return;
      }

      const result = await OrderService.cancelOrder(
        orderId,
        "Dibatalkan oleh admin",
        token
      );

      if (result.success) {
        // Reload orders to get fresh data
        await loadOrders();
        alert("Pesanan berhasil dibatalkan");
      } else {
        alert("Gagal membatalkan pesanan");
      }
    } catch (err) {
      console.error("Error cancelling order:", err);
      alert(err.message || "Gagal membatalkan pesanan");
    } finally {
      setLoading(false);
    }
  };

  const archiveOrder = async (orderId) => {
    if (
      !confirm(
        "Arsipkan pesanan ini? Pesanan akan disembunyikan dari daftar tapi tetap ada di database."
      )
    )
      return;

    try {
      setLoading(true);
      const token = getToken();

      if (!token) {
        alert("Sesi login telah berakhir. Silakan login kembali.");
        return;
      }

      const result = await OrderService.archiveOrder(orderId, token);

      if (result.success) {
        // Reload orders to get fresh data (archived orders will be excluded)
        await loadOrders();
        alert("Pesanan berhasil diarsipkan");
      } else {
        alert("Gagal mengarsipkan pesanan");
      }
    } catch (err) {
      console.error("Error archiving order:", err);
      alert(err.message || "Gagal mengarsipkan pesanan");
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status) => {
    const classes = {
      pending: "bg-yellow-100 text-yellow-800",
      preparing: "bg-blue-100 text-blue-800",
      ready: "bg-green-100 text-green-800",
      completed: "bg-purple-100 text-purple-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return classes[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusText = (status) => {
    const texts = {
      pending: "Pending",
      preparing: "Sedang Disiapkan",
      ready: "Siap Diambil",
      completed: "Selesai",
      cancelled: "Dibatalkan",
    };
    return texts[status] || status;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    })
      .format(amount)
      .replace("IDR", "Rp");
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const mapAdminStatusToCustomerStatus = (
    status,
    paymentMethod,
    paymentStatus
  ) => {
    switch (status) {
      case "preparing":
        return "Sedang disiapkan di apotek";
      case "ready":
        return "Siap diambil di apotek";
      case "completed":
        if (paymentMethod === "online" || paymentStatus === "paid") {
          return "Lunas (Selesai)";
        }
        return "Selesai";
      case "cancelled":
        return "Dibatalkan oleh apotek";
      case "pending":
      default:
        if (paymentMethod === "online" && paymentStatus === "paid") {
          return "Lunas (Menunggu Diproses)";
        }
        return "Menunggu Diproses";
    }
  };

  return (
    <div>
      {/* Header */}
      <header className="bg-white shadow-sm border-b mb-6">
        <div className="px-6 py-4">
          <h2 className="text-2xl font-semibold text-gray-800">
            Manajemen Pesanan
          </h2>
          <p className="text-gray-600">
            Kelola pesanan masuk dan update status
          </p>
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
              <p className="text-xl font-semibold text-gray-900">
                {statusCounts.pending}
              </p>
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
              <p className="text-xl font-semibold text-gray-900">
                {statusCounts.preparing}
              </p>
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
              <p className="text-xl font-semibold text-gray-900">
                {statusCounts.ready}
              </p>
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
              <p className="text-xl font-semibold text-gray-900">
                {statusCounts.completed}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white rounded-lg shadow p-8">
            <div className="flex flex-col items-center justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600">Memuat data pesanan...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg shadow p-8">
            <div className="flex flex-col items-center justify-center py-8">
              <i className="fas fa-exclamation-triangle text-red-500 text-5xl mb-4"></i>
              <p className="text-red-600 font-semibold mb-2">
                Gagal memuat data pesanan
              </p>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={loadOrders}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
              >
                <i className="fas fa-redo mr-2"></i>Coba Lagi
              </button>
            </div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <i className="fas fa-shopping-cart text-gray-400 text-4xl mb-4"></i>
            <p className="text-gray-500">Tidak ada pesanan ditemukan</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div key={order.order_id} className="bg-white rounded-lg shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Pesanan #{order.order_number}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {formatDate(order.created_at)} • {order.customer_name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {order.customer_phone}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          order.payment_method === "bayar_ditempat"
                            ? "bg-green-100 text-green-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {order.payment_method === "bayar_ditempat"
                          ? "Bayar di Tempat"
                          : "Transfer Online"}
                      </span>
                      {order.payment_method === "bayar_ditempat" && (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">
                          <i className="fas fa-money-bill-wave mr-1"></i>
                          Belum Dibayar
                        </span>
                      )}
                      {order.payment_method === "pembayaran_online" &&
                        order.payment_status === "paid" && (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            <i className="fas fa-check-circle mr-1"></i>
                            Lunas
                          </span>
                        )}
                      {order.payment_method === "pembayaran_online" &&
                        order.payment_status === "pending" && (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            <i className="fas fa-clock mr-1"></i>
                            Menunggu
                          </span>
                        )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">
                      {formatCurrency(order.total_amount)}
                    </p>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(
                        order.order_status
                      )}`}
                    >
                      {getStatusText(order.order_status)}
                    </span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-2">
                    Item Pesanan:
                  </h4>
                  {order.items && order.items.length > 0 ? (
                    <div className="space-y-1">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-gray-700">
                            • {item.product_name}
                          </span>
                          <span className="text-gray-600 font-medium">
                            x{item.quantity}
                          </span>
                        </div>
                      ))}
                      <div className="mt-2 pt-2 border-t text-sm text-gray-500">
                        Total: {order.total_items} item ({order.total_quantity} qty)
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-600">
                      {order.total_items} item ({order.total_quantity} total qty)
                    </div>
                  )}
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
                    {order.order_status !== "completed" &&
                      order.order_status !== "cancelled" && (
                        <button
                          onClick={() => openStatusModal(order)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
                        >
                          <i className="fas fa-edit mr-1"></i>
                          Update Status
                        </button>
                      )}
                    {order.order_status === "pending" && (
                      <button
                        onClick={() => cancelOrder(order.order_id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm"
                      >
                        <i className="fas fa-times mr-1"></i>
                        Batalkan
                      </button>
                    )}
                    {(order.order_status === "completed" ||
                      order.order_status === "cancelled") && (
                      <button
                        onClick={() => archiveOrder(order.order_id)}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm"
                        title="Arsipkan pesanan (sembunyikan dari daftar)"
                      >
                        <i className="fas fa-archive mr-1"></i>
                        Arsipkan
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
                <h3 className="text-lg font-medium text-gray-900">
                  Detail Pesanan #{currentOrder.order_number}
                </h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Informasi Pelanggan
                  </h4>
                  <p className="text-sm text-gray-600">
                    Nama: {currentOrder.customer_name}
                  </p>
                  <p className="text-sm text-gray-600">
                    Email: {currentOrder.customer_email}
                  </p>
                  <p className="text-sm text-gray-600">
                    Telepon: {currentOrder.customer_phone}
                  </p>
                  <p className="text-sm text-gray-600">
                    Tanggal: {formatDate(currentOrder.created_at)}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Informasi Pembayaran
                  </h4>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        currentOrder.payment_method === "bayar_ditempat"
                          ? "bg-green-100 text-green-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {currentOrder.payment_method === "bayar_ditempat"
                        ? "Bayar di Tempat"
                        : "Transfer Online"}
                    </span>

                    {currentOrder.payment_method === "bayar_ditempat" ? (
                      <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">
                        <i className="fas fa-money-bill-wave mr-1"></i>
                        Belum Dibayar
                      </span>
                    ) : (
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          currentOrder.payment_status === "paid"
                            ? "bg-green-100 text-green-800"
                            : currentOrder.payment_status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        <i
                          className={`fas ${
                            currentOrder.payment_status === "paid"
                              ? "fa-check-circle"
                              : currentOrder.payment_status === "pending"
                              ? "fa-clock"
                              : "fa-times-circle"
                          } mr-1`}
                        ></i>
                        {currentOrder.payment_status === "paid"
                          ? "Pembayaran Terverifikasi"
                          : currentOrder.payment_status === "pending"
                          ? "Menunggu Pembayaran"
                          : "Pembayaran Gagal"}
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Item Pesanan
                  </h4>
                  
                  {currentOrder.items && currentOrder.items.length > 0 ? (
                    <div className="space-y-3">
                      {currentOrder.items.map((item, index) => (
                        <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                          {item.product_image && (
                            <img 
                              src={item.product_image} 
                              alt={item.product_name}
                              className="w-16 h-16 object-cover rounded"
                            />
                          )}
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{item.product_name}</p>
                            <p className="text-sm text-gray-600">
                              {formatCurrency(item.product_price)} x {item.quantity}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">
                              {formatCurrency(item.subtotal)}
                            </p>
                          </div>
                        </div>
                      ))}
                      
                      <div className="border-t pt-3 mt-3">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Subtotal</span>
                          <span>{formatCurrency(currentOrder.subtotal)}</span>
                        </div>
                        {currentOrder.tax_amount > 0 && (
                          <div className="flex justify-between text-sm text-gray-600 mb-1">
                            <span>Pajak</span>
                            <span>{formatCurrency(currentOrder.tax_amount)}</span>
                          </div>
                        )}
                        {currentOrder.discount_amount > 0 && (
                          <div className="flex justify-between text-sm text-green-600 mb-1">
                            <span>Diskon</span>
                            <span>-{formatCurrency(currentOrder.discount_amount)}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-lg font-semibold text-gray-900 mt-2 pt-2 border-t">
                          <span>Total</span>
                          <span>{formatCurrency(currentOrder.total_amount)}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-600">
                      <p>Total Items: {currentOrder.total_items}</p>
                      <p>Total Quantity: {currentOrder.total_quantity}</p>
                      <div className="mt-2 text-right">
                        <p className="text-lg font-semibold text-gray-900">
                          Total: {formatCurrency(currentOrder.total_amount)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {currentOrder.notes && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Catatan
                    </h4>
                    <p className="text-sm text-gray-600">
                      {currentOrder.notes}
                    </p>
                  </div>
                )}

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Status</h4>
                  <span
                    className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusClass(
                      currentOrder.order_status
                    )}`}
                  >
                    {getStatusText(currentOrder.order_status)}
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
                <h3 className="text-lg font-medium text-gray-900">
                  Update Status Pesanan
                </h3>
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status Baru
                </label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catatan (Opsional)
                </label>
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

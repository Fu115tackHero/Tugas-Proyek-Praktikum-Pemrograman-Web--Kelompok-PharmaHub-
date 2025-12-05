import React, { useState, useEffect } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

const AutoSalesReport = () => {
  // State management
  const [report, setReport] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [transactionDetails, setTransactionDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedRows, setExpandedRows] = useState({}); // Track which rows are expanded

  // Filter state
  const [periodFilter, setPeriodFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showCustomDate, setShowCustomDate] = useState(false);

  // Modal state
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Load data on mount and when filters change
  useEffect(() => {
    loadAllData();
  }, [startDate, endDate]);

  // Update date range when period filter changes
  useEffect(() => {
    const today = new Date();
    const formatDate = (date) => date.toISOString().split("T")[0];

    switch (periodFilter) {
      case "today":
        setStartDate(formatDate(today));
        setEndDate(formatDate(today));
        setShowCustomDate(false);
        break;
      case "week":
        const weekAgo = new Date(today);
        weekAgo.setDate(today.getDate() - 7);
        setStartDate(formatDate(weekAgo));
        setEndDate(formatDate(today));
        setShowCustomDate(false);
        break;
      case "month":
        const monthAgo = new Date(today);
        monthAgo.setMonth(today.getMonth() - 1);
        setStartDate(formatDate(monthAgo));
        setEndDate(formatDate(today));
        setShowCustomDate(false);
        break;
      case "custom":
        setShowCustomDate(true);
        break;
      default: // 'all'
        setStartDate("");
        setEndDate("");
        setShowCustomDate(false);
    }
  }, [periodFilter]);

  const loadAllData = async () => {
    console.log("📊 [AutoSalesReport] Loading all data...");
    console.log("   Start Date:", startDate);
    console.log("   End Date:", endDate);

    setLoading(true);
    setError(null);

    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      console.log("📊 [AutoSalesReport] Fetching report summary...");
      const reportResponse = await axios.get(
        `${API_URL}/auto-sales-reports/generate`,
        { params }
      );
      console.log("✅ [AutoSalesReport] Report received:", reportResponse.data);
      setReport(reportResponse.data.data);

      console.log("📊 [AutoSalesReport] Fetching transactions...");
      const transResponse = await axios.get(
        `${API_URL}/auto-sales-reports/transactions`,
        {
          params: { ...params, limit: 100 },
        }
      );
      console.log(
        "✅ [AutoSalesReport] Transactions received:",
        transResponse.data.count
      );
      setTransactions(transResponse.data.data);

      console.log("📊 [AutoSalesReport] Fetching low stock products...");
      const lowStockResponse = await axios.get(
        `${API_URL}/auto-sales-reports/low-stock`
      );
      console.log(
        "✅ [AutoSalesReport] Low stock products received:",
        lowStockResponse.data.count
      );
      setLowStockProducts(lowStockResponse.data.data);

      console.log("✅ [AutoSalesReport] All data loaded successfully");
    } catch (err) {
      console.error("❌ [AutoSalesReport] Error loading data:", err);
      console.error("   Error details:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Failed to load sales data");
    } finally {
      setLoading(false);
    }
  };

  const viewTransactionDetails = async (transaction) => {
    console.log(
      "🔍 [AutoSalesReport] Viewing details for order:",
      transaction.order_id
    );

    try {
      const response = await axios.get(
        `${API_URL}/auto-sales-reports/transactions/${transaction.order_id}`
      );
      console.log(
        "✅ [AutoSalesReport] Details received:",
        response.data.count,
        "items"
      );
      setSelectedTransaction(transaction);
      setTransactionDetails(response.data.data);
      setShowDetailsModal(true);
    } catch (err) {
      console.error("❌ [AutoSalesReport] Error fetching details:", err);
      alert("Failed to load transaction details");
    }
  };

  const toggleRowExpansion = async (transaction) => {
    const orderId = transaction.order_id;

    // If already expanded, collapse it
    if (expandedRows[orderId]) {
      setExpandedRows((prev) => {
        const newState = { ...prev };
        delete newState[orderId];
        return newState;
      });
      return;
    }

    // Otherwise, expand and load details
    try {
      const response = await axios.get(
        `${API_URL}/auto-sales-reports/transactions/${transaction.order_id}`
      );

      setExpandedRows((prev) => ({
        ...prev,
        [orderId]: {
          transaction,
          items: response.data.data,
        },
      }));
    } catch (err) {
      console.error("❌ [AutoSalesReport] Error fetching details:", err);
      alert("Failed to load transaction details");
    }
  };

  const exportData = async (format) => {
    console.log("📄 [AutoSalesReport] Exporting as", format);

    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const url = `${API_URL}/auto-sales-reports/export/${format}`;
      console.log("📄 [AutoSalesReport] Export URL:", url);

      const response = await axios.get(url, {
        params,
        responseType: format === "csv" ? "text" : "json",
      });

      console.log("✅ [AutoSalesReport] Export successful");

      // Create download link
      const blob = new Blob(
        [
          format === "csv"
            ? response.data
            : JSON.stringify(response.data, null, 2),
        ],
        { type: format === "csv" ? "text/csv" : "application/json" }
      );
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `sales-report-${
        new Date().toISOString().split("T")[0]
      }.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      console.log("✅ [AutoSalesReport] File downloaded");
    } catch (err) {
      console.error("❌ [AutoSalesReport] Export error:", err);
      alert(`Failed to export ${format.toUpperCase()}`);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Loading sales data...</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Laporan Penjualan
        </h1>
        <p className="text-gray-600">
          Auto-generated dari transaksi yang sudah selesai
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Filter and Export */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          {/* Period Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Periode
            </label>
            <select
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Semua Waktu</option>
              <option value="today">Hari Ini</option>
              <option value="week">7 Hari Terakhir</option>
              <option value="month">30 Hari Terakhir</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          {/* Custom Date Range */}
          {showCustomDate && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal Mulai
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal Akhir
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          )}

          {/* Export Buttons */}
          <div className="ml-auto flex gap-2">
            <button
              onClick={() => exportData("csv")}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              📄 Export CSV
            </button>
            <button
              onClick={() => exportData("json")}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              📦 Export JSON
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {report && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Total Pesanan
            </h3>
            <p className="text-2xl font-bold text-gray-800">
              {report.total_orders || 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Completed: {report.completed_orders} | Cancelled:{" "}
              {report.cancelled_orders}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Total Revenue
            </h3>
            <p className="text-2xl font-bold text-blue-600">
              {formatCurrency(report.total_revenue)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Tax: {formatCurrency(report.total_tax)}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Net Revenue
            </h3>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(report.net_revenue)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Discount: {formatCurrency(report.total_discount)}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Produk Terlaris
            </h3>
            <p className="text-lg font-bold text-purple-600">
              {report.top_selling_product_name || "-"}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Terjual: {report.top_selling_quantity} unit
            </p>
          </div>
        </div>
      )}

      {/* Low Stock Products */}
      {lowStockProducts.length > 0 && (
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            ⚠️ Produk Stok Rendah (&lt; 10)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lowStockProducts.map((product) => (
              <div key={product.product_id} className="border rounded-lg p-4">
                <div className="flex items-center gap-3">
                  {product.main_image_url && (
                    <img
                      src={product.main_image_url}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-600">{product.brand}</p>
                    <div className="mt-1">
                      <span
                        className={`text-sm font-bold ${
                          product.stock < 5 ? "text-red-600" : "text-orange-600"
                        }`}
                      >
                        Stok: {product.stock}
                      </span>
                      <span className="text-sm text-gray-500 ml-2">
                        Min: {product.min_stock}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-blue-600 mt-1">
                      {formatCurrency(product.price)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed Transactions Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">
            Transaksi yang Selesai ({transactions.length})
          </h2>
          <div className="text-sm text-gray-600">
            <i className="fas fa-info-circle mr-1"></i>
            Klik baris untuk melihat detail lengkap
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-8">
                  #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Order Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Subtotal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Tax
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Discount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.length === 0 ? (
                <tr>
                  <td
                    colSpan="11"
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    Tidak ada transaksi yang selesai
                  </td>
                </tr>
              ) : (
                transactions.map((transaction, index) => {
                  const isExpanded = expandedRows[transaction.order_id];
                  return (
                    <React.Fragment key={transaction.order_id}>
                      <tr
                        className="hover:bg-blue-50 cursor-pointer transition-colors"
                        onClick={() => toggleRowExpansion(transaction)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <i
                            className={`fas fa-chevron-${
                              isExpanded ? "down" : "right"
                            } text-gray-400`}
                          ></i>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {transaction.order_number}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="font-medium">
                            {transaction.customer_name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {transaction.customer_phone}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="font-medium">
                            {transaction.payment_method}
                          </div>
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                              transaction.payment_status === "paid" ||
                              transaction.payment_status === "dibayar"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            <i
                              className={`fas ${
                                transaction.payment_status === "paid" ||
                                transaction.payment_status === "dibayar"
                                  ? "fa-check-circle"
                                  : "fa-exclamation-circle"
                              } mr-1`}
                            ></i>
                            {transaction.payment_status === "paid" ||
                            transaction.payment_status === "dibayar"
                              ? "Dibayar"
                              : transaction.payment_status === "belum_dibayar"
                              ? "Belum Dibayar"
                              : transaction.payment_status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {formatCurrency(transaction.subtotal || 0)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {formatCurrency(transaction.tax_amount || 0)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                          -{formatCurrency(transaction.discount_amount || 0)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600">
                          {formatCurrency(transaction.total_amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                            {transaction.total_items} items
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(transaction.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              viewTransactionDetails(transaction);
                            }}
                            className="text-blue-600 hover:text-blue-900 hover:underline"
                          >
                            <i className="fas fa-external-link-alt mr-1"></i>
                            Detail
                          </button>
                        </td>
                      </tr>

                      {/* Expanded Row - Item Details */}
                      {isExpanded && (
                        <tr>
                          <td colSpan="11" className="px-6 py-4 bg-gray-50">
                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                              <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                                <i className="fas fa-shopping-bag mr-2 text-blue-600"></i>
                                Detail Barang ({isExpanded.items.length} items)
                              </h4>

                              <div className="overflow-x-auto">
                                <table className="min-w-full">
                                  <thead>
                                    <tr className="border-b">
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">
                                        Produk
                                      </th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">
                                        Harga Satuan
                                      </th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">
                                        Quantity
                                      </th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">
                                        Subtotal
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {isExpanded.items.map((item) => (
                                      <tr
                                        key={item.order_item_id}
                                        className="border-b hover:bg-gray-50"
                                      >
                                        <td className="px-4 py-3">
                                          <div className="flex items-center gap-3">
                                            {item.main_image_url && (
                                              <img
                                                src={item.main_image_url}
                                                alt={item.product_name}
                                                className="w-12 h-12 object-cover rounded border"
                                              />
                                            )}
                                            <div>
                                              <div className="text-sm font-medium text-gray-900">
                                                {item.product_name}
                                              </div>
                                              <div className="text-xs text-gray-500">
                                                {item.brand}
                                              </div>
                                            </div>
                                          </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-700">
                                          {formatCurrency(item.product_price)}
                                        </td>
                                        <td className="px-4 py-3">
                                          <span className="text-sm font-medium text-gray-900">
                                            {item.quantity}x
                                          </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                                          {formatCurrency(item.subtotal)}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                  <tfoot>
                                    <tr className="bg-gray-50 font-semibold">
                                      <td
                                        colSpan="3"
                                        className="px-4 py-3 text-right text-sm text-gray-700"
                                      >
                                        Total Barang:
                                      </td>
                                      <td className="px-4 py-3 text-sm text-gray-900">
                                        {formatCurrency(
                                          isExpanded.items.reduce(
                                            (sum, item) =>
                                              sum + parseFloat(item.subtotal),
                                            0
                                          )
                                        )}
                                      </td>
                                    </tr>
                                  </tfoot>
                                </table>
                              </div>

                              {/* Transaction Summary */}
                              <div className="mt-4 pt-4 border-t">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                  <div>
                                    <span className="text-gray-600">
                                      Subtotal:
                                    </span>
                                    <div className="font-semibold">
                                      {formatCurrency(
                                        isExpanded.transaction.subtotal || 0
                                      )}
                                    </div>
                                  </div>
                                  <div>
                                    <span className="text-gray-600">
                                      Tax (PPN 10%):
                                    </span>
                                    <div className="font-semibold text-green-600">
                                      +
                                      {formatCurrency(
                                        isExpanded.transaction.tax_amount || 0
                                      )}
                                    </div>
                                  </div>
                                  <div>
                                    <span className="text-gray-600">
                                      Discount:
                                    </span>
                                    <div className="font-semibold text-red-600">
                                      -
                                      {formatCurrency(
                                        isExpanded.transaction
                                          .discount_amount || 0
                                      )}
                                    </div>
                                  </div>
                                  <div className="bg-blue-50 p-2 rounded">
                                    <span className="text-gray-600">
                                      Grand Total:
                                    </span>
                                    <div className="font-bold text-lg text-blue-600">
                                      {formatCurrency(
                                        isExpanded.transaction.total_amount
                                      )}
                                    </div>
                                  </div>
                                </div>
                                {isExpanded.transaction.coupon_code && (
                                  <div className="mt-2 text-sm text-green-600">
                                    <i className="fas fa-tag mr-1"></i>
                                    Coupon digunakan:{" "}
                                    <strong>
                                      {isExpanded.transaction.coupon_code}
                                    </strong>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Details Modal */}
      {showDetailsModal && selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Detail Transaksi
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Order: {selectedTransaction.order_number}
                </p>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Customer Info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-gray-800 mb-2">
                Informasi Customer
              </h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-600">Nama:</span>{" "}
                  {selectedTransaction.customer_name}
                </div>
                <div>
                  <span className="text-gray-600">Email:</span>{" "}
                  {selectedTransaction.customer_email || "-"}
                </div>
                <div>
                  <span className="text-gray-600">Telepon:</span>{" "}
                  {selectedTransaction.customer_phone}
                </div>
                <div>
                  <span className="text-gray-600">Payment:</span>{" "}
                  {selectedTransaction.payment_method}
                </div>
              </div>
            </div>

            {/* Items Table */}
            <h3 className="font-semibold text-gray-800 mb-2">Item Pesanan</h3>
            <table className="min-w-full divide-y divide-gray-200 mb-4">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                    Produk
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                    Harga
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                    Qty
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                    Subtotal
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {transactionDetails.map((item) => (
                  <tr key={item.order_item_id}>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        {item.main_image_url && (
                          <img
                            src={item.main_image_url}
                            alt={item.product_name}
                            className="w-10 h-10 object-cover rounded"
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium">
                            {item.product_name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {item.brand}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2 text-sm">
                      {formatCurrency(item.product_price)}
                    </td>
                    <td className="px-4 py-2 text-sm">{item.quantity}</td>
                    <td className="px-4 py-2 text-sm font-medium">
                      {formatCurrency(item.subtotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Subtotal:</span>
                <span>{formatCurrency(selectedTransaction.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Tax:</span>
                <span>{formatCurrency(selectedTransaction.tax_amount)}</span>
              </div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Discount:</span>
                <span className="text-red-600">
                  -{formatCurrency(selectedTransaction.discount_amount)}
                </span>
              </div>
              {selectedTransaction.coupon_code && (
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Coupon:</span>
                  <span className="text-green-600">
                    {selectedTransaction.coupon_code}
                  </span>
                </div>
              )}
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span className="text-blue-600">
                    {formatCurrency(selectedTransaction.total_amount)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AutoSalesReport;

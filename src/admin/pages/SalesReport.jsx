import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

const SalesReport = () => {
  // State management
  const [salesReports, setSalesReports] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter state
  const [periodFilter, setPeriodFilter] = useState("all"); // 'all', 'today', 'week', 'month', 'custom'
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showCustomDate, setShowCustomDate] = useState(false);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingReport, setEditingReport] = useState(null);
  const [formData, setFormData] = useState({
    report_date: "",
    total_orders: 0,
    completed_orders: 0,
    cancelled_orders: 0,
    total_revenue: 0,
    total_tax: 0,
    total_discount: 0,
    net_revenue: 0,
    top_selling_product_id: null,
    top_selling_quantity: 0,
  });

  // Load sales data on mount and when filters change
  useEffect(() => {
    loadSalesData();
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

  const loadSalesData = async () => {
    console.log("📊 [SalesReport] Loading sales data...");
    console.log("   Start Date:", startDate);
    console.log("   End Date:", endDate);

    setLoading(true);
    setError(null);

    try {
      // Build query params
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      // Fetch sales reports
      console.log("📊 [SalesReport] Fetching reports from API...");
      const reportsResponse = await axios.get(`${API_URL}/sales-reports`, {
        params,
      });
      console.log("✅ [SalesReport] Reports received:", reportsResponse.data);
      setSalesReports(reportsResponse.data.data || []);

      // Fetch summary
      console.log("📊 [SalesReport] Fetching summary from API...");
      const summaryResponse = await axios.get(
        `${API_URL}/sales-reports/summary`,
        { params }
      );
      console.log("✅ [SalesReport] Summary received:", summaryResponse.data);
      setSummary(summaryResponse.data.data || {});

      console.log("✅ [SalesReport] All data loaded successfully");
    } catch (err) {
      console.error("❌ [SalesReport] Error loading data:", err);
      console.error("   Error details:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Failed to load sales data");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    console.log("📝 [SalesReport] Opening form for new report");
    setEditingReport(null);
    setFormData({
      report_date: new Date().toISOString().split("T")[0],
      total_orders: 0,
      completed_orders: 0,
      cancelled_orders: 0,
      total_revenue: 0,
      total_tax: 0,
      total_discount: 0,
      net_revenue: 0,
      top_selling_product_id: null,
      top_selling_quantity: 0,
    });
    setShowForm(true);
  };

  const handleEdit = (report) => {
    console.log(
      "✏️ [SalesReport] Opening form to edit report:",
      report.report_id
    );
    setEditingReport(report);
    setFormData({
      report_date: report.report_date?.split("T")[0] || "",
      total_orders: report.total_orders || 0,
      completed_orders: report.completed_orders || 0,
      cancelled_orders: report.cancelled_orders || 0,
      total_revenue: report.total_revenue || 0,
      total_tax: report.total_tax || 0,
      total_discount: report.total_discount || 0,
      net_revenue: report.net_revenue || 0,
      top_selling_product_id: report.top_selling_product_id || null,
      top_selling_quantity: report.top_selling_quantity || 0,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("💾 [SalesReport] Submitting form...");
    console.log(
      "   Editing:",
      editingReport ? `ID ${editingReport.report_id}` : "New report"
    );
    console.log("   Form data:", formData);

    try {
      if (editingReport) {
        // Update existing report
        console.log(
          "📊 [SalesReport] Updating report ID:",
          editingReport.report_id
        );
        await axios.put(
          `${API_URL}/sales-reports/${editingReport.report_id}`,
          formData
        );
        console.log("✅ [SalesReport] Report updated successfully");
      } else {
        // Create new report
        console.log("📊 [SalesReport] Creating new report");
        await axios.post(`${API_URL}/sales-reports`, formData);
        console.log("✅ [SalesReport] Report created successfully");
      }

      setShowForm(false);
      setEditingReport(null);
      await loadSalesData(); // Reload data
      console.log("✅ [SalesReport] Data reloaded after submit");
    } catch (err) {
      console.error("❌ [SalesReport] Error submitting form:", err);
      console.error("   Error details:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Failed to save sales report");
    }
  };

  const handleDelete = async (reportId) => {
    console.log("🗑️ [SalesReport] Attempting to delete report ID:", reportId);

    if (!confirm("Are you sure you want to delete this sales report?")) {
      console.log("❌ [SalesReport] Delete cancelled by user");
      return;
    }

    try {
      console.log("📊 [SalesReport] Sending delete request...");
      await axios.delete(`${API_URL}/sales-reports/${reportId}`);
      console.log("✅ [SalesReport] Report deleted successfully");
      await loadSalesData(); // Reload data
      console.log("✅ [SalesReport] Data reloaded after delete");
    } catch (err) {
      console.error("❌ [SalesReport] Error deleting report:", err);
      console.error("   Error details:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Failed to delete sales report");
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "report_date" ? value : value === "" ? null : Number(value),
    }));
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
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Sales Report</h1>
        <p className="text-gray-600">
          Monitor and manage your sales performance
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 mb-2">
            Total Orders
          </h3>
          <p className="text-2xl font-bold text-gray-800">
            {summary.total_orders || 0}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 mb-2">
            Completed Orders
          </h3>
          <p className="text-2xl font-bold text-green-600">
            {summary.completed_orders || 0}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 mb-2">
            Total Revenue
          </h3>
          <p className="text-2xl font-bold text-blue-600">
            {formatCurrency(summary.total_revenue)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 mb-2">
            Net Revenue
          </h3>
          <p className="text-2xl font-bold text-purple-600">
            {formatCurrency(summary.net_revenue)}
          </p>
        </div>
      </div>

      {/* Filter and Actions */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          {/* Period Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Period
            </label>
            <select
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {/* Custom Date Range */}
          {showCustomDate && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
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
                  End Date
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

          {/* Create Button */}
          <div className="ml-auto">
            <button
              onClick={handleCreateNew}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              + Create Report
            </button>
          </div>
        </div>
      </div>

      {/* Sales Reports Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Report Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Orders
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Completed
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cancelled
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Net Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Top Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {salesReports.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No sales reports found
                  </td>
                </tr>
              ) : (
                salesReports.map((report) => (
                  <tr key={report.report_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(report.report_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {report.total_orders}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                      {report.completed_orders}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                      {report.cancelled_orders}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(report.total_revenue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(report.net_revenue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {report.top_selling_product_name || "-"}
                      {report.top_selling_quantity > 0 && (
                        <span className="text-gray-500 ml-1">
                          ({report.top_selling_quantity})
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(report)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(report.report_id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {editingReport ? "Edit Sales Report" : "Create Sales Report"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Report Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Report Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="report_date"
                  value={formData.report_date}
                  onChange={handleFormChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Orders Section */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Orders
                  </label>
                  <input
                    type="number"
                    name="total_orders"
                    value={formData.total_orders}
                    onChange={handleFormChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Completed Orders
                  </label>
                  <input
                    type="number"
                    name="completed_orders"
                    value={formData.completed_orders}
                    onChange={handleFormChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cancelled Orders
                  </label>
                  <input
                    type="number"
                    name="cancelled_orders"
                    value={formData.cancelled_orders}
                    onChange={handleFormChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Revenue Section */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Revenue (Rp)
                  </label>
                  <input
                    type="number"
                    name="total_revenue"
                    value={formData.total_revenue}
                    onChange={handleFormChange}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Tax (Rp)
                  </label>
                  <input
                    type="number"
                    name="total_tax"
                    value={formData.total_tax}
                    onChange={handleFormChange}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Discount (Rp)
                  </label>
                  <input
                    type="number"
                    name="total_discount"
                    value={formData.total_discount}
                    onChange={handleFormChange}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Net Revenue (Rp)
                  </label>
                  <input
                    type="number"
                    name="net_revenue"
                    value={formData.net_revenue}
                    onChange={handleFormChange}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Top Selling Product Section */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Top Selling Product ID
                  </label>
                  <input
                    type="number"
                    name="top_selling_product_id"
                    value={formData.top_selling_product_id || ""}
                    onChange={handleFormChange}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Top Selling Quantity
                  </label>
                  <input
                    type="number"
                    name="top_selling_quantity"
                    value={formData.top_selling_quantity}
                    onChange={handleFormChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  {editingReport ? "Update Report" : "Create Report"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingReport(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesReport;

import { useState, useEffect } from "react";
import { Clock, User, Package, Tag, Trash2, Edit, Plus } from "lucide-react";
import api from "../services/api";

const AdminActivity = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    entityType: "",
    actionType: "",
  });

  useEffect(() => {
    fetchActivities();
  }, [page, filters]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        ...(filters.entityType && { entityType: filters.entityType }),
        ...(filters.actionType && { actionType: filters.actionType }),
      });

      const query = params.toString();
      const endpoint = `/admin/activities${query ? `?${query}` : ""}`;
      const response = await api.get(endpoint);

      if (response.success) {
        setActivities(response.data || []);
        setTotalPages(response.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (actionType) => {
    switch (actionType) {
      case "CREATE":
        return <Plus className="w-4 h-4 text-green-600" />;
      case "UPDATE":
        return <Edit className="w-4 h-4 text-blue-600" />;
      case "DELETE":
        return <Trash2 className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getEntityIcon = (entityType) => {
    switch (entityType) {
      case "PRODUCT":
        return <Package className="w-4 h-4 text-purple-600" />;
      case "CATEGORY":
        return <Tag className="w-4 h-4 text-orange-600" />;
      default:
        return null;
    }
  };

  const getActionColor = (actionType) => {
    switch (actionType) {
      case "CREATE":
        return "bg-green-100 text-green-800";
      case "UPDATE":
        return "bg-blue-100 text-blue-800";
      case "DELETE":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Aktivitas Admin
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Riwayat semua aksi yang dilakukan admin
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipe Entitas
            </label>
            <select
              value={filters.entityType}
              onChange={(e) => {
                setFilters({ ...filters, entityType: e.target.value });
                setPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="">Semua Entitas</option>
              <option value="PRODUCT">Produk</option>
              <option value="CATEGORY">Kategori</option>
              <option value="COUPON">Kupon</option>
              <option value="ORDER">Pesanan</option>
              <option value="USER">User</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipe Aksi
            </label>
            <select
              value={filters.actionType}
              onChange={(e) => {
                setFilters({ ...filters, actionType: e.target.value });
                setPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="">Semua Aksi</option>
              <option value="CREATE">Buat</option>
              <option value="UPDATE">Update</option>
              <option value="DELETE">Hapus</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setFilters({ entityType: "", actionType: "" });
                setPage(1);
              }}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Reset Filter
            </button>
          </div>
        </div>
      </div>

      {/* Activity List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Tidak ada aktivitas ditemukan</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {activities.map((activity) => (
              <div
                key={activity.log_id}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  {/* Icons */}
                  <div className="flex gap-2 mt-1">
                    {getActionIcon(activity.action_type)}
                    {getEntityIcon(activity.entity_type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${getActionColor(
                          activity.action_type
                        )}`}
                      >
                        {activity.action_type}
                      </span>
                      <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                        {activity.entity_type}
                      </span>
                    </div>

                    <p className="text-sm font-medium text-gray-900 mb-1">
                      {activity.description}
                    </p>

                    {activity.entity_name && (
                      <p className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">Entitas:</span>{" "}
                        {activity.entity_name}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span>{activity.admin_name || "Unknown Admin"}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatDateTime(activity.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>
          <span className="px-4 py-2 bg-white border border-gray-300 rounded-lg">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminActivity;

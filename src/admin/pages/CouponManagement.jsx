import { useState, useEffect } from "react";
import CouponService from "../../services/coupon.service";
import CreateCouponModal from "../components/CreateCouponModal";
import EditCouponModal from "../components/EditCouponModal";

const CouponManagement = () => {
  const [coupons, setCoupons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);

  // Toast state
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await CouponService.getActiveCoupons();
      const couponList = Array.isArray(response?.data?.coupons)
        ? response.data.coupons
        : Array.isArray(response?.coupons)
        ? response.coupons
        : [];
      setCoupons(couponList);
    } catch (err) {
      console.error("Error fetching coupons:", err);
      setError("Gagal memuat data kupon");
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "" });
    }, 3000);
  };

  const handleCreateCoupon = () => {
    setIsCreateModalOpen(true);
  };

  const handleEditCoupon = (coupon) => {
    setSelectedCoupon(coupon);
    setIsEditModalOpen(true);
  };

  const handleDeleteCoupon = async (coupon) => {
    if (!window.confirm(`Hapus kupon ${coupon.code}?`)) return;

    try {
      const token = localStorage.getItem("pharmahub_token");
      const response = await fetch(
        `http://localhost:3001/api/admin/coupons/${coupon.coupon_id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal menghapus kupon");
      }

      showToast("Kupon berhasil dihapus", "success");
      fetchCoupons();
    } catch (err) {
      console.error("Error deleting coupon:", err);
      showToast(err.message || "Gagal menghapus kupon", "error");
    }
  };

  const handleToggleStatus = async (coupon) => {
    try {
      const token = localStorage.getItem("pharmahub_token");
      const response = await fetch(
        `http://localhost:3001/api/admin/coupons/${coupon.coupon_id}/toggle`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal mengubah status kupon");
      }

      showToast(data.message || "Status kupon berhasil diubah", "success");
      fetchCoupons();
    } catch (err) {
      console.error("Error toggling coupon:", err);
      showToast(err.message || "Gagal mengubah status kupon", "error");
    }
  };

  const filteredCoupons = coupons.filter((coupon) =>
    coupon.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in">
          <div
            className={`px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 ${
              toast.type === "success"
                ? "bg-green-500 text-white"
                : toast.type === "info"
                ? "bg-blue-500 text-white"
                : "bg-red-500 text-white"
            }`}
          >
            <i
              className={`fas ${
                toast.type === "success"
                  ? "fa-check-circle"
                  : toast.type === "info"
                  ? "fa-info-circle"
                  : "fa-exclamation-circle"
              }`}
            ></i>
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Kelola Kupon</h1>
            <p className="text-gray-600 mt-1">
              Buat, edit, dan kelola kupon diskon
            </p>
          </div>
          <button
            onClick={handleCreateCoupon}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <i className="fas fa-plus"></i>
            <span>Buat Kupon Baru</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder="Cari kode kupon..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <i className="fas fa-spinner fa-spin text-4xl text-blue-600 mb-4"></i>
            <p className="text-gray-600">Memuat data kupon...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
          <div className="flex items-center">
            <i className="fas fa-exclamation-circle mr-3 text-xl"></i>
            <div>
              <p className="font-medium">{error}</p>
              <button
                onClick={fetchCoupons}
                className="text-sm underline hover:no-underline mt-1"
              >
                Coba lagi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Coupons Grid */}
      {!isLoading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCoupons.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              <i className="fas fa-ticket-alt text-6xl mb-4 opacity-50"></i>
              <p className="text-lg">
                {searchTerm
                  ? "Tidak ada kupon yang cocok dengan pencarian"
                  : "Belum ada kupon"}
              </p>
            </div>
          ) : (
            filteredCoupons.map((coupon) => {
              const now = new Date();
              const endDate = new Date(coupon.end_date);
              const isActive = coupon.is_active && endDate > now;
              const isExpired = endDate < now;

              return (
                <div
                  key={coupon.coupon_id}
                  className={`bg-white rounded-lg shadow-md p-5 border-2 transition-all hover:shadow-lg ${
                    isActive
                      ? "border-green-200"
                      : isExpired
                      ? "border-gray-300 opacity-60"
                      : "border-yellow-200"
                  }`}
                >
                  {/* Header */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900">
                        {coupon.code}
                      </h3>
                      {coupon.description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {coupon.description}
                        </p>
                      )}
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        isActive
                          ? "bg-green-100 text-green-800"
                          : isExpired
                          ? "bg-gray-100 text-gray-600"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {isActive
                        ? "Aktif"
                        : isExpired
                        ? "Expired"
                        : "Non-Aktif"}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <i className="fas fa-tag text-blue-500 w-5"></i>
                      <span className="font-medium">
                        Diskon:{" "}
                        {coupon.discount_type === "percentage"
                          ? `${coupon.discount_value}%`
                          : `Rp ${coupon.discount_value.toLocaleString("id-ID")}`}
                      </span>
                    </div>

                    {coupon.min_purchase > 0 && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <i className="fas fa-shopping-cart w-5"></i>
                        <span>
                          Min. Pembelian: Rp{" "}
                          {coupon.min_purchase.toLocaleString("id-ID")}
                        </span>
                      </div>
                    )}

                    {coupon.max_discount && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <i className="fas fa-hand-holding-usd w-5"></i>
                        <span>
                          Max. Diskon: Rp{" "}
                          {coupon.max_discount.toLocaleString("id-ID")}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <i className="fas fa-calendar w-5"></i>
                      <span>
                        Berlaku:{" "}
                        {new Date(coupon.start_date).toLocaleDateString("id-ID")}{" "}
                        - {endDate.toLocaleDateString("id-ID")}
                      </span>
                    </div>

                    {coupon.usage_limit && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <i className="fas fa-users w-5"></i>
                        <span>
                          Penggunaan: {coupon.total_usage || 0} /{" "}
                          {coupon.usage_limit}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <i className="fas fa-user-check w-5"></i>
                      <span>Limit per user: {coupon.usage_per_user || 1}x</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-3 border-t border-gray-200">
                    <button
                      onClick={() => handleToggleStatus(coupon)}
                      className={`flex-1 px-3 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm font-medium ${
                        isActive
                          ? "bg-yellow-50 text-yellow-600 hover:bg-yellow-100"
                          : "bg-green-50 text-green-600 hover:bg-green-100"
                      }`}
                    >
                      <i className={`fas ${isActive ? "fa-pause" : "fa-play"}`}></i>
                      {isActive ? "Nonaktifkan" : "Aktifkan"}
                    </button>
                    <button
                      onClick={() => handleEditCoupon(coupon)}
                      className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                    >
                      <i className="fas fa-edit"></i>
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteCoupon(coupon)}
                      className="flex-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                    >
                      <i className="fas fa-trash"></i>
                      Hapus
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Modals */}
      <CreateCouponModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          showToast("Kupon berhasil dibuat", "success");
          fetchCoupons();
        }}
      />

      <EditCouponModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedCoupon(null);
        }}
        coupon={selectedCoupon}
        onSuccess={() => {
          showToast("Kupon berhasil diupdate", "success");
          fetchCoupons();
        }}
      />
    </div>
  );
};

export default CouponManagement;

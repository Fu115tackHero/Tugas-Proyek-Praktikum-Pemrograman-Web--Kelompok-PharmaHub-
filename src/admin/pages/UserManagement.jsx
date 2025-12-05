import { useState, useEffect } from "react";
import AdminService from "../../services/admin.service";
import CouponService from "../../services/coupon.service";
import SendNotificationModal from "../components/SendNotificationModal";
import SendCouponModal from "../components/SendCouponModal";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Coupon states
  const [coupons, setCoupons] = useState([]);
  const [isLoadingCoupons, setIsLoadingCoupons] = useState(false);

  // Modal states
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Toast state
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  useEffect(() => {
    fetchUsers();
    fetchCoupons();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await AdminService.getAllUsers();
      setUsers(response.data || []);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Gagal memuat data pengguna");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCoupons = async () => {
    setIsLoadingCoupons(true);
    try {
      const response = await CouponService.getActiveCoupons();
      const couponList = Array.isArray(response?.data?.coupons) 
        ? response.data.coupons 
        : Array.isArray(response?.coupons)
        ? response.coupons
        : [];
      
      // Filter active and valid coupons
      const activeCoupons = couponList.filter(
        (coupon) =>
          coupon.is_active &&
          new Date(coupon.end_date) > new Date()
      );
      setCoupons(activeCoupons);
    } catch (err) {
      console.error("Error fetching coupons:", err);
    } finally {
      setIsLoadingCoupons(false);
    }
  };

  const handleToggleStatus = async (user) => {
    const action = user.is_active ? "suspend" : "activate";
    const confirmMessage = user.is_active
      ? `Suspend akun ${user.name}? User tidak akan bisa login.`
      : `Aktifkan akun ${user.name}?`;

    if (!window.confirm(confirmMessage)) return;

    try {
      await AdminService.toggleUserStatus(user.user_id);
      showToast(
        `Akun ${user.name} berhasil ${action === "suspend" ? "di-suspend" : "diaktifkan"}`,
        "success"
      );
      fetchUsers(); // Refresh data
    } catch (err) {
      console.error("Error toggling user status:", err);
      showToast("Gagal mengubah status user", "error");
    }
  };

  const handleSendNotification = (user) => {
    setSelectedUser(user);
    setIsNotificationModalOpen(true);
  };

  const handleSendCoupon = (user) => {
    setSelectedUser(user);
    setIsCouponModalOpen(true);
  };

  const handleBroadcastNotification = () => {
    // Set selectedUser to broadcast mode for notification
    setSelectedUser({ broadcast: true });
    setIsNotificationModalOpen(true);
  };

  const handleBroadcastCoupon = () => {
    // Set selectedUser to null to indicate broadcast to all users
    setSelectedUser({ broadcast: true });
    setIsCouponModalOpen(true);
  };

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "" });
    }, 3000);
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.phone && user.phone.includes(searchTerm))
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
                : "bg-red-500 text-white"
            }`}
          >
            <i
              className={`fas ${toast.type === "success" ? "fa-check-circle" : "fa-exclamation-circle"}`}
            ></i>
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Kelola Pengguna</h1>
        <p className="text-gray-600 mt-1">
          Kelola akun pengguna, kirim notifikasi, dan distribusi kupon
        </p>
      </div>

      {/* Search Bar with Action Buttons */}
      <div className="mb-6">
        <div className="flex gap-3 items-center">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Cari nama, email, atau nomor HP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
          </div>

          {/* Action Buttons */}
          <button
            onClick={handleBroadcastNotification}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 whitespace-nowrap"
            title="Kirim pesan ke semua user"
          >
            <i className="fas fa-bullhorn"></i>
            <span>Kirim Pesan ke Semua</span>
          </button>

          <button
            onClick={handleBroadcastCoupon}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 whitespace-nowrap"
            title="Kirim kupon ke semua user"
          >
            <i className="fas fa-gift"></i>
            <span>Kirim Kupon ke Semua</span>
          </button>
        </div>
      </div>

      {/* Active Coupons List */}
      <div className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <i className="fas fa-ticket-alt text-blue-600"></i>
            Kupon Aktif
          </h3>
          <button
            onClick={fetchCoupons}
            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            disabled={isLoadingCoupons}
          >
            <i className={`fas fa-sync-alt ${isLoadingCoupons ? 'fa-spin' : ''}`}></i>
            Refresh
          </button>
        </div>

        {isLoadingCoupons ? (
          <div className="text-center py-4 text-gray-500">
            <i className="fas fa-spinner fa-spin mr-2"></i>
            Memuat kupon...
          </div>
        ) : coupons.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            <i className="fas fa-info-circle mr-2"></i>
            Tidak ada kupon aktif
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {coupons.map((coupon) => (
              <div
                key={coupon.coupon_id}
                className="bg-white rounded-lg p-3 border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 text-sm">{coupon.code}</h4>
                    {coupon.description && (
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {coupon.description}
                      </p>
                    )}
                  </div>
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    Aktif
                  </span>
                </div>
                <div className="space-y-1 text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    <i className="fas fa-tag text-blue-500 w-3"></i>
                    <span className="font-medium">
                      {coupon.discount_type === "percentage"
                        ? `${coupon.discount_value}% OFF`
                        : `Rp ${coupon.discount_value.toLocaleString("id-ID")}`}
                    </span>
                  </div>
                  {coupon.min_purchase > 0 && (
                    <div className="flex items-center gap-1">
                      <i className="fas fa-shopping-cart text-orange-500 w-3"></i>
                      <span>Min. Rp {coupon.min_purchase.toLocaleString("id-ID")}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <i className="fas fa-calendar text-purple-500 w-3"></i>
                    <span>s/d {new Date(coupon.end_date).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}</span>
                  </div>
                  {coupon.usage_limit && (
                    <div className="flex items-center gap-1">
                      <i className="fas fa-users text-green-500 w-3"></i>
                      <span>{coupon.total_usage || 0}/{coupon.usage_limit} used</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <i className="fas fa-spinner fa-spin text-4xl text-blue-600 mb-4"></i>
            <p className="text-gray-600">Memuat data pengguna...</p>
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
                onClick={fetchUsers}
                className="text-sm underline hover:no-underline mt-1"
              >
                Coba lagi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Users Table */}
      {!isLoading && !error && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Info User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kontak
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tgl Daftar
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      <i className="fas fa-users text-4xl mb-3 text-gray-300"></i>
                      <p>
                        {searchTerm
                          ? "Tidak ada pengguna yang cocok dengan pencarian"
                          : "Belum ada pengguna terdaftar"}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.user_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-blue-600 font-medium text-sm">
                                {user.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {user.user_id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {user.email}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.phone || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.created_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.is_active
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {user.is_active ? (
                            <>
                              <i className="fas fa-check-circle mr-1"></i>
                              Aktif
                            </>
                          ) : (
                            <>
                              <i className="fas fa-ban mr-1"></i>
                              Suspend
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          {/* Toggle Status Button */}
                          <button
                            onClick={() => handleToggleStatus(user)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                              user.is_active
                                ? "bg-red-100 text-red-700 hover:bg-red-200"
                                : "bg-green-100 text-green-700 hover:bg-green-200"
                            }`}
                            title={
                              user.is_active ? "Suspend User" : "Aktifkan User"
                            }
                          >
                            <i
                              className={`fas ${user.is_active ? "fa-ban" : "fa-check"} mr-1`}
                            ></i>
                            {user.is_active ? "Suspend" : "Aktifkan"}
                          </button>

                          {/* Send Notification Button */}
                          <button
                            onClick={() => handleSendNotification(user)}
                            className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-200 transition-colors"
                            title="Kirim Notifikasi"
                          >
                            <i className="fas fa-paper-plane mr-1"></i>
                            Pesan
                          </button>

                          {/* Send Coupon Button */}
                          <button
                            onClick={() => handleSendCoupon(user)}
                            className="px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-lg text-xs font-medium hover:bg-yellow-200 transition-colors"
                            title="Kirim Kupon"
                          >
                            <i className="fas fa-gift mr-1"></i>
                            Kupon
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          {filteredUsers.length > 0 && (
            <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
              <p className="text-sm text-gray-700">
                Menampilkan <span className="font-medium">{filteredUsers.length}</span>{" "}
                dari <span className="font-medium">{users.length}</span> pengguna
              </p>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <SendNotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => {
          setIsNotificationModalOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
        onSuccess={() => {
          showToast("Notifikasi berhasil dikirim!", "success");
        }}
      />

      <SendCouponModal
        isOpen={isCouponModalOpen}
        onClose={() => {
          setIsCouponModalOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
        onSuccess={() => {
          showToast("Kupon berhasil dikirim!", "success");
        }}
      />
    </div>
  );
};

export default UserManagement;

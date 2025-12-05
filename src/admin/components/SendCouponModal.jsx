import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import CouponService from "../../services/coupon.service";
import NotificationService from "../../services/notification.service";

const SendCouponModal = ({ isOpen, onClose, user, onSuccess }) => {
  const [coupons, setCoupons] = useState([]);
  const [selectedCouponId, setSelectedCouponId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingCoupons, setIsFetchingCoupons] = useState(false);
  const [error, setError] = useState(null);

  // Fetch active coupons when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchActiveCoupons();
    }
  }, [isOpen]);

  const fetchActiveCoupons = async () => {
    setIsFetchingCoupons(true);
    setError(null);

    try {
      const response = await CouponService.getActiveCoupons();
      console.log("Coupon response:", response); // Debug log
      
      // Backend returns { success: true, data: { coupons, count } }
      // api.js handleResponse returns the full JSON, so response.data.coupons
      const couponList = Array.isArray(response?.data?.coupons) 
        ? response.data.coupons 
        : Array.isArray(response?.coupons)
        ? response.coupons
        : [];
      
      console.log("Coupon list extracted:", couponList); // Debug log
      console.log("First coupon detail:", couponList[0]); // Debug log
      console.log("First coupon end_date:", couponList[0]?.end_date); // Debug log
      console.log("Current date:", new Date()); // Debug log
      
      // Filter only active coupons that haven't expired
      // Note: Database schema uses 'end_date' and 'usage_limit' (not valid_until/max_uses)
      const activeCoupons = couponList.filter(
        (coupon) => {
          const endDate = new Date(coupon.end_date);
          const now = new Date();
          console.log(`Checking coupon ${coupon.code}: is_active=${coupon.is_active}, end_date=${endDate}, now=${now}, valid=${endDate > now}`);
          return coupon.is_active && endDate > now;
        }
      );
      console.log("Active coupons after filter:", activeCoupons); // Debug log
      console.log("Setting coupons state to:", activeCoupons); // Debug log
      setCoupons(activeCoupons || []);
    } catch (err) {
      console.error("Error fetching coupons:", err);
      setError("Gagal memuat daftar kupon");
    } finally {
      setIsFetchingCoupons(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedCouponId) {
      setError("Pilih kupon terlebih dahulu");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const selectedCoupon = coupons.find(
        (c) => c.coupon_id === parseInt(selectedCouponId)
      );

      if (!selectedCoupon) {
        throw new Error("Kupon tidak ditemukan");
      }

      const token = localStorage.getItem("pharmahub_token");

      if (user.broadcast) {
        // Broadcast to all users
        console.log("Broadcasting coupon to all users:", {
          couponId: selectedCoupon.coupon_id,
          couponCode: selectedCoupon.code,
        });

        // TODO: Implement broadcast API endpoint
        // For now, show warning
        if (!window.confirm(
          `Anda akan mengirim kupon "${selectedCoupon.code}" ke SEMUA user. Lanjutkan?`
        )) {
          setIsLoading(false);
          return;
        }

        // Placeholder - implement actual broadcast endpoint
        throw new Error("Fitur broadcast kupon masih dalam pengembangan. Saat ini hanya bisa kirim ke user individual.");
        
      } else {
        // Send to individual user
        console.log("Sending coupon to user:", {
          userId: user.user_id,
          couponId: selectedCoupon.coupon_id,
          couponCode: selectedCoupon.code,
        });

        // Send notification with coupon info
        const response = await NotificationService.sendNotification(
          {
            userId: user.user_id,
            type: "promotion",
            title: "🎉 Kamu Dapat Kupon Baru!",
            message: `Selamat! Kamu mendapat kupon ${selectedCoupon.code} dengan diskon ${selectedCoupon.discount_type === "percentage" ? `${selectedCoupon.discount_value}%` : `Rp ${selectedCoupon.discount_value.toLocaleString("id-ID")}`}. Gunakan sebelum ${new Date(selectedCoupon.end_date).toLocaleDateString("id-ID")}!`,
            relatedCouponId: selectedCoupon.coupon_id,
          },
          token
        );

        console.log("Coupon notification sent:", response);
      }

      onSuccess?.();
      handleClose();
    } catch (err) {
      console.error("Error sending coupon:", err);
      setError(err.message || "Gagal mengirim kupon");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedCouponId("");
    setError(null);
    onClose();
  };

  if (!isOpen || !user) return null;

  console.log("Rendering modal - coupons state:", coupons); // Debug log
  console.log("Rendering modal - isFetchingCoupons:", isFetchingCoupons); // Debug log
  console.log("Rendering modal - coupons.length:", coupons.length); // Debug log

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-900">
              Kirim Kupon
            </h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isLoading}
            >
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {user.broadcast ? (
              <span className="font-medium text-purple-600">
                <i className="fas fa-bullhorn mr-1"></i>
                Kirim ke SEMUA User
              </span>
            ) : (
              <>
                Kirim kupon ke: <span className="font-medium">{user.name}</span> (
                {user.email})
              </>
            )}
          </p>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
              <i className="fas fa-exclamation-circle mt-0.5 mr-2"></i>
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Coupon Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pilih Kupon <span className="text-red-500">*</span>
            </label>

            {isFetchingCoupons ? (
              <div className="flex items-center justify-center py-8 text-gray-500">
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Memuat kupon...
              </div>
            ) : coupons.length === 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg text-sm">
                <i className="fas fa-info-circle mr-2"></i>
                Tidak ada kupon aktif yang tersedia
              </div>
            ) : (
              <select
                value={selectedCouponId}
                onChange={(e) => setSelectedCouponId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">-- Pilih Kupon --</option>
                {coupons.map((coupon) => (
                  <option key={coupon.coupon_id} value={coupon.coupon_id}>
                    {coupon.code} -{" "}
                    {coupon.discount_type === "percentage"
                      ? `${coupon.discount_value}%`
                      : `Rp ${coupon.discount_value.toLocaleString("id-ID")}`}{" "}
                    (s/d{" "}
                    {new Date(coupon.end_date).toLocaleDateString("id-ID")})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Selected Coupon Details */}
          {selectedCouponId && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">
                Detail Kupon:
              </h4>
              {(() => {
                const selected = coupons.find(
                  (c) => c.coupon_id === parseInt(selectedCouponId)
                );
                return (
                  <div className="text-sm text-blue-800 space-y-1">
                    <p>
                      <strong>Kode:</strong> {selected?.code}
                    </p>
                    <p>
                      <strong>Diskon:</strong>{" "}
                      {selected?.discount_type === "percentage"
                        ? `${selected?.discount_value}%`
                        : `Rp ${selected?.discount_value.toLocaleString("id-ID")}`}
                    </p>
                    {selected?.min_purchase > 0 && (
                      <p>
                        <strong>Min. Pembelian:</strong> Rp{" "}
                        {selected?.min_purchase.toLocaleString("id-ID")}
                      </p>
                    )}
                    <p>
                      <strong>Berlaku s/d:</strong>{" "}
                      {new Date(selected?.end_date).toLocaleDateString(
                        "id-ID",
                        {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        }
                      )}
                    </p>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Info */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-600">
            <i className="fas fa-info-circle mr-2"></i>
            User akan menerima notifikasi berisi kode kupon dan detail
            diskonnya
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isLoading}
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-400 disabled:cursor-not-allowed"
              disabled={isLoading || coupons.length === 0}
            >
              {isLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Mengirim...
                </>
              ) : (
                <>
                  <i className="fas fa-gift mr-2"></i>
                  Kirim Kupon
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

SendCouponModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  user: PropTypes.shape({
    user_id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
  }),
  onSuccess: PropTypes.func,
};

export default SendCouponModal;

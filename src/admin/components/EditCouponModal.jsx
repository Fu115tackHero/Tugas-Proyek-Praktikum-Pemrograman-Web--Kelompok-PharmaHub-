import { useState, useEffect } from "react";
import PropTypes from "prop-types";

const EditCouponModal = ({ isOpen, onClose, coupon, onSuccess }) => {
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discount_type: "percentage",
    discount_value: "",
    min_purchase: "",
    max_discount: "",
    usage_limit: "",
    usage_per_user: "1",
    start_date: "",
    end_date: "",
    is_active: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && coupon) {
      // Format dates to YYYY-MM-DD
      const startDate = coupon.start_date
        ? new Date(coupon.start_date).toISOString().split("T")[0]
        : "";
      const endDate = coupon.end_date
        ? new Date(coupon.end_date).toISOString().split("T")[0]
        : "";

      setFormData({
        code: coupon.code || "",
        description: coupon.description || "",
        discount_type: coupon.discount_type || "percentage",
        discount_value: coupon.discount_value || "",
        min_purchase: coupon.min_purchase || "",
        max_discount: coupon.max_discount || "",
        usage_limit: coupon.usage_limit || "",
        usage_per_user: coupon.usage_per_user || "1",
        start_date: startDate,
        end_date: endDate,
        is_active: coupon.is_active !== false,
      });
    }
  }, [isOpen, coupon]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("pharmahub_token");

      const payload = {
        code: formData.code.toUpperCase(),
        description: formData.description,
        discount_type: formData.discount_type,
        discount_value: parseFloat(formData.discount_value),
        min_purchase: formData.min_purchase
          ? parseFloat(formData.min_purchase)
          : 0,
        max_discount: formData.max_discount
          ? parseFloat(formData.max_discount)
          : null,
        usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
        usage_per_user: parseInt(formData.usage_per_user),
        start_date: formData.start_date,
        end_date: formData.end_date,
        is_active: formData.is_active,
      };

      const response = await fetch(
        `http://localhost:3001/api/admin/coupons/${coupon.coupon_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal mengupdate kupon");
      }

      onSuccess?.();
      handleClose();
    } catch (err) {
      console.error("Error updating coupon:", err);
      setError(err.message || "Gagal mengupdate kupon");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setError(null);
    onClose();
  };

  if (!isOpen || !coupon) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-900">
              Edit Kupon: {coupon.code}
            </h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isLoading}
            >
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
              <i className="fas fa-exclamation-circle mt-0.5 mr-2"></i>
              <span className="text-sm">{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Kode Kupon */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kode Kupon <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                placeholder="Contoh: DISKON10"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 uppercase"
                required
              />
            </div>

            {/* Tipe Diskon */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipe Diskon <span className="text-red-500">*</span>
              </label>
              <select
                name="discount_type"
                value={formData.discount_type}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="percentage">Persentase (%)</option>
                <option value="fixed">Nominal (Rp)</option>
              </select>
            </div>

            {/* Nilai Diskon */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nilai Diskon <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="discount_value"
                value={formData.discount_value}
                onChange={handleChange}
                placeholder={
                  formData.discount_type === "percentage" ? "10" : "50000"
                }
                min="0"
                step={formData.discount_type === "percentage" ? "0.1" : "1000"}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* Min Purchase */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min. Pembelian (Rp)
              </label>
              <input
                type="number"
                name="min_purchase"
                value={formData.min_purchase}
                onChange={handleChange}
                placeholder="0"
                min="0"
                step="1000"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Max Discount (for percentage) */}
            {formData.discount_type === "percentage" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max. Diskon (Rp)
                </label>
                <input
                  type="number"
                  name="max_discount"
                  value={formData.max_discount}
                  onChange={handleChange}
                  placeholder="100000"
                  min="0"
                  step="1000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}

            {/* Usage Limit */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Batas Total Penggunaan
              </label>
              <input
                type="number"
                name="usage_limit"
                value={formData.usage_limit}
                onChange={handleChange}
                placeholder="Unlimited"
                min="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Usage Per User */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Batas Penggunaan per User <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="usage_per_user"
                value={formData.usage_per_user}
                onChange={handleChange}
                min="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tanggal Mulai <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tanggal Berakhir <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deskripsi
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Deskripsi kupon..."
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            ></textarea>
          </div>

          {/* Active Status */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="is_active"
              id="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
              Kupon Aktif
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isLoading}
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-save"></i>
                  <span>Simpan Perubahan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

EditCouponModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  coupon: PropTypes.object,
  onSuccess: PropTypes.func,
};

export default EditCouponModal;

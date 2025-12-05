import { useState } from "react";
import PropTypes from "prop-types";
import NotificationService from "../../services/notification.service";

const SendNotificationModal = ({ isOpen, onClose, user, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "system",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("pharmahub_token");
      
      if (user.broadcast) {
        // Broadcast to all users
        if (!window.confirm(
          `Anda akan mengirim notifikasi "${formData.title}" ke SEMUA user. Lanjutkan?`
        )) {
          setIsLoading(false);
          return;
        }

        // Call broadcast endpoint
        const response = await fetch("http://localhost:3001/api/notifications/broadcast", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            type: formData.type,
            title: formData.title,
            message: formData.message,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Gagal mengirim notifikasi");
        }

        console.log("Broadcast sent successfully:", data);
      } else {
        // Send to individual user
        await NotificationService.sendNotification(
          {
            userId: user.user_id,
            type: formData.type,
            title: formData.title,
            message: formData.message,
          },
          token
        );
      }

      onSuccess?.();
      handleClose();
    } catch (err) {
      console.error("Error sending notification:", err);
      setError(err.message || "Gagal mengirim notifikasi");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ title: "", message: "", type: "system" });
    setError(null);
    onClose();
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-900">
              Kirim Notifikasi
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
              <span className="font-medium text-blue-600">
                <i className="fas fa-bullhorn mr-1"></i>
                Broadcast ke SEMUA User
              </span>
            ) : (
              <>
                Kirim pesan ke: <span className="font-medium">{user.name}</span> (
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

          {/* Type Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipe Notifikasi <span className="text-red-500">*</span>
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="system">Sistem</option>
              <option value="promotion">Promosi</option>
            </select>
          </div>

          {/* Title Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Judul <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Masukkan judul notifikasi"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              maxLength={100}
            />
          </div>

          {/* Message Textarea */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pesan <span className="text-red-500">*</span>
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Masukkan pesan notifikasi"
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              required
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.message.length}/500 karakter
            </p>
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
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Mengirim...
                </>
              ) : (
                <>
                  <i className="fas fa-paper-plane mr-2"></i>
                  Kirim Notifikasi
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

SendNotificationModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  user: PropTypes.shape({
    user_id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
  }),
  onSuccess: PropTypes.func,
};

export default SendNotificationModal;

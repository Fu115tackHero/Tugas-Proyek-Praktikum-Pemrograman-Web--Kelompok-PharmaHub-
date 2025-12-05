import React from "react";

/**
 * ConfirmModal - Reusable confirmation modal component
 * @param {boolean} isOpen - Modal visibility state
 * @param {function} onClose - Function to close modal
 * @param {function} onConfirm - Function to execute on confirm
 * @param {string} title - Modal title
 * @param {string} message - Modal message
 * @param {string} confirmText - Confirm button text (default: "Konfirmasi")
 * @param {string} cancelText - Cancel button text (default: "Batal")
 * @param {string} type - Modal type: 'danger', 'warning', 'info', 'success' (default: 'warning')
 */
const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Konfirmasi",
  message = "Apakah Anda yakin?",
  confirmText = "Konfirmasi",
  cancelText = "Batal",
  type = "warning",
  showInput = false,
  inputPlaceholder = "",
  inputValue = "",
  onInputChange = () => {},
}) => {
  if (!isOpen) return null;

  const typeStyles = {
    danger: {
      bg: "bg-red-50",
      border: "border-red-200",
      titleColor: "text-red-700",
      icon: "fa-exclamation-triangle text-red-600",
      confirmBtn: "bg-red-600 hover:bg-red-700 text-white",
    },
    warning: {
      bg: "bg-yellow-50",
      border: "border-yellow-200",
      titleColor: "text-yellow-700",
      icon: "fa-exclamation-circle text-yellow-600",
      confirmBtn: "bg-yellow-600 hover:bg-yellow-700 text-white",
    },
    info: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      titleColor: "text-blue-700",
      icon: "fa-info-circle text-blue-600",
      confirmBtn: "bg-blue-600 hover:bg-blue-700 text-white",
    },
    success: {
      bg: "bg-green-50",
      border: "border-green-200",
      titleColor: "text-green-700",
      icon: "fa-check-circle text-green-600",
      confirmBtn: "bg-green-600 hover:bg-green-700 text-white",
    },
  };

  const style = typeStyles[type] || typeStyles.warning;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full">
        <div className={`${style.bg} border-b ${style.border} px-6 py-4`}>
          <h3
            className={`text-lg font-bold ${style.titleColor} flex items-center`}
          >
            <i className={`fas ${style.icon} mr-3 text-xl`}></i>
            {title}
          </h3>
        </div>
        <div className="px-6 py-4">
          <p className="text-gray-700 mb-4">{message}</p>
          {showInput && (
            <input
              type="text"
              value={inputValue}
              onChange={(e) => onInputChange(e.target.value)}
              placeholder={inputPlaceholder}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              autoFocus
            />
          )}
        </div>
        <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg font-medium transition ${style.confirmBtn}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;

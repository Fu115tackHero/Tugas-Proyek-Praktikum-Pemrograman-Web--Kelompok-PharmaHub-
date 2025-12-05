import { useEffect } from "react";

/**
 * ConfirmModal - Reusable confirmation modal component
 * Merged best features from both versions
 * @param {boolean} isOpen - Modal visibility state
 * @param {function} onClose - Function to close modal (alias: onCancel)
 * @param {function} onConfirm - Function to execute on confirm
 * @param {string} title - Modal title
 * @param {string} message - Modal message
 * @param {string} confirmText - Confirm button text (default: "Konfirmasi")
 * @param {string} cancelText - Cancel button text (default: "Batal")
 * @param {string} type - Modal type: 'danger', 'warning', 'info', 'success' (default: 'warning')
 * @param {boolean} showInput - Show input field
 * @param {string} inputPlaceholder - Input placeholder
 * @param {string} inputValue - Input value
 * @param {function} onInputChange - Input change handler
 */
const ConfirmModal = ({
  isOpen,
  onClose,
  onCancel,
  onConfirm,
  title = "Konfirmasi",
  message = "Apakah Anda yakin?",
  confirmText = "Konfirmasi",
  cancelText = "Batal",
  confirmLabel,
  cancelLabel = "Batal",
  type = "warning",
  showInput = false,
  inputPlaceholder = "",
  inputValue = "",
  onInputChange = () => {},
}) => {
  // Support both old and new prop names
  const handleClose = onClose || onCancel;
  const confirmButtonText = confirmText || confirmLabel || "Konfirmasi";
  const cancelButtonText = cancelText || cancelLabel || "Batal";

  // Keyboard shortcuts: ESC to cancel, ENTER to confirm
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === "Escape") handleClose?.();
      if (e.key === "Enter") onConfirm?.();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleClose, onConfirm]);

  if (!isOpen) return null;

  // Type configurations with support for both danger/warning and new style
  const typeConfigs = {
    danger: {
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      icon: "fa-exclamation-triangle",
      ring: "ring-red-100",
      primaryBtn: "bg-red-600 hover:bg-red-700",
    },
    warning: {
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600",
      icon: "fa-exclamation-circle",
      ring: "ring-yellow-100",
      primaryBtn: "bg-yellow-600 hover:bg-yellow-700",
    },
    info: {
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      icon: "fa-info-circle",
      ring: "ring-blue-100",
      primaryBtn: "bg-blue-600 hover:bg-blue-700",
    },
    success: {
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      icon: "fa-check",
      ring: "ring-emerald-100",
      primaryBtn: "bg-emerald-600 hover:bg-emerald-700",
    },
  };

  const cfg = typeConfigs[type] || typeConfigs.warning;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 px-4"
      onClick={handleClose}
    >
      <div
        className={`w-full max-w-md rounded-2xl bg-white shadow-xl ring-1 ring-gray-100 ${cfg.ring}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between px-6 pt-6">
          <div className="flex items-center gap-3 flex-1">
            <div
              className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${cfg.iconBg}`}
            >
              <i className={`fas ${cfg.icon} ${cfg.iconColor} text-xl`}></i>
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-gray-900">{title}</h3>
              {message && (
                <p className="mt-1 text-sm text-gray-600">{message}</p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="ml-3 inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 flex-shrink-0"
          >
            <i className="fas fa-times text-sm" />
          </button>
        </div>

        {showInput && (
          <div className="px-6 py-4">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => onInputChange(e.target.value)}
              placeholder={inputPlaceholder}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              autoFocus
            />
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3 px-6 pb-6 pt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={handleClose}
            className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {cancelButtonText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold text-white ${cfg.primaryBtn}`}
          >
            {confirmButtonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;

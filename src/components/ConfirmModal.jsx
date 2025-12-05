import { useEffect } from "react";

/**
 * Modal konfirmasi generik (Bahasa Indonesia)
 * type: 'warning' | 'success' | 'info'
 */
const ConfirmModal = ({
  isOpen,
  type = "warning",
  title,
  message,
  confirmLabel,
  cancelLabel = "Batal",
  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === "Escape") onCancel?.();
      if (e.key === "Enter") onConfirm?.();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onCancel, onConfirm]);

  if (!isOpen) return null;

  const configs = {
    warning: {
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      icon: "fa-exclamation-triangle",
      ring: "ring-red-100",
      primaryBtn: "bg-red-600 hover:bg-red-700",
    },
    success: {
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      icon: "fa-check",
      ring: "ring-emerald-100",
      primaryBtn: "bg-emerald-600 hover:bg-emerald-700",
    },
    info: {
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      icon: "fa-info-circle",
      ring: "ring-blue-100",
      primaryBtn: "bg-blue-600 hover:bg-blue-700",
    },
  };

  const cfg = configs[type] || configs.warning;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 px-4" onClick={onCancel}>
      <div
        className={`w-full max-w-md rounded-2xl bg-white shadow-xl ring-1 ring-gray-100 ${cfg.ring}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between px-6 pt-6">
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${cfg.iconBg}`}>
              <i className={`fas ${cfg.icon} ${cfg.iconColor} text-xl`}></i>
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">
                {title || "Konfirmasi Tindakan"}
              </h3>
              {message && (
                <p className="mt-1 text-sm text-gray-600">{message}</p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="ml-3 inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <i className="fas fa-times text-sm" />
          </button>
        </div>

        <div className="mt-6 flex justify-end gap-3 px-6 pb-6 pt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold text-white ${cfg.primaryBtn}`}
          >
            {confirmLabel || "Konfirmasi"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;

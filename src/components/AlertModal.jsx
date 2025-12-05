import { useEffect } from 'react';

/**
 * Custom Alert Modal Component
 * Replaces browser's default alert() with a styled modal
 * 
 * @param {boolean} isOpen - Controls modal visibility
 * @param {function} onClose - Function to call when modal is closed
 * @param {string} title - Modal title (optional)
 * @param {string} message - Message to display
 * @param {string} type - Alert type: 'success', 'error', 'warning', 'info'
 */
const AlertModal = ({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  type = 'info' 
}) => {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Konfigurasi gaya & ikon berdasarkan tipe (Bahasa Indonesia)
  const configs = {
    success: {
      containerRing: 'ring-emerald-100',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      icon: 'fa-check-circle',
      titleColor: 'text-emerald-800',
      buttonBg: 'bg-emerald-600 hover:bg-emerald-700',
      defaultTitle: 'Berhasil',
      defaultMessage: 'Tindakan berhasil dilakukan.'
    },
    error: {
      containerRing: 'ring-red-100',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      icon: 'fa-exclamation-circle',
      titleColor: 'text-red-800',
      buttonBg: 'bg-red-600 hover:bg-red-700',
      defaultTitle: 'Terjadi Kesalahan',
      defaultMessage: 'Terjadi kesalahan. Silakan coba lagi.'
    },
    warning: {
      containerRing: 'ring-amber-100',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      icon: 'fa-exclamation-triangle',
      titleColor: 'text-amber-800',
      buttonBg: 'bg-amber-600 hover:bg-amber-700',
      defaultTitle: 'Peringatan',
      defaultMessage: 'Mohon periksa kembali data atau tindakan Anda.'
    },
    info: {
      containerRing: 'ring-blue-100',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      icon: 'fa-info-circle',
      titleColor: 'text-blue-800',
      buttonBg: 'bg-blue-600 hover:bg-blue-700',
      defaultTitle: 'Informasi',
      defaultMessage: 'Berikut adalah informasi penting untuk Anda.'
    }
  };

  const config = configs[type] || configs.info;

  return (
    <div
      className="fixed inset-0 bg-black/40 z-[9999] flex items-center justify-center px-4"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-md rounded-2xl bg-white shadow-xl ring-1 ring-gray-100 ${config.containerRing}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header + Content */}
        <div className="px-6 pt-6 pb-4 flex items-start justify-between">
          <div className="flex items-start space-x-3">
            {/* Icon bulat */}
            <div className={`${config.iconBg} h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0`}>
              <i className={`fas ${config.icon} ${config.iconColor} text-xl`}></i>
            </div>
            {/* Teks */}
            <div className="flex-1 min-w-0">
              <h3 className={`text-base font-semibold ${config.titleColor}`}>
                {title || config.defaultTitle}
              </h3>
              <p className="mt-1 text-sm text-gray-600 whitespace-pre-line">
                {message || config.defaultMessage}
              </p>
            </div>
          </div>
          {/* Tombol tutup (X) */}
          <button
            type="button"
            onClick={onClose}
            className="ml-3 inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <i className="fas fa-times text-sm"></i>
          </button>
        </div>

        {/* Footer tombol */}
        <div className="px-6 pb-6 pt-2 flex justify-end border-t border-gray-100 mt-2">
          <button
            onClick={onClose}
            className={`${config.buttonBg} text-white px-6 py-2 rounded-lg text-sm font-semibold shadow-sm hover:shadow-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white`}
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
;

export default AlertModal;

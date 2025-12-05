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

  // Configure styles and icons based on type
  const configs = {
    success: {
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      icon: 'fa-check-circle',
      titleColor: 'text-green-800',
      buttonBg: 'bg-green-600 hover:bg-green-700',
      defaultTitle: 'Berhasil'
    },
    error: {
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      icon: 'fa-exclamation-circle',
      titleColor: 'text-red-800',
      buttonBg: 'bg-red-600 hover:bg-red-700',
      defaultTitle: 'Error'
    },
    warning: {
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      icon: 'fa-exclamation-triangle',
      titleColor: 'text-yellow-800',
      buttonBg: 'bg-yellow-600 hover:bg-yellow-700',
      defaultTitle: 'Peringatan'
    },
    info: {
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      icon: 'fa-info-circle',
      titleColor: 'text-blue-800',
      buttonBg: 'bg-blue-600 hover:bg-blue-700',
      defaultTitle: 'Informasi'
    }
  };

  const config = configs[type] || configs.info;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className={`${config.bgColor} ${config.borderColor} border-2 rounded-lg shadow-2xl max-w-md w-full transform transition-all animate-fade-in`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-start space-x-4">
            {/* Icon */}
            <div className={`${config.iconBg} p-3 rounded-full flex-shrink-0`}>
              <i className={`fas ${config.icon} ${config.iconColor} text-2xl`}></i>
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className={`text-lg font-semibold ${config.titleColor} mb-2`}>
                {title || config.defaultTitle}
              </h3>
              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                {message}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex justify-end">
          <button
            onClick={onClose}
            className={`${config.buttonBg} text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2`}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertModal;

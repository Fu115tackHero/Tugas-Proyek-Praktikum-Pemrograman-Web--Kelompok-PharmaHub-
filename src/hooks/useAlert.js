import { useState } from 'react';

/**
 * Custom hook for managing alert modals
 * Usage:
 * const { alertState, showAlert, hideAlert } = useAlert();
 * 
 * showAlert('Success message', 'success', 'Custom Title');
 * showAlert('Error message', 'error');
 */
export const useAlert = () => {
  const [alertState, setAlertState] = useState({
    isOpen: false,
    message: '',
    type: 'info',
    title: ''
  });

  const showAlert = (message, type = 'info', title = '') => {
    setAlertState({
      isOpen: true,
      message,
      type,
      title
    });
  };

  const hideAlert = () => {
    setAlertState(prev => ({
      ...prev,
      isOpen: false
    }));
  };

  return {
    alertState,
    showAlert,
    hideAlert
  };
};

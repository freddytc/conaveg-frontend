import { useState } from 'react';

export const useNotification = () => {
  const [notification, setNotification] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: null,
    showCancel: false,
    confirmText: 'Aceptar',
    cancelText: 'Cancelar'
  });

  const showNotification = (config) => {
    setNotification({
      isOpen: true,
      title: config.title,
      message: config.message,
      type: config.type || 'info',
      onConfirm: () => {
        // Ejecutar callback si existe
        if (config.onConfirm) {
          config.onConfirm();
        }
        // Cerrar notificación
        closeNotification();
      },
      showCancel: config.showCancel || false,
      confirmText: config.confirmText || 'Aceptar',
      cancelText: config.cancelText || 'Cancelar'
    });
  };

  const closeNotification = () => {
    setNotification(prev => ({ ...prev, isOpen: false }));
  };

  // Métodos de conveniencia
  const showSuccess = (title, message, onConfirm) => {
    showNotification({
      title,
      message,
      type: 'success',
      onConfirm,
      confirmText: 'Continuar'
    });
  };

  const showError = (title, message, onConfirm) => {
    showNotification({
      title,
      message,
      type: 'danger',
      onConfirm,
      confirmText: 'Entendido'
    });
  };

  const showWarning = (title, message, onConfirm) => {
    showNotification({
      title,
      message,
      type: 'warning',
      onConfirm,
      confirmText: 'Continuar'
    });
  };

  const showConfirm = (title, message, onConfirm, onCancel) => {
    showNotification({
      title,
      message,
      type: 'warning',
      onConfirm: () => {
        if (onConfirm) {
          onConfirm();
        }
        closeNotification();
      },
      showCancel: true,
      confirmText: 'Confirmar',
      cancelText: 'Cancelar'
    });
  };

  const showInfo = (title, message, onConfirm) => {
    showNotification({
      title,
      message,
      type: 'info',
      onConfirm
    });
  };

  return {
    notification,
    closeNotification,
    showSuccess,
    showError,
    showWarning,
    showConfirm,
    showInfo
  };
};
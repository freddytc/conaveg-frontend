import React from 'react';

const Modal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  type = 'info', // 'info', 'warning', 'danger', 'success'
  confirmText = 'Aceptar',
  cancelText = 'Cancelar',
  showCancel = false 
}) => {
  if (!isOpen) return null;

  const getIconClass = () => {
    switch (type) {
      case 'warning':
        return 'fas fa-exclamation-triangle text-warning';
      case 'danger':
        return 'fas fa-exclamation-circle text-danger';
      case 'success':
        return 'fas fa-check-circle text-success';
      case 'info':
      default:
        return 'fas fa-info-circle text-info';
    }
  };

  const getHeaderClass = () => {
    switch (type) {
      case 'warning':
        return 'border-warning';
      case 'danger':
        return 'border-danger';
      case 'success':
        return 'border-success';
      case 'info':
      default:
        return 'border-info';
    }
  };

  return (
    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className={`modal-content ${getHeaderClass()}`} style={{ borderTop: '4px solid' }}>
          <div className="modal-header">
            <h5 className="modal-title">
              <i className={`${getIconClass()} mr-2`}></i>
              {title}
            </h5>
            <button type="button" className="close" onClick={onClose}>
              <span>&times;</span>
            </button>
          </div>
          <div className="modal-body">
            <p className="mb-0">{message}</p>
          </div>
          <div className="modal-footer">
            {showCancel && (
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={onClose}
              >
                {cancelText}
              </button>
            )}
            <button 
              type="button" 
              className={`btn ${
                type === 'danger' ? 'btn-danger' : 
                type === 'success' ? 'btn-success' : 
                type === 'warning' ? 'btn-warning' : 
                'btn-primary'
              }`}
              onClick={onConfirm}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
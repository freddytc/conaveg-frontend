import React, { useEffect, useState } from 'react';

const Toast = ({ 
  isVisible, 
  message, 
  type = 'success', 
  duration = 3500, // 3.5 segundos es ideal
  onClose 
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      // Animación de entrada
      setIsAnimating(true);
      
      if (duration > 0) {
        const timer = setTimeout(() => {
          // Animación de salida
          setIsAnimating(false);
          setTimeout(() => {
            onClose();
          }, 300); // Tiempo para animación de salida
        }, duration);
        
        return () => clearTimeout(timer);
      }
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const getToastConfig = () => {
    switch (type) {
      case 'success':
        return {
          bgColor: '#d4edda',
          borderColor: '#28a745',
          textColor: '#155724',
          iconColor: '#28a745',
          icon: 'fas fa-check-circle'
        };
      case 'error':
        return {
          bgColor: '#f8d7da',
          borderColor: '#dc3545',
          textColor: '#721c24',
          iconColor: '#dc3545',
          icon: 'fas fa-exclamation-circle'
        };
      case 'warning':
        return {
          bgColor: '#fff3cd',
          borderColor: '#ffc107',
          textColor: '#856404',
          iconColor: '#ffc107',
          icon: 'fas fa-exclamation-triangle'
        };
      case 'info':
      default:
        return {
          bgColor: '#d1ecf1',
          borderColor: '#17a2b8',
          textColor: '#0c5460',
          iconColor: '#17a2b8',
          icon: 'fas fa-info-circle'
        };
    }
  };

  const config = getToastConfig();

  return (
    <div 
      className="position-fixed" 
      style={{ 
        top: '20px', 
        right: '20px', 
        zIndex: 9999,
        minWidth: '320px',
        maxWidth: '400px'
      }}
    >
      <div 
        className={`card border-0 shadow-lg ${isAnimating ? 'animate__animated animate__slideInRight' : 'animate__animated animate__slideOutRight'}`}
        style={{
          backgroundColor: config.bgColor,
          borderLeft: `4px solid ${config.borderColor}`,
          borderRadius: '8px',
          overflow: 'hidden',
          transform: isAnimating ? 'translateX(0)' : 'translateX(100%)',
          transition: 'all 0.3s ease-in-out'
        }}
      >
        <div className="card-body py-3 px-4">
          <div className="d-flex align-items-center">
            {/* Icono */}
            <div 
              className="mr-3 d-flex align-items-center justify-content-center"
              style={{
                width: '40px',
                height: '40px',
                backgroundColor: config.iconColor,
                borderRadius: '50%',
                color: 'white',
                fontSize: '18px'
              }}
            >
              <i className={config.icon}></i>
            </div>
            
            {/* Mensaje */}
            <div className="flex-grow-1">
              <p 
                className="mb-0 font-weight-medium"
                style={{ 
                  color: config.textColor,
                  fontSize: '14px',
                  lineHeight: '1.4'
                }}
              >
                {message}
              </p>
            </div>
            
            {/* Botón cerrar */}
            <button 
              type="button" 
              className="ml-2 btn-sm border-0 bg-transparent"
              onClick={onClose}
              style={{ 
                color: config.textColor,
                fontSize: '16px',
                opacity: 0.7,
                cursor: 'pointer',
                padding: '2px 6px'
              }}
              onMouseEnter={(e) => e.target.style.opacity = '1'}
              onMouseLeave={(e) => e.target.style.opacity = '0.7'}
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
          
          {/* Barra de progreso (opcional) */}
          {duration > 0 && (
            <div 
              className="progress mt-2"
              style={{ height: '2px', backgroundColor: 'rgba(255,255,255,0.3)' }}
            >
              <div 
                className="progress-bar"
                style={{
                  backgroundColor: config.borderColor,
                  animation: `shrink ${duration}ms linear forwards`
                }}
              ></div>
            </div>
          )}
        </div>
      </div>
      
      {/* CSS para la animación de la barra de progreso */}
      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
        
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes slideOutRight {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }
        
        .animate__slideInRight {
          animation: slideInRight 0.3s ease-out;
        }
        
        .animate__slideOutRight {
          animation: slideOutRight 0.3s ease-in;
        }
      `}</style>
    </div>
  );
};

export default Toast;
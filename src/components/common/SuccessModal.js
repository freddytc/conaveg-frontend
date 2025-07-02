import React, { useEffect, useState } from 'react';

const SuccessModal = ({ 
  isVisible, 
  message, 
  title = "¡Éxito!",
  duration = 500, 
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

  return (
    <>
      {/* CSS para animaciones */}
      <style>
        {`
          @keyframes shrink {
            from { width: 100%; }
            to { width: 0%; }
          }
          
          @keyframes checkPulse {
            0% {
              transform: scale(0);
              opacity: 0;
            }
            50% {
              transform: scale(1.1);
            }
            100% {
              transform: scale(1);
              opacity: 1;
            }
          }
          
          @keyframes slideInUp {
            from {
              transform: translateY(50px) scale(0.8);
              opacity: 0;
            }
            to {
              transform: translateY(0) scale(1);
              opacity: 1;
            }
          }
          
          @keyframes slideOutDown {
            from {
              transform: translateY(0) scale(1);
              opacity: 1;
            }
            to {
              transform: translateY(-50px) scale(0.8);
              opacity: 0;
            }
          }
          
          .animate-in {
            animation: slideInUp 0.4s ease-out;
          }
          
          .animate-out {
            animation: slideOutDown 0.3s ease-in;
          }
        `}
      </style>

      {/* Overlay de fondo */}
      <div 
        className="modal-backdrop show"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          zIndex: 1050
        }}
      />
      
      {/* Modal centrado */}
      <div 
        className="modal show d-flex align-items-center justify-content-center"
        style={{ 
          display: 'flex',
          zIndex: 1055
        }}
      >
        <div 
          className={`modal-dialog modal-dialog-centered ${isAnimating ? 'animate-in' : 'animate-out'}`}
          style={{
            maxWidth: '400px',
            margin: '0'
          }}
        >
          <div 
            className="modal-content border-0 shadow-lg"
            style={{
              borderRadius: '15px',
              overflow: 'hidden',
              backgroundColor: '#ffffff'
            }}
          >
            <div 
              className="modal-body text-center py-5 px-4"
              style={{
                background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)'
              }}
            >
              {/* Icono de check grande */}
              <div 
                className="mb-4 d-flex align-items-center justify-content-center"
                style={{
                  width: '80px',
                  height: '80px',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '50%',
                  margin: '0 auto',
                  animation: isAnimating ? 'checkPulse 0.6s ease-out' : 'none'
                }}
              >
                <i 
                  className="fas fa-check"
                  style={{
                    fontSize: '40px',
                    color: 'white'
                  }}
                ></i>
              </div>
              
              {/* Título */}
              <h4 
                className="modal-title mb-3"
                style={{
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '24px'
                }}
              >
                {title}
              </h4>
              
              {/* Mensaje */}
              <p 
                className="mb-0"
                style={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontSize: '16px',
                  lineHeight: '1.5'
                }}
              >
                {message}
              </p>
              
              {/* Barra de progreso para mostrar tiempo restante */}
              {duration > 0 && (
                <div 
                  className="progress mt-4"
                  style={{ 
                    height: '3px', 
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    borderRadius: '2px'
                  }}
                >
                  <div 
                    className="progress-bar"
                    style={{
                      backgroundColor: 'white',
                      animation: `shrink ${duration}ms linear forwards`,
                      borderRadius: '2px'
                    }}
                  ></div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SuccessModal;
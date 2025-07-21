import React, { useEffect, useState } from 'react';

const SuccessModal = ({
  isVisible,
  message,
  title = "Good job!",
  duration = 2000,
  onClose
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);

      if (duration > 0) {
        const timer = setTimeout(() => {
          setIsAnimating(false);
          setTimeout(() => {
            onClose();
          }, 300);
        }, duration);

        return () => clearTimeout(timer);
      }
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  return (
    <>
      <style>
        {`
          @keyframes shrink {
            from { width: 100%; }
            to { width: 0%; }
          }
          @keyframes checkPulse {
            0% { transform: scale(0); opacity: 0; }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); opacity: 1; }
          }
          @keyframes checkDraw {
            to { stroke-dashoffset: 0; }
          }
          .animate-in {
            animation: fadeInScale 0.4s cubic-bezier(.36,1.01,.32,1) both;
          }
          .animate-out {
            animation: fadeOutScale 0.3s cubic-bezier(.36,1.01,.32,1) both;
          }
          @keyframes fadeInScale {
            from { opacity: 0; transform: scale(0.85);}
            to { opacity: 1; transform: scale(1);}
          }
          @keyframes fadeOutScale {
            from { opacity: 1; transform: scale(1);}
            to { opacity: 0; transform: scale(0.85);}
          }
        `}
      </style>

      {/* Overlay */}
      <div
        className="modal-backdrop show"
        style={{
          backgroundColor: 'rgba(0,0,0,0.4)',
          zIndex: 1050
        }}
      />

      {/* Modal */}
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
            maxWidth: '420px',
            margin: '0'
          }}
        >
          <div
            className="modal-content border-0 shadow-lg"
            style={{
              borderRadius: '10px',
              overflow: 'hidden',
              backgroundColor: '#fff',
              padding: '0'
            }}
          >
            <div
              className="modal-body text-center px-4 py-5"
              style={{
                background: '#fff',
                borderRadius: '10px'
              }}
            >
              {/* Check animado */}
              <div
                className="mb-4 d-flex align-items-center justify-content-center"
                style={{
                  width: '90px',
                  height: '90px',
                  backgroundColor: '#f0fdf4',
                  borderRadius: '50%',
                  margin: '0 auto',
                  boxShadow: '0 0 0 4px #e6f9ec',
                  animation: isAnimating ? 'checkPulse 0.6s ease-out' : 'none'
                }}
              >
                <svg width="60" height="60" viewBox="0 0 60 60">
                  <circle
                    cx="30"
                    cy="30"
                    r="28"
                    fill="none"
                    stroke="#38d996"
                    strokeWidth="4"
                    opacity="0.18"
                  />
                  <polyline
                    points="18,32 27,41 42,23"
                    fill="none"
                    stroke="#38d996"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                      strokeDasharray: 40,
                      strokeDashoffset: 40,
                      animation: 'checkDraw 0.5s 0.1s forwards'
                    }}
                  />
                </svg>
              </div>

              {/* Título */}
              <h4
                className="modal-title mb-2"
                style={{
                  color: '#444',
                  fontWeight: 'bold',
                  fontSize: '26px'
                }}
              >
                {title}
              </h4>

              {/* Mensaje */}
              <p
                className="mb-0"
                style={{
                  color: '#888',
                  fontSize: '17px',
                  lineHeight: '1.5'
                }}
              >
                {message}
              </p>

              {/* Barra de progreso */}
              {duration > 0 && (
                <div
                  className="progress mt-4"
                  style={{
                    height: '3px',
                    backgroundColor: '#e6f9ec',
                    borderRadius: '2px'
                  }}
                >
                  <div
                    className="progress-bar"
                    style={{
                      backgroundColor: '#38d996',
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
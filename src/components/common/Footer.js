import React from 'react';

const Footer = () => {
  return (
    <footer 
      className="footer"
      style={{
        background: '#ffffff',
        borderTop: '1px solid #dee2e6',
        color: '#6c757d',
        boxShadow: '0 -2px 4px rgba(0,0,0,0.1)'
      }}
    >
      <div className="container-fluid">
        <nav className="pull-left">
          <ul className="nav">
            <li className="nav-item">
              <a 
                className="nav-link" 
                href="#"
                style={{
                  color: '#000000ff',
                  textDecoration: 'none',
                  fontWeight: '600',
                  transition: 'color 0.2s ease'
                }}
              >
                CONAVEG
              </a>
            </li>
          </ul>
        </nav>
        <div 
          className="copyright ml-auto"
          style={{
            color: '#000000ff',
            fontSize: '13px',
            fontWeight: '400'
          }}
        >
          2025, Sistema de Gestión CONAVEG
        </div>
      </div>
    </footer>
  );
};

export default Footer;
import React from 'react';

const Footer = () => {
  return (
    <footer 
      className="footer"
      style={{
        background: 'linear-gradient(135deg, #1e1e2e 0%, #2a2d47 100%)',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        color: '#b8bcc8'
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
                  color: '#b8bcc8',
                  textDecoration: 'none'
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
            color: '#6c7293',
            fontSize: '13px'
          }}
        >
          2025, Sistema de Gestión CONAVEG
        </div>
      </div>
    </footer>
  );
};

export default Footer;
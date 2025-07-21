import React, { useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import '../styles/LightTheme.css'; // Cambiar a tema claro

const Layout = ({ children }) => {
  useEffect(() => {
    // Agregar clases necesarias al body
    document.body.classList.add('sidebar-mini');
    // Aplicar tema claro al body
    document.body.style.background = '#f8f9fa'; // Fondo blanco/gris muy claro
    document.body.style.color = '#212529'; // Texto oscuro
    
    // Cleanup al desmontar
    return () => {
      document.body.classList.remove('sidebar-mini');
      document.body.style.background = '';
      document.body.style.color = '';
    };
  }, []);

  return (
    <>
      <div className="wrapper">
        <div className="main-header">
          <Header />
        </div>
        
        <Sidebar />
        
        <div 
          className="main-panel"
          style={{
            background: '#ffffff', // Fondo blanco
            color: '#212529', // Texto oscuro
            minHeight: '100vh'
          }}
        >
          <div 
            className="content"
            style={{
              background: 'transparent',
              color: '#212529', // Texto oscuro
              padding: '20px'
            }}
          >
            <div 
              className="page-inner"
              style={{
                background: 'transparent',
                color: '#212529' // Texto oscuro
              }}
            >
              {children}
            </div>
          </div>
          <Footer />
        </div>
      </div>
    </>
  );
};

export default Layout;
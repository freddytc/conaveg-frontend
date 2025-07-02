import React, { useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import '../styles/DarkTheme.css'; 
  
const Layout = ({ children }) => {
  useEffect(() => {
    // Agregar clases necesarias al body
    document.body.classList.add('sidebar-mini');
    // Aplicar tema oscuro al body
    document.body.style.background = 'linear-gradient(135deg, #1e1e2e 0%, #2a2d47 100%)';
    document.body.style.color = '#fff';
    
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
            background: 'linear-gradient(135deg, #1e1e2e 0%, #2a2d47 100%)',
            color: '#fff',
            minHeight: '100vh'
          }}
        >
          <div 
            className="content"
            style={{
              background: 'transparent',
              color: '#fff',
              padding: '20px'
            }}
          >
            <div 
              className="page-inner"
              style={{
                background: 'transparent',
                color: '#fff'
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
import React, { useState } from 'react';
import { authService } from '../../services/authService';

const Header = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const user = authService.getCurrentUser();

  const handleLogout = async () => {
    try {
      await authService.logout();
      window.location.reload();
    } catch (error) {
      console.error('Error en logout:', error);
      // Forzar logout local aunque falle el servidor
      authService.logout();
      window.location.reload();
    }
  };

  const toggleDropdown = (e) => {
    e.preventDefault();
    setDropdownOpen(!dropdownOpen);
  };

  const closeDropdown = () => {
    setDropdownOpen(false);
  };

  return (
    <div className="main-header-logo">
      <div 
        className="logo-header" 
        style={{
          background: 'linear-gradient(135deg, #1e1e2e 0%, #2a2d47 100%)'
        }}
      >
        <a href="/" className="logo">
          <img src="/assets/img/logo.svg" alt="navbar brand" className="navbar-brand" />
        </a>
        <button className="navbar-toggler sidenav-toggler ml-auto" type="button">
          <span className="navbar-toggler-icon">
            <i className="icon-menu"></i>
          </span>
        </button>
        <button className="topbar-toggler more">
          <i className="icon-options-vertical"></i>
        </button>
      </div>
      
      <nav 
        className="navbar navbar-header navbar-expand-lg" 
        style={{
          background: 'linear-gradient(135deg, #1e1e2e 0%, #2a2d47 100%)'
        }}
      >
        <div className="container-fluid">
          <ul className="navbar-nav topbar-nav ml-md-auto align-items-center">
            <li className={`nav-item dropdown hidden-caret ${dropdownOpen ? 'show' : ''}`}>
              <a 
                className="dropdown-toggle profile-pic" 
                href="#" 
                onClick={toggleDropdown}
                aria-expanded={dropdownOpen}
              >
                <div className="avatar-sm">
                  <img src="/assets/img/profile.jpg" alt="..." className="avatar-img rounded-circle" />
                </div>
              </a>
              <ul className={`dropdown-menu dropdown-user animated fadeIn ${dropdownOpen ? 'show' : ''}`}>
                <div className="dropdown-user-scroll scrollbar-outer">
                  <li>
                    <div className="user-box">
                      <div className="avatar-lg">
                        <img src="/assets/img/profile.jpg" alt="image profile" className="avatar-img rounded" />
                      </div>
                      <div className="u-text">
                        <h4>{user?.userName || 'Usuario'}</h4>
                        <p className="text-muted">{user?.email || 'usuario@email.com'}</p>
                      </div>
                    </div>
                  </li>
                  <li>
                    <div className="dropdown-divider"></div>
                    <a 
                      className="dropdown-item" 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        closeDropdown();
                        handleLogout();
                      }}
                    >
                      <i className="fas fa-sign-out-alt mr-2"></i>
                      Cerrar Sesión
                    </a>
                  </li>
                </div>
              </ul>
            </li>
          </ul>
        </div>
      </nav>

      {/* Overlay para cerrar dropdown al hacer clic fuera */}
      {dropdownOpen && (
        <div 
          className="dropdown-backdrop"
          onClick={closeDropdown}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 999,
            background: 'transparent'
          }}
        />
      )}
    </div>
  );
};

export default Header;
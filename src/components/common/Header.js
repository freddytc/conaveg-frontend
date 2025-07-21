import React, { useState, useEffect } from 'react';
import { authService } from '../../services/authService';
import { notificationService } from '../../services/notificationService';
import '../styles/Header.css';

const Header = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [notificationStats, setNotificationStats] = useState({
    lowStockCount: 0,
    outOfStockCount: 0
  });
  const [isCollapsed, setIsCollapsed] = useState(false);

  const user = authService.getCurrentUser();

  //Escuchar cambios en el sidebar
  useEffect(() => {
    const checkCollapsedState = () => {
      setIsCollapsed(document.body.classList.contains('sidebar_minimize'));
    };

    checkCollapsedState();

    const observer = new MutationObserver(checkCollapsedState);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  const removeNotification = (notificationId, event) => {
    event.stopPropagation();
    const updatedNotifications = notifications.filter(n => n.id !== notificationId);
    setNotifications(updatedNotifications);
    setNotificationCount(updatedNotifications.length);

    const removedNotification = notifications.find(n => n.id === notificationId);
    if (removedNotification) {
      setNotificationStats(prev => ({
        lowStockCount: removedNotification.type === 'warning' ? prev.lowStockCount - 1 : prev.lowStockCount,
        outOfStockCount: removedNotification.type === 'danger' ? prev.outOfStockCount - 1 : prev.outOfStockCount
      }));
    }
  };

  const removeAllNotifications = () => {
    setNotifications([]);
    setNotificationCount(0);
    setNotificationStats({ lowStockCount: 0, outOfStockCount: 0 });
  };

  const loadNotifications = async () => {
    try {
      setLoadingNotifications(true);
      const result = await notificationService.getLowStockAlerts(10);
      setNotifications(result.notifications);
      setNotificationCount(result.count);
      setNotificationStats({
        lowStockCount: result.lowStockCount,
        outOfStockCount: result.outOfStockCount
      });
    } catch (error) {
      console.error('Error al cargar notificaciones:', error);
      setNotifications([]);
      setNotificationCount(0);
      setNotificationStats({ lowStockCount: 0, outOfStockCount: 0 });
    } finally {
      setLoadingNotifications(false);
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleInventoryUpdate = () => {
      console.log('Inventario actualizado, recargando notificaciones...');
      loadNotifications();
    };
    window.addEventListener('inventoryUpdated', handleInventoryUpdate);
    return () => {
      window.removeEventListener('inventoryUpdated', handleInventoryUpdate);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout();
      window.location.reload();
    } catch (error) {
      console.error('Error en logout:', error);
      authService.logout();
      window.location.reload();
    }
  };

  const toggleDropdown = (e) => {
    e.preventDefault();
    setDropdownOpen(!dropdownOpen);
    setNotificationOpen(false);
  };

  const toggleNotifications = (e) => {
    e.preventDefault();
    setNotificationOpen(!notificationOpen);
    setDropdownOpen(false);
  };

  const closeDropdown = () => setDropdownOpen(false);
  const closeNotifications = () => setNotificationOpen(false);

  const toggleSidebar = () => {
    document.body.classList.toggle('sidebar_minimize');
  };

  const goToInventory = () => {
    setNotificationOpen(false);
    window.history.pushState({}, '', '/inventario');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const getBadgeColor = () => {
    if (notificationStats.outOfStockCount > 0) return 'badge-danger';
    if (notificationStats.lowStockCount > 0) return 'badge-warning';
    return 'badge-primary';
  };

  return (
    <div className="main-header-logo">
      <div className="logo-header">
        {/*Container del logo y toggle */}
        <div className={`logo-toggle-container ${isCollapsed ? 'collapsed' : 'expanded'}`}>
          {/*Nombre de la empresa */}
          {!isCollapsed && (
            <h1 className="login-title">Conaveg</h1>
          )}
          
          {/*Toggle button */}
          <button
            className={`navbar-toggler sidenav-toggler ${isCollapsed ? 'collapsed' : 'expanded'}`}
            type="button"
            onClick={toggleSidebar}
          >
            {isCollapsed ? (
              <div className="toggle-dots">
                <div className="toggle-dot"></div>
                <div className="toggle-dot"></div>
                <div className="toggle-dot"></div>
              </div>
            ) : (
              <div className="toggle-lines">
                <div className="toggle-line"></div>
                <div className="toggle-line"></div>
                <div className="toggle-line"></div>
              </div>
            )}
          </button>
        </div>

        {/*Elementos del lado derecho */}
        {!isCollapsed && (
          <div className="header-right-elements">
            <a href="/" className="logo">
            </a>

            <button className="topbar-toggler more">
              <i className="icon-options-vertical"></i>
            </button>
          </div>
        )}
      </div>

      <nav className="navbar navbar-header navbar-expand-lg">
        <div className="container-fluid">
          <ul className="navbar-nav topbar-nav ml-md-auto align-items-center">

            {/* Notificaciones */}
            <li className={`nav-item dropdown ${notificationOpen ? 'show' : ''}`}>
              <a
                className="nav-link dropdown-toggle"
                href="#"
                onClick={toggleNotifications}
                style={{ position: 'relative' }}
              >
                <i
                  className={`fas fa-bell notification-icon ${notificationCount > 0 ? 'has-notifications' : 'no-notifications'}`}
                ></i>
                {notificationCount > 0 && (
                  <span className={`badge notification-badge ${getBadgeColor()}`}>
                    {notificationCount > 99 ? '99+' : notificationCount}
                  </span>
                )}
              </a>

              {/* Dropdown de notificaciones */}
              <ul className={`dropdown-menu dropdown-menu-right animated fadeIn notification-dropdown ${notificationOpen ? 'show' : ''}`}>
                <li className="dropdown-header">
                  <div className="d-flex justify-content-between align-items-center">
                    <span><strong>Notificaciones</strong></span>
                    <div>
                      {notificationCount > 0 && (
                        <button
                          className="btn btn-sm btn-link p-0 mr-2"
                          onClick={removeAllNotifications}
                          title="Quitar todas las notificaciones"
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      )}
                      <button
                        className="btn btn-sm btn-link p-0"
                        onClick={loadNotifications}
                        disabled={loadingNotifications}
                        title="Actualizar notificaciones"
                      >
                        <i className={`fas fa-sync-alt ${loadingNotifications ? 'fa-spin' : ''}`}></i>
                      </button>
                    </div>
                  </div>
                  {notificationCount > 0 && (
                    <div className="mt-1">
                      <small className="text-muted">
                        {notificationStats.outOfStockCount > 0 && (
                          <span className="badge badge-danger badge-sm mr-1">
                            {notificationStats.outOfStockCount} Sin Stock
                          </span>
                        )}
                        {notificationStats.lowStockCount > 0 && (
                          <span className="badge badge-warning badge-sm">
                            {notificationStats.lowStockCount} Stock Bajo
                          </span>
                        )}
                      </small>
                    </div>
                  )}
                </li>
                <li><div className="dropdown-divider"></div></li>

                {loadingNotifications ? (
                  <li className="loading-notifications">
                    <i className="fas fa-spinner fa-spin"></i> Cargando alertas...
                  </li>
                ) : notifications.length === 0 ? (
                  <li className="empty-notifications">
                    <i className="fas fa-check-circle text-success empty-notifications-icon"></i>
                    <br />
                    <strong>No hay notificaciones</strong>
                  </li>
                ) : (
                  <>
                    {notifications.slice(0, 8).map((notification) => (
                      <li key={notification.id}>
                        <div
                          className={`dropdown-item d-flex align-items-start notification-item ${notification.type}`}
                          onClick={(e) => {
                            e.preventDefault();
                            goToInventory();
                          }}
                        >
                          <div className="notification-icon-container">
                            <i className={`${notification.icon} notification-icon-item ${notification.type}`}></i>
                          </div>
                          <div className="notification-content">
                            <div className="notification-title">
                              {notification.title}
                            </div>
                            <div className="notification-message">
                              {notification.message}
                            </div>
                            <div className="notification-time">
                              {notification.time}
                            </div>
                          </div>
                          <div className="notification-remove">
                            <button
                              className="btn btn-sm btn-link p-0 notification-remove-btn"
                              onClick={(e) => removeNotification(notification.id, e)}
                              title="Quitar esta notificación"
                            >
                              <i className="fas fa-times"></i>
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}

                    {notifications.length > 8 && (
                      <li>
                        <div className="text-center p-2">
                          <small className="text-muted">
                            ... y {notifications.length - 8} alertas más
                          </small>
                        </div>
                      </li>
                    )}
                  </>
                )}
              </ul>
            </li>

            {/* Dropdown de usuario */}
            <li className={`nav-item dropdown hidden-caret ${dropdownOpen ? 'show' : ''}`}>
              <a
                className="dropdown-toggle profile-pic"
                href="#"
                onClick={toggleDropdown}
                aria-expanded={dropdownOpen}
              >
                <div className="avatar-sm">
                  <img src="/assets/img/user.png" alt="..." className="avatar-img rounded-circle" />
                </div>
              </a>
              <ul className={`dropdown-menu dropdown-user animated fadeIn ${dropdownOpen ? 'show' : ''}`}>
                <div className="dropdown-user-scroll scrollbar-outer">
                  <li>
                    <div className="user-box">
                      <div className="avatar-lg">
                        <img src="/assets/img/user.png" alt="image profile" className="avatar-img rounded" />
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

      {/* Overlay para cerrar dropdowns */}
      {(dropdownOpen || notificationOpen) && (
        <div
          className="dropdown-backdrop"
          onClick={() => {
            closeDropdown();
            closeNotifications();
          }}
        />
      )}
    </div>
  );
};

export default Header;
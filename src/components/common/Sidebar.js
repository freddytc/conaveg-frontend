import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import '../styles/Sidebar.css';

const Sidebar = () => {
  const { user, isAuthenticated } = useAuth();

  const [expandedSections, setExpandedSections] = useState({
    administracion: false,
    recursos: false,
    inventario: false,
    operaciones: false
  });

  const [activeItem, setActiveItem] = useState('dashboard');
  const [isCollapsed, setIsCollapsed] = useState(false);

  // ✅ Escuchar cambios en el body class
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

  // ✅ Toggle del sidebar
  const toggleSidebar = () => {
    document.body.classList.toggle('sidebar_minimize');
    setIsCollapsed(!isCollapsed);
  };

  const canViewSection = (section) => {
    if (!user || !isAuthenticated) return false;

    const permissions = {
      ADMINISTRADOR: ['usuarios', 'empleados', 'inventario', 'movimientos', 'asignaciones', 'proyectos', 'asistencias', 'facturas', 'proveedores'],
      ADMIN: ['usuarios', 'empleados', 'inventario', 'movimientos', 'asignaciones', 'proyectos', 'asistencias', 'facturas', 'proveedores'],
      GERENTE: ['empleados', 'inventario', 'movimientos', 'asignaciones', 'proyectos', 'asistencias', 'proveedores', 'facturas'],
      EMPLEADO: ['inventario', 'movimientos', 'proyectos'],
      USER: ['inventario', 'proyectos']
    };

    const userRole = getUserRole();
    return permissions[userRole]?.includes(section) || false;
  };

  const toggleSection = (sectionName) => {
    if (isCollapsed) return; // No expandir si está colapsado
    setExpandedSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
  };

  const handleItemClick = (itemKey, href) => {
    if (activeItem === itemKey) {
      window.location.reload();
      return;
    }
    setActiveItem(itemKey);
    window.history.pushState({}, '', href);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const getUserName = () => {
    if (!user) return 'Usuario';
    return user.userName || user.name || user.email?.split('@')[0] || 'Usuario';
  };

  const getUserRole = () => {
    if (!user) return 'USER';

    if (user.userName === 'admin' || user.email?.includes('admin')) {
      return 'ADMIN';
    }

    const role = user.role || user.roles || user.authority || user.tipo || user.tipoUsuario || 'USER';

    if (Array.isArray(role)) {
      return role[0] || 'USER';
    }

    if (typeof role === 'object' && role !== null) {
      return role.nombre || role.name || role.authority || 'USER';
    }

    return String(role).toUpperCase();
  };

  const sections = [
    {
      id: 'administracion',
      title: 'Administración',
      icon: 'fas fa-users-cog',
      items: [
        { key: 'usuarios', href: '/usuarios', icon: 'fas fa-users', title: 'Usuarios' },
        { key: 'empleados', href: '/empleados', icon: 'fas fa-user-tie', title: 'Empleados' },
        { key: 'asistencias', href: '/asistencias', icon: 'fas fa-calendar-check', title: 'Asistencias' }
      ]
    },
    {
      id: 'recursos',
      title: 'Recursos Humanos',
      icon: 'fas fa-user-friends',
      items: [
        { key: 'asignaciones', href: '/asignaciones', icon: 'fas fa-users-cog', title: 'Asignaciones' },
        { key: 'proyectos', href: '/proyectos', icon: 'fas fa-project-diagram', title: 'Proyectos' }
      ]
    },
    {
      id: 'inventario',
      title: 'Inventario',
      icon: 'fas fa-warehouse',
      items: [
        { key: 'inventario', href: '/inventario', icon: 'fas fa-boxes', title: 'Stock' },
        { key: 'movimientos', href: '/movimientos', icon: 'fas fa-exchange-alt', title: 'Movimientos' },
        { key: 'proveedores', href: '/proveedores', icon: 'fas fa-truck', title: 'Proveedores' }
      ]
    },
    {
      id: 'operaciones',
      title: 'Operaciones',
      icon: 'fas fa-chart-line',
      items: [
        { key: 'facturas', href: '/facturas', icon: 'fas fa-file-invoice', title: 'Facturas' }
      ]
    }
  ];

  // ✅ Obtener todos los items individuales para modo colapsado
  const getAllVisibleItems = () => {
    const allItems = [];
    
    // Dashboard
    allItems.push({
      key: 'dashboard',
      href: '/dashboard',
      icon: 'fas fa-home',
      title: 'Dashboard'
    });

    // Items de cada sección que el usuario puede ver
    sections.forEach(section => {
      section.items.forEach(item => {
        if (canViewSection(item.key)) {
          allItems.push(item);
        }
      });
    });

    return allItems;
  };

  const renderCollapsibleSection = (section) => {
    const visibleItems = section.items.filter(item => canViewSection(item.key));

    if (visibleItems.length === 0) return null;

    const isExpanded = expandedSections[section.id];

    return (
      <li key={section.id} className="nav-item">
        <a
          href="#"
          className={`sidebar-section-link ${isExpanded ? 'expanded' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            toggleSection(section.id);
          }}
        >
          <div className="sidebar-section-content">
            <i className={`${section.icon} sidebar-section-icon ${isExpanded ? 'expanded' : ''}`}></i>
            <span className={`sidebar-section-title ${isExpanded ? 'expanded' : ''}`}>
              {section.title}
            </span>
          </div>
          <i className={`fas fa-chevron-down sidebar-section-chevron ${isExpanded ? 'expanded' : ''}`}></i>
        </a>

        <div
          className={`sidebar-submenu ${isExpanded ? '' : 'collapsed'}`}
          style={{
            maxHeight: isExpanded ? `${visibleItems.length * 40 + 10}px` : '0'
          }}
        >
          {visibleItems.map((item) => (
            <a
              key={item.key}
              href="#"
              className={`sidebar-submenu-item ${activeItem === item.key ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                handleItemClick(item.key, item.href);
              }}
            >
              <i className={`${item.icon} sidebar-submenu-icon`}></i>
              <span>{item.title}</span>
            </a>
          ))}
        </div>
      </li>
    );
  };

  return (
    <div className="sidebar">
      <div className="sidebar-wrapper">
        <div className="sidebar-header">
          {/*Solo mostrar info de usuario si NO está colapsado */}
          {!isCollapsed && (
            <div className="sidebar-user-info">
              <div className="sidebar-user-avatar">
                <i className="fas fa-user"></i>
              </div>
              <div className="sidebar-user-details">
                <div className="sidebar-user-name">
                  {getUserName()}
                </div>
                <div className="sidebar-user-role">
                  {getUserRole()}
                </div>
              </div>
            </div>
          )}
          
        </div>

        <div className="sidebar-content">
          {isCollapsed ? (
            //Vista colapsada
            <ul className="sidebar-nav sidebar-nav-collapsed">
              {getAllVisibleItems().map((item) => (
                <li key={item.key} className="nav-item">
                  <a
                    href="#"
                    className={`sidebar-collapsed-item ${activeItem === item.key ? 'active' : ''}`}
                    onClick={(e) => {
                      e.preventDefault();
                      handleItemClick(item.key, item.href);
                    }}
                    title={item.title}
                  >
                    <i className={item.icon}></i>
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            //Vista expandida 
            <ul className="sidebar-nav">
              <li className="nav-item">
                <a
                  href="#"
                  className={`sidebar-dashboard-link ${activeItem === 'dashboard' ? 'active' : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleItemClick('dashboard', '/dashboard');
                  }}
                >
                  <i className="fas fa-home sidebar-dashboard-icon"></i>
                  <span>Dashboard</span>
                </a>
              </li>

              <li className="sidebar-modules-divider">
                MÓDULOS
              </li>

              {sections.map(section => renderCollapsibleSection(section))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
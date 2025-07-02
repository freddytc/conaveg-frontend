import React, { useState } from 'react';
import { authService } from '../../services/authService';
import '../styles/Sidebar.css';

const Sidebar = () => {
  const user = authService.getCurrentUser();
  
  // Estado para controlar qué secciones están expandidas
  const [expandedSections, setExpandedSections] = useState({
    administracion: false,
    recursos: false,
    inventario: false,
    operaciones: false
  });

  // Estado para el item activo
  const [activeItem, setActiveItem] = useState('dashboard');

  const canViewSection = (section) => {
    if (!user) return false;

    const permissions = {
      ADMIN: ['usuarios', 'empleados', 'inventario', 'movimientos', 'asignaciones', 'proyectos', 'asistencias', 'facturas', 'proveedores'],
      GERENTE: ['empleados', 'inventario', 'movimientos', 'asignaciones','proyectos', 'asistencias', 'proveedores', 'facturas'],
      EMPLEADO: ['inventario', 'movimientos', 'proyectos']
    };

    return permissions[user.role]?.includes(section) || false;
  };

  const toggleSection = (sectionName) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
  };

  const handleItemClick = (itemKey, href) => {
    setActiveItem(itemKey);
    // Navegar sin recargar la página
    window.history.pushState({}, '', href);
    // Disparar evento para que React Router maneje la navegación
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  // Definir las secciones y sus elementos
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
        
        {/* Submenu colapsible */}
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
        {/* Header del sidebar */}
        <div className="sidebar-header">
          <div className="sidebar-user-info">
            <div className="sidebar-user-avatar">
              <i className="fas fa-user"></i>
            </div>
            <div>
              <div className="sidebar-user-name">
                {user?.name || 'Usuario'}
              </div>
              <div className="sidebar-user-role">
                {user?.role || 'Usuario'}
              </div>
            </div>
          </div>
        </div>

        <div className="sidebar-content">
          <ul className="sidebar-nav">
            {/* Dashboard - Siempre visible */}
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

            {/* Divisor */}
            <li className="sidebar-modules-divider">
              MÓDULOS
            </li>

            {/* Secciones colapsibles */}
            {sections.map(section => renderCollapsibleSection(section))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
import React, { useState, useEffect } from 'react';
import { authService } from '../../services/authService';
import { userService } from '../../services/userService';
import { employeeService } from '../../services/employeeService';
import { proyectService } from '../../services/proyectService';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    usuarios: 0,
    empleados: 0,
    proyectos: 0,
    proyectosActivos: 0,
    empleadosActivos: 0,
  });
  const [loading, setLoading] = useState(true);

  const canViewSection = (section) => {
    if (!user) return false;
    const userRole = user.role?.nombre || user.role || 'USER';
    const permissions = {
      ADMIN: ['usuarios', 'empleados', 'inventario', 'proyectos', 'asignaciones'],
      ADMINISTRADOR: ['usuarios', 'empleados', 'inventario', 'proyectos', 'asignaciones'],
      GERENTE: ['empleados', 'inventario', 'proyectos', 'asignaciones'],
      EMPLEADO: ['inventario', 'proyectos'],
      USER: ['inventario', 'proyectos']
    };
    return permissions[userRole]?.includes(section) || false;
  };

  const loadRealStats = async () => {
    try {
      setLoading(true);
      const realStats = {
        usuarios: 0,
        empleados: 0,
        proyectos: 0,
        proyectosActivos: 0,
        empleadosActivos: 0,
      };

      // Usuarios
      if (canViewSection('usuarios')) {
        try {
          const usersResponse = await userService.getAllUsers();
          let users = Array.isArray(usersResponse)
            ? usersResponse
            : usersResponse?.data || [];
          realStats.usuarios = users.length;
        } catch {}
      }

      // Empleados
      if (canViewSection('empleados')) {
        try {
          const employeesResponse = await employeeService.getAllEmployees();
          let employees = Array.isArray(employeesResponse)
            ? employeesResponse
            : employeesResponse?.data || [];
          realStats.empleados = employees.length;
          realStats.empleadosActivos = employees.filter(emp => {
            const estado = String(emp?.estado || '').toLowerCase();
            return estado === 'activo' || estado === 'active';
          }).length;
        } catch {}
      }

      // Proyectos
      if (canViewSection('proyectos')) {
        try {
          const projectsResponse = await proyectService.getAllProjects();
          let projects = Array.isArray(projectsResponse)
            ? projectsResponse
            : projectsResponse?.data || [];
          realStats.proyectos = projects.length;
          realStats.proyectosActivos = projects.filter(proj => {
            const estado = String(proj?.estado || '').toLowerCase();
            return estado.includes('progreso') || estado === 'en ejecución' || estado === 'en ejecucion';
          }).length;
        } catch {}
      }

      setStats(realStats);
    } catch {
      // Error general
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
  }, []);

  useEffect(() => {
    if (user) {
      setTimeout(() => {
        loadRealStats();
      }, 100);
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line
  }, [user]);

  const getWelcomeMessage = () => {
    if (!user) return 'Bienvenido';
    const hour = new Date().getHours();
    let greeting = '';
    if (hour < 12) greeting = 'Buenos días';
    else if (hour < 18) greeting = 'Buenas tardes';
    else greeting = 'Buenas noches';
    const userName = user?.firstName || user?.name || user?.userName || 'Usuario';
    return `${greeting}, ${userName}`;
  };

  if (loading) {
    return (
      <div className="page-inner">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="sr-only">Cargando...</span>
          </div>
          <p className="mt-3">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-inner">
      <div className="page-header">
        <h4 className="page-title">Dashboard</h4>
        <ul className="breadcrumbs">
          <li className="nav-home">
            <a href="/dashboard">
              <i className="fas fa-home"></i>
            </a>
          </li>
          <li className="separator">
            <i className="fas fa-chevron-right"></i>
          </li>
          <li className="nav-item">
            <span>Dashboard</span>
          </li>
        </ul>
      </div>

      {/* Mensaje de bienvenida */}
      <div className="row mb-4">
        <div className="col-md-12">
          <div className="card" style={{ background: 'linear-gradient(135deg, #1a73e8 0%, #4285f4 100%)', color: 'white', border: 'none' }}>
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col-md-8">
                  <h4 className="card-title mb-2" style={{ color: 'black' }}>
                    {getWelcomeMessage()}
                  </h4>
                  <p className="mb-1" style={{ color: 'rgba(0, 0, 0, 0.9)' }}>
                    Bienvenido al sistema CONAVEG - Panel de Control
                  </p>
                  <span className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>
                    {String(user?.role?.nombre || user?.role || 'Usuario')} 
                    {(user?.role?.nombre === 'ADMIN' || user?.role === 'ADMIN') && ' 👑'} 
                    {(user?.role?.nombre === 'ADMINISTRADOR' || user?.role === 'ADMINISTRADOR') && ' 👑'} 
                    {(user?.role?.nombre === 'GERENTE' || user?.role === 'GERENTE') && ' ⭐'} 
                    {(user?.role?.nombre === 'EMPLEADO' || user?.role === 'EMPLEADO') && ' 👨‍💼'}
                  </span>
                </div>
                <div className="col-md-4 text-right">
                  <div style={{ fontSize: '3rem', opacity: 0.3 }}>
                    <i className="fas fa-chart-line"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas principales (sin valor inventario) */}
      <div className="row mb-4">
        {canViewSection('usuarios') && (
          <div className="col-sm-6 col-md-4 mb-3">
            <div className="card card-stats card-round">
              <div className="card-body">
                <div className="row align-items-center">
                  <div className="col-icon">
                    <div className="icon-big text-center icon-primary bubble-shadow-small">
                      <i className="fas fa-users"></i>
                    </div>
                  </div>
                  <div className="col col-stats ml-3 ml-sm-0">
                    <div className="numbers">
                      <p className="card-category">Total Usuarios</p>
                      <h4 className="card-title">{stats.usuarios || 0}</h4>
                      <p className="card-text text-primary"><small>Sistema activo</small></p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {canViewSection('empleados') && (
          <div className="col-sm-6 col-md-4 mb-3">
            <div className="card card-stats card-round">
              <div className="card-body">
                <div className="row align-items-center">
                  <div className="col-icon">
                    <div className="icon-big text-center icon-info bubble-shadow-small">
                      <i className="fas fa-user-tie"></i>
                    </div>
                  </div>
                  <div className="col col-stats ml-3 ml-sm-0">
                    <div className="numbers">
                      <p className="card-category">Empleados</p>
                      <h4 className="card-title">{stats.empleados || 0}</h4>
                      <p className="card-text text-info"><small>{stats.empleadosActivos || 0} activos</small></p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {canViewSection('proyectos') && (
          <div className="col-sm-6 col-md-4 mb-3">
            <div className="card card-stats card-round">
              <div className="card-body">
                <div className="row align-items-center">
                  <div className="col-icon">
                    <div className="icon-big text-center icon-warning bubble-shadow-small">
                      <i className="fas fa-project-diagram"></i>
                    </div>
                  </div>
                  <div className="col col-stats ml-3 ml-sm-0">
                    <div className="numbers">
                      <p className="card-category">Proyectos</p>
                      <h4 className="card-title">{stats.proyectos || 0}</h4>
                      <p className="card-text text-warning"><small>{stats.proyectosActivos || 0} activos</small></p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Accesos rápidos */}
      <div className="row">
        <div className="col-md-12">
          <div className="card">
            <div className="card-header">
              <h4 className="card-title">🚀 Accesos Rápidos</h4>
            </div>
            <div className="card-body">
              <div className="row">
                {canViewSection('usuarios') && (
                  <div className="col-md-3 mb-3">
                    <a href="/usuarios" className="btn btn-primary btn-block">
                      <i className="fas fa-users mr-2"></i>Gestionar Usuarios
                    </a>
                  </div>
                )}
                {canViewSection('empleados') && (
                  <div className="col-md-3 mb-3">
                    <a href="/empleados" className="btn btn-info btn-block">
                      <i className="fas fa-user-tie mr-2"></i>Gestionar Empleados
                    </a>
                  </div>
                )}
                {canViewSection('inventario') && (
                  <div className="col-md-3 mb-3">
                    <a href="/inventario" className="btn btn-success btn-block">
                      <i className="fas fa-boxes mr-2"></i>Ver Inventario
                    </a>
                  </div>
                )}
                {canViewSection('proyectos') && (
                  <div className="col-md-3 mb-3">
                    <a href="/proyectos" className="btn btn-warning btn-block">
                      <i className="fas fa-project-diagram mr-2"></i>Ver Proyectos
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
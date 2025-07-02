import React, { useState, useEffect } from 'react';
import { authService } from '../../services/authService';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    usuarios: 0,
    empleados: 0,
    inventario: 0,
    proyectos: 0,
    proyectosActivos: 0,
    empleadosActivos: 0,
    ventasHoy: 0,
    equiposDisponibles: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState([]);
  const [projectProgress, setProjectProgress] = useState([]);

  useEffect(() => {
    // Obtener usuario actual
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);

    // Simular carga de estadísticas
    const loadStats = async () => {
      setLoading(true);
      // Simular delay de carga
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Datos ficticios más realistas basados en el rol
      const mockStats = {
        ADMIN: { 
          usuarios: 47, 
          empleados: 156, 
          inventario: 2450000, 
          proyectos: 23,
          proyectosActivos: 8,
          empleadosActivos: 142,
          ventasHoy: 450000,
          equiposDisponibles: 89
        },
        GERENTE: { 
          usuarios: 0, 
          empleados: 94, 
          inventario: 1850000, 
          proyectos: 15,
          proyectosActivos: 6,
          empleadosActivos: 87,
          ventasHoy: 320000,
          equiposDisponibles: 67
        },
        EMPLEADO: { 
          usuarios: 0, 
          empleados: 0, 
          inventario: 890000, 
          proyectos: 5,
          proyectosActivos: 3,
          empleadosActivos: 0,
          ventasHoy: 0,
          equiposDisponibles: 34
        }
      };

      // Actividades recientes simuladas
      const activities = [
        { id: 1, type: 'success', icon: 'fas fa-user-plus', message: 'Nuevo empleado registrado: Juan Pérez', time: '2 min ago' },
        { id: 2, type: 'info', icon: 'fas fa-box', message: 'Inventario actualizado: +50 unidades', time: '15 min ago' },
        { id: 3, type: 'warning', icon: 'fas fa-exclamation-triangle', message: 'Stock bajo: Equipos de soldadura', time: '1 hour ago' },
        { id: 4, type: 'primary', icon: 'fas fa-project-diagram', message: 'Proyecto "Construcción Norte" iniciado', time: '2 hours ago' },
        { id: 5, type: 'success', icon: 'fas fa-check-circle', message: 'Proyecto "Villa Sur" completado', time: '1 day ago' }
      ];

      // Progreso de proyectos simulado
      const projects = [
        { id: 1, name: 'Construcción Norte', progress: 75, status: 'En progreso', deadline: '2024-02-15' },
        { id: 2, name: 'Villa Sur', progress: 100, status: 'Completado', deadline: '2024-01-30' },
        { id: 3, name: 'Centro Comercial', progress: 45, status: 'En progreso', deadline: '2024-03-20' },
        { id: 4, name: 'Residencial Este', progress: 20, status: 'Iniciado', deadline: '2024-04-10' }
      ];

      setStats(mockStats[currentUser?.role] || mockStats.EMPLEADO);
      setRecentActivities(activities);
      setProjectProgress(projects.filter((_, index) => index < (currentUser?.role === 'ADMIN' ? 4 : 2)));
      setLoading(false);
    };

    loadStats();
  }, []);

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    let greeting = '';
    
    if (hour < 12) greeting = 'Buenos días';
    else if (hour < 18) greeting = 'Buenas tardes';
    else greeting = 'Buenas noches';

    return `${greeting}, ${user?.firstName || user?.userName || 'Usuario'}`;
  };

  const canViewSection = (section) => {
    if (!user) return false;
    
    const permissions = {
      ADMIN: ['usuarios', 'empleados', 'inventario', 'proyectos', 'ventas'],
      GERENTE: ['empleados', 'inventario', 'proyectos', 'ventas'],
      EMPLEADO: ['inventario', 'proyectos']
    };

    return permissions[user.role]?.includes(section) || false;
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'success';
    if (progress >= 50) return 'warning';
    return 'danger';
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
                  <h4 className="card-title mb-2" style={{ color: 'white' }}>{getWelcomeMessage()}</h4>
                  <p className="mb-1" style={{ color: 'rgba(255,255,255,0.9)' }}>
                    Bienvenido al sistema CONAVEG - Panel de Control
                  </p>
                  <span className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>
                    {user?.role} {user?.role === 'ADMIN' && '👑'} {user?.role === 'GERENTE' && '⭐'} {user?.role === 'EMPLEADO' && '👨‍💼'}
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
      
      {/* Estadísticas principales */}
      <div className="row mb-4">
        {canViewSection('usuarios') && (
          <div className="col-sm-6 col-md-3 mb-3">
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
                      <h4 className="card-title">{stats.usuarios}</h4>
                      <p className="card-text text-success"><small>+3 este mes</small></p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {canViewSection('empleados') && (
          <div className="col-sm-6 col-md-3 mb-3">
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
                      <h4 className="card-title">{stats.empleados}</h4>
                      <p className="card-text text-info"><small>{stats.empleadosActivos} activos</small></p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {canViewSection('inventario') && (
          <div className="col-sm-6 col-md-3 mb-3">
            <div className="card card-stats card-round">
              <div className="card-body">
                <div className="row align-items-center">
                  <div className="col-icon">
                    <div className="icon-big text-center icon-success bubble-shadow-small">
                      <i className="fas fa-boxes"></i>
                    </div>
                  </div>
                  <div className="col col-stats ml-3 ml-sm-0">
                    <div className="numbers">
                      <p className="card-category">Valor Inventario</p>
                      <h4 className="card-title">${(stats.inventario / 1000000).toFixed(1)}M</h4>
                      <p className="card-text text-success"><small>{stats.equiposDisponibles} equipos</small></p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {canViewSection('proyectos') && (
          <div className="col-sm-6 col-md-3 mb-3">
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
                      <h4 className="card-title">{stats.proyectos}</h4>
                      <p className="card-text text-warning"><small>{stats.proyectosActivos} activos</small></p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Ventas del día (solo para ADMIN y GERENTE) */}
      {canViewSection('ventas') && (
        <div className="row mb-4">
          <div className="col-md-6">
            <div className="card">
              <div className="card-header">
                <h4 className="card-title">💰 Resumen Financiero Hoy</h4>
              </div>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <h3 className="text-success">${stats.ventasHoy.toLocaleString()}</h3>
                    <p className="text-muted mb-0">Ventas del día</p>
                  </div>
                  <div className="text-right">
                    <span className="badge badge-success">+12%</span>
                    <p className="text-muted mb-0 small">vs ayer</p>
                  </div>
                </div>
                <div className="progress mb-2" style={{ height: '8px' }}>
                  <div className="progress-bar bg-success" style={{ width: '75%' }}></div>
                </div>
                <small className="text-muted">Meta mensual: 75% completado</small>
              </div>
            </div>
          </div>
          
          <div className="col-md-6">
            <div className="card">
              <div className="card-header">
                <h4 className="card-title">📊 Métricas Rápidas</h4>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-6 text-center border-right">
                    <h4 className="text-primary">{stats.equiposDisponibles}</h4>
                    <small className="text-muted">Equipos Disponibles</small>
                  </div>
                  <div className="col-6 text-center">
                    <h4 className="text-info">{stats.proyectosActivos}</h4>
                    <small className="text-muted">Proyectos Activos</small>
                  </div>
                </div>
                <hr />
                <div className="text-center">
                  <h5 className="text-warning">{Math.round((stats.proyectosActivos / stats.proyectos) * 100)}%</h5>
                  <small className="text-muted">Tasa de proyectos activos</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Progreso de proyectos y actividades recientes */}
      <div className="row mb-4">
        {canViewSection('proyectos') && (
          <div className="col-md-6">
            <div className="card">
              <div className="card-header">
                <h4 className="card-title">🚧 Progreso de Proyectos</h4>
              </div>
              <div className="card-body">
                {projectProgress.map(project => (
                  <div key={project.id} className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <small className="font-weight-bold">{project.name}</small>
                      <small className={`badge badge-${getProgressColor(project.progress)}`}>
                        {project.status}
                      </small>
                    </div>
                    <div className="progress mb-1" style={{ height: '6px' }}>
                      <div 
                        className={`progress-bar bg-${getProgressColor(project.progress)}`} 
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                    <div className="d-flex justify-content-between">
                      <small className="text-muted">{project.progress}% completado</small>
                      <small className="text-muted">📅 {project.deadline}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h4 className="card-title">🔔 Actividad Reciente</h4>
            </div>
            <div className="card-body">
              <div className="timeline">
                {recentActivities.slice(0, 5).map(activity => (
                  <div key={activity.id} className="timeline-item mb-3">
                    <div className="d-flex align-items-start">
                      <div className={`timeline-icon text-${activity.type} mr-3`}>
                        <i className={activity.icon}></i>
                      </div>
                      <div className="timeline-content">
                        <p className="mb-1 small">{activity.message}</p>
                        <small className="text-muted">{activity.time}</small>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
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
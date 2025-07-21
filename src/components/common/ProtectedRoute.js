import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import Login from '../auth/Login';

const ProtectedRoute = ({ children, requiredRoles = [] }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="sr-only">Cargando...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => window.location.reload()} />;
  }

  // Función para obtener el rol del usuario (igual que en Sidebar)
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

  if (requiredRoles.length > 0 && user) {
    const userRole = getUserRole();
    
    const hasRequiredRole = requiredRoles.includes(userRole);
    
    console.log('🔒 ProtectedRoute - Tiene acceso:', hasRequiredRole);
    
    if (!hasRequiredRole) {
      return (
        <div className="container mt-5">
          <div className="alert alert-warning text-center">
            <i className="fas fa-exclamation-triangle fa-2x mb-3"></i>
            <h4>Acceso Denegado</h4>
            <p>No tienes permisos para acceder a esta sección.</p>
            <small className="text-muted">
              Tu rol: <strong>{userRole}</strong> | Roles requeridos: <strong>{requiredRoles.join(', ')}</strong>
            </small>
          </div>
        </div>
      );
    }
  }

  return children;
};

export default ProtectedRoute;
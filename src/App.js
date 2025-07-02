import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/auth/Login';
import Layout from './components/common/Layout';
import Dashboard from './components/dashboard/Dashboard';
import UserList from './components/users/UserList';
import EmployeeList from './components/employees/EmployeeList';
import ProjectList from './components/projects/ProjectList';
import InventoryList from './components/inventory/InventoryList';
import ProveedorList from './components/suppliers/SupplierList';
import InvoiceList from './components/invoices/InvoiceList';
import AttendanceList from './components/attendance/AttendanceList';
import MovementList from './components/movements/MovementList';
import AssignmentList from './components/assignments/AssignmentList';
import { authService } from './services/authService';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar si el usuario está autenticado al cargar la app
    const checkAuth = () => {
      const authenticated = authService.isAuthenticated();
      setIsAuthenticated(authenticated);
      setLoading(false);
    };

    checkAuth();
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border" role="status">
          <span className="sr-only">Cargando...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/usuarios" element={<UserList />} />
          <Route path="/empleados" element={<EmployeeList />} />
          <Route path="/proyectos" element={<ProjectList />} />
          <Route path="/inventario" element={<InventoryList />} />
          <Route path="/proveedores" element={<ProveedorList />} />
          <Route path="/facturas" element={<InvoiceList />} />
          <Route path="/asistencias" element={<AttendanceList />} />
          <Route path="/movimientos" element={<MovementList />} />
          <Route path="/asignaciones" element={<AssignmentList />} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import ProtectedRoute from './components/common/ProtectedRoute';
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
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <ProtectedRoute>
          <Layout>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route path="/dashboard" element={<Dashboard />} />
              
              {/* Rutas con roles específicos si es necesario */}
              <Route 
                path="/usuarios" 
                element={
                  <ProtectedRoute requiredRoles={['ADMIN']}>
                    <UserList />
                  </ProtectedRoute>
                } 
              />
              
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
        </ProtectedRoute>
      </Router>
    </AuthProvider>
  );
}

export default App;
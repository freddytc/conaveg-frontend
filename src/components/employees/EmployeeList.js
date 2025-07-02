import React, { useState, useEffect } from 'react';
import { employeeService } from '../../services/employeeService';
import EmployeeForm from './EmployeeForm';
import Modal from '../common/Modal';
import SuccessModal from '../common/SuccessModal';
import { useNotification } from '../../hooks/useNotification';

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [employeesPerPage] = useState(10);

  // Hook para notificaciones
  const { notification, closeNotification, showError, showConfirm } = useNotification();

  // Estado para modal de éxito
  const [successModal, setSuccessModal] = useState({
    isVisible: false,
    message: '',
    title: '¡Éxito!'
  });

  useEffect(() => {
    loadEmployees();
  }, []);

  const showSuccessModal = (message, title = '¡Éxito!') => {
    setSuccessModal({
      isVisible: true,
      message,
      title
    });
  };

  const hideSuccessModal = () => {
    setSuccessModal(prev => ({ ...prev, isVisible: false }));
  };

  const loadEmployees = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await employeeService.getAllEmployees();
      console.log('Empleados cargados:', response);
      const employeeArray = Array.isArray(response) ? response : [];
      setEmployees(employeeArray);
      setFilteredEmployees(employeeArray);
    } catch (error) {
      console.error('Error cargando empleados:', error);
      setError(error.message);
      setEmployees([]);
      setFilteredEmployees([]);
      showError(
        'Error al cargar empleados',
        'No se pudieron cargar los empleados. Por favor, intente nuevamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    applyFilters(term);
  };

  const applyFilters = (search) => {
    setCurrentPage(1);
    
    let filtered = employees;

    if (search && search.trim() !== '') {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(employee => {
        if (!employee) return false;
        
        const matchesNombres = employee.nombres && 
          employee.nombres.toLowerCase().includes(searchLower);
        
        const matchesApellidos = employee.apellidos && 
          employee.apellidos.toLowerCase().includes(searchLower);
        
        const matchesDocumento = employee.nroDocumento && 
          employee.nroDocumento.toLowerCase().includes(searchLower);
        
        const matchesPuesto = employee.puesto && 
          employee.puesto.toLowerCase().includes(searchLower);
        
        const matchesTelefono = employee.telefono && 
          employee.telefono.toLowerCase().includes(searchLower);
        
        const matchesId = employee.id && 
          employee.id.toString().includes(searchLower);
        
        return matchesNombres || matchesApellidos || matchesDocumento || 
               matchesPuesto || matchesTelefono || matchesId;
      });
    }
    
    setFilteredEmployees(filtered);
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setShowForm(true);
  };

  const handleDelete = (employeeId, employeeName) => {
    showConfirm(
      'Confirmar eliminación',
      `¿Está seguro de que desea eliminar el empleado "${employeeName}"? Esta acción no se puede deshacer.`,
      async () => {
        try {
          await employeeService.deleteEmployee(employeeId);
          loadEmployees();
          showSuccessModal('Empleado eliminado exitosamente', '¡Eliminado!');
        } catch (error) {
          showError(
            'Error al eliminar empleado',
            'No se pudo eliminar el empleado. Por favor, intente nuevamente.'
          );
        }
      }
    );
  };

  const handleFormSubmit = async (employeeData) => {
    try {
      if (editingEmployee) {
        await employeeService.updateEmployee(editingEmployee.id, employeeData);
        
        setShowForm(false);
        setEditingEmployee(null);
        await loadEmployees();
        
        showSuccessModal('El empleado se ha actualizado exitosamente', '¡Actualizado!');
        
      } else {
        await employeeService.createEmployee(employeeData);
        
        setShowForm(false);
        setEditingEmployee(null);
        await loadEmployees();
        
        showSuccessModal('El empleado se ha creado exitosamente', '¡Creado!');
      }
    } catch (error) {
      console.error('Error en handleFormSubmit:', error);
      throw error; // Re-lanzar para que lo capture el formulario
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingEmployee(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('es-ES');
    } catch (error) {
      return '-';
    }
  };

  const getPuestoBadgeColor = (puesto) => {
    switch (puesto?.toUpperCase()) {
      case 'GERENTE':
        return 'badge-danger';
      case 'SUPERVISOR':
        return 'badge-warning';
      case 'ANALISTA':
        return 'badge-info';
      case 'DESARROLLADOR':
        return 'badge-primary';
      case 'DISEÑADOR':
        return 'badge-purple';
      case 'VENDEDOR':
        return 'badge-success';
      case 'ASISTENTE':
        return 'badge-secondary';
      case 'COORDINADOR':
        return 'badge-info';
      case 'ESPECIALISTA':
        return 'badge-primary';
      case 'TÉCNICO':
        return 'badge-dark';
      case 'CONTADOR':
        return 'badge-warning';
      case 'ADMINISTRATIVO':
        return 'badge-secondary';
      default:
        return '';
    }
  };

  // Paginación
  const indexOfLastEmployee = currentPage * employeesPerPage;
  const indexOfFirstEmployee = indexOfLastEmployee - employeesPerPage;
  const currentEmployees = filteredEmployees.slice(indexOfFirstEmployee, indexOfLastEmployee);
  const totalPages = Math.ceil(filteredEmployees.length / employeesPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (showForm) {
    return (
      <EmployeeForm
        employee={editingEmployee}
        onSubmit={handleFormSubmit}
        onCancel={handleFormCancel}
      />
    );
  }

  return (
    <>
      <div className="page-inner">
        <div className="page-header">
          <h4 className="page-title">Gestión de Empleados</h4>
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
              <span>Empleados</span>
            </li>
          </ul>
        </div>

        <div className="row">
          <div className="col-md-12">
            <div className="card">
              <div className="card-header">
                <div className="d-flex align-items-center">
                  <h4 className="card-title">Lista de Empleados</h4>
                  <button
                    className="btn btn-primary btn-round ml-auto"
                    onClick={() => setShowForm(true)}
                  >
                    <i className="fas fa-plus mr-2"></i>
                    Agregar Empleado
                  </button>
                </div>
              </div>
              
              <div className="card-body">
                {/* Filtros */}
                <div className="row mb-3">
                  <div className="col-md-8">
                    <div className="form-group">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Buscar por nombres, apellidos, documento, puesto o teléfono..."
                        value={searchTerm}
                        onChange={handleSearch}
                      />
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="alert alert-danger">
                    <strong>Error:</strong> {error}
                  </div>
                )}

                {loading ? (
                  <div className="text-center py-4">
                    <div className="spinner-border" role="status">
                      <span className="sr-only">Cargando...</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="table-responsive">
                      <table className="table table-striped">
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Nombres</th>
                            <th>Apellidos</th>
                            <th>Documento</th>
                            <th>Puesto</th>
                            <th>Teléfono</th>
                            <th>Fecha Ingreso</th>
                            <th>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentEmployees.length === 0 ? (
                            <tr>
                              <td colSpan="8" className="text-center py-4">
                                <div className="empty-state">
                                  <i className="fas fa-users fa-3x text-muted mb-3"></i>
                                  <h5 className="text-muted">No se encontraron empleados</h5>
                                  <p className="text-muted">
                                    {searchTerm ? 'Intente con otros términos de búsqueda' : 'Comience agregando un nuevo empleado'}
                                  </p>
                                </div>
                              </td>
                            </tr>
                          ) : (
                            currentEmployees.map((employee) => {
                              const fullName = `${employee.nombres || ''} ${employee.apellidos || ''}`.trim();
                              
                              return (
                                <tr key={employee.id || Math.random()}>
                                  <td>{employee.id || '-'}</td>
                                  <td>{employee.nombres || '-'}</td>
                                  <td>{employee.apellidos || '-'}</td>
                                  <td>
                                    <span>
                                      {employee.nroDocumento || '-'}
                                    </span>
                                  </td>
                                  <td>
                                    <span className={`badge ${getPuestoBadgeColor(employee.puesto)}`}>
                                      {employee.puesto || '-'}
                                    </span>
                                  </td>
                                  <td>{employee.telefono || '-'}</td>
                                  <td>{formatDate(employee.fechaIngreso)}</td>
                                  <td>
                                    <div className="form-button-action">
                                      <button
                                        type="button"
                                        className="btn btn-link btn-primary btn-lg"
                                        onClick={() => handleEdit(employee)}
                                        title="Editar Empleado"
                                      >
                                        <i className="fas fa-edit"></i>
                                      </button>
                                      
                                      <button
                                        type="button"
                                        className="btn btn-link btn-danger btn-lg"
                                        onClick={() => handleDelete(employee.id, fullName)}
                                        title="Eliminar Empleado"
                                      >
                                        <i className="fas fa-times"></i>
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Paginación */}
                    {totalPages > 1 && (
                      <div className="d-flex justify-content-center mt-4">
                        <nav>
                          <ul className="pagination">
                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                              <button
                                className="page-link"
                                onClick={() => paginate(currentPage - 1)}
                                disabled={currentPage === 1}
                              >
                                Anterior
                              </button>
                            </li>
                            
                            {[...Array(totalPages)].map((_, index) => (
                              <li key={index + 1} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                                <button
                                  className="page-link"
                                  onClick={() => paginate(index + 1)}
                                >
                                  {index + 1}
                                </button>
                              </li>
                            ))}
                            
                            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                              <button
                                className="page-link"
                                onClick={() => paginate(currentPage + 1)}
                                disabled={currentPage === totalPages}
                              >
                                Siguiente
                              </button>
                            </li>
                          </ul>
                        </nav>
                      </div>
                    )}

                    {/* Información de registros */}
                    <div className="text-center mt-3">
                      <small className="text-muted">
                        Mostrando {indexOfFirstEmployee + 1} a {Math.min(indexOfLastEmployee, filteredEmployees.length)} de {filteredEmployees.length} empleados
                        {searchTerm && filteredEmployees.length !== employees.length && (
                          <> (filtrados de {employees.length} total)</>
                        )}
                      </small>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmaciones y errores */}
      <Modal
        isOpen={notification.isOpen}
        onClose={closeNotification}
        onConfirm={notification.onConfirm}
        title={notification.title}
        message={notification.message}
        type={notification.type}
        confirmText={notification.confirmText}
        cancelText={notification.cancelText}
        showCancel={notification.showCancel}
      />

      {/* Modal de éxito */}
      <SuccessModal
        isVisible={successModal.isVisible}
        message={successModal.message}
        title={successModal.title}
        onClose={hideSuccessModal}
        duration={750}
      />
    </>
  );
};

export default EmployeeList;
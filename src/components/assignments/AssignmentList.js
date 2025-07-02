import React, { useState, useEffect } from 'react';
import { assignmentService } from '../../services/assignmentService';
import { employeeService } from '../../services/employeeService';
import { proyectService } from '../../services/proyectService';
import AssignmentForm from './AssignmentForm';
import Modal from '../common/Modal';
import SuccessModal from '../common/SuccessModal';
import { useNotification } from '../../hooks/useNotification';

const AssignmentList = () => {
  const [assignments, setAssignments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Estados para el formulario
  const [showForm, setShowForm] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);

  // Hook para notificaciones
  const { notification, closeNotification, showError, showConfirm } = useNotification();

  // Estado para modal de éxito
  const [successModal, setSuccessModal] = useState({
    isVisible: false,
    title: '',
    message: ''
  });

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Funciones auxiliares (definidas antes de usarlas)
  const getEmployeeName = (empleadoId) => {
    if (!empleadoId) return 'Sin empleado';
    const employee = employees.find(emp => emp && emp.id === empleadoId);
    return employee ? `${employee.nombres || ''} ${employee.apellidos || ''}`.trim() : 'Empleado no encontrado';
  };

  const getProjectName = (proyectoId) => {
    if (!proyectoId) return 'Sin proyecto';
    const project = projects.find(proj => proj && proj.id === proyectoId);
    return project ? project.nombre || 'Sin nombre' : 'Proyecto no encontrado';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      // Para fechas en formato "YYYY-MM-DD", usar split para evitar problemas de zona horaria
      if (dateString.includes('-') && dateString.length === 10) {
        const [year, month, day] = dateString.split('-');
        // Crear fecha en zona horaria local
        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

        return date.toLocaleDateString('es-ES', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        });
      }

      // Para otros formatos, usar el método anterior
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '-';

      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch (error) {
      return '-';
    }
  };

  // Funciones de búsqueda y filtrado (después de definir las funciones auxiliares)
  const filteredAssignments = assignments.filter(assignment => {
    if (!searchTerm) return true;

    const employeeName = getEmployeeName(assignment.empleadoId).toLowerCase();
    const projectName = getProjectName(assignment.proyectoId).toLowerCase();
    const search = searchTerm.toLowerCase();

    return employeeName.includes(search) || projectName.includes(search);
  });

  // Paginación
  const indexOfLastAssignment = currentPage * itemsPerPage;
  const indexOfFirstAssignment = indexOfLastAssignment - itemsPerPage;
  const currentAssignments = filteredAssignments.slice(indexOfFirstAssignment, indexOfLastAssignment);
  const totalPages = Math.ceil(filteredAssignments.length / itemsPerPage);

  useEffect(() => {
    loadInitialData();
  }, []);

  const showSuccessModal = (title, message) => {
    setSuccessModal({
      isVisible: true,
      title,
      message
    });
  };

  const hideSuccessModal = () => {
    setSuccessModal({
      isVisible: false,
      title: '',
      message: ''
    });
  };

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError('');

      // Cargar asignaciones
      let assignmentArray = [];
      try {
        const assignmentsResponse = await assignmentService.getAllAssignments();
        assignmentArray = Array.isArray(assignmentsResponse) ? assignmentsResponse :
          (assignmentsResponse?.data ? assignmentsResponse.data : []);
      } catch (assignError) {
        console.error('Error cargando asignaciones:', assignError);
        setError(`Error cargando asignaciones: ${assignError.message}`);
        assignmentArray = [];
        showError(
          'Error al cargar asignaciones',
          'No se pudieron cargar las asignaciones. Por favor, intente nuevamente.'
        );
      }

      // Cargar empleados y proyectos en paralelo
      let employeeArray = [];
      let projectArray = [];

      try {
        const [employeesResponse, projectsResponse] = await Promise.all([
          employeeService.getAllEmployees().catch(() => []),
          proyectService.getAllProjects().catch(() => [])
        ]);

        employeeArray = Array.isArray(employeesResponse) ? employeesResponse :
          (employeesResponse?.data ? employeesResponse.data : []);
        projectArray = Array.isArray(projectsResponse) ? projectsResponse :
          (projectsResponse?.data ? projectsResponse.data : []);

      } catch (dataError) {
        console.error('Error cargando datos relacionados:', dataError);
      }

      // Establecer estados
      setAssignments(assignmentArray);
      setEmployees(employeeArray);
      setProjects(projectArray);

    } catch (error) {
      console.error('Error general cargando datos:', error);
      setError(`Error general: ${error.message}`);
      setAssignments([]);
      showError(
        'Error general',
        'No se pudieron cargar los datos. Por favor, intente nuevamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Handlers
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleCreate = () => {
    setEditingAssignment(null);
    setShowForm(true);
  };

  const handleEdit = (assignment) => {
    setEditingAssignment(assignment);
    setShowForm(true);
  };

  const handleDelete = (id, employeeName, projectName) => {
    showConfirm(
      'Confirmar Eliminación',
      `¿Está seguro de que desea eliminar la asignación de "${employeeName}" al proyecto "${projectName}"? Esta acción no se puede deshacer.`,
      async () => {
        try {
          await assignmentService.deleteAssignment(id);
          loadInitialData();
          showSuccessModal(
            'Asignación Eliminada',
            'La asignación ha sido eliminada exitosamente.'
          );
        } catch (error) {
          console.error('Error al eliminar asignación:', error);
          showError(
            'Error al eliminar asignación',
            'No se pudo eliminar la asignación. Por favor, intente nuevamente.'
          );
        }
      }
    );
  };

  const handleSubmit = async (assignmentData) => {
    try {
      if (editingAssignment) {
        await assignmentService.updateAssignment(editingAssignment.id, assignmentData);

        setShowForm(false);
        setEditingAssignment(null);
        await loadInitialData();

        showSuccessModal(
          'Asignación Actualizada',
          'La asignación ha sido actualizada exitosamente.'
        );
      } else {
        await assignmentService.createAssignment(assignmentData);

        setShowForm(false);
        setEditingAssignment(null);
        await loadInitialData();

        showSuccessModal(
          'Asignación Creada',
          'La nueva asignación ha sido creada exitosamente.'
        );
      }
    } catch (error) {
      console.error('Error al procesar asignación:', error);
      throw error; // Re-lanzar para que lo capture el formulario
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingAssignment(null);
  };

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  if (showForm) {
    return (
      <AssignmentForm
        assignment={editingAssignment}
        employees={employees}
        projects={projects}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <>
      <div className="page-inner">
        <div className="page-header">
          <h4 className="page-title">Asignaciones de Proyectos</h4>
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
              <span>Asignaciones</span>
            </li>
          </ul>
        </div>

        <div className="row">
          <div className="col-md-12">
            <div className="card">
              <div className="card-header">
                <div className="d-flex align-items-center">
                  <h4 className="card-title">Lista de Asignaciones</h4>
                  <div className="ml-auto">
                    <button
                      className="btn btn-primary btn-round"
                      onClick={handleCreate}
                      disabled={loading}
                    >
                      <i className="fas fa-plus"></i> Nueva Asignación
                    </button>
                  </div>
                </div>
              </div>

              <div className="card-body">
                {/* Búsqueda */}
                <div className="row mb-3">
                  <div className="col-md-8">
                    <div className="form-group">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Buscar por empleado o proyecto..."
                        value={searchTerm}
                        onChange={handleSearch}
                        disabled={loading}
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
                    <p className="mt-2">Cargando asignaciones...</p>
                  </div>
                ) : (
                  <>
                    <div className="table-responsive">
                      <table className="table table-striped">
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Empleado</th>
                            <th>Proyecto</th>
                            <th>Fecha Asignación</th>
                            <th>Fecha Fin</th>
                            <th>Rol</th>
                            <th>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentAssignments.length === 0 ? (
                            <tr>
                              <td colSpan="7" className="text-center py-4">
                                <div className="empty-state">
                                  <i className="fas fa-users-cog fa-3x text-muted mb-3"></i>
                                  <h5 className="text-muted">No se encontraron asignaciones</h5>
                                  <p className="text-muted">
                                    {searchTerm ? 'Intente con otros términos de búsqueda' : 'Comience creando una nueva asignación'}
                                  </p>
                                  {!searchTerm && (
                                    <button
                                      className="btn btn-primary"
                                      onClick={handleCreate}
                                    >
                                      <i className="fas fa-plus mr-2"></i>
                                      Crear Primera Asignación
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ) : (
                            currentAssignments
                              .filter(assignment => assignment && typeof assignment === 'object')
                              .map((assignment, index) => (
                                <tr key={assignment.id || `assignment-${index}`}>
                                  <td><strong>{assignment.id || '-'}</strong></td>
                                  <td>{getEmployeeName(assignment.empleadoId)}</td>
                                  <td>{getProjectName(assignment.proyectoId)}</td>
                                  <td>{formatDate(assignment.fechaAsignacion)}</td>
                                  <td>{formatDate(assignment.fechaFinAsignacion)}</td>
                                  <td>{assignment.rol || '-'}</td>
                                  <td>
                                    <div className="form-button-action">
                                      <button
                                        type="button"
                                        data-toggle="tooltip"
                                        title="Editar"
                                        className="btn btn-link btn-primary btn-lg"
                                        onClick={() => handleEdit(assignment)}
                                      >
                                        <i className="fa fa-edit"></i>
                                      </button>
                                      <button
                                        type="button"
                                        data-toggle="tooltip"
                                        title="Eliminar"
                                        className="btn btn-link btn-danger"
                                        onClick={() => handleDelete(
                                          assignment.id,
                                          getEmployeeName(assignment.empleadoId),
                                          getProjectName(assignment.proyectoId)
                                        )}
                                      >
                                        <i className="fa fa-times"></i>
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))
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
                        Mostrando {indexOfFirstAssignment + 1} a {Math.min(indexOfLastAssignment, filteredAssignments.length)} de {filteredAssignments.length} asignaciones
                        {searchTerm && filteredAssignments.length !== assignments.length && (
                          <> (filtradas de {assignments.length} total)</>
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

export default AssignmentList;
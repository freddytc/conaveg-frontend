import React, { useState, useEffect } from 'react';
import { proyectService } from '../../services/proyectService';
import ProjectForm from './ProjectForm';
import Modal from '../common/Modal';
import SuccessModal from '../common/SuccessModal';
import { useNotification } from '../../hooks/useNotification';

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [projectsPerPage] = useState(10);

  // Hook para notificaciones
  const { notification, closeNotification, showError, showConfirm } = useNotification();

  // Estado para modal de éxito
  const [successModal, setSuccessModal] = useState({
    isVisible: false,
    message: '',
    title: '¡Éxito!'
  });

  useEffect(() => {
    loadProjects();
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

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await proyectService.getAllProjects();
      console.log('Proyectos cargados:', response);
      const projectArray = Array.isArray(response) ? response : [];
      setProjects(projectArray);
      setFilteredProjects(projectArray);
    } catch (error) {
      console.error('Error cargando proyectos:', error);
      setError(error.message);
      setProjects([]);
      setFilteredProjects([]);
      showError(
        'Error al cargar proyectos',
        'No se pudieron cargar los proyectos. Por favor, intente nuevamente.'
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
    
    let filtered = projects;

    // Filtro por búsqueda
    if (search && search.trim() !== '') {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(project => {
        if (!project) return false;
        
        const matchesNombre = project.nombre && 
          project.nombre.toLowerCase().includes(searchLower);
        
        const matchesDescripcion = project.descripcion && 
          project.descripcion.toLowerCase().includes(searchLower);
        
        const matchesUbicacion = project.ubicacion && 
          project.ubicacion.toLowerCase().includes(searchLower);
        
        const matchesEstado = project.estadoProyecto && 
          project.estadoProyecto.toLowerCase().includes(searchLower);
        
        const matchesId = project.id && 
          project.id.toString().includes(searchLower);
        
        return matchesNombre || matchesDescripcion || matchesUbicacion || matchesEstado || matchesId;
      });
    }
    
    setFilteredProjects(filtered);
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setShowForm(true);
  };

  const handleDelete = (projectId, projectName) => {
    showConfirm(
      'Confirmar eliminación',
      `¿Está seguro de que desea eliminar el proyecto "${projectName}"? Esta acción no se puede deshacer.`,
      async () => {
        try {
          await proyectService.deleteProject(projectId);
          loadProjects();
          showSuccessModal('Proyecto eliminado exitosamente', '¡Eliminado!');
        } catch (error) {
          showError(
            'Error al eliminar proyecto',
            'No se pudo eliminar el proyecto. Por favor, intente nuevamente.'
          );
        }
      }
    );
  };

  const handleFormSubmit = async (projectData) => {
    try {
      if (editingProject) {
        await proyectService.updateProject(editingProject.id, projectData);
        
        setShowForm(false);
        setEditingProject(null);
        await loadProjects();
        
        showSuccessModal('El proyecto se ha actualizado exitosamente', '¡Actualizado!');
        
      } else {
        await proyectService.createProject(projectData);
        
        setShowForm(false);
        setEditingProject(null);
        await loadProjects();
        
        showSuccessModal('El proyecto se ha creado exitosamente', '¡Creado!');
      }
    } catch (error) {
      console.error('Error en handleFormSubmit:', error);
      throw error; // Re-lanzar para que lo capture el formulario
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingProject(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('es-ES');
    } catch (error) {
      return '-';
    }
  };

  const getStatusBadgeColor = (estado) => {
    if (!estado) return 'badge-light';
    
    const estadoUpper = estado.toUpperCase();
    
    // Planificado, Iniciado, Nuevo
    if (estadoUpper.includes('PLANIFICADO') || estadoUpper.includes('INICIADO') || estadoUpper.includes('NUEVO')) {
      return 'badge-info';
    }
    
    // En progreso, Desarrollo, Trabajando
    if (estadoUpper.includes('PROGRESO') || estadoUpper.includes('DESARROLLO') || estadoUpper.includes('TRABAJANDO') || estadoUpper.includes('ACTIVO')) {
      return 'badge-warning';
    }
    
    // Completado, Terminado, Finalizado
    if (estadoUpper.includes('COMPLETADO') || estadoUpper.includes('TERMINADO') || estadoUpper.includes('FINALIZADO') || estadoUpper.includes('EXITOSO')) {
      return 'badge-success';
    }
    
    // Cancelado, Rechazado, Fallido
    if (estadoUpper.includes('CANCELADO') || estadoUpper.includes('RECHAZADO') || estadoUpper.includes('FALLIDO')) {
      return 'badge-danger';
    }
    
    // Pausado, Suspendido, En espera
    if (estadoUpper.includes('PAUSADO') || estadoUpper.includes('SUSPENDIDO') || estadoUpper.includes('ESPERA')) {
      return 'badge-secondary';
    }
    
    // Por defecto
    return '';
  };

  // Paginación
  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjects = filteredProjects.slice(indexOfFirstProject, indexOfLastProject);
  const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (showForm) {
    return (
      <ProjectForm
        project={editingProject}
        onSubmit={handleFormSubmit}
        onCancel={handleFormCancel}
      />
    );
  }

  return (
    <>
      <div className="page-inner">
        <div className="page-header">
          <h4 className="page-title">Gestión de Proyectos</h4>
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
              <span>Proyectos</span>
            </li>
          </ul>
        </div>

        <div className="row">
          <div className="col-md-12">
            <div className="card">
              <div className="card-header">
                <div className="d-flex align-items-center">
                  <h4 className="card-title">Lista de Proyectos</h4>
                  <button
                    className="btn btn-primary btn-round ml-auto"
                    onClick={() => setShowForm(true)}
                  >
                    <i className="fas fa-plus mr-2"></i>
                    Agregar Proyecto
                  </button>
                </div>
              </div>
              
              <div className="card-body">
                {/* Barra de búsqueda */}
                <div className="row mb-3">
                  <div className="col-md-8">
                    <div className="form-group">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Buscar por nombre, descripción, ubicación o estado..."
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
                            <th>Nombre</th>
                            <th>Descripción</th>
                            <th>Ubicación</th>
                            <th>Fecha Inicio</th>
                            <th>Fecha Fin</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentProjects.length === 0 ? (
                            <tr>
                              <td colSpan="8" className="text-center py-4">
                                <div className="empty-state">
                                  <i className="fas fa-project-diagram fa-3x text-muted mb-3"></i>
                                  <h5 className="text-muted">No se encontraron proyectos</h5>
                                  <p className="text-muted">
                                    {searchTerm ? 'Intente con otros términos de búsqueda' : 'Comience agregando un nuevo proyecto'}
                                  </p>
                                </div>
                              </td>
                            </tr>
                          ) : (
                            currentProjects.map((project) => (
                              <tr key={project.id || Math.random()}>
                                <td>{project.id || '-'}</td>
                                <td>
                                  <strong>{project.nombre || '-'}</strong>
                                </td>
                                <td>
                                  <div style={{ 
                                    maxWidth: '200px', 
                                    overflow: 'hidden', 
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                  }}>
                                    {project.descripcion || '-'}
                                  </div>
                                </td>
                                <td>{project.ubicacion || '-'}</td>
                                <td>{formatDate(project.fechaInicio)}</td>
                                <td>{formatDate(project.fechaFin)}</td>
                                <td>
                                  <span className={`badge ${getStatusBadgeColor(project.estadoProyecto)}`}>
                                    {project.estadoProyecto || 'SIN ESTADO'}
                                  </span>
                                </td>
                                <td>
                                  <div className="form-button-action">
                                    <button
                                      type="button"
                                      className="btn btn-link btn-primary btn-lg"
                                      onClick={() => handleEdit(project)}
                                      title="Editar Proyecto"
                                    >
                                      <i className="fas fa-edit"></i>
                                    </button>
                                    
                                    <button
                                      type="button"
                                      className="btn btn-link btn-danger btn-lg"
                                      onClick={() => handleDelete(project.id, project.nombre)}
                                      title="Eliminar Proyecto"
                                    >
                                      <i className="fas fa-times"></i>
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
                        Mostrando {indexOfFirstProject + 1} a {Math.min(indexOfLastProject, filteredProjects.length)} de {filteredProjects.length} proyectos
                        {searchTerm && filteredProjects.length !== projects.length && (
                          <> (filtrados de {projects.length} total)</>
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
        duration={750 }
      />
    </>
  );
};

export default ProjectList;
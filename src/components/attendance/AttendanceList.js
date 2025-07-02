import React, { useState, useEffect } from 'react';
import { attendanceService } from '../../services/attendanceService';
import { employeeService } from '../../services/employeeService';
import AttendanceForm from './AttendanceForm';
import Modal from '../common/Modal';
import SuccessModal from '../common/SuccessModal';
import { useNotification } from '../../hooks/useNotification';

const AttendanceList = () => {
  const [asistencias, setAsistencias] = useState([]);
  const [filteredAsistencias, setFilteredAsistencias] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingAsistencia, setEditingAsistencia] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Hook para notificaciones
  const { notification, closeNotification, showError, showConfirm } = useNotification();

  // Estado para modal de éxito
  const [successModal, setSuccessModal] = useState({
    isVisible: false,
    message: '',
    title: '¡Éxito!'
  });

  // Función helper para convertir UTC a GMT-5
  const convertUTCToGMT5 = (utcDateString) => {
    if (!utcDateString) return null;
    const utcDate = new Date(utcDateString);
    return new Date(utcDate.getTime() + (5 * 60 * 60 * 1000));
  };

  useEffect(() => {
    loadData();
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

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      // Cargar asistencias y empleados en paralelo
      const [asistenciasResponse, empleadosResponse] = await Promise.all([
        attendanceService.getAll(),
        employeeService.getAllEmployees()
      ]);

      console.log('Asistencias cargadas:', asistenciasResponse);
      console.log('Empleados cargados:', empleadosResponse);

      const asistenciasArray = Array.isArray(asistenciasResponse) ? asistenciasResponse :
        Array.isArray(asistenciasResponse.data) ? asistenciasResponse.data : [];

      const empleadosArray = Array.isArray(empleadosResponse) ? empleadosResponse :
        Array.isArray(empleadosResponse.data) ? empleadosResponse.data : [];

      setAsistencias(asistenciasArray);
      setFilteredAsistencias(asistenciasArray);
      setEmpleados(empleadosArray);
    } catch (error) {
      console.error('Error cargando datos:', error);
      setError(error.message || 'Error al cargar datos');
      setAsistencias([]);
      setFilteredAsistencias([]);
      setEmpleados([]);
      showError(
        'Error al cargar asistencias',
        'No se pudieron cargar las asistencias. Por favor, intente nuevamente.'
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

    let filtered = asistencias;

    // Filtro por búsqueda
    if (search && search.trim() !== '') {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(asistencia => {
        if (!asistencia) return false;

        const matchesId = asistencia.id &&
          asistencia.id.toString().includes(searchLower);

        const matchesTipoRegistro = asistencia.tipoRegistro &&
          asistencia.tipoRegistro.toLowerCase().includes(searchLower);

        const matchesUbicacion = asistencia.ubicacionRegistro &&
          asistencia.ubicacionRegistro.toLowerCase().includes(searchLower);

        const matchesMetodo = asistencia.metodoRegistro &&
          asistencia.metodoRegistro.toLowerCase().includes(searchLower);

        const matchesEmpleado = asistencia.empleadoId && empleados.find(e => e.id === asistencia.empleadoId) &&
          (empleados.find(e => e.id === asistencia.empleadoId).nombres.toLowerCase().includes(searchLower) ||
           empleados.find(e => e.id === asistencia.empleadoId).apellidos.toLowerCase().includes(searchLower));

        const matchesObservacion = asistencia.observacion &&
          asistencia.observacion.toLowerCase().includes(searchLower);

        return matchesId || matchesTipoRegistro || matchesUbicacion || matchesMetodo || matchesEmpleado || matchesObservacion;
      });
    }

    setFilteredAsistencias(filtered);
  };

  const getEmpleadoNombre = (empleadoId) => {
    const empleado = empleados.find(e => e.id === empleadoId);
    return empleado ? `${empleado.nombres} ${empleado.apellidos}` : 'Empleado no encontrado';
  };

  const getTipoRegistroBadge = (tipo) => {
    const tipoConfig = {
      'Entrada': { class: 'badge-success', icon: 'sign-in-alt', text: 'Entrada' },
      'Salida': { class: 'badge-danger', icon: 'sign-out-alt', text: 'Salida' },
      'Pausa': { class: 'badge-warning', icon: 'pause', text: 'Pausa' },
      'Regreso': { class: 'badge-info', icon: 'play', text: 'Regreso' },
      'Tardanza': { class: 'badge-danger', icon: 'clock', text: 'Tardanza' },
      'Salida Anticipada': { class: 'badge-warning', icon: 'clock', text: 'Salida Anticipada' }
    };

    const config = tipoConfig[tipo] || { class: 'badge-secondary', icon: 'question', text: tipo || 'N/A' };

    return (
      <span className={`badge ${config.class}`}>
        <i className={`fas fa-${config.icon} mr-1`}></i>
        {config.text}
      </span>
    );
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return '-';
    const peruDate = convertUTCToGMT5(dateTimeString);
    return peruDate.toLocaleString('es-PE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (dateTimeString) => {
    if (!dateTimeString) return '-';
    const peruDate = convertUTCToGMT5(dateTimeString);
    return peruDate.toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateTimeString) => {
    if (!dateTimeString) return '-';
    const peruDate = convertUTCToGMT5(dateTimeString);
    return peruDate.toLocaleDateString('es-PE');
  };

  const calculateHours = (entrada, salida) => {
    if (!entrada || !salida) return '-';
    
    const entradaDate = new Date(entrada);
    const salidaDate = new Date(salida);
    const diffMs = salidaDate - entradaDate;
    const diffHours = diffMs / (1000 * 60 * 60);
    
    const hours = Math.floor(diffHours);
    const minutes = Math.floor((diffHours - hours) * 60);
    
    return `${hours}h ${minutes}m`;
  };

  const handleEdit = (asistencia) => {
    setEditingAsistencia(asistencia);
    setShowForm(true);
  };

  const handleDelete = (asistenciaId, empleadoNombre) => {
    showConfirm(
      'Confirmar eliminación',
      `¿Está seguro de que desea eliminar el registro de asistencia de "${empleadoNombre}"? Esta acción no se puede deshacer.`,
      async () => {
        try {
          await attendanceService.delete(asistenciaId);
          loadData();
          showSuccessModal('Registro de asistencia eliminado exitosamente', '¡Eliminado!');
        } catch (error) {
          showError(
            'Error al eliminar registro',
            'No se pudo eliminar el registro de asistencia. Por favor, intente nuevamente.'
          );
        }
      }
    );
  };

  const handleFormSubmit = async (asistenciaData) => {
    try {
      if (editingAsistencia) {
        await attendanceService.update(editingAsistencia.id, asistenciaData);

        setShowForm(false);
        setEditingAsistencia(null);
        await loadData();

        showSuccessModal('El registro de asistencia se ha actualizado exitosamente', '¡Actualizado!');

      } else {
        await attendanceService.create(asistenciaData);

        setShowForm(false);
        setEditingAsistencia(null);
        await loadData();

        showSuccessModal('El registro de asistencia se ha creado exitosamente', '¡Creado!');
      }
    } catch (error) {
      console.error('Error en handleFormSubmit:', error);
      throw error;
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingAsistencia(null);
  };

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAsistencias.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAsistencias.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (showForm) {
    return (
      <AttendanceForm
        asistencia={editingAsistencia}
        empleados={empleados}
        onSubmit={handleFormSubmit}
        onCancel={handleFormCancel}
      />
    );
  }

  return (
    <>
      <div className="page-inner">
        <div className="page-header">
          <h4 className="page-title">Gestión de Asistencias</h4>
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
              <span>Asistencias</span>
            </li>
          </ul>
        </div>

        <div className="row">
          <div className="col-md-12">
            <div className="card">
              <div className="card-header">
                <div className="d-flex align-items-center">
                  <h4 className="card-title">Registro de Asistencias</h4>
                  <button
                    className="btn btn-primary btn-round ml-auto"
                    onClick={() => setShowForm(true)}
                    disabled={loading}
                  >
                    <i className="fas fa-plus mr-2"></i>
                    Registrar Asistencia
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
                        placeholder="Buscar por empleado, tipo de registro, ubicación o método..."
                        value={searchTerm}
                        onChange={handleSearch}
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>

                {loading ? (
                  <div className="text-center py-4">
                    <div className="spinner-border" role="status">
                      <span className="sr-only">Cargando asistencias...</span>
                    </div>
                    <p className="mt-2 text-muted">Cargando registros de asistencia...</p>
                  </div>
                ) : (
                  <>
                    <div className="table-responsive">
                      <table className="table table-striped table-hover">
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Empleado</th>
                            <th>Tipo</th>
                            <th>Entrada</th>
                            <th>Salida</th>
                            <th>Horas</th>
                            <th>Ubicación</th>
                            <th>Método</th>
                            <th>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentItems.length === 0 ? (
                            <tr>
                              <td colSpan="9" className="text-center py-4">
                                <div className="empty-state">
                                  <i className="fas fa-calendar-check fa-3x text-muted mb-3"></i>
                                  <h5 className="text-muted">No se encontraron registros de asistencia</h5>
                                  <p className="text-muted">
                                    {searchTerm ? 'Intente con otros términos de búsqueda' : 'Comience registrando la primera asistencia'}
                                  </p>
                                  {!searchTerm && (
                                    <button
                                      className="btn btn-primary"
                                      onClick={() => setShowForm(true)}
                                    >
                                      <i className="fas fa-plus mr-2"></i>
                                      Registrar Primera Asistencia
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ) : (
                            currentItems.map((asistencia) => (
                              <tr key={asistencia.id || Math.random()}>
                                <td>
                                  <span className="text-muted">{asistencia.id || '-'}</span>
                                </td>
                                <td>
                                  <div style={{
                                    maxWidth: '150px',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                  }} title={getEmpleadoNombre(asistencia.empleadoId)}>
                                    <strong>{getEmpleadoNombre(asistencia.empleadoId)}</strong>
                                  </div>
                                </td>
                                <td>{getTipoRegistroBadge(asistencia.tipoRegistro)}</td>
                                <td>
                                  <span className="text-success">
                                    <i className="fas fa-sign-in-alt mr-1"></i>
                                    {formatTime(asistencia.entrada)}
                                  </span>
                                  <br />
                                  <small className="text-muted">
                                    {formatDate(asistencia.entrada)}
                                  </small>
                                </td>
                                <td>
                                  {asistencia.salida ? (
                                    <>
                                      <span className="text-danger">
                                        <i className="fas fa-sign-out-alt mr-1"></i>
                                        {formatTime(asistencia.salida)}
                                      </span>
                                      <br />
                                      <small className="text-muted">
                                        {formatDate(asistencia.salida)}
                                      </small>
                                    </>
                                  ) : (
                                    <span className="text-muted">
                                      <i className="fas fa-clock mr-1"></i>
                                      En curso
                                    </span>
                                  )}
                                </td>
                                <td>
                                  <strong className="text-primary">
                                    {calculateHours(asistencia.entrada, asistencia.salida)}
                                  </strong>
                                </td>
                                <td>
                                  <small className="text-muted">
                                    <i className="fas fa-map-marker-alt mr-1"></i>
                                    {asistencia.ubicacionRegistro || 'No especificada'}
                                  </small>
                                </td>
                                <td>
                                  <small className="text-muted">
                                    <i className="fas fa-mobile-alt mr-1"></i>
                                    {asistencia.metodoRegistro || 'Manual'}
                                  </small>
                                </td>
                                <td>
                                  <div className="form-button-action">
                                    <button
                                      type="button"
                                      className="btn btn-link btn-primary btn-lg"
                                      onClick={() => handleEdit(asistencia)}
                                      title="Editar Asistencia"
                                      disabled={loading}
                                    >
                                      <i className="fas fa-edit"></i>
                                    </button>

                                    <button
                                      type="button"
                                      className="btn btn-link btn-danger btn-lg"
                                      onClick={() => handleDelete(asistencia.id, getEmpleadoNombre(asistencia.empleadoId))}
                                      title="Eliminar Asistencia"
                                      disabled={loading}
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
                        Mostrando {indexOfFirstItem + 1} a {Math.min(indexOfLastItem, filteredAsistencias.length)} de {filteredAsistencias.length} registros
                        {searchTerm && filteredAsistencias.length !== asistencias.length && (
                          <> (filtrados de {asistencias.length} total)</>
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

export default AttendanceList;
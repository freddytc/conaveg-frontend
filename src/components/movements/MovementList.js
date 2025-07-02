import React, { useState, useEffect } from 'react';
import { movementService } from '../../services/movementService';
import { employeeService } from '../../services/employeeService';
import { inventoryService } from '../../services/inventoryService';
import MovementForm from './MovementForm';
import Modal from '../common/Modal';
import SuccessModal from '../common/SuccessModal';
import { useNotification } from '../../hooks/useNotification';

const MovementList = () => {
  const [movements, setMovements] = useState([]);
  const [filteredMovements, setFilteredMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingMovement, setEditingMovement] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [movementsPerPage] = useState(10);

  // Estados para datos relacionados
  const [employees, setEmployees] = useState([]);
  const [inventory, setInventory] = useState([]);

  // Hook para notificaciones
  const { notification, closeNotification, showError, showConfirm } = useNotification();

  // Estado para modal de éxito
  const [successModal, setSuccessModal] = useState({
    isVisible: false,
    message: '',
    title: '¡Éxito!'
  });

  useEffect(() => {
    loadInitialData();
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

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError('');

      // Cargar movimientos
      let movementArray = [];
      try {
        const movementsResponse = await movementService.getAllMovements();
        movementArray = Array.isArray(movementsResponse) ? movementsResponse : [];
      } catch (movError) {
        console.error('Error cargando movimientos:', movError);
        setError(`Error cargando movimientos: ${movError.message}`);
        movementArray = [];
        showError(
          'Error al cargar movimientos',
          'No se pudieron cargar los movimientos. Por favor, intente nuevamente.'
        );
      }

      // Cargar empleados e inventario en paralelo
      let employeeArray = [];
      let inventoryArray = [];

      try {
        const [employeesResponse, inventoryResponse] = await Promise.all([
          employeeService.getAllEmployees().catch(() => []),
          inventoryService.getAllInventory().catch(() => [])
        ]);

        employeeArray = Array.isArray(employeesResponse) ? employeesResponse :
          (employeesResponse?.data ? employeesResponse.data : []);
        inventoryArray = Array.isArray(inventoryResponse) ? inventoryResponse :
          (inventoryResponse?.data ? inventoryResponse.data : []);

      } catch (dataError) {
        console.error('Error cargando datos relacionados:', dataError);
      }

      // Establecer estados
      setMovements(movementArray);
      setFilteredMovements(movementArray);
      setEmployees(employeeArray);
      setInventory(inventoryArray);

    } catch (error) {
      console.error('Error general cargando datos:', error);
      setError(`Error general: ${error.message}`);
      setMovements([]);
      setFilteredMovements([]);
      showError(
        'Error general',
        'No se pudieron cargar los datos. Por favor, intente nuevamente.'
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

    let filtered = movements;

    if (search && search.trim() !== '') {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(movement => {
        if (!movement) return false;

        const matchesId = movement.id && movement.id.toString().includes(searchLower);
        const matchesTipo = movement.tipoMovimiento && movement.tipoMovimiento.toLowerCase().includes(searchLower);
        const matchesObservacion = movement.observacion && movement.observacion.toLowerCase().includes(searchLower);

        return matchesId || matchesTipo || matchesObservacion;
      });
    }

    setFilteredMovements(filtered);
  };

  const handleEdit = (movement) => {
    setEditingMovement(movement);
    setShowForm(true);
  };

  const handleDelete = (movementId, movementType) => {
    showConfirm(
      'Confirmar eliminación',
      `¿Está seguro de que desea eliminar el movimiento "${movementType}" (ID: ${movementId})? Esta acción no se puede deshacer.`,
      async () => {
        try {
          await movementService.deleteMovement(movementId);
          loadInitialData();
          showSuccessModal('Movimiento eliminado exitosamente', '¡Eliminado!');
        } catch (error) {
          showError(
            'Error al eliminar movimiento',
            'No se pudo eliminar el movimiento. Por favor, intente nuevamente.'
          );
        }
      }
    );
  };

  const handleFormSubmit = async (movementData) => {
    try {
      if (editingMovement && editingMovement.id) {
        await movementService.updateMovement(editingMovement.id, movementData);

        setShowForm(false);
        setEditingMovement(null);
        await loadInitialData();

        showSuccessModal('El movimiento se ha actualizado exitosamente', '¡Actualizado!');

      } else {
        await movementService.createMovement(movementData);

        setShowForm(false);
        setEditingMovement(null);
        await loadInitialData();

        showSuccessModal('El movimiento se ha registrado exitosamente', '¡Registrado!');
      }
    } catch (error) {
      console.error('Error en handleFormSubmit:', error);
      throw error; // Re-lanzar para que lo capture el formulario
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingMovement(null);
  };

  const getEmpleadoNombre = (empleadoId) => {
    if (!empleadoId) return '-';
    const empleado = employees.find(emp => emp.id === empleadoId);
    return empleado ? `${empleado.nombres} ${empleado.apellidos}` : `ID: ${empleadoId}`;
  };

  const getInventarioNombre = (inventarioId) => {
    if (!inventarioId) return '-';
    const item = inventory.find(inv => inv.id === inventarioId);
    return item ? item.nombre : `ID: ${inventarioId}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  };

  const getTipoMovimientoBadgeColor = (tipo) => {
    if (!tipo) return 'badge-light';

    const tipoUpper = tipo.toUpperCase();

    if (tipoUpper.includes('ENTRADA')) return 'badge-success';
    if (tipoUpper.includes('SALIDA')) return 'badge-danger';
    if (tipoUpper.includes('ASIGNACION')) return 'badge-primary';
    if (tipoUpper.includes('DEVOLUCION')) return 'badge-warning';
    if (tipoUpper.includes('PERDIDA')) return 'badge-danger';
    if (tipoUpper.includes('MANTENIMIENTO')) return 'badge-secondary';

    return 'badge-primary';
  };

  // Paginación
  const indexOfLastMovement = currentPage * movementsPerPage;
  const indexOfFirstMovement = indexOfLastMovement - movementsPerPage;
  const currentMovements = filteredMovements.slice(indexOfFirstMovement, indexOfLastMovement);
  const totalPages = Math.ceil(filteredMovements.length / movementsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (showForm) {
    return (
      <MovementForm
        movement={editingMovement}
        onSubmit={handleFormSubmit}
        onCancel={handleFormCancel}
      />
    );
  }

  return (
    <>
      <div className="page-inner">
        <div className="page-header">
          <h4 className="page-title">Gestión de Movimientos</h4>
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
              <span>Movimientos</span>
            </li>
          </ul>
        </div>

        <div className="row">
          <div className="col-md-12">
            <div className="card">
              <div className="card-header">
                <div className="d-flex align-items-center">
                  <h4 className="card-title">Lista de Movimientos</h4>
                  <div className="ml-auto">
                    <button className="btn btn-primary btn-round" onClick={() => setShowForm(true)}>
                      <i className="fas fa-plus"></i> Realizar Movimiento
                    </button>
                  </div>
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
                        placeholder="Buscar por ID, tipo de movimiento u observaciones..."
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
                    <p className="mt-2">Cargando movimientos...</p>
                  </div>
                ) : (
                  <>
                    <div className="table-responsive">
                      <table className="table table-striped">
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Fecha</th>
                            <th>Tipo</th>
                            <th>Artículo</th>
                            <th>Cantidad</th>
                            <th>Empleado</th>
                            <th>Proyecto</th>
                            <th>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentMovements.length === 0 ? (
                            <tr>
                              <td colSpan="8" className="text-center py-4">
                                <div className="empty-state">
                                  <i className="fas fa-box-open fa-3x text-muted mb-3"></i>
                                  <h5 className="text-muted">No se encontraron movimientos</h5>
                                  <p className="text-muted">
                                    {searchTerm ? 'Intente con otros términos de búsqueda' : 'Comience registrando un nuevo movimiento'}
                                  </p>
                                  {!searchTerm && (
                                    <button
                                      className="btn btn-primary"
                                      onClick={() => setShowForm(true)}
                                    >
                                      <i className="fas fa-plus mr-2"></i>
                                      Registrar Primer Movimiento
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ) : (
                            currentMovements.map((movement, index) => (
                              <tr key={movement.id || index}>
                                <td><strong>{movement.id || '-'}</strong></td>
                                <td>{formatDate(movement.fechaMovimiento)}</td>
                                <td>
                                  <span className={`badge ${getTipoMovimientoBadgeColor(movement.tipoMovimiento)}`}>
                                    {movement.tipoMovimiento || 'N/A'}
                                  </span>
                                </td>
                                <td>
                                  <div style={{
                                    maxWidth: '150px',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                  }}>
                                    {getInventarioNombre(movement.inventarioId)}
                                  </div>
                                </td>
                                <td>
                                  <strong>{movement.cantidad || '-'}</strong>
                                </td>
                                <td>{getEmpleadoNombre(movement.empleadoIdRecibe)}</td>
                                <td>
                                  {movement.proyectoId ? (
                                    <span>Proyecto #{movement.proyectoId}</span>
                                  ) : (
                                    <span className="text-muted">-</span>
                                  )}
                                </td>
                                <td>
                                  <div className="form-button-action">
                                    <button
                                      type="button"
                                      data-toggle="tooltip"
                                      title="Editar"
                                      className="btn btn-link btn-primary btn-lg"
                                      onClick={() => handleEdit(movement)}
                                    >
                                      <i className="fa fa-edit"></i>
                                    </button>
                                    <button
                                      type="button"
                                      data-toggle="tooltip"
                                      title="Eliminar"
                                      className="btn btn-link btn-danger"
                                      onClick={() => handleDelete(movement.id, movement.tipoMovimiento)}
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
                        Mostrando {indexOfFirstMovement + 1} a {Math.min(indexOfLastMovement, filteredMovements.length)} de {filteredMovements.length} movimientos
                        {searchTerm && filteredMovements.length !== movements.length && (
                          <> (filtrados de {movements.length} total)</>
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

export default MovementList;
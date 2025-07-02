import React, { useState, useEffect } from 'react';
import { proveedorService } from '../../services/suppliersService';
import ProveedorForm from './SupplierForm';
import Modal from '../common/Modal';
import SuccessModal from '../common/SuccessModal';
import { useNotification } from '../../hooks/useNotification';

const ProveedorList = () => {
  const [proveedores, setProveedores] = useState([]);
  const [filteredProveedores, setFilteredProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProveedor, setEditingProveedor] = useState(null);
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

  useEffect(() => {
    loadProveedores();
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

  const loadProveedores = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await proveedorService.getAll();
      console.log('Proveedores cargados:', response);

      // Manejar la respuesta del backend
      const proveedoresArray = Array.isArray(response) ? response :
        Array.isArray(response.data) ? response.data : [];

      setProveedores(proveedoresArray);
      setFilteredProveedores(proveedoresArray);
    } catch (error) {
      console.error('Error cargando proveedores:', error);
      setError(error.message || 'Error al cargar proveedores');
      setProveedores([]);
      setFilteredProveedores([]);
      showError(
        'Error al cargar proveedores',
        'No se pudieron cargar los proveedores. Por favor, intente nuevamente.'
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

    let filtered = proveedores;

    if (search && search.trim() !== '') {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(proveedor => {
        if (!proveedor) return false;

        const matchesRuc = proveedor.ruc &&
          proveedor.ruc.toLowerCase().includes(searchLower);

        const matchesRazonSocial = proveedor.razonSocial &&
          proveedor.razonSocial.toLowerCase().includes(searchLower);

        const matchesDireccion = proveedor.direccion &&
          proveedor.direccion.toLowerCase().includes(searchLower);

        const matchesTelefono = proveedor.telefono &&
          proveedor.telefono.toLowerCase().includes(searchLower);

        const matchesId = proveedor.id &&
          proveedor.id.toString().includes(searchLower);

        return matchesRuc || matchesRazonSocial || matchesDireccion ||
          matchesTelefono || matchesId;
      });
    }

    setFilteredProveedores(filtered);
  };

  const handleEdit = (proveedor) => {
    setEditingProveedor(proveedor);
    setShowForm(true);
  };

  const handleDelete = (proveedorId, razonSocial) => {
    showConfirm(
      'Confirmar eliminación',
      `¿Está seguro de que desea eliminar el proveedor "${razonSocial}"? Esta acción no se puede deshacer.`,
      async () => {
        try {
          await proveedorService.delete(proveedorId);
          loadProveedores();
          showSuccessModal('Proveedor eliminado exitosamente', '¡Eliminado!');
        } catch (error) {
          showError(
            'Error al eliminar proveedor',
            'No se pudo eliminar el proveedor. Por favor, intente nuevamente.'
          );
        }
      }
    );
  };

  const handleFormSubmit = async (proveedorData) => {
    try {
      if (editingProveedor) {
        await proveedorService.update(editingProveedor.id, proveedorData);

        setShowForm(false);
        setEditingProveedor(null);
        await loadProveedores();

        showSuccessModal('El proveedor se ha actualizado exitosamente', '¡Actualizado!');

      } else {
        await proveedorService.create(proveedorData);

        setShowForm(false);
        setEditingProveedor(null);
        await loadProveedores();

        showSuccessModal('El proveedor se ha creado exitosamente', '¡Creado!');
      }
    } catch (error) {
      console.error('Error en handleFormSubmit:', error);
      throw error; // Re-lanzar para que lo capture el formulario
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingProveedor(null);
  };

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProveedores.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProveedores.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (showForm) {
    return (
      <ProveedorForm
        proveedor={editingProveedor}
        onSubmit={handleFormSubmit}
        onCancel={handleFormCancel}
      />
    );
  }

  return (
    <>
      <div className="page-inner">
        <div className="page-header">
          <h4 className="page-title">Gestión de Proveedores</h4>
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
              <span>Proveedores</span>
            </li>
          </ul>
        </div>

        <div className="row">
          <div className="col-md-12">
            <div className="card">
              <div className="card-header">
                <div className="d-flex align-items-center">
                  <h4 className="card-title">Lista de Proveedores</h4>
                  <button
                    className="btn btn-primary btn-round ml-auto"
                    onClick={() => setShowForm(true)}
                    disabled={loading}
                  >
                    <i className="fas fa-plus mr-2"></i>
                    Agregar Proveedor
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
                        placeholder="Buscar por RUC, razón social, dirección o teléfono..."
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
                      <span className="sr-only">Cargando proveedores...</span>
                    </div>
                    <p className="mt-2 text-muted">Cargando proveedores...</p>
                  </div>
                ) : (
                  <>
                    <div className="table-responsive">
                      <table className="table table-striped table-hover">
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>RUC</th>
                            <th>Razón Social</th>
                            <th>Dirección</th>
                            <th>Teléfono</th>
                            <th>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentItems.length === 0 ? (
                            <tr>
                              <td colSpan="6" className="text-center py-4">
                                <div className="empty-state">
                                  <i className="fas fa-truck fa-3x text-muted mb-3"></i>
                                  <h5 className="text-muted">No se encontraron proveedores</h5>
                                  <p className="text-muted">
                                    {searchTerm ? 'Intente con otros términos de búsqueda' : 'Comience agregando un nuevo proveedor'}
                                  </p>
                                  {!searchTerm && (
                                    <button
                                      className="btn btn-primary"
                                      onClick={() => setShowForm(true)}
                                    >
                                      <i className="fas fa-plus mr-2"></i>
                                      Agregar Primer Proveedor
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ) : (
                            currentItems.map((proveedor) => (
                              <tr key={proveedor.id || Math.random()}>
                                <td>
                                  <span className="text-muted">{proveedor.id || '-'}</span>
                                </td>
                                <td>
                                  <strong className="text-primary">{proveedor.ruc || '-'}</strong>
                                </td>
                                <td>
                                  <div style={{
                                    maxWidth: '200px',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                  }} title={proveedor.razonSocial}>
                                    <strong>{proveedor.razonSocial || '-'}</strong>
                                  </div>
                                </td>
                                <td>
                                  <div style={{
                                    maxWidth: '180px',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                  }} title={proveedor.direccion}>
                                    {proveedor.direccion || '-'}
                                  </div>
                                </td>
                                <td>
                                  <span className="text-monospace">{proveedor.telefono || '-'}</span>
                                </td>
                                <td>
                                  <div className="form-button-action">
                                    <button
                                      type="button"
                                      className="btn btn-link btn-primary btn-lg"
                                      onClick={() => handleEdit(proveedor)}
                                      title="Editar Proveedor"
                                      disabled={loading}
                                    >
                                      <i className="fas fa-edit"></i>
                                    </button>

                                    <button
                                      type="button"
                                      className="btn btn-link btn-danger btn-lg"
                                      onClick={() => handleDelete(proveedor.id, proveedor.razonSocial)}
                                      title="Eliminar Proveedor"
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
                        Mostrando {indexOfFirstItem + 1} a {Math.min(indexOfLastItem, filteredProveedores.length)} de {filteredProveedores.length} proveedores
                        {searchTerm && filteredProveedores.length !== proveedores.length && (
                          <> (filtrados de {proveedores.length} total)</>
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

export default ProveedorList;
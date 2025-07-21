import React, { useState, useEffect } from 'react';
import { inventoryService } from '../../services/inventoryService';
import InventoryForm from './InventoryForm';
import Modal from '../common/Modal';
import SuccessModal from '../common/SuccessModal';
import { useNotification } from '../../hooks/useNotification';

const InventoryList = () => {
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
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
    loadInventory();
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

  const loadInventory = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await inventoryService.getAllInventory();
      console.log('Inventario cargado:', response);
      const inventoryArray = Array.isArray(response) ? response : [];
      setInventory(inventoryArray);
      setFilteredInventory(inventoryArray);
    } catch (error) {
      console.error('Error cargando inventario:', error);
      setError(error.message);
      setInventory([]);
      setFilteredInventory([]);
      showError(
        'Error al cargar inventario',
        'No se pudieron cargar los productos. Por favor, intente nuevamente.'
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
    
    let filtered = inventory;

    // Filtro por búsqueda
    if (search && search.trim() !== '') {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(item => {
        if (!item) return false;
        
        const matchesCodigo = item.codigo && 
          item.codigo.toLowerCase().includes(searchLower);
        
        const matchesNombre = item.nombre && 
          item.nombre.toLowerCase().includes(searchLower);
        
        const matchesDescripcion = item.descripcion && 
          item.descripcion.toLowerCase().includes(searchLower);
        
        const matchesMarca = item.marca && 
          item.marca.toLowerCase().includes(searchLower);
        
        const matchesModelo = item.modelo && 
          item.modelo.toLowerCase().includes(searchLower);
        
        const matchesNroSerie = item.nroSerie && 
          item.nroSerie.toLowerCase().includes(searchLower);
        
        const matchesEstadoConservacion = item.estadoConservacion && 
          item.estadoConservacion.toLowerCase().includes(searchLower);
        
        const matchesId = item.id && 
          item.id.toString().includes(searchLower);
        
        return matchesCodigo || matchesNombre || matchesDescripcion || 
               matchesMarca || matchesModelo || matchesNroSerie || 
               matchesEstadoConservacion || matchesId;
      });
    }
    
    setFilteredInventory(filtered);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleDelete = (itemId, itemName) => {
    showConfirm(
      'Confirmar eliminación',
      `¿Está seguro de que desea eliminar el producto "${itemName}"? Esta acción no se puede deshacer.`,
      async () => {
        try {
          await inventoryService.deleteInventory(itemId);
          loadInventory();
          showSuccessModal('Producto eliminado exitosamente', '¡Eliminado!');
        } catch (error) {
          showError(
            'Error al eliminar producto',
            'No se pudo eliminar el producto. Por favor, intente nuevamente.'
          );
        }
      }
    );
  };

  const handleFormSubmit = async (inventoryData) => {
    try {
      if (editingItem) {
        await inventoryService.updateInventory(editingItem.id, inventoryData);
        
        setShowForm(false);
        setEditingItem(null);
        await loadInventory();
        
        showSuccessModal('El producto se ha actualizado exitosamente', '¡Actualizado!');
        
      } else {
        await inventoryService.createInventory(inventoryData);
        
        setShowForm(false);
        setEditingItem(null);
        await loadInventory();
        
        showSuccessModal('El producto se ha creado exitosamente', '¡Creado!');
      }
    } catch (error) {
      console.error('Error en handleFormSubmit:', error);
      throw error; // Re-lanzar para que lo capture el formulario
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingItem(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('es-ES');
    } catch (error) {
      return '-';
    }
  };

  const getConservationBadgeColor = (estado) => {
    if (!estado) return 'badge-light';
    
    const estadoUpper = estado.toUpperCase();
    
    // Excelente, Nuevo
    if (estadoUpper.includes('EXCELENTE') || estadoUpper.includes('NUEVO') || estadoUpper.includes('PERFECTO')) {
      return 'badge-success';
    }
    
    // Bueno, Funcional
    if (estadoUpper.includes('BUENO') || estadoUpper.includes('FUNCIONAL') || estadoUpper.includes('OPERATIVO')) {
      return 'badge-info';
    }
    
    // Regular, Usado
    if (estadoUpper.includes('REGULAR') || estadoUpper.includes('USADO') || estadoUpper.includes('DESGASTADO')) {
      return 'badge-warning';
    }
    
    // Malo, Dañado, Inservible
    if (estadoUpper.includes('MALO') || estadoUpper.includes('DAÑADO') || estadoUpper.includes('INSERVIBLE') || estadoUpper.includes('ROTO')) {
      return 'badge-danger';
    }
    
    // En reparación, Mantenimiento
    if (estadoUpper.includes('REPARACION') || estadoUpper.includes('MANTENIMIENTO')) {
      return 'badge-secondary';
    }
    
    // Por defecto
    return 'badge-light';
  };

  const getStockBadgeColor = (stock) => {
    if (stock === 0) return 'badge-danger';
    if (stock <= 5) return 'badge-warning';
    if (stock <= 10) return 'badge-info';
    return 'badge-success';
  };

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredInventory.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredInventory.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (showForm) {
    return (
      <InventoryForm
        item={editingItem}
        onSubmit={handleFormSubmit}
        onCancel={handleFormCancel}
      />
    );
  }

  return (
    <>
      <div className="page-inner">
        <div className="page-header">
          <h4 className="page-title">Gestión de Inventario</h4>
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
              <span>Inventario</span>
            </li>
          </ul>
        </div>

        <div className="row">
          <div className="col-md-12">
            <div className="card">
              <div className="card-header">
                <div className="d-flex align-items-center">
                  <h4 className="card-title">Lista de Productos</h4>
                  <button
                    className="btn btn-primary btn-round ml-auto"
                    onClick={() => setShowForm(true)}
                  >
                    <i className="fas fa-plus mr-2"></i>
                    Agregar Producto
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
                        placeholder="Buscar por código, nombre, marca, modelo, número de serie o estado..."
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
                  </div>
                ) : (
                  <>
                    <div className="table-responsive">
                      <table className="table table-striped">
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Código</th>
                            <th>Nombre</th>
                            <th>Marca/Modelo</th>
                            <th>N° Serie</th>
                            <th>Stock</th>
                            <th>Estado</th>
                            <th>Fecha Adq.</th>
                            <th>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentItems.length === 0 ? (
                            <tr>
                              <td colSpan="9" className="text-center py-4">
                                <div className="empty-state">
                                  <i className="fas fa-boxes fa-3x text-muted mb-3"></i>
                                  <h5 className="text-muted">No se encontraron productos</h5>
                                  <p className="text-muted">
                                    {searchTerm ? 'Intente con otros términos de búsqueda' : 'Comience agregando un nuevo producto'}
                                  </p>
                                </div>
                              </td>
                            </tr>
                          ) : (
                            currentItems.map((item) => (
                              <tr key={item.id || Math.random()}>
                                <td>{item.id || '-'}</td>
                                <td>
                                  <strong className="text-primary">{item.codigo || '-'}</strong>
                                </td>
                                <td>
                                  <div style={{ 
                                    maxWidth: '150px', 
                                    overflow: 'hidden', 
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                  }}>
                                    <strong>{item.nombre || '-'}</strong>
                                  </div>
                                </td>
                                <td>
                                  <div>{item.marca || '-'}</div>
                                  {item.modelo && (
                                    <small className="text-muted">{item.modelo}</small>
                                  )}
                                </td>
                                <td>
                                  <small className="text-monospace">{item.nroSerie || '-'}</small>
                                </td>
                                <td>
                                  <span className={`badge ${getStockBadgeColor(item.stock)}`}>
                                    {item.stock || 0}
                                  </span>
                                  {item.unidadMedida && (
                                    <small className="text-muted d-block">
                                      {item.unidadMedida}
                                    </small>
                                  )}
                                </td>
                                <td>
                                  <span className={`badge ${getConservationBadgeColor(item.estadoConservacion)}`}>
                                    {item.estadoConservacion || 'N/A'}
                                  </span>
                                </td>
                                <td>{formatDate(item.fechaAquisicion)}</td>
                                <td>
                                  <div className="form-button-action">
                                    <button
                                      type="button"
                                      className="btn btn-link btn-primary btn-lg"
                                      onClick={() => handleEdit(item)}
                                      title="Editar Producto"
                                    >
                                      <i className="fas fa-edit"></i>
                                    </button>
                                    
                                    <button
                                      type="button"
                                      className="btn btn-link btn-danger btn-lg"
                                      onClick={() => handleDelete(item.id, item.nombre)}
                                      title="Eliminar Producto"
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
                        Mostrando {indexOfFirstItem + 1} a {Math.min(indexOfLastItem, filteredInventory.length)} de {filteredInventory.length} productos
                        {searchTerm && filteredInventory.length !== inventory.length && (
                          <> (filtrados de {inventory.length} total)</>
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

export default InventoryList;
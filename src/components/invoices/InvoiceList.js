import React, { useState, useEffect } from 'react';
import { invoiceService } from '../../services/invoiceService';
import { proveedorService } from '../../services/suppliersService';
import InvoiceForm from './InvoiceForm';
import Modal from '../common/Modal';
import SuccessModal from '../common/SuccessModal';
import { useNotification } from '../../hooks/useNotification';

const InvoiceList = () => {
  const [facturas, setFacturas] = useState([]);
  const [filteredFacturas, setFilteredFacturas] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingFactura, setEditingFactura] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const { notification, closeNotification, showError, showConfirm } = useNotification();

  const [successModal, setSuccessModal] = useState({
    isVisible: false,
    message: '',
    title: '¡Éxito!'
  });

  useEffect(() => {
    loadData();
  }, []);

  const showSuccessModal = (message, title = '¡Éxito!') => {
    setSuccessModal({ isVisible: true, message, title });
  };

  const hideSuccessModal = () => {
    setSuccessModal(prev => ({ ...prev, isVisible: false }));
  };

  const loadData = async () => {
    try {
      setLoading(true);

      const [facturasResponse, proveedoresResponse] = await Promise.all([
        invoiceService.getAll(),
        proveedorService.getAll()
      ]);

      const facturasArray = Array.isArray(facturasResponse) ? facturasResponse :
        Array.isArray(facturasResponse.data) ? facturasResponse.data : [];

      const proveedoresArray = Array.isArray(proveedoresResponse) ? proveedoresResponse :
        Array.isArray(proveedoresResponse.data) ? proveedoresResponse.data : [];

      setFacturas(facturasArray);
      setFilteredFacturas(facturasArray);
      setProveedores(proveedoresArray);
    } catch (error) {
      setFacturas([]);
      setFilteredFacturas([]);
      setProveedores([]);
      showError(
        'Error al cargar facturas',
        'No se pudieron cargar las facturas. Por favor, intente nuevamente.'
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

    let filtered = facturas;

    if (search && search.trim() !== '') {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(factura => {
        if (!factura) return false;

        const matchesNroFactura = factura.nroFactura?.toLowerCase().includes(searchLower);
        const matchesDescripcion = factura.descripcion?.toLowerCase().includes(searchLower);
        const matchesProveedor = factura.proveedorId && proveedores.find(p => p.id === factura.proveedorId)?.razonSocial.toLowerCase().includes(searchLower);
        const matchesId = factura.id?.toString().includes(searchLower);

        return matchesNroFactura || matchesDescripcion || matchesProveedor || matchesId;
      });
    }
    
    setFilteredFacturas(filtered);
  };

  const getProveedorNombre = (proveedorId) => {
    const proveedor = proveedores.find(p => p.id === proveedorId);
    return proveedor ? proveedor.razonSocial : 'Proveedor no encontrado';
  };

  const getStatusBadge = (estado) => {
    const statusConfig = {
      'Pendiente': { class: 'badge-warning', icon: 'clock' },
      'Pagada': { class: 'badge-success', icon: 'check' },
    };

    const config = statusConfig[estado] || { class: 'badge-secondary', icon: 'question' };

    return (
      <span className={`badge ${config.class}`}>
        <i className={`fas fa-${config.icon} mr-1`}></i>
        {estado}
      </span>
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-PE');
  };

  const handleEdit = (factura) => {
    setEditingFactura(factura);
    setShowForm(true);
  };

  const handleDelete = (facturaId, nroFactura) => {
    showConfirm(
      'Confirmar eliminación',
      `¿Está seguro de que desea eliminar la factura "${nroFactura}"? Esta acción no se puede deshacer.`,
      async () => {
        try {
          await invoiceService.delete(facturaId);
          loadData();
          showSuccessModal('Factura eliminada exitosamente', '¡Eliminada!');
        } catch (error) {
          showError(
            'Error al eliminar factura',
            'No se pudo eliminar la factura. Por favor, intente nuevamente.'
          );
        }
      }
    );
  };

  const handleDownload = async (facturaId, nroFactura) => {
    try {
      const blob = await invoiceService.downloadFile(facturaId);
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `factura_${nroFactura}.pdf`;
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      showSuccessModal('Archivo descargado exitosamente', '¡Descarga completa!');
    } catch (error) {
      showError(
        'Error al descargar archivo',
        'No se pudo descargar el archivo. Verifique que la factura tenga un archivo adjunto.'
      );
    }
  };

  const handleFormSubmit = async (facturaData, isWithFile = false) => {
    try {
      if (editingFactura) {
        await invoiceService.update(editingFactura.id, facturaData);
        showSuccessModal('La factura se ha actualizado exitosamente', '¡Actualizada!');
      } else {
        if (isWithFile) {
          await invoiceService.createWithFile(facturaData);
        } else {
          await invoiceService.create(facturaData);
        }
        showSuccessModal('La factura se ha creado exitosamente', '¡Creada!');
      }

      setShowForm(false);
      setEditingFactura(null);
      await loadData();
    } catch (error) {
      throw error;
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingFactura(null);
  };

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredFacturas.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredFacturas.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (showForm) {
    return (
      <InvoiceForm
        factura={editingFactura}
        proveedores={proveedores}
        onSubmit={handleFormSubmit}
        onCancel={handleFormCancel}
      />
    );
  }

  return (
    <>
      <div className="page-inner">
        <div className="page-header">
          <h4 className="page-title">Gestión de Facturas</h4>
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
              <span>Facturas</span>
            </li>
          </ul>
        </div>

        <div className="row">
          <div className="col-md-12">
            <div className="card">
              <div className="card-header">
                <div className="d-flex align-items-center">
                  <h4 className="card-title">Lista de Facturas</h4>
                  <button
                    className="btn btn-primary btn-round ml-auto"
                    onClick={() => setShowForm(true)}
                    disabled={loading}
                  >
                    <i className="fas fa-plus mr-2"></i>
                    Agregar Factura
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
                        placeholder="Buscar por número de factura, descripción o proveedor..."
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
                      <span className="sr-only">Cargando facturas...</span>
                    </div>
                    <p className="mt-2 text-muted">Cargando facturas...</p>
                  </div>
                ) : (
                  <>
                    <div className="table-responsive">
                      <table className="table table-striped table-hover">
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Nº Factura</th>
                            <th>Proveedor</th>
                            <th>Fecha Emisión</th>
                            <th>Fecha Vencimiento</th>
                            <th>Monto</th>
                            <th>Estado</th>
                            <th>Archivo</th>
                            <th>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentItems.length === 0 ? (
                            <tr>
                              <td colSpan="9" className="text-center py-4">
                                <div className="empty-state">
                                  <i className="fas fa-file-invoice fa-3x text-muted mb-3"></i>
                                  <h5 className="text-muted">No se encontraron facturas</h5>
                                  <p className="text-muted">
                                    {searchTerm ? 'Intente con otros términos de búsqueda' : 'Comience agregando una nueva factura'}
                                  </p>
                                  {!searchTerm && (
                                    <button
                                      className="btn btn-primary"
                                      onClick={() => setShowForm(true)}
                                    >
                                      <i className="fas fa-plus mr-2"></i>
                                      Agregar Primera Factura
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ) : (
                            currentItems.map((factura) => (
                              <tr key={factura.id || Math.random()}>
                                <td>
                                  <span className="text-muted">{factura.id || '-'}</span>
                                </td>
                                <td>
                                  <strong className="text-primary">{factura.nroFactura || '-'}</strong>
                                  <br />
                                  <small className="text-muted">{factura.tipoDocumento || 'FACTURA'}</small>
                                </td>
                                <td>
                                  <div style={{
                                    maxWidth: '150px',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                  }} title={getProveedorNombre(factura.proveedorId)}>
                                    {getProveedorNombre(factura.proveedorId)}
                                  </div>
                                </td>
                                <td>{formatDate(factura.fechaEmision)}</td>
                                <td>{formatDate(factura.fechaVencimiento)}</td>
                                <td>
                                  <strong>{formatCurrency(factura.montoTotal)}</strong>
                                  <br />
                                  <small className="text-muted">{factura.moneda || 'PEN'}</small>
                                </td>
                                <td>{getStatusBadge(factura.estadoFactura)}</td>
                                <td>
                                  {factura.nombreArchivo ? (
                                    <div className="d-flex align-items-center">
                                      <i className="fas fa-file-pdf text-danger mr-2" title="Archivo PDF"></i>
                                      <button
                                        type="button"
                                        className="btn btn-link btn-sm p-0 text-primary"
                                        onClick={() => handleDownload(factura.id, factura.nroFactura)}
                                        title={`Descargar ${factura.nombreArchivo}`}
                                        disabled={loading}
                                      >
                                        <i className="fas fa-download mr-1"></i>
                                        Descargar
                                      </button>
                                    </div>
                                  ) : (
                                    <span className="text-muted">
                                      <i className="fas fa-minus-circle mr-1"></i>
                                      Sin archivo
                                    </span>
                                  )}
                                </td>
                                <td>
                                  <div className="form-button-action">
                                    <button
                                      type="button"
                                      className="btn btn-link btn-primary btn-lg"
                                      onClick={() => handleEdit(factura)}
                                      title="Editar Factura"
                                      disabled={loading}
                                    >
                                      <i className="fas fa-edit"></i>
                                    </button>

                                    <button
                                      type="button"
                                      className="btn btn-link btn-danger btn-lg"
                                      onClick={() => handleDelete(factura.id, factura.nroFactura)}
                                      title="Eliminar Factura"
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
                        Mostrando {indexOfFirstItem + 1} a {Math.min(indexOfLastItem, filteredFacturas.length)} de {filteredFacturas.length} facturas
                        {searchTerm && filteredFacturas.length !== facturas.length && (
                          <> (filtradas de {facturas.length} total)</>
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

export default InvoiceList;
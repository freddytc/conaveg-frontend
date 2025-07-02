import React, { useState, useEffect } from 'react';

const InvoiceForm = ({ factura, proveedores, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    nroFactura: '',
    tipoDocumento: 'Factura',
    proveedorId: '',
    fechaEmision: '',
    fechaVencimiento: '',
    montoTotal: '',
    moneda: 'PEN',
    estadoFactura: 'Pendiente',
    descripcion: '',
    observaciones: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (factura) {
      setFormData({
        nroFactura: factura.nroFactura || '',
        tipoDocumento: factura.tipoDocumento || 'Factura',
        proveedorId: factura.proveedorId || '',
        fechaEmision: factura.fechaEmision || '',
        fechaVencimiento: factura.fechaVencimiento || '',
        montoTotal: factura.montoTotal || '',
        moneda: factura.moneda || 'PEN',
        estadoFactura: factura.estadoFactura || 'Pendiente',
        descripcion: factura.descripcion || '',
        observaciones: factura.observaciones || ''
      });
    }
  }, [factura]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpiar error cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Limpiar error general también
    if (errors.general) {
      setErrors(prev => ({
        ...prev,
        general: ''
      }));
    }
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    // Solo permitir números y punto decimal
    const numericValue = value.replace(/[^0-9.]/g, '');
    setFormData(prev => ({
      ...prev,
      [name]: numericValue
    }));

    // Limpiar error
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validación de número de factura
    if (!formData.nroFactura.trim()) {
      newErrors.nroFactura = 'El número de factura es obligatorio';
    } else if (formData.nroFactura.trim().length < 3) {
      newErrors.nroFactura = 'El número de factura debe tener al menos 3 caracteres';
    }

    // Validación de proveedor
    if (!formData.proveedorId) {
      newErrors.proveedorId = 'Debe seleccionar un proveedor';
    }

    // Validación de fecha de emisión
    if (!formData.fechaEmision) {
      newErrors.fechaEmision = 'La fecha de emisión es obligatoria';
    }

    // Validación de fecha de vencimiento
    if (!formData.fechaVencimiento) {
      newErrors.fechaVencimiento = 'La fecha de vencimiento es obligatoria';
    } else if (formData.fechaEmision && new Date(formData.fechaVencimiento) < new Date(formData.fechaEmision)) {
      newErrors.fechaVencimiento = 'La fecha de vencimiento debe ser posterior a la fecha de emisión';
    }

    // Validación de monto
    if (!formData.montoTotal || parseFloat(formData.montoTotal) <= 0) {
      newErrors.montoTotal = 'El monto debe ser mayor a 0';
    }

    // Validación de descripción
    if (!formData.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es obligatoria';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Preparar datos para envío
      const submitData = {
        ...formData,
        proveedorId: parseInt(formData.proveedorId),
        montoTotal: parseFloat(formData.montoTotal)
      };

      await onSubmit(submitData);
    } catch (error) {
      console.error('Error capturado en formulario:', error);
      
      // Limpiar errores previos
      setErrors({});
      
      // Manejar errores específicos
      const errorMessage = error.message || '';
      
      if (errorMessage.includes('nroFactura') && errorMessage.includes('unique')) {
        setErrors({
          nroFactura: 'Ya existe una factura con este número'
        });
      } else if (errorMessage.includes('Duplicate entry') && errorMessage.includes('nro_factura')) {
        setErrors({
          nroFactura: 'Ya existe una factura con este número'
        });
      } else {
        // Error genérico
        setErrors({
          general: 'Ocurrió un error al procesar la solicitud. Verifique que todos los datos sean correctos.'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const getProveedorNombre = (proveedorId) => {
    const proveedor = proveedores.find(p => p.id === parseInt(proveedorId));
    return proveedor ? proveedor.razonSocial : '';
  };

  return (
    <div className="page-inner">
      <div className="page-header">
        <h4 className="page-title">
          {factura ? 'Editar Factura' : 'Nueva Factura'}
        </h4>
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
            <a href="#" onClick={(e) => { e.preventDefault(); onCancel(); }}>
              Facturas
            </a>
          </li>
          <li className="separator">
            <i className="fas fa-chevron-right"></i>
          </li>
          <li className="nav-item">
            <span>{factura ? 'Editar' : 'Nueva'}</span>
          </li>
        </ul>
      </div>

      <div className="row">
        <div className="col-md-12">
          <div className="card">
            <div className="card-header">
              <div className="d-flex align-items-center">
                <h4 className="card-title">
                  {factura ? 'Editar Factura' : 'Agregar Nueva Factura'}
                </h4>
                <button
                  type="button"
                  className="btn btn-secondary btn-round ml-auto mr-2"
                  onClick={onCancel}
                >
                  <i className="fas fa-arrow-left mr-2"></i>
                  Volver
                </button>
              </div>
            </div>

            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  {/* Error general */}
                  {errors.general && (
                    <div className="col-md-12">
                      <div className="alert alert-danger">
                        <i className="fas fa-exclamation-triangle mr-2"></i>
                        {errors.general}
                      </div>
                    </div>
                  )}

                  {/* Información del Documento */}
                  <div className="col-md-12">
                    <h5 className="mb-3">
                      <i className="fas fa-file-invoice mr-2"></i>
                      Información del Documento
                    </h5>
                    <hr />
                  </div>

                  <div className="col-md-4">
                    <div className="form-group">
                      <label htmlFor="tipoDocumento">
                        Tipo de Documento <span className="text-danger">*</span>
                      </label>
                      <select
                        className={`form-control ${errors.tipoDocumento ? 'is-invalid' : ''}`}
                        id="tipoDocumento"
                        name="tipoDocumento"
                        value={formData.tipoDocumento}
                        onChange={handleChange}
                      >
                        <option value="Factura">Factura</option>
                        <option value="Boleta">Boleta</option>
                        <option value="Recibo">Recibo</option>
                      </select>
                      {errors.tipoDocumento && (
                        <div className="invalid-feedback">{errors.tipoDocumento}</div>
                      )}
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="form-group">
                      <label htmlFor="nroFactura">
                        Número de Documento <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control ${errors.nroFactura ? 'is-invalid' : ''}`}
                        id="nroFactura"
                        name="nroFactura"
                        value={formData.nroFactura}
                        onChange={handleChange}
                        placeholder="F001-00000001"
                      />
                      {errors.nroFactura && (
                        <div className="invalid-feedback">{errors.nroFactura}</div>
                      )}
                      <small className="form-text text-muted">
                        Formato: Serie-Número (Ej: F001-00000001)
                      </small>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="form-group">
                      <label htmlFor="estadoFactura">
                        Estado <span className="text-danger">*</span>
                      </label>
                      <select
                        className={`form-control ${errors.estadoFactura ? 'is-invalid' : ''}`}
                        id="estadoFactura"
                        name="estadoFactura"
                        value={formData.estadoFactura}
                        onChange={handleChange}
                      >
                        <option value="Pendiente">Pendiente</option>
                        <option value="Pagada">Pagada</option>
                      </select>
                      {errors.estadoFactura && (
                        <div className="invalid-feedback">{errors.estadoFactura}</div>
                      )}
                    </div>
                  </div>

                  {/* Información del Proveedor */}
                  <div className="col-md-12 mt-4">
                    <h5 className="mb-3">
                      <i className="fas fa-truck mr-2"></i>
                      Información del Proveedor
                    </h5>
                    <hr />
                  </div>

                  <div className="col-md-12">
                    <div className="form-group">
                      <label htmlFor="proveedorId">
                        Proveedor <span className="text-danger">*</span>
                      </label>
                      <select
                        className={`form-control ${errors.proveedorId ? 'is-invalid' : ''}`}
                        id="proveedorId"
                        name="proveedorId"
                        value={formData.proveedorId}
                        onChange={handleChange}
                      >
                        <option value="">Seleccione un proveedor</option>
                        {proveedores.map(proveedor => (
                          <option key={proveedor.id} value={proveedor.id}>
                            {proveedor.razonSocial} - {proveedor.ruc}
                          </option>
                        ))}
                      </select>
                      {errors.proveedorId && (
                        <div className="invalid-feedback">{errors.proveedorId}</div>
                      )}
                      {formData.proveedorId && (
                        <small className="form-text text-muted">
                          Proveedor seleccionado: {getProveedorNombre(formData.proveedorId)}
                        </small>
                      )}
                    </div>
                  </div>

                  {/* Información de Fechas y Montos */}
                  <div className="col-md-12 mt-4">
                    <h5 className="mb-3">
                      <i className="fas fa-calendar-alt mr-2"></i>
                      Fechas y Montos
                    </h5>
                    <hr />
                  </div>

                  <div className="col-md-4">
                    <div className="form-group">
                      <label htmlFor="fechaEmision">
                        Fecha de Emisión <span className="text-danger">*</span>
                      </label>
                      <input
                        type="date"
                        className={`form-control ${errors.fechaEmision ? 'is-invalid' : ''}`}
                        id="fechaEmision"
                        name="fechaEmision"
                        value={formData.fechaEmision}
                        onChange={handleChange}
                      />
                      {errors.fechaEmision && (
                        <div className="invalid-feedback">{errors.fechaEmision}</div>
                      )}
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="form-group">
                      <label htmlFor="fechaVencimiento">
                        Fecha de Vencimiento <span className="text-danger">*</span>
                      </label>
                      <input
                        type="date"
                        className={`form-control ${errors.fechaVencimiento ? 'is-invalid' : ''}`}
                        id="fechaVencimiento"
                        name="fechaVencimiento"
                        value={formData.fechaVencimiento}
                        onChange={handleChange}
                      />
                      {errors.fechaVencimiento && (
                        <div className="invalid-feedback">{errors.fechaVencimiento}</div>
                      )}
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="form-group">
                      <label htmlFor="moneda">
                        Moneda <span className="text-danger">*</span>
                      </label>
                      <select
                        className={`form-control ${errors.moneda ? 'is-invalid' : ''}`}
                        id="moneda"
                        name="moneda"
                        value={formData.moneda}
                        onChange={handleChange}
                      >
                        <option value="PEN">Soles (PEN)</option>
                        <option value="USD">Dólares (USD)</option>
                        <option value="EUR">Euros (EUR)</option>
                      </select>
                      {errors.moneda && (
                        <div className="invalid-feedback">{errors.moneda}</div>
                      )}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="montoTotal">
                        Monto Total <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <div className="input-group-prepend">
                          <span className="input-group-text">
                            {formData.moneda === 'USD' ? '$' : formData.moneda === 'EUR' ? '€' : 'S/'}
                          </span>
                        </div>
                        <input
                          type="text"
                          className={`form-control ${errors.montoTotal ? 'is-invalid' : ''}`}
                          id="montoTotal"
                          name="montoTotal"
                          value={formData.montoTotal}
                          onChange={handleNumberChange}
                          placeholder="0.00"
                        />
                        {errors.montoTotal && (
                          <div className="invalid-feedback">{errors.montoTotal}</div>
                        )}
                      </div>
                      <small className="form-text text-muted">
                        Ingrese solo números y punto decimal
                      </small>
                    </div>
                  </div>

                  {/* Descripción y Observaciones */}
                  <div className="col-md-12 mt-4">
                    <h5 className="mb-3">
                      <i className="fas fa-align-left mr-2"></i>
                      Descripción y Observaciones
                    </h5>
                    <hr />
                  </div>

                  <div className="col-md-12">
                    <div className="form-group">
                      <label htmlFor="descripcion">
                        Descripción <span className="text-danger">*</span>
                      </label>
                      <textarea
                        className={`form-control ${errors.descripcion ? 'is-invalid' : ''}`}
                        id="descripcion"
                        name="descripcion"
                        value={formData.descripcion}
                        onChange={handleChange}
                        placeholder="Descripción de los productos o servicios facturados"
                        rows="3"
                      />
                      {errors.descripcion && (
                        <div className="invalid-feedback">{errors.descripcion}</div>
                      )}
                    </div>
                  </div>

                  <div className="col-md-12">
                    <div className="form-group">
                      <label htmlFor="observaciones">
                        Observaciones
                      </label>
                      <textarea
                        className="form-control"
                        id="observaciones"
                        name="observaciones"
                        value={formData.observaciones}
                        onChange={handleChange}
                        placeholder="Observaciones adicionales (opcional)"
                        rows="2"
                      />
                      <small className="form-text text-muted">
                        Campo opcional para notas adicionales
                      </small>
                    </div>
                  </div>

                  {/* Resumen de la factura */}
                  {formData.nroFactura && formData.montoTotal && (
                    <div className="col-md-12 mt-3">
                      <div className="alert alert-info">
                        <i className="fas fa-info-circle mr-2"></i>
                        <strong>Resumen:</strong> {formData.tipoDocumento} {formData.nroFactura} por{' '}
                        {formData.moneda === 'USD' ? '$' : formData.moneda === 'EUR' ? '€' : 'S/'}{formData.montoTotal}{' '}
                        - Estado: {formData.estadoFactura}
                      </div>
                    </div>
                  )}
                </div>

                {/* Botones de acción */}
                <div className="card-action">
                  <div className="d-flex justify-content-end">
                    <button
                      type="button"
                      className="btn btn-secondary mr-3"
                      onClick={onCancel}
                      disabled={loading}
                    >
                      <i className="fas fa-times mr-2"></i>
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm mr-2" role="status"></span>
                          {factura ? 'Actualizando...' : 'Creando...'}
                        </>
                      ) : (
                        <>
                          <i className={`fas ${factura ? 'fa-save' : 'fa-plus'} mr-2`}></i>
                          {factura ? 'Actualizar Factura' : 'Crear Factura'}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceForm;
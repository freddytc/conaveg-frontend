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
    descripcion: ''
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadWithFile, setUploadWithFile] = useState(false);
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
        descripcion: factura.descripcion || ''
      });
    }
  }, [factura]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (errors.general) {
      setErrors(prev => ({ ...prev, general: '' }));
    }
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    const numericValue = value.replace(/[^0-9.]/g, '');
    setFormData(prev => ({ ...prev, [name]: numericValue }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setErrors(prev => ({ ...prev, file: 'Solo se permiten archivos PDF' }));
        setSelectedFile(null);
        return;
      }

      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        setErrors(prev => ({ ...prev, file: 'El archivo no puede superar los 10MB' }));
        setSelectedFile(null);
        return;
      }

      setSelectedFile(file);
      setErrors(prev => ({ ...prev, file: '' }));
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setErrors(prev => ({ ...prev, file: '' }));
    // Limpiar el input file
    const fileInput = document.getElementById('file');
    if (fileInput) {
      fileInput.value = '';
    }
  };


  const validateForm = () => {
    const newErrors = {};

    if (!formData.nroFactura.trim()) {
      newErrors.nroFactura = 'El número de factura es obligatorio';
    } else if (formData.nroFactura.trim().length < 3) {
      newErrors.nroFactura = 'El número de factura debe tener al menos 3 caracteres';
    }

    if (!formData.proveedorId) {
      newErrors.proveedorId = 'Debe seleccionar un proveedor';
    }

    if (!formData.fechaEmision) {
      newErrors.fechaEmision = 'La fecha de emisión es obligatoria';
    }

    if (!formData.fechaVencimiento) {
      newErrors.fechaVencimiento = 'La fecha de vencimiento es obligatoria';
    } else if (formData.fechaEmision && new Date(formData.fechaVencimiento) < new Date(formData.fechaEmision)) {
      newErrors.fechaVencimiento = 'La fecha de vencimiento debe ser posterior a la fecha de emisión';
    }

    if (!formData.montoTotal || parseFloat(formData.montoTotal) <= 0) {
      newErrors.montoTotal = 'El monto debe ser mayor a 0';
    }

    if (!formData.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es obligatoria';
    }

    // Solo validar archivo si es nueva factura Y se eligió subir archivo
    if (!factura && uploadWithFile && !selectedFile) {
      newErrors.file = 'Debe seleccionar un archivo PDF';
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
      // Si es nueva factura Y se eligió subir archivo
      if (!factura && uploadWithFile && selectedFile) {
        const formDataToSend = new FormData();

        formDataToSend.append('file', selectedFile);
        formDataToSend.append('proveedorId', formData.proveedorId.toString());
        formDataToSend.append('usuarioId', '1');
        formDataToSend.append('nroFactura', formData.nroFactura.trim());
        formDataToSend.append('tipoDocumento', formData.tipoDocumento);
        formDataToSend.append('fechaEmision', formData.fechaEmision);
        formDataToSend.append('fechaVencimiento', formData.fechaVencimiento);
        formDataToSend.append('montoTotal', Math.round(parseFloat(formData.montoTotal) * 100).toString());
        formDataToSend.append('moneda', formData.moneda);
        formDataToSend.append('descripcion', formData.descripcion.trim());
        formDataToSend.append('estadoFactura', formData.estadoFactura);

        await onSubmit(formDataToSend, true);
      } else {
        // Factura sin archivo (nueva o edición)
        const submitData = {
          ...formData,
          proveedorId: parseInt(formData.proveedorId),
          montoTotal: parseFloat(formData.montoTotal)
        };

        await onSubmit(submitData, false);
      }
    } catch (error) {
      setErrors({});

      const errorMessage = error.message || '';
      if (errorMessage.includes('nroFactura') || errorMessage.includes('Duplicate entry')) {
        setErrors({ nroFactura: 'Ya existe una factura con este número' });
      } else {
        setErrors({ general: 'Ocurrió un error al procesar la solicitud.' });
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

                  {/* Sección de archivo - SOLO para nuevas facturas */}
                  {!factura && (
                    <div className="col-md-12 mb-3">
                      <div className="form-group">
                        <div className="d-flex align-items-center mb-2">
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id="uploadWithFile"
                              checked={uploadWithFile}
                              onChange={(e) => setUploadWithFile(e.target.checked)}
                            />
                            <label className="form-check-label" htmlFor="uploadWithFile">
                              <i className="fas fa-paperclip mr-1"></i>
                              Adjuntar archivo PDF
                            </label>
                          </div>
                          {uploadWithFile && (
                            <div className="mt-3">
                              <div className="form-group">
                                <label htmlFor="file">
                                  Seleccionar archivo PDF <span className="text-danger">*</span>
                                </label>
                                <div className="d-flex align-items-center">
                                  <input
                                    type="file"
                                    className={`form-control-file flex-grow-1 ${errors.file ? 'is-invalid' : ''}`}
                                    id="file"
                                    accept=".pdf"
                                    onChange={handleFileChange}
                                  />
                                  {selectedFile && (
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-danger ml-2"
                                      onClick={handleRemoveFile}
                                      title="Quitar archivo"
                                    >
                                      <i className="fas fa-times text-white"></i>
                                    </button>
                                  )}
                                </div>
                                {errors.file && (
                                  <div className="invalid-feedback d-block">{errors.file}</div>
                                )}
                                <small className="form-text text-muted">
                                  Solo archivos PDF, máximo 10MB
                                </small>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Mostrar archivo existente - SOLO para facturas en edición */}
                  {factura && factura.nombreArchivo && (
                    <div className="col-md-12 mb-4">
                      <div className="alert alert-info">
                        <i className="fas fa-file-pdf mr-2"></i>
                        <strong>Archivo adjunto:</strong> {factura.nombreArchivo}
                        <small className="d-block mt-1 text-muted">
                        </small>
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

                  {/* Proveedor */}
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

                  {/* Fechas y Montos */}
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

                  {/* Descripción */}
                  <div className="col-md-12 mt-4">
                    <h5 className="mb-3">
                      <i className="fas fa-align-left mr-2"></i>
                      Descripción
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

                  {/* Resumen */}
                  {formData.nroFactura && formData.montoTotal && (
                    <div className="col-md-12 mt-3">
                      <div className="alert alert-info">
                        <i className="fas fa-info-circle mr-2"></i>
                        <strong>Resumen:</strong> {formData.tipoDocumento} {formData.nroFactura} por{' '}
                        {formData.moneda === 'USD' ? '$' : formData.moneda === 'EUR' ? '€' : 'S/'}{formData.montoTotal}{' '}
                        - Estado: {formData.estadoFactura}
                        {!factura && uploadWithFile && selectedFile && (
                          <><br /><strong>Archivo:</strong> {selectedFile.name}</>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Botones */}
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
                      className="btn btn-success"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm mr-2" role="status"></span>
                          {factura ? 'Actualizando...' : (!factura && uploadWithFile) ? 'Subiendo...' : 'Creando...'}
                        </>
                      ) : (
                        <>
                          <i className={`fas ${factura ? 'fa-save' : (!factura && uploadWithFile) ? 'fa-upload' : 'fa-plus'} mr-2`}></i>
                          {factura ? 'Actualizar Factura' : (!factura && uploadWithFile) ? 'Crear con Archivo' : 'Crear Factura'}
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
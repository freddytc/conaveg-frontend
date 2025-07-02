import React, { useState, useEffect } from 'react';

const ProveedorForm = ({ proveedor, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    ruc: '',
    razonSocial: '',
    direccion: '',
    telefono: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (proveedor) {
      setFormData({
        ruc: proveedor.ruc || '',
        razonSocial: proveedor.razonSocial || '',
        direccion: proveedor.direccion || '',
        telefono: proveedor.telefono || ''
      });
    }
  }, [proveedor]);

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

  const validateRuc = (ruc) => {
    // Validación para RUC: debe tener entre 8 y 15 caracteres alfanuméricos
    const rucPattern = /^[A-Za-z0-9]{8,15}$/;
    return rucPattern.test(ruc);
  };

  const validatePhone = (phone) => {
    // Validación básica de teléfono (7-15 dígitos, puede incluir espacios, guiones y paréntesis)
    const phonePattern = /^[\d\s\-\(\)\+]{7,15}$/;
    return phonePattern.test(phone.replace(/\s/g, ''));
  };

  const validateForm = () => {
    const newErrors = {};

    // Validación de RUC
    if (!formData.ruc.trim()) {
      newErrors.ruc = 'El RUC es obligatorio';
    } else if (!validateRuc(formData.ruc.trim())) {
      newErrors.ruc = 'El RUC debe tener entre 8 y 15 caracteres alfanuméricos';
    }

    // Validación de Razón Social
    if (!formData.razonSocial.trim()) {
      newErrors.razonSocial = 'La razón social es obligatoria';
    } else if (formData.razonSocial.trim().length < 3) {
      newErrors.razonSocial = 'La razón social debe tener al menos 3 caracteres';
    }

    // Validación de Dirección
    if (!formData.direccion.trim()) {
      newErrors.direccion = 'La dirección es obligatoria';
    } else if (formData.direccion.trim().length < 10) {
      newErrors.direccion = 'La dirección debe tener al menos 10 caracteres';
    }

    // Validación de Teléfono
    if (!formData.telefono.trim()) {
      newErrors.telefono = 'El teléfono es obligatorio';
    } else if (!validatePhone(formData.telefono.trim())) {
      newErrors.telefono = 'El formato del teléfono no es válido';
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
      await onSubmit(formData);
    } catch (error) {
      console.error('Error capturado en formulario:', error);
      
      // Limpiar errores previos
      setErrors({});
      
      // Manejar errores específicos
      const errorMessage = error.message || '';
      
      if (errorMessage.includes('ruc') && errorMessage.includes('unique')) {
        setErrors({
          ruc: 'Ya existe un proveedor con este RUC en el sistema'
        });
      } else if (errorMessage.includes('Duplicate entry') && errorMessage.includes('ruc')) {
        setErrors({
          ruc: 'Ya existe un proveedor con este RUC en el sistema'
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

  const formatRuc = (value) => {
    // Permitir letras y números, remover caracteres especiales
    const formatted = value.replace(/[^A-Za-z0-9]/g, '');
    return formatted.slice(0, 15); // Máximo 15 caracteres
  };

  const handleRucChange = (e) => {
    const formatted = formatRuc(e.target.value);
    setFormData(prev => ({
      ...prev,
      ruc: formatted
    }));

    // Limpiar error cuando el usuario empiece a escribir
    if (errors.ruc) {
      setErrors(prev => ({
        ...prev,
        ruc: ''
      }));
    }
  };

  return (
    <div className="page-inner">
      <div className="page-header">
        <h4 className="page-title">
          {proveedor ? 'Editar Proveedor' : 'Nuevo Proveedor'}
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
              Proveedores
            </a>
          </li>
          <li className="separator">
            <i className="fas fa-chevron-right"></i>
          </li>
          <li className="nav-item">
            <span>{proveedor ? 'Editar' : 'Nuevo'}</span>
          </li>
        </ul>
      </div>

      <div className="row">
        <div className="col-md-12">
          <div className="card">
            <div className="card-header">
              <div className="d-flex align-items-center">
                <h4 className="card-title">
                  {proveedor ? 'Editar Proveedor' : 'Agregar Nuevo Proveedor'}
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

                  {/* Información Fiscal */}
                  <div className="col-md-12">
                    <h5 className="mb-3">
                      <i className="fas fa-file-alt mr-2"></i>
                      Información Fiscal
                    </h5>
                    <hr />
                  </div>

                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="ruc">
                        RUC <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control ${errors.ruc ? 'is-invalid' : ''}`}
                        id="ruc"
                        name="ruc"
                        value={formData.ruc}
                        onChange={handleRucChange}
                        placeholder="20123456789"
                        maxLength="15"
                      />
                      {errors.ruc && (
                        <div className="invalid-feedback">{errors.ruc}</div>
                      )}
                      <small className="form-text text-muted">
                        Ingrese el RUC (8-15 caracteres)
                      </small>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="razonSocial">
                        Razón Social <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control ${errors.razonSocial ? 'is-invalid' : ''}`}
                        id="razonSocial"
                        name="razonSocial"
                        value={formData.razonSocial}
                        onChange={handleChange}
                        placeholder="Nombre o razón social del proveedor"
                      />
                      {errors.razonSocial && (
                        <div className="invalid-feedback">{errors.razonSocial}</div>
                      )}
                    </div>
                  </div>

                  {/* Información de Contacto */}
                  <div className="col-md-12 mt-4">
                    <h5 className="mb-3">
                      <i className="fas fa-address-book mr-2"></i>
                      Información de Contacto
                    </h5>
                    <hr />
                  </div>

                  <div className="col-md-8">
                    <div className="form-group">
                      <label htmlFor="direccion">
                        Dirección <span className="text-danger">*</span>
                      </label>
                      <textarea
                        className={`form-control ${errors.direccion ? 'is-invalid' : ''}`}
                        id="direccion"
                        name="direccion"
                        value={formData.direccion}
                        onChange={handleChange}
                        placeholder="Dirección completa del proveedor"
                        rows="3"
                      />
                      {errors.direccion && (
                        <div className="invalid-feedback">{errors.direccion}</div>
                      )}
                      <small className="form-text text-muted">
                        Incluya calle, número, ciudad
                      </small>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="form-group">
                      <label htmlFor="telefono">
                        Teléfono <span className="text-danger">*</span>
                      </label>
                      <input
                        type="tel"
                        className={`form-control ${errors.telefono ? 'is-invalid' : ''}`}
                        id="telefono"
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleChange}
                        placeholder="Ej: (01) 123-4567 o 987-654-321"
                      />
                      {errors.telefono && (
                        <div className="invalid-feedback">{errors.telefono}</div>
                      )}
                      <small className="form-text text-muted">
                        Teléfono fijo o celular de contacto
                      </small>
                    </div>
                  </div>

                  {/* Información adicional del proveedor */}
                  {formData.ruc && formData.razonSocial && (
                    <div className="col-md-12 mt-3">
                      <div className="alert alert-info">
                        <i className="fas fa-info-circle mr-2"></i>
                        <strong>Proveedor:</strong> {formData.razonSocial} - RUC: {formData.ruc}
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
                          {proveedor ? 'Actualizando...' : 'Creando...'}
                        </>
                      ) : (
                        <>
                          <i className={`fas ${proveedor ? 'fa-save' : 'fa-plus'} mr-2`}></i>
                          {proveedor ? 'Actualizar Proveedor' : 'Crear Proveedor'}
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

export default ProveedorForm;
import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

const InventoryForm = ({ item, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    categoriaId: '',
    codigo: '',
    nombre: '',
    descripcion: '',
    marca: '',
    modelo: '',
    nroSerie: '',
    stock: '0',
    unidadMedida: 'Unidad',
    fechaAquisicion: '',
    estadoConservacion: 'Bueno'
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [loadingCategorias, setLoadingCategorias] = useState(true);

  // Cargar categorías al montar el componente
  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        setLoadingCategorias(true);

        // Usar api.get
        const data = await api.get('/categorias-inventario');
        setCategorias(data);

      } catch (error) {
        console.error('Error al cargar categorías:', error);

        setCategorias([]);

      } finally {
        setLoadingCategorias(false);
      }
    };

    fetchCategorias();
  }, []);

  useEffect(() => {
    if (item) {
      setFormData({
        categoriaId: item.categoriaId || '',
        codigo: item.codigo || '',
        nombre: item.nombre || '',
        descripcion: item.descripcion || '',
        marca: item.marca || '',
        modelo: item.modelo || '',
        nroSerie: item.nroSerie || '',
        stock: item.stock?.toString() || '0',
        unidadMedida: item.unidadMedida || 'UNIDAD', // Mantener valor por defecto
        fechaAquisicion: item.fechaAquisicion ? item.fechaAquisicion.split('T')[0] : '',
        estadoConservacion: item.estadoConservacion || 'BUENO'
      });
    }
  }, [item]);

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

  const validateForm = () => {
    const newErrors = {};

    // Validaciones obligatorias
    if (!formData.codigo.trim()) {
      newErrors.codigo = 'El código del producto es obligatorio';
    } else if (formData.codigo.trim().length < 2) {
      newErrors.codigo = 'El código debe tener al menos 2 caracteres';
    }

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre del producto es obligatorio';
    } else if (formData.nombre.trim().length < 3) {
      newErrors.nombre = 'El nombre debe tener al menos 3 caracteres';
    }

    if (!formData.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es obligatoria';
    } else if (formData.descripcion.trim().length < 10) {
      newErrors.descripcion = 'La descripción debe tener al menos 10 caracteres';
    }

    if (!formData.marca.trim()) {
      newErrors.marca = 'La marca es obligatoria';
    }

    if (!formData.stock || formData.stock === '') {
      newErrors.stock = 'El stock es obligatorio';
    } else if (parseInt(formData.stock) < 0) {
      newErrors.stock = 'El stock no puede ser negativo';
    }

    if (!formData.unidadMedida.trim()) {
      newErrors.unidadMedida = 'La unidad de medida es obligatoria';
    }

    if (!formData.fechaAquisicion) {
      newErrors.fechaAquisicion = 'La fecha de adquisición es obligatoria';
    } else {
      // Validar que la fecha no sea futura
      const fechaAquisicion = new Date(formData.fechaAquisicion);
      const hoy = new Date();
      hoy.setHours(23, 59, 59, 999); // Hasta el final del día

      if (fechaAquisicion > hoy) {
        newErrors.fechaAquisicion = 'La fecha de adquisición no puede ser futura';
      }
    }

    if (!formData.estadoConservacion.trim()) {
      newErrors.estadoConservacion = 'El estado de conservación es obligatorio';
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
      console.error('Mensaje del error:', error.message);

      // Limpiar errores previos
      setErrors({});

      // Manejar errores específicos
      const errorMessage = error.message || '';

      if (errorMessage === 'DUPLICATE_CODE') {
        setErrors({
          codigo: 'Ya existe un producto con este código en el sistema'
        });
      } else if (errorMessage === 'DUPLICATE_SERIAL') {
        setErrors({
          nroSerie: 'Ya existe un producto con este número de serie en el sistema'
        });
      } else if (errorMessage === 'DUPLICATE_ENTRY') {
        setErrors({
          general: 'Ya existe un producto con estos datos en el sistema'
        });
      } else if (errorMessage.includes('inventario_codigo_unique') ||
        errorMessage.includes('codigo_unique') ||
        (errorMessage.includes('Duplicate entry') && errorMessage.includes('codigo'))) {
        setErrors({
          codigo: 'Ya existe un producto con este código en el sistema'
        });
      } else if (errorMessage.includes('inventario_nro_serie_unique') ||
        errorMessage.includes('nro_serie_unique') ||
        (errorMessage.includes('Duplicate entry') && errorMessage.includes('nro_serie'))) {
        setErrors({
          nroSerie: 'Ya existe un producto con este número de serie en el sistema'
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

  // Generar código automático basado en nombre y marca
  const generateCode = () => {
    if (formData.nombre && formData.marca) {
      const nombrePart = formData.nombre.substring(0, 3).toUpperCase();
      const marcaPart = formData.marca.substring(0, 3).toUpperCase();
      const randomPart = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      const generatedCode = `${nombrePart}${marcaPart}${randomPart}`;

      setFormData(prev => ({
        ...prev,
        codigo: generatedCode
      }));
    }
  };

  return (
    <div className="page-inner">
      <div className="page-header">
        <h4 className="page-title">
          {item ? 'Editar Producto' : 'Nuevo Producto'}
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
              Inventario
            </a>
          </li>
          <li className="separator">
            <i className="fas fa-chevron-right"></i>
          </li>
          <li className="nav-item">
            <span>{item ? 'Editar' : 'Nuevo'}</span>
          </li>
        </ul>
      </div>

      <div className="row">
        <div className="col-md-12">
          <div className="card">
            <div className="card-header">
              <div className="d-flex align-items-center">
                <h4 className="card-title">
                  {item ? 'Editar Producto' : 'Agregar Nuevo Producto'}
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

                  {/* Información Básica del Producto */}
                  <div className="col-md-12">
                    <h5 className="mb-3">
                      <i className="fas fa-box mr-2"></i>
                      Información Básica
                    </h5>
                    <hr />
                  </div>

                  {/* Categoría - Ahora como selector */}
                  <div className="col-md-4">
                    <div className="form-group">
                      <label htmlFor="categoriaId">
                        Categoría
                      </label>
                      <select
                        className={`form-control ${errors.categoriaId ? 'is-invalid' : ''}`}
                        id="categoriaId"
                        name="categoriaId"
                        value={formData.categoriaId}
                        onChange={handleChange}
                        disabled={loadingCategorias}
                      >
                        <option value="">
                          {loadingCategorias ? 'Cargando categorías...' : 'Sin categoría'}
                        </option>
                        {categorias.map(categoria => (
                          <option key={categoria.id} value={categoria.id}>
                            {categoria.nombre} - {categoria.descripcion}
                          </option>
                        ))}
                      </select>
                      {errors.categoriaId && (
                        <div className="invalid-feedback">{errors.categoriaId}</div>
                      )}
                      <small className="form-text text-muted">
                        Seleccione una categoría para clasificar el producto
                      </small>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="form-group">
                      <label htmlFor="codigo">
                        Código del Producto <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <input
                          type="text"
                          className={`form-control ${errors.codigo ? 'is-invalid' : ''}`}
                          id="codigo"
                          name="codigo"
                          value={formData.codigo}
                          onChange={handleChange}
                          placeholder="Ej: INV-0001"
                        />
                      </div>
                      {errors.codigo && (
                        <div className="invalid-feedback">{errors.codigo}</div>
                      )}
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="form-group">
                      <label htmlFor="nombre">
                        Nombre del Producto <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control ${errors.nombre ? 'is-invalid' : ''}`}
                        id="nombre"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        placeholder="Ingrese el nombre del producto"
                      />
                      {errors.nombre && (
                        <div className="invalid-feedback">{errors.nombre}</div>
                      )}
                    </div>
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
                        placeholder="Ingrese una descripción detallada del producto"
                        rows="3"
                      />
                      {errors.descripcion && (
                        <div className="invalid-feedback">{errors.descripcion}</div>
                      )}
                    </div>
                  </div>

                  {/* Especificaciones del Producto */}
                  <div className="col-md-12 mt-4">
                    <h5 className="mb-3">
                      <i className="fas fa-tags mr-2"></i>
                      Especificaciones
                    </h5>
                    <hr />
                  </div>

                  <div className="col-md-4">
                    <div className="form-group">
                      <label htmlFor="marca">
                        Marca <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control ${errors.marca ? 'is-invalid' : ''}`}
                        id="marca"
                        name="marca"
                        value={formData.marca}
                        onChange={handleChange}
                      />
                      {errors.marca && (
                        <div className="invalid-feedback">{errors.marca}</div>
                      )}
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="form-group">
                      <label htmlFor="modelo">
                        Modelo
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="modelo"
                        name="modelo"
                        value={formData.modelo}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="form-group">
                      <label htmlFor="nroSerie">
                        Número de Serie
                      </label>
                      <input
                        type="text"
                        className={`form-control ${errors.nroSerie ? 'is-invalid' : ''}`}
                        id="nroSerie"
                        name="nroSerie"
                        value={formData.nroSerie}
                        onChange={handleChange}
                      />
                      {errors.nroSerie && (
                        <div className="invalid-feedback">{errors.nroSerie}</div>
                      )}
                    </div>
                  </div>

                  {/* Inventario y Estado */}
                  <div className="col-md-12 mt-4">
                    <h5 className="mb-3">
                      <i className="fas fa-warehouse mr-2"></i>
                      Inventario y Estado
                    </h5>
                    <hr />
                  </div>

                  <div className="col-md-3">
                    <div className="form-group">
                      <label htmlFor="stock">
                        Cantidad/Stock <span className="text-danger">*</span>
                      </label>
                      <input
                        type="number"
                        className={`form-control ${errors.stock ? 'is-invalid' : ''}`}
                        id="stock"
                        name="stock"
                        value={formData.stock}
                        onChange={handleChange}
                        min="0"
                        placeholder="0"
                      />
                      {errors.stock && (
                        <div className="invalid-feedback">{errors.stock}</div>
                      )}
                    </div>
                  </div>

                  <div className="col-md-3">
                    <div className="form-group">
                      <label htmlFor="unidadMedida">
                        Unidad de Medida <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control ${errors.unidadMedida ? 'is-invalid' : ''}`}
                        id="unidadMedida"
                        name="unidadMedida"
                        value={formData.unidadMedida}
                        onChange={handleChange}
                        placeholder="Ej: UNIDAD, PIEZA, KG, LITROS"
                      />
                      {errors.unidadMedida && (
                        <div className="invalid-feedback">{errors.unidadMedida}</div>
                      )}
                    </div>
                  </div>

                  <div className="col-md-3">
                    <div className="form-group">
                      <label htmlFor="fechaAquisicion">
                        Fecha de Adquisición <span className="text-danger">*</span>
                      </label>
                      <input
                        type="date"
                        className={`form-control ${errors.fechaAquisicion ? 'is-invalid' : ''}`}
                        id="fechaAquisicion"
                        name="fechaAquisicion"
                        value={formData.fechaAquisicion}
                        onChange={handleChange}
                        max={new Date().toISOString().split('T')[0]}
                      />
                      {errors.fechaAquisicion && (
                        <div className="invalid-feedback">{errors.fechaAquisicion}</div>
                      )}
                    </div>
                  </div>

                  <div className="col-md-3">
                    <div className="form-group">
                      <label htmlFor="estadoConservacion">
                        Estado de Conservación <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control ${errors.estadoConservacion ? 'is-invalid' : ''}`}
                        id="estadoConservacion"
                        name="estadoConservacion"
                        value={formData.estadoConservacion}
                        onChange={handleChange}
                      />
                      {errors.estadoConservacion && (
                        <div className="invalid-feedback">{errors.estadoConservacion}</div>
                      )}
                    </div>
                  </div>

                  {/* Información adicional sobre valor del inventario */}
                  {formData.stock && formData.stock > 0 && (
                    <div className="col-md-12">
                      <div className="alert alert-info" style={{ backgroundColor: '#1e1e2e', borderColor: '#1e1e2e', color: '#fff' }}>
                        <i className="fas fa-info-circle mr-2"></i>
                        <strong>Stock total:</strong> {formData.stock} {formData.unidadMedida ? formData.unidadMedida.toLowerCase() : 'unidades'}
                        {formData.categoriaId && categorias.find(c => c.id == formData.categoriaId) && (
                          <span className="ml-3">
                            <strong>Categoría:</strong> {categorias.find(c => c.id == formData.categoriaId)?.nombre}
                          </span>
                        )}
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
                      className="btn btn-success"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm mr-2" role="status"></span>
                          {item ? 'Actualizando...' : 'Creando...'}
                        </>
                      ) : (
                        <>
                          <i className={`fas ${item ? 'fa-save' : 'fa-plus'} mr-2`}></i>
                          {item ? 'Actualizar Producto' : 'Crear Producto'}
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

export default InventoryForm;
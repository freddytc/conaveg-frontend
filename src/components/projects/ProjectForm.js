import React, { useState, useEffect } from 'react';

const ProjectForm = ({ project, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    ubicacion: '',
    fechaInicio: '',
    fechaFin: '',
    estadoProyecto: 'En ejecución'
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (project) {
      setFormData({
        nombre: project.nombre || '',
        descripcion: project.descripcion || '',
        ubicacion: project.ubicacion || '',
        fechaInicio: project.fechaInicio ? project.fechaInicio.split('T')[0] : '',
        fechaFin: project.fechaFin ? project.fechaFin.split('T')[0] : '',
        estadoProyecto: project.estadoProyecto || 'PLANIFICADO'
      });
    }
  }, [project]);

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
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre del proyecto es obligatorio';
    } else if (formData.nombre.trim().length < 3) {
      newErrors.nombre = 'El nombre debe tener al menos 3 caracteres';
    }

    if (!formData.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es obligatoria';
    } else if (formData.descripcion.trim().length < 10) {
      newErrors.descripcion = 'La descripción debe tener al menos 10 caracteres';
    }

    if (!formData.ubicacion.trim()) {
      newErrors.ubicacion = 'La ubicación es obligatoria';
    }

    if (!formData.fechaInicio) {
      newErrors.fechaInicio = 'La fecha de inicio es obligatoria';
    }

    if (!formData.fechaFin) {
      newErrors.fechaFin = 'La fecha de fin es obligatoria';
    } else if (formData.fechaInicio && formData.fechaFin) {
      // Validar que la fecha fin sea posterior a la fecha inicio
      const fechaInicio = new Date(formData.fechaInicio);
      const fechaFin = new Date(formData.fechaFin);

      if (fechaFin <= fechaInicio) {
        newErrors.fechaFin = 'La fecha de fin debe ser posterior a la fecha de inicio';
      }
    }

    if (!formData.estadoProyecto.trim()) {
      newErrors.estadoProyecto = 'El estado del proyecto es obligatorio';
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

      if (errorMessage === 'DUPLICATE_NAME') {
        setErrors({
          nombre: 'Ya existe un proyecto con este nombre en el sistema'
        });
      } else if (errorMessage === 'DUPLICATE_ENTRY') {
        setErrors({
          general: 'Ya existe un proyecto con estos datos en el sistema'
        });
      } else if (errorMessage.includes('proyectos_nombre_unique') ||
        errorMessage.includes('nombre_unique') ||
        (errorMessage.includes('Duplicate entry') && errorMessage.includes('nombre'))) {
        setErrors({
          nombre: 'Ya existe un proyecto con este nombre en el sistema'
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

  return (
    <div className="page-inner">
      <div className="page-header">
        <h4 className="page-title">
          {project ? 'Editar Proyecto' : 'Nuevo Proyecto'}
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
              Proyectos
            </a>
          </li>
          <li className="separator">
            <i className="fas fa-chevron-right"></i>
          </li>
          <li className="nav-item">
            <span>{project ? 'Editar' : 'Nuevo'}</span>
          </li>
        </ul>
      </div>

      <div className="row">
        <div className="col-md-12">
          <div className="card">
            <div className="card-header">
              <div className="d-flex align-items-center">
                <h4 className="card-title">
                  {project ? 'Editar Proyecto' : 'Crear Nuevo Proyecto'}
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

                  {/* Información General del Proyecto */}
                  <div className="col-md-12">
                    <h5 className="mb-3">
                      <i className="fas fa-project-diagram mr-2"></i>
                      Información General
                    </h5>
                    <hr />
                  </div>

                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="nombre">
                        Nombre del Proyecto <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control ${errors.nombre ? 'is-invalid' : ''}`}
                        id="nombre"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        placeholder="Ingrese el nombre del proyecto"
                      />
                      {errors.nombre && (
                        <div className="invalid-feedback">{errors.nombre}</div>
                      )}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="ubicacion">
                        Ubicación <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control ${errors.ubicacion ? 'is-invalid' : ''}`}
                        id="ubicacion"
                        name="ubicacion"
                        value={formData.ubicacion}
                        onChange={handleChange}
                        placeholder="Ingrese la ubicación del proyecto"
                      />
                      {errors.ubicacion && (
                        <div className="invalid-feedback">{errors.ubicacion}</div>
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
                        placeholder="Ingrese una descripción del proyecto"
                        rows="4"
                      />
                      {errors.descripcion && (
                        <div className="invalid-feedback">{errors.descripcion}</div>
                      )}
                    </div>
                  </div>

                  {/* Fechas y Estado */}
                  <div className="col-md-12 mt-4">
                    <h5 className="mb-3">
                      <i className="fas fa-calendar-alt mr-2"></i>
                      Planificación y Estado
                    </h5>
                    <hr />
                  </div>

                  <div className="col-md-4">
                    <div className="form-group">
                      <label htmlFor="fechaInicio">
                        Fecha de Inicio <span className="text-danger">*</span>
                      </label>
                      <input
                        type="date"
                        className={`form-control ${errors.fechaInicio ? 'is-invalid' : ''}`}
                        id="fechaInicio"
                        name="fechaInicio"
                        value={formData.fechaInicio}
                        onChange={handleChange}
                      />
                      {errors.fechaInicio && (
                        <div className="invalid-feedback">{errors.fechaInicio}</div>
                      )}
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="form-group">
                      <label htmlFor="fechaFin">
                        Fecha de Fin <span className="text-danger">*</span>
                      </label>
                      <input
                        type="date"
                        className={`form-control ${errors.fechaFin ? 'is-invalid' : ''}`}
                        id="fechaFin"
                        name="fechaFin"
                        value={formData.fechaFin}
                        onChange={handleChange}
                        min={formData.fechaInicio}
                      />
                      {errors.fechaFin && (
                        <div className="invalid-feedback">{errors.fechaFin}</div>
                      )}
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="form-group">
                      <label htmlFor="estadoProyecto">
                        Estado del Proyecto <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control ${errors.estadoProyecto ? 'is-invalid' : ''}`}
                        id="estadoProyecto"
                        name="estadoProyecto"
                        value={formData.estadoProyecto}
                        onChange={handleChange}
                        placeholder="Ej: PLANIFICADO, EN PROGRESO, COMPLETADO..."
                      />
                      {errors.estadoProyecto && (
                        <div className="invalid-feedback">{errors.estadoProyecto}</div>
                      )}
                    </div>
                  </div>

                  {/* Información adicional sobre duración */}
                  {formData.fechaInicio && formData.fechaFin && (
                    <div className="col-md-12">
                      <div className="alert alert-info" style={{ backgroundColor: '#1e1e2e', borderColor: '#1e1e2e', color: '#fff' }}>
                        <i className="fas fa-info-circle mr-2"></i>
                        <strong>Duración del proyecto:</strong> {
                          Math.ceil((new Date(formData.fechaFin) - new Date(formData.fechaInicio)) / (1000 * 60 * 60 * 24))
                        } días
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
                          {project ? 'Actualizando...' : 'Creando...'}
                        </>
                      ) : (
                        <>
                          <i className={`fas ${project ? 'fa-save' : 'fa-plus'} mr-2`}></i>
                          {project ? 'Actualizar Proyecto' : 'Crear Proyecto'}
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

export default ProjectForm;
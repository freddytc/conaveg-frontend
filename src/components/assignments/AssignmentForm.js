import React, { useState, useEffect } from 'react';

const AssignmentForm = ({ assignment, employees, projects, onSubmit, onCancel }) => {
  // Función para obtener fecha actual en formato YYYY-MM-DD
  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [formData, setFormData] = useState({
    empleadoId: '',
    proyectoId: '',
    fechaAsignacion: getCurrentDate(),
    fechaFinAsignacion: '',
    rol: ''
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (assignment) {
      // Formatear las fechas correctamente para evitar problema de zona horaria
      let formattedFechaAsignacion = getCurrentDate();
      let formattedFechaFin = '';

      if (assignment.fechaAsignacion) {
        // Usar el método seguro para fechas
        if (assignment.fechaAsignacion.includes('-') && assignment.fechaAsignacion.length === 10) {
          formattedFechaAsignacion = assignment.fechaAsignacion;
        }
      }

      if (assignment.fechaFinAsignacion) {
        // Usar el método seguro para fechas
        if (assignment.fechaFinAsignacion.includes('-') && assignment.fechaFinAsignacion.length === 10) {
          formattedFechaFin = assignment.fechaFinAsignacion;
        }
      }

      setFormData({
        empleadoId: assignment.empleadoId || '',
        proyectoId: assignment.proyectoId || '',
        fechaAsignacion: formattedFechaAsignacion,
        fechaFinAsignacion: formattedFechaFin,
        rol: assignment.rol || ''
      });
    } else {
      // Si es nueva asignación, resetear a valores por defecto
      setFormData({
        empleadoId: '',
        proyectoId: '',
        fechaAsignacion: getCurrentDate(),
        fechaFinAsignacion: '',
        rol: ''
      });
    }
  }, [assignment]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpiar errores del campo que se está modificando
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.empleadoId) {
      newErrors.empleadoId = 'Debe seleccionar un empleado';
    }

    if (!formData.proyectoId) {
      newErrors.proyectoId = 'Debe seleccionar un proyecto';
    }

    if (!formData.fechaAsignacion) {
      newErrors.fechaAsignacion = 'La fecha de asignación es requerida';
    }

    // Validar que fecha fin sea mayor a fecha asignación
    if (formData.fechaFinAsignacion && formData.fechaAsignacion) {
      const fechaAsignacion = new Date(formData.fechaAsignacion);
      const fechaFin = new Date(formData.fechaFinAsignacion);

      if (fechaFin <= fechaAsignacion) {
        newErrors.fechaFinAsignacion = 'La fecha fin debe ser posterior a la fecha de asignación';
      }
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
      const submitData = {
        empleadoId: parseInt(formData.empleadoId),
        proyectoId: parseInt(formData.proyectoId),
        fechaAsignacion: formData.fechaAsignacion,
        fechaFinAsignacion: formData.fechaFinAsignacion || null,
        rol: formData.rol || null
      };

      // 🔍 DEBUG: Ver exactamente qué se está enviando
      console.log('🚀 Datos que se van a enviar al backend:', JSON.stringify(submitData, null, 2));
      console.log('📝 fechaFinAsignacion:', submitData.fechaFinAsignacion);
      console.log('👤 rol:', submitData.rol);
      console.log('📅 fechaAsignacion:', submitData.fechaAsignacion);

      const response = await onSubmit(submitData);

      // 🔍 DEBUG: Ver la respuesta del backend
      console.log('✅ Respuesta del backend:', JSON.stringify(response, null, 2));

    } catch (error) {
      console.error('❌ Error en formulario:', error);
      console.error('📄 Error completo:', JSON.stringify(error, null, 2));
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  };


  // Función para obtener nombre del empleado
  const getEmployeeName = (empleadoId) => {
    const employee = employees.find(emp => emp.id.toString() === empleadoId.toString());
    return employee ? `${employee.nombres} ${employee.apellidos}` : 'Empleado no encontrado';
  };

  // Función para obtener nombre del proyecto
  const getProjectName = (proyectoId) => {
    const project = projects.find(proj => proj.id.toString() === proyectoId.toString());
    return project ? project.nombre : 'Proyecto no encontrado';
  };

  // Función para formatear fecha de forma segura
  const formatDateSafe = (dateString) => {
    if (!dateString) return '-';
    if (dateString.includes('-') && dateString.length === 10) {
      const [year, month, day] = dateString.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      return date.toLocaleDateString('es-ES');
    }
    return '-';
  };

  return (
    <div className="page-inner">
      <div className="page-header">
        <h4 className="page-title">
          {assignment && assignment.id ? 'Editar Asignación' : 'Nueva Asignación de Proyecto'}
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
              Asignaciones
            </a>
          </li>
          <li className="separator">
            <i className="fas fa-chevron-right"></i>
          </li>
          <li className="nav-item">
            <span>{assignment && assignment.id ? 'Editar' : 'Nueva'}</span>
          </li>
        </ul>
      </div>

      <div className="row">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <i className="fas fa-users-cog mr-2"></i>
                {assignment && assignment.id ? 'Editar Asignación' : 'Crear Nueva Asignación'}
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="card-body">
                {/* Error general del formulario */}
                {errors.submit && (
                  <div className="alert alert-danger alert-dismissible fade show" role="alert">
                    <strong>Error:</strong> {errors.submit}
                    <button type="button" className="close" data-dismiss="alert" aria-label="Close">
                      <span aria-hidden="true">&times;</span>
                    </button>
                  </div>
                )}

                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="empleadoId">
                        Empleado <span className="text-danger">*</span>
                      </label>
                      <select
                        className={`form-control ${errors.empleadoId ? 'is-invalid' : ''}`}
                        id="empleadoId"
                        name="empleadoId"
                        value={formData.empleadoId}
                        onChange={handleChange}
                        disabled={loading}
                        required
                      >
                        <option value="">Seleccionar empleado...</option>
                        {employees.map(employee => (
                          <option key={employee.id} value={employee.id}>
                            {employee.nombres} {employee.apellidos} - {employee.puesto || employee.cargo || 'Sin cargo'}
                          </option>
                        ))}
                      </select>
                      {errors.empleadoId && (
                        <div className="invalid-feedback">
                          {errors.empleadoId}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="proyectoId">
                        Proyecto <span className="text-danger">*</span>
                      </label>
                      <select
                        className={`form-control ${errors.proyectoId ? 'is-invalid' : ''}`}
                        id="proyectoId"
                        name="proyectoId"
                        value={formData.proyectoId}
                        onChange={handleChange}
                        disabled={loading}
                        required
                      >
                        <option value="">Seleccionar proyecto...</option>
                        {projects.map(project => (
                          <option key={project.id} value={project.id}>
                            {project.nombre} {project.estadoProyecto ? `- ${project.estadoProyecto}` : ''}
                          </option>
                        ))}
                      </select>
                      {errors.proyectoId && (
                        <div className="invalid-feedback">
                          {errors.proyectoId}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-4">
                    <div className="form-group">
                      <label htmlFor="fechaAsignacion">
                        Fecha de Asignación <span className="text-danger">*</span>
                      </label>
                      <input
                        type="date"
                        className={`form-control ${errors.fechaAsignacion ? 'is-invalid' : ''}`}
                        id="fechaAsignacion"
                        name="fechaAsignacion"
                        value={formData.fechaAsignacion}
                        onChange={handleChange}
                        disabled={loading}
                        required
                      />
                      {errors.fechaAsignacion && (
                        <div className="invalid-feedback">
                          {errors.fechaAsignacion}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="form-group">
                      <label htmlFor="fechaFinAsignacion">
                        Fecha de Finalización
                      </label>
                      <input
                        type="date"
                        className={`form-control ${errors.fechaFinAsignacion ? 'is-invalid' : ''}`}
                        id="fechaFinAsignacion"
                        name="fechaFinAsignacion"
                        value={formData.fechaFinAsignacion}
                        onChange={handleChange}
                        disabled={loading}
                      />
                      {errors.fechaFinAsignacion && (
                        <div className="invalid-feedback">
                          {errors.fechaFinAsignacion}
                        </div>
                      )}
                      <small className="form-text text-muted">
                        Opcional - Dejar vacío si está activa
                      </small>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="form-group">
                      <label htmlFor="rol">
                        Rol del Empleado
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="rol"
                        name="rol"
                        value={formData.rol}
                        onChange={handleChange}
                        disabled={loading}
                        placeholder="Ej: Desarrollador, Tester, Analista..."
                      />
                      <small className="form-text text-muted">
                        Opcional - Especificar el rol en el proyecto
                      </small>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card-action">
                <button
                  type="submit"
                  className="btn btn-success"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
                      {assignment && assignment.id ? 'Actualizando...' : 'Creando...'}
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save mr-2"></i>
                      {assignment && assignment.id ? 'Actualizar Asignación' : 'Crear Asignación'}
                    </>
                  )}
                </button>

                <button
                  type="button"
                  className="btn btn-danger ml-2"
                  onClick={onCancel}
                  disabled={loading}
                >
                  <i className="fas fa-times mr-2"></i>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Sidebar con información de la asignación */}
        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <i className="fas fa-info-circle mr-2"></i>
                Información de la Asignación
              </div>
            </div>
            <div className="card-body">
              {formData.empleadoId && formData.proyectoId ? (
                <>
                  <div className="d-flex align-items-center mb-3">
                    <div className="avatar avatar-md mr-3">
                      <div className="avatar-initial bg-primary rounded">
                        <i className="fas fa-user"></i>
                      </div>
                    </div>
                    <div>
                      <h6 className="mb-0">{getEmployeeName(formData.empleadoId)}</h6>
                      <small className="text-muted">Empleado seleccionado</small>
                    </div>
                  </div>

                  <div className="d-flex align-items-center mb-3">
                    <div className="avatar avatar-md mr-3">
                      <div className="avatar-initial bg-success rounded">
                        <i className="fas fa-project-diagram"></i>
                      </div>
                    </div>
                    <div>
                      <h6 className="mb-0">{getProjectName(formData.proyectoId)}</h6>
                      <small className="text-muted">Proyecto seleccionado</small>
                    </div>
                  </div>

                  <hr />

                  <div className="info-item mb-2">
                    <span className="text-muted">Fecha de Asignación:</span>
                    <span className="float-right">
                      {formatDateSafe(formData.fechaAsignacion)}
                    </span>
                  </div>

                  <div className="info-item mb-2">
                    <span className="text-muted">Fecha de Finalización:</span>
                    <span className="float-right">
                      {formData.fechaFinAsignacion ? formatDateSafe(formData.fechaFinAsignacion) : 'Sin definir'}
                    </span>
                  </div>

                  {formData.rol && (
                    <div className="info-item mb-2">
                      <span className="text-muted">Rol:</span>
                      <span className="float-right">{formData.rol}</span>
                    </div>
                  )}

                  {formData.fechaAsignacion && formData.fechaFinAsignacion && (
                    <div className="info-item mb-2">
                      <span className="text-muted">Duración:</span>
                      <span className="float-right">
                        {Math.ceil((new Date(formData.fechaFinAsignacion) - new Date(formData.fechaAsignacion)) / (1000 * 60 * 60 * 24))} días
                      </span>
                    </div>
                  )}

                  <div className="alert alert-info mt-3">
                    <small>
                      <i className="fas fa-info-circle mr-1"></i>
                      {formData.fechaFinAsignacion ?
                        'Esta asignación tiene fecha de finalización definida.' :
                        'Esta asignación permanecerá activa hasta que se defina una fecha de finalización.'
                      }
                    </small>
                  </div>
                </>
              ) : (
                <div className="text-center text-muted">
                  <i className="fas fa-users-cog fa-3x mb-3"></i>
                  <p>Seleccione un empleado y proyecto para ver la información de la asignación</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignmentForm;
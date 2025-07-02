import React, { useState, useEffect } from 'react';

const AttendanceForm = ({ asistencia, empleados, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    empleadoId: '',
    tipoRegistro: 'Entrada',
    entrada: '',
    salida: '',
    ubicacionRegistro: '',
    metodoRegistro: 'Manual',
    observacion: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Función para obtener fecha/hora actual en formato datetime-local
  const getCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Función para convertir timestamp del backend a formato datetime-local
  // Las fechas del backend ya están en GMT-5, así que NO necesitamos conversión de zona horaria
  const formatDateTimeLocal = (timestamp) => {
    if (!timestamp) return '';

    try {
      let dateString;
      // Si es un timestamp de MySQL format: "2025-06-23 18:19:14"
      if (typeof timestamp === 'string') {
        if (timestamp.includes(' ') && !timestamp.includes('T')) {
          const parts = timestamp.split(' ');
          const datePart = parts[0];
          const timePart = parts[1] ? parts[1].substring(0, 5) : '00:00';

          return `${datePart}T${timePart}`;
        } else if (timestamp.includes('T')) {
          return timestamp.substring(0, 16);
        }
      }

      // Si no es string o no coincide con los formatos esperados
      return '';

    } catch (error) {
      console.error('Error formateando fecha:', error, timestamp);
      return '';
    }
  };

  // Función para convertir datetime-local a formato que espera el backend
  const formatForBackend = (datetimeLocal) => {
    if (!datetimeLocal) return null;

    try {
      // El input datetime-local viene en formato: "2025-06-30T20:03"
      // Lo convertimos para que el backend lo interprete correctamente en GMT-5

      // Crear una fecha sin conversión de zona horaria
      const [datePart, timePart] = datetimeLocal.split('T');
      const [year, month, day] = datePart.split('-');
      const [hours, minutes] = timePart.split(':');

      // Crear fecha en UTC pero con los valores locales (esto evita conversiones automáticas)
      const date = new Date(Date.UTC(
        parseInt(year),
        parseInt(month) - 1, // JavaScript months are 0-based
        parseInt(day),
        parseInt(hours),
        parseInt(minutes),
        0
      ));

      // Convertir a formato ISO para el backend
      return date.toISOString();

    } catch (error) {
      console.error('Error convirtiendo fecha para backend:', error, datetimeLocal);
      return null;
    }
  };

  useEffect(() => {
    if (asistencia) {
      setIsEditing(true);

      console.log('Datos de asistencia recibidos:', asistencia);

      const entradaFormateada = formatDateTimeLocal(asistencia.entrada);
      const salidaFormateada = formatDateTimeLocal(asistencia.salida);

      console.log('Entrada original:', asistencia.entrada);
      console.log('Entrada formateada:', entradaFormateada);
      console.log('Salida original:', asistencia.salida);
      console.log('Salida formateada:', salidaFormateada);

      setFormData({
        empleadoId: asistencia.empleadoId || '',
        tipoRegistro: asistencia.tipoRegistro || 'ENTRADA',
        entrada: entradaFormateada,
        salida: salidaFormateada,
        ubicacionRegistro: asistencia.ubicacionRegistro || '',
        metodoRegistro: asistencia.metodoRegistro || 'MANUAL',
        observacion: asistencia.observacion || ''
      });
    } else {
      setIsEditing(false);

      // Para nueva asistencia, establecer entrada como ahora
      const currentDateTime = getCurrentDateTime();
      setFormData(prev => ({
        ...prev,
        entrada: currentDateTime
      }));
    }
  }, [asistencia]);

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
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.empleadoId) {
      newErrors.empleadoId = 'Debe seleccionar un empleado';
    }

    if (!formData.tipoRegistro) {
      newErrors.tipoRegistro = 'Debe seleccionar un tipo de registro';
    }

    if (!formData.entrada) {
      newErrors.entrada = 'La fecha y hora de entrada es requerida';
    }

    if (formData.salida && formData.entrada) {
      const entradaDate = new Date(formData.entrada);
      const salidaDate = new Date(formData.salida);

      if (salidaDate <= entradaDate) {
        newErrors.salida = 'La hora de salida debe ser posterior a la entrada';
      }
    }

    // Validar que salida solo se requiera para ciertos tipos
    if (['SALIDA', 'SALIDA_ANTICIPADA'].includes(formData.tipoRegistro) && !formData.salida) {
      newErrors.salida = 'La hora de salida es requerida para este tipo de registro';
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
      // Convertir fechas al formato que espera el backend
      const dataToSubmit = {
        ...formData,
        empleadoId: parseInt(formData.empleadoId),
        entrada: formatForBackend(formData.entrada),
        salida: formatForBackend(formData.salida)
      };

      console.log('Datos originales del formulario:', formData);
      console.log('Datos a enviar (formato ISO):', dataToSubmit);

      await onSubmit(dataToSubmit);
    } catch (error) {
      console.error('Error capturado en formulario:', error);
      setErrors({
        general: 'Ocurrió un error al procesar la solicitud.'
      });
    } finally {
      setLoading(false);
    }
  };

  const getEmpleadoCompleto = (empleado) => {
    return `${empleado.nombres} ${empleado.apellidos} - ${empleado.puesto || 'Sin cargo'}`;
  };

  const handleTipoRegistroChange = (e) => {
    const tipo = e.target.value;
    const currentDateTime = getCurrentDateTime();

    // Solo actualizar automáticamente las fechas si NO estamos editando un registro existente
    if (!isEditing) {
      handleChange(e);

      // Auto-configurar campos según el tipo solo para registros nuevos
      if (tipo === 'ENTRADA' || tipo === 'ENTRADA_TARDANZA') {
        setFormData(prev => ({
          ...prev,
          tipoRegistro: tipo,
          entrada: currentDateTime,
          salida: ''
        }));
      } else if (tipo === 'SALIDA' || tipo === 'SALIDA_ANTICIPADA') {
        setFormData(prev => ({
          ...prev,
          tipoRegistro: tipo,
          salida: currentDateTime
        }));
      } else if (tipo === 'PAUSA') {
        setFormData(prev => ({
          ...prev,
          tipoRegistro: tipo,
          salida: currentDateTime
        }));
      } else if (tipo === 'REGRESO') {
        setFormData(prev => ({
          ...prev,
          tipoRegistro: tipo,
          entrada: currentDateTime
        }));
      }
    } else {
      // Si estamos editando, solo cambiar el tipo sin modificar las fechas
      handleChange(e);
    }
  };

  // Función para establecer hora actual en entrada
  const setCurrentTimeToEntrada = () => {
    const currentDateTime = getCurrentDateTime();
    setFormData(prev => ({
      ...prev,
      entrada: currentDateTime
    }));
  };

  // Función para establecer hora actual en salida
  const setCurrentTimeToSalida = () => {
    const currentDateTime = getCurrentDateTime();
    setFormData(prev => ({
      ...prev,
      salida: currentDateTime
    }));
  };

  return (
    <div className="page-inner">
      <div className="page-header">
        <h4 className="page-title">
          {asistencia ? 'Editar Registro de Asistencia' : 'Nuevo Registro de Asistencia'}
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
            <a href="/asistencias">Asistencias</a>
          </li>
          <li className="separator">
            <i className="fas fa-chevron-right"></i>
          </li>
          <li className="nav-item">
            <span>{asistencia ? 'Editar' : 'Nuevo'}</span>
          </li>
        </ul>
      </div>

      <div className="row">
        <div className="col-md-12">
          <div className="card">
            <div className="card-header">
              <div className="d-flex align-items-center">
                <h4 className="card-title">
                  {asistencia ? 'Editar Registro de Asistencia' : 'Agregar Nuevo Registro'}
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
                  {errors.general && (
                    <div className="col-md-12">
                      <div className="alert alert-danger">
                        <i className="fas fa-exclamation-triangle mr-2"></i>
                        {errors.general}
                      </div>
                    </div>
                  )}

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
                        required
                      >
                        <option value="">Seleccione un empleado</option>
                        {empleados.map(empleado => (
                          <option key={empleado.id} value={empleado.id}>
                            {getEmpleadoCompleto(empleado)}
                          </option>
                        ))}
                      </select>
                      {errors.empleadoId && (
                        <div className="invalid-feedback">{errors.empleadoId}</div>
                      )}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="tipoRegistro">
                        Tipo de Registro <span className="text-danger">*</span>
                      </label>
                      <select
                        className={`form-control ${errors.tipoRegistro ? 'is-invalid' : ''}`}
                        id="tipoRegistro"
                        name="tipoRegistro"
                        value={formData.tipoRegistro}
                        onChange={handleTipoRegistroChange}
                        required
                      >
                        <option value="Entrada">Entrada</option>
                        <option value="Salida">Salida</option>
                        <option value="Tardanza">Entrada con Tardanza</option>
                        <option value="Salida Anticipada">Salida Anticipada</option>
                      </select>
                      {errors.tipoRegistro && (
                        <div className="invalid-feedback">{errors.tipoRegistro}</div>
                      )}
                      {isEditing && (
                        <small className="form-text text-muted">
                          <i className="fas fa-info-circle mr-1"></i>
                          Al editar, las fechas no se modifican automáticamente
                        </small>
                      )}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="entrada">
                        Fecha y Hora de Entrada <span className="text-danger">*</span>
                        <small className="text-muted ml-2">(GMT-5)</small>
                      </label>
                      <div className="input-group">
                        <input
                          type="datetime-local"
                          className={`form-control ${errors.entrada ? 'is-invalid' : ''}`}
                          id="entrada"
                          name="entrada"
                          value={formData.entrada}
                          onChange={handleChange}
                          required
                        />
                        <div className="input-group-append">
                          <button
                            type="button"
                            className="btn btn-outline-primary"
                            onClick={setCurrentTimeToEntrada}
                            title="Establecer hora actual (GMT-5)"
                          >
                            <i className="fas fa-clock"></i>
                          </button>
                        </div>
                      </div>
                      {errors.entrada && (
                        <div className="invalid-feedback">{errors.entrada}</div>
                      )}
                      <small className="form-text text-muted">
                        <i className="fas fa-info-circle mr-1"></i>
                        Haga clic en el reloj para establecer la hora actual (GMT-5)
                      </small>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="salida">
                        Fecha y Hora de Salida
                        {['SALIDA', 'SALIDA_ANTICIPADA'].includes(formData.tipoRegistro) &&
                          <span className="text-danger"> *</span>
                        }
                        <small className="text-muted ml-2">(GMT-5)</small>
                      </label>
                      <div className="input-group">
                        <input
                          type="datetime-local"
                          className={`form-control ${errors.salida ? 'is-invalid' : ''}`}
                          id="salida"
                          name="salida"
                          value={formData.salida}
                          onChange={handleChange}
                          disabled={['ENTRADA', 'ENTRADA_TARDANZA', 'REGRESO'].includes(formData.tipoRegistro)}
                        />
                        <div className="input-group-append">
                          <button
                            type="button"
                            className="btn btn-outline-primary"
                            onClick={setCurrentTimeToSalida}
                            title="Establecer hora actual (GMT-5)"
                            disabled={['ENTRADA', 'ENTRADA_TARDANZA', 'REGRESO'].includes(formData.tipoRegistro)}
                          >
                            <i className="fas fa-clock"></i>
                          </button>
                        </div>
                      </div>
                      {errors.salida && (
                        <div className="invalid-feedback">{errors.salida}</div>
                      )}
                      <small className="form-text text-muted">
                        {['ENTRADA', 'ENTRADA_TARDANZA'].includes(formData.tipoRegistro)
                          ? 'No aplica para registros de entrada'
                          : 'Haga clic en el reloj para establecer la hora actual (GMT-5)'
                        }
                      </small>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="ubicacionRegistro">
                        Ubicación del Registro
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="ubicacionRegistro"
                        name="ubicacionRegistro"
                        value={formData.ubicacionRegistro}
                        onChange={handleChange}
                        placeholder="Ej: Oficina Principal, Obra A, Remoto"
                      />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="metodoRegistro">
                        Método de Registro
                      </label>
                      <select
                        className="form-control"
                        id="metodoRegistro"
                        name="metodoRegistro"
                        value={formData.metodoRegistro}
                        onChange={handleChange}
                      >
                        <option value="Manual">Manual</option>
                        <option value="Biometrico">Biométrico</option>
                        <option value="Tarjeta">Tarjeta</option>
                      </select>
                    </div>
                  </div>

                  <div className="col-md-12">
                    <div className="form-group">
                      <label htmlFor="observacion">
                        Observaciones
                      </label>
                      <textarea
                        className="form-control"
                        id="observacion"
                        name="observacion"
                        value={formData.observacion}
                        onChange={handleChange}
                        placeholder="Comentarios adicionales sobre el registro..."
                        rows="3"
                      />
                    </div>
                  </div>
                </div>

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
                          {asistencia ? 'Actualizando...' : 'Registrando...'}
                        </>
                      ) : (
                        <>
                          <i className={`fas ${asistencia ? 'fa-save' : 'fa-plus'} mr-2`}></i>
                          {asistencia ? 'Actualizar Registro' : 'Registrar Asistencia'}
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

export default AttendanceForm;
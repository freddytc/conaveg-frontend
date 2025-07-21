import React, { useState, useEffect } from 'react';

const AttendanceForm = ({ asistencia, empleados, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    empleadoId: '',
    tipoRegistro: 'Entrada',
    entrada: '',
    salida: '',
    ubicacionRegistro: '',
    metodoRegistro: 'Manual',
    observacion: '',
    // Campos para registro rápido
    nroDocumento: '',
    latitud: null,
    longitud: null
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isRegistroRapido, setIsRegistroRapido] = useState(false);
  const [contadorRegistros, setContadorRegistros] = useState(0);


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
  const formatDateTimeLocal = (timestamp) => {
    if (!timestamp) return '';

    try {
      let dateString;
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
      const [datePart, timePart] = datetimeLocal.split('T');
      const [year, month, day] = datePart.split('-');
      const [hours, minutes] = timePart.split(':');

      const date = new Date(Date.UTC(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
        parseInt(hours),
        parseInt(minutes),
        0
      ));

      return date.toISOString();
    } catch (error) {
      console.error('Error convirtiendo fecha para backend:', error, datetimeLocal);
      return null;
    }
  };

  // Función para obtener ubicación GPS automáticamente
  const obtenerUbicacionGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          setFormData(prev => ({
            ...prev,
            latitud: lat,
            longitud: lon
          }));
          // Obtener nombre de la ubicación
          const nombreUbicacion = await obtenerNombreUbicacion(lat, lon);
          setFormData(prev => ({
            ...prev,
            ubicacionRegistro: nombreUbicacion
          }));
          console.log('Ubicación GPS obtenida:', { lat, lon, nombreUbicacion });
        },
        (error) => {
          console.warn('No se pudo obtener la ubicación GPS:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    }
  };

  const obtenerNombreUbicacion = async (lat, lon) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`
      );
      const data = await response.json();
      const address = data.address || {};

      // Construye un nombre corto y legible
      const partes = [
        address.leisure,
        address.hamlet,
        address.city,
        address.state
      ].filter(Boolean);

      // Ejemplo: Calle, Barrio, Ciudad
      let nombreCorto = partes.slice(0, 4).join(', ');

      // Si no hay suficiente info, usa display_name
      if (!nombreCorto) nombreCorto = data.display_name || "Ubicación desconocida";

      return nombreCorto;
    } catch (error) {
      console.error("Error obteniendo nombre de ubicación:", error);
      return "Ubicación desconocida";
    }
  };

  useEffect(() => {
    if (asistencia) {
      setIsEditing(true);
      setIsRegistroRapido(false); // No usar registro rápido al editar

      console.log('Datos de asistencia recibidos:', asistencia);

      const entradaFormateada = formatDateTimeLocal(asistencia.entrada);
      const salidaFormateada = formatDateTimeLocal(asistencia.salida);

      setFormData({
        empleadoId: asistencia.empleadoId || '',
        tipoRegistro: asistencia.tipoRegistro || 'Entrada',
        entrada: entradaFormateada,
        salida: salidaFormateada,
        ubicacionRegistro: asistencia.ubicacionRegistro || '',
        metodoRegistro: asistencia.metodoRegistro || 'Manuel',
        observacion: asistencia.observacion || '',
        nroDocumento: '',
        latitud: null,
        longitud: null
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

  const handleMetodoRegistroChange = (e) => {
    const metodo = e.target.value;
    const esRegistroRapido = metodo === 'Tarjeta';

    setIsRegistroRapido(esRegistroRapido);

    setFormData(prev => ({
      ...prev,
      metodoRegistro: metodo,
      // Limpiar campos según el modo
      empleadoId: esRegistroRapido ? '' : prev.empleadoId,
      nroDocumento: esRegistroRapido ? prev.nroDocumento : '',
      // Si es registro rápido, establecer ubicación por defecto
      ubicacionRegistro: esRegistroRapido ? 'Oficina Principal' : prev.ubicacionRegistro
    }));

    // Si es registro rápido, obtener GPS automáticamente
    if (esRegistroRapido) {
      obtenerUbicacionGPS();
    }

    // Limpiar errores relacionados
    setErrors(prev => ({
      ...prev,
      empleadoId: '',
      nroDocumento: '',
      metodoRegistro: ''
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (isRegistroRapido) {
      // Validaciones para registro rápido
      if (!formData.nroDocumento) {
        newErrors.nroDocumento = 'El número de documento es requerido';
      }
      if (!formData.ubicacionRegistro) {
        newErrors.ubicacionRegistro = 'La ubicación es requerida';
      }
    } else {
      // Validaciones normales
      if (!formData.empleadoId) {
        newErrors.empleadoId = 'Debe seleccionar un empleado';
      }
      if (!formData.entrada) {
        newErrors.entrada = 'La fecha y hora de entrada es requerida';
      }
      if (!formData.tipoRegistro) {
        newErrors.tipoRegistro = 'Debe seleccionar un tipo de registro';
      }
      if (formData.salida && formData.entrada) {
        const entradaDate = new Date(formData.entrada);
        const salidaDate = new Date(formData.salida);
        if (salidaDate <= entradaDate) {
          newErrors.salida = 'La hora de salida debe ser posterior a la entrada';
        }
      }
      if (['Salida', 'Salida_Anticipada'].includes(formData.tipoRegistro) && !formData.salida) {
        newErrors.salida = 'La hora de salida es requerida para este tipo de registro';
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
      if (isRegistroRapido) {
        // Preparar datos para registro rápido
        const dataToSubmit = {
          nroDocumento: formData.nroDocumento.trim(),
          metodoRegistro: formData.metodoRegistro,
          ubicacionRegistro: formData.ubicacionRegistro || 'Oficina Principal',
          observacion: formData.observacion || null,
          latitud: formData.latitud || null,
          longitud: formData.longitud || null,
          estadoAsistencia: null
        };

        // Llamar al endpoint de registro rápido
        const response = await fetch('http://localhost:8080/conaveg/api/asistencias/registro-rapido', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(dataToSubmit)
        });

        if (!response.ok) {
          const errorData = await response.text();
          if (response.status === 404) {
            throw new Error(`Empleado no encontrado con el número de documento: ${dataToSubmit.nroDocumento}`);
          }
          throw new Error(`Error al registrar asistencia: ${errorData || 'Error desconocido'}`);
        }
        const result = await response.json();
        console.log('Registro rápido exitoso:', result);
        setContadorRegistros(prev => prev + 1);

        //LIMPIAR SOLO EL CAMPO DNI Y OBSERVACIONES PARA SIGUIENTE REGISTRO
        setFormData(prev => ({
          ...prev,
          nroDocumento: '', // Limpiar DNI para siguiente registro
          observacion: ''   // Limpiar observaciones
        }));

        setErrors({});
        setErrors({
          general: null,
          success: `✅ Registro #${contadorRegistros + 1} exitoso para ${dataToSubmit.nroDocumento}. Listo para el siguiente DNI.`
        });

        //FOCO AUTOMÁTICO EN EL CAMPO DNI PARA SIGUIENTE REGISTRO
        setTimeout(() => {
          const dniField = document.getElementById('nroDocumento');
          if (dniField) {
            dniField.focus();
          }
          // Limpiar mensaje de éxito después de 3 segundos
          setTimeout(() => {
            setErrors(prev => ({
              ...prev,
              success: null
            }));
          }, 3000);
        }, 100);

      } else {
        // Registro normal
        const dataToSubmit = {
          ...formData,
          empleadoId: parseInt(formData.empleadoId),
          entrada: formatForBackend(formData.entrada),
          salida: formatForBackend(formData.salida)
        };
        await onSubmit(dataToSubmit);
      }
    } catch (error) {
      console.error('Error capturado en formulario:', error);
      setErrors({
        general: error.message || 'Ocurrió un error al procesar la solicitud.'
      });

      //EN CASO DE ERROR, TAMBIÉN LIMPIAR EL CAMPO DNI
      if (isRegistroRapido) {
        setFormData(prev => ({
          ...prev,
          nroDocumento: ''
        }));

        setTimeout(() => {
          const dniField = document.getElementById('nroDocumento');
          if (dniField) {
            dniField.focus();
          }
        }, 100);
      }
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

    if (!isEditing) {
      handleChange(e);
      if (tipo === 'Entrada' || tipo === 'Entrada_Tardanza') {
        setFormData(prev => ({
          ...prev,
          tipoRegistro: tipo,
          entrada: currentDateTime,
          salida: ''
        }));
      } else if (tipo === 'Salida' || tipo === 'Salida_Anticipada') {
        setFormData(prev => ({
          ...prev,
          tipoRegistro: tipo,
          salida: currentDateTime
        }));
      }
    } else {
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
          {asistencia ? 'Editar Registro de Asistencia' :
            isRegistroRapido ? 'Registro Rápido con Escáner' : 'Nuevo Registro de Asistencia'}
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
            <span>{asistencia ? 'Editar' : isRegistroRapido ? 'Registro Rápido' : 'Nuevo'}</span>
          </li>
        </ul>
      </div>

      <div className="row">
        <div className="col-md-12">
          <div className="card">
            <div className="card-header">
              <div className="d-flex align-items-center">
                <h4 className="card-title">
                  {asistencia ? 'Editar Registro de Asistencia' :
                    isRegistroRapido ? 'Registro Rápido con Escáner de DNI' : 'Agregar Nuevo Registro'}
                </h4>
              </div>
            </div>

            <div className="card-body">
              {isRegistroRapido && !isEditing && (
                <div className="alert alert-info">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <i className="fas fa-qrcode mr-2"></i>
                      <strong>Registro Rápido:</strong> Escanee el código de barras del DNI o ingrese manualmente el número de documento.
                    </div>
                    {contadorRegistros > 0 && (
                      <div className="badge badge-success badge-pill">
                        <i className="fas fa-check mr-1"></i>
                        {contadorRegistros} registrados
                      </div>
                    )}
                  </div>
                </div>
              )}

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

                  {/* Método de Registro - Mostrar primero */}
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
                        onChange={handleMetodoRegistroChange}
                        disabled={isEditing}
                      >
                        <option value="Manual">Manual</option>
                        <option value="Tarjeta">Tarjeta</option>
                        <option value="Biometrico">Biométrico</option>
                      </select>
                      {isEditing && (
                        <small className="form-text text-muted">
                          <i className="fas fa-info-circle mr-1"></i>
                          No se puede cambiar el método al editar
                        </small>
                      )}
                    </div>
                  </div>

                  {/* Mostrar diferentes campos según el modo */}
                  {isRegistroRapido && !isEditing ? (
                    <>
                      {/* Campo para número de documento (registro rápido) */}
                      <div className="col-md-6">
                        <div className="form-group">
                          <label htmlFor="nroDocumento">
                            <i className="fas fa-id-card mr-1"></i>
                            Número de DNI <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className={`form-control form-control-lg ${errors.nroDocumento ? 'is-invalid' : ''}`}
                            id="nroDocumento"
                            name="nroDocumento"
                            value={formData.nroDocumento}
                            onChange={handleChange}
                            placeholder="Escanee o ingrese el número de DNI"
                            required
                            autoFocus
                            style={{ fontSize: '1.2rem', textAlign: 'center' }}
                          />
                          {errors.nroDocumento && (
                            <div className="invalid-feedback">{errors.nroDocumento}</div>
                          )}
                        </div>
                      </div>

                      {/* Ubicación para registro rápido */}
                      <div className="col-md-6">
                        <div className="form-group">
                          <label htmlFor="ubicacionRegistro">
                            <i className="fas fa-map-marker-alt mr-1"></i>
                            Ubicación <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className={`form-control ${errors.ubicacionRegistro ? 'is-invalid' : ''}`}
                            id="ubicacionRegistro"
                            name="ubicacionRegistro"
                            value={formData.ubicacionRegistro}
                            onChange={handleChange}
                            required
                          />
                          {errors.ubicacionRegistro && (
                            <div className="invalid-feedback">{errors.ubicacionRegistro}</div>
                          )}
                        </div>
                      </div>

                      {/* Estado del GPS */}
                      <div className="col-md-6">
                        <div className="form-group">
                          <label>
                            GPS
                          </label>
                          <div className="form-control-plaintext">
                            {formData.latitud && formData.longitud ? (
                              <span className="text-success">
                                <i className="fas fa-check-circle mr-1"></i>
                                Ubicación obtenida: {formData.latitud.toFixed(6)}, {formData.longitud.toFixed(6)}
                              </span>
                            ) : (
                              <span className="text-warning">
                                <i className="fas fa-clock mr-1"></i>
                                Obteniendo ubicación GPS...
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Formulario normal */}
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
                            <option value="Salida_Anticipada">Salida Anticipada</option>
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
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="form-group">
                          <label htmlFor="salida">
                            Fecha y Hora de Salida
                            {['Salida', 'Salida_Anticipada'].includes(formData.tipoRegistro) &&
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
                              disabled={['Entrada', 'Entrada_Tardanza'].includes(formData.tipoRegistro)}
                            />
                            <div className="input-group-append">
                              <button
                                type="button"
                                className="btn btn-outline-primary"
                                onClick={setCurrentTimeToSalida}
                                title="Establecer hora actual (GMT-5)"
                                disabled={['Entrada', 'Entrada_Tardanza'].includes(formData.tipoRegistro)}
                              >
                                <i className="fas fa-clock"></i>
                              </button>
                            </div>
                          </div>
                          {errors.salida && (
                            <div className="invalid-feedback">{errors.salida}</div>
                          )}
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
                            placeholder={
                              "Comentarios adicionales sobre el registro..."
                            }
                            rows="3"
                          />
                        </div>
                      </div>
                    </>
                  )}
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
                      className={`btn ${isRegistroRapido ? 'btn btn-success' : 'btn btn-success'}`}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm mr-2" role="status"></span>
                          {isRegistroRapido ? 'Registrando entrada...' :
                            asistencia ? 'Actualizando...' : 'Registrando...'}
                        </>
                      ) : (
                        <>
                          <i className={`fas ${isRegistroRapido ? 'fa-qrcode' : asistencia ? 'fa-save' : 'fa-plus'} mr-2`}></i>
                          {isRegistroRapido ? 'Registrar Entrada Rápida' :
                            asistencia ? 'Actualizar Registro' : 'Registrar Asistencia'}
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
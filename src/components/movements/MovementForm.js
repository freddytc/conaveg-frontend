import React, { useState, useEffect } from 'react';
import { employeeService } from '../../services/employeeService';
import { inventoryService } from '../../services/inventoryService';
import { proyectService } from '../../services/proyectService';

const MovementForm = ({ movement, onSubmit, onCancel }) => {
  // Función para obtener fecha actual en formato YYYY-MM-DD
  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };


  const [formData, setFormData] = useState({
    inventarioId: '',
    tipoMovimiento: '',
    cantidad: 1,
    fechaMovimiento: getCurrentDate(), // Fecha actual por defecto
    observacion: '',
    empleadoIdAsigna: '',
    empleadoIdRecibe: '',
    proyectoId: ''
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Estados para datos relacionados
  const [employees, setEmployees] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // Estado para el artículo seleccionado
  const [selectedItem, setSelectedItem] = useState(null);

  const [tiposMovimiento] = useState([
    { value: 'Entrada', label: 'Entrada de Inventario', icon: 'fas fa-plus-circle', color: 'success' },
    { value: 'Salida', label: 'Salida de Inventario', icon: 'fas fa-minus-circle', color: 'danger' },
    { value: 'Asignacion Empleado', label: 'Asignación a Empleado', icon: 'fas fa-user-plus', color: 'primary', requiresEmployee: true },
    { value: 'Asignacion Proyecto', label: 'Asignación a Proyecto', icon: 'fas fa-project-diagram', color: 'info', requiresProject: true },
    { value: 'Devolucion Empleado', label: 'Devolución de Empleado', icon: 'fas fa-user-minus', color: 'warning', requiresEmployeeAsigna: true },
    { value: 'Devolucion Pryecto', label: 'Devolución de Proyecto', icon: 'fas fa-arrow-left', color: 'warning', requiresProject: true },
    { value: 'Perdida', label: 'Reporte de Pérdida', icon: 'fas fa-exclamation-triangle', color: 'danger' },
    { value: 'Mantenimiento', label: 'Envío a Mantenimiento', icon: 'fas fa-tools', color: 'info' }
  ]);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (movement) {
      setFormData({
        inventarioId: movement.inventarioId || '',
        tipoMovimiento: movement.tipoMovimiento || '',
        cantidad: movement.cantidad || 1,
        fechaMovimiento: movement.fechaMovimiento ?
          new Date(movement.fechaMovimiento).toISOString().split('T')[0] :
          getCurrentDate(),
        observacion: movement.observacion || '',
        empleadoIdAsigna: movement.empleadoIdAsigna || '',
        empleadoIdRecibe: movement.empleadoIdRecibe || '',
        proyectoId: movement.proyectoId || ''
      });
    } else {
      setFormData(prev => ({
        ...prev,
        fechaMovimiento: getCurrentDate()
      }));
    }
  }, [movement]);

  useEffect(() => {
    // Actualizar el artículo seleccionado cuando cambie inventarioId
    if (formData.inventarioId && inventory.length > 0) {
      const item = inventory.find(inv => inv.id.toString() === formData.inventarioId.toString());
      setSelectedItem(item || null);
    } else {
      setSelectedItem(null);
    }
  }, [formData.inventarioId, inventory]);

  const loadInitialData = async () => {
    try {
      setLoadingData(true);

      // Cargar empleados e inventario primero
      const [employeesResponse, inventoryResponse] = await Promise.all([
        employeeService.getAllEmployees().catch(err => {
          console.error('Error cargando empleados:', err);
          return [];
        }),
        inventoryService.getAllInventory().catch(err => {
          console.error('Error cargando inventario:', err);
          return [];
        })
      ]);

      // Procesar respuestas de empleados e inventario
      const employeeArray = Array.isArray(employeesResponse) ? employeesResponse :
        (employeesResponse?.data ? employeesResponse.data : []);
      const inventoryArray = Array.isArray(inventoryResponse) ? inventoryResponse :
        (inventoryResponse?.data ? inventoryResponse.data : []);

      setEmployees(employeeArray);
      setInventory(inventoryArray);

      // Cargar proyectos por separado
      try {
        const projectsResponse = await proyectService.getAllProjects();
        const projectArray = Array.isArray(projectsResponse) ? projectsResponse :
          (projectsResponse?.data ? projectsResponse.data : []);

        console.log('Proyectos cargados:', projectArray);
        setProjects(projectArray);

      } catch (projectError) {
        console.error('Error cargando proyectos:', projectError);
        setErrors(prev => ({
          ...prev,
          general: 'No se pudieron cargar los proyectos del servidor. Se muestran proyectos de ejemplo.'
        }));
      }

    } catch (error) {
      console.error('Error cargando datos:', error);
      setErrors(prev => ({
        ...prev,
        general: 'Error al cargar los datos necesarios'
      }));

      // Establecer valores por defecto
      setEmployees([]);
      setInventory([]);
    } finally {
      setLoadingData(false);
    }
  };

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

    // Limpiar campos relacionados cuando cambia el tipo de movimiento
    if (name === 'tipoMovimiento') {
      setFormData(prev => ({
        ...prev,
        empleadoIdAsigna: '',
        empleadoIdRecibe: '',
        proyectoId: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.inventarioId) {
      newErrors.inventarioId = 'Debe seleccionar un artículo del inventario';
    }

    if (!formData.tipoMovimiento) {
      newErrors.tipoMovimiento = 'Debe seleccionar un tipo de movimiento';
    }

    if (!formData.cantidad || formData.cantidad <= 0) {
      newErrors.cantidad = 'La cantidad debe ser mayor a 0';
    }

    if (!formData.fechaMovimiento) {
      newErrors.fechaMovimiento = 'La fecha de movimiento es requerida';
    }

    // Validaciones específicas según el tipo de movimiento
    const tipoConfig = tiposMovimiento.find(t => t.value === formData.tipoMovimiento);

    if (tipoConfig) {
      if (tipoConfig.requiresEmployee && !formData.empleadoIdRecibe) {
        newErrors.empleadoIdRecibe = 'Debe seleccionar el empleado que recibe';
      }

      if (tipoConfig.requiresProject && !formData.proyectoId) {
        newErrors.proyectoId = 'Debe seleccionar el proyecto';
      }

      if (tipoConfig.requiresEmployeeAsigna && !formData.empleadoIdAsigna) {
        newErrors.empleadoIdAsigna = 'Debe seleccionar el empleado que devuelve';
      }

      if (tipoConfig.requiresTransfer) {
        if (!formData.empleadoIdAsigna && !formData.proyectoId) {
          newErrors.empleadoIdAsigna = 'Debe seleccionar el origen de la transferencia';
        }
        if (!formData.empleadoIdRecibe) {
          newErrors.empleadoIdRecibe = 'Debe seleccionar el destino de la transferencia';
        }
      }
    }

    // Validar que hay stock suficiente para salidas
    if (selectedItem && ['Asignacion empleado', 'Asignacion Procecto', 'Salida'].includes(formData.tipoMovimiento)) {
      if (parseInt(formData.cantidad) > selectedItem.stock) {
        newErrors.cantidad = `Stock insuficiente. Disponible: ${selectedItem.stock}`;
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
        inventarioId: parseInt(formData.inventarioId),
        tipoMovimiento: formData.tipoMovimiento,
        cantidad: parseInt(formData.cantidad),
        fechaMovimiento: formData.fechaMovimiento + 'T00:00:00.000Z',
        observacion: formData.observacion.trim() || null
      };

      // Agregar campos opcionales solo si tienen valor
      if (formData.empleadoIdAsigna) {
        submitData.empleadoIdAsigna = parseInt(formData.empleadoIdAsigna);
      }

      if (formData.empleadoIdRecibe) {
        submitData.empleadoIdRecibe = parseInt(formData.empleadoIdRecibe);
      }

      if (formData.proyectoId) {
        submitData.proyectoId = parseInt(formData.proyectoId);
      }

      console.log('Datos a enviar:', submitData);
      await onSubmit(submitData);
    } catch (error) {
      console.error('Error en formulario:', error);
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  };

  // Renderizado condicional según tipo de movimiento
  const renderMovementFields = () => {
    const tipoConfig = tiposMovimiento.find(t => t.value === formData.tipoMovimiento);

    if (!tipoConfig) return null;

    return (
      <>
        {/* Campo para empleado que recibe */}
        {tipoConfig.requiresEmployee && (
          <div className="col-md-6">
            <div className="form-group">
              <label htmlFor="empleadoIdRecibe">
                Empleado que Recibe <span className="text-danger">*</span>
              </label>
              <select
                className={`form-control ${errors.empleadoIdRecibe ? 'is-invalid' : ''}`}
                id="empleadoIdRecibe"
                name="empleadoIdRecibe"
                value={formData.empleadoIdRecibe}
                onChange={handleChange}
                disabled={loading || loadingData}
                required
              >
                <option value="">Seleccionar empleado...</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.nombres} {emp.apellidos} - {emp.puesto || emp.cargo || 'Sin cargo'}
                  </option>
                ))}
              </select>
              {errors.empleadoIdRecibe && (
                <div className="invalid-feedback">
                  {errors.empleadoIdRecibe}
                </div>
              )}
              {employees.length === 0 && (
                <small className="form-text text-warning">
                  No hay empleados disponibles. Contacte al administrador.
                </small>
              )}
            </div>
          </div>
        )}

        {/* Campo para proyecto */}
        {tipoConfig.requiresProject && (
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
                disabled={loading || loadingData}
                required
              >
                <option value="">Seleccionar proyecto...</option>
                {projects.map(proyecto => (
                  <option key={proyecto.id} value={proyecto.id}>
                    {proyecto.nombre} {proyecto.estadoProyecto ? `- ${proyecto.estadoProyecto}` : ''}
                  </option>
                ))}
              </select>
              {errors.proyectoId && (
                <div className="invalid-feedback">
                  {errors.proyectoId}
                </div>
              )}
              {projects.length === 0 && (
                <small className="form-text text-warning">
                  No hay proyectos disponibles. Contacte al administrador.
                </small>
              )}
            </div>
          </div>
        )}

        {/* Campo para empleado que asigna/devuelve */}
        {(tipoConfig.requiresEmployeeAsigna || tipoConfig.requiresTransfer) && (
          <div className="col-md-6">
            <div className="form-group">
              <label htmlFor="empleadoIdAsigna">
                {tipoConfig.requiresTransfer ? 'Origen (Empleado)' : 'Empleado que Devuelve'}
                <span className="text-danger">*</span>
              </label>
              <select
                className={`form-control ${errors.empleadoIdAsigna ? 'is-invalid' : ''}`}
                id="empleadoIdAsigna"
                name="empleadoIdAsigna"
                value={formData.empleadoIdAsigna}
                onChange={handleChange}
                disabled={loading || loadingData}
                required
              >
                <option value="">Seleccionar empleado...</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.nombres} {emp.apellidos} - {emp.puesto || emp.cargo || 'Sin cargo'}
                  </option>
                ))}
              </select>
              {errors.empleadoIdAsigna && (
                <div className="invalid-feedback">
                  {errors.empleadoIdAsigna}
                </div>
              )}
              {employees.length === 0 && (
                <small className="form-text text-warning">
                  No hay empleados disponibles. Contacte al administrador.
                </small>
              )}
            </div>
          </div>
        )}

        {/* Campo adicional para transferencias - destino */}
        {tipoConfig.requiresTransfer && (
          <div className="col-md-6">
            <div className="form-group">
              <label htmlFor="empleadoIdRecibe">
                Destino (Empleado) <span className="text-danger">*</span>
              </label>
              <select
                className={`form-control ${errors.empleadoIdRecibe ? 'is-invalid' : ''}`}
                id="empleadoIdRecibe"
                name="empleadoIdRecibe"
                value={formData.empleadoIdRecibe}
                onChange={handleChange}
                disabled={loading || loadingData}
                required
              >
                <option value="">Seleccionar empleado destino...</option>
                {employees
                  .filter(emp => emp.id.toString() !== formData.empleadoIdAsigna.toString())
                  .map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.nombres} {emp.apellidos} - {emp.puesto || emp.cargo || 'Sin cargo'}
                    </option>
                  ))}
              </select>
              {errors.empleadoIdRecibe && (
                <div className="invalid-feedback">
                  {errors.empleadoIdRecibe}
                </div>
              )}
            </div>
          </div>
        )}
      </>
    );
  };

  const getTipoMovimientoHelp = () => {
    const tipoConfig = tiposMovimiento.find(t => t.value === formData.tipoMovimiento);

    if (!tipoConfig) return null;

    const helpTexts = {
      'Entrada': 'Registra el ingreso de nuevos artículos al inventario.',
      'Salida': 'Registra la salida de artículos del inventario.',
      'Asignacion Empelado': 'Asigna un artículo del inventario a un empleado específico.',
      'Asignacion Proyecto': 'Asigna un artículo del inventario a un proyecto.',
      'Devolucion Empleado': 'Registra la devolución de un artículo por parte de un empleado.',
      'Devolucion Proyecto': 'Registra la devolución de un artículo desde un proyecto.',
      'Perdida': 'Registra la pérdida de un artículo del inventario.',
      'Mantenimiento': 'Envía un artículo a mantenimiento.'
    };

    return (
      <small className="form-text text-info">
        <i className="fas fa-info-circle mr-1"></i>
        {helpTexts[formData.tipoMovimiento]}
      </small>
    );
  };

  if (loadingData) {
    return (
      <div className="page-inner">
        <div className="text-center py-4">
          <div className="spinner-border" role="status">
            <span className="sr-only">Cargando...</span>
          </div>
          <p className="mt-2 text-muted">Cargando datos del formulario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-inner">
      <div className="page-header">
        <h4 className="page-title">
          {movement && movement.id ? 'Editar Movimiento' : 'Nuevo Movimiento de Inventario'}
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
              Movimientos
            </a>
          </li>
          <li className="separator">
            <i className="fas fa-chevron-right"></i>
          </li>
          <li className="nav-item">
            <span>{movement && movement.id ? 'Editar' : 'Nuevo'}</span>
          </li>
        </ul>
      </div>

      <div className="row">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <i className="fas fa-exchange-alt mr-2"></i>
                {movement && movement.id ? 'Editar Movimiento' : 'Registrar Nuevo Movimiento'}
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

                {errors.general && (
                  <div className="alert alert-warning alert-dismissible fade show" role="alert">
                    <strong>Advertencia:</strong> {errors.general}
                    <button type="button" className="close" data-dismiss="alert" aria-label="Close">
                      <span aria-hidden="true">&times;</span>
                    </button>
                  </div>
                )}

                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="tipoMovimiento">
                        Tipo de Movimiento <span className="text-danger">*</span>
                      </label>
                      <select
                        className={`form-control ${errors.tipoMovimiento ? 'is-invalid' : ''}`}
                        id="tipoMovimiento"
                        name="tipoMovimiento"
                        value={formData.tipoMovimiento}
                        onChange={handleChange}
                        disabled={loading}
                        required
                      >
                        <option value="">Seleccionar tipo...</option>
                        {tiposMovimiento.map(tipo => (
                          <option key={tipo.value} value={tipo.value}>
                            {tipo.label}
                          </option>
                        ))}
                      </select>
                      {errors.tipoMovimiento && (
                        <div className="invalid-feedback">
                          {errors.tipoMovimiento}
                        </div>
                      )}
                      {getTipoMovimientoHelp()}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="inventarioId">
                        Artículo/Herramienta <span className="text-danger">*</span>
                      </label>
                      <select
                        className={`form-control ${errors.inventarioId ? 'is-invalid' : ''}`}
                        id="inventarioId"
                        name="inventarioId"
                        value={formData.inventarioId}
                        onChange={handleChange}
                        disabled={loading}
                        required
                      >
                        <option value="">Seleccionar artículo...</option>
                        {inventory.map(item => (
                          <option key={item.id} value={item.id}>
                            {item.codigo} - {item.nombre} (Stock: {item.stock})
                          </option>
                        ))}
                      </select>
                      {errors.inventarioId && (
                        <div className="invalid-feedback">
                          {errors.inventarioId}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="cantidad">
                        Cantidad <span className="text-danger">*</span>
                      </label>
                      <input
                        type="number"
                        className={`form-control ${errors.cantidad ? 'is-invalid' : ''}`}
                        id="cantidad"
                        name="cantidad"
                        value={formData.cantidad}
                        onChange={handleChange}
                        min="1"
                        disabled={loading}
                        required
                      />
                      {errors.cantidad && (
                        <div className="invalid-feedback">
                          {errors.cantidad}
                        </div>
                      )}
                      {selectedItem && (
                        <small className="form-text text-muted">
                          Stock disponible: <strong>{selectedItem.stock}</strong>
                        </small>
                      )}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="fechaMovimiento">
                        Fecha de Movimiento <span className="text-danger">*</span>
                      </label>
                      <input
                        type="date"
                        className={`form-control ${errors.fechaMovimiento ? 'is-invalid' : ''}`}
                        id="fechaMovimiento"
                        name="fechaMovimiento"
                        value={formData.fechaMovimiento}
                        onChange={handleChange}
                        disabled={loading}
                        required
                      />
                      {errors.fechaMovimiento && (
                        <div className="invalid-feedback">
                          {errors.fechaMovimiento}
                        </div>
                      )}
                      <small className="form-text text-muted">
                        Por defecto se asigna la fecha actual
                      </small>
                    </div>
                  </div>
                </div>

                {/* Campos dinámicos según el tipo de movimiento */}
                <div className="row">
                  {renderMovementFields()}
                </div>

                <div className="row">
                  <div className="col-md-12">
                    <div className="form-group">
                      <label htmlFor="observacion">Observaciones</label>
                      <textarea
                        className="form-control"
                        id="observacion"
                        name="observacion"
                        value={formData.observacion}
                        onChange={handleChange}
                        rows="3"
                        placeholder="Observaciones adicionales del movimiento..."
                        disabled={loading}
                      />
                      <small className="form-text text-muted">
                        Información adicional sobre el movimiento (opcional)
                      </small>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card-action">
                <button
                  type="submit"
                  className="btn btn-success"
                  disabled={loading || loadingData}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
                      {movement && movement.id ? 'Actualizando...' : 'Registrando...'}
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save mr-2"></i>
                      {movement && movement.id ? 'Actualizar Movimiento' : 'Registrar Movimiento'}
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

        {/* Sidebar con información del artículo seleccionado */}
        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <i className="fas fa-info-circle mr-2"></i>
                Información del Artículo
              </div>
            </div>
            <div className="card-body">
              {selectedItem ? (
                <>
                  <div className="d-flex align-items-center mb-3">
                    <div className="avatar avatar-md mr-3">
                      <div className="avatar-initial bg-primary rounded">
                        <i className="fas fa-box"></i>
                      </div>
                    </div>
                    <div>
                      <h6 className="mb-0">{selectedItem.nombre}</h6>
                      <small className="text-muted">Código: {selectedItem.codigo}</small>
                    </div>
                  </div>

                  <hr />

                  <div className="info-item mb-2">
                    <span className="text-muted">Stock Actual:</span>
                    <span className={`badge float-right ${selectedItem.stock > 0 ? 'badge-success' : 'badge-danger'}`}>
                      {selectedItem.stock}
                    </span>
                  </div>

                  <div className="info-item mb-2">
                    <span className="text-muted">Categoría:</span>
                    <span className="float-right">{selectedItem.categoria?.nombre || 'Sin categoría'}</span>
                  </div>

                  <div className="info-item mb-2">
                    <span className="text-muted">Estado:</span>
                    <span className="badge badge-info float-right">{selectedItem.estadoConservacion}</span>
                  </div>

                  <div className="info-item mb-2">
                    <span className="text-muted">Marca:</span>
                    <span className="float-right">{selectedItem.marca || 'N/A'}</span>
                  </div>

                  <div className="info-item mb-2">
                    <span className="text-muted">Modelo:</span>
                    <span className="float-right">{selectedItem.modelo || 'N/A'}</span>
                  </div>

                  {selectedItem.descripcion && (
                    <>
                      <hr />
                      <div className="info-item">
                        <span className="text-muted">Descripción:</span>
                        <p className="mt-2 text-sm">{selectedItem.descripcion}</p>
                      </div>
                    </>
                  )}

                  {selectedItem.stock <= 5 && selectedItem.stock > 0 && (
                    <div className="alert alert-warning mt-3">
                      <small>
                        <i className="fas fa-exclamation-triangle mr-1"></i>
                        Stock bajo
                      </small>
                    </div>
                  )}

                  {selectedItem.stock === 0 && (
                    <div className="alert alert-danger mt-3">
                      <small>
                        <i className="fas fa-times-circle mr-1"></i>
                        Sin stock disponible
                      </small>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center text-muted">
                  <i className="fas fa-box fa-3x mb-3"></i>
                  <p>Seleccione un artículo para ver su información</p>
                </div>
              )}
            </div>
          </div>

          {/* Card con ayuda sobre tipos de movimiento */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <i className="fas fa-question-circle mr-2"></i>
                Tipos de Movimiento
              </div>
            </div>
            <div className="card-body">
              <div className="list-group list-group-flush">
                {tiposMovimiento.map(tipo => (
                  <div key={tipo.value} className="list-group-item border-0 px-0 py-2">
                    <div className="d-flex align-items-center">
                      <i className={`${tipo.icon} text-${tipo.color} mr-2`}></i>
                      <small className="font-weight-bold">{tipo.label}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovementForm;
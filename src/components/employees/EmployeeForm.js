import React, { useState, useEffect } from 'react';

const EmployeeForm = ({ employee, onSubmit, onCancel, existingEmployees = [] }) => {
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    nroDocumento: '',
    fechaNacimiento: '',
    direccion: '',
    telefono: '',
    puesto: '',
    fechaIngreso: '',
    estado: 'ACTIVO',
    userId: null,
    uniqueId: null
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  // Estados para el autocompletado
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Opciones para los campos de selección
  const puestos = [
    'GERENTE',
    'SUPERVISOR',
    'ANALISTA',
    'DESARROLLADOR',
    'DISEÑADOR',
    'VENDEDOR',
    'ASISTENTE',
    'COORDINADOR',
    'ESPECIALISTA',
    'TÉCNICO',
    'CONTADOR',
    'ADMINISTRATIVO'
  ];

  useEffect(() => {
    if (employee) {
      setFormData({
        nombres: employee.nombres || '',
        apellidos: employee.apellidos || '',
        nroDocumento: employee.nroDocumento || '',
        fechaNacimiento: employee.fechaNacimiento ? employee.fechaNacimiento.split('T')[0] : '',
        direccion: employee.direccion || '',
        telefono: employee.telefono || '',
        puesto: employee.puesto || '',
        fechaIngreso: employee.fechaIngreso ? employee.fechaIngreso.split('T')[0] : '',
        estado: employee.estado || 'ACTIVO',
        userId: employee.userId || null,
        uniqueId: employee.uniqueId || null
      });
    }
  }, [employee]);

  // Función para filtrar empleados basado en el término de búsqueda
  const filterEmployees = (term) => {
    if (!term || term.length < 2) {
      setFilteredEmployees([]);
      return;
    }

    const filtered = existingEmployees.filter(emp => {
      const fullName = `${emp.nombres} ${emp.apellidos}`.toLowerCase();
      const document = emp.nroDocumento.toLowerCase();
      const searchLower = term.toLowerCase();
      
      return fullName.includes(searchLower) || 
             document.includes(searchLower) ||
             emp.nombres.toLowerCase().includes(searchLower) ||
             emp.apellidos.toLowerCase().includes(searchLower);
    }).slice(0, 10); // Limitar a 10 resultados

    setFilteredEmployees(filtered);
  };

  // Manejar cambios en el campo de búsqueda
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowSuggestions(true);
    filterEmployees(value);
    
    // Si se borra el campo, limpiar la selección
    if (!value) {
      setSelectedEmployee(null);
      resetForm();
    }
  };

  // Seleccionar un empleado de las sugerencias
  const selectEmployee = (selectedEmp) => {
    setSelectedEmployee(selectedEmp);
    setSearchTerm(`${selectedEmp.nombres} ${selectedEmp.apellidos} - ${selectedEmp.nroDocumento}`);
    setShowSuggestions(false);
    
    // Llenar el formulario con los datos del empleado seleccionado
    setFormData({
      nombres: selectedEmp.nombres || '',
      apellidos: selectedEmp.apellidos || '',
      nroDocumento: selectedEmp.nroDocumento || '',
      fechaNacimiento: selectedEmp.fechaNacimiento ? selectedEmp.fechaNacimiento.split('T')[0] : '',
      direccion: selectedEmp.direccion || '',
      telefono: selectedEmp.telefono || '',
      puesto: selectedEmp.puesto || '',
      fechaIngreso: selectedEmp.fechaIngreso ? selectedEmp.fechaIngreso.split('T')[0] : '',
      estado: selectedEmp.estado || 'ACTIVO',
      userId: selectedEmp.userId || null,
      uniqueId: selectedEmp.uniqueId || null
    });
  };

  // Resetear formulario
  const resetForm = () => {
    setFormData({
      nombres: '',
      apellidos: '',
      nroDocumento: '',
      fechaNacimiento: '',
      direccion: '',
      telefono: '',
      puesto: '',
      fechaIngreso: '',
      estado: 'ACTIVO',
      userId: null,
      uniqueId: null
    });
  };

  // Cerrar sugerencias al hacer clic fuera
  const handleClickOutside = () => {
    setTimeout(() => setShowSuggestions(false), 200);
  };

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
    if (!formData.nombres.trim()) {
      newErrors.nombres = 'Los nombres son obligatorios';
    }

    if (!formData.apellidos.trim()) {
      newErrors.apellidos = 'Los apellidos son obligatorios';
    }

    if (!formData.nroDocumento.trim()) {
      newErrors.nroDocumento = 'El número de documento es obligatorio';
    } else if (!/^[0-9A-Za-z-]+$/.test(formData.nroDocumento)) {
      newErrors.nroDocumento = 'El formato del documento no es válido';
    }

    if (!formData.telefono.trim()) {
      newErrors.telefono = 'El teléfono es obligatorio';
    } else if (!/^[0-9+\-\s()]+$/.test(formData.telefono)) {
      newErrors.telefono = 'El formato del teléfono no es válido';
    }

    if (!formData.direccion.trim()) {
      newErrors.direccion = 'La dirección es obligatoria';
    }

    if (!formData.fechaNacimiento) {
      newErrors.fechaNacimiento = 'La fecha de nacimiento es obligatoria';
    } else {
      // Validar que no sea menor de 18 años
      const birthDate = new Date(formData.fechaNacimiento);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 18) {
        newErrors.fechaNacimiento = 'El empleado debe ser mayor de 18 años';
      }
    }

    if (!formData.fechaIngreso) {
      newErrors.fechaIngreso = 'La fecha de ingreso es obligatoria';
    } else {
      // Validar que no sea una fecha futura
      const ingresoDate = new Date(formData.fechaIngreso);
      const today = new Date();
      if (ingresoDate > today) {
        newErrors.fechaIngreso = 'La fecha de ingreso no puede ser futura';
      }
    }

    if (!formData.puesto.trim()) {
      newErrors.puesto = 'El puesto es obligatorio';
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

      if (errorMessage === 'DUPLICATE_DOCUMENT') {
        setErrors({
          nroDocumento: 'Este número de documento ya está registrado en el sistema'
        });
      } else if (errorMessage === 'DUPLICATE_NAME') {
        setErrors({
          nombres: 'Ya existe un empleado con este nombre en el sistema'
        });
      } else if (errorMessage === 'DUPLICATE_ENTRY') {
        setErrors({
          general: 'Ya existe un empleado con estos datos en el sistema'
        });
      } else if (errorMessage.includes('empleados_nro_documento_unique') ||
        errorMessage.includes('nro_documento_unique') ||
        (errorMessage.includes('Duplicate entry') && errorMessage.includes('nro_documento'))) {
        setErrors({
          nroDocumento: 'Este número de documento ya está registrado en el sistema'
        });
      } else if (errorMessage.includes('empleados_nombres_unique') ||
        errorMessage.includes('nombres_unique') ||
        (errorMessage.includes('Duplicate entry') && errorMessage.includes('nombres'))) {
        setErrors({
          nombres: 'Ya existe un empleado con este nombre en el sistema'
        });
      } else {
        // Error genérico
        setErrors({
          general: 'Ocurrió un error al procesar la solicitud. Verifique que todos los datos sean únicos.'
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
          {employee ? 'Editar Empleado' : 'Nuevo Empleado'}
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
              Empleados
            </a>
          </li>
          <li className="separator">
            <i className="fas fa-chevron-right"></i>
          </li>
          <li className="nav-item">
            <span>{employee ? 'Editar' : 'Nuevo'}</span>
          </li>
        </ul>
      </div>

      <div className="row">
        <div className="col-md-12">
          <div className="card">
            <div className="card-header">
              <div className="d-flex align-items-center">
                <h4 className="card-title">
                  {employee ? 'Editar Empleado' : 'Crear Nuevo Empleado'}
                </h4>
              </div>
            </div>

            <div className="card-body">
              {/* Campo de búsqueda - SOLO para nuevo empleado */}
              {!employee && (
                <div className="row mb-4">
                  <div className="col-md-12">
                    <div className="form-group">
                      <label htmlFor="employeeSearch">
                        <i className="fas fa-search mr-2"></i>
                        Buscar Empleado Existente (Opcional)
                      </label>
                      <div className="position-relative">
                        <input
                          type="text"
                          className="form-control"
                          id="employeeSearch"
                          value={searchTerm}
                          onChange={handleSearchChange}
                          onBlur={handleClickOutside}
                          placeholder="Buscar por nombre, apellido o número de documento..."
                        />
                        
                        {/* Lista de sugerencias */}
                        {showSuggestions && filteredEmployees.length > 0 && (
                          <div className="position-absolute w-100" style={{ 
                            top: '100%', 
                            zIndex: 1000,
                            maxHeight: '200px',
                            overflowY: 'auto',
                            backgroundColor: '#fff',
                            border: '1px solid #dee2e6',
                            borderTop: 'none',
                            borderRadius: '0 0 0.25rem 0.25rem',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                          }}>
                            {filteredEmployees.map((emp) => (
                              <div
                                key={emp.id}
                                className="p-2 border-bottom"
                                style={{ 
                                  cursor: 'pointer',
                                  transition: 'background-color 0.2s'
                                }}
                                onMouseDown={() => selectEmployee(emp)}
                                onMouseEnter={(e) => {
                                  e.target.style.backgroundColor = '#f8f9fa';
                                }}
                                onMouseLeave={(e) => {
                                  e.target.style.backgroundColor = 'transparent';
                                }}
                              >
                                <div className="d-flex justify-content-between">
                                  <div>
                                    <strong>{emp.nombres} {emp.apellidos}</strong>
                                    <br />
                                    <small className="text-muted">
                                      Doc: {emp.nroDocumento} | Puesto: {emp.puesto}
                                    </small>
                                  </div>
                                  <div className="text-right">
                                    <small className={`badge ${emp.estado === 'ACTIVO' ? 'badge-success' : 'badge-secondary'}`}>
                                      {emp.estado}
                                    </small>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {/* Mensaje cuando no hay resultados */}
                        {showSuggestions && searchTerm.length >= 2 && filteredEmployees.length === 0 && (
                          <div className="position-absolute w-100" style={{ 
                            top: '100%', 
                            zIndex: 1000,
                            backgroundColor: '#fff',
                            border: '1px solid #dee2e6',
                            borderTop: 'none',
                            borderRadius: '0 0 0.25rem 0.25rem',
                            padding: '1rem',
                            textAlign: 'center',
                            color: '#6c757d'
                          }}>
                            <i className="fas fa-search mr-2"></i>
                            No se encontraron empleados con ese criterio
                          </div>
                        )}
                      </div>
                      
                      <small className="form-text text-muted">
                        Escriba al menos 2 caracteres para buscar empleados existentes
                      </small>
                      
                      {/* Botón para limpiar búsqueda */}
                      {selectedEmployee && (
                        <div className="mt-2">
                          <div className="alert alert-info">
                            <i className="fas fa-user mr-2"></i>
                            <strong>Empleado seleccionado:</strong> {selectedEmployee.nombres} {selectedEmployee.apellidos}
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-secondary ml-2"
                              onClick={() => {
                                setSelectedEmployee(null);
                                setSearchTerm('');
                                resetForm();
                              }}
                            >
                              <i className="fas fa-times mr-1"></i>
                              Limpiar
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

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

                  {/* Información Personal */}
                  <div className="col-md-12">
                    <h5 className="mb-3">
                      <i className="fas fa-user mr-2"></i>
                      Información Personal
                    </h5>
                    <hr />
                  </div>

                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="nombres">
                        Nombres <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control ${errors.nombres ? 'is-invalid' : ''}`}
                        id="nombres"
                        name="nombres"
                        value={formData.nombres}
                        onChange={handleChange}
                        placeholder="Ingrese los nombres"
                      />
                      {errors.nombres && (
                        <div className="invalid-feedback">{errors.nombres}</div>
                      )}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="apellidos">
                        Apellidos <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control ${errors.apellidos ? 'is-invalid' : ''}`}
                        id="apellidos"
                        name="apellidos"
                        value={formData.apellidos}
                        onChange={handleChange}
                        placeholder="Ingrese los apellidos"
                      />
                      {errors.apellidos && (
                        <div className="invalid-feedback">{errors.apellidos}</div>
                      )}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="nroDocumento">
                        Número de Documento <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control ${errors.nroDocumento ? 'is-invalid' : ''}`}
                        id="nroDocumento"
                        name="nroDocumento"
                        value={formData.nroDocumento}
                        onChange={handleChange}
                        placeholder="Ej: 123456789"
                      />
                      {errors.nroDocumento && (
                        <div className="invalid-feedback">{errors.nroDocumento}</div>
                      )}
                      <small className="form-text text-muted">
                        El número de documento debe ser único en el sistema
                      </small>
                    </div>
                  </div>

                  <div className="col-md-6">
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
                        placeholder="987654321"
                      />
                      {errors.telefono && (
                        <div className="invalid-feedback">{errors.telefono}</div>
                      )}
                    </div>
                  </div>

                  <div className="col-md-12">
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
                        placeholder="Ingrese la dirección"
                        rows="2"
                      />
                      {errors.direccion && (
                        <div className="invalid-feedback">{errors.direccion}</div>
                      )}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="fechaNacimiento">
                        Fecha de Nacimiento <span className="text-danger">*</span>
                      </label>
                      <input
                        type="date"
                        className={`form-control ${errors.fechaNacimiento ? 'is-invalid' : ''}`}
                        id="fechaNacimiento"
                        name="fechaNacimiento"
                        value={formData.fechaNacimiento}
                        onChange={handleChange}
                        max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                      />
                      {errors.fechaNacimiento && (
                        <div className="invalid-feedback">{errors.fechaNacimiento}</div>
                      )}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="fechaIngreso">
                        Fecha de Ingreso <span className="text-danger">*</span>
                      </label>
                      <input
                        type="date"
                        className={`form-control ${errors.fechaIngreso ? 'is-invalid' : ''}`}
                        id="fechaIngreso"
                        name="fechaIngreso"
                        value={formData.fechaIngreso}
                        onChange={handleChange}
                        max={new Date().toISOString().split('T')[0]}
                      />
                      {errors.fechaIngreso && (
                        <div className="invalid-feedback">{errors.fechaIngreso}</div>
                      )}
                    </div>
                  </div>

                  {/* Información Laboral */}
                  <div className="col-md-12 mt-4">
                    <h5 className="mb-3">
                      <i className="fas fa-briefcase mr-2"></i>
                      Información Laboral
                    </h5>
                    <hr />
                  </div>

                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="puesto">
                        Puesto <span className="text-danger">*</span>
                      </label>
                      <select
                        className={`form-control ${errors.puesto ? 'is-invalid' : ''}`}
                        id="puesto"
                        name="puesto"
                        value={formData.puesto}
                        onChange={handleChange}
                      >
                        <option value="">Seleccione un puesto</option>
                        {puestos.map(puesto => (
                          <option key={puesto} value={puesto}>{puesto}</option>
                        ))}
                      </select>
                      {errors.puesto && (
                        <div className="invalid-feedback">{errors.puesto}</div>
                      )}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="estado">
                        Estado
                      </label>
                      <select
                        className="form-control"
                        id="estado"
                        name="estado"
                        value={formData.estado}
                        onChange={handleChange}
                      >
                        <option value="ACTIVO">ACTIVO</option>
                        <option value="INACTIVO">INACTIVO</option>
                      </select>
                    </div>
                  </div>
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
                          {employee ? 'Actualizando...' : 'Creando...'}
                        </>
                      ) : (
                        <>
                          <i className={`fas ${employee ? 'fa-save' : 'fa-plus'} mr-2`}></i>
                          {employee ? 'Actualizar Empleado' : 'Crear Empleado'}
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

export default EmployeeForm;
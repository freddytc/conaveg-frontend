import React, { useState, useEffect } from 'react';

const UserForm = ({ user, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    userName: '',
    email: '',
    password: '',
    role: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [roles, setRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(true);

  // Cargar roles al montar el componente
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setLoadingRoles(true);
        const response = await fetch('http://localhost:8080/conaveg/api/roles');
        
        if (!response.ok) {
          throw new Error('Error al obtener los roles');
        }
        
        const data = await response.json();
        setRoles(data);
      } catch (error) {
        console.error('Error al cargar roles:', error);
        // Fallback a roles por defecto si falla la carga
        setRoles([
          { id: 1, nombre: 'EMPLEADO' },
          { id: 2, nombre: 'GERENTE' },
          { id: 3, nombre: 'ADMINISTRADOR' }
        ]);
      } finally {
        setLoadingRoles(false);
      }
    };

    fetchRoles();
  }, []);

  useEffect(() => {
    if (user) {
      setFormData({
        userName: user.userName || '',
        email: user.email || '',
        password: '', // No mostrar password existente
        role: user.role?.nombre || ''
      });
    } else if (roles.length > 0) {
      // Para usuarios nuevos, seleccionar EMPLEADO por defecto
      const defaultRole = roles.find(role => role.nombre === 'EMPLEADO') || roles[0];
      setFormData(prev => ({
        ...prev,
        role: defaultRole.nombre
      }));
    }
  }, [user, roles]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error del campo que se está modificando
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.userName.trim()) {
      newErrors.userName = 'El nombre de usuario es obligatorio';
    } else if (formData.userName.length < 3 || formData.userName.length > 50) {
      newErrors.userName = 'El nombre de usuario debe tener entre 3 y 50 caracteres';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Debe proporcionar un email válido';
    }

    // Password es requerida solo para usuarios nuevos
    if (!user && !formData.password) {
      newErrors.password = 'La contraseña es obligatoria';
    } else if (formData.password) {
      if (formData.password.length < 8 || formData.password.length > 100) {
        newErrors.password = 'La contraseña debe tener entre 8 y 100 caracteres';
      } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/.test(formData.password)) {
        newErrors.password = 'La contraseña debe contener al menos una letra minúscula, una mayúscula y un número';
      }
    }

    if (!formData.role) {
      newErrors.role = 'El rol es requerido';
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
        userName: formData.userName.trim(),
        email: formData.email.trim(),
        role: formData.role
      };
      
      // Solo incluir password si fue proporcionada
      if (formData.password && formData.password.trim()) {
        submitData.password = formData.password.trim();
      }

      await onSubmit(submitData);
    } catch (error) {
      console.error('Error en formulario:', error);
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener la descripción amigable del rol
  const getRoleDisplayName = (roleName) => {
    const roleMap = {
      'ADMINISTRADOR': 'Administrador',
      'GERENTE': 'Gerente', 
      'EMPLEADO': 'Empleado',
      'USER': 'Usuario'
    };
    return roleMap[roleName] || roleName;
  };

  return (
    <div className="page-inner">
      <div className="page-header">
        <h4 className="page-title">
          {user ? 'Editar Usuario' : 'Nuevo Usuario'}
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
              Usuarios
            </a>
          </li>
          <li className="separator">
            <i className="fas fa-chevron-right"></i>
          </li>
          <li className="nav-item">
            <span>{user ? 'Editar' : 'Nuevo'}</span>
          </li>
        </ul>
      </div>

      <div className="row">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                {user ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
              </div>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="card-body">
                {/* Error general del formulario */}
                {errors.submit && (
                  <div className="alert alert-danger">
                    <strong>Error:</strong> {errors.submit}
                  </div>
                )}

                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="userName">
                        Nombre de Usuario <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control ${errors.userName ? 'is-invalid' : ''}`}
                        id="userName"
                        name="userName"
                        value={formData.userName}
                        onChange={handleChange}
                        placeholder="Ingrese nombre de usuario"
                        disabled={loading}
                        required
                      />
                      {errors.userName && (
                        <div className="invalid-feedback">
                          {errors.userName}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="email">
                        Email <span className="text-danger">*</span>
                      </label>
                      <input
                        type="email"
                        className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Ingrese email"
                        disabled={loading}
                        required
                      />
                      {errors.email && (
                        <div className="invalid-feedback">
                          {errors.email}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="password">
                        Contraseña {!user && <span className="text-danger">*</span>}
                      </label>
                      <input
                        type="password"
                        className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder={user ? "Dejar vacío para mantener actual" : "Ingrese contraseña"}
                        disabled={loading}
                        required={!user}
                      />
                      {errors.password && (
                        <div className="invalid-feedback">
                          {errors.password}
                        </div>
                      )}
                      {user && (
                        <small className="form-text text-muted">
                          Dejar vacío para mantener la contraseña actual
                        </small>
                      )}
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="role">
                        Rol <span className="text-danger">*</span>
                      </label>
                      <select
                        className={`form-control ${errors.role ? 'is-invalid' : ''}`}
                        id="role"
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        disabled={loading || loadingRoles}
                        required
                      >
                        <option value="">
                          {loadingRoles ? 'Cargando roles...' : 'Seleccionar rol'}
                        </option>
                        {roles.map(role => (
                          <option key={role.id} value={role.nombre}>
                            {getRoleDisplayName(role.nombre)}
                          </option>
                        ))}
                      </select>
                      {errors.role && (
                        <div className="invalid-feedback">
                          {errors.role}
                        </div>
                      )}
                      {loadingRoles && (
                        <small className="form-text text-muted">
                          <i className="fas fa-spinner fa-spin mr-1"></i>
                          Cargando roles disponibles...
                        </small>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="card-action">
                <button
                  type="submit"
                  className="btn btn-success"
                  disabled={loading || loadingRoles}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
                      {user ? 'Actualizando...' : 'Creando...'}
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save mr-2"></i>
                      {user ? 'Actualizar Usuario' : 'Crear Usuario'}
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
        
        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <div className="card-title">Requerimientos</div>
            </div>
            <div className="card-body">
              <p><strong>Contraseña debe contener:</strong></p>
              <ul>
                <li>Mínimo 8 caracteres</li>
                <li>Al menos una letra minúscula</li>
                <li>Al menos una letra mayúscula</li>
                <li>Al menos un número</li>
              </ul>
              
              <p><strong>Nombre de usuario:</strong></p>
              <ul>
                <li>Entre 3 y 50 caracteres</li>
                <li>Debe ser único</li>
              </ul>

              {/* Información de roles disponibles */}
              {roles.length > 0 && (
                <>
                  <p><strong>Roles disponibles:</strong></p>
                  <ul>
                    {roles.map(role => (
                      <li key={role.id}>
                        <strong>{getRoleDisplayName(role.nombre)}</strong>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserForm;
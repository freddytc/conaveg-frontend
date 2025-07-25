import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import '../styles/Login.css';

const Login = ({ onLoginSuccess }) => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',        // Cambiado de userName a email
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones del frontend
    if (!formData.email.trim() || !formData.password.trim()) {
      setError('Por favor complete todos los campos');
      return;
    }

    // Validación básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Por favor ingrese un email válido');
      return;
    }

    // Validación de contraseña mínima
    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('Datos del formulario:', formData);
      console.log('Intentando login con backend...');

      const result = await login(formData);
      console.log('Login exitoso:', result);

      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } catch (error) {
      console.error('Error en login:', error);
      setError(error.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login">
      <div className="container-fluid">
        <div className="row justify-content-center">
          <div className="col-12 login-container">

            {/* Card principal con diseño dividido */}
            <div className="card login-card">
              <div className="row login-row">

                {/* Panel Izquierdo - Información */}
                <div className="col-lg-6 d-flex login-left-panel">
                  <div className="login-left-content">

                    {/* Logo y título */}
                    <div className="mb-4">
                      <div className="login-logo">
                        <i className="fas fa-leaf"></i>
                      </div>
                      <h1 className="login-title">
                        CONAVEG
                      </h1>
                      <p className="login-subtitle">
                        Sistema Integral de Gestión<br />
                      </p>
                    </div>

                    {/* Lista de características */}
                    <div className="login-features">
                      <div className="login-feature">
                        <div className="login-feature-icon">
                          <i className="fas fa-users"></i>
                        </div>
                        <div className="login-feature-text">
                          <strong>Gestión de Personal</strong><br />
                        </div>
                      </div>

                      <div className="login-feature">
                        <div className="login-feature-icon">
                          <i className="fas fa-boxes"></i>
                        </div>
                        <div className="login-feature-text">
                          <strong>Control de Inventarios</strong><br />
                        </div>
                      </div>

                      <div className="login-feature">
                        <div className="login-feature-icon">
                          <i className="fas fa-project-diagram"></i>
                        </div>
                        <div className="login-feature-text">
                          <strong>Gestión de Proyectos</strong><br />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Panel Derecho - Formulario */}
                <div className="col-lg-6 d-flex login-right-panel">
                  <div className="login-right-content">

                    {/* Título del formulario */}
                    <div className="text-center mb-4">
                      <h2 className="login-form-title">
                        Bienvenido
                      </h2>
                      <p className="text-muted login-form-subtitle">
                        Ingrese sus credenciales para acceder al sistema
                      </p>
                    </div>

                    {/* Error */}
                    {error && (
                      <div className="alert alert-danger d-flex align-items-center login-error">
                        <i className="fas fa-exclamation-triangle mr-2"></i>
                        <span>{error}</span>
                      </div>
                    )}

                    {/* Formulario */}
                    <form onSubmit={handleSubmit}>
                      <div className="form-group login-form-group">
                        <div className="input-group login-input-group">
                          <div className="input-group-prepend">
                            <span className="input-group-text login-input-prepend">
                              <i className="fas fa-envelope text-muted"></i>
                            </span>
                          </div>
                          <input
                            id="email"
                            name="email"
                            type="email"
                            className={`form-control login-input ${error ? 'is-invalid' : ''}`}
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Ingrese su email"
                            required
                            disabled={loading}
                            autoComplete="email"
                          />
                        </div>
                      </div>

                      <div className="form-group login-form-group">
                        <div className="input-group login-input-group">
                          <div className="input-group-prepend">
                            <span className="input-group-text login-input-prepend">
                              <i className="fas fa-lock text-muted"></i>
                            </span>
                          </div>
                          <input
                            id="password"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            className={`form-control login-password-input ${error ? 'is-invalid' : ''}`}
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Ingrese su contraseña"
                            required
                            disabled={loading}
                            autoComplete="current-password"
                          />
                          <div className="input-group-append">
                            <button
                              type="button"
                              className="btn btn-outline-secondary login-input-append"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-muted`}></i>
                            </button>
                          </div>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="btn btn-block login-submit-btn"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
                            Iniciando sesión...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-sign-in-alt mr-2"></i>
                            Ingresar al Sistema
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
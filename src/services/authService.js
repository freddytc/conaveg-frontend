import { api } from './api';

export const authService = {
  login: async (credentials) => {
    try {
      console.log('Datos enviados al backend:', credentials);
      
      const response = await api.post('/auth/login', {
        email: credentials.email,
        password: credentials.password
      });

      if (response.token && response.user) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        console.log('Login exitoso:', response.user);
        return response;
      } else {
        throw new Error('Respuesta del servidor inválida');
      }
      
    } catch (error) {
      console.error('Error en login:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      throw new Error(error.message || 'Error al iniciar sesión');
    }
  },

  logout: async () => {
    // Versión simplificada - solo limpiar localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    console.log('Logout completado');
  },

  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return !!(token && user);
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  getToken: () => {
    return localStorage.getItem('token');
  },

  // Validación simplificada para desarrollo
  validateTokenSimple: () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (!token || !user) return false;
    
    try {
      // Verificar que el token no esté expirado (si es JWT)
      if (token.includes('.')) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Date.now() / 1000;
        
        if (payload.exp && payload.exp < currentTime) {
          console.log('Token expirado');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error validando token:', error);
      return true; // En caso de error, asumir que es válido por ahora
    }
  },

  // Métodos adicionales simplificados
  validateToken: async () => {
    return this.validateTokenSimple();
  },

  getCurrentUserFromServer: async () => {
    return this.getCurrentUser();
  },

  refreshToken: async () => {
    throw new Error('Refresh token no implementado aún');
  }
};
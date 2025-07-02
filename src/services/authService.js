import { api } from './api';

// Credenciales ficticias para desarrollo
const MOCK_USERS = [
  {
    email: 'admin@conaveg.com',
    password: 'admin123',
    user: {
      id: 1,
      userName: 'admin',
      email: 'admin@conaveg.com',
      role: 'ADMIN',
      firstName: 'Administrador',
      lastName: 'Sistema'
    },
    token: 'mock-jwt-token-admin-123'
  },
  {
    email: 'gerente@conaveg.com',
    password: 'gerente123',
    user: {
      id: 2,
      userName: 'gerente',
      email: 'gerente@conaveg.com',
      role: 'GERENTE',
      firstName: 'Gerente',
      lastName: 'General'
    },
    token: 'mock-jwt-token-gerente-456'
  },
  {
    email: 'empleado@conaveg.com',
    password: 'empleado123',
    user: {
      id: 3,
      userName: 'empleado',
      email: 'empleado@conaveg.com',
      role: 'EMPLEADO',
      firstName: 'Empleado',
      lastName: 'Test'
    },
    token: 'mock-jwt-token-empleado-789'
  }
];

export const authService = {
  // Login con credenciales ficticias
  login: async (credentials) => {
    try {
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Buscar usuario ficticio
      const mockUser = MOCK_USERS.find(user => 
        user.email === credentials.userName && user.password === credentials.password
      );
      
      if (mockUser) {
        // Simular respuesta exitosa
        localStorage.setItem('token', mockUser.token);
        localStorage.setItem('user', JSON.stringify(mockUser.user));
        
        console.log('Login ficticio exitoso:', mockUser.user);
        return {
          token: mockUser.token,
          user: mockUser.user
        };
      } else {
        throw new Error('Credenciales inválidas');
      }
      
    } catch (error) {
      console.error('Error en login ficticio:', error);
      throw new Error(error.message || 'Error al iniciar sesión');
    }
  },

  // Logout
  logout: async () => {
    try {
      // Simular llamada al backend
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log('Logout ficticio ejecutado');
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      // Limpiar datos locales siempre
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  // Verificar si está autenticado
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Obtener usuario actual
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Obtener token
  getToken: () => {
    return localStorage.getItem('token');
  },

  // Validar token (ficticio)
  validateToken: async () => {
    try {
      const token = localStorage.getItem('token');
      // Simular validación
      await new Promise(resolve => setTimeout(resolve, 300));
      return token && token.startsWith('mock-jwt-token');
    } catch (error) {
      return false;
    }
  },

  // Obtener información del usuario desde el backend (ficticio)
  getCurrentUserFromServer: async () => {
    try {
      const user = authService.getCurrentUser();
      // Simular respuesta del servidor
      await new Promise(resolve => setTimeout(resolve, 500));
      return user;
    } catch (error) {
      throw new Error('Error al obtener información del usuario');
    }
  },

  // Obtener credenciales ficticias para mostrar en desarrollo
  getMockCredentials: () => {
    return MOCK_USERS.map(user => ({
      email: user.email,
      password: user.password,
      role: user.user.role
    }));
  }
};
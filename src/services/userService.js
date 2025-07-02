import { api } from './api';

export const userService = {
  // Obtener todos los usuarios
  getAllUsers: async () => {
    try {
      const response = await api.get('/users');
      return response;
    } catch (error) {
      console.error('Error en getAllUsers:', error);
      throw new Error('Error al obtener usuarios: ' + error.message);
    }
  },

  // Obtener usuario por ID
  getUserById: async (id) => {
    try {
      const response = await api.get(`/users/${id}`);
      return response;
    } catch (error) {
      throw new Error('Error al obtener usuario: ' + error.message);
    }
  },

  // Crear usuario - CORREGIDO CON 4 ROLES
  createUser: async (userData) => {
    try {
      // Mapear roles a roleId - 4 ROLES
      const roleMapping = {
        'ADMINISTRADOR': 1,
        'GERENTE': 2,
        'EMPLEADO': 3,
        'USER': 4
      };

      const userCreateDTO = {
        userName: userData.userName,
        email: userData.email,
        password: userData.password,
        roleId: roleMapping[userData.role] || 4 // Default USER
      };
      
      const response = await api.post('/users', userCreateDTO);
      return response;
    } catch (error) {
      throw new Error('Error al crear usuario: ' + error.message);
    }
  },

  // Actualizar usuario - CORREGIDO CON 4 ROLES
  updateUser: async (id, userData) => {
    try {
      // Mapear roles a roleId - 4 ROLES
      const roleMapping = {
        'ADMINISTRADOR': 1,
        'GERENTE': 2,
        'EMPLEADO': 3,
        'USER': 4
      };

      const userCreateDTO = {
        userName: userData.userName,
        email: userData.email,
        roleId: roleMapping[userData.role] || 4 // Default USER
      };
      
      // Solo incluir password si fue proporcionada
      if (userData.password && userData.password.trim() !== '') {
        userCreateDTO.password = userData.password;
      }
      
      const response = await api.put(`/users/${id}`, userCreateDTO);
      return response;
    } catch (error) {
      throw new Error('Error al actualizar usuario: ' + error.message);
    }
  },

  // Eliminar usuario
  deleteUser: async (id) => {
    try {
      await api.delete(`/users/${id}`);
      return true;
    } catch (error) {
      throw new Error('Error al eliminar usuario: ' + error.message);
    }
  },

  // Cambiar estado del usuario
  toggleUserStatus: async (id) => {
    try {
      const user = await userService.getUserById(id);
      const newEstado = user.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
      
      // Simulación hasta que agregues endpoint en backend
      const updatedUser = { ...user, estado: newEstado };
      
      console.warn('toggleUserStatus: Simulando cambio de estado. Agregar endpoint en backend para persistir.');
      return updatedUser;
    } catch (error) {
      throw new Error('Error al cambiar estado del usuario: ' + error.message);
    }
  }
};
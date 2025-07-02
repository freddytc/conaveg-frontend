import { api } from './api';

export const movementService = {
  getAllMovements: async () => {
    try {
      const response = await api.get('/movimientos-inventario');
      return response.data || response;
    } catch (error) {
      console.error('Error obteniendo movimientos:', error);
      throw new Error(error.message || 'Error al obtener movimientos');
    }
  },

  getMovementById: async (id) => {
    try {
      const response = await api.get(`/movimientos-inventario/${id}`);
      return response.data || response;
    } catch (error) {
      console.error('Error obteniendo movimiento:', error);
      throw new Error(error.message || 'Error al obtener movimiento');
    }
  },

  createMovement: async (movementData) => {
    try {
      const response = await api.post('/movimientos-inventario', movementData);
      return response.data || response;
    } catch (error) {
      console.error('Error creando movimiento:', error);
      throw new Error(error.message || 'Error al crear movimiento');
    }
  },

  updateMovement: async (id, movementData) => {
    try {
      const response = await api.put(`/movimientos-inventario/${id}`, movementData);
      return response.data || response;
    } catch (error) {
      console.error('Error actualizando movimiento:', error);
      throw new Error(error.message || 'Error al actualizar movimiento');
    }
  },

  deleteMovement: async (id) => {
    try {
      await api.delete(`/movimientos-inventario/${id}`);
    } catch (error) {
      console.error('Error eliminando movimiento:', error);
      throw new Error(error.message || 'Error al eliminar movimiento');
    }
  }
};

export default movementService;
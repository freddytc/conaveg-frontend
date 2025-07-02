import { api } from './api';

export const assignmentService = {
  getAllAssignments: async () => {
    try {
      const response = await api.get('/asignaciones-proyectos-empleado');
      return response;
    } catch (error) {
      console.error('Error al obtener asignaciones:', error);
      throw error;
    }
  },

  getAssignmentById: async (id) => {
    try {
      const response = await api.get(`/asignaciones-proyectos-empleado/${id}`);
      return response;
    } catch (error) {
      console.error('Error al obtener asignación:', error);
      throw error;
    }
  },

  createAssignment: async (assignmentData) => {
    try {
      const dataToSend = {
        empleadoId: assignmentData.empleadoId,
        proyectoId: assignmentData.proyectoId,
        fechaAsignacion: assignmentData.fechaAsignacion,
        fechaFinAsignacion: assignmentData.fechaFinAsignacion,
        rol: assignmentData.rol
      };
      
      const response = await api.post('/asignaciones-proyectos-empleado', dataToSend);
      return response;
    } catch (error) {
      console.error('Error al crear asignación:', error);
      throw error;
    }
  },

  updateAssignment: async (id, assignmentData) => {
    try {
      const dataToSend = {
        empleadoId: assignmentData.empleadoId,
        proyectoId: assignmentData.proyectoId,
        fechaAsignacion: assignmentData.fechaAsignacion,
        fechaFinAsignacion: assignmentData.fechaFinAsignacion,
        rol: assignmentData.rol
      };
      
      const response = await api.put(`/asignaciones-proyectos-empleado/${id}`, dataToSend);
      return response;
    } catch (error) {
      console.error('Error al actualizar asignación:', error);
      throw error;
    }
  },

  deleteAssignment: async (id) => {
    try {
      const response = await api.delete(`/asignaciones-proyectos-empleado/${id}`);
      return response;
    } catch (error) {
      console.error('Error al eliminar asignación:', error);
      throw error;
    }
  }
};
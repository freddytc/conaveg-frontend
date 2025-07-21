import { api } from './api';

export const attendanceService = {
  // Obtener todas las asistencias
  getAll: () => api.get('/asistencias'),
  
  // Obtener asistencia por ID
  getById: (id) => api.get(`/asistencias/${id}`),
  
  // Crear nueva asistencia
  create: (asistencia) => api.post('/asistencias', asistencia),
  
  // Actualizar asistencia
  update: (id, asistencia) => api.put(`/asistencias/${id}`, asistencia),
  
  // Eliminar asistencia
  delete: (id) => api.delete(`/asistencias/${id}`),

  //AGREGAR REGISTRO RÁPIDO
  registroRapido: (datos) => api.post('/asistencias/registro-rapido', datos)
};
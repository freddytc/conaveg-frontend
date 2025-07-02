import { api } from './api';

export const invoiceService = {
  // Obtener todas las facturas
  getAll: () => api.get('/facturas'),
  
  // Obtener factura por ID
  getById: (id) => api.get(`/facturas/${id}`),
  
  // Crear nueva factura
  create: (factura) => api.post('/facturas', factura),
  
  // Actualizar factura
  update: (id, factura) => api.put(`/facturas/${id}`, factura),
  
  // Eliminar factura
  delete: (id) => api.delete(`/facturas/${id}`)
};
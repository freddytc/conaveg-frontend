import { api } from './api';

export const proveedorService = {
  // Obtener todos los proveedores
  getAll: () => api.get('/proveedores'),
  
  // Obtener proveedor por ID
  getById: (id) => api.get(`/proveedores/${id}`),
  
  // Crear nuevo proveedor
  create: (proveedor) => api.post('/proveedores', proveedor),
  
  // Actualizar proveedor
  update: (id, proveedor) => api.put(`/proveedores/${id}`, proveedor),
  
  // Eliminar proveedor
  delete: (id) => api.delete(`/proveedores/${id}`)
};
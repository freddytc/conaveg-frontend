import { api } from './api';

export const invoiceService = {
  // Obtener todas las facturas
  getAll: () => api.get('/facturas'),

  // Obtener factura por ID
  getById: (id) => api.get(`/facturas/${id}`),

  // Crear nueva factura sin archivo
  create: (factura) => api.post('/facturas', factura),

  // Crear nueva factura con archivo PDF
  createWithFile: async (formData) => {
    try {
      // Extraer archivo y parámetros del FormData
      let file = null;
      const params = {};
      
      for (let [key, value] of formData.entries()) {
        if (key === 'file') {
          file = value;
        } else {
          params[key] = value;
        }
      }
      
      if (!file) {
        throw new Error('No se encontró el archivo en FormData');
      }
      
      // Upload con query parameters
      const baseUrl = 'http://localhost:8080/conaveg/api/facturas/with-file';
      const token = localStorage.getItem('token');
      
      return await api.uploadWithQueryParams(baseUrl, params, file, token);
    } catch (error) {
      console.error('Error al crear factura con archivo:', error);
      throw error;
    }
  },

  // Actualizar factura
  update: (id, factura) => api.patch(`/facturas/${id}`, factura), // 👈 CAMBIO AQUÍ

  // Eliminar factura
  delete: (id) => api.delete(`/facturas/${id}`),

  // Descargar archivo PDF de factura
  downloadFile: async (facturaId) => {
    try {
      return await api.get(`/facturas/${facturaId}/download`, {
        responseType: 'blob',
        headers: {
          'Accept': 'application/pdf',
        },
      });
    } catch (error) {
      console.error('Error al descargar archivo:', error);
      throw error;
    }
  }
};
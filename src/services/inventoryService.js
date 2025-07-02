import { api } from './api';

export const inventoryService = {
  // Obtener todos los productos del inventario
  getAllInventory: async () => {
    try {
      const response = await api.get('/inventario');
      return response;
    } catch (error) {
      console.error('Error en getAllInventory:', error);
      throw new Error('Error al obtener inventario: ' + error.message);
    }
  },

  // Obtener producto por ID
  getInventoryById: async (id) => {
    try {
      const response = await api.get(`/inventario/${id}`);
      return response;
    } catch (error) {
      throw new Error('Error al obtener producto: ' + error.message);
    }
  },

  // Crear producto con manejo específico de errores
  createInventory: async (inventoryData) => {
    try {
      const inventarioDTO = {
        categoriaId: inventoryData.categoriaId || null,
        codigo: inventoryData.codigo,
        nombre: inventoryData.nombre,
        descripcion: inventoryData.descripcion,
        marca: inventoryData.marca,
        modelo: inventoryData.modelo,
        nroSerie: inventoryData.nroSerie,
        stock: parseInt(inventoryData.stock) || 0,
        unidadMedida: inventoryData.unidadMedida,
        fechaAquisicion: inventoryData.fechaAquisicion,
        estadoConservacion: inventoryData.estadoConservacion
      };
      
      const response = await api.post('/inventario', inventarioDTO);
      return response;
    } catch (error) {
      console.error('Error en createInventory:', error);
      
      // Analizar el mensaje de error específico
      const errorMessage = error.message || '';
      
      // Error de código duplicado
      if (errorMessage.includes('inventario_codigo_unique') || 
          errorMessage.includes('codigo_unique')) {
        throw new Error('DUPLICATE_CODE');
      }
      
      // Error de número de serie duplicado
      if (errorMessage.includes('inventario_nro_serie_unique') || 
          errorMessage.includes('nro_serie_unique')) {
        throw new Error('DUPLICATE_SERIAL');
      }
      
      // Error genérico de entrada duplicada
      if (errorMessage.includes('Duplicate entry')) {
        if (errorMessage.includes('codigo')) {
          throw new Error('DUPLICATE_CODE');
        }
        if (errorMessage.includes('nro_serie')) {
          throw new Error('DUPLICATE_SERIAL');
        }
        throw new Error('DUPLICATE_ENTRY');
      }
      
      throw error;
    }
  },

  // Actualizar producto con manejo específico de errores
  updateInventory: async (id, inventoryData) => {
    try {
      const inventarioDTO = {
        categoriaId: inventoryData.categoriaId || null,
        codigo: inventoryData.codigo,
        nombre: inventoryData.nombre,
        descripcion: inventoryData.descripcion,
        marca: inventoryData.marca,
        modelo: inventoryData.modelo,
        nroSerie: inventoryData.nroSerie,
        stock: parseInt(inventoryData.stock) || 0,
        unidadMedida: inventoryData.unidadMedida,
        fechaAquisicion: inventoryData.fechaAquisicion,
        estadoConservacion: inventoryData.estadoConservacion
      };
      
      const response = await api.put(`/inventario/${id}`, inventarioDTO);
      return response;
    } catch (error) {
      console.error('Error en updateInventory:', error);
      
      // Analizar el mensaje de error específico
      const errorMessage = error.message || '';
      
      // Error de código duplicado
      if (errorMessage.includes('inventario_codigo_unique') || 
          errorMessage.includes('codigo_unique')) {
        throw new Error('DUPLICATE_CODE');
      }
      
      // Error de número de serie duplicado
      if (errorMessage.includes('inventario_nro_serie_unique') || 
          errorMessage.includes('nro_serie_unique')) {
        throw new Error('DUPLICATE_SERIAL');
      }
      
      // Error genérico de entrada duplicada
      if (errorMessage.includes('Duplicate entry')) {
        if (errorMessage.includes('codigo')) {
          throw new Error('DUPLICATE_CODE');
        }
        if (errorMessage.includes('nro_serie')) {
          throw new Error('DUPLICATE_SERIAL');
        }
        throw new Error('DUPLICATE_ENTRY');
      }
      
      throw error;
    }
  },

  // Eliminar producto
  deleteInventory: async (id) => {
    try {
      await api.delete(`/inventario/${id}`);
      return true;
    } catch (error) {
      throw new Error('Error al eliminar producto: ' + error.message);
    }
  }
};
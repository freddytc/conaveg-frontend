import { api } from './api';

export const employeeService = {
  // Obtener todos los empleados
  getAllEmployees: async () => {
    try {
      const response = await api.get('/empleados');
      return response;
    } catch (error) {
      console.error('Error en getAllEmployees:', error);
      throw new Error('Error al obtener empleados: ' + error.message);
    }
  },

  // Obtener empleado por ID
  getEmployeeById: async (id) => {
    try {
      const response = await api.get(`/empleados/${id}`);
      return response;
    } catch (error) {
      throw new Error('Error al obtener empleado: ' + error.message);
    }
  },

  // Crear empleado con manejo específico de errores
  createEmployee: async (employeeData) => {
    try {
      const empleadoDTO = {
        userId: employeeData.userId || null,
        nombres: employeeData.nombres,
        apellidos: employeeData.apellidos,
        nroDocumento: employeeData.nroDocumento,
        fechaNacimiento: employeeData.fechaNacimiento,
        direccion: employeeData.direccion,
        telefono: employeeData.telefono,
        puesto: employeeData.puesto,
        fechaIngreso: employeeData.fechaIngreso,
        estado: employeeData.estado || 'ACTIVO',
        uniqueId: employeeData.uniqueId || null
      };
      
      const response = await api.post('/empleados', empleadoDTO);
      return response;
    } catch (error) {
      console.error('Error en createEmployee:', error);
      
      // Analizar el mensaje de error específico
      const errorMessage = error.message || '';
      
      // Error de documento duplicado
      if (errorMessage.includes('empleados_nro_documento_unique') || 
          errorMessage.includes('nro_documento_unique')) {
        throw new Error('DUPLICATE_DOCUMENT');
      }
      
      // Error de nombres duplicados (si existe esa restricción)
      if (errorMessage.includes('empleados_nombres_unique') || 
          errorMessage.includes('nombres_unique')) {
        throw new Error('DUPLICATE_NAME');
      }
      
      // Error genérico de entrada duplicada
      if (errorMessage.includes('Duplicate entry')) {
        if (errorMessage.includes('nro_documento')) {
          throw new Error('DUPLICATE_DOCUMENT');
        }
        if (errorMessage.includes('nombres')) {
          throw new Error('DUPLICATE_NAME');
        }
        throw new Error('DUPLICATE_ENTRY');
      }
      
      // Re-lanzar el error original si no es un caso específico
      throw error;
    }
  },

  // Actualizar empleado con manejo específico de errores
  updateEmployee: async (id, employeeData) => {
    try {
      const empleadoDTO = {
        userId: employeeData.userId || null,
        nombres: employeeData.nombres,
        apellidos: employeeData.apellidos,
        nroDocumento: employeeData.nroDocumento,
        fechaNacimiento: employeeData.fechaNacimiento,
        direccion: employeeData.direccion,
        telefono: employeeData.telefono,
        puesto: employeeData.puesto,
        fechaIngreso: employeeData.fechaIngreso,
        estado: employeeData.estado || 'ACTIVO',
        uniqueId: employeeData.uniqueId || null
      };
      
      const response = await api.put(`/empleados/${id}`, empleadoDTO);
      return response;
    } catch (error) {
      console.error('Error en updateEmployee:', error);
      
      // Analizar el mensaje de error específico
      const errorMessage = error.message || '';
      
      // Error de documento duplicado
      if (errorMessage.includes('empleados_nro_documento_unique') || 
          errorMessage.includes('nro_documento_unique')) {
        throw new Error('DUPLICATE_DOCUMENT');
      }
      
      // Error de nombres duplicados
      if (errorMessage.includes('empleados_nombres_unique') || 
          errorMessage.includes('nombres_unique')) {
        throw new Error('DUPLICATE_NAME');
      }
      
      // Error genérico de entrada duplicada
      if (errorMessage.includes('Duplicate entry')) {
        if (errorMessage.includes('nro_documento')) {
          throw new Error('DUPLICATE_DOCUMENT');
        }
        if (errorMessage.includes('nombres')) {
          throw new Error('DUPLICATE_NAME');
        }
        throw new Error('DUPLICATE_ENTRY');
      }
      
      // Re-lanzar el error original si no es un caso específico
      throw error;
    }
  },

  // Eliminar empleado
  deleteEmployee: async (id) => {
    try {
      await api.delete(`/empleados/${id}`);
      return true;
    } catch (error) {
      throw new Error('Error al eliminar empleado: ' + error.message);
    }
  }
};
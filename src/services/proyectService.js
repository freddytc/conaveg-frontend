import { api } from './api';

export const proyectService = {
  // Obtener todos los proyectos
  getAllProjects: async () => {
    try {
      const response = await api.get('/proyectos');
      return response;
    } catch (error) {
      console.error('Error en getAllProjects:', error);
      throw new Error('Error al obtener proyectos: ' + error.message);
    }
  },

  // Obtener proyecto por ID
  getProjectById: async (id) => {
    try {
      const response = await api.get(`/proyectos/${id}`);
      return response;
    } catch (error) {
      throw new Error('Error al obtener proyecto: ' + error.message);
    }
  },

  // Crear proyecto con manejo específico de errores
  createProject: async (projectData) => {
    try {
      const proyectoDTO = {
        nombre: projectData.nombre,
        descripcion: projectData.descripcion,
        ubicacion: projectData.ubicacion,
        fechaInicio: projectData.fechaInicio,
        fechaFin: projectData.fechaFin,
        estadoProyecto: projectData.estadoProyecto || 'PLANIFICADO'
      };
      
      const response = await api.post('/proyectos', proyectoDTO);
      return response;
    } catch (error) {
      console.error('Error en createProject:', error);
      
      // Analizar el mensaje de error específico
      const errorMessage = error.message || '';
      
      // Error de nombre duplicado (si existe esa restricción)
      if (errorMessage.includes('proyectos_nombre_unique') || 
          errorMessage.includes('nombre_unique')) {
        throw new Error('DUPLICATE_NAME');
      }
      
      // Error genérico de entrada duplicada
      if (errorMessage.includes('Duplicate entry')) {
        if (errorMessage.includes('nombre')) {
          throw new Error('DUPLICATE_NAME');
        }
        throw new Error('DUPLICATE_ENTRY');
      }
      
      throw error;
    }
  },

  // Actualizar proyecto con manejo específico de errores
  updateProject: async (id, projectData) => {
    try {
      const proyectoDTO = {
        nombre: projectData.nombre,
        descripcion: projectData.descripcion,
        ubicacion: projectData.ubicacion,
        fechaInicio: projectData.fechaInicio,
        fechaFin: projectData.fechaFin,
        estadoProyecto: projectData.estadoProyecto || 'PLANIFICADO'
      };
      
      const response = await api.put(`/proyectos/${id}`, proyectoDTO);
      return response;
    } catch (error) {
      console.error('Error en updateProject:', error);
      
      // Analizar el mensaje de error específico
      const errorMessage = error.message || '';
      
      // Error de nombre duplicado
      if (errorMessage.includes('proyectos_nombre_unique') || 
          errorMessage.includes('nombre_unique')) {
        throw new Error('DUPLICATE_NAME');
      }
      
      // Error genérico de entrada duplicada
      if (errorMessage.includes('Duplicate entry')) {
        if (errorMessage.includes('nombre')) {
          throw new Error('DUPLICATE_NAME');
        }
        throw new Error('DUPLICATE_ENTRY');
      }
      
      throw error;
    }
  },

  // Eliminar proyecto
  deleteProject: async (id) => {
    try {
      await api.delete(`/proyectos/${id}`);
      return true;
    } catch (error) {
      throw new Error('Error al eliminar proyecto: ' + error.message);
    }
  }
};
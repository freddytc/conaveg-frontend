const API_BASE_URL = 'http://localhost:8080/conaveg/api';

const api = {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Obtener token del localStorage
    const token = localStorage.getItem('token');
    
    // Configuración por defecto
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Agregar token de autorización si existe y no es un token mock
    if (token && !token.startsWith('mock-jwt-token')) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      console.log('API Request:', {
        method: config.method || 'GET',
        url,
        headers: config.headers,
        body: config.body
      });

      const response = await fetch(url, config);
      
      console.log('API Response:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url
      });

      if (!response.ok) {
        // Manejar diferentes tipos de errores HTTP
        let errorMessage = `HTTP error! status: ${response.status}`;
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
          // Si no se puede parsear el JSON del error, usar mensaje por defecto
        }
        
        // Casos específicos de error
        if (response.status === 401) {
          // Token expirado o inválido
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.reload(); // Redireccionar al login
          return;
        }
        
        if (response.status === 403) {
          errorMessage = 'No tienes permisos para realizar esta acción';
        }
        
        if (response.status === 404) {
          errorMessage = 'Recurso no encontrado';
        }
        
        throw new Error(errorMessage);
      }

      // Si la respuesta es exitosa pero vacía (204 No Content)
      if (response.status === 204) {
        return null;
      }

      const data = await response.json();
      console.log('API Data:', data);
      return data;
      
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  // Métodos HTTP
  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  },

  post(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  put(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  },
};

export { api };
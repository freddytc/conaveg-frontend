const API_BASE_URL = 'http://localhost:8080/conaveg/api';

const api = {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = localStorage.getItem('token');
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Para FormData, eliminar Content-Type
    if (config.body instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    // Agregar token de autorización
    if (token && !token.startsWith('mock-jwt-token')) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        // Manejar errores
        let errorMessage = `HTTP error! status: ${response.status}`;
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (jsonError) {
          try {
            const errorText = await response.text();
            errorMessage = errorText || errorMessage;
          } catch (textError) {
            // Usar mensaje por defecto
          }
        }
        
        // Casos específicos
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.reload();
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

      // Respuesta vacía
      if (response.status === 204) {
        return null;
      }

      // Respuesta blob (archivos)
      if (options.responseType === 'blob') {
        return await response.blob();
      }

      // Respuesta JSON
      return await response.json();
      
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  // Upload con query parameters (como Swagger)
  uploadWithQueryParams(baseUrl, params, file, token) {
    return new Promise((resolve, reject) => {
      // Construir URL con query parameters
      const url = new URL(baseUrl);
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          url.searchParams.append(key, params[key]);
        }
      });
      
      const xhr = new XMLHttpRequest();
      
      xhr.onload = function() {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (e) {
            resolve(xhr.responseText);
          }
        } else {
          let errorMessage = `HTTP error! status: ${xhr.status}`;
          try {
            const errorData = JSON.parse(xhr.responseText);
            errorMessage = errorData.message || errorData.error || errorMessage;
          } catch (e) {
            errorMessage = xhr.responseText || errorMessage;
          }
          reject(new Error(errorMessage));
        }
      };
      
      xhr.onerror = () => reject(new Error('Error de red'));
      xhr.onabort = () => reject(new Error('Upload cancelado'));
      
      // Configurar request
      xhr.open('POST', url.toString(), true);
      xhr.setRequestHeader('accept', '*/*');
      
      // Agregar Authorization si existe
      if (token && !token.startsWith('mock-jwt-token')) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }
      
      // FormData solo con el archivo
      const formData = new FormData();
      formData.append('file', file);
      
      xhr.send(formData);
    });
  },

  // Métodos HTTP
  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  },

  post(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  },

  put(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  },

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  },
};

export { api };
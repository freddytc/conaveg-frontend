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

    // Agregar token de autorización automáticamente
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
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

        // Token expirado o no válido
        if (response.status === 401) {
          console.log('Token expirado o inválido, redirigiendo al login...');
          localStorage.removeItem('token');
          localStorage.removeItem('user');

          if (!window.location.pathname.includes('/login')) {
            window.location.reload();
          }
          return;
        }

        if (response.status === 403) {
          errorMessage = 'No tienes permisos para realizar esta acción';
        }

        throw new Error(errorMessage);
      }

      if (response.status === 204) {
        return null;
      }

      if (options.responseType === 'blob') {
        return await response.blob();
      }

      // Verificar el Content-Type de la respuesta
      const contentType = response.headers.get('content-type');

      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else {
        // Si es texto plano, manejarlo adecuadamente
        const textResponse = await response.text();

        // Para endpoints de validación, crear un objeto estándar
        if (endpoint.includes('/auth/validate')) {
          return {
            valid: textResponse.includes('válido') || textResponse.includes('valid'),
            message: textResponse
          };
        }

        // Para otros endpoints, intentar parsear como JSON o devolver texto
        try {
          return JSON.parse(textResponse);
        } catch (e) {
          return { message: textResponse };
        }
      }

    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  uploadWithQueryParams(baseUrl, params, file, token) {
    return new Promise((resolve, reject) => {
      const url = new URL(baseUrl);
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          url.searchParams.append(key, params[key]);
        }
      });

      const xhr = new XMLHttpRequest();

      xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (e) {
            resolve(xhr.responseText);
          }
        } else {
          if (xhr.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.reload();
            return;
          }

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

      xhr.open('POST', url.toString(), true);
      xhr.setRequestHeader('accept', '*/*');

      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }

      const formData = new FormData();
      formData.append('file', file);

      xhr.send(formData);
    });
  },

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

  patch(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PATCH',
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  },

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  },
};

export { api };
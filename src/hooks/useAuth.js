import { useState, useEffect, useContext, createContext } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setLoading(true);
      
      if (authService.isAuthenticated()) {
        // Usar validación simplificada por ahora
        const isValid = authService.validateTokenSimple();
        
        if (isValid) {
          const userData = authService.getCurrentUser();
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          await logout();
        }
      }
    } catch (error) {
      console.error('Error verificando autenticación:', error);
      await logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      setUser(response.user);
      setIsAuthenticated(true);
      return response;
    } catch (error) {
      await logout();
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const refreshUserData = async () => {
    try {
      const userData = await authService.getCurrentUserFromServer();
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Error refrescando datos del usuario:', error);
      const localUser = authService.getCurrentUser();
      if (localUser) {
        setUser(localUser);
        return localUser;
      }
      throw error;
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    checkAuth,
    refreshUserData
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
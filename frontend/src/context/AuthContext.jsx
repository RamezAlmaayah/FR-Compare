import { createContext, useContext, useEffect, useState } from 'react';
import apiClient from '../api/apiClient';
import { getStoredToken, removeStoredToken, storeToken } from '../utils/authToken';

const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(getStoredToken);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    const restoreSession = async () => {
      const storedToken = getStoredToken();

      if (!storedToken) {
        setIsAuthLoading(false);
        return;
      }

      try {
        const response = await apiClient.get('/auth/me');

        if (isActive) {
          setToken(storedToken);
          setUser(response.data.user);
        }
      } catch {
        removeStoredToken();

        if (isActive) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (isActive) {
          setIsAuthLoading(false);
        }
      }
    };

    restoreSession();

    return () => {
      isActive = false;
    };
  }, []);

  const login = async (credentials) => {
    const response = await apiClient.post('/auth/login', credentials);

    storeToken(response.data.token);
    setToken(response.data.token);
    setUser(response.data.user);

    return response.data.user;
  };

  const logout = () => {
    removeStoredToken();
    setToken(null);
    setUser(null);
  };

  const authValue = {
    user,
    token,
    isAuthenticated: Boolean(user && token),
    isAuthLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>;
};

const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

export { AuthProvider, useAuth };

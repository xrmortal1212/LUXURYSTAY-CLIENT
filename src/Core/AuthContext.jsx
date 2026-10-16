import { useCallback, useEffect, useState } from 'react';
import { api } from '../Config/api';
import { AuthContext } from './AuthHooks';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshSession = useCallback(async () => {
    try {
      const { data } = await api.get('/users/profile');
      setUser(data.user);
      return data.user;
    } catch (error) {
      setUser(null);
      throw error;
    }
  }, []);

  const login = async credentials => {
    const { data } = await api.post('/auth/login', credentials);
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      setUser(null);
    }
  };

  const updateUser = nextUser => setUser(nextUser);

  useEffect(() => {
    let mounted = true;
    const restoreSession = async () => {
      try {
        const { data } = await api.get('/users/profile');
        if (mounted) setUser(data.user);
      } catch {
        if (mounted) setUser(null);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    const clearSession = () => setUser(null);

    window.addEventListener('luxurystay:unauthorized', clearSession);
    restoreSession();
    return () => {
      mounted = false;
      window.removeEventListener('luxurystay:unauthorized', clearSession);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, refreshSession, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

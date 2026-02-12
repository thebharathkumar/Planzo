import { useState, useCallback } from 'react';
import api from '../utils/api';
import { AuthContext } from './contexts';

function getInitialUser() {
  const token = localStorage.getItem('planzo_token');
  const stored = localStorage.getItem('planzo_user');
  if (token && stored) {
    try {
      return JSON.parse(stored);
    } catch {
      localStorage.removeItem('planzo_user');
    }
  }
  return null;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getInitialUser);
  const [loading] = useState(false);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('planzo_token', data.token);
    localStorage.setItem('planzo_user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  }, []);

  const register = useCallback(async (fullName, email, password, role = 'attendee') => {
    const { data } = await api.post('/auth/register', {
      fullName,
      email,
      password,
      role,
    });
    localStorage.setItem('planzo_token', data.token);
    localStorage.setItem('planzo_user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('planzo_token');
    localStorage.removeItem('planzo_user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}


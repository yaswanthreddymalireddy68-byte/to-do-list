import { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('daymark-token');
    if (!token) {
      setLoading(false);
      return;
    }
    api.get('/auth/me')
      .then(({ data }) => setUser(data.user))
      .catch(() => localStorage.removeItem('daymark-token'))
      .finally(() => setLoading(false));
  }, []);

  async function authenticate(path, credentials) {
    const { data } = await api.post(path, credentials);
    localStorage.setItem('daymark-token', data.token);
    setUser(data.user);
    return data.user;
  }

  async function updateProfile(name) {
    const { data } = await api.put('/auth/me', { name });
    setUser(data.user);
    return data.user;
  }

  function logout() {
    localStorage.removeItem('daymark-token');
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, loading, login: (values) => authenticate('/auth/login', values), register: (values) => authenticate('/auth/register', values), updateProfile, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

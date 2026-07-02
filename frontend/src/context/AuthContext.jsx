import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('fitai_token');
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get('/api/auth/me')
      .then(({ user }) => setUser(user))
      .catch(() => localStorage.removeItem('fitai_token'))
      .finally(() => setLoading(false));
  }, []);

  async function login(email, password) {
    const { token, user } = await api.post('/api/auth/login', { email, password }, { auth: false });
    localStorage.setItem('fitai_token', token);
    setUser(user);
  }

  async function signup(name, email, password) {
    const { token, user } = await api.post('/api/auth/signup', { name, email, password }, { auth: false });
    localStorage.setItem('fitai_token', token);
    setUser(user);
  }

  function logout() {
    localStorage.removeItem('fitai_token');
    setUser(null);
  }

  function updateUser(patch) {
    setUser((prev) => ({ ...prev, ...patch }));
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

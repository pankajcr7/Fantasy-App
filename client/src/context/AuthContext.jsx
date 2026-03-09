import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('ld_token');
    if (token) {
      api.me().then(u => {
        if (u.id) setUser(u);
        else localStorage.removeItem('ld_token');
      }).catch(() => localStorage.removeItem('ld_token')).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await api.login({ email, password });
    if (res.error) throw new Error(res.error);
    localStorage.setItem('ld_token', res.token);
    setUser(res.user);
    return res.user;
  };

  const register = async (name, email, password, mobile) => {
    const res = await api.register({ name, email, password, mobile });
    if (res.error) throw new Error(res.error);
    localStorage.setItem('ld_token', res.token);
    setUser(res.user);
    return res.user;
  };

  const logout = () => {
    localStorage.removeItem('ld_token');
    setUser(null);
  };

  const refreshUser = async () => {
    const u = await api.me();
    if (u.id) setUser(u);
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser, toast, showToast }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

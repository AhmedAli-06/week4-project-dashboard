import { createContext, useContext, useEffect, useState } from 'react';
import api, { setAuthToken } from '../api/client.js';
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { setReady(true); return; }
    setAuthToken(token);
    api.get('/auth/me').then((r) => setUser(r.data.user)).catch(() => { localStorage.removeItem('token'); setAuthToken(null); }).finally(() => setReady(true));
  }, []);
  const login = async (email, password) => { const r = await api.post('/auth/login', { email, password }); localStorage.setItem('token', r.data.token); setAuthToken(r.data.token); setUser(r.data.user); return r.data.user; };
  const signup = async (name, email, password) => { const r = await api.post('/auth/signup', { name, email, password }); localStorage.setItem('token', r.data.token); setAuthToken(r.data.token); setUser(r.data.user); return r.data.user; };
  const logout = () => { localStorage.removeItem('token'); setAuthToken(null); setUser(null); };
  return <AuthContext.Provider value={{ user, ready, login, signup, logout }}>{children}</AuthContext.Provider>;
}
export function useAuth() { const ctx = useContext(AuthContext); if (!ctx) throw new Error('useAuth must be used within AuthProvider'); return ctx; }

import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
const AuthContext = createContext();
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user')) || null);
  function login(userData) {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  }
  function logout() {
    setUser(null);
    localStorage.removeItem('user');
  }
  function getUserRole() { return user?.role; }

  // New: update user locally and persist to localStorage (helpful when name changes)
  function updateUser(patch) {
    setUser(u => {
      const next = { ...u, ...patch };
      try { localStorage.setItem('user', JSON.stringify(next)); } catch (e) { /* ignore */ }
      return next;
    });
  }

  // On initial load, try to fetch candidate profile to get profileImageUrl/resumeUrl
  useEffect(() => {
    let mounted = true;
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken || !user) return;

    // Candidate: preload profile image
    if (user.role === 'candidate') {
      if (user.profileImageUrl) return;
      (async () => {
        try {
          const res = await api.get('/profiles/me');
          if (!mounted) return;
          const data = res.data || {};
          if (data.profileImageUrl || data.resumeUrl) {
            updateUser({ profileImageUrl: data.profileImageUrl || null, resumeUrl: data.resumeUrl || null });
          }
        } catch (err) {
          console.error('AuthProvider: failed to preload profile', err.response?.status, err.response?.data || err.message);
        }
      })();
      return () => { mounted = false; };
    }

    // Company/HR: preload company logo
    if ((user.role === 'company' || user.role === 'hr') && !user.companyLogoUrl) {
      (async () => {
        try {
          const res = await api.get('/companies/me');
          if (!mounted) return;
          const data = res.data || {};
          if (data.logoUrl) {
            updateUser({ companyLogoUrl: data.logoUrl });
          }
        } catch (err) {
          console.error('AuthProvider: failed to preload company logo', err.response?.status, err.response?.data || err.message);
        }
      })();
      return () => { mounted = false; };
    }
  }, []);

  return <AuthContext.Provider value={{ user, login, logout, getUserRole, updateUser }}>{children}</AuthContext.Provider>;
}
export function useAuth() { return useContext(AuthContext); }
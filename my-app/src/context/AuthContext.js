import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('dakkhana_token'));
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('dakkhana_user');
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    if (token) {
      localStorage.setItem('dakkhana_token', token);
    } else {
      localStorage.removeItem('dakkhana_token');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('dakkhana_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('dakkhana_user');
    }
  }, [user]);

  const login = (authToken, profile) => {
    setToken(authToken);
    setUser(profile);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  const hasRole = (role) => user?.role === role;

  const value = useMemo(
    () => ({
      token,
      user,
      login,
      logout,
      hasRole,
      isAuthenticated: Boolean(token),
    }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
}


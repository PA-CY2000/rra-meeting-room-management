import React, { createContext, useContext, useState } from 'react';

// AuthContext stores the logged-in user and provides login/logout functions
// to all components in the app
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Load user from localStorage so they stay logged in after page refresh
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = (userData) => {
    localStorage.setItem('token', userData.token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

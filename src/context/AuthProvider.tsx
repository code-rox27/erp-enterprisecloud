import { useState, type ReactNode } from 'react';
import { AuthContext } from './AuthContext';
import type { User } from '../types/auth';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('erp_session');
    if (savedUser) {
      try {
        return JSON.parse(savedUser) as User;
      } catch {
        localStorage.removeItem('erp_session');
      }
    }
    return null;
  });

  const login = (email: string) => {
    const userData: User = {
      id: 'usr-001',
      name: 'Usuario ERP',
      email,
      role: 'Administrador',
    };
    setUser(userData);
    localStorage.setItem('erp_session', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('erp_session');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
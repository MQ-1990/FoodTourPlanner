import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import api from '../lib/api';

interface BackendUser {
  _id?: string;
  id?: string;
  username?: string;
  email: string;
  role: 'admin' | 'user';
}

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function normalizeUser(user: BackendUser): User {
  return {
    id: String(user.id ?? user._id ?? ''),
    name: user.username || user.email,
    email: user.email,
    role: user.role,
  };
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (!storedUser) return null;

    try {
      return JSON.parse(storedUser) as User;
    } catch {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('token');
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await api.get('/auth/me');
        const currentUser = normalizeUser(res.data);
        setUser(currentUser);
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
      } catch (err) {
        console.error('Failed to restore auth session:', err);
        setUser(null);
        localStorage.removeItem('currentUser');
        localStorage.removeItem('token');
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const res = await api.post('/auth/login', { email, password });
    const currentUser = normalizeUser(res.data.user);

    localStorage.setItem('token', res.data.token);
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    setUser(currentUser);

    return currentUser;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

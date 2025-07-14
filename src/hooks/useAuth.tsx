
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';
import * as api from '@/api/api';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // On mount, try to get user from backend using JWT
    const token = api.getToken();
    if (token) {
      // Optionally, fetch user profile from backend
      // For now, just keep user as logged in if token exists
      // You can add a /me endpoint to fetch user info
    }
  }, []);

  const login = async (email: string, password: string) => {
    const user = await api.login(email, password);
    setUser(user);
  };

  const signup = async (username: string, email: string, password: string) => {
    const user = await api.signup(username, email, password);
    setUser(user);
  };

  const logout = () => {
    api.logout();
    setUser(null);
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      // Optionally, send update to backend
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, updateUser }}>
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

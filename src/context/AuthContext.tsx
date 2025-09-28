import React, { createContext, useContext, useEffect, useState } from 'react';
import { axiosInstance } from '../utils/axiosInstance';
import { API_PATHS } from '../utils/apiPath';
import { storage } from '../utils/helper';

interface User {
  id: number;
  name: string;
  email: string;
  profileImageURL: string | null;
  role: 'admin' | 'user';
  invitedByAdminId: number | null;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, adminInviteToken?: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = () => {
      const savedToken = storage.getToken();
      const savedUser = storage.getUser();

      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(savedUser);
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await axiosInstance.post(API_PATHS.LOGIN, { email, password });
      const { access_token, user: userData } = response.data.data;
      
      setUser(userData);
      setToken(access_token);
      storage.setToken(access_token);
      storage.setUser(userData);
    } catch (error) {
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string, adminInviteToken?: string) => {
    try {
      const payload = adminInviteToken 
        ? { name, email, password, adminInviteToken }
        : { name, email, password };
        
      const response = await axiosInstance.post(API_PATHS.REGISTER, payload);
      const { access_token, user: userData } = response.data.data;
      
      setUser(userData);
      setToken(access_token);
      storage.setToken(access_token);
      storage.setUser(userData);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    storage.clearAuth();
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
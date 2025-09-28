import { createContext } from 'react';

export interface User {
  id: number;
  name: string;
  email: string;
  profileImageURL: string | null;
  role: 'admin' | 'user';
  invitedByAdminId: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, adminInviteToken?: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
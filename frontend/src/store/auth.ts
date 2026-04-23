import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  cpf: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  _count?: {
    bankConnections: number;
    creditRequests: number;
  };
}

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: (user, token) => set({ user, token }),
      setUser: (user) => set({ user }),
      logout: () => set({ user: null, token: null }),
    }),
    { name: 'nandesk-auth' }
  )
);

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => {
        localStorage.removeItem('token'); // Also ensure localStorage is cleared
        set({ user: null, token: null, isAuthenticated: false });
      },
      updateUser: (newUser) => set((state) => ({
        user: state.user ? { ...state.user, ...newUser } : null
      })),
    }),
    {
      name: 'auth-storage',
    }
  )
);

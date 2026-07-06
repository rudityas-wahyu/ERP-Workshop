import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Role = 'Admin' | 'Cashier';

interface AuthState {
  user: { name: string; role: Role };
  password: string;
  isAuthenticated: boolean;
  login: (password: string) => boolean;
  logout: () => void;
  setUser: (user: { name: string; role: Role }) => void;
  setPassword: (password: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: { name: 'Admin User', role: 'Admin' },
      password: 'password123',
      isAuthenticated: false,
      login: (password) => {
        if (password === get().password) {
          set({ isAuthenticated: true });
          return true;
        }
        return false;
      },
      logout: () => set({ isAuthenticated: false }),
      setUser: (user) => set({ user }),
      setPassword: (password) => set({ password }),
    }),
    {
      name: 'auth-storage',
    }
  )
);

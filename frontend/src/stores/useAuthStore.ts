import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface User {
  id: number;
  name: string;
  role: 'ADMIN' | 'FINANCE' | 'SALES' | 'PRODUCTION' | string;
  stamp_url?: string;
  phone?: string;
  email?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (updatedData: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      login: (user, token) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(user));
          localStorage.setItem('token', token);
        }
        set({ user, token });
      },
      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        }
        set({ user: null, token: null });
      },
      updateUser: (updatedData) =>
        set((state) => {
          const newUser = state.user ? { ...state.user, ...updatedData } : null;
          if (typeof window !== 'undefined' && newUser) {
            localStorage.setItem('user', JSON.stringify(newUser));
          }
          return { user: newUser };
        }),
    }),
    {
      name: 'selenge-auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);


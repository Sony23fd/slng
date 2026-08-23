import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface User {
  id: number;
  name: string;
  full_name?: string;
  role: 'ADMIN' | 'FINANCE' | 'SALES' | 'PRODUCTION' | string;
  stamp_url?: string;
  phone?: string;
  email?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (updatedData: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      hasHydrated: false,
      setHasHydrated: (state) => set({ hasHydrated: state }),
      login: (user, token) => {
        set({ user, token });
      },
      logout: () => {
        set({ user: null, token: null });
      },
      updateUser: (updatedData) =>
        set((state) => {
          const newUser = state.user ? { ...state.user, ...updatedData } : null;
          return { user: newUser };
        }),
    }),
    {
      name: 'selenge-auth-storage',
      storage: createJSONStorage(() => typeof window !== 'undefined' ? localStorage : (undefined as any)),
      partialize: (state) => ({ user: state.user, token: state.token }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHasHydrated(true);
        }
      },
    }
  )
);


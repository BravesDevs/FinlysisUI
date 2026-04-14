'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AuthUser {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  isAuth: boolean;
}

interface AuthActions {
  setTokens: (access: string, refresh: string) => void;
  setUser: (user: AuthUser) => void;
  clearAuth: () => void;
}

// ---------------------------------------------------------------------------
// SSR-safe sessionStorage wrapper
// ---------------------------------------------------------------------------

const sessionStorageWrapper = {
  getItem: (name: string): string | null => {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem(name);
  },
  setItem: (name: string, value: string): void => {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(name, value);
  },
  removeItem: (name: string): void => {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem(name);
  },
};

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuth: false,

      setTokens: (access, refresh) => {
        set({ accessToken: access, refreshToken: refresh, isAuth: true });
        // Cookie for Next.js middleware (edge runtime cannot read sessionStorage)
        if (typeof document !== 'undefined') {
          document.cookie = 'finlysis_auth=1; path=/; SameSite=Strict';
        }
      },

      setUser: (user) => set({ user }),

      clearAuth: () => {
        set({ accessToken: null, refreshToken: null, user: null, isAuth: false });
        if (typeof document !== 'undefined') {
          document.cookie =
            'finlysis_auth=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
        }
      },
    }),
    {
      name: 'finlysis-auth',
      storage: createJSONStorage(() => sessionStorageWrapper),
    },
  ),
);

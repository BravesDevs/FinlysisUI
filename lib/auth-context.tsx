'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { useAuthStore } from '@/store/auth.store';
import { authApi, usersApi, type LoginDto, type RegisterDto } from '@/lib/api';

// ---------------------------------------------------------------------------
// Context contract — same public interface as before so auth-form.tsx is unchanged
// ---------------------------------------------------------------------------

interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  login:    (dto: LoginDto)    => Promise<void>;
  register: (dto: RegisterDto) => Promise<void>;
  logout:   () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function AuthProvider({ children }: { children: ReactNode }) {
  const { isAuth, refreshToken, setTokens, setUser, clearAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on mount — if sessionStorage has a refresh token,
  // call /users/me (Axios interceptor will refresh the access token on 401)
  useEffect(() => {
    if (!refreshToken) {
      setIsLoading(false);
      return;
    }

    usersApi
      .me()
      .then((u) =>
        setUser({ userId: u.id, email: u.email, firstName: u.firstName, lastName: u.lastName }),
      )
      .catch(() => clearAuth())
      .finally(() => setIsLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally runs once on mount

  const login = useCallback(
    async (dto: LoginDto) => {
      const tokens = await authApi.login(dto);
      setTokens(tokens.access_token, tokens.refresh_token);
      const u = await usersApi.me();
      setUser({ userId: u.id, email: u.email, firstName: u.firstName, lastName: u.lastName });
    },
    [setTokens, setUser],
  );

  const register = useCallback(
    async (dto: RegisterDto) => {
      const tokens = await authApi.register(dto);
      setTokens(tokens.access_token, tokens.refresh_token);
      const u = await usersApi.me();
      setUser({ userId: u.id, email: u.email, firstName: u.firstName, lastName: u.lastName });
    },
    [setTokens, setUser],
  );

  const logout = useCallback(() => clearAuth(), [clearAuth]);

  return (
    <AuthContext.Provider value={{ isAuthenticated: isAuth, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

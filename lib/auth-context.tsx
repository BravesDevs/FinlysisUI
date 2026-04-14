'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import {
  authApi,
  usersApi,
  type LoginDto,
  type RegisterDto,
  type SafeUser,
} from '@/lib/api';

const RT_KEY = 'finlysis_rt';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AuthState {
  user: SafeUser | null;
  accessToken: string | null;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  isAuthenticated: boolean;
  login: (dto: LoginDto) => Promise<void>;
  register: (dto: RegisterDto) => Promise<void>;
  logout: () => void;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const AuthContext = createContext<AuthContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    accessToken: null,
    isLoading: true,
  });

  const applySession = useCallback(
    async (accessToken: string, refreshToken: string) => {
      localStorage.setItem(RT_KEY, refreshToken);
      const user = await usersApi.me(accessToken);
      setState({ user, accessToken, isLoading: false });
    },
    [],
  );

  // Restore session from stored refresh token on mount
  useEffect(() => {
    const rt = localStorage.getItem(RT_KEY);
    if (!rt) {
      setState((s) => ({ ...s, isLoading: false }));
      return;
    }

    authApi
      .refresh(rt)
      .then((tokens) => applySession(tokens.access_token, tokens.refresh_token))
      .catch(() => {
        localStorage.removeItem(RT_KEY);
        setState((s) => ({ ...s, isLoading: false }));
      });
  }, [applySession]);

  const login = useCallback(
    async (dto: LoginDto) => {
      const tokens = await authApi.login(dto);
      await applySession(tokens.access_token, tokens.refresh_token);
    },
    [applySession],
  );

  const register = useCallback(
    async (dto: RegisterDto) => {
      const tokens = await authApi.register(dto);
      await applySession(tokens.access_token, tokens.refresh_token);
    },
    [applySession],
  );

  const logout = useCallback(() => {
    localStorage.removeItem(RT_KEY);
    setState({ user: null, accessToken: null, isLoading: false });
  }, []);

  return (
    <AuthContext.Provider
      value={{ ...state, isAuthenticated: !!state.user, login, register, logout }}
    >
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

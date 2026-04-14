import axios, { type AxiosError } from 'axios';

// ---------------------------------------------------------------------------
// ApiError — kept for compatibility with auth-form.tsx error handling
// ---------------------------------------------------------------------------

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly body?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function toApiError(err: unknown): ApiError {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status ?? 0;
    const raw = (err.response?.data as { message?: string | string[] } | undefined)?.message;
    const message = Array.isArray(raw) ? raw.join(', ') : (raw ?? err.message);
    return new ApiError(status, message, err.response?.data);
  }
  return new ApiError(0, 'Network error');
}

// ---------------------------------------------------------------------------
// Axios instance
// ---------------------------------------------------------------------------

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000',
  headers: { 'Content-Type': 'application/json' },
});

// ---------------------------------------------------------------------------
// Request interceptor — attach access token from Zustand store
// Lazy import avoids circular deps and SSR issues
// ---------------------------------------------------------------------------

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    // Dynamic require to avoid SSR module evaluation of sessionStorage
    const { useAuthStore } = require('@/store/auth.store') as typeof import('@/store/auth.store');
    const token = useAuthStore.getState().accessToken;
    if (token && !config.headers['Authorization']) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return config;
});

// ---------------------------------------------------------------------------
// Response interceptor — transparent 401 → refresh → retry
// ---------------------------------------------------------------------------

let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = [];

function drainQueue(err: unknown, token: string | null) {
  failedQueue.forEach((p) => (err ? p.reject(err) : p.resolve(token!)));
  failedQueue = [];
}

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as typeof error.config & { _retry?: boolean };

    const is401 =
      error.response?.status === 401 &&
      !original?._retry &&
      !original?.url?.includes('/auth/refresh');

    if (!is401) return Promise.reject(error);

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        original!.headers!['Authorization'] = `Bearer ${token}`;
        return api(original!);
      });
    }

    original!._retry = true;
    isRefreshing = true;

    if (typeof window === 'undefined') return Promise.reject(error);

    const { useAuthStore } = require('@/store/auth.store') as typeof import('@/store/auth.store');
    const { refreshToken, setTokens, clearAuth } = useAuthStore.getState();

    if (!refreshToken) {
      clearAuth();
      window.location.href = '/login';
      return Promise.reject(error);
    }

    try {
      const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
      const res = await axios.post<{ access_token: string; refresh_token: string }>(
        `${base}/auth/refresh`,
        {},
        { headers: { Authorization: `Bearer ${refreshToken}` } },
      );
      const { access_token, refresh_token } = res.data;
      setTokens(access_token, refresh_token);
      drainQueue(null, access_token);
      original!.headers!['Authorization'] = `Bearer ${access_token}`;
      return api(original!);
    } catch (refreshErr) {
      drainQueue(refreshErr, null);
      clearAuth();
      window.location.href = '/login';
      return Promise.reject(refreshErr);
    } finally {
      isRefreshing = false;
    }
  },
);

// ---------------------------------------------------------------------------
// Typed API helpers (auth-context and auth-form depend on these)
// ---------------------------------------------------------------------------

export interface TokensResponse  { access_token: string; refresh_token: string; }
export interface RegisterDto     { email: string; password: string; confirmPassword: string; firstName: string; lastName: string; phone?: string; }
export interface LoginDto        { email: string; password: string; }
export interface SafeUser        { id: string; email: string; firstName: string; lastName: string; phone: string | null; dateOfBirth: string | null; preferredCurrencyId: string | null; isEmailVerified: boolean; lastLoginAt: string | null; role: 'USER' | 'ADMIN' | 'ANALYST'; createdAt: string; updatedAt: string; deletedAt: string | null; }

export const authApi = {
  register: async (dto: RegisterDto): Promise<TokensResponse> => {
    try { return (await api.post<TokensResponse>('/auth/register', dto)).data; }
    catch (e) { throw toApiError(e); }
  },
  login: async (dto: LoginDto): Promise<TokensResponse> => {
    try { return (await api.post<TokensResponse>('/auth/login', dto)).data; }
    catch (e) { throw toApiError(e); }
  },
  refresh: async (refreshToken: string): Promise<TokensResponse> => {
    try {
      return (await api.post<TokensResponse>('/auth/refresh', {}, {
        headers: { Authorization: `Bearer ${refreshToken}` },
      })).data;
    } catch (e) { throw toApiError(e); }
  },
};

export const usersApi = {
  // Token is automatically attached by the request interceptor
  me: async (): Promise<SafeUser> => {
    try { return (await api.get<SafeUser>('/users/me')).data; }
    catch (e) { throw toApiError(e); }
  },
};

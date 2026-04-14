const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

// ---------------------------------------------------------------------------
// Error
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

// ---------------------------------------------------------------------------
// Core fetch wrapper
// ---------------------------------------------------------------------------

async function apiFetch<T>(
  path: string,
  init: Omit<RequestInit, 'headers'> & {
    headers?: Record<string, string>;
    token?: string;
  } = {},
): Promise<T> {
  const { token, headers: extraHeaders, ...rest } = init;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...extraHeaders,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...rest, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const raw = (body as { message?: string | string[] } | null)?.message;
    const message = Array.isArray(raw) ? raw.join(', ') : (raw ?? res.statusText);
    throw new ApiError(res.status, message, body);
  }

  const ct = res.headers.get('content-type') ?? '';
  if (!ct.includes('application/json')) return null as T;

  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Shared types
// ---------------------------------------------------------------------------

export interface TokensResponse {
  access_token: string;
  refresh_token: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface SafeUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  dateOfBirth: string | null;
  preferredCurrencyId: string | null;
  isEmailVerified: boolean;
  lastLoginAt: string | null;
  role: 'USER' | 'ADMIN' | 'ANALYST';
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

// ---------------------------------------------------------------------------
// API namespaces
// ---------------------------------------------------------------------------

export const authApi = {
  register: (dto: RegisterDto) =>
    apiFetch<TokensResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(dto),
    }),

  login: (dto: LoginDto) =>
    apiFetch<TokensResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(dto),
    }),

  refresh: (refreshToken: string) =>
    apiFetch<TokensResponse>('/auth/refresh', {
      method: 'POST',
      headers: { Authorization: `Bearer ${refreshToken}` },
    }),
};

export const usersApi = {
  me: (token: string) => apiFetch<SafeUser>('/users/me', { token }),
};

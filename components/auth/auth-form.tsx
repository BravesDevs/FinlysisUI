'use client';

import { useState, type FormEvent, type ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { ApiError } from '@/lib/api';

// ---------------------------------------------------------------------------
// Inline error helpers — no extra dependencies
// ---------------------------------------------------------------------------

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="text-[12px] text-destructive mt-1 leading-snug">{message}</p>
  );
}

function FormAlert({ message }: { message: string }) {
  return (
    <div className="rounded-[10px] bg-destructive/8 border border-destructive/20 px-4 py-3 text-[13px] text-destructive leading-snug">
      {message}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Login form
// ---------------------------------------------------------------------------

function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setIsPending(true);
    try {
      await login({ email, password });
      router.push('/dashboard');
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Something went wrong. Please try again.',
      );
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <FormAlert message={error} />}

      <div className="space-y-2">
        <Label htmlFor="login-email">Email address</Label>
        <Input
          id="login-email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isPending}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="login-password">Password</Label>
        <Input
          id="login-password"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isPending}
        />
      </div>

      <Button type="submit" className="w-full mt-2" disabled={isPending}>
        {isPending ? 'Signing in…' : 'Sign in'}
      </Button>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Register form
// ---------------------------------------------------------------------------

interface RegisterFields {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

type RegisterFieldErrors = Partial<Record<keyof RegisterFields, string>>;

function validate(f: RegisterFields): RegisterFieldErrors {
  const e: RegisterFieldErrors = {};
  if (!f.firstName.trim())        e.firstName       = 'First name is required.';
  if (!f.lastName.trim())         e.lastName        = 'Last name is required.';
  if (!f.email.includes('@'))     e.email           = 'Enter a valid email address.';
  if (f.password.length < 8)      e.password        = 'Password must be at least 8 characters.';
  if (f.password !== f.confirmPassword) e.confirmPassword = 'Passwords do not match.';
  return e;
}

function RegisterForm() {
  const { register } = useAuth();
  const router = useRouter();

  const [fields, setFields] = useState<RegisterFields>({
    firstName: '', lastName: '', email: '', password: '', confirmPassword: '',
  });
  const [fieldErrors, setFieldErrors] = useState<RegisterFieldErrors>({});
  const [apiError, setApiError] = useState('');
  const [isPending, setIsPending] = useState(false);

  function update(key: keyof RegisterFields) {
    return (e: ChangeEvent<HTMLInputElement>) => {
      setFields((f) => ({ ...f, [key]: e.target.value }));
      setFieldErrors((fe) => ({ ...fe, [key]: undefined }));
    };
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setApiError('');
    const errors = validate(fields);
    if (Object.keys(errors).length > 0) { setFieldErrors(errors); return; }
    setIsPending(true);
    try {
      await register({
        firstName:       fields.firstName.trim(),
        lastName:        fields.lastName.trim(),
        email:           fields.email.trim(),
        password:        fields.password,
        confirmPassword: fields.confirmPassword,
      });
      router.push('/dashboard');
    } catch (err) {
      setApiError(
        err instanceof ApiError ? err.message : 'Something went wrong. Please try again.',
      );
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {apiError && <FormAlert message={apiError} />}

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="reg-first">First name</Label>
          <Input
            id="reg-first" placeholder="Ada" autoComplete="given-name" required
            value={fields.firstName} onChange={update('firstName')} disabled={isPending}
          />
          <FieldError message={fieldErrors.firstName} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="reg-last">Last name</Label>
          <Input
            id="reg-last" placeholder="Lovelace" autoComplete="family-name" required
            value={fields.lastName} onChange={update('lastName')} disabled={isPending}
          />
          <FieldError message={fieldErrors.lastName} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="reg-email">Email address</Label>
        <Input
          id="reg-email" type="email" placeholder="you@example.com"
          autoComplete="email" required
          value={fields.email} onChange={update('email')} disabled={isPending}
        />
        <FieldError message={fieldErrors.email} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="reg-password">Password</Label>
        <Input
          id="reg-password" type="password" placeholder="At least 8 characters"
          autoComplete="new-password" required
          value={fields.password} onChange={update('password')} disabled={isPending}
        />
        <FieldError message={fieldErrors.password} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="reg-confirm">Confirm password</Label>
        <Input
          id="reg-confirm" type="password" placeholder="••••••••"
          autoComplete="new-password" required
          value={fields.confirmPassword} onChange={update('confirmPassword')} disabled={isPending}
        />
        <FieldError message={fieldErrors.confirmPassword} />
      </div>

      <Button type="submit" className="w-full mt-1" disabled={isPending}>
        {isPending ? 'Creating account…' : 'Create account'}
      </Button>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Auth card — branding + tabbed forms
// ---------------------------------------------------------------------------

export function AuthForm({ defaultTab = 'login' }: { defaultTab?: 'login' | 'register' }) {
  return (
    /*
     * Card: 440px wide, border-radius 20px per spec.
     * Override Card's 16px to 20px for auth specifically.
     */
    <div
      className={[
        'w-full max-w-[440px]',
        'bg-[var(--bg-card)] rounded-[20px]',
        'border border-[color:var(--border)]',
        'shadow-[0_4px_24px_rgba(58,180,232,0.10),0_1px_3px_rgba(0,0,0,0.05)]',
        'overflow-hidden',
      ].join(' ')}
    >
      {/* Branding strip — grad-card + Bodoni Moda */}
      <div className="grad-card px-8 pt-8 pb-6 text-center">
        {/* App name — Bodoni Moda 900, no italic on auth pages */}
        <h1
          className={[
            'font-heading font-black',
            'text-[2rem] tracking-[-0.03em] leading-none',
            'text-[var(--color-ink)] mb-2',
          ].join(' ')}
        >
          Finlysis
        </h1>
        {/* Tagline — Bodoni Moda 400, no italic on auth pages */}
        <p
          className={[
            'font-heading font-normal',
            'text-[16px] text-[var(--color-deep)]',
            'leading-snug',
          ].join(' ')}
        >
          Your personal finance dashboard
        </p>
      </div>

      {/* Forms */}
      <div className="px-8 pb-8 pt-6">
        <Tabs defaultValue={defaultTab}>
          <TabsList className="w-full mb-6">
            <TabsTrigger value="login"    className="flex-1">Sign in</TabsTrigger>
            <TabsTrigger value="register" className="flex-1">Create account</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <LoginForm />
          </TabsContent>

          <TabsContent value="register">
            <RegisterForm />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

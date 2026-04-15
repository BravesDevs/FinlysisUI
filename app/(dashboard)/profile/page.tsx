'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { User, Mail, Phone, Calendar, Shield, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { useProfile, useUpdateProfile } from '@/hooks/useProfile';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' });
}

function initials(first: string, last: string): string {
  return `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase();
}

// ---------------------------------------------------------------------------
// Read-only field
// ---------------------------------------------------------------------------

function ReadOnlyField({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <label
        style={{
          fontFamily: 'var(--font-inter), system-ui, sans-serif',
          fontWeight: 500,
          fontSize: '11px',
          color: 'var(--text-muted)',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          fontStyle: 'normal',
        }}
      >
        {label}
      </label>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '9px 12px',
          background: 'var(--muted)',
          border: '1px solid var(--border)',
          borderRadius: '10px',
          opacity: 0.7,
        }}
      >
        <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>{icon}</span>
        <span
          style={{
            fontFamily: 'var(--font-inter), system-ui, sans-serif',
            fontWeight: 400,
            fontSize: '14px',
            color: 'var(--text-secondary)',
            fontStyle: 'normal',
          }}
        >
          {value}
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Editable field
// ---------------------------------------------------------------------------

function EditableField({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  icon,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  icon: React.ReactNode;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <label
        style={{
          fontFamily: 'var(--font-inter), system-ui, sans-serif',
          fontWeight: 500,
          fontSize: '11px',
          color: 'var(--text-muted)',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          fontStyle: 'normal',
        }}
      >
        {label}
      </label>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '9px 12px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '10px',
          transition: 'border-color 0.15s',
        }}
        onFocus={(e) => ((e.currentTarget as HTMLDivElement).style.borderColor = 'var(--color-azure)')}
        onBlur={(e) => ((e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)')}
      >
        <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>{icon}</span>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? ''}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            fontFamily: 'var(--font-inter), system-ui, sans-serif',
            fontWeight: 400,
            fontSize: '14px',
            color: 'var(--text-primary)',
            fontStyle: 'normal',
          }}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ProfilePage() {
  const { data: profile, isLoading, isError } = useProfile();
  const { mutateAsync: updateProfile, isPending } = useUpdateProfile();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName]   = useState('');
  const [phone, setPhone]         = useState('');
  const [dob, setDob]             = useState('');
  const [isDirty, setIsDirty]     = useState(false);

  // Seed form when profile loads
  useEffect(() => {
    if (!profile) return;
    setFirstName(profile.firstName);
    setLastName(profile.lastName);
    setPhone(profile.phone ?? '');
    setDob(profile.dateOfBirth ? profile.dateOfBirth.slice(0, 10) : '');
    setIsDirty(false);
  }, [profile]);

  // Track dirtiness
  useEffect(() => {
    if (!profile) return;
    const dirty =
      firstName !== profile.firstName ||
      lastName  !== profile.lastName  ||
      phone     !== (profile.phone ?? '') ||
      dob       !== (profile.dateOfBirth ? profile.dateOfBirth.slice(0, 10) : '');
    setIsDirty(dirty);
  }, [firstName, lastName, phone, dob, profile]);

  async function handleSave() {
    if (!isDirty || isPending) return;
    try {
      await updateProfile({
        firstName: firstName.trim() || undefined,
        lastName:  lastName.trim()  || undefined,
        phone:     phone.trim()     || undefined,
        dateOfBirth: dob || undefined,
      });
      toast.success('Profile updated');
      setIsDirty(false);
    } catch {
      toast.error('Failed to update profile');
    }
  }

  // ---------------------------------------------------------------------------
  // Loading skeleton
  // ---------------------------------------------------------------------------

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-full" style={{ background: 'var(--bg-page)', fontStyle: 'normal' }}>
        <header className="grad-hero border-b" style={{ borderColor: 'var(--border)', padding: '0 32px', minHeight: '72px', display: 'flex', alignItems: 'center' }}>
          <div>
            <div className="animate-pulse" style={{ height: '32px', width: '120px', background: 'var(--muted)', borderRadius: '8px', marginBottom: '6px' }} />
            <div className="animate-pulse" style={{ height: '14px', width: '200px', background: 'var(--muted)', borderRadius: '6px' }} />
          </div>
        </header>
        <main style={{ padding: '32px', maxWidth: '760px', width: '100%' }}>
          <div className="animate-pulse" style={{ height: '120px', background: 'var(--muted)', borderRadius: '16px', marginBottom: '24px' }} />
          <div className="animate-pulse" style={{ height: '340px', background: 'var(--muted)', borderRadius: '16px' }} />
        </main>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Error state
  // ---------------------------------------------------------------------------

  if (isError || !profile) {
    return (
      <div className="flex flex-col min-h-full" style={{ background: 'var(--bg-page)', fontStyle: 'normal' }}>
        <header className="grad-hero border-b" style={{ borderColor: 'var(--border)', padding: '0 32px', minHeight: '72px', display: 'flex', alignItems: 'center' }}>
          <h1 style={{ fontFamily: 'var(--font-bodoni), Georgia, serif', fontWeight: 700, fontSize: '32px', color: 'var(--text-primary)', fontStyle: 'normal', margin: 0, letterSpacing: '-0.02em' }}>
            Profile
          </h1>
        </header>
        <main style={{ padding: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
          <p style={{ fontFamily: 'var(--font-inter), system-ui, sans-serif', fontSize: '14px', color: 'var(--destructive)', fontStyle: 'normal' }}>
            Unable to load profile. Please refresh the page.
          </p>
        </main>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  const fullName = `${profile.firstName} ${profile.lastName}`;
  const roleLabel = profile.role === 'USER' ? 'Member' : profile.role.charAt(0) + profile.role.slice(1).toLowerCase();

  return (
    <div className="flex flex-col min-h-full" style={{ background: 'var(--bg-page)', fontStyle: 'normal' }}>

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <header
        className="grad-hero border-b"
        style={{
          borderColor: 'var(--border)',
          padding: '0 32px',
          minHeight: '72px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: 'var(--font-bodoni), Georgia, serif',
              fontWeight: 700,
              fontSize: '32px',
              color: 'var(--text-primary)',
              fontStyle: 'normal',
              margin: 0,
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
            }}
          >
            Profile
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-inter), system-ui, sans-serif',
              fontWeight: 400,
              fontSize: '14px',
              color: 'var(--text-muted)',
              fontStyle: 'normal',
              margin: '2px 0 0',
            }}
          >
            Manage your personal information
          </p>
        </div>
      </header>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <main style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* ── Identity card ──────────────────────────────────────────────── */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            padding: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
          }}
        >
          {/* Avatar */}
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--color-azure), var(--color-deep))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-inter), system-ui, sans-serif',
                fontWeight: 600,
                fontSize: '22px',
                color: '#fff',
                fontStyle: 'normal',
                letterSpacing: '0.02em',
              }}
            >
              {initials(profile.firstName, profile.lastName)}
            </span>
          </div>

          {/* Name + meta */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                fontFamily: 'var(--font-bodoni), Georgia, serif',
                fontWeight: 700,
                fontSize: '22px',
                color: 'var(--text-primary)',
                fontStyle: 'normal',
                margin: '0 0 2px',
                lineHeight: 1.25,
              }}
            >
              {fullName}
            </p>
            <p
              style={{
                fontFamily: 'var(--font-inter), system-ui, sans-serif',
                fontWeight: 400,
                fontSize: '13px',
                color: 'var(--text-muted)',
                fontStyle: 'normal',
                margin: 0,
              }}
            >
              {profile.email}
            </p>
          </div>

          {/* Role badge */}
          <div
            style={{
              padding: '4px 12px',
              background: 'rgba(58,180,232,0.10)',
              border: '1px solid rgba(58,180,232,0.25)',
              borderRadius: '99px',
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-inter), system-ui, sans-serif',
                fontWeight: 500,
                fontSize: '12px',
                color: 'var(--color-deep)',
                fontStyle: 'normal',
              }}
            >
              {roleLabel}
            </span>
          </div>
        </div>

        {/* ── Account details (read-only) ─────────────────────────────────── */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <h2
            style={{
              fontFamily: 'var(--font-inter), system-ui, sans-serif',
              fontWeight: 600,
              fontSize: '13px',
              color: 'var(--text-secondary)',
              fontStyle: 'normal',
              margin: 0,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            Account
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <ReadOnlyField
              label="Email"
              value={profile.email}
              icon={<Mail size={14} />}
            />
            <ReadOnlyField
              label="Email verified"
              value={profile.isEmailVerified ? 'Verified' : 'Not verified'}
              icon={
                profile.isEmailVerified
                  ? <CheckCircle2 size={14} style={{ color: '#166534' }} />
                  : <XCircle size={14} style={{ color: 'var(--destructive)' }} />
              }
            />
            <ReadOnlyField
              label="Role"
              value={roleLabel}
              icon={<Shield size={14} />}
            />
            <ReadOnlyField
              label="Last login"
              value={formatDate(profile.lastLoginAt)}
              icon={<Clock size={14} />}
            />
          </div>
        </div>

        {/* ── Editable personal info ──────────────────────────────────────── */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <h2
            style={{
              fontFamily: 'var(--font-inter), system-ui, sans-serif',
              fontWeight: 600,
              fontSize: '13px',
              color: 'var(--text-secondary)',
              fontStyle: 'normal',
              margin: 0,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            Personal information
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <EditableField
              label="First name"
              value={firstName}
              onChange={setFirstName}
              placeholder="First name"
              icon={<User size={14} />}
            />
            <EditableField
              label="Last name"
              value={lastName}
              onChange={setLastName}
              placeholder="Last name"
              icon={<User size={14} />}
            />
            <EditableField
              label="Phone"
              value={phone}
              onChange={setPhone}
              type="tel"
              placeholder="+1 (555) 000-0000"
              icon={<Phone size={14} />}
            />
            <EditableField
              label="Date of birth"
              value={dob}
              onChange={setDob}
              type="date"
              icon={<Calendar size={14} />}
            />
          </div>

          {/* Save button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '4px' }}>
            <button
              type="button"
              onClick={handleSave}
              disabled={!isDirty || isPending}
              style={{
                fontFamily: 'var(--font-inter), system-ui, sans-serif',
                fontWeight: 500,
                fontSize: '13px',
                color: isDirty && !isPending ? '#fff' : 'var(--text-muted)',
                background: isDirty && !isPending ? 'var(--color-azure)' : 'var(--muted)',
                border: 'none',
                borderRadius: '10px',
                padding: '8px 20px',
                cursor: isDirty && !isPending ? 'pointer' : 'not-allowed',
                transition: 'background 0.15s, color 0.15s',
                fontStyle: 'normal',
              }}
            >
              {isPending ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </div>

        {/* ── Member since ────────────────────────────────────────────────── */}
        <p
          style={{
            fontFamily: 'var(--font-inter), system-ui, sans-serif',
            fontWeight: 400,
            fontSize: '12px',
            color: 'var(--text-muted)',
            fontStyle: 'normal',
            margin: 0,
            textAlign: 'center',
          }}
        >
          Member since {formatDate(profile.createdAt)}
        </p>

      </main>
    </div>
  );
}

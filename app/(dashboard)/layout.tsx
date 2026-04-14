import type { ReactNode } from 'react';
import Link from 'next/link';

// ---------------------------------------------------------------------------
// Sidebar nav items
// ---------------------------------------------------------------------------

const NAV_ITEMS = [
  { href: '/dashboard',     label: 'Dashboard' },
  { href: '/transactions',  label: 'Transactions' },
  { href: '/accounts',      label: 'Accounts' },
  { href: '/import',        label: 'Import' },
  { href: '/profile',       label: 'Profile' },
];

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      {/* Sidebar */}
      <aside className="grad-sidebar w-56 flex-shrink-0 flex flex-col border-r border-[color:var(--border)] sticky top-0 h-screen">
        {/* Logo */}
        <div className="px-6 py-6 border-b border-[color:var(--border)]">
          <span className="font-heading font-black text-[1.5rem] tracking-[-0.02em] text-[var(--color-deep)]">
            Finlysis
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center px-3 py-2.5 rounded-[10px] text-[13px] font-medium font-sans text-[var(--text-secondary)] hover:bg-[rgba(58,180,232,0.08)] hover:text-[var(--color-deep)] transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-[color:var(--border)]">
          <p className="text-[11px] text-[var(--text-muted)] font-sans px-3">Finlysis © 2025</p>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {children}
      </div>
    </div>
  );
}

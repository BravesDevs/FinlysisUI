import type { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    // Full-page grad-hero per spec
    <div className="grad-hero min-h-screen flex items-center justify-center px-4 py-12">
      {children}
    </div>
  );
}

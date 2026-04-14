import { create } from 'zustand';
import { subDays, format } from 'date-fns';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DashboardFilters {
  bankAccountId: string | null;
  from: string; // ISO date yyyy-MM-dd
  to: string;   // ISO date yyyy-MM-dd
  granularity: 'weekly' | 'monthly';
}

interface DashboardActions {
  setFilter: (partial: Partial<DashboardFilters>) => void;
  resetFilter: () => void;
}

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

function defaultFilters(): DashboardFilters {
  const today = new Date();
  return {
    bankAccountId: null,
    from: format(subDays(today, 90), 'yyyy-MM-dd'),
    to: format(today, 'yyyy-MM-dd'),
    granularity: 'monthly',
  };
}

// ---------------------------------------------------------------------------
// Store — no persistence; filters reset on page refresh intentionally
// ---------------------------------------------------------------------------

export const useDashboardStore = create<DashboardFilters & DashboardActions>((set) => ({
  ...defaultFilters(),
  setFilter: (partial) => set((s) => ({ ...s, ...partial })),
  resetFilter: () => set(defaultFilters()),
}));

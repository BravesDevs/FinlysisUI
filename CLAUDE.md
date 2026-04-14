@AGENTS.md

## Stack

- **Next.js 15** (App Router) with **React 19** — always read `node_modules/next/dist/docs/` before writing code; this version has breaking API changes vs older Next.js
- **TypeScript** (strict mode, `moduleResolution: bundler`)
- **Tailwind CSS v4** via `@tailwindcss/postcss` — configured via CSS `@theme` blocks in `app/globals.css`, not `tailwind.config.*`
- **shadcn/ui** (`shadcn` package) with `radix-ui`, `class-variance-authority`, `clsx`, `tailwind-merge`
- **Lucide React** for icons

## Commands

```bash
npm run dev      # start dev server (localhost:3001)
npm run build    # production build
npm run start    # serve production build
npm run lint     # run ESLint
npx tsc --noEmit # type-check without building
```

No test runner is configured yet.

## Architecture

App Router only (no Pages Router). Key conventions:

- `app/` — file-system routes; `layout.tsx` wraps all pages, `page.tsx` files are route endpoints
- Components are **Server Components by default**; add `"use client"` only when browser APIs or interactivity require it
- Path alias `@/*` maps to the repo root (e.g. `@/app/...`, `@/components/...`)
- Global styles and design tokens live in `app/globals.css` using CSS custom properties wired into Tailwind via `@theme inline`
- Dark mode uses the `.dark` class strategy (`@custom-variant dark (&:is(.dark *))`)
- Font variables: `--font-geist-sans` and `--font-geist-mono`, loaded via `next/font/google` in `app/layout.tsx`

## Tailwind v4 Notes

All theme customization goes in `app/globals.css` under `@theme`. Do not create `tailwind.config.ts/js`.

## shadcn/ui

Install components via `npx shadcn add <component>`. The package is `shadcn` (not `@shadcn/ui`). Base styles imported from `shadcn/tailwind.css` in `globals.css`.

---

## Backend API

**Backend source**: `/Users/devang/Projects/Finlysis/finlysis` (NestJS 11, Prisma 7, MariaDB)  
**Backend base URL**: `http://localhost:3000`  
**Frontend dev server**: `http://localhost:3001`  
**Swagger UI**: `http://localhost:3000/api/docs`

### Auth Strategy

**Token types**:
- `access_token` — JWT, 15-minute TTL, signed with `JWT_ACCESS_SECRET`
- `refresh_token` — JWT, 7-day TTL, signed with `JWT_REFRESH_SECRET`

**Storage rule**: store `access_token` in memory (React state / Zustand); store `refresh_token` in an HTTP-only cookie. All protected endpoints require `Authorization: Bearer <access_token>`.

**Decoded access token payload**: `{ sub: string, email: string }`

**Refresh**: `POST /auth/refresh` — send refresh token as `Authorization: Bearer <refresh_token>`. Returns new token pair.

### API Response Conventions

- All validation errors → `400` with class-validator messages
- Unauthorized → `401`
- Not found → `404`
- Duplicate email on register → `409` (ConflictException)
- All IDs are UUID strings
- All timestamps are ISO 8601 strings (Date objects when deserialized)
- `amount` on transactions: positive = inflow/credit, negative = outflow/debit
- `ValidationPipe({ whitelist: true })` — unknown fields stripped from all request bodies
- Transaction limit is hard-capped at `50` per page server-side

---

### TypeScript Types (canonical frontend shapes)

```typescript
// Auth
interface TokensResponse {
  access_token: string;
  refresh_token: string;
}

// User
interface SafeUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  dateOfBirth: string | null;        // ISO date string
  preferredCurrencyId: string | null;
  isEmailVerified: boolean;
  lastLoginAt: string | null;
  role: 'USER' | 'ADMIN' | 'ANALYST';
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

// Accounts
interface AccountBalance {
  id: string;
  nickname: string | null;
  accountNumberMasked: string | null;
  accountType: { code: AccountTypeCode; label: string };
  bank: { name: string | null };
  currentBalance: number;
  availableBalance: number | null;
  balanceAsOf: string;
  currency: { code: string; symbol: string };
  isActive: boolean;
}
interface AccountBalancesResponse {
  accounts: AccountBalance[];
  totals: { totalCurrentBalanceCAD: number; totalAvailableBalanceCAD: number };
}

// Transactions
interface Transaction {
  id: string;
  bankAccountId: string;
  amount: number;                     // positive = credit, negative = debit
  fxRateToCAD: number | null;
  postedDate: string;
  valueDate: string | null;
  description: string;
  merchantName: string | null;
  merchantCategory: string | null;    // 4-char MCC code
  referenceNumber: string | null;
  balance: number | null;
  isRecurring: boolean;
  isDuplicate: boolean;
  categoryId: string | null;
  createdAt: string;
  updatedAt: string;
  transactionType: { code: TransactionTypeCode; label: string };
  category: { name: string } | null;
  currency: { code: string; symbol: string };
  bankAccount: { accountNumberMasked: string | null; nickname: string | null };
}
interface TransactionsResponse {
  data: Transaction[];
  meta: { page: number; limit: number; total: number; totalPages: number; hasNextPage: boolean };
}

// Import
interface ImportBatch {
  id: string;
  fileName: string;
  status: ImportStatus;
  rowCount: number;
  successCount: number;
  skippedCount: number;
  errorCount: number;
  completedAt: string | null;
  startedAt: string;
  bankAccountId: string;
}
interface ImportBatchDetail extends ImportBatch {
  userId: string;
  importSourceId: string;
  fileSizeBytes: number;
  fileUploadStatus: 'PENDING' | 'UPLOADED' | 'FAILED' | null;
  fileUploadError: string | null;
  fileUrl: string | null;
  errorLog: Array<{ row: number; reason: string; raw?: Record<string, string> }> | null;
  createdAt: string;
  updatedAt: string;
}

// Plaid
interface PlaidItem {
  id: string;                       // DB UUID — use this for disconnect
  userId: string;
  userBankConnectionId: string | null;
  plaidItemId: string;              // Plaid's item_id string
  institutionId: string | null;
  institutionName: string | null;
  consentExpiresAt: string | null;
  status: PlaidItemStatus;
  lastSyncedAt: string | null;
  errorCode: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
interface SyncResult {
  accountsSynced: number;
  plaidItemId: string;
  userBankConnectionId: string;
}

// Dashboard — common query params
interface DashboardQuery {
  bankAccountId?: string;
  from?: string;                    // ISO date; default 90 days ago
  to?: string;                      // ISO date; default today
  granularity?: 'weekly' | 'monthly'; // default 'monthly'
}

// Dashboard response shapes
type CashFlowPeriod = { period: string; totalInflow: number; totalOutflow: number; netFlow: number };
type BalancePoint = { date: string; balance: number };
type CategorySlice = { label: string; total: number; percentage: number };
type MerchantSlice = { merchantName: string; total: number; transactionCount: number };
interface RecurringVsOneOff {
  recurring: { total: number; count: number; percentage: number };
  oneOff: { total: number; count: number; percentage: number };
}
interface BurnRate {
  currentMonthSpend: number;
  avgPrevThreeMonths: number;
  burnRateRatio: number | null;
  trend: 'OVER' | 'UNDER' | 'ON_TRACK';
}
type CurrencyExposure = { currencyCode: string; symbol: string; totalCAD: number; percentage: number };
type TagSummary = { tag: string; totalSpend: number; transactionCount: number };

// Enums / string literals
type AccountTypeCode = 'CHEQUING' | 'SAVINGS' | 'TFSA' | 'RRSP' | 'FHSA' | 'LOC' | 'CREDIT_CARD';
type TransactionTypeCode = 'DEBIT' | 'CREDIT' | 'TRANSFER' | 'FEE' | 'INTEREST' | 'REVERSAL';
type ImportStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
type PlaidItemStatus = 'ACTIVE' | 'EXPIRED' | 'REVOKED' | 'ERROR';
```

---

### API Endpoint Reference

#### Auth (public — no token required)

| Method | Path | Request body | Response |
|---|---|---|---|
| `POST` | `/auth/register` | `{ email, password, confirmPassword, firstName, lastName, phone?, dateOfBirth?, preferredCurrencyId? }` | `TokensResponse` |
| `POST` | `/auth/login` | `{ email, password }` | `TokensResponse` |
| `POST` | `/auth/refresh` | none (send refresh token as Bearer) | `TokensResponse` |

#### Users (access token required)

| Method | Path | Notes |
|---|---|---|
| `GET` | `/users/me` | Authenticated user's record → `SafeUser` |
| `GET` | `/users/:id` | Any user by UUID → `SafeUser` |
| `PATCH` | `/users/:id` | `{ firstName?, lastName?, phone?, dateOfBirth?, preferredCurrencyId? }` → `SafeUser` |

#### Profile (access token required)

| Method | Path | Notes |
|---|---|---|
| `GET` | `/profile` | Same as `/users/me` but derived from JWT |
| `PATCH` | `/profile` | Same body as `PATCH /users/:id` |

#### Accounts (access token required)

| Method | Path | Response |
|---|---|---|
| `GET` | `/accounts/balances` | `AccountBalancesResponse` |

#### Transactions (access token required)

| Method | Path | Query params | Response |
|---|---|---|---|
| `GET` | `/transactions` | `page?, limit?(≤50), bankAccountId?, from?, to?, type?('CREDIT'\|'DEBIT')` | `TransactionsResponse` |

#### Dashboard (access token required — all accept `bankAccountId?`, `from?`, `to?`, `granularity?`)

| Method | Path | Response type |
|---|---|---|
| `GET` | `/dashboard/cash-flow` | `CashFlowPeriod[]` |
| `GET` | `/dashboard/cumulative-balance` | `BalancePoint[]` |
| `GET` | `/dashboard/spending-by-category` | `CategorySlice[]` |
| `GET` | `/dashboard/merchant-concentration` | `MerchantSlice[]` (top 20) |
| `GET` | `/dashboard/recurring-vs-oneoff` | `RecurringVsOneOff` |
| `GET` | `/dashboard/burn-rate` | `BurnRate` |
| `GET` | `/dashboard/currency-exposure` | `CurrencyExposure[]` |
| `GET` | `/dashboard/tags` | `TagSummary[]` or `CashFlowPeriod[]` (if `?tag=<name>`) |

#### Plaid (access token required)

| Method | Path | Body | Response |
|---|---|---|---|
| `POST` | `/plaid/link-token` | none | `{ link_token: string }` |
| `POST` | `/plaid/exchange-token` | `{ publicToken, institutionId?, institutionName? }` | `SyncResult` |
| `POST` | `/plaid/disconnect` | `{ plaidItemId: string }` ← **DB UUID, not Plaid's item_id** | `{ success: true }` |
| `GET` | `/plaid/items` | — | `PlaidItem[]` |

#### Import (access token required)

| Method | Path | Notes |
|---|---|---|
| `POST` | `/import/transactions` | `multipart/form-data`: `file` (CSV ≤10MB) + `bankAccountId` (UUID). Returns `{ importBatchId: string }` |
| `GET` | `/import/batches` | Returns `ImportBatch[]` ordered by `startedAt DESC` |
| `GET` | `/import/batches/:id` | Returns `ImportBatchDetail` with full `errorLog` |

---

### Key Integration Flows

#### Plaid Link

```
1. POST /plaid/link-token → { link_token }
2. Open Plaid Link UI with link_token
3. onSuccess(publicToken, metadata) →
   POST /plaid/exchange-token {
     publicToken,
     institutionId: metadata.institution.institution_id,
     institutionName: metadata.institution.name
   }
4. Poll GET /plaid/items until status === 'ACTIVE'
```

#### CSV Import

```
1. POST /import/transactions (multipart) → { importBatchId }
2. Poll GET /import/batches/:importBatchId
   - Check status: PENDING → PROCESSING → COMPLETED | FAILED
   - Also check fileUploadStatus for S3 confirmation
3. On COMPLETED: show successCount, skippedCount, errorCount
4. On FAILED: show errorLog entries
```

#### Token Refresh

```
1. Intercept 401 response on any protected request
2. POST /auth/refresh (send refresh_token as Bearer)
3. On success: update in-memory access_token, retry original request
4. On failure: clear tokens, redirect to /login
```

---

### CSV Import Format

The backend parser is flexible — supports both headed and headless CSVs:

- **Headed**: auto-detects column names (case-insensitive). Recognized aliases:
  - Date: `date`, `transaction date`, `posted date`, `posting date`
  - Description: `description`, `memo`, `narration`, `details`, `particulars`
  - Amount (unified): `amount`, `transaction amount`, `value`
  - Debit/Credit (split): `debit`/`withdrawal`/`withdrawals` and `credit`/`deposit`/`deposits`
  - Balance: `balance`, `running balance`, `closing balance`
  - Reference: `reference`, `ref no`, `reference number`, `ref#`
- **Headless** (CIBC-style): detected when first cell is a date; positional: `date, description, debit, credit`
- Date formats: `YYYY-MM-DD`, `MM/DD/YYYY`, `DD/MM/YYYY`, `DD-Mon-YYYY`
- Deduplication: SHA-256 fingerprint — duplicate rows are skipped silently

---

### MCC Category Groupings (spending-by-category fallback)

When a transaction has no `categoryId`, the backend groups by MCC code:

| Label | MCCs |
|---|---|
| Grocery | 5411, 5422, 5441, 5451, 5462, 5499 |
| Transport | 4111–4131, 4411–4582, 5511–5599 |
| Dining | 5812, 5813, 5814 |
| Travel | 4722, 4723, 7011, 7012 |
| Health | 5047–5122, 5912 |
| Services | 5940–5999, 7011–7999 |
| Other | everything else |
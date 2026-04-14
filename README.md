# Finlysis — Frontend

Personal finance dashboard built with Next.js 16 (App Router), React 19, Tailwind CSS v4, and shadcn/ui.

---

## Prerequisites

- **Node.js** 20 or later
- **npm** 10 or later
- **Finlysis backend** running at `http://localhost:3000` — see [`../finlysis`](../finlysis) for setup

---

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Create environment file
cp .env.local.example .env.local   # or create manually (see below)
```

**.env.local** (required):

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

---

## Running

```bash
# Development server — http://localhost:3001
npm run dev

# Production build
npm run build

# Serve production build — http://localhost:3000
npm run start

# Lint
npm run lint

# Type-check (no emit)
npx tsc --noEmit
```

> The dev server runs on **port 3001** to avoid conflicting with the backend on port 3000.

---

## Backend dependency

All data is fetched from the NestJS backend at `NEXT_PUBLIC_API_URL`. The backend must be running before the frontend will work beyond the login page.

| Service | Port |
|---|---|
| Backend (NestJS) | 3000 |
| Frontend (Next.js dev) | 3001 |
| Swagger UI | `http://localhost:3000/api/docs` |

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2 — App Router only |
| UI library | React 19.2 |
| Language | TypeScript 5 (strict mode) |
| Styling | Tailwind CSS v4 (`@tailwindcss/postcss`) |
| Components | shadcn/ui via `shadcn` package |
| Icons | Lucide React |
| Fonts | Bodoni Moda, Inter, JetBrains Mono (Google Fonts via `next/font`) |

---

## Project structure

```
app/
  (auth)/
    login/        # /login route — auth form (sign in + register)
    layout.tsx    # Centered full-page layout for auth routes
  layout.tsx      # Root layout — AuthProvider, font variables
  page.tsx        # Redirects / → /login
  globals.css     # Tailwind v4 theme, design tokens, gradient/type utilities

components/
  auth/
    auth-form.tsx # Tabbed login/register card component
  ui/             # shadcn/ui base components (button, card, input, label, tabs)

lib/
  api.ts          # Typed fetch client for the backend API
  auth-context.tsx# AuthProvider + useAuth hook (access token in memory, refresh token in localStorage)
  utils.ts        # cn() helper (clsx + tailwind-merge)
```

---

## Adding shadcn components

```bash
npx shadcn add <component-name>
```

Do **not** create `tailwind.config.ts` — all theme configuration lives in `app/globals.css` under `@theme`.

---

## Auth flow

1. `POST /auth/login` or `POST /auth/register` → returns `{ access_token, refresh_token }`
2. `access_token` stored in React state (in-memory); cleared on page refresh
3. `refresh_token` stored in `localStorage` under key `finlysis_rt`
4. On app load, the `AuthProvider` automatically calls `POST /auth/refresh` to restore the session if a refresh token exists
5. After login/register, the user is redirected to `/dashboard`

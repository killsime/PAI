# FRONTEND

**Next.js 16 App Router** — React 19, Tailwind CSS 4, TypeScript 5.

## STRUCTURE

```
frontend/app/           # App Router pages
  ├── admin/            # Admin dashboard, users, questions, push
  ├── assessment/       # DASS-21 and random assessment flow
  ├── login/register/   # User auth pages
  ├── analysis/         # Assessment analysis/history
  ├── history/          # User assessment history
  ├── test/             # Test/dev page
  ├── services/api.ts   # Centralized typed API client
  └── components/       # Navbar (shared header)
frontend/components/    # Modal, Pagination (shared UI)
```

## WHERE TO LOOK

| Task | File |
|------|------|
| Add/change a page | `app/<route>/page.tsx` |
| API calls | `app/services/api.ts` |
| Shared UI components | `components/Modal.tsx`, `Pagination.tsx` |
| Navbar | `app/components/Navbar.tsx` |
| Global styles | `app/globals.css` |

## CONVENTIONS

- **All pages** are `'use client'` — no server components used
- **Auth**: localStorage `user` (JSON: `{user_id, username}`), `admin_token` for admin routes
- **API**: typed methods in `api.ts` via generic `request<T>()` wrapper over `fetch`
- **Imports**: `@/*` path alias maps to `frontend/*` (e.g. `@/app/services/api`)
- **Styling**: Tailwind utility classes, gradient backgrounds, white cards with shadow
- **Routing**: Next.js App Router file-based routes, `useRouter` for navigation
- **Fonts**: Geist (sans) + Geist Mono via next/font

## ANTI-PATTERNS

- Direct `fetch()` calls in pages bypassing `api.ts` — use the typed API wrapper instead
- localStorage-based auth — no token refresh, no httpOnly cookies, no CSRF protection
- Admin auth check via `useEffect` on client side — users see flash of protected content
- `any` type usage (stats in admin page, test user API)

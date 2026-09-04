# Happy Veggie Frontend

Backend-independent React monorepo (Doc `02-Frontend-Technical-Design.md`).

## Apps

| App | Package | Port | Purpose |
|-----|---------|------|---------|
| Farmer | `@hv/farmer-web` | 5173 | Mobile-first farmer SPA |
| Admin | `@hv/admin-web` | 5174 | Desktop admin SPA |

## Packages (planned)

- `@hv/ui` — design tokens & primitives
- `@hv/api-types` — API contract types
- `@hv/i18n` — shared i18n helpers

## Commands

```bash
pnpm install
pnpm dev:farmer
pnpm dev:admin
pnpm build
pnpm test
```

API base URL: `VITE_API_BASE_URL` (default `/api/v1`, proxied to `http://localhost:5262`). Live API is the default; set `VITE_USE_FIXTURES=true` only for offline UI tests.

Demo farmer: `+923001234567` / OTP `1234`. Demo admin: `admin@happyveggie.pk` / `HappyVeggie!2026`.

Farmer and admin auth sessions must never be shared.

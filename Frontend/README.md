# Happy Veggie Frontend

Backend-independent React monorepo (Doc `02-Frontend-Technical-Design.md`).

## Apps

| App | Package | Port | Purpose |
|-----|---------|------|---------|
| Farmer | `@hv/farmer-web` | 5173 | Mobile-first farmer SPA |
| Admin | `@hv/admin-web` | 5174 | Desktop admin SPA |

## Packages (planned)

- `@hv/ui` — design tokens & primitives (TASK-009)
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

API base URL: `VITE_API_BASE_URL`. Development uses fixtures until backend integration (`05-Frontend-Backend-Integration.md`).

Farmer and admin auth sessions must never be shared.

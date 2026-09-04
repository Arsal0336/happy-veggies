# Admin web (`@hv/admin-web`)

Desktop admin SPA for HAPPY VEGGIE (port **5174**).

## Auth

- Password login via `POST /api/v1/admin/auth/login` (or fixtures in local mode).
- **MFA / SSO is TBD** — see GAP-044 / TBD-01 in `docs/implementation/08-TBD-Decision-Register.md`. Do not invent MFA flows until product/security decides.

## Catalog & ops

Catalog editors (crops, seed varieties, production area types, compatibility), plan review, farm twin inspect, analytics, feature flags, and audit log call live `/api/v1/admin/*` endpoints when fixtures are off (`VITE_USE_FIXTURES=false`).

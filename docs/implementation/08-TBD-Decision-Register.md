# GAP-003 — TBD Decision Register

| ID | Topic | Blocks | Owner | Decision | Date |
|----|-------|--------|-------|----------|------|
| TBD-01 | Admin MFA vs SSO | GAP-044 | Product/Sec | **OPEN / BLOCKED** — no MFA implementation until decision; password-only admin login interim | — |
| TBD-02 | LLM vendor & budget | GAP-030,043 | Product | **DECIDED for hackathon** — Alibaba DashScope / Qwen (`qwen-plus`); budget TBD for production | 2026-09-04 |
| TBD-03 | SMS OTP vendor | Live OTP | Product | **OPEN** | — |
| TBD-04 | Weather API vendor | Live GAP-020 | Product | **OPEN** | — |
| TBD-05 | Soil API vendor | Live GAP-021 | Product | **OPEN** | — |
| TBD-06 | Green Score factor weights | GAP-053 full | Domain | **OPEN** (App G) — interim equal weights in `GreenFarmScoringService` | 2026-09-04 |
| TBD-07 | Map library | GAP-063 | Frontend | **OPEN** — coords display only (`MapOrCoords`); no map library invented this release | 2026-09-04 |
| TBD-08 | Nearby cohort minimum N | Nearby degrade | Product | **OPEN** | — |
| TBD-09 | Mixed-unit display rules | Twin totals | Domain | **OPEN** | — |
| TBD-10 | Alert scheduler cadence | GAP-050 | Backend | **OPEN** — interim: evaluate on twin refresh + `POST .../alerts/evaluate` | 2026-09-04 |
| TBD-11 | Portfolio algorithm | GAP-054 | Domain/AI | **OPEN / BLOCKED** — `GET .../portfolio` returns `{ status: "blocked" }` | 2026-09-04 |
| TBD-12 | Learning delta → future recs | GAP-052 | Domain/AI | **OPEN** — Delta persisted; not yet fed into planners | 2026-09-04 |
| TBD-13 | FR-024 PDF in-release vs deferral | GAP-060 | Product | **DEFERRED** for current release — no PDF generation; Plan UI notes deferral | 2026-09-04 |
| TBD-14 | Native mobile next train | FR-043 | Product | **OPEN** (FR-098 allows web P0) | — |
| TBD-15 | Auth refresh token shape (I-1) | GAP-010 | Integration | **DECIDED for impl** — see below | 2026-09-04 |
| TBD-16 | Soft-delete HTTP shape (I-3) | GAP-011 | Integration | **DECIDED for impl** — see below | 2026-09-04 |
| TBD-17 | Plan review action enum | GAP-041 | Product | **OPEN** — interim below | 2026-09-04 |
| TBD-18 | FarmEconomicSnapshot table vs compute | GAP-023 | Backend | **DECIDED for impl** — compute-on-read | 2026-09-04 |
| TBD-19 | WCAG 2.1 AA audit (NFR-020) | GAP-075 a11y | Frontend/Product | **DEFERRED P2** — no full audit this train; track for later | 2026-09-04 |

## Interim implementation decisions (reversible; not inventing SRS)

These unstall Critical/High slices without choosing vendors:

### TBD-15 — Auth refresh (interim)
- `POST /api/v1/auth/refresh` with `Authorization: Bearer <farmerToken>` → new `sessionToken` (re-issue JWT from claims)
- `POST /api/v1/auth/logout` → client discard (stateless JWT; optional denylist later)
- Admin: `POST /api/v1/admin/auth/refresh`, `POST /api/v1/admin/auth/logout`
- Documented in Doc 05; full refresh-token store remains future enhancement

### TBD-16 — Soft-delete (interim)
- `DELETE /api/v1/farms/{id}` → sets `IsDeleted=true` (204)
- `DELETE /api/v1/farms/{farmId}/production-areas/{areaId}`
- `DELETE /api/v1/farms/{farmId}/production-areas/{areaId}/zones/{zoneId}`
- Lists continue to filter `!IsDeleted`

### TBD-17 — Plan review (interim enum)
Until product finalizes: actions `approve` | `flag` | `dismiss` stored in audit metadata + optional plan flag field.

### TBD-18 — Economics
- `GET /api/v1/farms/{farmId}/economics` compute-on-read via `EconomicsService` (no new snapshot table unless later required)

### TBD-06 / TBD-10 / TBD-11 / TBD-12 — Phase 5 interim (2026-09-04)
- **TBD-06:** Green score uses equal weights across 6 factors; `weightsNote` returned on API; App G weights still OPEN.
- **TBD-10:** No scheduler — alerts evaluated on twin refresh and `POST .../alerts/evaluate` only.
- **TBD-11 / GAP-054:** `GET .../portfolio` returns `{ status: "blocked", reason: "GAP-054 algorithm TBD (GAP-003 TBD-11)" }` — no optimizer invented.
- **TBD-12:** CropCycle `Delta = Actual − Predicted` persisted; not yet consumed by planning/LLM.

### TBD-07 / TBD-13 — Phase 6 UX (2026-09-04)
- **TBD-07:** Map library still **OPEN** — `MapOrCoords` + lat/lng text only; no map vendor chosen.
- **TBD-13 / FR-024:** PDF export **DEFERRED** for current release (Product). Plan page shows “PDF export deferred (FR-024)”; no PDF generation.

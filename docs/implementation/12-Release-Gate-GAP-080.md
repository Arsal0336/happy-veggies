# GAP-080 — SRS Compliance / Release Gate Evidence

| Date | 2026-09-04 |
| Gate verdict | **NOT READY FOR PRODUCTION RELEASE** |
| Reason | Critical TBDs remain open (MFA, live LLM/weather/soil/SMS vendors); stub-only providers; portfolio BLOCKED; full E2E evidence pack incomplete |

This document is the Phase 8 evidence checklist. Items marked **PASS** mean the vertical slice is implemented and automated tests/build succeed against **stub/mock** providers unless noted. **PASS ≠ production SRS DONE** when live vendors or MFA remain TBD.

---

## Checklist (Critical gate)

| Gate item | Status | Evidence / notes |
|-----------|--------|------------------|
| All Must P0 FRs DONE or formally waived | **FAIL** | Live providers + MFA TBD; see TBD register |
| Required P1 Musts for release train DONE or deferred in writing | **PARTIAL** | Portfolio BLOCKED; PDF DEFERRED (TBD-13); WCAG DEFERRED P2 |
| Live providers verified **or** stub-only release explicitly approved | **PENDING APPROVAL** | Stub LLM/weather/soil + mock OTP default; Live* adapters throw/NotImplemented until vendor |
| Auth lifecycle (login, refresh, revoke) | **PASS (stub)** | Farmer/admin refresh + logout APIs + FE; interim JWT re-issue (TBD-15) |
| Authorization owner-scope + admin role | **PASS** | Existing guards + admin role; soft-delete owner-scoped |
| Admin strong auth / MFA | **FAIL / BLOCKED** | GAP-044 / TBD-01 OPEN |
| Audit on privileged ops | **PASS** | Rates, flags, catalog, review, twin inspect audited |
| Soft-delete | **PASS** | Farm/PA/zone DELETE soft; lists filter |
| Water / soil / economics | **PASS (API+UI)** | CRUD/upsert/GET + farmer pages |
| Digital Twin enrichment | **PASS (stub providers)** | RefreshTwin calls providers; degrade on failure |
| Plans structured + localized | **PASS (stub LLM)** | Grounded context; history UI; language regen banner |
| Assistant farm-scoped + disclaimer | **PASS (stub LLM)** | Twin-bound; disclaimer returned |
| Green Score + non-cert disclaimer | **PASS (interim weights)** | Factors + disclaimer; TBD-06 weights OPEN |
| Alerts persisted | **PASS** | Entity + evaluate on refresh; mark-read; FE |
| Experimental/Learning minimum | **PASS** | Outcome + crop-cycle delta; Predicted not overwritten |
| Localization + RTL | **PASS** | en/ur; RTL test |
| PDF DONE or approved deferral | **PASS (deferred)** | TBD-13 DEFERRED 2026-09-04 |
| FE↔BE Doc 05 aligned | **PASS** | Appendices A–D + matrix updates |
| E2E evidence pack attached | **PARTIAL** | Automated: backend tests + farmer/admin Vitest; full live E2E pack not recorded |
| NFR/security/observability minimum | **PASS (minimum)** | Rate limits, health, correlation id, backup doc, timeouts |
| Task plans no longer overstate DONE | **PASS (honesty)** | `07-Status-Honesty-Matrix.md` + this gate |

---

## Automated evidence (this train)

| Suite | Result | Date |
|-------|--------|------|
| `dotnet build` HappyVeggie.Api | Succeeded (0 errors) | 2026-09-04 |
| `dotnet test` HappyVeggie.Tests | See CI/local run log | 2026-09-04 |
| `pnpm --filter @hv/farmer-web test` | 4/4 passed | 2026-09-04 |
| `pnpm --filter @hv/admin-web test` | 1/1 passed | 2026-09-04 |

---

## Blocking TBDs before production

| ID | Topic | Blocks |
|----|-------|--------|
| TBD-01 | Admin MFA / SSO | GAP-044, Critical gate |
| TBD-02 | LLM vendor | GAP-030 live |
| TBD-03 | SMS OTP vendor | Live OTP |
| TBD-04 / TBD-05 | Weather / soil vendors | Live twin enrichment |
| TBD-06 | Green Score weights | Full GAP-053 certification-grade model |
| TBD-11 | Portfolio algorithm | GAP-054 |

## Formal deferrals recorded

| ID | Topic |
|----|-------|
| TBD-13 | Plan PDF (FR-024) — DEFERRED |
| TBD-14 / FR-098 | Native mobile — web P0 OK |
| TBD-19 | WCAG AA — DEFERRED P2 |

---

## GAP backlog summary (implementation train)

| Phase | GAPs | Outcome |
|-------|------|---------|
| 0 | 001–004 | Docs: honesty matrix, TBD register, provider blueprint, Doc 05 sync |
| 1 | 010–013 | Auth refresh/logout, soft-delete, audit writes, feature flags |
| 2 | 020–024 | Twin provider wire, soil/water/economics HTTP, twin summaries |
| 3 | 030–034 | Live LLM **slot** (vendor BLOCKED), grounded plan/assistant, neighbours, varieties |
| 4 | 040–044 | Catalog mutations, plan review, admin twin, analytics; MFA **BLOCKED** |
| 5 | 050–054 | Alerts, experimental, learning, green depth; portfolio **BLOCKED** |
| 6 | 060–066 | PDF deferred, history/regen, graphic/drawer, weather/alerts UX, admin toasts |
| 7 | 070–075 | Rate limits, observability, backup doc, timeouts, health; WCAG deferred |
| 8 | 080 | This gate — **not release-ready** until Critical TBDs closed or waived |

**Release recommendation:** Continue with **stub-provider staging** only after Product explicitly approves stub-only train; do **not** claim SRS production DONE.

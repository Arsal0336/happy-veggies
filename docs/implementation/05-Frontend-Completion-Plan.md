# 05 — Frontend Completion Plan

| | |
|---|---|
| **Purpose** | Close every gap between current codebase and `02-Frontend-Task-Plan.md` |
| **Baseline** | Code audit Sep 3, 2026 vs SRS v1.3 + tech docs 01–05 |
| **Rule** | Each sprint produces typechecking code; fixture-mode OK until backend lands |

---

## Current status snapshot

| Category | Done | Partial | Not started |
|----------|------|---------|-------------|
| Phase 0 scaffold (TASK-007/008/009) | 3 | 0 | 0 |
| Phase 3 foundation (TASK-050–057) | 3 (053,054,055) | 3 (050,056,057) | 2 (051,052) |
| Phase 4 farm management (TASK-064–066) | 0 | 3 | 0 |
| Phase 6 intelligence UI (TASK-087–092) | 3 (088,089,090) | 2 (087,092) | 0 |
| Phase 7 assistant (TASK-107) | 0 | 1 | 0 |
| Phase 8 experimental (TASK-111) | 0 | 0 | 1 |
| Phase 9 green (TASK-122) | 0 | 1 | 0 |
| Phase 11 tests (TASK-142,143) | 0 | 0 | 2 |
| Phase 12 admin depth (TASK-153) | 0 | 1 | 0 |
| **Domain components** (Doc 02 §3.2) | 6 | 0 | 6 |
| **Admin components** (Doc 02 §3.3) | 0 | 2 | 7 |

---

## Execution plan — 8 sprints

### Sprint 1 — API layer + error handling (TASK-051, TASK-052)

**Goal:** Every page talks through a service layer instead of importing fixtures directly. Fixture adapter sits behind the same interface so swap to real backend is a one-line config change.

| # | Deliverable | Files |
|---|-------------|-------|
| 1.1 | Create `farmer-web/src/shared/api/apiInstance.ts` — instantiate `ApiClient` from `@hv/api-types`, read `VITE_API_BASE_URL`, inject auth token from `AuthProvider` | 1 file |
| 1.2 | Create `farmer-web/src/shared/api/useApi.ts` — thin React hook exposing the `ApiClient` singleton | 1 file |
| 1.3 | Create per-feature service files that wrap fixture calls behind typed functions: `farmService.ts`, `twinService.ts`, `planService.ts`, `assistantService.ts`, `greenService.ts`, `alertService.ts` | 6 files |
| 1.4 | Create React Query hooks per feature: `useFarms()`, `useFarm(id)`, `useTwin(farmId)`, `usePlan(farmId)`, `useAlerts()`, `useGreenScore(farmId)`, `useThread(farmId)`, `useSuggestions()` | 1–2 files |
| 1.5 | Refactor **every page** to use hooks instead of direct fixture imports | ~10 page files |
| 1.6 | Create `packages/ui/src/primitives/Toast.tsx` — toast notification component | 1 file |
| 1.7 | Create `farmer-web/src/shared/notifications/useNotifications.ts` — context + hook for toasts | 1 file |
| 1.8 | Create `farmer-web/src/shared/api/errorHandler.ts` — map `ApiError` envelope → toast / inline error / retry CTA | 1 file |
| 1.9 | Wire error handler into `ApiClient.onError` callback | update apiInstance.ts |

**Exit:** `pnpm typecheck` passes; all pages render via hooks; error toast fires on simulated 500.

---

### Sprint 2 — Admin auth + shell (TASK-056 complete)

**Goal:** Admin portal has a real login screen, auth context, and route guard — matching Doc 02 §1.5.

| # | Deliverable | Files |
|---|-------------|-------|
| 2.1 | Create `admin-web/src/features/auth/AdminAuthProvider.tsx` — context with `login(email, pw)`, `logout()`, `isAuthenticated`, fixture adapter | 1 file |
| 2.2 | Create `admin-web/src/features/auth/AdminLoginPage.tsx` — email + password form using `@hv/ui` primitives | 1 file |
| 2.3 | Create `admin-web/src/app/AdminAuthGate.tsx` — redirect to `/login` if not authenticated | 1 file |
| 2.4 | Refactor `AdminApp.tsx` — wrap protected routes in `AdminAuthGate`, add `/login` route | update 1 file |
| 2.5 | Create `admin-web/src/shared/api/adminApiInstance.ts` — admin-scoped `ApiClient` (separate base + admin token) | 1 file |
| 2.6 | Create admin service + hook files mirroring farmer pattern | 3–4 files |

**Exit:** Admin login → dashboard works; unauthenticated redirect works; `pnpm typecheck` passes.

---

### Sprint 3 — Missing domain components (TASK-057 complete)

**Goal:** All 12 domain components from Doc 02 §3.2 exist in `packages/ui`.

| # | Component | Props (key) |
|---|-----------|-------------|
| 3.1 | `TwinSummaryPanel` | `twin: TwinSummary` — weather/soil/water/green chips |
| 3.2 | `PlanSectionList` | `plan: PlanContent` — renders recommended crops, calendar, input guidance, yield, disclaimer as cards |
| 3.3 | `GreenScoreMeter` | `score: GreenFarmScore` — radial/bar meter + dimension breakdown + non-cert disclaimer |
| 3.4 | `AssistantChat` | `messages`, `onSend`, `isLoading` — chat bubbles + citations + disclaimer footer |
| 3.5 | `AlertList` | `alerts`, `onMarkRead` — severity badge + mark-read action |
| 3.6 | `MapOrCoords` | `lat`, `lng`, `onSelect?` — static pin display (map lib TBD, fallback = text coords) |

**Also:** Export all from `packages/ui/src/index.ts`. Refactor pages to use these instead of inline JSX.

**Exit:** `packages/ui` barrel exports all 18 domain components; farmer pages use them; `pnpm typecheck` passes.

---

### Sprint 4 — Farm create/edit + area/zone completion (TASK-064, TASK-065, TASK-066 complete)

**Goal:** Full farm management journeys work (fixture-mode), matching Doc 02 §5.1 journeys 1–3.

| # | Deliverable | Files |
|---|-------------|-------|
| 4.1 | Rewrite `NewFarmPage` as multi-step wizard: location (GPS/manual + `MapOrCoords`) → region → area → soil → water → budget → confirm | rewrite 1 file |
| 4.2 | Create `EditFarmPage` (PATCH semantics, same form pre-filled) | 1 file |
| 4.3 | Add route `/farms/:farmId/edit` to `AppRouter` | update 1 file |
| 4.4 | Complete area management: edit modal, delete (soft), env attributes form for protected types (temp, humidity, ventilation) | update FarmDetailPage or split to `ProductionAreaManagePage` |
| 4.5 | Complete zone management: edit modal, delete, **neighbour selection** (pick adjacent zones), **neighbour warning** (show `CompatibilityBadge` on save if pair = avoid) | update FarmDetailPage or split to `CropZoneManagePage` |
| 4.6 | FarmGraphic: tap zone → drawer with crop info, stage, yield, assistant deep-link (Doc 02 §4.3) | update `FarmGraphic` + add `ZoneDrawer` |
| 4.7 | Empty-state CTAs: "Add production area" on empty farm, "Add zone" on empty area | use `EmptyState` component |

**Exit:** Create farm → add areas → add zones → see on FarmGraphic → edit/delete all works in fixture mode.

---

### Sprint 5 — Plan + Dashboard + Assistant completion (TASK-087, TASK-092, TASK-107 complete)

**Goal:** All P0 intelligence UIs are fully functional per doc.

| # | Deliverable |
|---|-------------|
| 5.1 | `PlanPage` rewrite: use `PlanSectionList`, add "Regenerate" banner (language change or stale), plan history list (fixture `plans[]`), plan generation trigger with loading reassurance screen |
| 5.2 | `DashboardPage` rewrite: use `TwinSummaryPanel`, `AlertList`, `FarmGraphic`, per-farm scoping (farm selector if multiple farms) |
| 5.3 | `AssistantPage` rewrite: use `AssistantChat` domain component, add thread list sidebar, "New thread" action, disclaimer footer always visible |
| 5.4 | `GreenFarmPage` enhance: use `GreenScoreMeter`, add measured-vs-estimated labels per dimension, add "Recalculate" button (fixture stub) |

**Exit:** All farmer intelligence screens use domain components; plan regenerate + history works; assistant supports multiple threads.

---

### Sprint 6 — Experimental farming + Green completion (TASK-111, TASK-122 complete)

**Goal:** P1 experimental and green flows exist.

| # | Deliverable |
|---|-------------|
| 6.1 | Create `ExperimentalPage` — list experimental areas, create experimental plan (small-area recommend), approve/reject, record outcomes | 2–3 files |
| 6.2 | Add route `/farms/:farmId/experimental` (already in router) |
| 6.3 | Create fixture data for experimental workflows in `@hv/api-types/fixtures.ts` |
| 6.4 | `GreenFarmPage` final: `GreenScoreMeter` renders all dimensions, measured-vs-estimated icons, recalculate triggers fixture refresh, non-certification disclaimer prominent |

**Exit:** Experimental area → approve → record outcome flow works in fixture mode; Green score is fully rendered.

---

### Sprint 7 — Admin portal depth (TASK-153 complete)

**Goal:** All admin screens from Doc 02 §1.5 / §5.2 exist.

| # | Deliverable | Component |
|---|-------------|-----------|
| 7.1 | `AdminShell` — reusable layout with role gate (reuse `AdminAuthGate`) | `packages/ui` or admin-local |
| 7.2 | `FarmersPage` — search table with pagination (`FarmersTable`) | admin feature |
| 7.3 | `FarmerDetailPage` — farms list, plans, read-only `AdminFarmGraphic` (= `FarmGraphic` read-only mode) | admin feature |
| 7.4 | `CropsPage`, `SeedVarietiesPage`, `ProductionAreaTypesPage` — CRUD tables (`CatalogEditor`) | 3 admin features |
| 7.5 | `CompatibilityPage` — pair matrix editor (`CompatibilityMatrixEditor`) | admin feature |
| 7.6 | `GovernmentRatesPage` — rates table + add/edit (`RatesUploadPanel`) | admin feature |
| 7.7 | `PlanReviewPage` — flagged plans list + review pane (`PlanReviewPane`) | admin feature |
| 7.8 | `AnalyticsPage` — usage + LLM cost charts (`MetricsCharts`) | admin feature |
| 7.9 | `FeatureFlagsPage` — toggle flags | admin feature |
| 7.10 | Refactor `AuditLogPage` to use reusable `AuditLogTable` component | move to `packages/ui` or admin shared |
| 7.11 | Add all new routes to `AdminApp.tsx` router | update 1 file |
| 7.12 | Create admin fixture data for farmers search, plan review, feature flags, analytics | update `fixtures.ts` |

**Exit:** All 10 admin routes from Doc 02 §1.5 render with fixture data; admin CRUD modals work in-memory.

---

### Sprint 8 — Tests (TASK-142, TASK-143)

**Goal:** Critical test coverage per Doc 02 "Frontend testing focus".

| # | Test type | Scope |
|---|-----------|-------|
| 8.1 | **Component tests** (Vitest + Testing Library) | `FarmGraphic` empty/populated states, `PlanSectionList` render, `GreenScoreMeter` dimensions, `AssistantChat` send, `AlertList` mark-read |
| 8.2 | **Flow tests** | OTP login → create farm → add area → add zone → see on graphic |
| 8.3 | **RTL snapshot tests** | Dashboard, FarmDetail, PlanPage — `ur` locale, `dir=rtl` |
| 8.4 | **Mobile viewport tests** | Dashboard at 375px width |
| 8.5 | **Admin flow test** | Login → dashboard → farmers table → audit log |
| 8.6 | CI script | `pnpm test` runs all `vitest` suites across farmer-web + admin-web |

**Exit:** `pnpm test` passes; ≥20 test cases across both apps; RTL snapshots stored.

---

## Dependency graph

```
Sprint 1 (API layer + errors)
    ↓
Sprint 2 (Admin auth)     Sprint 3 (Domain components)
    ↓                          ↓
Sprint 4 (Farm management — needs domain components)
    ↓
Sprint 5 (Plan + Dashboard + Assistant — needs domain components + API layer)
    ↓
Sprint 6 (Experimental + Green)
    ↓
Sprint 7 (Admin depth — needs admin auth + domain components)
    ↓
Sprint 8 (Tests — needs all UI done)
```

Sprints 2 and 3 can run **in parallel** (no dependency between them).

---

## Files to create (estimated)

| Package / App | New files | Modified files |
|---------------|-----------|----------------|
| `packages/ui` | ~10 (6 domain + Toast + 3 admin) | `index.ts` |
| `packages/api-types` | 0 | `fixtures.ts` (add experimental + admin search data) |
| `apps/farmer-web` | ~15 (services, hooks, pages, tests) | ~12 existing pages |
| `apps/admin-web` | ~18 (auth, features, services, tests) | `AdminApp.tsx`, `main.tsx` |
| **Total** | **~43 new** | **~15 modified** |

---

## Verification checklist (after all 8 sprints)

- [ ] `pnpm --filter @hv/farmer-web typecheck` passes
- [ ] `pnpm --filter @hv/admin-web typecheck` passes
- [ ] `pnpm --filter @hv/farmer-web test` passes (≥15 tests)
- [ ] `pnpm --filter @hv/admin-web test` passes (≥5 tests)
- [ ] Every task in `02-Frontend-Task-Plan.md` can be marked DONE
- [ ] Design system checklist in `02-Frontend-Task-Plan.md` — all boxes checked
- [ ] All farmer journeys (Doc 02 §5.1) functional in fixture mode
- [ ] All admin routes (Doc 02 §1.5) render with fixture data
- [ ] No direct fixture imports in any page component (all via service/hook layer)
- [ ] `FarmGraphic` renders for empty farm, single area, multi-area + zones + edges
- [ ] RTL mode: dashboard + plan + detail pages render correctly in `ur`

---

*This plan does NOT cover backend integration (TASK-068/069/131–136) — that happens after backend is ready, using `04-Integration-Task-Plan.md`.*

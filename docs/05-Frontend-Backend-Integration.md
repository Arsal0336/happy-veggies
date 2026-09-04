# 05 — Frontend ↔ Backend Integration

| | |
|---|---|
| **Source of truth** | HAPPY-VEGGIE-SRS.md v1.3 + `03-Backend-Technical-Design.md` |
| **Audience** | Frontend & backend engineers |
| **Purpose** | Shared HTTP contract, auth, errors, feature matrix |
| **Gap backlog** | [implementation/06-Missing-Modules-Features-Implementation-Plan.md](implementation/06-Missing-Modules-Features-Implementation-Plan.md) |

**Legend:** **[SRS]** · **[TECH]** · **[TBD]**

---

## 1. End-to-end path

```text
React UI
  ↓
Frontend service / hook
  ↓
HTTP API (/api/v1)
  ↓
ASP.NET Core controller
  ↓
CQRS Command/Query
  ↓
Application logic / Domain
  ↓
EF Core / Provider adapters
  ↓
SQL Server / External API
```

---

## 2. API conventions **[TECH]**

| Topic | Convention |
|-------|------------|
| Base URL | `/api/v1` |
| Format | JSON (`Content-Type: application/json`) |
| IDs | UUID strings |
| Dates | ISO 8601 UTC |
| Language | Prefer `Accept-Language` and/or farmer profile language |
| Correlation | `X-Correlation-Id` on requests; echo on responses **[TBD]** header name freeze |
| Pagination | `?page=1&pageSize=20` → `{ items, page, pageSize, totalCount }` |
| Filtering/sorting | `?sort=-createdAt` style **[TBD]** exact grammar |
| Units | Send `value` + `unit`; server stores canonical; responses include both |
| Soft-delete | `DELETE` soft-deletes (`IsDeleted=true`); excluded from default lists; restore **[TBD]** |

### 2.1 HTTP methods

| Method | Use |
|--------|-----|
| GET | Reads / queries |
| POST | Creates, OTP, plan generate, assistant message, twin refresh |
| PATCH | Partial updates |
| DELETE | Soft-delete (GAP-011 interim): farms, production areas, crop zones |

### 2.2 Status codes

| Code | Meaning |
|------|---------|
| 200/201 | Success |
| 400 | Validation / bad request |
| 401 | Unauthenticated |
| 403 | Forbidden (not owner / not admin) |
| 404 | Not found (or not owned — avoid leakage) |
| 409 | Conflict (e.g., version) **[TBD]** usage |
| 429 | Rate limited (OTP request, plan generate, assistant message) — envelope `RATE_LIMITED`, `retryable: true` |
| 422/504 | Generation failed / timeout (retryable flags) |

Fixed-window limits (configurable in `RateLimiting` appsettings; GAP-070 / NFR-019):

| Endpoint | Default | Partition |
|----------|---------|-----------|
| `POST /auth/otp/request` | 5 / minute | IP |
| `POST /farms/{id}/plan` | 10 / hour | authenticated user |
| `POST /farms/{id}/assistant/threads/{id}/messages` | 30 / minute | authenticated user |

---

## 3. Authentication **[SRS + TECH]**

| Step | Contract |
|------|----------|
| Request OTP | `POST /auth/otp/request` `{ phone, language }` |
| Verify | `POST /auth/otp/verify` `{ requestId, phone, code }` → `{ sessionToken, farmer, isNew }` |
| Profile | `POST /farmers/me/profile` when `isNew` |
| Authenticated farmer calls | `Authorization: Bearer <farmerSessionToken>` |
| Farmer 401 | Clear client session → re-auth |
| Refresh/revoke | Interim (I-1 / GAP-010): `POST /auth/refresh` with Bearer farmer token → `{ sessionToken }`; `POST /auth/logout` → 204 (stateless; client discard). Admin: `POST /admin/auth/refresh`, `POST /admin/auth/logout`. Full refresh-token store remains future enhancement. |
| **Admin login** | `POST /admin/auth/login` — separate from OTP (FR-042); password interim; MFA/SSO **[TBD]** |
| **Admin calls** | `Authorization: Bearer <adminSessionToken>` + admin role |
| Admin 401/403 | Re-login admin portal; never use farmer token on `/admin/*` |

Mock OTP: same farmer routes; `mode: mock` in response when configured.

---

## 4. Error contract **[TECH]**

Proposed structure (SRS does not define JSON shape):

```json
{
  "code": "VALIDATION_ERROR",
  "message": "Invalid farm data.",
  "correlationId": "uuid",
  "errors": [
    { "field": "area.value", "message": "Must be greater than zero." }
  ],
  "retryable": false
}
```

| code (examples) | When |
|-----------------|------|
| `VALIDATION_ERROR` | 400 field errors |
| `UNAUTHORIZED` | 401 |
| `FORBIDDEN` | 403 |
| `NOT_FOUND` | 404 |
| `RATE_LIMITED` | 429 + `retryable: true`; optional `Retry-After` header when lease metadata present |
| `GENERATION_FAILED` | Plan/assistant failure |
| `PROVIDER_UNAVAILABLE` | Weather/soil/LLM down (partial twin OK) |

Availability: `GET /api/v1/system/health` → `{ status, utcNow, dbReachable, featureFlagsCount }` (503 if DB unreachable). See `docs/implementation/10-Observability.md`.

Frontend: map `retryable` to Retry CTA.

---

## 5. Provenance & money fields (shared DTO rules)

```json
{
  "value": 7.2,
  "unit": "pH",
  "provenance": "third_party_estimate"
}
```

Economics:

```json
{
  "expectedYield": { "value": 18, "unit": "tons", "confidence": "medium" },
  "governmentReferenceRate": {
    "amount": 1000,
    "currency": "PKR",
    "unit": "per_ton",
    "periodLabel": "previous year",
    "label": "historical_reference"
  },
  "referenceGrossValue": { "amount": 18000, "currency": "PKR" }
}
```

Green score responses **must** include non-certification disclaimer field/flag for UI.

---

## 6. Feature integration matrix

Routes from `03` (proposed). Adjust only via contract change process.

| Frontend Feature | API | Backend module | Main data |
|------------------|-----|----------------|-----------|
| Authentication | `POST /auth/otp/*`, `POST /auth/refresh`, `POST /auth/logout`, profile | Auth | Farmer, session |
| Farm Dashboard | `GET /farms`, `GET /farms/{id}/twin`, `GET .../alerts` | Farm / DigitalTwin / Alerts | Farm state, twin, persisted alerts |
| **Farm graphic** | `GET /farms/{id}/twin` (+ optional layout fields) | DigitalTwin | Areas, zones, edges for `FarmGraphic` |
| Production Areas | `.../production-areas` | Farm | ProductionArea |
| Crop Zones | `.../zones` | Farm | CropZone |
| Digital Twin | `GET/POST .../twin` (+ refresh wires providers) | DigitalTwin | TwinSnapshot |
| Weather | Via twin (+ `POST .../twin/refresh`); statuses on TwinSnapshot / TwinJson | Weather adapter | Weather in twin |
| Soil | **Implemented:** `GET/PUT/POST /api/v1/farms/{farmId}/soil-profiles` (upsert by `productionAreaId`; provenance defaults to `ObservedMeasured` for farmer inputs); twin soilSummary | Soil | SoilProfile + provenance |
| Water | **Implemented:** `GET/POST /api/v1/farms/{farmId}/water-sources`; `PATCH/DELETE /api/v1/farms/{farmId}/water-sources/{waterSourceId}` (soft-delete); twin waterSummary | Water | WaterSource |
| Crop Planning | `POST .../plan`, `GET .../plan/history` | Planning + LLM | FarmPlan + contextUsed |
| Yield / Economics | **Implemented:** `GET /api/v1/farms/{farmId}/economics` (compute-on-read via `EconomicsService`; response includes `disclaimer` + `ratesLabel: historical_reference` C-006); plan sections | Economics | FarmEconomicSnapshot (compute-on-read) |
| Nearby farms | `GET .../suggestions`, `GET .../seed-suggestions/{cropId}` | NearbyFarms / SeedVariety | Aggregates + variety suggestions |
| Experimental | `GET .../experimental`; `POST .../experimental/zones/{zoneId}/approve`; `POST .../experimental/zones/{zoneId}/outcome` | Experimental + CropCycle | Approve → track → actuals (GAP-051) |
| Learning / history | `GET .../crop-cycles`; `POST .../crop-cycles/{cycleId}/actuals` | CropCycle | Predicted vs actual + Delta (GAP-052); future rec weights **TBD-12** |
| Green Farm | `GET/POST .../green-score` (factors, dataQuality, disclaimer, weightsNote TBD-06) | GreenFarm | GreenFarmScore |
| Alerts | `GET .../alerts`; `POST .../alerts/evaluate`; `PATCH .../alerts/{alertId}/read` | Alerts | Persisted Alert entity (GAP-050); cadence **TBD-10** |
| Portfolio | `GET .../portfolio` → `{ status: "blocked", reason: "GAP-054…" }` | — | **BLOCKED** until TBD-11 |
| AI Assistant | `.../assistant/threads*` (disclaimer on message response) | AI | Threads/messages |
| Compatibility | Via twin/plan/zone + `GET .../neighbour-warnings` | Compatibility | Table results |
| **Neighbour edges** | `GET/PUT/POST/DELETE .../neighbour-edges` | NeighbourEdges | FieldNeighbourEdge |
| **Admin login** | `POST /admin/auth/login`, `POST /admin/auth/refresh`, `POST /admin/auth/logout`, `GET /admin/me` | AdminAuth | AdminUser session |
| **Admin dashboard** | `GET /admin/metrics`, `GET /admin/analytics` | AdminAnalytics | Metrics, LLM cost |
| **Admin farmers** | `GET /admin/farmers`, `GET /admin/farmers/{id}` | Admin | Farmer/farm inspect (audited) |
| **Admin farm graphic** | `GET /admin/farms/{farmId}/twin` | Admin + DigitalTwin | Read-only twin/graphic |
| **Admin catalogs** | `/admin/crops`, `seed-varieties`, `production-area-types`, `compatibility` | AdminCatalog | Catalog entities |
| **Admin rates** | `/admin/government-rates` | AdminRates | GovernmentCropRate |
| **Admin AI review** | `/admin/plans`, review actions | AdminReview | Flagged plans |
| **Admin flags / audit** | `/admin/feature-flags`, `/admin/audit-logs` | Admin | Flags, AdminAuditLog |

---

## 7. Sample happy-path sequences

### 7.1 Create farm + default open field

```text
POST /farms
  → FarmDto + default ProductionArea (open_field)
GET /farms/{id}/twin
  → empty zones OK
```

### 7.2 Generate plan

```text
POST /farms/{id}/plan
  → 200 { planId, plan } | 422/504 retryable
GET /plans/{planId}
```

### 7.3 Assistant turn

```text
POST /farms/{id}/assistant/threads
POST .../messages { text }
  → { message, citations[], disclaimer }
```

### 7.4 Farm graphic bind

```text
GET /farms/{id}/twin
  → {
      farm, areas[], zones[], neighbourEdges[],
      weather, waterSummary, greenSummary?,
      layoutMode: "auto" | "stored"   // TBD
    }
  → Farmer FarmGraphic / Admin AdminFarmGraphic
```

### 7.5 Admin inspect farmer farm

```text
POST /admin/auth/login → adminToken
GET /admin/farmers?q=
GET /admin/farms/{farmId}/twin
  → audit log entry written
  → read-only graphic + twin
```

---

## 8. Versioning & change control **[TECH]**

- Breaking DTO changes → new `/api/v2` or additive fields with defaults.
- FE and BE share OpenAPI artifact in CI **[TBD]** generation tool.
- Do not silently change provenance enum strings.
- Farmer and Admin clients use **different auth headers/stores**; never share farmer OTP token with `/admin`.

---

## 9. Open decisions (integration)

| ID | Topic | Status |
|----|--------|--------|
| I-1 | Refresh-token endpoint & cookie vs bearer storage (farmer) | **Resolved (interim)** — Bearer re-issue via `POST /auth/refresh` / `POST /admin/auth/refresh`; logout is client discard (204). Cookie/store TBD later. |
| I-2 | Pagination/filter query grammar | Open |
| I-3 | Soft-delete HTTP shape | **Resolved (interim)** — `DELETE` on farm / production-area / zone → `IsDeleted=true`, 204; cascade soft-delete children on farm (and zones under area). |
| I-4 | OpenAPI generation toolchain | Open |
| I-5 | Exact ProblemDetails vs custom error envelope (align §4) | Open |
| I-6 | Admin login request/response shape (password+MFA vs SSO) | Open (password interim live) |
| I-7 | Twin graphic DTO: auto-layout only vs persisted coordinates | Open |
| I-8 | Alert scheduler cadence (TBD-10) | Open — refresh + `POST .../alerts/evaluate` interim |
| I-9 | Portfolio optimizer algorithm (TBD-11 / GAP-054) | **BLOCKED** — stub returns `{ status: "blocked" }` |
| I-10 | Green Score factor weights (TBD-06) | Open — equal weights interim |
| I-11 | Learning delta → future recommendations (TBD-12) | Open — Delta stored only |

---

## Appendix A — Phase 1 gap register (GAP-010…013)

| Gap | Endpoints / contract |
|-----|----------------------|
| **GAP-010** Auth refresh/revoke | `POST /api/v1/auth/refresh` → `{ sessionToken }`; `POST /api/v1/auth/logout` → 204; `POST /api/v1/admin/auth/refresh` → `{ sessionToken }`; `POST /api/v1/admin/auth/logout` → 204 |
| **GAP-011** Soft-delete | `DELETE /api/v1/farms/{farmId}` (cascades areas+zones); `DELETE /api/v1/farms/{farmId}/production-areas/{areaId}` (cascades zones); `DELETE /api/v1/farms/{farmId}/production-areas/{areaId}/zones/{zoneId}` — all 204, owner-scoped |
| **GAP-012** Admin audit | `IAdminAuditService.WriteAsync`; wired on government-rates create/update; result/correlation/IP in `MetadataJson`; `GET /api/v1/admin/audit-logs` unchanged |
| **GAP-013** Feature flags | `GET /api/v1/admin/feature-flags`; `PATCH /api/v1/admin/feature-flags/{key}` `{ enabled }`; seeds: `otp.use_mock` (true), `weather.enrichment`, `soil.enrichment`, `llm.live` (false); audited via GAP-012 |

---

## Appendix B — Phase 2 digital twin gap register (GAP-020…024)

| Gap | Endpoints / contract |
|-----|----------------------|
| **GAP-020** Weather/soil in RefreshTwin | `POST /api/v1/farms/{farmId}/twin/refresh` calls `IWeatherProvider` / `ISoilProvider`; statuses `success\|failed\|stub` on TwinSnapshot; weather/soil summary in `TwinJson`; provider exceptions do not fail refresh (EIR-005). DI: default stubs; `Weather:UseLive=true` / `Soil:UseLive=true` selects Live* (NotImplemented until vendor) |
| **GAP-021** Soil upsert | `GET /api/v1/farms/{farmId}/soil-profiles`; `PUT` or `POST` upsert (farm-level or `productionAreaId`) |
| **GAP-022** Water CRUD | `GET/POST /api/v1/farms/{farmId}/water-sources`; `PATCH/DELETE .../water-sources/{waterSourceId}` (soft-delete) |
| **GAP-023** Economics HTTP | `GET /api/v1/farms/{farmId}/economics` → disclaimer + `ratesLabel: historical_reference` + items |
| **GAP-024** Twin DTO | `GET .../twin` weather/waterSummary/soilSummary from TwinSnapshot statuses + WaterSources + SoilProfiles |

---

## Appendix C — Phase 3 AI & planning gap register (GAP-030…034)

| Gap | Endpoints / contract |
|-----|----------------------|
| **GAP-030** Live LLM adapter (vendor TBD — **BLOCKED**) | DI: default `StubLlmProvider`; `Llm:UseLive=true` → `LiveLlmProvider` (throws `NotImplementedException("LLM vendor TBD (GAP-003)")` after flag/`ApiKey` checks). Usage: `LlmUsageLogs` table for admin analytics. Stub may log `model=stub`, cost `0`. |
| **GAP-031** Grounded plan generation | `POST /api/v1/farms/{farmId}/plan` builds context (areas/zones, soil summary, water count/types, weather status, language); persists `ContextUsedJson`; LLM failure → clear error, farm unchanged; structured `planSections`. `GET .../plan/history`. |
| **GAP-032** Grounded assistant | `POST .../assistant/threads/{id}/messages` → twin-bound context + productionAreaType guard; response always includes `disclaimer` (stub/live). |
| **GAP-033** Neighbour edges | `GET/PUT/POST /api/v1/farms/{farmId}/neighbour-edges` body `{ zoneAId, zoneBId }`; `DELETE .../neighbour-edges/{edgeId}`; `GET .../neighbour-warnings` via `CompatibilityService`. Owner-scoped. |
| **GAP-034** Seed variety UX | `GET /api/v1/farms/{farmId}/seed-suggestions/{cropId}` (existing); FE applies via `PATCH .../zones/{zoneId}` `{ seedVarietyId }`. |

---

## Appendix D — Phase 4 admin operations gap register (GAP-040…044)

| Gap | Endpoints / contract |
|-----|----------------------|
| **GAP-040** Catalog mutations | `POST/PATCH /api/v1/admin/crops`; `POST/PATCH /api/v1/admin/seed-varieties`; `POST/PATCH /api/v1/admin/production-area-types`; `PUT`/`PATCH /api/v1/admin/compatibility` (upsert by id or cropA+cropB+scope). Soft-disable via `Enabled`. Each write audited (`IAdminAuditService`). |
| **GAP-041** Plan review | `FarmPlan.IsFlagged` + `ReviewStatus` (`none\|approved\|flagged\|dismissed`); `GET /api/v1/admin/plans?flagged=true`; `POST /api/v1/admin/plans/{planId}/review` `{ action: "approve"\|"flag"\|"dismiss", note? }` — audited. |
| **GAP-042** Admin farm twin | `GET /api/v1/admin/farms/{farmId}/twin` via `DigitalTwinAssembler` (no farmer ownership); audit `farm.twin_inspect`. |
| **GAP-043** Analytics | `GET /api/v1/admin/analytics` → `{ farmers, farms, plans, threads, llmUsageCount, estimatedCostUsd }` from counts + `LlmUsageLogs`. |
| **GAP-044** MFA | **OPEN/BLOCKED** — do not invent MFA; see TBD-01. Password admin login interim only. |

---

## 10. Cross-document consistency checklist

| Term | 01 | 02 | 03 | 04 | 05 |
|------|----|----|----|----|-----|
| Farm / ProductionArea / CropZone / CropCycle | ✓ | ✓ | ✓ | ✓ | ✓ |
| DigitalTwin / FarmPlan / GreenFarmScore | ✓ | ✓ | ✓ | ✓ | ✓ |
| FarmGraphic (schematic) | ✓ | ✓ | ✓ | — | ✓ |
| Admin portal / AdminUser / audit | — | ✓ | ✓ | ✓ | ✓ |
| WaterSource / Soil / Weather | ✓ | ✓ | ✓ | ✓ | ✓ |
| Experimental as ProductionArea type | ✓ | ✓ | ✓ | ✓ | ✓ |
| Nearby = aggregates only | ✓ | ✓ | ✓ | ✓ | ✓ |
| Gov rate → reference gross value | ✓ | ✓ | ✓ | det. | ✓ |
| LLM ≠ deterministic source of truth | ✓ | ✓ | ✓ | ✓ | — |
| Stack ASP.NET / CQRS / EF / SQL / React FC | — | ✓ | ✓ | adapter | ✓ |

**Non-goals of these docs:** sprint plans, code, invented SRS features.

---

*Ready for review/approval before sprint planning.*

# 05 — Frontend ↔ Backend Integration

| | |
|---|---|
| **Source of truth** | HAPPY-VEGGIE-SRS.md v1.3 + `03-Backend-Technical-Design.md` |
| **Audience** | Frontend & backend engineers |
| **Purpose** | Shared HTTP contract, auth, errors, feature matrix |

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
| Soft-delete | Excluded from default lists; restore **[TBD]** |

### 2.1 HTTP methods

| Method | Use |
|--------|-----|
| GET | Reads / queries |
| POST | Creates, OTP, plan generate, assistant message, twin refresh |
| PATCH | Partial updates |
| DELETE | Soft-delete if used; else PATCH `isDeleted` **[TBD]** |

### 2.2 Status codes

| Code | Meaning |
|------|---------|
| 200/201 | Success |
| 400 | Validation / bad request |
| 401 | Unauthenticated |
| 403 | Forbidden (not owner / not admin) |
| 404 | Not found (or not owned — avoid leakage) |
| 409 | Conflict (e.g., version) **[TBD]** usage |
| 429 | Rate limited (OTP/LLM) |
| 422/504 | Generation failed / timeout (retryable flags) |

---

## 3. Authentication **[SRS + TECH]**

| Step | Contract |
|------|----------|
| Request OTP | `POST /auth/otp/request` `{ phone, language }` |
| Verify | `POST /auth/otp/verify` `{ requestId, phone, code }` → `{ sessionToken, farmer, isNew }` |
| Profile | `POST /farmers/me/profile` when `isNew` |
| Authenticated farmer calls | `Authorization: Bearer <farmerSessionToken>` |
| Farmer 401 | Clear client session → re-auth |
| Refresh/revoke | FR-044 — exact refresh endpoint **[TBD]** |
| **Admin login** | `POST /admin/auth/login` — separate from OTP (FR-042); method **[TBD]** |
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
| `RATE_LIMITED` | 429 + `retryAfter` |
| `GENERATION_FAILED` | Plan/assistant failure |
| `PROVIDER_UNAVAILABLE` | Weather/soil/LLM down (partial twin OK) |

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
| Authentication | `POST /auth/otp/*`, profile | Auth | Farmer, session |
| Farm Dashboard | `GET /farms`, `GET /farms/{id}/twin`, alerts | Farm / DigitalTwin | Farm state, twin summary |
| **Farm graphic** | `GET /farms/{id}/twin` (+ optional layout fields) | DigitalTwin | Areas, zones, edges for `FarmGraphic` |
| Production Areas | `.../production-areas` | Farm | ProductionArea |
| Crop Zones | `.../zones` | Farm | CropZone |
| Digital Twin | `GET/POST .../twin` | DigitalTwin | TwinSnapshot |
| Weather | Via twin (+ refresh) | Weather adapter | Weather in twin |
| Soil | Twin + soil upsert | Soil | SoilProfile + provenance |
| Water | `.../water-sources` | Water | WaterSource |
| Crop Planning | `POST .../plan`, `GET .../plans` | Planning + LLM | FarmPlan |
| Yield / Economics | Plan sections + `GET .../economics` | Economics | FarmEconomicSnapshot |
| Nearby farms | `GET /suggestions` | NearbyFarms | Aggregates only |
| Experimental | Experimental area + outcome APIs | Experimental | ProductionArea + CropCycle |
| Green Farm | `GET/POST .../green-score` | GreenFarm | GreenFarmScore |
| AI Assistant | `.../assistant/threads*` | AI | Threads/messages |
| Compatibility | Via twin/plan/zone update responses | Compatibility | Table results |
| **Admin login** | `POST /admin/auth/login`, `GET /admin/me` | AdminAuth | AdminUser session |
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

| ID | Topic |
|----|--------|
| I-1 | Refresh-token endpoint & cookie vs bearer storage (farmer) |
| I-2 | Pagination/filter query grammar |
| I-3 | Soft-delete HTTP shape |
| I-4 | OpenAPI generation toolchain |
| I-5 | Exact ProblemDetails vs custom error envelope (align §4) |
| I-6 | Admin login request/response shape (password+MFA vs SSO) |
| I-7 | Twin graphic DTO: auto-layout only vs persisted coordinates |

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

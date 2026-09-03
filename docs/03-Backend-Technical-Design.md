# 03 — Backend Technical Design

| | |
|---|---|
| **Source of truth** | HAPPY-VEGGIE-SRS.md v1.3 |
| **Audience** | .NET engineers |
| **Purpose** | ASP.NET Core + CQRS + EF Core + SQL Server design |
| **Stack [SRS]** | C-010–C-011 |

**Legend:** **[SRS]** · **[TECH]** · **[TBD]**

---

## 1. Architecture

```text
API (Controllers — thin)
  ↓
Application / CQRS (Commands, Queries, Handlers, Validators, DTOs)
  ↓
Domain (entities, domain services, invariants)
  ↓
Infrastructure (EF Core, SQL Server, provider adapters, LLM, SMS)
  ↓
SQL Server / External providers
```

| Layer | Responsibility |
|-------|----------------|
| **API** | HTTP, authN/Z, problem details, map to CQRS |
| **Application** | Use cases; orchestration; no provider SDKs |
| **Domain** | Invariants (area caps, owner scope, soft-delete); pure rules |
| **Infrastructure** | EF DbContext, migrations, `IWeatherProvider`, `ISoilProvider`, `ILlmProvider`, `IOtpProvider` |

Background: hosted services / queue consumers for twin refresh, alerts, long LLM jobs (NFR-016 aspirational).

---

## 2. Domain entities **[SRS]**

Keep lean — only SRS-supported concepts.

```text
Farmer 1──* Farm 1──* ProductionArea 1──* CropZone (Field)
                         │                    └──* CropCycle (optional)
Farm 1──* WaterSource
Farm 1──* TwinSnapshot
Farm 1──* FarmPlan (versioned)
Farm 1──* AssistantThread 1──* AssistantMessage
Farm 1──0..1 FarmSustainability / GreenFarmScore records
Farm 1──* FarmEconomicSnapshot
Farm 1──* Alert
Crop (catalog) 1──* SeedVariety
CropCompatibility (pair table)
ProductionAreaType (catalog)
GovernmentCropRate
RegionCropStats (anonymized)
FieldNeighbourEdge
FarmActivity / SeasonOutcome
AdminUser (privileged operator — not Farmer)
AdminAuditLog
```

| Entity | Key fields (conceptual) |
|--------|-------------------------|
| **Farmer** | Id, Phone E.164, Name, Language, timestamps |
| **Farm** | FarmerId, Name, Lat/Lng, Region, AreaAcres + AreaInput, SoilProfile, Budget, soft-delete |
| **ProductionArea** | FarmId, TypeCode, Name, Area value/unit/canonical, env attrs + provenance, optional **layout** (X,Y,W,H) **[TBD]**, soft-delete |
| **ProductionAreaType** | Code, names, Category open\|protected\|experimental, Enabled |
| **CropZone** | ProductionAreaId, FarmId, Label, Area, CropId/freetext, SeedVarietyId, PlantingDate, GrowthStage, ExpectedYield, IsExperimental, optional **layout** **[TBD]** |
| **CropCycle** | CropZoneId, Season, Predicted/Actual metrics |
| **WaterSource** | FarmId, Type, availability, capacity, reliability, method, served refs, provenance |
| **SoilProfile** | Attached to farm and/or area; typed attrs + provenance |
| **WeatherSnapshot** | Stored in TwinSnapshot / dedicated table **[TBD]** |
| **TwinSnapshot** | FarmId, Json document (includes graphic-ready area/zone lists + neighbour edges), RefreshedAt, provider statuses |
| **FarmPlan** | FarmId, FarmerId, Language, ContentJson, ContextUsed, Version |
| **Recommendation** | **[TECH]** May be embedded in plan/twin JSON initially; separate table **[TBD]** if needed for alerts feed |
| **ExperimentalCrop** | Modeled as Experimental `ProductionArea` + zones + CropCycle (no duplicate entity required) |
| **FarmSustainability / GreenFarmScore** | FarmId, scores, explanations, availability map, computed_at |
| **FarmEconomicSnapshot** | Yield summary, reference gross value, currency, as_of |
| **AssistantThread / Message** | Farm-scoped; roles; citations; timestamps |
| **Crop / SeedVariety / CropCompatibility** | Catalogs |
| **RegionCropStats** | Aggregates only |
| **GovernmentCropRate** | Crop, unit, rate, period, source label |
| **AdminUser** | Id, Email (or SSO subject), Role(s), MFA flags, timestamps — **separate from Farmer** (FR-042) |
| **AdminAuditLog** | ActorAdminId, Action, TargetType, TargetId, Metadata, Timestamp |

**Irrigation:** attributes on WaterSource and/or ProductionArea linkage — exact normalization **[TBD]** (SRS allows both).

---

## 3. CQRS patterns **[TECH]**

Library: **MediatR or equivalent [TBD]** — pattern mandated, package not.

### 3.1 Example flow

```text
CreateFarm
  → CreateFarmCommand + Validator
  → Handler
  → Domain (create Farm + default Open Field ProductionArea)
  → EF SaveChanges
  → FarmDto
```

### 3.2 Commands / Queries by area

| Area | Commands (examples) | Queries (examples) |
|------|---------------------|--------------------|
| Auth | `RequestOtp`, `VerifyOtp`, `CompleteProfile` | `GetMe` |
| Farm | `CreateFarm`, `UpdateFarm`, `SoftDeleteFarm` | `ListFarms`, `GetFarm` |
| ProductionArea | `CreateProductionArea`, `UpdateProductionArea`, `SoftDeleteProductionArea` | `ListProductionAreas` |
| CropZone | `CreateCropZone`, `UpdateCropZone`, `SetNeighbours` | `ListCropZones` |
| Twin | `RefreshTwin` | `GetFarmTwin` |
| Water | `UpsertWaterSource` | `ListWaterSources` |
| Soil | `UpsertSoilProfile`, `UpsertSoilTest` | (via twin) |
| Planning | `GenerateFarmPlan` | `GetPlan`, `ListPlanHistory` |
| Economics | (compute on generate/refresh) | `GetEconomicSnapshot` |
| Nearby | — | `GetCropSuggestions` |
| Experimental | `ApproveExperimentalPlan`, `RecordExperimentalOutcome` | `GetExperimentalStatus` |
| Green | `RecalculateGreenScore` | `GetGreenScore` |
| Assistant | `StartThread`, `PostMessage` | `ListThreads`, `GetThread` |
| Alerts | `MarkAlertRead` | `ListAlerts` |
| Admin auth | `AdminLogin`, `AdminLogout` | `GetAdminMe` |
| Admin ops | catalog/rate CRUD, `FlagPlanReview`, `UpdateFeatureFlags` | `AdminMetrics`, `SearchFarmers`, `GetFlaggedPlans`, `GetAuditLogs`, `GetAdminFarmTwin` |

Handlers call **domain services** for: area validation, compatibility, green score, economics (`yield × rate`), twin assembly (**graphic-ready DTO**).

Validators: FluentValidation or equivalent **[TBD]** — phone E.164, area > 0, land sum ≤ farm total (+ tolerance), enum types.

DTOs: read models for UI; never expose other farmers’ data to farmers; admin farmer/farm views are privileged and **audit-logged**.

---

## 4. API surface (proposed)

Base: `/api/v1` **[TECH]**  
Farmer auth: Bearer farmer session JWT **[TECH — exact token format TBD]**  
Admin: `/api/v1/admin/...` + **Admin** role policies (FR-042)

### 4.1 Farmer auth

| Method | Route | Purpose | Auth |
|--------|-------|---------|------|
| POST | `/auth/otp/request` | Send/mock OTP | Anonymous |
| POST | `/auth/otp/verify` | Session + is_new | Anonymous |
| POST | `/farmers/me/profile` | Name/language | Farmer |

### 4.2 Farms & structure

| Method | Route | Purpose | Auth |
|--------|-------|---------|------|
| GET | `/farms` | List farms | Owner |
| POST | `/farms` | Create (+ default open_field area) | Owner |
| GET | `/farms/{farmId}` | Detail | Owner |
| PATCH | `/farms/{farmId}` | Update | Owner |
| GET/POST | `/farms/{farmId}/production-areas` | List/create areas | Owner |
| PATCH | `/farms/{farmId}/production-areas/{areaId}` | Update area (+ optional layout) | Owner |
| GET/POST | `/farms/{farmId}/production-areas/{areaId}/zones` | Crop zones | Owner |
| PATCH | `.../zones/{zoneId}` | Update zone (+ optional layout) | Owner |

### 4.3 Twin, water, planning, green, AI

| Method | Route | Purpose | Auth |
|--------|-------|---------|------|
| GET | `/farms/{farmId}/twin` | Twin summary **including graphic payload** (areas, zones, edges, chips) | Owner |
| POST | `/farms/{farmId}/twin/refresh` | Refresh feeds | Owner (P1) |
| GET/POST | `/farms/{farmId}/water-sources` | Water | Owner |
| POST | `/farms/{farmId}/plan` | Generate plan | Owner |
| GET | `/farms/{farmId}/plans` | History | Owner |
| GET | `/plans/{planId}` | One plan | Owner |
| GET | `/farms/{farmId}/economics` | Economic snapshot | Owner |
| GET | `/suggestions` | Nearby/AI crop suggestions | Owner |
| GET | `/farms/{farmId}/green-score` | Green score | Owner |
| POST | `/farms/{farmId}/green-score/recalculate` | Recompute | Owner |
| GET/POST | `/farms/{farmId}/assistant/threads` | Threads | Owner |
| POST | `.../threads/{threadId}/messages` | Send message | Owner |
| GET | `/farms/{farmId}/alerts` | Alerts | Owner |

### 4.4 Admin portal API **[SRS FR-038–042, 083, 097]**

| Method | Route | Purpose | Auth |
|--------|-------|---------|------|
| POST | `/admin/auth/login` | Admin session (not OTP) | Anonymous |
| GET | `/admin/me` | Admin profile/roles | Admin |
| GET | `/admin/metrics` | Signups, plans, active farms, LLM cost | Admin |
| GET | `/admin/farmers` | Search farmers `?q=` | Admin + audit |
| GET | `/admin/farmers/{id}` | Farmer detail | Admin + audit |
| GET | `/admin/farms/{farmId}/twin` | Inspect twin + graphic data | Admin + audit |
| GET/POST/PATCH | `/admin/crops` | Crop catalog | Admin |
| GET/POST/PATCH | `/admin/seed-varieties` | Seed variety catalog | Admin |
| GET/PUT | `/admin/compatibility` | Companion table | Admin |
| GET/POST/PATCH | `/admin/production-area-types` | Extensible types | Admin |
| GET/POST/PATCH | `/admin/government-rates` | Historical reference rates | Admin |
| GET | `/admin/plans` | `?flagged=` sampled/flagged plans | Admin |
| POST | `/admin/plans/{id}/review` | Review action notes | Admin + audit |
| GET/PATCH | `/admin/feature-flags` | OTP/weather/soil flags | Admin + audit |
| GET | `/admin/analytics` | Usage charts data | Admin |
| GET | `/admin/audit-logs` | Privileged action log | Admin |

Every admin mutating call writes `AdminAuditLog`. Farmers **cannot** call `/admin/*`.

Request/response JSON schemas: refine in `05`; field-level **[TBD]** until contract freeze.

**Validation highlights:** Pakistani phone normalize; area units; production area type exists & enabled; owner scope on farmer APIs; admin role on `/admin`; soft-delete filters.

---

## 5. Application / infrastructure services

| Service | Role | Adapter |
|---------|------|---------|
| `FarmManagementService` / handlers | CRUD farm/area/zone invariants | EF |
| `DigitalTwinAssembler` | Build twin read model + **FarmGraphic DTO** | EF + providers |
| `CropPlanningService` | Suitability, portfolio inputs, plan orchestration | EF + LLM |
| `CompatibilityService` | Deterministic table lookup | EF |
| `WeatherEnrichmentService` | Fetch + map weather | `IWeatherProvider` |
| `SoilEnrichmentService` | Fetch/estimate soil | `ISoilProvider` |
| `WaterEvaluationService` | Constraint checks | Domain |
| `YieldEstimationService` | Structured yield | **[TBD]** rules/LLM |
| `EconomicsService` | yield × government rate | EF rates |
| `NearbyFarmsService` | Aggregates only | EF stats |
| `ExperimentalWorkflowService` | Small-area flow + outcomes | EF |
| `GreenFarmScoringService` | Deterministic score + explanations | EF |
| `RecommendationService` | Alerts / next actions | Domain + optional LLM copy |
| `FarmAssistantService` | Context pack + LLM + validate | `ILlmProvider` |
| `OtpService` | mock/live | `IOtpProvider` |
| `AdminAuthService` | Admin credentials / SSO / MFA | **[TBD]** IdP |
| `AdminCatalogService` | Crops, varieties, types, compatibility | EF |
| `AdminRatesService` | Government rate ingest | EF |
| `AdminReviewService` | Flagged plan review | EF |
| `AdminAnalyticsService` | Metrics + LLM usage | EF / logs |
| `AuditService` | Append-only admin audit | EF |

All egress: timeouts, circuit breaker, no secrets in logs (NFR-012/013/015).

---

## 6. EF Core / SQL Server notes **[TECH]**

- One bounded context DbContext initially (split later if needed **[TBD]**).
- Migrations as schema source of truth.
- Indexes: `Farmer.Phone` unique; `Farm.FarmerId`; `ProductionArea.FarmId`; `CropZone.ProductionAreaId`; plan `(FarmId, Version)`; `AdminUser.Email` unique; `AdminAuditLog` by time/actor.
- JSON columns for plan content / twin snapshot acceptable; twin response always includes arrays needed by `FarmGraphic`.

---

## 7. Open decisions (backend)

| ID | Topic |
|----|--------|
| B-1 | MediatR vs custom CQRS dispatcher |
| B-2 | Farmer JWT claims / refresh strategy |
| B-3 | WeatherSnapshot table vs only TwinSnapshot JSON |
| B-4 | Recommendation as entity vs embedded JSON |
| B-5 | Job queue tech for async LLM/twin refresh |
| B-6 | API versioning policy beyond `/api/v1` |
| B-7 | Admin auth: password+MFA vs SSO |
| B-8 | Persist FarmGraphic layout coordinates or auto-layout only |

---

*Frontend consumes these routes via `05`. Logic rules in `01`. AI provider usage in `04`. Admin UI in `02`.*

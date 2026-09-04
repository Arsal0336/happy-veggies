# 00 — Master Implementation Plan

| | |
|---|---|
| **Product** | HAPPY VEGGIE — AI Farm Digital Twin |
| **Baseline** | SRS v1.3 + tech docs `01`–`05` |
| **Purpose** | Trackable implementation tasks (no redesign, no new features) |
| **Status legend** | `NOT STARTED` \| `READY` \| `IN PROGRESS` \| `BLOCKED` \| `IN REVIEW` \| `QA` \| `DONE` \| `DEFERRED` |

**Workstream docs:** [01-Backend](01-Backend-Task-Plan.md) · [02-Frontend](02-Frontend-Task-Plan.md) · [03-AI](03-AI-Task-Plan.md) · [04-Integration](04-Integration-Task-Plan.md)

**SRS gap backlog (authoritative for missing/incomplete work):** [06-Missing-Modules-Features-Implementation-Plan](06-Missing-Modules-Features-Implementation-Plan.md) · [07-Status-Honesty-Matrix](07-Status-Honesty-Matrix.md) · [12-Release-Gate-GAP-080](12-Release-Gate-GAP-080.md)

---

## 1. Overview & strategy

Implement the approved technical baseline: ASP.NET Core + CQRS + EF Core + SQL Server backend; React functional-component farmer and admin apps; pluggable weather/soil/OTP/LLM adapters; deterministic business rules with LLM for language/explanation only.

**Rules:** Same Task IDs across all five planning docs. Do not invent APIs/fields/providers. Mark unresolved contracts as `TBD — API contract required`. Estimates are `—` until the team sizes them.

### Progress calculation

```text
Overall Progress % = DONE / (Total Tasks − DEFERRED) × 100
```

Tasks in `DEFERRED` are excluded from the denominator. All other statuses count as not done.

### Progress summary (update as work proceeds)

```text
Total Tasks: 104
NOT STARTED: 88
READY: 0
IN PROGRESS: 0
BLOCKED: 0
IN REVIEW: 0
QA: 0
DONE: 66
DEFERRED: 0

Overall Progress: 16%
```

---

## 2. Phases

| Phase | Name | Goal | Exit criteria |
|-------|------|------|---------------|
| **0** | Foundation | Runnable BE solution + FE scaffolds + shared API conventions | CQRS/EF boot; farmer+admin apps run; error contract drafted |
| **1** | Core Backend / Domain | Entities + farmer OTP auth | Migrations apply; OTP mock auth works |
| **2** | Digital Twin | Twin assembler + GET twin (graphic payload) | Twin returns areas/zones/weather stubs |
| **3** | Frontend Foundation | Routing, API client, DS, FarmGraphic shell, i18n | Empty farm home + graphic shell |
| **4** | Core Farm Management | Farm/area/zone APIs + FE flows + admin auth shell | Create multi-area farm end-to-end |
| **5** | External Integrations | OTP/weather/soil/rates adapters | Graceful degradation proven |
| **6** | Farm Intelligence | Compatibility, plan, economics, nearby, varieties | Plan generate + sections render |
| **7** | AI Farm Assistant | Context pack + chat APIs + FE chat | Farm-scoped grounded Q&A |
| **8** | Experimental Farming | Experimental area workflow + learning hook | Approve + record actuals |
| **9** | Green Farm Intelligence | Score service + APIs + UI | Explainable score, no certification |
| **10** | FE/BE Integration | Feature matrix E2E + contract freeze | Matrix rows wired |
| **11** | Testing & Hardening | Automated tests + failure paths | Critical path covered |
| **12** | Production Readiness | Admin depth, observability, backups, gates | Checklist pass |

---

## 3. Master task table

| Task ID | Phase | Area | Task | Description | Deliverable | Dependencies | Priority | Status | Owner | Estimate | Notes |
| ------- | ----- | ---- | ---- | ----------- | ----------- | ------------ | -------- | ------ | ----- | -------- | ----- |
| TASK-001 | 0 | Backend | ASP.NET solution structure | Create API/Application/Domain/Infrastructure projects | Solution + project refs | — | P0 | DONE | Backend | — | Doc 03 §1 |
| TASK-002 | 0 | Backend | CQRS infrastructure | MediatR (or equiv), thin controllers dispatch | Pipeline behaviors stub | TASK-001 | P0 | DONE | Backend | — | Doc 03 §3; package TBD |
| TASK-003 | 0 | Backend | EF Core + SQL Server | DbContext, migrations host, connection config | DbContext + first migration host | TASK-001 | P0 | DONE | Backend | — | Doc 03 §6 |
| TASK-004 | 0 | Backend | Config, logging, exceptions | Appsettings, structured logs, global exception → error envelope | Middleware | TASK-001 | P0 | DONE | Backend | — | Aligns TASK-010 |
| TASK-005 | 0 | Backend | Validation pipeline | FluentValidation (or equiv) in CQRS pipeline | Behavior + sample validator | TASK-002 | P0 | DONE | Backend | — | Package TBD |
| TASK-006 | 0 | Backend | Farmer auth scaffolding | JWT bearer for farmer sessions (claims TBD) | Auth middleware | TASK-001 | P0 | DONE | Backend | — | Doc 03 §4.1 |
| TASK-007 | 0 | Frontend | Farmer-web scaffold | React app, feature folders, functional components only | `apps/farmer-web` | — | P0 | DONE | Frontend | — | Doc 02 §1 |
| TASK-008 | 0 | Frontend | Admin-web scaffold | Separate React admin SPA shell | `apps/admin-web` | — | P0 | DONE | Frontend | — | Doc 02 §1.1 |
| TASK-009 | 0 | Frontend | Shared UI tokens package | Design tokens + primitive exports | `packages/ui` (or equiv) | TASK-007 | P0 | DONE | Frontend | — | Doc 02 §3 |
| TASK-010 | 0 | Integration | API conventions + error contract | `/api/v1`, status codes, error JSON shape | Contract doc + FE/BE types stub | — | P0 | DONE | Integration | — | Doc 05 §2–4 |
| TASK-011 | 0 | Integration | Auth header conventions | Farmer vs admin bearer separation | Auth integration notes | TASK-010 | P0 | DONE | Integration | — | Doc 05 §3 |
| TASK-012 | 0 | Integration | Correlation ID + date/units conventions | Headers, ISO UTC, value+unit | Convention checklist | TASK-010 | P0 | DONE | Integration | — | Doc 05 §2 |
| TASK-020 | 1 | Backend | Farmer entity + migration | Phone E.164, name, language | EF entity + migration | TASK-003 | P0 | DONE | Backend | — | Doc 03 §2 |
| TASK-021 | 1 | Backend | Farm entity | Lat/lng, region, area acres + input, soft-delete | Entity + migration | TASK-020 | P0 | DONE | Backend | — | Doc 03 §2 |
| TASK-022 | 1 | Backend | ProductionAreaType catalog | Seed core types (open_field, shed, …) | Table + seed data | TASK-003 | P0 | DONE | Backend | — | Doc 03 §2; FR-110 |
| TASK-023 | 1 | Backend | ProductionArea entity | Farm child; type; area units; env attrs + provenance | Entity + migration | TASK-021, TASK-022 | P0 | DONE | Backend | — | Doc 01 §1 |
| TASK-024 | 1 | Backend | CropZone entity | Area FK; crop; variety; stage; neighbours optional | Entity + migration | TASK-023 | P0 | DONE | Backend | — | Doc 03 §2 |
| TASK-025 | 1 | Backend | Crop + SeedVariety catalogs | Localized names; enable flags | Entities + seed subset | TASK-003 | P0 | DONE | Backend | — | Doc 03 §2 |
| TASK-026 | 1 | Backend | CropCompatibility + FieldNeighbourEdge | Pair table + adjacency | Entities + seed pairs | TASK-025 | P0 | DONE | Backend | — | Doc 01 §3.4 |
| TASK-027 | 1 | Backend | WaterSource entity | Farm water sources + provenance | Entity + migration | TASK-021 | P1 | DONE | Backend | — | P1 richness |
| TASK-028 | 1 | Backend | SoilProfile persistence | Farm/area soil + provenance | Entity or owned type | TASK-021 | P0 | DONE | Backend | — | Doc 03 §2 |
| TASK-029 | 1 | Backend | TwinSnapshot entity | JSON document + refreshed_at | Entity + migration | TASK-021 | P0 | DONE | Backend | — | Doc 03 §2 |
| TASK-030 | 1 | Backend | FarmPlan entity | Versioned content JSON + context_used | Entity + migration | TASK-021 | P0 | DONE | Backend | — | Doc 03 §2 |
| TASK-031 | 1 | Backend | AssistantThread + Message | Farm-scoped chat persistence | Entities + migration | TASK-021 | P1 | DONE | Backend | — | Doc 03 §2 |
| TASK-032 | 1 | Backend | AdminUser + AdminAuditLog | Separate from Farmer; audit table | Entities + migration | TASK-003 | P0 | DONE | Backend | — | FR-042 |
| TASK-033 | 1 | Backend | OTP request/verify/profile APIs | Mock OTP parity; session token | Endpoints | TASK-006, TASK-020, TASK-005 | P0 | DONE | Backend | — | Doc 03 §4.1 |
| TASK-034 | 1 | Backend | Owner-scoped authorization | Every farm-scoped id checks owner | Policies/filters | TASK-006, TASK-021 | P0 | DONE | Backend | — | FR-002 |
| TASK-035 | 1 | Backend | Unit conversion helpers | Acre/kanal/marla/sq ft canonical store | Domain helpers | TASK-023 | P0 | DONE | Backend | — | C-008; mixed display TBD |
| TASK-040 | 2 | Backend | DigitalTwinAssembler | Aggregate farm/areas/zones/weather/soil/water | Domain/app service | TASK-023, TASK-024, TASK-029 | P0 | DONE | Backend | — | Doc 01 §1.3; 03 §5 |
| TASK-041 | 2 | Backend | GET /farms/{id}/twin | Twin summary + FarmGraphic payload | Query + DTO | TASK-040, TASK-034 | P0 | DONE | Backend | — | Doc 03 §4.3 |
| TASK-042 | 2 | Backend | Twin refresh command | Refresh feeds; record provider status | Command handler | TASK-041 | P1 | DONE | Backend | — | Stubs OK until TASK-071 |
| TASK-043 | 2 | Backend | Area aggregation rules | Land vs covered unit groups; tolerance | Domain rules | TASK-035, TASK-040 | P0 | DONE | Backend | — | FR-049; L-1 TBD |
| TASK-050 | 3 | Frontend | Farmer routing + auth gate | Routes per Doc 02 §1.4 | Router + guards | TASK-007 | P0 | DONE | Frontend | — | |
| TASK-051 | 3 | Frontend | API client + server state | Typed client; cache library TBD | Client + hooks | TASK-007, TASK-010 | P0 | DONE | Frontend | — | F-1 TBD |
| TASK-052 | 3 | Frontend | Error/loading/notifications | Map error envelope; toasts; spinners | Shared UX | TASK-051, TASK-010 | P0 | DONE | Frontend | — | Doc 02 §1.8 |
| TASK-053 | 3 | Frontend | Design system primitives | Button, FormField, Card, Badge, Modal, Table | Components | TASK-009 | P0 | DONE | Frontend | — | Doc 02 §3.1 |
| TASK-054 | 3 | Frontend | i18n + RTL | en/ur catalogs; dir switch | i18n setup | TASK-007 | P0 | DONE | Frontend | — | Doc 02 §6 |
| TASK-055 | 3 | Frontend | FarmGraphic shell | Schematic canvas + legend (auto-layout) | `FarmGraphic` | TASK-053 | P0 | DONE | Frontend | — | Doc 02 §4; 01 §1.4 |
| TASK-056 | 3 | Frontend | Admin shell + login UI | Admin layout + login screen | Admin chrome | TASK-008, TASK-053 | P0 | DONE | Frontend | — | Auth API TASK-067 |
| TASK-057 | 3 | Frontend | Domain badges | Provenance, area-type, compatibility badges | Components | TASK-053 | P0 | DONE | Frontend | — | Doc 02 §3.2 |
| TASK-060 | 4 | Backend | Farm CRUD APIs | List/create/get/patch; default open_field area | Endpoints | TASK-021, TASK-023, TASK-033 | P0 | DONE | Backend | — | Doc 03 §4.2 |
| TASK-061 | 4 | Backend | ProductionArea APIs | CRUD areas all types | Endpoints | TASK-023, TASK-034 | P0 | DONE | Backend | — | |
| TASK-062 | 4 | Backend | CropZone APIs | CRUD zones; optional neighbour set | Endpoints | TASK-024, TASK-026 | P0 | DONE | Backend | — | |
| TASK-063 | 4 | Backend | Default Open Field on create | FR-111 behavior | Domain logic | TASK-060 | P0 | DONE | Backend | — | |
| TASK-064 | 4 | Frontend | Farm create/edit flows | GPS/manual location; region; area | Screens | TASK-050, TASK-051, TASK-054 | P0 | DONE | Frontend | — | Map lib F-3 TBD |
| TASK-065 | 4 | Frontend | Production area management UI | Open/shed/GH/tunnel/experimental | Screens | TASK-064, TASK-057 | P0 | DONE | Frontend | — | Doc 02 §5.1 |
| TASK-066 | 4 | Frontend | Crop zone management UI | Add crops; neighbour warnings | Screens | TASK-065 | P0 | DONE | Frontend | — | |
| TASK-067 | 4 | Backend | Admin login + /admin/me | Separate admin auth (method TBD) | Endpoints | TASK-032 | P0 | DONE | Backend | — | TBD — auth method; Doc 03 §4.4 |
| TASK-068 | 4 | Integration | Wire farmer auth FE↔BE | OTP → token → authenticated calls | Working auth path | TASK-033, TASK-051, TASK-011 | P0 | DONE | Integration | — | Doc 05 §7 |
| TASK-069 | 4 | Integration | Wire farm/area/zone FE↔BE | CRUD round-trips | Working farm setup | TASK-060, TASK-061, TASK-062, TASK-064, TASK-065, TASK-066 | P0 | DONE | Integration | — | |
| TASK-070 | 5 | Backend | IOtpProvider mock/live | Identical contracts; config flag | Adapter | TASK-033 | P0 | DONE | Backend | — | Doc 03 §5 |
| TASK-071 | 5 | Backend | IWeatherProvider adapter | Timeout; map to twin weather fields | Adapter | TASK-042 | P0 | DONE | Backend | — | Stub provider |
| TASK-072 | 5 | Backend | ISoilProvider adapter | Graceful skip on failure | Adapter | TASK-042 | P1 | DONE | Backend | — | Stub provider |
| TASK-073 | 5 | Backend | Government rates admin ingest | CRUD/upload historical rates | Admin APIs | TASK-067 | P1 | DONE | Backend | — | Doc 03 §4.4 |
| TASK-074 | 5 | Integration | Verify provider failure paths | Twin works without weather/soil | Test evidence | TASK-071, TASK-072, TASK-041 | P0 | NOT STARTED | Integration | — | NFR-005 |
| TASK-080 | 6 | Backend | CompatibilityService | Deterministic table; FR-103 order | Domain service | TASK-026 | P0 | DONE | Backend | — | Doc 01 §3.4 |
| TASK-081 | 6 | Backend | EconomicsService | yield × government reference rate | Domain service | TASK-073 | P1 | DONE | Backend | — | Doc 01 §3.9 |
| TASK-081.1 | 6 | Backend | Economics with seed rates | Allow P0 demo rates seed if admin ingest late | Seed data | TASK-081 | P0 | DONE | Backend | — | Unblocks plan demo |
| TASK-082 | 6 | Backend | YieldEstimationService | Structured yield + confidence | Service | TASK-040 | P0 | DONE | Backend | — | Heuristic; algo TBD |
| TASK-083 | 6 | Backend | CropPlanningService | Orchestrate suitability + constraints | App service | TASK-080, TASK-082, TASK-040 | P0 | DONE | Backend | — | Doc 01 §3 |
| TASK-084 | 6 | Backend | POST /farms/{id}/plan + history | Generate + list/get plans | Endpoints | TASK-083, TASK-030, TASK-104 | P0 | DONE | Backend | — | AI content TASK-104 TBD |
| TASK-085 | 6 | Backend | NearbyFarmsService | Aggregates only; AI-only degrade | Service + GET /suggestions | TASK-025 | P1 | DONE | Backend | — | FR-035 |
| TASK-086 | 6 | Backend | Seed variety suggestion | Rank catalog by env/region | Service | TASK-025, TASK-040 | P1 | DONE | Backend | — | Doc 01 §3.16 |
| TASK-087 | 6 | Frontend | Plan view UI | Section cards; no raw JSON; regenerate banner | Screens | TASK-053, TASK-054 | P0 | DONE | Frontend | — | Wire TASK-132 |
| TASK-088 | 6 | Frontend | Compatibility UI | Badges + neighbour mode on graphic | UI | TASK-055, TASK-057 | P0 | DONE | Frontend | — | |
| TASK-089 | 6 | Frontend | Economics display | Reference rate labels | UI | TASK-057 | P1 | DONE | Frontend | — | Doc 05 §5 |
| TASK-090 | 6 | Frontend | Nearby suggestions UI | Community vs AI-only labels | UI | TASK-053 | P1 | DONE | Frontend | — | |
| TASK-091 | 6 | Backend | Alerts list API | Dashboard alerts (on-load OK P0) | Endpoint | TASK-040 | P0 | DONE | Backend | — | FR-036 |
| TASK-092 | 6 | Frontend | Dashboard + alerts | Twin summary chips + alert list | Screens | TASK-055, TASK-064 | P0 | DONE | Frontend | — | FR-028/120 |
| TASK-100 | 7 | AI | ILlmProvider abstraction | CompleteChat/CompleteJson; config | Interface + stub/impl | TASK-001 | P0 | DONE | AI | — | Doc 04 §2 |
| TASK-101 | 7 | AI | Prompt + plan JSON schema infra | Versioned prompts; schema | Artifacts + helpers | TASK-100 | P0 | DONE | AI | — | Doc 04 §3.3 |
| TASK-102 | 7 | AI | Token/cost/timeout controls | Bounds + rate limit hooks | Options + middleware | TASK-100 | P0 | DONE | AI | — | NFR-007/019 |
| TASK-103 | 7 | AI | FarmContext pack builder | Twin-grounded context; env tags | Builder service | TASK-040, TASK-100 | P1 | DONE | AI | — | Doc 04 §3.2 |
| TASK-104 | 7 | AI | Plan JSON generation + validate | LLM JSON; retry once; persist via BE | Integration with TASK-084 | TASK-101, TASK-103, TASK-083 | P0 | DONE | AI | — | Doc 04 §5.1 |
| TASK-105 | 7 | Backend | Assistant thread/message APIs | Start thread; post message | Endpoints | TASK-031, TASK-103, TASK-106 | P1 | DONE | Backend | — | AI stub; Doc 03 §4.3 |
| TASK-106 | 7 | AI | Assistant response validation | No PII leak; disclaimer; citations | Validator | TASK-103, TASK-100 | P1 | DONE | AI | — | Doc 04 §3.4 |
| TASK-107 | 7 | Frontend | AssistantChat UI | Threads, messages, citations, disclaimer | Feature | TASK-053, TASK-054 | P1 | DONE | Frontend | — | Doc 02 §3.2 |
| TASK-108 | 7 | AI | AI grounding & isolation tests | Missing data refuse; farm isolation | Test suite | TASK-103, TASK-106 | P1 | DONE | AI | — | 21 AI tests |
| TASK-109 | 7 | AI | Embeddings / vector search | Optional knowledge retrieval | Deferred capability | TASK-100 | P2 | DEFERRED | AI | — | Per Doc 04 §4 |
| TASK-110 | 8 | Backend | Experimental workflow | Small-area recommend; approve; outcomes | Commands/APIs | TASK-061, TASK-083 | P1 | DONE | Backend | — | Doc 01 §3.11 |
| TASK-111 | 8 | Frontend | Experimental farming UI | Create/track experimental area | Screens | TASK-065 | P1 | DONE | Frontend | — | Doc 02 §5.1 |
| TASK-112 | 8 | Backend | CropCycle actuals + learning | Predicted vs actual store | Entities/APIs | TASK-024, TASK-110 | P1 | DONE | Backend | — | Doc 01 §3.15 |
| TASK-120 | 9 | Backend | GreenFarmScoringService | Deterministic score; available dims only | Service | TASK-040 | P1 | DONE | Backend | — | Availability-based |
| TASK-121 | 9 | Backend | Green score APIs | GET + recalculate | Endpoints | TASK-120 | P1 | DONE | Backend | — | Doc 03 §4.3 |
| TASK-122 | 9 | Frontend | Green Farm UI | Score, factors, non-cert disclaimer | Screens | TASK-057 | P1 | DONE | Frontend | — | C-014 |
| TASK-123 | 9 | AI | Green tip wording | NL tips after score; label source type | Prompt path | TASK-120, TASK-103 | P1 | DONE | AI | — | FR-131 |
| TASK-130 | 10 | Integration | Contract freeze / OpenAPI | Freeze DTOs for P0/P1 surfaces | OpenAPI artifact | TASK-010, TASK-060, TASK-041, TASK-084 | P0 | NOT STARTED | Integration | — | Toolchain TBD |
| TASK-131 | 10 | Integration | Twin + FarmGraphic E2E | Twin → FarmGraphic bind | E2E evidence | TASK-041, TASK-055, TASK-069 | P0 | DONE | Integration | — | Doc 05 §7.4 |
| TASK-132 | 10 | Integration | Plan generate E2E | FE → POST plan → sections | E2E evidence | TASK-084, TASK-087, TASK-104 | P0 | DONE | Integration | — | |
| TASK-133 | 10 | Integration | Assistant E2E | Chat round-trip farm-scoped | E2E evidence | TASK-105, TASK-107 | P1 | DONE | Integration | — | |
| TASK-134 | 10 | Integration | Green + Experimental E2E | Score + experimental flows | E2E evidence | TASK-121, TASK-122, TASK-110, TASK-111 | P1 | DONE | Integration | — | |
| TASK-135 | 10 | Integration | Admin catalogs/rates E2E | Admin UI ↔ admin APIs | E2E evidence | TASK-152, TASK-073 | P1 | DONE | Integration | — | |
| TASK-136 | 10 | Integration | Remaining feature-matrix wires | Water, soil upsert, suggestions, alerts | Checklist done | TASK-069, TASK-074 | P1 | DONE | Integration | — | Doc 05 §6 |
| TASK-140 | 11 | Backend | BE unit + integration tests | Domain rules, handlers, EF | Test projects | TASK-060, TASK-080, TASK-040 | P0 | DONE | Backend | — | 25 tests |
| TASK-141 | 11 | Backend | API authz tests | Owner isolation; admin vs farmer | Tests | TASK-034, TASK-067 | P0 | DONE | Backend | — | |
| TASK-142 | 11 | Frontend | Component + flow tests | Critical farmer journeys | Tests | TASK-064, TASK-087 | P0 | DONE | Frontend | — | |
| TASK-143 | 11 | Frontend | RTL / i18n / responsive tests | ur RTL; mobile layouts | Tests | TASK-054 | P0 | DONE | Frontend | — | |
| TASK-144 | 11 | Backend | Provider failure tests | Weather/soil/LLM timeouts | Tests | TASK-071, TASK-072, TASK-100 | P0 | DONE | Backend | — | |
| TASK-145 | 11 | AI | Prompt + cost control tests | Schema validate; token bounds | Tests | TASK-104, TASK-102 | P0 | DONE | AI | — | |
| TASK-150 | 12 | Backend | Observability | Metrics/tracing for twin/LLM/providers | Telemetry | TASK-004 | P1 | DONE | Backend | — | Structured logging |
| TASK-151 | 12 | Backend | Backup/restore runbook | SQL backups + restore drill notes | Runbook | TASK-003 | P1 | DONE | Backend | — | EF migrations |
| TASK-152 | 12 | Backend | Admin portal APIs depth | Farmers, catalogs, plans review, flags, audit, metrics | Admin endpoints | TASK-067, TASK-025, TASK-026, TASK-022 | P1 | DONE | Backend | — | Doc 03 §4.4 |
| TASK-153 | 12 | Frontend | Admin portal UI depth | Tables, catalog editors, review, analytics, audit | Admin screens | TASK-056, TASK-152 | P1 | DONE | Frontend | — | Doc 02 §1.5 §5.2 |
| TASK-154 | 12 | Integration | Production readiness gate | Walk SRS/tech checklist | Sign-off record | TASK-130, TASK-140, TASK-141 | P0 | NOT STARTED | Integration | — | SRS §6.3 |

---

## 4. Critical path

```text
TASK-001/002/003 + TASK-010
        ↓
TASK-020–024 + TASK-033/034
        ↓
TASK-060–063 (Farm/Area/Zone APIs)
        ↓
TASK-040/041 (Digital Twin + graphic payload)
        ↓
TASK-068/069 (FE↔BE farm setup)
        ↓
TASK-080/083 + TASK-100–104 (Intelligence + Plan LLM)
        ↓
TASK-084/132 (Plan API + E2E)
        ↓
TASK-103/105/107/133 (Assistant)
        ↓
TASK-140/141/154 (Hardening + gate)
```

---

## 5. Parallel work

```text
Phase 0–1 Backend Domain/Auth
      ├→ Phase 3 Frontend Foundation + Design System (after TASK-007/009)
      ├→ Phase 0 Integration contracts (TASK-010–012)
      └→ TASK-100 AI provider stub (early)

After TASK-041 twin API:
      ├→ TASK-055/131 FarmGraphic bind
      └→ TASK-080+ intelligence services

After TASK-084 plan API:
      ├→ TASK-087 plan UI
      └→ TASK-132 plan E2E

P1 tracks (can parallel after twin + farm CRUD):
      ├→ Experimental (110–112)
      ├→ Green (120–123)
      └→ Admin depth (152–153)
```

---

## 6. Definition of Done (apply where relevant)

A task may move to **DONE** only when applicable items are true:

- Implementation matches tech docs / SRS terminology  
- Architecture layers respected (CQRS; React functional components)  
- Validation + error handling per contract  
- Owner/admin authz correct  
- Tests added for the change  
- Logging/observability for integration points  
- API contract verified if endpoint task  
- FE↔BE verified if integration task  
- Disclaimers/provenance for AI/economics/green  
- Code review + QA for the change set  

Irrelevant criteria may be skipped (e.g., no UI for pure domain helper).

---

## 7. Traceability (sample → full coverage by Area docs)

| Task ID | Source Document | Source Section |
| ------- | --------------- | -------------- |
| TASK-001 | 03-Backend-Technical-Design | §1 Architecture |
| TASK-002 | 03-Backend-Technical-Design | §3 CQRS |
| TASK-010 | 05-Frontend-Backend-Integration | §2–4 Conventions / errors |
| TASK-023 | 01-Core-Technical-Logic | §1 Farm Digital Twin model |
| TASK-040 | 01-Core-Technical-Logic | §1.3 Aggregation |
| TASK-041 | 03-Backend-Technical-Design | §4.3 Twin APIs |
| TASK-055 | 02-Frontend-Technical-Design | §4 Graphical representation |
| TASK-080 | 01-Core-Technical-Logic | §3.4 Crop compatibility |
| TASK-081 | 01-Core-Technical-Logic | §3.9 Government reference rate |
| TASK-100 | 04-AI-Technical-Design | §2 Provider abstraction |
| TASK-103 | 04-AI-Technical-Design | §3.2 FarmContext pack |
| TASK-104 | 04-AI-Technical-Design | §5.1 Plan generation |
| TASK-109 | 04-AI-Technical-Design | §4 Embeddings |
| TASK-120 | 01-Core-Technical-Logic | §3.13 Green Farm Score |
| TASK-152 | 03-Backend-Technical-Design | §4.4 Admin portal API |
| TASK-153 | 02-Frontend-Technical-Design | §1.5 / §5.2 Admin portal |

---

## 8. Detailed tasks (complex / blockers)

### TASK-002 — CQRS infrastructure
- **Objective:** Wire command/query dispatch from thin controllers.  
- **Scope:** Dispatcher, pipeline (logging/validation hooks), sample ping handler.  
- **Acceptance:** Controller sends command/query; handler executes; no business logic in controller.  
- **Notes:** Package choice TBD (MediatR or equivalent).

### TASK-010 — API conventions + error contract
- **Objective:** Single error/auth/pagination convention for FE and BE.  
- **Scope:** Error JSON (`code`, `message`, `errors`, `retryable`, `correlationId`); status code map.  
- **Acceptance:** Both apps parse the same envelope; documented in Doc 05 alignment.  
- **Dependencies:** None (blocks TASK-068+).

### TASK-033 — OTP APIs
- **Objective:** Unified passwordless farmer entry with mock OTP.  
- **Acceptance:** Request → verify → session; `isNew` → profile; mock code path; rate-limit hooks.  
- **Notes:** Live SMS behind `IOtpProvider` (TASK-070).

### TASK-040 / TASK-041 — Digital Twin
- **Objective:** Assemble and expose twin read model including FarmGraphic arrays.  
- **Acceptance:** Areas/zones/weather/soil/water summaries; provenance fields; owner-scoped; no raw LLM blobs.  
- **Notes:** Mixed acre/sq ft display rules remain TBD (Doc 01 L-1).

### TASK-055 — FarmGraphic shell
- **Objective:** Schematic farm visualization (not cadastral).  
- **Acceptance:** Renders areas/zones from twin props; legend; tap zone; RTL-safe chrome.  
- **Notes:** Auto-layout first; stored coordinates optional later.

### TASK-067 — Admin auth
- **Objective:** Admin session separate from farmer OTP.  
- **Acceptance:** `/admin/*` rejects farmer tokens; audit login.  
- **Notes:** MFA vs SSO still TBD — implement password+MFA stub or SSO adapter behind interface without inventing vendor lock-in.

### TASK-083 / TASK-104 / TASK-084 — Plan generation
- **Objective:** Deterministic orchestration + LLM JSON sections + API.  
- **Acceptance:** Schema-valid plan; retry once on bad JSON; context_used flags; history versioned; UI-ready sections.  
- **Rules:** Compatibility/economics deterministic; LLM does not own those numbers.

### TASK-103 / TASK-105 / TASK-106 — Assistant
- **Objective:** Farm-scoped grounded chat.  
- **Acceptance:** Context includes production area types; refuses inventing facts; disclaimer; no cross-farm leakage.

### TASK-120 — GreenFarmScoringService
- **Objective:** Explainable score from available data only.  
- **Acceptance:** Missing dims marked unavailable; not labeled certification; recalc on twin change trigger.

### TASK-109 — Embeddings
- **Objective:** Optional retrieval later.  
- **Default:** Keep `NOT STARTED`; move to `DEFERRED` when team confirms TwinContext-only for P1.

---

## 9. Status update protocol

When changing status, update **this master table and the matching workstream row** for the same Task ID. Use only the controlled status list.

---

## 10. Cross-document validation

Validated against sources **2026-09-03** (no repo code marked DONE):

| Check | Result |
| ----- | ------ |
| Unique Task IDs in master table | **104** (TASK-001–TASK-154 with intentional ID gaps; includes TASK-081.1) |
| Workstream partition | Backend **55** + Frontend **25** + AI **10** + Integration **14** = **104** |
| ID set equality | Master table IDs = union of all four workstream tables (no orphans, no extras) |
| Primary owner | Each task owned by exactly one Area; workstream doc matches master Owner column |
| Invented features | None — tasks trace to docs 01–05 / SRS v1.3 P0/P1 only |
| Open contracts | Flagged `TBD — API contract required` where tech docs leave DTOs open (admin auth, mixed units, provider choices) |
| P2 / deferrable | TASK-109 (embeddings) P2; TwinContext-first per Doc 04 for P0/P1 |
| Coverage — Doc 01 | Twin model, aggregation, FarmGraphic payload, business logic §3.1–3.16, provenance, learning |
| Coverage — Doc 02 | Farmer + admin apps, routing, API client, DS, FarmGraphic, journeys, i18n/RTL |
| Coverage — Doc 03 | Solution layers, entities, CQRS, farmer/admin APIs, services, adapters, EF |
| Coverage — Doc 04 | ILlmProvider, prompts/schema, FarmContext, plan JSON, assistant, tests; embeddings deferred |
| Coverage — Doc 05 | Conventions, error envelope, auth headers, feature-matrix E2E (TASK-130–136, TASK-068–069) |

---

*End of Master Implementation Plan. Workstreams must reuse these Task IDs exactly.*

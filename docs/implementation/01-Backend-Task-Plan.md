# 01 — Backend Task Plan

| | |
|---|---|
| **Track** | Backend |
| **Sources** | `01-Core-Technical-Logic.md`, `03-Backend-Technical-Design.md`, `05-Frontend-Backend-Integration.md` |
| **Master** | [00-Master-Implementation-Plan.md](00-Master-Implementation-Plan.md) |
| **Owner role** | `Backend` |

Statuses and Task IDs **must match the Master**. Default status: `NOT STARTED`.

---

## Dependencies on other tracks

| Need from others | Tasks |
|------------------|-------|
| Integration error/auth conventions | TASK-010, TASK-011 before public API freeze |
| AI plan JSON + FarmContext | TASK-104, TASK-103 before/with TASK-084, TASK-105 |
| FE not required to start domain | Parallel OK after TASK-001 |

---

## Backend task table

| Task ID | Phase | Area | Task | Description | Deliverable | Dependencies | Priority | Status | Owner | Estimate | Notes |
| ------- | ----- | ---- | ---- | ----------- | ----------- | ------------ | -------- | ------ | ----- | -------- | ----- |
| TASK-001 | 0 | Backend | ASP.NET solution structure | API/Application/Domain/Infrastructure | Solution | — | P0 | NOT STARTED | Backend | — | Doc 03 §1 |
| TASK-002 | 0 | Backend | CQRS infrastructure | Commands/queries/handlers pipeline | CQRS host | TASK-001 | P0 | NOT STARTED | Backend | — | Doc 03 §3 |
| TASK-003 | 0 | Backend | EF Core + SQL Server | DbContext + migrations host | Persistence | TASK-001 | P0 | NOT STARTED | Backend | — | Doc 03 §6 |
| TASK-004 | 0 | Backend | Config, logging, exceptions | Structured logs; map to error envelope | Middleware | TASK-001 | P0 | NOT STARTED | Backend | — | |
| TASK-005 | 0 | Backend | Validation pipeline | CQRS validators | Behavior | TASK-002 | P0 | NOT STARTED | Backend | — | |
| TASK-006 | 0 | Backend | Farmer auth scaffolding | JWT bearer farmer | Auth | TASK-001 | P0 | NOT STARTED | Backend | — | |
| TASK-020 | 1 | Backend | Farmer entity + migration | Identity store | EF | TASK-003 | P0 | NOT STARTED | Backend | — | |
| TASK-021 | 1 | Backend | Farm entity | Core farm aggregate root | EF | TASK-020 | P0 | NOT STARTED | Backend | — | |
| TASK-022 | 1 | Backend | ProductionAreaType catalog | Seed core types | EF + seed | TASK-003 | P0 | NOT STARTED | Backend | — | |
| TASK-023 | 1 | Backend | ProductionArea entity | Multi-environment areas | EF | TASK-021, TASK-022 | P0 | NOT STARTED | Backend | — | |
| TASK-024 | 1 | Backend | CropZone entity | Zones under areas | EF | TASK-023 | P0 | NOT STARTED | Backend | — | |
| TASK-025 | 1 | Backend | Crop + SeedVariety catalogs | Catalog tables | EF + seed | TASK-003 | P0 | NOT STARTED | Backend | — | |
| TASK-026 | 1 | Backend | CropCompatibility + FieldNeighbourEdge | Deterministic pairs | EF | TASK-025 | P0 | NOT STARTED | Backend | — | |
| TASK-027 | 1 | Backend | WaterSource entity | Water intelligence data | EF | TASK-021 | P1 | NOT STARTED | Backend | — | |
| TASK-028 | 1 | Backend | SoilProfile persistence | Provenance-aware soil | EF | TASK-021 | P0 | NOT STARTED | Backend | — | |
| TASK-029 | 1 | Backend | TwinSnapshot entity | Twin JSON storage | EF | TASK-021 | P0 | NOT STARTED | Backend | — | |
| TASK-030 | 1 | Backend | FarmPlan entity | Versioned plans | EF | TASK-021 | P0 | NOT STARTED | Backend | — | |
| TASK-031 | 1 | Backend | AssistantThread + Message | Chat persistence | EF | TASK-021 | P1 | NOT STARTED | Backend | — | |
| TASK-032 | 1 | Backend | AdminUser + AdminAuditLog | Admin identity + audit | EF | TASK-003 | P0 | NOT STARTED | Backend | — | |
| TASK-033 | 1 | Backend | OTP request/verify/profile APIs | Farmer auth endpoints | API | TASK-006, TASK-020, TASK-005 | P0 | NOT STARTED | Backend | — | |
| TASK-034 | 1 | Backend | Owner-scoped authorization | Farm ownership enforcement | Policies | TASK-006, TASK-021 | P0 | NOT STARTED | Backend | — | |
| TASK-035 | 1 | Backend | Unit conversion helpers | Canonical area storage | Domain | TASK-023 | P0 | NOT STARTED | Backend | — | |
| TASK-040 | 2 | Backend | DigitalTwinAssembler | Aggregate twin read model | Service | TASK-023, TASK-024, TASK-029 | P0 | NOT STARTED | Backend | — | |
| TASK-041 | 2 | Backend | GET twin API | Twin + graphic payload | API | TASK-040, TASK-034 | P0 | NOT STARTED | Backend | — | |
| TASK-042 | 2 | Backend | Twin refresh command | Enrichment refresh | Command | TASK-041 | P1 | NOT STARTED | Backend | — | |
| TASK-043 | 2 | Backend | Area aggregation rules | Land vs covered validation | Domain | TASK-035, TASK-040 | P0 | NOT STARTED | Backend | — | |
| TASK-060 | 4 | Backend | Farm CRUD APIs | Farm endpoints | API | TASK-021, TASK-023, TASK-033 | P0 | NOT STARTED | Backend | — | |
| TASK-061 | 4 | Backend | ProductionArea APIs | Area endpoints | API | TASK-023, TASK-034 | P0 | NOT STARTED | Backend | — | |
| TASK-062 | 4 | Backend | CropZone APIs | Zone endpoints | API | TASK-024, TASK-026 | P0 | NOT STARTED | Backend | — | |
| TASK-063 | 4 | Backend | Default Open Field on create | FR-111 | Domain | TASK-060 | P0 | NOT STARTED | Backend | — | |
| TASK-067 | 4 | Backend | Admin login + /admin/me | Admin auth APIs | API | TASK-032 | P0 | NOT STARTED | Backend | — | TBD — MFA/SSO |
| TASK-070 | 5 | Backend | IOtpProvider mock/live | OTP adapter | Adapter | TASK-033 | P0 | NOT STARTED | Backend | — | |
| TASK-071 | 5 | Backend | IWeatherProvider adapter | Weather enrichment | Adapter | TASK-042 | P0 | NOT STARTED | Backend | — | Provider TBD |
| TASK-072 | 5 | Backend | ISoilProvider adapter | Soil enrichment | Adapter | TASK-042 | P1 | NOT STARTED | Backend | — | |
| TASK-073 | 5 | Backend | Government rates admin ingest | Rates admin APIs | API | TASK-067 | P1 | NOT STARTED | Backend | — | |
| TASK-080 | 6 | Backend | CompatibilityService | Neighbour/portfolio rules | Service | TASK-026 | P0 | NOT STARTED | Backend | — | |
| TASK-081 | 6 | Backend | EconomicsService | Reference gross value | Service | TASK-073 | P1 | NOT STARTED | Backend | — | |
| TASK-081.1 | 6 | Backend | Economics with seed rates | Early seed rates for demo | Seed | TASK-081 | P0 | NOT STARTED | Backend | — | |
| TASK-082 | 6 | Backend | YieldEstimationService | Yield + confidence | Service | TASK-040 | P0 | NOT STARTED | Backend | — | Algo TBD |
| TASK-083 | 6 | Backend | CropPlanningService | Plan orchestration | Service | TASK-080, TASK-082, TASK-040 | P0 | NOT STARTED | Backend | — | |
| TASK-084 | 6 | Backend | Plan generate + history APIs | POST/GET plans | API | TASK-083, TASK-030, TASK-104 | P0 | NOT STARTED | Backend | — | Needs AI TASK-104 |
| TASK-085 | 6 | Backend | NearbyFarmsService | Aggregates + suggestions API | Service+API | TASK-025 | P1 | NOT STARTED | Backend | — | |
| TASK-086 | 6 | Backend | Seed variety suggestion | Variety ranking | Service | TASK-025, TASK-040 | P1 | NOT STARTED | Backend | — | |
| TASK-091 | 6 | Backend | Alerts list API | Dashboard alerts | API | TASK-040 | P0 | NOT STARTED | Backend | — | |
| TASK-105 | 7 | Backend | Assistant thread/message APIs | Chat endpoints | API | TASK-031, TASK-103, TASK-106 | P1 | NOT STARTED | Backend | — | Needs AI |
| TASK-110 | 8 | Backend | Experimental workflow | Approve + track | API/Commands | TASK-061, TASK-083 | P1 | NOT STARTED | Backend | — | |
| TASK-112 | 8 | Backend | CropCycle actuals + learning | Predicted vs actual | API/EF | TASK-024, TASK-110 | P1 | NOT STARTED | Backend | — | |
| TASK-120 | 9 | Backend | GreenFarmScoringService | Deterministic green score | Service | TASK-040 | P1 | NOT STARTED | Backend | — | Weights TBD |
| TASK-121 | 9 | Backend | Green score APIs | GET/recalculate | API | TASK-120 | P1 | NOT STARTED | Backend | — | |
| TASK-140 | 11 | Backend | BE unit + integration tests | Handler/domain/EF tests | Tests | TASK-060, TASK-080, TASK-040 | P0 | NOT STARTED | Backend | — | |
| TASK-141 | 11 | Backend | API authz tests | Owner + admin isolation | Tests | TASK-034, TASK-067 | P0 | NOT STARTED | Backend | — | |
| TASK-144 | 11 | Backend | Provider failure tests | Timeouts/degrade | Tests | TASK-071, TASK-072, TASK-100 | P0 | NOT STARTED | Backend | — | |
| TASK-150 | 12 | Backend | Observability | Metrics/traces | Telemetry | TASK-004 | P1 | NOT STARTED | Backend | — | |
| TASK-151 | 12 | Backend | Backup/restore runbook | Ops artifact | Runbook | TASK-003 | P1 | NOT STARTED | Backend | — | |
| TASK-152 | 12 | Backend | Admin portal APIs depth | Catalogs, review, flags, audit, metrics | Admin APIs | TASK-067, TASK-025, TASK-026, TASK-022 | P1 | NOT STARTED | Backend | — | |

---

## Foundation checklist

- [ ] TASK-001 Solution  
- [ ] TASK-002 CQRS  
- [ ] TASK-003 EF/SQL  
- [ ] TASK-004 Logging/exceptions  
- [ ] TASK-005 Validation  
- [ ] TASK-006 Farmer auth scaffold  

## Domain entities checklist

- [ ] Farmer, Farm, ProductionArea, ProductionAreaType, CropZone  
- [ ] Crop, SeedVariety, CropCompatibility, FieldNeighbourEdge  
- [ ] WaterSource, SoilProfile, TwinSnapshot, FarmPlan  
- [ ] AssistantThread/Message, AdminUser, AdminAuditLog  
- [ ] CropCycle (with TASK-112)  

## Testing focus

Unit tests for unit conversion, compatibility order (FR-103), economics formula, green score availability rules, owner scoping. Integration tests for OTP, farm create → default open_field → twin GET. Provider failure tests for weather/soil/LLM.

---

*Update status in Master and this file together.*

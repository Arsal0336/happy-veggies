# 04 — Integration Task Plan

| | |
|---|---|
| **Track** | Integration |
| **Sources** | `05-Frontend-Backend-Integration.md`, `02-Frontend-Technical-Design.md`, `03-Backend-Technical-Design.md` |
| **Master** | [00-Master-Implementation-Plan.md](00-Master-Implementation-Plan.md) |
| **Owner role** | `Integration` |

Statuses and Task IDs **must match the Master**. Default status: `NOT STARTED`.

This track owns **contracts and end-to-end wiring verification** between Frontend, Backend, adapters, and AI—not feature implementation itself.

---

## Integration flow

```text
React UI
  ↕
Frontend Service / API client
  ↕
HTTP /api/v1
  ↕
ASP.NET Controller → CQRS
  ↕
Domain / Adapters / SQL / LLM
```

---

## Integration task table

| Task ID | Phase | Area | Task | Description | Deliverable | Dependencies | Priority | Status | Owner | Estimate | Notes |
| ------- | ----- | ---- | ---- | ----------- | ----------- | ------------ | -------- | ------ | ----- | -------- | ----- |
| TASK-010 | 0 | Integration | API conventions + error contract | Status codes + error JSON | Shared contract | — | P0 | NOT STARTED | Integration | — | Doc 05 §2–4 |
| TASK-011 | 0 | Integration | Auth header conventions | Farmer vs admin bearer | Auth notes | TASK-010 | P0 | NOT STARTED | Integration | — | Doc 05 §3 |
| TASK-012 | 0 | Integration | Correlation ID + date/units conventions | Headers; ISO UTC; value+unit | Checklist | TASK-010 | P0 | NOT STARTED | Integration | — | Doc 05 §2 |
| TASK-068 | 4 | Integration | Wire farmer auth FE↔BE | OTP → session → API calls | Working path | TASK-033, TASK-051, TASK-011 | P0 | NOT STARTED | Integration | — | Doc 05 §7 |
| TASK-069 | 4 | Integration | Wire farm/area/zone FE↔BE | CRUD round-trips | Working setup | TASK-060–066 | P0 | NOT STARTED | Integration | — | |
| TASK-074 | 5 | Integration | Verify provider failure paths | Twin without weather/soil | Evidence | TASK-071, TASK-072, TASK-041 | P0 | NOT STARTED | Integration | — | NFR-005 |
| TASK-130 | 10 | Integration | Contract freeze / OpenAPI | Freeze P0/P1 DTOs | OpenAPI artifact | TASK-010, TASK-060, TASK-041, TASK-084 | P0 | NOT STARTED | Integration | — | Toolchain TBD |
| TASK-131 | 10 | Integration | Twin + FarmGraphic E2E | Twin binds graphic | E2E | TASK-041, TASK-055, TASK-069 | P0 | NOT STARTED | Integration | — | Doc 05 §7.4 |
| TASK-132 | 10 | Integration | Plan generate E2E | FE plan generate path | E2E | TASK-084, TASK-087, TASK-104 | P0 | NOT STARTED | Integration | — | |
| TASK-133 | 10 | Integration | Assistant E2E | Farm-scoped chat | E2E | TASK-105, TASK-107 | P1 | NOT STARTED | Integration | — | |
| TASK-134 | 10 | Integration | Green + Experimental E2E | Score + experiment flows | E2E | TASK-121, TASK-122, TASK-110, TASK-111 | P1 | NOT STARTED | Integration | — | |
| TASK-135 | 10 | Integration | Admin catalogs/rates E2E | Admin UI ↔ APIs | E2E | TASK-152, TASK-073, TASK-153 | P1 | NOT STARTED | Integration | — | |
| TASK-136 | 10 | Integration | Remaining feature-matrix wires | Water/soil/suggestions/alerts | Checklist | TASK-069, TASK-074 | P1 | NOT STARTED | Integration | — | Doc 05 §6 |
| TASK-154 | 12 | Integration | Production readiness gate | Checklist sign-off | Record | TASK-130, TASK-140, TASK-141 | P0 | NOT STARTED | Integration | — | SRS §6.3 |

---

## Feature integration matrix (tracking)

Mirror of Doc 05 §6 — mark wired when E2E proven.

| Frontend Feature | API (proposed) | Backend | Integration task | Status |
|------------------|----------------|---------|------------------|--------|
| Auth / OTP | `/auth/otp/*` | Auth | TASK-068 | NOT STARTED |
| Farm Dashboard | `/farms`, `/twin`, alerts | Farm/Twin | TASK-069, TASK-131 | NOT STARTED |
| Farm graphic | `/twin` | Twin | TASK-131 | NOT STARTED |
| Production Areas | `.../production-areas` | Farm | TASK-069 | NOT STARTED |
| Crop Zones | `.../zones` | Farm | TASK-069 | NOT STARTED |
| Digital Twin refresh | `POST .../twin/refresh` | Twin | TASK-136 | NOT STARTED |
| Weather | via twin | Weather adapter | TASK-074 | NOT STARTED |
| Soil | twin + upsert | Soil | TASK-136 | NOT STARTED |
| Water | `.../water-sources` | Water | TASK-136 | NOT STARTED |
| Crop Planning | `POST .../plan` | Planning+AI | TASK-132 | NOT STARTED |
| Yield / Economics | plan + `/economics` | Economics | TASK-132 / TASK-136 | NOT STARTED |
| Nearby farms | `/suggestions` | Nearby | TASK-136 | NOT STARTED |
| Experimental | experimental APIs | Experimental | TASK-134 | NOT STARTED |
| Green Farm | `/green-score` | Green | TASK-134 | NOT STARTED |
| AI Assistant | `/assistant/threads*` | AI | TASK-133 | NOT STARTED |
| Admin login | `/admin/auth/login` | AdminAuth | TASK-135 | NOT STARTED |
| Admin catalogs/rates | `/admin/*` | Admin | TASK-135 | NOT STARTED |

Where DTO field-level shapes remain open: note **`TBD — API contract required`** on the freeze task (TASK-130) until resolved—do not invent fields.

---

## External integrations verification

| Adapter | Implementer | Integration verify |
|---------|-------------|--------------------|
| OTP mock/live | Backend TASK-070 | TASK-068 (+ live flag check) |
| Weather | Backend TASK-071 | TASK-074 |
| Soil | Backend TASK-072 | TASK-074 |
| LLM | AI TASK-100 | TASK-132, TASK-133 |
| Government rates | Backend TASK-073 | TASK-135 |

---

## Cross-team dependency examples

```text
TASK-010 Error contract
    ↓
TASK-051 FE client + TASK-004 BE middleware
    ↓
TASK-068 Auth E2E

TASK-041 Twin API
    ↓
TASK-055 FarmGraphic
    ↓
TASK-131 Twin graphic E2E

TASK-104 Plan LLM + TASK-084 Plan API
    ↓
TASK-087 Plan UI
    ↓
TASK-132 Plan E2E

TASK-103 Context + TASK-105 APIs + TASK-107 UI
    ↓
TASK-133 Assistant E2E
```

---

## Integration Definition of Done extras

- Request/response match frozen contract (or explicitly TBD-listed)  
- Error envelope handled on FE  
- Auth tokens correct audience (farmer vs admin)  
- Provenance/disclaimer fields rendered where required  
- Failure path demonstrated for external providers  

---

*Update status in Master and this file together.*

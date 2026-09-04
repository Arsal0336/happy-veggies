# 02 — Frontend Task Plan

| | |
|---|---|
| **Track** | Frontend |
| **Sources** | `02-Frontend-Technical-Design.md`, `05-Frontend-Backend-Integration.md`, `01-Core-Technical-Logic.md` |
| **Master** | [00-Master-Implementation-Plan.md](00-Master-Implementation-Plan.md) |
| **SRS gap plan** | [06-Missing-Modules-Features-Implementation-Plan.md](06-Missing-Modules-Features-Implementation-Plan.md) |
| **Owner role** | `Frontend` |

Statuses and Task IDs **must match the Master**. Default status: `NOT STARTED`.

---

## Dependencies on other tracks

| Need from others | Tasks |
|------------------|-------|
| Error/auth conventions | TASK-010, TASK-011 |
| Auth/farm/twin/plan/assistant APIs | Backend TASK-033, 060–062, 041, 084, 105, 121… |
| Integration E2E ownership | Integration owns TASK-068/069/131–135; FE implements UI side |

---

## Frontend task table

| Task ID | Phase | Area | Task | Description | Deliverable | Dependencies | Priority | Status | Owner | Estimate | Notes |
| ------- | ----- | ---- | ---- | ----------- | ----------- | ------------ | -------- | ------ | ----- | -------- | ----- |
| TASK-007 | 0 | Frontend | Farmer-web scaffold | React feature folders; FC only | App | — | P0 | DONE | Frontend | — | Doc 02 §1 |
| TASK-008 | 0 | Frontend | Admin-web scaffold | Separate admin SPA | App | — | P0 | DONE | Frontend | — | |
| TASK-009 | 0 | Frontend | Shared UI tokens package | Tokens/primitives package | Package | TASK-007 | P0 | DONE | Frontend | — | |
| TASK-050 | 3 | Frontend | Farmer routing + auth gate | Routes + OTP gate | Router | TASK-007 | P0 | DONE | Frontend | — | Doc 02 §1.4 |
| TASK-051 | 3 | Frontend | API client + server state | Typed client + cache | Client | TASK-007, TASK-010 | P0 | DONE | Frontend | — | F-1 TBD |
| TASK-052 | 3 | Frontend | Error/loading/notifications | Envelope mapping; toasts | UX utils | TASK-051, TASK-010 | P0 | DONE | Frontend | — | |
| TASK-053 | 3 | Frontend | Design system primitives | Buttons/forms/cards/modals/table | Components | TASK-009 | P0 | DONE | Frontend | — | Doc 02 §3.1 |
| TASK-054 | 3 | Frontend | i18n + RTL | en/ur; document.dir | i18n | TASK-007 | P0 | DONE | Frontend | — | |
| TASK-055 | 3 | Frontend | FarmGraphic shell | Schematic farm canvas | Component | TASK-053 | P0 | DONE | Frontend | — | Doc 02 §4 |
| TASK-056 | 3 | Frontend | Admin shell + login UI | Admin chrome + login | Screens | TASK-008, TASK-053 | P0 | DONE | Frontend | — | |
| TASK-057 | 3 | Frontend | Domain badges | Provenance/type/compatibility | Components | TASK-053 | P0 | DONE | Frontend | — | |
| TASK-064 | 4 | Frontend | Farm create/edit flows | Location/region/area wizard | Screens | TASK-050, TASK-051, TASK-054 | P0 | DONE | Frontend | — | Map F-3 TBD |
| TASK-065 | 4 | Frontend | Production area management UI | All area types | Screens | TASK-064, TASK-057 | P0 | DONE | Frontend | — | |
| TASK-066 | 4 | Frontend | Crop zone management UI | Crops + neighbour warnings | Screens | TASK-065 | P0 | DONE | Frontend | — | |
| TASK-087 | 6 | Frontend | Plan view UI | Sections; regenerate banner | Screens | TASK-053, TASK-054 | P0 | DONE | Frontend | — | |
| TASK-088 | 6 | Frontend | Compatibility UI | Badges + graphic edges | UI | TASK-055, TASK-057 | P0 | DONE | Frontend | — | |
| TASK-089 | 6 | Frontend | Economics display | Historical reference labels | UI | TASK-057 | P1 | DONE | Frontend | — | |
| TASK-090 | 6 | Frontend | Nearby suggestions UI | Community vs AI-only | UI | TASK-053 | P1 | DONE | Frontend | — | |
| TASK-092 | 6 | Frontend | Dashboard + alerts | Twin chips + alerts + graphic | Screens | TASK-055, TASK-064 | P0 | DONE | Frontend | — | |
| TASK-107 | 7 | Frontend | AssistantChat UI | Chat + citations + disclaimer | Feature | TASK-053, TASK-054 | P1 | DONE | Frontend | — | Streaming F-4 TBD |
| TASK-111 | 8 | Frontend | Experimental farming UI | Experiment track UI | Screens | TASK-065 | P1 | DONE | Frontend | — | |
| TASK-122 | 9 | Frontend | Green Farm UI | Score + factors + disclaimer | Screens | TASK-057 | P1 | DONE | Frontend | — | Not certification |
| TASK-142 | 11 | Frontend | Component + flow tests | Critical journeys | Tests | TASK-064, TASK-087 | P0 | DONE | Frontend | — | |
| TASK-143 | 11 | Frontend | RTL / i18n / responsive tests | ur + mobile | Tests | TASK-054 | P0 | DONE | Frontend | — | |
| TASK-153 | 12 | Frontend | Admin portal UI depth | Catalogs, review, analytics, audit | Admin screens | TASK-056, TASK-152 | P1 | DONE | Frontend | — | Needs BE TASK-152 |

---

## Design system checklist

- [x] Tokens (typography, spacing, colors, area-type colors)  
- [x] Primitives: Button, Input, Select, FormField, Card, Table, Modal, Tabs, Badge, Alert, Skeleton  
- [x] Domain: ProvenanceBadge, ProductionAreaTypeIcon, AreaUnitInput, TwinSummaryPanel, FarmGraphic, FarmGraphicLegend, PlanSectionList, CompatibilityBadge, GreenScoreMeter, AssistantChat, AlertList, MapOrCoords  
- [x] Admin: AdminShell, FarmersTable, CatalogEditor, CompatibilityMatrixEditor, RatesUploadPanel, PlanReviewPane, MetricsCharts, AuditLogTable, AdminFarmGraphic  

## Farmer journeys → tasks

| Journey | Tasks |
|---------|-------|
| Create farm | TASK-064 (+ TASK-068 integration) |
| Configure areas | TASK-065 |
| Add crops | TASK-066 |
| View twin + graphic | TASK-055, TASK-092, TASK-131 |
| Generate plan | TASK-087, TASK-132 |
| Assistant | TASK-107, TASK-133 |
| Green / Experimental | TASK-122, TASK-111 |

## Frontend testing focus

Component tests for FarmGraphic empty/populated states; flow tests for OTP → create farm → add zone; RTL snapshot/layout checks; mobile viewport for dashboard.

---

*Update status in Master and this file together.*

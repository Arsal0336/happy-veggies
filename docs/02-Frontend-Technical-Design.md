# 02 — Frontend Technical Design

| | |
|---|---|
| **Source of truth** | HAPPY-VEGGIE-SRS.md v1.3 |
| **Audience** | React engineers |
| **Purpose** | App structure, API usage patterns, design system, UX journeys |
| **Stack [SRS]** | React **functional components only** (hooks); mobile-first; Urdu RTL + English LTR |

**Legend:** **[SRS]** · **[TECH]** · **[TBD]**

---

## 1. Application architecture **[TECH]**

### 1.1 Apps (two React applications)

| App | Role | Hosting |
|-----|------|---------|
| **Farmer app** | Auth (OTP), farms, twin, **farm graphic**, plans, assistant, green score | Web + mobile-first; optional RN later |
| **Admin portal** | Web-only privileged console (FR-038+): farmers, catalogs, rates, AI review, analytics, flags | Separate SPA; **not** in farmer shell |

Shared packages (recommended): `@hv/api-types`, `@hv/ui` (design tokens/primitives), `@hv/i18n` where safe. Admin UI language: English first **[TBD]** whether Urdu required for admins (SRS mandates farmer Urdu/English).

```text
apps/
  farmer-web/          # farmer React SPA
  admin-web/           # admin React SPA (web-only)
packages/
  api-types/
  ui/
  i18n/
```

### 1.2 Feature folder layout (farmer)

```text
src/
  app/                 # router, providers, auth gate
  features/
    auth/
    farms/
    productionAreas/
    cropZones/
    farmGraphic/       # schematic farm visualization
    digitalTwin/
    planning/
    weather/
    soil/
    water/
    economics/
    nearbyFarms/
    experimental/
    greenFarm/
    assistant/
    alerts/
    history/
  shared/
    api/
    ui/
    i18n/
    hooks/
    types/
```

### 1.3 Feature folder layout (admin portal)

```text
src/
  app/                 # admin auth gate, layout shell
  features/
    auth/              # admin login (not farmer OTP)
    dashboard/         # metrics overview
    farmers/           # search/view farmers, farms, plans (audited)
    crops/             # crop catalog CRUD
    seedVarieties/
    compatibility/     # companion-planting table editor
    productionAreaTypes/
    governmentRates/   # ingest/edit reference rates
    planReview/        # sampled/flagged AI plans & assistant outputs
    analytics/         # usage + LLM cost
    featureFlags/      # OTP mode, weather/soil enrichment flags
    auditLog/          # read audit trail
  shared/
    api/               # admin base URL + admin bearer
    ui/
    types/
```

### 1.4 Routing — farmer (illustrative)

| Route | Screen |
|-------|--------|
| `/lang` | Language first |
| `/auth/phone`, `/auth/otp`, `/auth/profile` | OTP flow |
| `/` | Dashboard (farms list) |
| `/farms/:farmId` | Farm home: twin summary + **FarmGraphic** |
| `/farms/:farmId/graphic` | Full-screen farm graphic (optional) |
| `/farms/:farmId/areas` | Production areas |
| `/farms/:farmId/areas/:areaId/zones` | Crop zones |
| `/farms/:farmId/plan` | Plan view |
| `/farms/:farmId/assistant` | AI Farm Assistant |
| `/farms/:farmId/green` | Green Farm |
| `/farms/:farmId/experimental` | Experimental |
| `/settings` | Language, profile |

### 1.5 Routing — admin portal (illustrative)

| Route | Screen |
|-------|--------|
| `/login` | Admin auth (email/password + MFA or SSO — **[TBD]** method) |
| `/` | Admin dashboard (signups, plans, cost) |
| `/farmers` | Farmer search table |
| `/farmers/:id` | Farmer detail → farms / plans (read; audited) |
| `/farmers/:id/farms/:farmId` | Read-only twin + farm graphic |
| `/catalog/crops` | Crop catalog |
| `/catalog/seed-varieties` | Seed varieties |
| `/catalog/compatibility` | Compatibility pairs |
| `/catalog/production-area-types` | Extensible area types |
| `/rates` | Government reference rates |
| `/reviews/plans` | Flagged/sampled AI plans |
| `/analytics` | Usage & LLM cost |
| `/flags` | Feature flags |
| `/audit` | Audit log |

### 1.6 State management **[TECH]**

| Concern | Approach |
|---------|----------|
| Server state | **[TBD]** React Query / RTK Query / similar |
| Farmer auth | OTP session token + context |
| Admin auth | Separate token/store; never reuse farmer OTP session |
| UI ephemeral | Local / wizard state |
| Farmer language | Persist + `dir=rtl\|ltr` |

Do **not** duplicate business rules on the client.

### 1.7 Layers

```text
UI (functional components)
  ↓
Feature hooks / services
  ↓
API client (farmer vs admin base + auth)
  ↓
ASP.NET Core endpoints (see 03 / 05)
```

### 1.8 Cross-cutting UX behaviors **[SRS + TECH]**

| Concern | Behavior |
|---------|----------|
| Loading | Per-screen/action; plan gen full-screen reassurance |
| Errors | Inline + toast; retry for LLM/provider failures |
| Empty | Guide to create farm / area / zone / plan |
| Notifications | Farmer alerts + toasts; admin toasts for save/audit |
| Farmer 401 | Re-auth OTP |
| Admin 401/403 | Re-login; never fall through to farmer app |

---

## 2. API call pattern

```text
UI → Feature hook/service → apiClient → Backend → DTO → State/UI
```

### 2.1 Farmer feature → API map

| Feature | Typical calls | Notes |
|---------|---------------|-------|
| Authentication | `POST /auth/otp/request`, `verify`, `profile` | Mock OTP flag |
| Farm management | `GET/POST/PATCH /farms` | Soft-delete **[TBD]** |
| Production areas | `.../production-areas` | |
| Crop zones | `.../zones` | Neighbours optional |
| **Farm graphic** | `GET /farms/{id}/twin` (+ optional layout) | Schematic from twin |
| Digital Twin | `GET/POST .../twin` | |
| Weather / Soil / Water | Twin + upserts | Provenance badges |
| Farm planning | `POST .../plan`, history | Structured sections |
| Yield / economics | Plan + `.../economics` | Reference labels |
| Nearby farms | `GET /suggestions` | Aggregates only |
| Experimental / Green / Assistant | See `03` | P1 gated |

### 2.2 Admin feature → API map

| Feature | Typical calls | Auth |
|---------|---------------|------|
| Admin login | `POST /admin/auth/login` (shape **[TBD]**) | Anonymous → admin token |
| Metrics | `GET /admin/metrics` | Admin |
| Farmers | `GET /admin/farmers`, `GET /admin/farmers/{id}` | Admin + audit |
| Farm inspect | `GET /admin/farms/{farmId}/twin` | Admin + audit |
| Crops / varieties / types | `CRUD /admin/crops`, `seed-varieties`, `production-area-types` | Admin |
| Compatibility | `GET/PUT /admin/compatibility` | Admin |
| Rates | `GET/POST/PATCH /admin/government-rates` | Admin |
| Plan review | `GET /admin/plans?flagged=true`, review actions | Admin |
| Analytics / flags / audit | `GET /admin/analytics`, `flags`, `audit-logs` | Admin |

---

## 3. Design system approach **[TECH]**

Tokens (CSS variables) — concrete palette **[TBD]**.

| Token group | Use |
|-------------|-----|
| Typography | UI font + Urdu-capable for farmer `ur` |
| Spacing | 4/8 scale |
| Layout | Farmer mobile-first; Admin desktop-first responsive |
| Color | Semantic + **area-type colors** (open/protected/experimental) |
| Elevation | Light; tables heavy in admin |

### 3.1 Primitives

Buttons, inputs, selects, FormField, Card, **Table** (admin-critical), Modal/Drawer, Tabs, Badge, Alert, Skeleton, Pagination.

### 3.2 Domain components (farmer)

| Component | Purpose |
|-----------|---------|
| `ProvenanceBadge` | Provenance enum |
| `ProductionAreaTypeIcon` | open / shed / greenhouse / tunnel / experimental |
| `AreaUnitInput` | value + unit |
| `TwinSummaryPanel` | Aggregates |
| **`FarmGraphic`** | Schematic farm visualization (see §4) |
| **`FarmGraphicLegend`** | Unit scales, area types, neighbour edge colors |
| `PlanSectionList` | Plan sections |
| `CompatibilityBadge` | good / avoid / neutral |
| `GreenScoreMeter` | Score + non-certification disclaimer |
| `AssistantChat` | Chat + citations |
| `AlertList` | Dashboard alerts |
| `MapOrCoords` | GPS / manual pin **[TBD]** map lib |

### 3.3 Admin components

| Component | Purpose |
|-----------|---------|
| `AdminShell` | Nav + role gate |
| `FarmersTable` | Search/filter farmers |
| `CatalogEditor` | Crops / varieties / area types |
| `CompatibilityMatrixEditor` | Pair relation + reason |
| `RatesUploadPanel` | CSV/API ingest **[TBD]** format |
| `PlanReviewPane` | Flagged plan JSON sections + actions |
| `MetricsCharts` | Usage / LLM cost |
| `AuditLogTable` | Who/what/when |
| `AdminFarmGraphic` | Read-only `FarmGraphic` for inspect |

---

## 4. Graphical representation of a farm **[TECH]**

### 4.1 Purpose

Give farmers (and admins inspecting a farm) a **visual Digital Twin** of production areas and crop zones — supporting FR-054 / FR-120 — without requiring survey-grade GIS.

### 4.2 Visual model

```text
┌──────────────────── FarmGraphic ────────────────────┐
│ Header: farm name · region · weather · green chip   │
│ ┌─ Map strip (optional) ─┐  lat/lng pin only        │
│ └────────────────────────┘                          │
│ ┌──────── Schematic canvas ───────────────────────┐ │
│ │ [Open Field block]     [Protected block]        │ │
│ │   zone tiles...          shed/gh/tunnel tiles   │ │
│ │ [Experimental block]                            │ │
│ └─────────────────────────────────────────────────┘ │
│ Legend · tap zone → drawer (crop, stage, actions)   │
└─────────────────────────────────────────────────────┘
```

### 4.3 Interaction

| Action | Behavior |
|--------|----------|
| Tap ProductionArea | Highlight; show area attrs (type, units, env) |
| Tap CropZone | Drawer: crop, variety, stage, yield, irrigate CTA, assistant deep-link |
| Neighbour mode | Draw edges; color by compatibility |
| Empty farm | CTA “Add production area” |
| RTL | Canvas chrome mirrors; labels use i18n |

### 4.4 Data binding

```text
GET /farms/{id}/twin
  → areas[], zones[], weather, water, greenSummary, neighbourEdges?
  → FarmGraphic props
```

Optional layout fields (`layoutX`… ) **[TBD]** — if absent, auto-pack by type and relative area.

### 4.5 Non-goals

- Not a legal land survey or title map  
- Not IoT sensor floorplans  
- Not inventing parcels not in twin data  

---

## 5. Major UX journeys

### 5.1 Farmer

1. **Create farm** — Language → OTP → profile → location → area → default Open Field → dashboard  
2. **Configure production areas** — Add open/shed/greenhouse/tunnel/experimental  
3. **Add crops / zones** — Per area; neighbour warnings  
4. **View Digital Twin + graphic** — Summary metrics + `FarmGraphic`  
5. **Generate plan** — Loading → sections → save version; language switch offers regenerate  
6. **Recommendations / alerts / history**  
7. **Experimental / Green Score / Assistant** (P1)

### 5.2 Admin portal **[SRS FR-038–042, 083, 097]**

1. **Admin login** — Stronger than OTP → land on metrics dashboard  
2. **Manage farmers** — Search → open farmer → view farms/plans (audit logged) → optional read-only farm graphic  
3. **Curate catalogs** — Crops, seed varieties, production area types, compatibility table  
4. **Government rates** — Upload/edit historical reference rates with period labels  
5. **AI quality** — Review flagged/sampled plans & assistant outputs  
6. **Analytics** — Signups, plans generated, LLM cost/volume  
7. **Feature flags** — `OTP_MODE`, weather/soil enrichment  
8. **Audit** — Browse privileged actions  

Destructive admin actions: confirm + prefer soft-disable.

---

## 6. i18n & RTL **[SRS]**

- Farmer: full `en` / `ur` + RTL.  
- Admin: English default; Urdu **[TBD]**.  
- `FarmGraphic` labels follow active locale.

---

## 7. Open decisions (frontend)

| ID | Topic |
|----|--------|
| F-1 | State library |
| F-2 | CSS approach (tokens required) |
| F-3 | Map provider for pin/manual location |
| F-4 | Streaming assistant UI |
| F-5 | PWA vs React Native |
| F-6 | FarmGraphic auto-layout algorithm vs stored coordinates |
| F-7 | Admin MFA vs SSO provider |
| F-8 | Monorepo vs separate admin repo |

---

*Endpoints: `03`. Contracts: `05`. AI constraints: `04`. Twin graphic semantics: `01` §1.4.*

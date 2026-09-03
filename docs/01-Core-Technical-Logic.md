# 01 — Core Technical Logic

| | |
|---|---|
| **Source of truth** | HAPPY-VEGGIE-SRS.md v1.3 |
| **Audience** | Backend / AI / product engineers |
| **Purpose** | How the Farm Digital Twin and core business logic work |
| **Stack context** | ASP.NET Core + CQRS + EF Core + SQL Server (implementation in `03`) |

**Legend:** **[SRS]** requirement · **[TECH]** implementation decision · **[TBD]** open

---

## 1. Farm Digital Twin model

### 1.1 Hierarchy **[SRS]**

```text
Farmer
  └── Farm
       ├── ProductionArea (typed)
       │    └── CropZone (Field)
       │         └── CropCycle (optional / seasonal)
       ├── WaterSource / Irrigation
       ├── SoilProfile
       ├── Weather (via twin refresh)
       ├── FarmPlan / Recommendations
       ├── FarmSustainability / GreenFarmScore
       ├── FarmEconomicSnapshot
       └── FarmAssistant (per farm)
```

### 1.2 Representation rules **[SRS]**

| Rule | Behavior |
|------|----------|
| Multi-area | One farm → many `ProductionArea` |
| Types | `open_field`, `shed`, `greenhouse`, `tunnel_polyhouse`, `experimental`, `other_protected` (+ extensible catalog) |
| Multi-crop | Many crops simultaneously across areas/zones |
| Default path | If type omitted, zones attach to default **Open Field** area (FR-111) |
| Twin scope | Per-area state is independent; farm twin **aggregates** all areas (FR-115) |
| Units | Land: acre/kanal/marla (+ ha if entered); covered: sq ft / sq m — store as-entered + canonical (C-008) |
| Soft-delete | Farms, areas, zones, plans (C-009) |

### 1.3 Aggregation **[TECH]**

Farm-level twin summary is a **read model** assembled from:

- Sum/list of production areas (by type and unit group)
- All active crop zones + crops
- Latest weather snapshot for farm lat/long
- Soil profile (farm-level and/or area-level where stored)
- Water sources + irrigation links
- Latest plan version, economic snapshot, green score (when present)
- Alerts / activity highlights

**[TBD]** Exact display rules when mixing acres and sq ft on one dashboard total (SRS Appendix G).

### 1.4 Graphical farm representation (logical view) **[TECH]**

The Digital Twin is also shown as a **schematic farm graphic** (not a cadastral/GIS survey unless added later). Purpose: help farmers see the whole farm ecosystem at a glance (aligns with twin summary + production-area breakdown FR-054 / FR-120).

```text
                    FARM (20 acres) — map pin optional
 ┌──────────────────────────────────────────────────────────┐
 │  OPEN FIELD                         PROTECTED            │
 │  ┌────────────┬──────────┬────────┐ ┌─────────────────┐  │
 │  │ Field A    │ Field B  │Field C │ │ Shed 1  Cucumber│  │
 │  │ Tomato 8ac │Potato 5ac│Onion 4 │ │ 2,000 sq ft     │  │
 │  └────────────┴──────────┴────────┘ │ Shed 2  Capsicum│  │
 │                                     │ 1,000 sq ft     │  │
 │  EXPERIMENTAL                       └─────────────────┘  │
 │  ┌──────────────────────┐                                │
 │  │ Zone 1 — Exp. 1 acre │   Water ●  Weather ●  Green ●  │
 │  └──────────────────────┘                                │
 └──────────────────────────────────────────────────────────┘
         dashed lines = neighbour compatibility edges
```

| Layer | What it shows |
|-------|----------------|
| Farm frame | Total land context + optional geo pin (lat/lng) |
| ProductionArea blocks | Sized by relative area within unit group (land vs covered) |
| CropZone cells | Crop name, stage badge, experimental flag |
| Overlays | Water status, weather risk, Green Score chip, alerts |
| Edges | Optional neighbour links (compatibility good/avoid) |

**Rules**

- Graphic is driven by twin/area/zone data — no invented parcels.
- Open-field land blocks and protected covered blocks may use **separate visual scales** (acres vs sq ft) with clear legends.
- Survey-accurate plot mapping / GPS polygon drawing is **out of default scope** (future); optional `layoutX/layoutY/layoutW/layoutH` on areas/zones is **[TBD]** for drag-layout.
- Admin may view the same schematic read-only when inspecting a farmer’s farm (privileged, audited).

---

## 2. Core intelligence flow

```text
Farm Data + Weather + Soil + Water + Crop Data
+ Historical + Economic + Nearby Farm Signals (anonymized)
        ↓
   Digital Twin (structured state + provenance)
        ↓
 Decision / Optimization Engine
   (deterministic tables + scored candidates)
        ↓
 Recommendation / FarmPlan sections
        ↓
 AI Explanation (LLM — language & narrative only where allowed)
        ↓
 Farmer Action
        ↓
 Actual Result (CropCycle / season outcome)
        ↓
 Farm Learning (predicted vs actual → future context)
```

**Hard rule [SRS + TECH]:** Deterministic calculations (areas, rates, compatibility table, green score math, privacy filters) are **never** owned by the LLM. LLM consumes twin snapshots and explains/recommends in natural language within bounds (see `04-AI-Technical-Design.md`).

---

## 3. Core business logic catalog

Format for each: **Inputs → Processing → Output → Rules**

### 3.1 Crop suitability

| | |
|---|---|
| **Inputs** | Region, season (from date + lat), soil (+ provenance), water, production area type, preferred crop / let-AI-choose, catalog metadata |
| **Processing** | Filter catalog by season/region/environment; score suitability; apply unknown-soil / no-water forgiveness (FR-021) |
| **Output** | Ranked crops with rationale keys + suitability band |
| **Rules** | Do not block on unknown soil; protected vs open suitability must differ (C-015); provenance labeled |

### 3.2 Production-area suitability

| | |
|---|---|
| **Inputs** | Area type, covered/land area, optional env attrs (temp/humidity/ventilation/medium), crop candidate |
| **Processing** | Match crop to environment class (open vs protected); skip missing attrs (do not invent) |
| **Output** | Fit / poor-fit / unknown + reasons |
| **Rules** | Missing protected attrs → degrade gracefully (A7) |

### 3.3 Multi-crop / multi-environment planning

| | |
|---|---|
| **Inputs** | Available areas, budgets, water capacity, twin context, compatibility, rates, risk, sustainability signals |
| **Processing** | Allocate candidates per area under FR-057 factors; objective FR-058 |
| **Output** | Portfolio allocation (by area + crop + area unit) |
| **Rules** | Not yield-only; sustainability cannot alone override suitability/season/env/risk (FR-117) |

### 3.4 Crop compatibility (neighbours)

| | |
|---|---|
| **Inputs** | Crop pairs, neighbour edges, portfolio set, optional anonymized nearby aggregates |
| **Processing** | Lookup `crop_compatibility` table; order: on-farm neighbours → portfolio → nearby signals (FR-103) |
| **Output** | good / avoid / neutral + localized reason |
| **Rules** | Unknown pair → neutral; show table results even if LLM care fails (FR-032); never expose other farmers’ PII (FR-035) |

### 3.5 Water constraints & irrigation recommendations

| | |
|---|---|
| **Inputs** | WaterSource capacity/reliability, crops’ water demand, weather (rain), growth stage, production environment |
| **Processing** | Compare demand vs availability; for outdoor, weigh forecast rain; for protected, use area moisture/irrigation attrs if present |
| **Output** | Irrigate / delay / monitor + which zone/area |
| **Rules** | Prefer lower-water crops when capacity insufficient (FR-077); resolve correct area for questions (FR-118) |

### 3.6 Soil considerations

| | |
|---|---|
| **Inputs** | Farmer soil, third-party estimate, soil tests |
| **Processing** | Prefer farmer/measured over third-party when present (FR-073); weight suitability |
| **Output** | Soil context for twin + plans |
| **Rules** | Always label provenance; never show estimate as measurement |

### 3.7 Weather impact

| | |
|---|---|
| **Inputs** | Current/forecast weather fields (FR-068) |
| **Processing** | Enrich twin; trigger alert/recommendation cascades (delay irrigation, disease risk, etc.) |
| **Output** | Updated twin `context_used.weather`, alerts |
| **Rules** | Provider failure → proceed without enrichment (NFR-005); configurable provider |

### 3.8 Yield prediction

| | |
|---|---|
| **Inputs** | Crop/variety, area size, environment, soil/water/weather context, history if any |
| **Processing** | **[TECH]** Model/LLM-assisted estimate stored as structured yield with confidence — exact model **[TBD]** |
| **Output** | Estimate + confidence + assumptions (FR-011) |
| **Rules** | Advisory disclaimer; not a guarantee |

### 3.9 Government reference rate & economic value

| | |
|---|---|
| **Inputs** | Expected yield, `government_crop_rate` for crop + period |
| **Processing** | `ReferenceGrossValue = ExpectedYield × GovernmentReferenceRate` (SRS §4.4) |
| **Output** | `FarmEconomicSnapshot` / plan economics table |
| **Rules** | Label as **historical reference**, not future price (FR-080); include risk band when available |

### 3.10 Risk evaluation

| | |
|---|---|
| **Inputs** | Crop risk metadata, weather extremes, water reliability, experimental flag, diversification |
| **Processing** | Band risk low/medium/high from rules + optional AI narrative |
| **Output** | Risk band on recommendations / economics table |
| **Rules** | High risk experimental → small area default (FR-087) |

### 3.11 Experimental crop recommendation

| | |
|---|---|
| **Inputs** | Twin, catalog, risk, small-area policy |
| **Processing** | Identify candidate → compare conditions → estimate yield/profit/risk → propose small experimental area |
| **Output** | Experimental recommendation + tracking hooks |
| **Rules** | Farmer approval required before commit; feed learning after actuals (FR-088) |

### 3.12 Similar / nearby farm comparison

| | |
|---|---|
| **Inputs** | `region_crop_stats` / geo cohort aggregates |
| **Processing** | Blend AI ranking with aggregates when N ≥ threshold |
| **Output** | Suggestions labeled community vs AI-only (FR-034) |
| **Rules** | Aggregates only; never individual farms (FR-035); threshold **[TBD]** (SRS Appendix G) |

### 3.13 Green Farm Score

| | |
|---|---|
| **Inputs** | Available dimensions only (water efficiency, soil practices, diversity, input efficiency, resource usage, rotation, …) |
| **Processing** | Score available dimensions; mark others unavailable; aggregate explainable overall (FR-129) |
| **Output** | `GreenFarmScore` + factor breakdown + improvement areas |
| **Rules** | No fabrication (NFR-022); **not** certification (C-014, FR-132); weights **[TBD]** |

### 3.14 Sustainability recommendations

| | |
|---|---|
| **Inputs** | Green score factors, twin water/crop allocation |
| **Processing** | Rule + AI tips when data sufficient; label source type (FR-131) |
| **Output** | Actionable green tips |
| **Rules** | Obey FR-117 / FR-133 (no green-only overrides) |

### 3.15 Farm learning

| | |
|---|---|
| **Inputs** | Predicted metrics vs actual yield/cost/outcome on CropCycle / season outcome |
| **Processing** | Store delta + optional reason; attach to twin history for future plans |
| **Output** | Learning record influencing future context |
| **Rules** | Owner-scoped; improves that farm’s future recommendations (FR-091) |

### 3.16 Seed variety suggestion

| | |
|---|---|
| **Inputs** | Crop, region, season, soil, water, production environment |
| **Processing** | Rank `seed_variety` catalog |
| **Output** | Varieties with rationale, maturity, risk (FR-105) |
| **Rules** | Farmer may accept/skip; environment-aware |

---

## 4. Provenance (cross-cutting) **[SRS]**

Every soil, weather, water, protected-env, rate, and sustainability input shown must carry:

`farmer_provided` | `third_party_estimate` | `observed_measured` | `system_derived` | `historical_reference`

---

## 5. Open decisions (logic only)

| ID | Topic |
|----|--------|
| L-1 | Mixed-unit farm total display (acres + sq ft) |
| L-2 | Yield estimation algorithm vs LLM-structured estimate |
| L-3 | Green Farm Score dimension weights |
| L-4 | Nearby-farm minimum cohort size N |
| L-5 | Exact season derivation calendar for Pakistan regions |
| L-6 | Optional area/zone layout coordinates for graphic editor |

---

*Logic only — APIs in `03`, UI in `02`, AI boundaries in `04`, contracts in `05`.*

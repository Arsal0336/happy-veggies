# HAPPY VEGGIE — Software Requirements Specification (SRS)

| | |
|---|---|
| **Document** | Software Requirements Specification (IEEE-flavored) |
| **Product** | HAPPY VEGGIE — AI Farm Digital Twin (Intelligent Farm Twinning Platform) |
| **Audience** | Development team, QA, architecture, product, security, operations |
| **Status** | **Production-Ready v1.3** |
| **Date** | 3 September 2026 |
| **Companion docs** | HAPPY-VEGGIE-PRD.md (product context), HAPPY-VEGGIE-DEV-SPEC.md (detailed design) |
| **Authority** | This SRS is the authoritative statement of *what* the system shall do in production. Where conflict exists with the PRD or Dev Spec, this SRS prevails for scope and priority; the Dev Spec prevails for screen/API implementation detail once aligned. |

---

## Revision history

| Version | Date | Author | Summary |
|---------|------|--------|---------|
| 0.1 | 2026-08-06 | BA + Tech Writer session | Initial SRS consolidating PRD and Dev Spec |
| **1.0** | **2026-09-03** | Product + Engineering | Production-ready rewrite: Farm Digital Twin, multi-field farms, Farm Twinning Engine, AI Farm Assistant, weather/soil/water intelligence, economics, nearby farms, experimental zones, learning loop, continuous intelligence |
| **1.1** | **2026-09-03** | Product + Engineering | Seed variety suggestions; crop compatibility with neighbouring fields and neighbouring/nearby farms (anonymized) |
| **1.2** | **2026-09-03** | Product + Engineering | Mandated tech stack: ASP.NET Core API, EF Core, CQRS, SQL Server, React functional components; required engineering skills |
| **1.3** | **2026-09-03** | Product + Engineering | Production Areas (open field + protected farming); environment-aware AI; Green Farm Intelligence & Score; multi-environment optimization |

---

## Table of contents

1. Introduction  
2. Overall description  
   - 2.7 Technology stack (normative)  
   - 2.8 Required engineering skills  
3. Specific requirements  
   - 3.2.2 Farm Management & Production Areas  
   - 3.2.3 Digital Farm Twin  
   - 3.2.4–3.2.17 (existing modules)  
   - 3.2.18 Protected / In-House Farming  
   - 3.2.19 Green Farm Intelligence  
   - 3.4 Acceptance criteria (selected)  
4. Data requirements  
5. Traceability matrix  
6. Production readiness & delivery phases  
7. Appendices  

---

## 1. Introduction

### 1.1 Purpose

This Software Requirements Specification defines the functional and non-functional requirements for **HAPPY VEGGIE — AI Farm Digital Twin**, an AI-powered Farm Twinning platform that creates a **living digital replica** of a farmer’s entire farm, understands what is happening across different parts of the land, and continuously recommends the best farming decisions for higher yield, better profitability, and sustainable resource usage.

It is intended for development, QA, architecture, security, and stakeholders as the authoritative, testable statement of what the production system shall do.

### 1.2 Scope

#### 1.2.1 Product positioning

The product shall **not** be positioned as a generic agricultural chatbot. The chatbot is only the interface. The core product is:

> **The Farm Digital Twin + Farm Intelligence Engine.**

**Final positioning**

> AI Farm Digital Twin is a living digital replica of your farm that combines weather, soil, water, crops, regional intelligence, historical government rates, and farm performance to simulate farming decisions, predict yield and risk, and give farmers a personalized AI assistant that continuously tells them what to do next.

**Short pitch**

> “Digitalize your farm. Simulate your decisions. Predict your yield. Optimize every acre.”

**Core question the system continuously answers**

> “Given the current state of this farm, what should the farmer do next to maximize yield and profitability?”

#### 1.2.2 In scope

A single farm may represent a **large land property with one or more Production Areas**, each containing crop zones. Production areas include **Open Field**, **Shed / Protected Farming**, **Greenhouse**, **Tunnel / Polyhouse**, **Experimental Area**, and other extensible protected/in-house types. Different crops may grow simultaneously across areas and zones. The Digital Twin shall maintain state for each production area and crop zone and for the farm as a whole — including location, soil, water sources, irrigation, weather, environmental conditions (where applicable), crop combinations, farming activities, historical performance, expected economics, and **sustainability state**.

Existing Open Field / crop-zone behavior remains fully supported; Production Area is a first-class container that generalizes (does not replace) fields.

The platform shall combine:

- Free/low-cost third-party weather and soil/agricultural data APIs (provider-configurable)
- Farmer-provided information
- Regional crop data
- Historical government crop rates
- AI reasoning

to create a continuously evolving picture of the farm.

At the center is an **AI Farm Assistant attached to each farm**, grounded in that farm’s Digital Twin (not generic chatbot answers), including the correct **production environment** for each crop zone.

**Core product modules (in scope for production):**

| # | Module | Summary |
|---|--------|---------|
| 1 | Farm Management | Farms, **production areas**, fields/crop zones, water sources, farm profiles |
| 2 | Digital Farm Twin | Live virtual representation of the **entire farm ecosystem** |
| 3 | Farm Twinning | Multi-crop / **multi-environment** optimization and crop relationships |
| 4 | AI Farm Assistant | Context-aware chatbot per farm (**environment-aware**) |
| 5 | Weather Intelligence | External weather, forecasts, risk analysis |
| 6 | Soil Intelligence | Third-party soil data + farmer observations/tests |
| 7 | Water Intelligence | Sources, availability, irrigation planning |
| 8 | Crop Intelligence | Suitability, seed variety suggestions, on-farm & neighbour compatibility, care, seasonal recommendations |
| 9 | Yield & Economic Intelligence | Yield + government reference rates + estimated gross value |
| 10 | Nearby Farm Intelligence | Anonymized similar-farm insights |
| 11 | Experimental Farm | Controlled testing of unconventional/new crops |
| 12 | Farm Learning | Predicted vs actual → improved recommendations |
| 13 | Alerts & Recommendations | Proactive actions and risk notifications |
| 14 | Farm History & Analytics | Seasons, crops, yield, costs, outcomes |
| **15** | **Protected / In-House Farming** | Shed, greenhouse, tunnel/polyhouse, and extensible protected environments |
| **16** | **Green Farm Intelligence** | Sustainability metrics, **Green Farm Score**, green recommendations |

Also in scope: phone OTP authentication, Urdu + English (RTL/LTR), web and mobile farmer clients at feature parity against a shared backend, and a web-only administrative console.

#### 1.2.3 Out of scope (production v1.0)

- Marketplace, e-commerce, payments for produce, or logistics
- IoT / sensor hardware integration (architecture shall allow future extension; not required for v1.0; provenance may reserve `observed_measured` / sensor for future)
- Offline-first operation (connectivity assumed; limited cached read of last twin snapshot is allowed)
- Regional languages beyond Urdu and English
- Legal guarantee of yield, price, or profitability outcomes (all predictions are advisory)
- **Government, environmental, or scientific certification** — the Green Farm Score is an AI product decision-support indicator only, not a certification

### 1.3 Definitions, acronyms, abbreviations

| Term | Definition |
|------|------------|
| **LLM** | Large Language Model; AI engine for plans, care guidance, and the Farm Assistant |
| **OTP** | One-Time Password for farmer authentication |
| **MVP** | Minimum Viable Product (Phase P0); subset of production scope |
| **MoSCoW** | Must / Should / Could / Won’t-this-time prioritization |
| **RTL / LTR** | Right-to-left / left-to-right text direction |
| **Farm Digital Twin** | Living, continuously updated virtual representation of the **entire farm ecosystem** (production areas, zones, soil, water, weather, activities, economics, sustainability) |
| **Production Area** | First-class subdivision of a farm with a production environment type (open field, shed, greenhouse, tunnel/polyhouse, experimental, or extensible type) containing zero or more crop zones |
| **Production Area Type** | Extensible classification of production environment; core types include `open_field`, `shed`, `greenhouse`, `tunnel_polyhouse`, `experimental`, `other_protected` |
| **Field / Crop Zone** | Subdivision of a **production area** with its own area, crop, planting date, growth stage, and expected yield (legacy open-field farms map to an Open Field production area) |
| **Protected / In-House Farming** | Controlled-environment production (shed, greenhouse, tunnel/polyhouse, and similar) |
| **Green Farm Intelligence** | Module that evaluates sustainable farming performance from available twin data |
| **Green Farm Score** | Explainable AI/product decision-support indicator of sustainability dimensions; **not** a certification |
| **Farm Twinning** | Multi-crop care, companion planting, and portfolio optimization across a farm **and its production environments** |
| **Farm Twinning Engine** | Core intelligence that assembles twin context and produces recommendations |
| **AI Farm Assistant** | Per-farm, twin-grounded conversational interface |
| **Experimental Zone / Area** | Dedicated production area (or portion) for controlled crop experimentation |
| **Farm Learning Loop** | Compare predicted vs actual outcomes to improve future recommendations |
| **Data provenance** | Label distinguishing farmer-provided, third-party estimated, and observed/measured data |
| **Government reference rate** | Historical published/reference crop price used for economics; not a guaranteed future price |
| **Region aggregation** | Anonymized aggregation of crop/farm statistics by region |
| **Seed variety** | A specific cultivar/variety of a crop (e.g., tomato hybrid vs open-pollinated), suited to region, season, soil, water, and production environment |
| **Neighbouring field** | Another field/crop zone on the **same farm** that shares a boundary or is treated as adjacent for compatibility |
| **Neighbouring farm crop signal** | Anonymized aggregate of crops grown on geographically nearby farms (never individual identities) |
| **PRD / SRS / Dev Spec** | Product Requirements / Software Requirements / Developer Design Specification |

### 1.4 References

- HAPPY-VEGGIE-PRD.md — product context, personas, early MoSCoW (superseded for production scope by this SRS v1.3)
- HAPPY-VEGGIE-DEV-SPEC.md — screens, API contracts, edge cases (must be aligned to this SRS v1.3)
- External: configurable weather API provider(s); configurable soil/agri API provider(s); LLM provider; SMS/OTP provider; geolocation services; government crop-rate datasets (Pakistan)

### 1.5 Overview

Section 2 describes product context, users, environment, constraints, tech stack, and skills. Section 3 states external-interface, functional, and non-functional requirements plus selected acceptance criteria. Section 4 defines data requirements and provenance rules. Section 5 provides traceability. Section 6 defines production readiness criteria and delivery phases. Section 7 holds appendices.

---

## 2. Overall description

### 2.1 Product perspective

HAPPY VEGGIE is a self-contained production system consisting of:

- A shared backend (API gateway, domain services, twin engine, job/scheduler workers)
- Farmer-facing clients (web and mobile) at full functional parity
- A web-only administrative console
- Integrations: LLM provider, weather provider(s), soil/agri provider(s), SMS/OTP, geolocation/maps, government rate data ingestion

Persistent storage holds farmers, farms, **production areas**, fields/crop zones, twin snapshots, plans, activities, rates, regional stats, sustainability scores, alerts, and audit logs.

```text
              ┌──────── Weather ────────┐
              │                          │
              ↓                          ↓
Soil →  FARM DIGITAL TWIN  ← Water
              ↑         ↑
              │         └── Production Areas (Open / Protected / Experimental)
          Crop State
              ↑
              │
       Farmer Activities + Sustainability State
              │
              ↓
       AI FARM ASSISTANT
              │
      ┌───────┼────────┬──────────┐
      ↓       ↓        ↓          ↓
   Advice   Risk     Yield     Green Score
      ↓       ↓        ↓          ↓
    Action  Alert   Economics  Green Tips
```

### 2.2 Product functions

At a high level, the system shall:

1. Authenticate farmers (phone + OTP) and administrators (stronger auth).
2. Let farmers create and manage one or more farms, each with **multiple production areas** (open field, shed, greenhouse, tunnel, experimental, extensible types), crop zones, soil, water sources, and irrigation.
3. Maintain a **Farm Digital Twin** that continuously reflects farm-wide, **per-production-area**, and per-zone state — the entire farm ecosystem.
4. Run a **Farm Twinning Engine** that optimizes multi-crop / **multi-environment** allocation and care, including **seed variety suggestions** and **compatibility with neighbouring fields and neighbouring farms’ crops** (anonymized), balancing yield, economics, risk, water, soil, resources, and **sustainability**.
5. Provide a **per-farm AI Farm Assistant** grounded in the twin and the correct **production environment**.
6. Ingest weather and soil intelligence via configurable free/low-cost APIs, with graceful degradation.
7. Model water sources and irrigation constraints as first-class twin inputs.
8. Estimate yield and **economic value** using historical government reference rates (clearly labeled).
9. Surface anonymized **nearby similar farms** insights.
10. Support an **Experimental Zone/Area** with controlled learning workflow.
11. Run a **Farm Learning Loop** (predicted → actual → difference → future recommendations).
12. Continuously evaluate the farm and emit alerts/recommendations.
13. Persist farm history and analytics across seasons.
14. Provide admin tools for catalog curation, rate data, plan review, and cost/usage analytics.
15. Support **Protected / In-House Farming** attributes and environment-aware recommendations (P1 richness; P0 model extensibility).
16. Provide **Green Farm Intelligence**, an explainable **Green Farm Score**, and sustainability recommendations without certification claims.

### 2.3 User classes and characteristics

| User class | Characteristics | Primary needs |
|------------|-----------------|---------------|
| **Established farmer** | Has land; may run multi-field farms; variable digital literacy | Optimize portfolio, irrigation, profitability, risk |
| **New farmer** | Limited experience; needs guided setup | Educational onboarding; forgiving defaults; AI can fill gaps |
| **Administrator / operator** | Privileged staff | Farmer management, catalogs, rates, AI quality, analytics, audit |
| **Consumer (downstream)** | Not a direct user in v1.0 | Out of scope as an actor |

### 2.4 Operating environment

- **Clients:** Mobile (mobile-first UX priority) and modern web browsers; responsive; Urdu RTL and English LTR. UI implemented in **React** (see §2.7).
- **Backend:** **ASP.NET Core Web API** hosted in cloud/VM; background workers for twin refresh and LLM jobs.
- **Database:** **Microsoft SQL Server** as the system of record.
- **Connectivity:** Required for twin refresh, weather/soil fetch, LLM, and assistant. Cached last twin snapshot may be readable when offline (Could for P1+).
- **Target region:** Pakistan primary (phone +92, area units acre/kanal/marla, Rabi/Kharif seasons, PKR, government rates). Architecture shall not hard-block future regions.

### 2.5 Design and implementation constraints

- **C-001:** All farmer-facing surfaces shall support Urdu (RTL) and English (LTR).
- **C-002:** Weather, soil, LLM, and SMS providers shall be **pluggable via configuration**; the system shall not be tightly coupled to a single vendor.
- **C-003:** LLM cost and latency shall be bounded per request type; budgets configurable per environment.
- **C-004:** Farmer auth may use mocked OTP in non-production (`OTP_MODE=mock`) with identical API contracts to live mode.
- **C-005:** Admin auth shall be stronger than farmer OTP and fully audit-logged.
- **C-006:** Predictions, rates, and recommendations shall carry disclaimers and data-provenance labels; never presented as guarantees.
- **C-007:** Privacy: nearby-farm and regional features shall expose only aggregated/anonymized data.
- **C-008:** Farm total land area shall be stored canonically in **acres** for open-land accounting; display in farmer-selected unit (acre / kanal / marla). **Production areas** may additionally use environment-appropriate units (e.g., square feet / square meters for sheds/greenhouses/tunnels; hectares where entered). All areas shall store both as-entered value/unit and a canonical comparable measure for aggregation rules defined in the Dev Spec.
- **C-009:** Soft-delete preferred over hard-delete for farms, **production areas**, fields, and plans.
- **C-010 (Tech — Backend):** The API shall be built with **ASP.NET Core**. Data access shall use **Entity Framework Core (EF Core)** against SQL Server. Application logic shall follow the **CQRS** pattern (separate Commands and Queries; handlers per use case). Controllers/endpoints shall be thin and dispatch to command/query handlers.
- **C-011 (Tech — Database):** **Microsoft SQL Server** is the primary relational store for transactional domain data (farmers, farms, production areas, fields, plans, catalogs, rates, sustainability, audit, etc.).
- **C-012 (Tech — Frontend):** All farmer and admin UIs shall be implemented in **React** using **functional components** (hooks-based; no new class components). Prefer composition, custom hooks for shared logic, and clear separation of presentational vs container/hook logic.
- **C-013 (Tech — Clients):** Farmer web and admin console are React SPAs (or equivalent React app structure) calling the shared .NET API. Mobile-first delivery shall use responsive React web and/or React Native with the same functional-component conventions and shared API contracts.
- **C-014 (Green Score):** The Green Farm Score shall never be labeled or marketed as government, environmental, or scientific certification.
- **C-015 (Production environments):** AI recommendations shall not assume outdoor conditions for crops in protected production areas.

### 2.6 Assumptions and dependencies

**Assumptions**

- A1: Farmers have a smartphone (or browser) with GPS capability and connectivity at time of interactive use.
- A2: At least one LLM API is available within budget.
- A3: Free/low-cost weather and soil APIs covering Pakistan coordinates are available for enrichment.
- A4: Historical government crop reference rates can be sourced and periodically updated (manual admin ingest acceptable for v1.0).
- A5: Urdu + English cover the target user base for v1.0.
- A6: The delivery team has (or will acquire) the skills listed in §2.8 for .NET, EF Core, CQRS, SQL Server, and React.
- A7: Protected-environment attributes (temperature, humidity, ventilation, etc.) may be sparse; the system shall operate with partial data and must not fabricate measurements.
- A8: Green Farm Score dimensions are computed only from available twin data; missing dimensions are omitted or marked unavailable, not invented.

**Dependencies**

- .NET SDK / ASP.NET Core runtime; SQL Server instance; React toolchain (Node.js); LLM provider; SMS/OTP provider (live); map/geolocation; weather API; soil/agri API; government rate dataset; hosting/observability stack.

### 2.7 Technology stack (normative)

The following stack is **mandatory** for production implementation unless a formal architecture exception is approved.

| Layer | Technology | Normative rules |
|-------|------------|-----------------|
| **API / Backend** | **ASP.NET Core** (Web API) | REST (or versioned HTTP APIs); JWT/session auth as designed; thin controllers |
| **Application pattern** | **CQRS** | Commands mutate state; Queries read; separate handlers; no mixing write logic into query handlers |
| **ORM / data access** | **Entity Framework Core** | DbContext(s); migrations; entities/configurations; avoid raw SQL except where justified (perf, TVPs, aggregates) and encapsulated |
| **Database** | **Microsoft SQL Server** | System of record; indexes for farm/field/owner queries; soft-delete columns where required |
| **Background work** | .NET hosted services / workers / queue consumers | Twin refresh, alerts evaluation, LLM long-running jobs |
| **Farmer UI** | **React** | **Functional components only** (hooks); mobile-first responsive UI; i18n Urdu/English + RTL |
| **Admin UI** | **React** | Functional components; privileged flows against admin API surface |
| **Mobile** | React responsive web and/or **React Native** | Same API; functional components; platform GPS/share as needed |
| **Integrations** | Typed .NET adapters/interfaces | Weather, soil, LLM, SMS behind ports/adapters for swappability |

```text
┌─────────────────────┐     ┌─────────────────────┐
│  React UI (Farmer)  │     │  React UI (Admin)   │
│  Functional comps   │     │  Functional comps   │
└──────────┬──────────┘     └──────────┬──────────┘
           │  HTTPS JSON                │
           └────────────┬───────────────┘
                        ▼
           ┌────────────────────────┐
           │  ASP.NET Core Web API  │
           │  Controllers (thin)    │
           │  CQRS Handlers         │
           │  EF Core               │
           └────────────┬───────────┘
                        ▼
           ┌────────────────────────┐
           │  Microsoft SQL Server  │
           └────────────────────────┘
```

**CQRS expectations (backend)**

- Each write use case → `IRequest`/`Command` + handler (e.g., `CreateFarmCommand`, `GeneratePlanCommand`).
- Each read use case → `Query` + handler returning DTOs/read models (e.g., `GetFarmTwinQuery`).
- EF Core used inside handlers/repositories; domain validation in command pipeline (FluentValidation or equivalent optional but recommended).
- Side effects (LLM, weather) invoked from command handlers or domain services, with timeouts and graceful degradation per NFRs.

**React expectations (frontend)**

- Functional components + hooks (`useState`, `useEffect`, custom hooks, etc.).
- Feature folders aligned to modules (auth, farms, twin, assistant, admin).
- API client layer shared; no business rules duplicated that belong on the server.
- Forms and wizards as composable functional components; RTL-aware layout for `ur`.

### 2.8 Required engineering skills

Teams building and maintaining the system shall demonstrate the following skills (hire, train, or pair as needed).

#### 2.8.1 Backend (.NET / API)

| Skill | Level | Why it matters |
|-------|-------|----------------|
| C# / .NET and **ASP.NET Core Web API** | Advanced | All backend endpoints, auth, middleware |
| **CQRS** (commands, queries, handlers, pipelines) | Advanced | Mandatory application architecture |
| **Entity Framework Core** (DbContext, migrations, relationships, performance) | Advanced | SQL Server data access |
| REST API design, versioning, OpenAPI/Swagger | Intermediate+ | Client contracts |
| Authentication/authorization (JWT, policies, RBAC for admin) | Intermediate+ | Farmer OTP sessions + admin security |
| Async/await, cancellation, resilience (timeouts, retries, circuit breakers) | Intermediate+ | LLM and weather integrations |
| Background workers / hosted services | Intermediate | Twin refresh, alerts |
| Unit/integration testing (xUnit/NUnit, Testcontainers or SQL test strategy) | Intermediate | Production quality |

#### 2.8.2 Database (SQL Server)

| Skill | Level | Why it matters |
|-------|-------|----------------|
| **Microsoft SQL Server** T-SQL, indexing, query plans | Intermediate+ | Twin/farm query performance |
| Relational modeling / normalization | Intermediate+ | Farms, fields, neighbours, catalogs |
| EF Core migrations & schema evolution | Intermediate+ | Safe production upgrades |
| Backup/restore awareness | Intermediate | NFR-018 |

#### 2.8.3 Frontend (React)

| Skill | Level | Why it matters |
|-------|-------|----------------|
| **React with functional components and hooks** | Advanced | Mandatory UI style; no new class components |
| Component composition, custom hooks, context where appropriate | Intermediate+ | Wizards, twin dashboard, assistant |
| React Router (or equivalent) and form handling | Intermediate | Multi-step onboarding |
| i18n + **RTL (Urdu)** layout | Intermediate+ | FR-015/016, NFR-004 |
| Calling REST APIs, auth token handling, error/retry UX | Intermediate+ | Shared .NET API |
| Responsive / mobile-first CSS | Intermediate+ | NFR-002 |
| Optional: React Native (functional components) | Intermediate | Native mobile parity if chosen |

#### 2.8.4 Cross-cutting

| Skill | Level | Why it matters |
|-------|-------|----------------|
| Git, CI/CD, environment config & secrets | Intermediate | Production releases |
| Observability (logs/metrics) | Intermediate | NFR-013 |
| Security basics (OWASP API, PII handling) | Intermediate | NFR-006, NFR-012 |
| Domain understanding of Digital Twin modules | Working | Correct CQRS boundaries and UX |

---

## 3. Specific requirements

Requirements use “The system shall…”. Priority is Must / Should / Could. IDs are stable.

**Phase tags (see Section 6):**  
- **P0** — Production MVP core (must ship for first production release)  
- **P1** — Production complete (full Digital Twin platform)  
- **P2** — Enhanced / stretch within production roadmap  

---

### 3.1 External interface requirements

| ID | Priority | Phase | Requirement |
|----|----------|-------|-------------|
| **EIR-001** | Must | P0 | The system shall provide farmer-facing UIs on web and mobile, responsive to device size. |
| **EIR-002** | Must | P0 | The system shall render all farmer-facing interfaces correctly in Urdu (RTL) and English (LTR), including exported documents. |
| **EIR-003** | Must | P0 | The system shall expose a shared **ASP.NET Core** backend API consumed by farmer React clients and, under privileged scope, the admin React console. |
| **EIR-004** | Must | P0 | The system shall integrate with an external LLM provider for plan generation, care guidance, and the AI Farm Assistant. |
| **EIR-005** | Must | P0 | The system shall integrate with configurable weather API provider(s); failure shall not block core farm CRUD or last-known twin display. |
| **EIR-006** | Should | P1 | The system shall integrate with configurable soil/agri data API provider(s) based on farm coordinates, degrading gracefully on failure. |
| **EIR-007** | Must | P0 | The system shall integrate with device geolocation (native GPS on mobile, browser geolocation on web). |
| **EIR-008** | Must | P0 | The system shall support SMS/OTP live mode and mock mode behind configuration with identical client contracts. |
| **EIR-009** | Must | P1 | The system shall support ingestion of historical government crop reference rates (admin upload/API), labeled as reference values. |
| **EIR-010** | Must | P0 | All external provider credentials shall be stored server-side only; never embedded in farmer clients. |

---

### 3.2 Functional requirements

#### 3.2.1 Authentication and profile

| ID | Priority | Phase | Requirement |
|----|----------|-------|-------------|
| **FR-001** | Must | P0 | The system shall authenticate farmers via phone number and OTP. |
| **FR-002** | Must | P0 | The system shall associate all farm, **production area**, field, twin, plan, and assistant data with the authenticated farmer and restrict access to the owner (or authorized admin). |
| **FR-017** | Must | P0 | The system shall present a single unified passwordless entry that determines new vs. returning farmers after OTP verification. |
| **FR-018** | Must | P0 | The system shall collect a name and preferred language for first-time farmers. |
| **FR-044** | Must | P0 | The system shall support session refresh/revocation and secure token storage practices appropriate to each client platform. |

#### 3.2.2 Farm Management & Production Areas (Module 1)

| ID | Priority | Phase | Requirement |
|----|----------|-------|-------------|
| **FR-045** | Must | P0 | The system shall allow a farmer to create, view, update, and soft-delete one or more farms. |
| **FR-046** | Must | P0 | Each farm shall capture location (lat/long), total area, region, and optional farm display name. |
| **FR-019** | Must | P0 | The system shall accept farm/open-field area in acre, kanal, or marla and store it canonically in acres. |
| **FR-020** | Must | P0 | The system shall suggest a region from the farmer’s location and allow confirm/change. |
| **FR-003** | Must | P0 | The system shall auto-detect location via GPS and store latitude/longitude. |
| **FR-004** | Could | P0 | The system shall allow manual location entry when GPS is unavailable. |
| **FR-109** | Must | P0 | The system shall model **Production Area** as a first-class child of Farm. A farm shall support **zero or more production areas** simultaneously. |
| **FR-110** | Must | P0 | Production area types shall include at least: `open_field`, `shed`, `greenhouse`, `tunnel_polyhouse`, `experimental`, `other_protected`, and shall be **extensible** without redesigning the twin (new types via configuration/admin catalog). |
| **FR-111** | Must | P0 | For P0, creating a farm with crop zones shall remain supported; if the farmer does not explicitly choose a type, crop zones shall attach to a default **Open Field** production area (backward compatible with existing open-field flows). |
| **FR-047** | Must | P0 | The system shall allow a production area to contain **zero or more fields / crop zones**. (A farm therefore contains crop zones via its production areas.) |
| **FR-048** | Must | P0 | Each field/crop zone shall capture: name/label, area, crop (or experimental flag), optional **seed variety**, optional planting date, growth stage, and expected yield (when known/predicted), and shall reference its parent **production area**. |
| **FR-049** | Must | P0 | The system shall validate that allocated open-field/experimental land areas do not exceed farm total land area (configurable tolerance). Protected covered areas (e.g., sq ft) shall be validated within their production-area capacity rules and shall not silently invalidate open-field accounting. |
| **FR-112** | Must | P0 | A single farm shall support **multiple crops simultaneously** across production areas and crop zones. |
| **FR-113** | Must | P0 | A single farm shall support **different production environments** at the same time (e.g., open field + shed + experimental). |
| **FR-114** | Must | P0 | Production areas may use **different area units** where appropriate (acres/kanal/marla/hectares for land; sq ft / sq m for covered structures), storing as-entered unit plus canonical measure per C-008. |
| **FR-050** | Must | P1 | The system shall allow a farm to declare one or more water sources and irrigation attributes (see Water Intelligence). |
| **FR-006** | Should | P0 | The system shall present new farmers a guided setup wizard (soil, budget, water access, optional “help me choose” crop). |
| **FR-021** | Should | P0 | The system shall allow unknown soil, absent budget, and “help me choose” crop, and still generate recommendations. |
| **FR-005** | Must | P0 | The system shall capture preferred crop(s) at farm, production-area, or field level as applicable. |

#### 3.2.3 Digital Farm Twin (Module 2)

| ID | Priority | Phase | Requirement |
|----|----------|-------|-------------|
| **FR-051** | Must | P0 | The system shall maintain a Farm Digital Twin per farm representing farm-level, **production-area-level**, and field/zone-level state. |
| **FR-052** | Must | P0 | The twin shall include: location, total area, **production areas**, soil profile (with provenance), water sources, irrigation, weather snapshot, fields/crops, activities summary, economic summary when available, and (when computed) **sustainability / Green Farm** summary placeholders extensible for P1. |
| **FR-115** | Must | P0 | Each production area shall maintain **independent Digital Twin state** (type, area, zones, applicable environment attributes, linked crops) while farm-level intelligence **aggregates across all production areas**. |
| **FR-053** | Must | P1 | The system shall refresh twin weather (and soil when configured) on a schedule and on demand, recording `last_refreshed_at` and source status. |
| **FR-054** | Must | P0 | The system shall expose a twin summary API/view suitable for dashboard and assistant grounding, including production-area breakdown. |
| **FR-055** | Must | P0 | Twin-derived outputs shall never display raw LLM/machine blobs; content shall be structured and localized. |
| **FR-116** | Must | P1 | The twin shall represent the **entire farm ecosystem**: farm, production areas, fields/crop zones, crops, soil, water, irrigation, weather, environmental conditions (where available), farm activities, historical performance, experimental farming, sustainability state, and economic state. |

Conceptual hierarchy the twin shall support:

```text
Farmer
  └── Farm
       ├── Production Areas
       │    ├── Open Field → Crop Zones
       │    ├── Shed / Protected Farming → Crop Zones
       │    ├── Greenhouse → Crop Zones
       │    ├── Tunnel / Polyhouse → Crop Zones
       │    └── Experimental Area → Crop Zones
       ├── Water Sources, Irrigation, Soil, Weather
       ├── Farm History, Sustainability State, Economics
       └── AI Farm Assistant
```

Illustrative multi-environment farm (normative capability, not UI layout):

```text
Farm: 20 acres
Open Field
  Field A → 8 acres → Tomato
  Field B → 5 acres → Potato
  Field C → 4 acres → Onion
Protected Farming
  Shed 1 → 2,000 sq ft → Cucumber
  Shed 2 → 1,000 sq ft → Capsicum
Experimental Area
  Zone 1 → 1 acre → Experimental Crop
```
#### 3.2.4 Farm Twinning Engine & Multi-Crop Optimization (Modules 3, 8)

| ID | Priority | Phase | Requirement |
|----|----------|-------|-------------|
| **FR-029** | Must | P0 | The system shall allow a farmer to record multiple crops / fields on a farm. |
| **FR-030** | Must | P0 | The system shall evaluate crop pairs against a companion-planting compatibility table and present good/avoid/neutral relations with reasons. |
| **FR-099** | Must | P0 | The system shall evaluate **compatibility between a field’s crop and its neighbouring fields** on the same farm (adjacent/bordering crop zones) and present good/avoid/neutral relations with localized reasons. |
| **FR-100** | Must | P1 | When recommending or changing a crop on a field, the system shall warn if the choice conflicts with neighbouring fields and suggest compatible alternatives. |
| **FR-101** | Should | P1 | The system shall evaluate **compatibility with neighbouring/nearby farms’ crops** using only anonymized aggregated crop signals (never another farmer’s identity or private field map). |
| **FR-102** | Should | P1 | Neighbouring-farm compatibility insights shall be labeled as regional/neighbourhood signals (e.g., “common nearby crops” / “crops often avoided next to X in your area”) and shall degrade gracefully when local data is sparse. |
| **FR-103** | Must | P0 | Compatibility evaluation order shall be: (1) on-farm neighbouring fields, (2) same-farm non-adjacent crops in the portfolio, (3) anonymized neighbouring-farm signals when available — with on-farm neighbours taking precedence for conflict warnings. |
| **FR-104** | Must | P1 | The system shall suggest **seed varieties** for a selected (or recommended) crop, tailored to farm region, season, soil (with provenance), water availability, **production environment**, and field context. |
| **FR-105** | Must | P1 | Seed variety suggestions shall include, where available: variety name (Urdu/English), type (e.g., hybrid / open-pollinated / local), suitability rationale, expected maturity/days, water or disease notes, and risk/confidence. |
| **FR-106** | Should | P1 | The farmer shall be able to accept a suggested seed variety and store it on the field record; “help me choose variety” shall be supported when the farmer has selected a crop but not a variety. |
| **FR-107** | Should | P0 | Plans and portfolio recommendations shall optionally include a recommended seed variety per crop/field when catalog data exists. |
| **FR-031** | Should | P1 | The system shall generate LLM-based care and input guidance for the crop set, grounded in twin context (including variety when set). |
| **FR-032** | Must | P0 | The system shall present compatibility results even when LLM care guidance fails. |
| **FR-056** | Must | P1 | The system shall recommend an **optimal crop portfolio** across available land **and production environments** (open fields, sheds, greenhouses, tunnels, experimental areas), not only a single crop or single environment. |
| **FR-057** | Must | P1 | Portfolio recommendations shall consider: land/area availability, **production environment**, crop suitability, expected yield, reference selling price, production cost estimate, water requirements, soil suitability, weather suitability, irrigation, crop compatibility (**including neighbouring fields**), seed variety suitability, regional demand signals, risk, diversification, farmer budget, available water, resource usage, and **sustainability**. |
| **FR-058** | Must | P1 | The optimization objective shall be **maximum expected farm value while balancing yield, profitability, risk, water availability, resource usage, and sustainability** — not yield alone and not sustainability alone. |
| **FR-117** | Must | P1 | Sustainability shall be **one optimization dimension**, not an absolute rule. The system shall not recommend a crop solely for lower water/resource use if it is unsuitable for soil, season, or production environment; has unacceptably low expected yield; or carries unacceptable risk. |
| **FR-059** | Should | P1 | The system shall present portfolio recommendations in a clear allocation format (e.g., acres/sq ft per crop including experimental and reserve, grouped by production area where relevant). |
| **FR-007** | Must | P0 | The system shall generate a custom crop/farm plan from twin inputs using an LLM (and deterministic tables where specified). |
| **FR-008** | Should | P0 | The plan shall include region- and season-appropriate recommended crops. |
| **FR-009** | Should | P0 | The plan shall include a step-by-step farming plan and calendar. |
| **FR-010** | Should | P0 | The plan shall include water, fertilizer, and input guidance. |
| **FR-022** | Should | P0 | Plan generation shall enrich with weather/soil when available and record context used. |
| **FR-023** | Must | P0 | Plans shall render as sectioned content; never raw machine output. |
| **FR-024** | Should | P1 | Farmers may share a plan as text and export as printable PDF. |
| **FR-025** | Should | P0 | On post-generation language change, UI switches immediately; plan regeneration is offered (not silent auto-translate). |
| **FR-012** | Must | P0 | Generated plans and assistant answers shall appear in the farmer’s selected language. |

#### 3.2.5 AI Farm Assistant (Module 4)

| ID | Priority | Phase | Requirement |
|----|----------|-------|-------------|
| **FR-060** | Must | P1 | Every farm shall have an AI Farm Assistant scoped exclusively to that farm’s Digital Twin. |
| **FR-061** | Must | P1 | The assistant shall ground answers in twin data: **production areas**, crops/fields, location, soil (with provenance), water, weather, **environment-specific conditions when available**, history, planned activities, economics, and **Green Farm** signals when present. |
| **FR-062** | Must | P1 | The assistant shall refuse or clearly disclaim when twin data is insufficient, rather than inventing farm-specific facts. |
| **FR-063** | Must | P1 | The assistant shall support farm-specific questions including (non-exhaustive): what to plant next; which **seed variety** to use; best expected return; which field/area needs water; spraying suitability; yield changes; crop compatibility with **neighbouring fields** and anonymized nearby crops; crop plan changes; crop risk; anonymized nearby crop patterns; last year’s performance; what to do this week; **protected-area performance**; **Green Farm Score / sustainability** questions (see FR-130). |
| **FR-118** | Must | P1 | The assistant shall resolve the correct **production area / environment** for crop-specific questions (e.g., shed cucumber vs open-field cucumber) and shall **never assume** protected crops share outdoor environmental conditions. |
| **FR-064** | Must | P1 | Assistant conversations shall be persisted per farm (history) and owner-scoped. |
| **FR-065** | Should | P1 | The assistant shall cite which twin signals influenced an answer (e.g., weather forecast, field growth stage, **production area type**, shed humidity) in lightweight form. |
| **FR-066** | Must | P1 | The assistant shall not expose other farmers’ private data under any prompt. |

#### 3.2.6 Weather Intelligence (Module 5)

| ID | Priority | Phase | Requirement |
|----|----------|-------|-------------|
| **FR-067** | Must | P0 | The twin shall store current and forecast weather for the farm location when the provider succeeds. |
| **FR-068** | Must | P0 | Weather fields shall include, where available: temperature (current/forecast), rain probability, rainfall, humidity, wind, extreme weather alerts, and forecast trends. |
| **FR-069** | Must | P1 | Weather changes shall dynamically influence recommendations and alerts (e.g., delay irrigation, revise fertilizer timing, raise disease-risk assessment, notify farmer). |
| **FR-070** | Must | P0 | Weather provider shall be configurable; swapping providers shall not require farmer-client changes. |

#### 3.2.7 Soil Intelligence (Module 6)

| ID | Priority | Phase | Requirement |
|----|----------|-------|-------------|
| **FR-071** | Must | P1 | The twin shall maintain soil attributes where available: type, texture, pH, organic matter, nutrients, characteristics, estimated/historical conditions. |
| **FR-072** | Must | P0 | The system shall distinguish and label data provenance: **farmer-provided**, **third-party estimated**, and **observed/measured** (e.g., soil-test entry). |
| **FR-073** | Must | P1 | Farmers shall be able to enter or update soil-test results; farmer-provided/measured data shall take precedence over third-party estimates in recommendation weighting when present. |
| **FR-074** | Should | P0 | Unknown soil shall never block plan generation; AI may infer or produce soil-robust guidance. |

#### 3.2.8 Water Source & Irrigation Intelligence (Module 7)

| ID | Priority | Phase | Requirement |
|----|----------|-------|-------------|
| **FR-075** | Must | P1 | A farm may have multiple water sources (tube well, canal, rainwater, reservoir, other). |
| **FR-076** | Must | P1 | Each source may store: type, availability, seasonal availability, estimated capacity, reliability, irrigation method, and fields served. |
| **FR-077** | Must | P1 | Crop and portfolio recommendations shall consider water constraints and may prefer lower water-demand crops when capacity is insufficient. |
| **FR-078** | Should | P1 | The assistant and alerts shall answer field- / **production-area**-level irrigation questions using twin water + weather + growth stage **and the correct production environment context**. |

#### 3.2.9 Yield & Economic Intelligence (Module 9)

| ID | Priority | Phase | Requirement |
|----|----------|-------|-------------|
| **FR-011** | Should | P0 | Plans may include yield/harvest prediction with confidence and assumptions. |
| **FR-079** | Must | P1 | The system shall estimate **reference gross value** ≈ expected yield × historical government reference rate (when both available). |
| **FR-080** | Must | P1 | Government rates shall be clearly labeled as **historical reference values**, not guaranteed future prices. |
| **FR-081** | Must | P1 | The system shall present comparative crop economics tables (yield, reference rate, expected gross value, risk) to support decisions. |
| **FR-082** | Should | P1 | The system shall incorporate estimated production cost when provided or modeled, to support net-value framing. |
| **FR-083** | Must | P1 | Admins shall be able to manage/update government reference rate datasets by crop and effective period. |

#### 3.2.10 Nearby Farm Intelligence (Module 10)

| ID | Priority | Phase | Requirement |
|----|----------|-------|-------------|
| **FR-033** | Should | P1 | The system shall suggest crops by blending AI reasoning with anonymized regional/similar-farm data. |
| **FR-034** | Should | P1 | The system shall degrade to AI-only suggestions when regional data is sparse, and label them accordingly. |
| **FR-035** | Must | P0 | The system shall expose only aggregated, anonymized regional/similar-farm data — never individual farmer identity or private farm details. |
| **FR-084** | Should | P1 | Similarity may use geographic proximity, farm size, soil, climate, water, crop selection, and season. |
| **FR-085** | Should | P1 | The UI may show “Farms similar to yours nearby” insights as aggregated statements only. |
| **FR-108** | Should | P1 | Nearby-farm crop aggregates shall feed **neighbouring-crop compatibility** checks (FR-101/102) without revealing which specific neighbour grows which crop. |

#### 3.2.11 Experimental Farm / Innovation Zone (Module 11)

| ID | Priority | Phase | Requirement |
|----|----------|-------|-------------|
| **FR-086** | Must | P1 | The system shall allow allocation of a portion of farm area as an **Experimental Zone / Experimental production area**. |
| **FR-087** | Must | P1 | Experimental recommendations shall default to a **small area** relative to the farm to limit risk exposure. |
| **FR-088** | Must | P1 | The experimental workflow shall support: AI identification → local condition comparison → yield/profit/risk estimate → small-area recommend → farmer approval → season tracking → record actual yield/cost/outcome → compare to prediction → feed Farm Learning. |
| **FR-089** | Should | P1 | Experimental crops may include uncommon, newly introduced, AI-recommended, climate-analogous, or higher-risk/high-value candidates. |
| **FR-119** | Must | P0 | Experimental Area shall be representable as a `ProductionAreaType` of `experimental` under FR-110 (model readiness in P0; full workflow remains P1 per FR-086–088). |

#### 3.2.12 Farm Learning Loop (Module 12)

| ID | Priority | Phase | Requirement |
|----|----------|-------|-------------|
| **FR-090** | Must | P1 | The system shall allow recording of **actual** yield, cost, and outcome per field/season. |
| **FR-091** | Must | P1 | The system shall compare predicted vs actual, store the difference, optional reason codes, and use the result to improve future recommendations for that farm. |
| **FR-092** | Should | P2 | Over multiple seasons, the system shall present a Farm Intelligence History summarizing performance trends. |

#### 3.2.13 Continuous Intelligence, Alerts & Recommendations (Modules 13)

| ID | Priority | Phase | Requirement |
|----|----------|-------|-------------|
| **FR-036** | Should | P0 | The dashboard shall surface alerts (weather, plan-calendar reminders, seasonal/pest) — demo/on-load computation acceptable for P0. |
| **FR-037** | Should | P1 | Full-tier alerts shall persist with read/unread state. |
| **FR-093** | Must | P1 | The system shall continuously (or on schedule) evaluate twin changes and produce actionable recommendations answering what the farmer should do next. |
| **FR-094** | Must | P1 | Critical weather/risk alerts shall be prioritized and localized. |
| **FR-095** | Must | P0 | Alert/recommendation failures shall never block core farm or twin viewing. |

#### 3.2.14 Persistence, History & Analytics (Module 14)

| ID | Priority | Phase | Requirement |
|----|----------|-------|-------------|
| **FR-013** | Must | P0 | The system shall save each farmer’s farm profile(s), **production area(s)**, fields, and generated plan(s). |
| **FR-014** | Must | P0 | The system shall let a farmer retrieve and revisit saved farms, twins, and plans. |
| **FR-026** | Must | P0 | The system shall support multiple farms per farmer and retain full plan history per farm. |
| **FR-027** | Must | P0 | Editing farm/**production area**/field details and regenerating shall create a new plan version without destroying prior plans. |
| **FR-028** | Should | P0 | The system shall provide a dashboard listing farms with access to twin summary, latest plan, assistant entry, and alerts area. |
| **FR-120** | Should | P1 | The farm dashboard shall present a **production-environment breakdown** (illustrative content, not mandated layout): totals for open field / protected / experimental areas (in their units), active crops, water status, weather risk, expected yield, reference value, **Green Farm Score** when available, production-area crop lists, Green Farm dimension summaries, and entry to the AI Farm Assistant. |
| **FR-096** | Must | P1 | The system shall track seasons, crops, yield, costs, outcomes, and farm performance analytics for the owning farmer. |

#### 3.2.15 Localization

| ID | Priority | Phase | Requirement |
|----|----------|-------|-------------|
| **FR-015** | Must | P0 | The system shall provide the full core farmer flow in Urdu and English. |
| **FR-016** | Must | P0 | The farmer can switch language; the choice persists across sessions. |

#### 3.2.16 Administration

| ID | Priority | Phase | Requirement |
|----|----------|-------|-------------|
| **FR-038** | Should | P1 | The system shall provide a web-only admin console to manage farmers and content. |
| **FR-039** | Should | P1 | Admins shall curate the crop catalog, **seed variety catalog**, companion-planting table, and **production area type** catalog (extensibility). |
| **FR-040** | Should | P1 | Admins shall review sampled or flagged AI plans/assistant outputs. |
| **FR-041** | Should | P1 | Admins shall view usage and LLM cost analytics. |
| **FR-042** | Must | P0 | Admin authentication shall be separate and stronger than farmer OTP; every admin endpoint shall enforce role checks and audit-log actions. |
| **FR-083** | Must | P1 | *(Also listed under economics)* Admins manage government reference rates. |
| **FR-097** | Should | P1 | Admins shall configure feature flags for providers (weather, soil, OTP mode, enrichment). |

#### 3.2.17 Platform parity

| ID | Priority | Phase | Requirement |
|----|----------|-------|-------------|
| **FR-043** | Must | P1 | The system shall provide equivalent farmer functionality on web and mobile against one shared backend. |
| **FR-098** | Must | P0 | P0 may ship mobile-first with web covering the same P0 APIs; P1 closes full parity including assistant and twin views. |

#### 3.2.18 Protected / In-House Farming (Module 15)

| ID | Priority | Phase | Requirement |
|----|----------|-------|-------------|
| **FR-121** | Must | P1 | The system shall support creating and managing protected production areas of types shed, greenhouse, tunnel/polyhouse, and other protected/in-house types (via extensible `ProductionAreaType`). |
| **FR-122** | Must | P1 | Each protected production area shall be able to contain one or more crop zones. |
| **FR-123** | Should | P1 | For each protected production area, the system shall support storing applicable attributes where available (not all required): structure type; covered area; crop(s); growing method; soil or growing medium; temperature; humidity; ventilation; irrigation; water source; planting date; growth stage; expected yield; production cost; resource consumption. |
| **FR-124** | Must | P1 | Protected-area attributes shall carry **provenance** (farmer-provided, third-party estimated, observed/measured/future sensor) per §4.2; the system shall not present estimates as on-site measurements. |
| **FR-125** | Must | P1 | AI plan generation, care guidance, and the Farm Assistant shall produce **environment-aware** recommendations for protected crops (temperature, humidity, ventilation, irrigation, growing medium, water, growth stage as available). |
| **FR-126** | Must | P0 | The data model shall not prevent representing shed/greenhouse/tunnel/experimental production areas in P0 even if rich protected UX ships in P1 (see FR-109–111). |

#### 3.2.19 Green Farm Intelligence (Module 16)

| ID | Priority | Phase | Requirement |
|----|----------|-------|-------------|
| **FR-127** | Must | P1 | The system shall provide **Green Farm Intelligence** as a first-class module that evaluates sustainable farming performance using **available** twin data only (no fabricated measurements). |
| **FR-128** | Should | P1 | Sustainability dimensions may include, where data exists: water efficiency; irrigation efficiency; input efficiency; crop diversity; crop rotation; soil-health practices; resource consumption; energy/resource usage; waste reduction; other sustainable practices recorded on the farm. |
| **FR-129** | Must | P1 | The system shall compute an explainable **Green Farm Score** from available dimensions, showing contributing factors and improvement areas; distinguish measured vs estimated inputs; recalculate when relevant twin data changes. |
| **FR-130** | Must | P1 | The AI Farm Assistant shall answer sustainability questions (e.g., reduce water usage; why score is low; lower-water crops; soil sustainability; rotation; reduce resource usage) and may proactively recommend improvements when sufficient data exists. |
| **FR-131** | Must | P1 | Green recommendations shall identify whether they are data-driven, rule-based, AI-generated, and/or based on estimated third-party information, and shall include advisory disclaimers (NFR-017, C-006). |
| **FR-132** | Must | P1 | The Green Farm Score **shall not** be presented as government, environmental, or scientific certification or guaranteed sustainability compliance (C-014). |
| **FR-133** | Must | P1 | Green/sustainability optimization shall obey FR-117 (shall not override safety, suitability, season, environment, or unacceptable economic/risk constraints). |

---

### 3.3 Non-functional requirements

| ID | Priority | Phase | Requirement |
|----|----------|-------|-------------|
| **NFR-001** | Must | P0 | Crop/farm plan generation shall complete within ~60 seconds under normal conditions (p95 target configurable; document actual SLO in ops runbook). |
| **NFR-002** | Must | P0 | UI shall be mobile-first and usable on common low-to-mid-range Android devices; layouts responsive. |
| **NFR-003** | Must | P0 | A new farmer shall complete onboarding and reach a plan without external assistance. |
| **NFR-004** | Must | P0 | All farmer-facing UI and generated content shall render correctly in Urdu (RTL) and English (LTR), including PDFs. |
| **NFR-005** | Must | P0 | On LLM or feed failure/timeout, the system shall present a clear retry path and proceed without unavailable enrichment. |
| **NFR-006** | Must | P0 | Phone, location, and farm data shall be stored securely; access restricted to owner or authorized admins; aggregated features never expose individuals. |
| **NFR-007** | Must | P0 | LLM usage shall be token-bounded per request type; cost visibility for admins. |
| **NFR-008** | Must | P0 | Privileged administrative actions shall be audit-logged. |
| **NFR-009** | Must | P0 | Farmer clients shall share API contracts and localization resources to prevent cross-platform drift. |
| **NFR-010** | Must | P1 | **Availability:** API target ≥ 99.5% monthly excluding planned maintenance (adjust per hosting tier). |
| **NFR-011** | Must | P1 | **Assistant latency:** First meaningful token or full short answer within a defined SLO (e.g., p95 ≤ 15s for non-tool-heavy turns); long analyses may use async jobs with progress. |
| **NFR-012** | Must | P0 | **Security:** TLS in transit; secrets in a secret manager; least-privilege DB/IAM; OWASP-aligned API hardening (authn/z, rate limits, input validation). |
| **NFR-013** | Must | P1 | **Observability:** structured logs, metrics, tracing for twin refresh, provider calls, LLM calls, and errors; no secrets in logs. |
| **NFR-014** | Must | P0 | **Privacy:** privacy policy / consent for location and phone; data retention and deletion request path documented and implementable. |
| **NFR-015** | Must | P1 | **Provider isolation:** weather/soil/LLM adapters behind interfaces; circuit breakers and timeouts on all egress calls. |
| **NFR-016** | Should | P1 | **Scalability:** twin refresh and LLM jobs shall be asynchronously queueable under load. |
| **NFR-017** | Must | P0 | **Advisory disclaimer:** all AI yield, price, and action advice shall include an advisory disclaimer. |
| **NFR-018** | Must | P1 | **Backup & recovery:** automated DB backups; tested restore procedure; RPO/RTO documented. |
| **NFR-019** | Must | P0 | **Rate limiting:** OTP, LLM, and assistant endpoints shall be rate-limited per farmer/phone. |
| **NFR-020** | Should | P2 | **Accessibility:** core flows meet WCAG 2.1 AA where feasible for web. |
| **NFR-021** | Must | P0 | **Stack compliance:** Backend shall be ASP.NET Core + EF Core + CQRS + SQL Server; UIs shall be React **functional components** per §2.7 and constraints C-010–C-013. |
| **NFR-022** | Must | P1 | **No fabricated sustainability/environment data:** Green Farm metrics and protected-environment values shall use only available/validated twin data; missing inputs shall be marked unavailable. |

---

### 3.4 Acceptance criteria (selected — v1.3)

#### Production Areas
- A farm can contain multiple production areas.
- A farm can contain multiple production environment types at once.
- Multiple crops can exist simultaneously across areas/zones.
- Production areas maintain independent Digital Twin state; farm twin aggregates across them.
- Legacy open-field creation still works via default Open Field production area (FR-111).

#### Protected Farming
- Shed / greenhouse / tunnel (and other protected) areas can be created (P1).
- Protected areas can contain crop zones.
- Applicable protected attributes can be stored; missing attributes do not block the area.
- AI recommendations use the correct production environment (FR-118, FR-125).

#### Green Farm
- Sustainability metrics are calculated only from available data (NFR-022).
- Green Farm Score is explainable (factors + improvement areas).
- Sustainability recommendations are actionable and labeled (data-driven / rule-based / AI / estimate).
- No certification claims are made (FR-132, C-014).
- Data provenance is preserved.

#### Multi-Environment Optimization
- Crop recommendations consider production environment.
- Water and soil constraints are considered.
- Economic/reference-rate data remains part of optimization.
- Sustainability is included as a dimension but does not override FR-117 constraints.

---

## 4. Data requirements

### 4.1 Principal entities

The system shall persist in **Microsoft SQL Server** via **EF Core** (field-level detail may live in the Dev Spec; conceptual schema below is normative for production). Reuse existing entities; do not duplicate.

**Conceptual relationships**

```text
Farm
 ├── ProductionArea (typed via ProductionAreaType)
 │    └── Field/CropZone → Crop (+ optional CropCycle)
 ├── WaterSource / Irrigation
 ├── SoilProfile
 ├── WeatherSnapshot (via twin)
 ├── FarmActivity
 ├── ExperimentalCrop (via experimental ProductionArea / zones)
 ├── FarmSustainability / GreenFarmScore
 └── FarmEconomicSnapshot
```

**farmer** — phone (E.164), name, language, timestamps.

**farm** — owning farmer; name; lat/long; region; total area (canonical acres + as-entered); soil profile (with provenance); irrigation summary; budget; flags; soft-delete; timestamps.

**production_area** — farm_id; type (`ProductionAreaType`); name/label; covered/land area (as-entered unit + canonical); optional environment attributes (structure, growing method, medium, temperature, humidity, ventilation, irrigation linkage, cost, resource consumption) each with provenance; soft-delete; timestamps.

**production_area_type** — code; localized name; category (open | protected | experimental); enabled; extensible admin-curated catalog.

**field / crop_zone** — owning **production_area_id** (and denormalized farm_id); label; area; crop_id or free-text; **seed_variety_id** (optional); planting_date; growth_stage; expected_yield; is_experimental; **neighbour_field_ids[]** (optional); status; timestamps.

**crop_cycle** *(optional normalized)* — field_id; season; predicted/actual metrics; links to learning loop.

**water_source** — owning farm; type; availability; seasonal_availability; capacity_estimate; reliability; irrigation_method; fields/areas served[]; provenance; timestamps.

**twin_snapshot** — farm_id; structured twin JSON (production areas, weather, soil, water, fields, neighbour compatibility, seed variety recommendations, economics, **sustainability/green summary**, context_used); refreshed_at; provider statuses.

**plan** — farm_id; farmer_id; language; content JSON; context_used; version; timestamps. Full history retained.

**assistant_thread / message** — farm-scoped conversation history; role; content; citations/signals; timestamps.

**crop catalog** — id; localized names; icon; enabled; water/soil metadata as available.

**seed_variety** — id; crop_id; name_en; name_ur; variety_type; region_suitability[]; season_tags[]; soil_notes; water_notes; disease_resistance_notes; maturity_days; risk_band; optional environment suitability tags; enabled.

**crop_compatibility** — crop_a; crop_b; relation (good/avoid/neutral); reason; scope enum (`on_farm_neighbour` | `portfolio` | `nearby_region` | `general`).

**field_neighbour_edge** *(optional normalized)* — farm_id; field_a_id; field_b_id; adjacency_type; source.

**region_crop_stats** — region; crop; aggregated farm_count; updated_at (anonymized).

**government_crop_rate** — crop_id; unit; rate_amount; currency; effective_period; source_label; ingested_at.

**farm_sustainability / green_farm_score** — farm_id; overall_score; dimension scores (water, soil practices, diversity, input efficiency, resource usage, rotation, …); factor explanations; data_availability map; measured_vs_estimated flags; computed_at.

**farm_economic_snapshot** — farm_id; expected yield summary; reference gross value; currency; as_of; context.

**activity / season_outcome** — farm/field/production_area; predicted metrics; actual yield/cost/outcome; delta; reason; season_id.

**alert** — farmer/farm; type; message; severity; read; timestamps.

**admin_audit_log** — actor; action; target; timestamp; metadata.

### 4.2 Data provenance rules

Every soil, weather, water-capacity, rate, **protected-environment**, and **sustainability-input** value shown to the farmer shall carry one of:

| Provenance | Meaning |
|------------|---------|
| `farmer_provided` | Entered by the farmer |
| `third_party_estimate` | From external API / model estimate |
| `observed_measured` | From soil test, verified measurement, or future sensor |
| `system_derived` | Computed (e.g., season from date + lat; Green Farm Score aggregation) |
| `historical_reference` | Government or published historical rate |

UI and assistant shall not present third-party estimates as on-farm measurements.

### 4.3 Data-handling requirements

- Canonical farm land unit: acres; production areas may use additional units per C-008.
- Owner-scoped access on all farmer reads/writes.
- Soft-delete preferred.
- Aggregation-only for nearby/regional intelligence.
- Encryption in transit; encryption at rest for PII where platform supports it.
- Retention: define per entity in ops policy; farmer deletion request shall soft-delete/anonymize personal data within a documented SLA.

### 4.4 Example economic computation (normative behavior)

```text
Expected Yield × Government Reference Rate = Reference Gross Value
```

Displayed with labels: expected yield, previous government reference rate (period), reference gross value, risk band — never as a guaranteed return.

### 4.5 Green Farm Score presentation (normative behavior)

```text
Green Farm Score = explainable aggregate of available dimensions
  (e.g., Water Efficiency, Soil Health Practices, Crop Diversity,
   Input Efficiency, Resource Usage, Crop Rotation)
```

- Show factor contributions and improvement areas.
- Mark unavailable dimensions explicitly.
- Never label as certification.

---

## 5. Traceability matrix

| Req IDs | Module / capability | User class | Business goal | Priority | Phase | Verification |
|---------|---------------------|------------|---------------|----------|-------|--------------|
| FR-001, 017, 018, 044 | Auth & profile | Farmer | Low-friction access | Must | P0 | OTP E2E + security tests |
| FR-045–050, 003–006, 019–021, **109–114** | Farm Management & **Production Areas** | Farmer | Multi-environment farms | Must/Should | P0–P1 | Multi-area CRUD + unit tests |
| FR-051–055, **115–116** | Digital Twin (ecosystem) | Farmer | Living farm replica | Must | P0–P1 | Twin schema + aggregation tests |
| FR-029–032, 056–059, 007–010, 022–025, 099–107, **117** | Farm Twinning / multi-environment optimization | Farmer | Value + risk + sustainability balance | Must/Should | P0–P1 | Portfolio + neighbour + variety scenarios |
| FR-060–066, **118** | AI Farm Assistant (environment-aware) | Farmer | Twin-grounded advice | Must | P1 | Grounding + privacy + environment tests |
| FR-067–070 | Weather | Farmer | Dynamic decisions | Must | P0–P1 | Provider mock + alert cascade |
| FR-071–074 | Soil | Farmer | Realistic suitability | Must/Should | P0–P1 | Provenance labeling tests |
| FR-075–078 | Water | Farmer | Resource-realistic advice | Must | P1 | Constraint scenario tests |
| FR-011, 079–083 | Yield & economics | Farmer | Profitability decisions | Must/Should | P0–P1 | Rate × yield table tests |
| FR-033–035, 084–085, 108 | Nearby farms + neighbour crop signals | Farmer | Regional intelligence | Must/Should | P0–P1 | Anonymization + compatibility feed tests |
| FR-086–089, **119** | Experimental zone | Farmer | Controlled innovation | Must | P0–P1 | Model + workflow acceptance |
| FR-090–092 | Farm Learning | Farmer | Improving accuracy | Must/Should | P1–P2 | Predicted vs actual tests |
| FR-036–037, 093–095 | Alerts & continuous intel | Farmer | What to do next | Must/Should | P0–P1 | Scheduler + dashboard tests |
| FR-013–014, 026–028, 096, **120** | History, analytics, dashboard | Farmer | Continuity + multi-env view | Must/Should | P0–P1 | History + dashboard tests |
| FR-015–016 | Localization | All farmers | Usability | Must | P0 | RTL/Urdu device tests |
| FR-038–042, 097 | Admin | Admin | Operations & quality | Must/Should | P0–P1 | Authz + audit tests |
| FR-043, 098 | Parity | All farmers | Reach | Must | P0–P1 | Cross-platform suite |
| **FR-121–126** | **Protected farming** | Farmer | Controlled-environment ops | Must/Should | P0–P1 | Shed/GH/tunnel scenarios |
| **FR-127–133** | **Green Farm Intelligence** | Farmer | Sustainable decisions | Must/Should | P1 | Score explainability + no-cert tests |
| NFR-001–022 | Quality attributes + stack + no fabrication | All | Trust, cost, safety, ops | Must/Should | P0–P2 | SLO/security/load/stack review |
| EIR-001–010 | External interfaces | System | Integrations | Must/Should | P0–P1 | Contract + failure tests |

---

## 6. Production readiness & delivery phases

### 6.1 Definition of production-ready (document + system)

This SRS is **Production-Ready v1.3** (planning baseline) when:

1. Scope, modules, and differentiator are fully specified (this document).  
2. Requirements are testable, prioritized, and phased (P0/P1/P2).  
3. Data model, provenance, privacy, and security NFRs are explicit.  
4. Provider coupling is forbidden; adapters + graceful degradation are mandatory.  
5. Open decisions are closed with defaults (Appendix B) or marked as configuration, not ambiguity.  
6. Companion Dev Spec is scheduled for alignment to this SRS before P1 build freeze.  
7. **Production Area** model and Green Farm / Protected Farming gaps from readiness review are closed.

### 6.2 Phase delivery map

| Phase | Goal | Must include |
|-------|------|--------------|
| **P0 — Production MVP** | Demo-to-production core path | Auth; farm + **Production Area model** (default Open Field backward compatible); fields CRUD; twin summary with production-area aggregation hooks; weather enrichment; plan generation/display; on-farm neighbouring-field compatibility; save/history/dashboard; localization; mock/live OTP; admin auth shell; provenance labels; disclaimers; **model readiness for protected/experimental types (FR-109–111, 119, 126)** — rich protected/green UX not required in P0 |
| **P1 — Production complete** | Full Digital Twin platform | Twin scheduled refresh; water + soil; portfolio optimization **across environments**; seed varieties; neighbouring-farm compatibility; economics + rates; AI Farm Assistant (**environment-aware**); experimental workflow; learning loop; continuous recommendations; nearby insights; **Protected farming intelligence**; **Green Farm Intelligence + Score + recommendations**; dashboard production-environment + green breakdown; web/mobile parity; observability; backups |
| **P2 — Enhanced** | Depth | Rich Farm Intelligence History; accessibility upgrades; advanced cost modeling; optional offline twin cache; optional future sensor-fed protected attributes |

### 6.3 Production readiness checklist (engineering gate)

Before calling a release “production”:

- [ ] All P0 Must FRs/NFRs verified  
- [ ] Secrets not in clients; TLS everywhere  
- [ ] OTP rate limits + lockout tested  
- [ ] LLM/provider timeouts, retries, and cost caps verified  
- [ ] Urdu RTL + English regression on device and PDF (if enabled)  
- [ ] Privacy: no PII in aggregated nearby/regional APIs  
- [ ] Audit log for admin actions  
- [ ] Runbooks: incident, provider outage, LLM outage, data restore  
- [ ] Advisory disclaimers present on plans, economics, and assistant  
- [ ] Stack audit: ASP.NET Core API, EF Core migrations against SQL Server, CQRS command/query handlers, React functional components only  
- [ ] Production Area model: multi-type farms; default Open Field compatibility  
- [ ] Green Farm Score: explainable; no certification labeling; provenance preserved  
- [ ] Protected farming: environment-aware assistant tests (shed ≠ outdoor)  

---

## 7. Appendices

### Appendix A — Priority summary (production)

**Must (P0 core):** FR-001, 002, 003, 005, 007, 012, 013, 014, 015, 016, 017, 018, 019, 020, 023, 026, 027, 029, 030, 032, 035, 042, 044–049, 051, 052, 054, 055, 067, 068, 070, 072, 095, 098, 099, 103, **109–115, 119, 126**; NFR-001–009, 012, 014, 017, 019, 021; EIR-001–005, 007, 008, 010.

**Must (P1 complete platform):** FR-043, 050, 053, 056–058, 060–064, 066, 069, 071, 073, 075–077, 079–081, 083, 086–088, 090–091, 093–094, 096, 100, 104, 105, **116–118, 121–122, 124–125, 127, 129–133**; NFR-010, 011, 013, 015, 018, **022**; EIR-006, 009.

**Should:** FR-006, 008–011, 021, 022, 024, 025, 028, 031, 033, 034, 036–041, 059, 065, 074, 078, 082, 084, 085, 089, 097, 101, 102, 106, 107, 108, **120, 123, 128**; NFR-016, 020; EIR as tagged.

**Could:** FR-004; P2 items FR-092 and related.

### Appendix B — Closed decisions (production defaults)

| Topic | Production decision |
|-------|---------------------|
| Product name / positioning | HAPPY VEGGIE brand; product concept = **AI Farm Digital Twin / Intelligent Farm Twinning Platform** |
| **Tech stack** | **ASP.NET Core Web API** + **EF Core** + **CQRS** + **SQL Server**; **React** UIs with **functional components** only (§2.7) |
| CQRS | Commands for writes, Queries for reads; thin API controllers; MediatR (or equivalent) recommended |
| EF Core | Migrations as source of schema truth; SQL Server provider |
| React | Hooks-based functional components; no new class components; admin + farmer apps |
| Chatbot role | Interface only; twin + intelligence engine are the product |
| LLM provider | Configurable adapter; select at deploy time; bound tokens per endpoint |
| Weather / soil providers | Configurable free/low-cost APIs; never hard-coded vendor lock-in |
| SMS/OTP | Live provider for production; mock allowed in non-prod; identical contracts |
| Crop catalog | Curated catalog + free-text fallback; admin-curated; target seed ≥ 20–30 crops for Pakistan |
| Seed varieties | Admin-curated `seed_variety` per crop; suggestions ranked by region/season/soil/water; farmer may override or skip |
| Neighbour compatibility | On-farm neighbouring fields = Must (P0); neighbouring/nearby farm crops = anonymized aggregates only (P1 Should/Must per FR-101–103, 108) |
| Companion table | Deterministic DB table with optional `scope`; unknown pairs = neutral |
| Agronomy review | Disclaimer mandatory; sampled admin review (FR-040) for quality; expert review process optional ops policy |
| Web vs mobile | Shared backend; P0 mobile-first OK; **P1 full farmer parity** |
| Government rates | Historical reference only; admin-ingested; labeled in UI/assistant |
| Alerts | P0 on-load/derived; P1 persisted continuous evaluation |
| Nearby farms threshold | Below configurable minimum N farms in cohort → AI-only label (FR-034) |
| Admin auth | Separate from farmer OTP (e.g., email/password + MFA or SSO); role RBAC; full audit |
| IoT sensors | Out of scope v1.0; twin schema may reserve extension points / `observed_measured` for future protected-env sensors |
| Objective function | Maximize expected farm value balancing yield, profitability, risk, water, soil, resources, **and sustainability** (FR-058, FR-117) |
| Production Areas | First-class; P0 model + Open Field default; P1 rich protected + multi-env optimization |
| Protected farming | Extensible `ProductionAreaType`; attributes optional per area; provenance mandatory |
| Green Farm Score | Explainable product indicator only; **not** certification; compute from available data only |
| Green vs economics | Sustainability is a dimension; never sole override of suitability/season/environment/risk (FR-117, FR-133) |

### Appendix C — AI Farm Assistant example behavior (normative intent)

**Farmer:** “Should I irrigate Field 2 tomorrow?”

**Assistant (grounded):** Uses Field 2’s **production area**, crop + growth stage, soil moisture estimate (with provenance), forecast rain (or protected-area humidity if indoors), irrigation method, and water availability — e.g., recommend delaying irrigation if rain is forecast and moisture does not indicate immediate need; invite re-check after rainfall.

**Farmer:** “Does my cucumber field need irrigation today?” / “How is my shed cucumber crop performing?”

**Assistant (grounded):** Resolves the **shed** production area twin (not generic outdoor cucumber advice); uses shed attributes and available moisture/water/growth stage.

**Farmer:** “What seed variety should I plant in Field 1, and will it work next to my onions in Field 2?”

**Assistant (grounded):** Suggests region/season/environment-appropriate varieties from the catalog for Field 1’s crop, explains suitability vs soil/water, and reports neighbouring-field compatibility (good/avoid/neutral) with Field 2 onions using the compatibility table — without exposing any other farmer’s private data.

**Farmer:** “Why is my Green Farm Score low?” / “How can I reduce water usage?”

**Assistant (grounded):** Explains contributing score factors from available data, marks missing dimensions, and offers actionable recommendations labeled as data-driven / rule-based / AI / estimate — without certification claims.

### Appendix D — Relationship to companion documents

| Document | Role |
|----------|------|
| **This SRS v1.3** | Authoritative *what* for production (tech stack, Production Areas, Protected Farming, Green Farm Intelligence) |
| **PRD** | Personas and early problem framing; MoSCoW superseded by Section 6 phases |
| **Dev Spec** | *How*: screens, API payloads, edge cases — must be updated to match production areas, protected attributes, green score, twin/assistant models and .NET CQRS + React structure |

### Appendix E — Glossary (product)

- **Digitalize your farm** — create and maintain the Farm Digital Twin across production environments.  
- **Simulate your decisions** — portfolio and action recommendations before committing land/resources.  
- **Predict your yield** — yield and reference economic value with confidence and provenance.  
- **Optimize every acre** — multi-field / multi-environment allocation under water, soil, weather, risk, budget, and sustainability constraints.

### Appendix F — Skills checklist (hiring / staffing)

Use §2.8 as the staffing baseline. Minimum viable team skills coverage:

| Area | Must have on team |
|------|-------------------|
| Backend | ASP.NET Core, CQRS, EF Core |
| Data | SQL Server design + indexing |
| Frontend | React functional components, hooks, i18n/RTL |
| Shared | API security, Git/CI, basic observability |

### Appendix G — Remaining open decisions (v1.3)

Only items that cannot be fully closed from product intent alone:

| Topic | Notes |
|-------|-------|
| Canonical conversion rules for mixed units (acres vs sq ft) in farm-level totals | Dev Spec shall define aggregation display rules; C-008 requires storing both as-entered and canonical measures |
| Exact Green Farm Score weighting formula | Product may tune weights; SRS requires explainability, available-data-only, and no certification — formula is implementation/config |
| Minimum data thresholds per Green dimension before scoring | Configurable; below threshold → dimension unavailable (A8, NFR-022) |
| Default list of additional `ProductionAreaType` values beyond core set | Admin-extensible; core types are normative in FR-110 |

---

*End of SRS Production-Ready v1.3. Adds Production Areas, Protected/In-House Farming, environment-aware AI, Green Farm Intelligence & Score, and multi-environment optimization while preserving the v1.2 baseline.*

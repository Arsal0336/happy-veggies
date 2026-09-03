# HAPPY VEGGIE — Product Requirements Document (PRD)

| | |
|---|---|
| **Document** | Product Requirements Document |
| **Product** | HAPPY VEGGIE |
| **Audience** | Development team (build reference) |
| **Status** | Draft v0.1 |
| **Date** | 6 August 2026 |
| **Context** | AI Hackathon — ~1 week build |

---

## Revision history

| Version | Date | Author | Summary |
|---------|------|--------|---------|
| 0.1 | 2025-08-06 | BA session (draft) | Initial PRD from requirements gathering |

---

## Table of contents

1. Overview & problem statement
2. Goals & non-goals
3. Success metrics
4. Personas
5. Scope (MoSCoW)
6. User stories & use cases
7. Functional requirements
8. Non-functional requirements
9. Data & inputs
10. AI / LLM design notes
11. Assumptions & constraints
12. Risks & dependencies
13. Open questions
14. Glossary

---

## 1. Overview & problem statement

Farmers in Pakistan — including people new to farming — often lack tailored, region-aware guidance on what to grow and how to grow it well. Decisions about crop choice, timing, water, and inputs are frequently made without personalized, data-informed advice, which can lead to poor yields and wasted resources.

**HAPPY VEGGIE** is a multilingual (Urdu + English) web and mobile platform, mobile-first, that gives each farmer a **custom, AI-generated farming plan** based on their location and preferences. Farmers enter their details (region, GPS location, area, and preferred crop); the system returns recommended crops, a step-by-step farming calendar, a yield prediction, and input guidance. New farmers get a dedicated guided setup wizard to help them start a farm from scratch.

The intelligence is powered primarily by a Large Language Model (LLM), which reasons over the farmer's inputs to produce the plan.

## 2. Goals & non-goals

**Goals**
- Give any farmer a personalized crop plan in minutes from minimal input.
- Lower the barrier for new farmers through guided setup.
- Work in Urdu and English so it is usable across regions.
- Be usable on a phone, since most target farmers are on mobile.

**Non-goals (this version)**
- Not a marketplace, e-commerce, or produce-selling platform.
- Not a physics-based / agronomic simulation engine — the "simulation" is LLM-reasoned.
- Not a live IoT/sensor integration.
- Not offline-first (assumes connectivity for the AI call).
- Regional languages beyond Urdu/English are deferred.

## 3. Success metrics

- **Demo success:** A farmer completes onboarding and receives a coherent, region-appropriate custom crop plan end-to-end.
- **Time-to-plan:** From first input to plan displayed in under ~60 seconds.
- **Completion:** A new user can finish the setup wizard without external help.
- **Language:** Core flow fully functional in both Urdu and English.

*(Hackathon metrics are demo-oriented; production KPIs like retention are out of scope for now.)*

## 4. Personas

**P1 — Established Farmer ("Karim")**
Already farms land; wants to optimize crop choice, timing, and inputs for his region and preferred produce.

**P2 — New Farmer ("Ayesha")**
Owns or has access to land but is new to farming; needs step-by-step guidance to set up a farm (soil, budget, water access) before getting a plan.

**P3 (downstream) — Consumer**
Noted as an eventual beneficiary of better/more produce; not a direct user in this version.

## 5. Scope (MoSCoW)

**Must (demo-critical path)**
- Phone OTP signup/login.
- Input capture: GPS auto-detect location, region, area covered, preferred vegetable/fruit.
- **Custom crop plan generation** (the core demo output).
- Save & revisit a farmer's farm and plan.
- Urdu + English UI for the core flow.
- Mobile-first experience.

**Should**
- Step-by-step farming plan & calendar output.
- New-farmer guided setup wizard (soil, budget, water access).
- Water, fertilizer & input guidance output.

**Could**
- Yield / harvest prediction output.
- Manual location entry as GPS fallback.
- Web version at parity with mobile.

**Won't (this time)**
- Regional languages beyond Urdu/English.
- Marketplace, payments, IoT/sensors, offline mode.

## 6. User stories & use cases

**US-001: Phone signup — Must**
As a farmer, I want to sign up with my phone number and an OTP so that I can securely access the app without a complex account.
- Given a valid phone number, when the farmer requests a code, then an OTP is sent and, when entered correctly, the farmer is authenticated.

**US-002: Enter farm details — Must**
As a farmer, I want to enter my region, location, area, and preferred crop so that the app can tailor advice to me.
- Given a signed-in farmer, when they allow GPS, then latitude/longitude are auto-detected and stored with the farm record.

**US-003: Get a custom crop plan — Must**
As a farmer, I want a personalized crop plan based on my inputs so that I know what to grow and how.
- Given complete farm inputs, when the farmer requests a plan, then the system returns a region- and season-appropriate custom plan within ~60 seconds.

**US-004: Save & revisit — Must**
As a farmer, I want my farm and plan saved so that I can return to them later.
- Given a generated plan, when the farmer returns, then their saved farm(s) and plan(s) are retrievable.

**US-005: New-farmer setup wizard — Should**
As a new farmer, I want a guided wizard covering soil, budget, and water access so that I can set up a farm from scratch.
- Given a first-time farmer, when they choose "new farm," then a step-by-step wizard collects setup details before generating a plan.

**US-006: Farming calendar — Should**
As a farmer, I want a step-by-step plan and calendar so that I know what to do and when.

**US-007: Input guidance — Should**
As a farmer, I want water and fertilizer guidance so that I use resources efficiently.

**US-008: Yield prediction — Could**
As a farmer, I want an estimated yield so that I can plan ahead.

**US-009: Language toggle — Must**
As a farmer, I want to use the app in Urdu or English so that I can understand it.

## 7. Functional requirements

**Authentication**
- **FR-001 (Must):** The system authenticates farmers via phone number + OTP.
- **FR-002 (Must):** The system associates all farm records and plans with the authenticated farmer.

**Onboarding & input capture**
- **FR-003 (Must):** The system auto-detects the farmer's location via GPS and stores latitude/longitude.
- **FR-004 (Could):** The system allows manual location entry as a fallback when GPS is unavailable.
- **FR-005 (Must):** The system captures region, area covered, and preferred vegetable/fruit.
- **FR-006 (Should):** For new farmers, the system presents a guided setup wizard capturing soil, budget, and water access.

**Plan generation (core)**
- **FR-007 (Must):** The system generates a custom crop plan from the farmer's inputs using an LLM.
- **FR-008 (Should):** The plan includes recommended crops appropriate to the farmer's region and season.
- **FR-009 (Should):** The plan includes a step-by-step farming plan and calendar.
- **FR-010 (Should):** The plan includes water, fertilizer, and input guidance.
- **FR-011 (Could):** The plan includes a yield/harvest prediction.
- **FR-012 (Must):** The system displays the generated plan in the farmer's selected language.

**Persistence**
- **FR-013 (Must):** The system saves each farmer's farm profile(s) and generated plan(s).
- **FR-014 (Must):** The system lets a farmer retrieve and revisit saved farms and plans.

**Localization**
- **FR-015 (Must):** The system provides the full core flow in Urdu and English.
- **FR-016 (Must):** The farmer can switch language, and the choice persists across sessions.

## 8. Non-functional requirements

- **NFR-001 (Performance):** A crop plan is generated and displayed within ~60 seconds of the request under normal conditions.
- **NFR-002 (Platform):** The interface is mobile-first and usable on common low-to-mid-range Android phones; layouts are responsive.
- **NFR-003 (Usability):** A new farmer can complete onboarding and reach a plan without external assistance.
- **NFR-004 (Localization):** All core-flow UI strings and generated plan content render correctly in Urdu (RTL-aware text) and English.
- **NFR-005 (Reliability):** If the LLM call fails or times out, the system shows a clear retry option rather than an error dead-end.
- **NFR-006 (Security/Privacy):** Phone numbers and location data are stored securely and used only to generate and save plans.
- **NFR-007 (Cost):** LLM usage is designed to keep per-plan cost reasonable for a demo (e.g., bounded prompt/response size).

## 9. Data & inputs

**Farmer inputs per farm**
- Phone number (identity)
- Region
- Location: latitude, longitude (GPS auto-detected)
- Area covered
- Preferred vegetable/fruit
- New-farmer additions: soil type, budget, water access

**Generated/stored outputs**
- Custom crop plan (recommended crops, calendar, input guidance, optional yield estimate)
- Language preference

## 10. AI / LLM design notes

- The plan is produced by prompting an LLM with the farmer's structured inputs.
- Recommend a structured prompt that returns sections mapping to FR-008 through FR-011 so the UI can render them consistently (consider requesting JSON for reliable parsing).
- Region + season awareness should be conveyed to the model explicitly (e.g., derive current season from date + location).
- Because output is AI-generated, include a light disclaimer that guidance is advisory.

## 11. Assumptions & constraints

- **A1:** Farmers have a smartphone with GPS and connectivity at time of use.
- **A2:** An LLM API is available and within budget for the hackathon.
- **A3:** Urdu + English cover the target demo regions.
- **A4:** ~1 week, small team — scope is intentionally lean.
- **Constraint:** Mobile-first; web is secondary this cycle.

## 12. Risks & dependencies

| Risk | Impact | Mitigation |
|------|--------|------------|
| LLM produces generic or inaccurate advice | Weak demo credibility | Constrain prompt, add region/season context, disclaimer |
| Urdu rendering / RTL issues | Broken core requirement | Test localization early on real device |
| GPS permission denied | Blocks input capture | Add manual fallback (FR-004) |
| LLM latency/cost spikes | Slow or costly demo | Bound tokens, cache, add retry (NFR-005) |
| OTP delivery via SMS provider | Login blocked | Use a reliable provider; have a test bypass for demo |

**Dependencies:** LLM API, SMS/OTP provider, map/geolocation service.

## 13. Open questions

- `[OPEN]` Which specific LLM/provider and what is the token/cost budget per plan?
- `[OPEN]` Which SMS/OTP provider for Pakistan numbers?
- `[OPEN]` Exact list of supported crops for the MVP, or fully open-ended?
- `[OPEN]` Do we need agronomy-expert review of AI output for the demo, or is the disclaimer sufficient?
- `[OPEN]` Web platform: parity target for this cycle, or explicitly post-hackathon?

## 14. Glossary

- **LLM** — Large Language Model; the AI reasoning engine that generates plans.
- **OTP** — One-Time Password; a code sent to the farmer's phone for login.
- **MVP** — Minimum Viable Product; the smallest build that demonstrates core value.
- **MoSCoW** — Prioritization scheme: Must / Should / Could / Won't-this-time.
- **RTL** — Right-to-left text direction (relevant for Urdu).
- **PRD** — Product Requirements Document.

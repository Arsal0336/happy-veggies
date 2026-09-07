# HAPPY VEGGIE — Developer Design Specification

| | |
|---|---|
| **Document** | Developer Design Specification (detailed) |
| **Product** | HAPPY VEGGIE |
| **Audience** | Development team |
| **Status** | Draft — in progress |
| **Date** | 6 August 2026 |
| **Companion doc** | HAPPY-VEGGIE-PRD.md (requirements & scope) |

> This document expands each scenario from the PRD into buildable detail: user flow, screens and their states, data captured, API contracts, validation, and edge cases. It is being written scenario by scenario.

---

## Conventions used in this doc

- **Screens** are named `S-x.y` (scenario x, screen y).
- **API endpoints** are illustrative REST contracts; adapt to your stack.
- **States** covered per screen: default, loading, empty, error, success.
- Request/response bodies are JSON.
- Priorities carry over from the PRD (Must / Should / Could).
- All timestamps are ISO 8601 UTC unless noted.

---

## Global decisions (apply across scenarios)

- **Auth model:** Single unified passwordless phone-OTP entry. The phone number is the identity. After OTP verification, the backend decides new vs. returning — no separate signup/login screens.
- **Language-first:** Language is selected on the very first screen so the entire UI renders in the farmer's language from the start. Supported: Urdu (`ur`, RTL) and English (`en`, LTR).
- **Demo OTP:** For the hackathon, OTP is mocked (fixed code, e.g. `1234`) behind a config flag `OTP_MODE=mock`. Real SMS provider integration is gated behind `OTP_MODE=live` and added only if time allows. Keep the API contract identical for both modes so no client changes are needed to switch.
- **IDs:** Server-generated UUIDs for `farmer_id`, `farm_id`, `plan_id`.

---

## Scenario 1 — Phone OTP Signup / Login

**Related requirements:** FR-001, FR-002, US-001, US-009 (language), NFR-006 (security).

### 1.1 Goal

Let a farmer authenticate with only a phone number and an OTP, choosing their language first, and collect name + preferred language for first-time users — all in one adaptive flow.

### 1.2 Flow (happy path)

1. Farmer opens the app → **Language screen (S-1.1)**. Picks Urdu or English.
2. **Phone entry (S-1.2)**. Enters phone number → requests code.
3. Backend generates/sends OTP (mock or live) → **OTP verify (S-1.3)**.
4. Farmer enters code → backend verifies.
5. Backend checks if the phone already exists:
   - **Returning farmer** → issue session → go to **Dashboard** (Scenario 6).
   - **New farmer** → **Profile setup (S-1.4)** to collect name (language already chosen) → issue session → continue to **Onboarding** (Scenario 2).

### 1.3 Screens

**S-1.1 — Language selection**
- Two large tappable options: اردو (Urdu) and English. Icons/flags optional.
- Selection sets app locale immediately (affects text direction: Urdu = RTL).
- Persist choice locally so returning users skip re-picking (but allow change later in settings).
- States: default only. No network call.

**S-1.2 — Phone entry**
- Country code fixed/defaulted to +92 (Pakistan); show the +92 prefix.
- Single numeric input for the local number.
- Primary button: "Send code" / "کوڈ بھیجیں".
- Validation (client): must be a plausible Pakistani mobile number (see 1.5).
- States:
  - *default*: button enabled when input non-empty.
  - *loading*: button shows spinner after tap, input locked.
  - *error*: inline message for invalid number or send failure, with retry.

**S-1.3 — OTP verify**
- Shows the number being verified with an "edit" affordance to go back.
- OTP input (4–6 digits; pick one length and keep consistent — recommend 4 for demo).
- "Verify" button; "Resend code" with a cooldown timer (e.g., 30s).
- In `OTP_MODE=mock`, display a small "Demo mode: use 1234" hint (behind a debug flag, hidden in a real build).
- States:
  - *default*: verify disabled until code length met.
  - *loading*: verifying.
  - *error*: wrong/expired code → inline error, allow retry; after N failures (e.g., 5) → temporary lockout message.
  - *success*: proceed.

**S-1.4 — Profile setup (new farmers only)**
- Name input (required). Language pre-filled from S-1.1 (editable).
- "Continue" → creates the farmer record, then proceeds to onboarding.
- States: default, loading (creating account), error (save failed → retry).

### 1.4 API contracts

**Request OTP**
```
POST /auth/otp/request
{ "phone": "+923001234567", "language": "ur" }
→ 200 { "request_id": "uuid", "expires_in": 300, "mode": "mock" }
→ 400 { "error": "invalid_phone" }
→ 429 { "error": "rate_limited", "retry_after": 30 }
```

**Verify OTP**
```
POST /auth/otp/verify
{ "request_id": "uuid", "phone": "+923001234567", "code": "1234" }
→ 200 {
    "session_token": "jwt...",
    "farmer": { "id": "uuid", "phone": "...", "name": null, "language": "ur" },
    "is_new": true
  }
→ 401 { "error": "invalid_code" }
→ 410 { "error": "code_expired" }
→ 423 { "error": "locked_out", "retry_after": 300 }
```

**Complete new profile** (only when `is_new: true`)
```
POST /farmers/me/profile      (Authorization: Bearer <session_token>)
{ "name": "Ahmed", "language": "ur" }
→ 200 { "farmer": { "id": "uuid", "name": "Ahmed", "language": "ur" } }
```

### 1.5 Validation rules

- **Phone:** Normalize to E.164 (`+92XXXXXXXXXX`). Accept common local formats (`03001234567`, `3001234567`, `+923001234567`) and normalize server-side. Pakistani mobile numbers: `+92` + 10 digits starting with `3`.
- **OTP:** exactly the configured length, numeric.
- **Name:** 1–60 chars, trimmed, not empty.
- **Language:** enum `["ur", "en"]`.

### 1.6 Data model (farmer)

```
farmer {
  id: uuid (pk)
  phone: string (E.164, unique)
  name: string | null
  language: enum('ur','en')
  created_at: timestamp
  updated_at: timestamp
}
```

### 1.7 Edge cases

- **Resend spam:** enforce cooldown + per-number rate limit (429).
- **Expired code:** distinct error from wrong code so the UI can prompt resend.
- **Brute force:** lock after N wrong attempts per request_id; surface `retry_after`.
- **Number changed mid-flow:** editing the phone on S-1.3 invalidates the current request_id.
- **New user abandons at S-1.4:** decide whether a farmer record exists yet. Recommendation: create the farmer record only on profile completion (verify step returns an authenticated but "incomplete" session); an incomplete profile routes back to S-1.4 on next open.
- **Language change later:** available in settings; updates `farmer.language` and re-renders (including RTL/LTR switch).
- **Mock vs live parity:** identical request/response shape; only the OTP source differs.

### 1.8 Acceptance criteria

- A first-time farmer can pick a language, verify via OTP (mock code), enter a name, and land in onboarding with an authenticated session.
- A returning farmer with the same phone skips profile setup and lands on the dashboard.
- Wrong and expired codes produce distinct, localized error messages.
- The entire flow renders correctly in Urdu (RTL) and English (LTR).

---

## Scenario 2 — Onboarding & Input Capture (existing farmer)

**Related requirements:** FR-003, FR-004, FR-005, US-002, NFR-002 (mobile), NFR-003 (usability).

### 2.1 Goal

Collect the four inputs needed to generate a plan — location (lat/long via GPS), region, area covered, and preferred vegetable/fruit — through a short, friendly multi-step wizard that saves progress and validates each step.

### 2.2 Design decisions

- **Multi-step wizard**, one input per step, with a progress indicator (e.g., "Step 2 of 4"), back navigation, and preserved state when navigating back.
- **Area unit:** farmer picks from a dropdown — **acre**, **kanal**, **marla**. Store canonically in **acres**; convert on input (1 acre = 8 kanal = 160 marla). Display back in the farmer's chosen unit.
- **Crop selection:** searchable list with icons, sourced from a preset crop catalog (see 2.6). Supports typing to filter; each item has a localized name (Urdu/English) and an icon.
- **Region:** GPS suggests the region (reverse-geocoded from lat/long), farmer confirms or overrides by picking from a list. Region and lat/long are stored separately.

### 2.3 Flow

1. Entry point: after auth (new farmer) or "New farm" action (returning farmer).
2. **S-2.1 Location** → request GPS permission, capture lat/long.
3. **S-2.2 Region confirm** → show GPS-suggested region, let farmer confirm/change.
4. **S-2.3 Area** → number + unit dropdown.
5. **S-2.4 Preferred crop** → searchable icon list.
6. **S-2.5 Review** (optional but recommended) → summary of all four; "Generate plan" proceeds to Scenario 4.

### 2.4 Screens

**S-2.1 — Location capture**
- Explains why location is needed (one line), then a "Use my location" button that triggers the OS GPS permission prompt.
- On grant: capture lat/long, show a small confirmation (e.g., a pin on a mini-map or the coordinates/area name).
- On deny: fall back to **manual location** (FR-004) — let the farmer drop a pin on a map or search a place name. (Could-priority; if deferred, show a clear message and allow region-only selection.)
- States: default, requesting-permission, loading (acquiring fix), success (coords captured), error (permission denied → manual fallback; GPS unavailable → retry/manual).

**S-2.2 — Region confirm**
- Shows the reverse-geocoded region as a pre-selected value.
- "Confirm" or "Change" → opens a searchable region list (province/district level; keep the list scoped to Pakistan).
- States: default (suggestion shown), loading (reverse-geocoding), error (geocode failed → farmer picks manually), success.

**S-2.3 — Area covered**
- Numeric input + unit dropdown (acre / kanal / marla), default acre.
- Live helper showing the converted value in acres if a non-acre unit is chosen (optional, aids trust).
- Validation: > 0, reasonable upper bound (e.g., ≤ 10,000 acres) to catch typos.
- States: default, error (non-numeric / out of range).

**S-2.4 — Preferred crop**
- Search box filters a catalog list; each row = icon + localized name.
- Single-select for MVP (one preferred crop per farm). Note: multi-select is a possible future extension.
- States: default (full list), searching (filtered), empty (no match → "not found, suggest general plan?" or free-text fallback), success (selected).

**S-2.5 — Review & generate**
- Read-only summary of location/region/area/crop with edit links back to each step.
- Primary button "Generate plan" → Scenario 4.

### 2.5 API contracts

**Reverse geocode (region suggestion)**
```
GET /geo/reverse?lat=..&lng=..
→ 200 { "region": "Sindh — Hyderabad", "region_code": "SD-HYD", "confidence": 0.9 }
→ 200 { "region": null }   // couldn't resolve; client asks farmer to pick
```

**Crop catalog**
```
GET /crops?lang=ur&q=tom
→ 200 { "crops": [
     { "id": "tomato", "name": "ٹماٹر", "name_en": "Tomato", "icon": "url" },
     ...
   ]}
```

**Create/update farm (draft as wizard progresses, or all at once at review)**
```
POST /farms                (Authorization: Bearer <token>)
{
  "lat": 25.396, "lng": 68.377,
  "region_code": "SD-HYD",
  "area_acres": 2.5,
  "area_input": { "value": 20, "unit": "kanal" },
  "preferred_crop_id": "tomato"
}
→ 201 { "farm": { "id": "uuid", ... } }
```

### 2.6 Crop catalog

- A seed list of common Pakistani vegetables/fruits with `id`, English name, Urdu name, and icon.
- **[OPEN]** Confirm the exact catalog (see PRD open questions). For the demo, a curated ~20–30 item list is enough. If a farmer's crop isn't listed, offer a free-text fallback that still feeds the LLM.

### 2.7 Data model (farm)

```
farm {
  id: uuid (pk)
  farmer_id: uuid (fk → farmer)
  lat: number
  lng: number
  region_code: string
  region_label: string
  area_acres: number          // canonical
  area_input_value: number    // as entered
  area_input_unit: enum('acre','kanal','marla')
  preferred_crop_id: string
  preferred_crop_freetext: string | null
  is_new_farm_setup: boolean  // true if created via Scenario 3 wizard
  created_at, updated_at
}
```

### 2.8 Edge cases

- **GPS denied / unavailable:** fall back to manual pin or region-only; never dead-end.
- **Reverse geocode fails or low confidence:** show the list and let the farmer pick; don't block.
- **Unit conversion:** always store `area_acres`; round sensibly (e.g., 3 decimals) to avoid float noise.
- **Crop not in catalog:** free-text fallback captured in `preferred_crop_freetext`.
- **Back navigation:** entered values persist; editing region after moving on updates cleanly.
- **Low connectivity:** wizard steps that need network (geocode, catalog) should have loading + retry; consider caching the crop catalog on the client.
- **RTL:** the whole wizard, including the unit dropdown and search, must render correctly in Urdu.

### 2.9 Acceptance criteria

- A farmer can grant GPS, confirm a suggested region, enter area in kanal (stored as acres), pick a crop from the searchable list, review, and reach plan generation.
- Denying GPS still lets the farmer complete onboarding via manual/region selection.
- All four inputs are persisted on a `farm` record tied to the farmer.
- The wizard works end-to-end in both Urdu (RTL) and English.

---

## Scenario 3 — New-Farmer Guided Setup Wizard

**Related requirements:** FR-006, US-005, NFR-003 (usability). Builds on Scenario 2 inputs.

### 3.1 Goal

Guide someone who does not yet have a farm through setting one up, in a warmer, more educational flow than the standard onboarding. Collect everything Scenario 2 does (location, region, area, crop) plus soil, budget, and water access — with teaching, tips, and forgiving defaults at every step. New farmers may not know their soil or even which crop they want, so the flow must let the AI fill those gaps.

### 3.2 Design decisions

- **Distinct, educational flow** (not the same screens as Scenario 2). Same underlying data is collected, but each step includes a short plain-language explainer and encouragement. Framing intro: "Let's set up your farm together."
- **Soil type:** picture-based list of 4–5 common types (sandy, clay, loam, silt, mixed/other), each with a photo and one-line description — plus a prominent, no-shame **"I'm not sure"** option. If unknown, the AI infers likely soil from region/lat-long or produces a soil-robust plan. Soil is never a hard blocker.
- **Budget:** amount + currency (default PKR). Numeric amount with a currency selector (PKR default; keep others out of scope unless needed).
- **Water access:** Yes/No primary. If **Yes**, an optional follow-up captures source (canal / tube well / rain-fed / other) because source changes irrigation advice. "No" path stays a single tap.
- **Crop for new farmers:** the crop step offers "Help me choose" that defers selection to the AI (sets a flag rather than a specific crop).

### 3.3 Flow

1. Entry point: farmer chooses "I'm new / help me start a farm" (offered at first run or from the dashboard).
2. **S-3.0 Intro** — encouraging framing, sets expectations.
3. **S-3.1 Location** — same capture as S-2.1, with extra explainer.
4. **S-3.2 Region confirm** — as S-2.2.
5. **S-3.3 Area** — as S-2.3, with a tip on typical starter plot sizes.
6. **S-3.4 Soil type** — picture list + "I'm not sure".
7. **S-3.5 Water access** — Yes/No, optional source follow-up.
8. **S-3.6 Budget** — amount + currency, with guidance on what budget covers.
9. **S-3.7 Preferred crop** — searchable list *or* "Help me choose" (AI decides).
10. **S-3.8 Review & generate** — summary; "Generate my farm plan" → Scenario 4.

### 3.4 Screens (new/different vs. Scenario 2)

**S-3.0 — Intro / framing**
- Friendly headline + 2–3 bullets on what happens next and that no prior knowledge is needed.
- "Let's start" button.

**S-3.4 — Soil type**
- Grid of soil cards: image + name + one-line description (localized).
- Prominent secondary option: "I'm not sure — that's okay". Selecting it sets `soil_type = 'unknown'`.
- States: default, success. No hard validation (a choice, including "unknown", is always valid).

**S-3.5 — Water access**
- Primary: "Do you have access to water?" Yes / No.
- If Yes → reveal optional source chooser (canal / tube well / rain-fed / other). Skippable.
- States: default, branched (source shown), success.

**S-3.6 — Budget**
- Numeric amount + currency selector (PKR default).
- Helper text: what the budget is expected to cover (seeds, inputs, etc.).
- Validation: amount ≥ 0; allow "prefer not to say"/skip → `budget = null`.
- States: default, error (invalid number), success.

**S-3.7 — Preferred crop (new-farmer variant)**
- Same searchable icon list as S-2.4, plus a prominent "Help me choose" that sets `let_ai_choose_crop = true` and skips manual selection.

*(S-3.1, S-3.2, S-3.3, S-3.8 mirror the Scenario 2 equivalents with added educational copy.)*

### 3.5 API contract (extends the farm create)

```
POST /farms
{
  "lat": .., "lng": .., "region_code": "..",
  "area_acres": .., "area_input": { "value": .., "unit": ".." },
  "preferred_crop_id": "tomato" | null,
  "let_ai_choose_crop": false,
  "is_new_farm_setup": true,
  "soil_type": "loam" | "unknown",
  "water_access": true,
  "water_source": "tube_well" | null,
  "budget": { "amount": 50000, "currency": "PKR" } | null
}
→ 201 { "farm": { "id": "uuid", ... } }
```

### 3.6 Data model additions (farm)

```
farm (additional fields for new-farm setup) {
  soil_type: enum('sandy','clay','loam','silt','mixed','unknown') | null
  water_access: boolean | null
  water_source: enum('canal','tube_well','rain_fed','other') | null
  budget_amount: number | null
  budget_currency: string | null    // default 'PKR'
  let_ai_choose_crop: boolean
}
```

### 3.7 Edge cases

- **Unknown soil:** `soil_type = 'unknown'` → AI infers or produces a soil-robust plan; never blocks.
- **No water:** valid and important input; the plan must adapt (drought-tolerant crops, rain-fed guidance).
- **Skipped budget:** `budget = null`; AI gives general guidance without cost tailoring.
- **"Help me choose" crop:** `let_ai_choose_crop = true`; plan generation recommends crops rather than assuming one.
- **Farmer is actually experienced:** they can exit the educational flow into standard onboarding at any time (offer a "skip the guidance" link).
- **RTL + imagery:** soil cards and all copy render correctly in Urdu.

### 3.8 Acceptance criteria

- A brand-new farmer can complete the educational wizard, including choosing "I'm not sure" for soil and "Help me choose" for crop, and reach plan generation.
- Water = No and budget skipped both produce a valid farm record and a plan that adapts.
- All new fields persist on the `farm` record with `is_new_farm_setup = true`.
- The flow is fully localized (Urdu RTL / English).

---

## Scenario 4 — Custom Crop Plan Generation (the LLM call)

**Related requirements:** FR-007 (core), FR-008, FR-009, FR-010, FR-011, FR-012, NFR-001 (performance), NFR-005 (reliability), NFR-007 (cost). This is the demo-critical Must.

### 4.1 Goal

Turn a farmer's `farm` record into a structured, localized crop plan using an LLM, optionally enriched with weather and soil/agri data, returned as JSON the client renders into clean sections.

### 4.2 Design decisions

- **Output format:** the LLM returns **structured JSON** with defined sections (recommended crops, calendar, input guidance, yield). The client renders each section into UI — never shows raw JSON.
- **Language:** the LLM **generates directly in the farmer's selected language** (Urdu or English). No separate translation step. The prompt states the target language explicitly.
- **Generation UX:** a **loading animation** while the plan is produced (target ~60s, NFR-001). No streaming for MVP — show the full plan when ready.
- **External data — graceful degradation:** a **context-assembly** step fetches weather (and soil/agri data where available) and injects it into the prompt. If a feed is slow or unavailable, generation proceeds on LLM knowledge + farmer inputs. Feeds are enrichment, never a blocker for the Must path. Gate live feeds behind flags (`ENRICH_WEATHER`, `ENRICH_SOIL`).

### 4.3 Generation pipeline (server-side)

1. **Load farm** by `farm_id` (auth-scoped to the farmer).
2. **Assemble context:**
   - Derive current **season** from date + latitude (e.g., Rabi/Kharif for Pakistan).
   - If `ENRICH_WEATHER`: fetch forecast/climate summary for lat/long (timeout ~3–5s; on failure, skip).
   - If `ENRICH_SOIL`: fetch soil/agri data for the location or use `soil_type`; on failure, skip or rely on farmer-provided soil.
3. **Build prompt** (see 4.4) with farmer inputs + assembled context + target language + strict JSON instruction.
4. **Call LLM**, request JSON output.
5. **Validate & parse** JSON against the schema (4.5). On malformed output, one retry with a "return valid JSON only" reminder; if still bad, return a graceful error (NFR-005).
6. **Persist** the plan (Scenario 6) and return it.

### 4.4 Prompt design (guidance, not final copy)

- **System role:** an agricultural advisor for farmers in Pakistan; give practical, region- and season-appropriate advice; be honest about uncertainty; output strictly valid JSON in the schema provided; write all human-readable text in `{language}`.
- **Inputs block:** region, lat/long, area (in acres), preferred crop or "let AI choose", soil type (or unknown), water access/source, budget (or none), and — for new farmers — note the educational context.
- **Context block:** season, weather summary (if available), soil/agri data (if available).
- **Instructions:** map output to sections FR-008–FR-011; keep guidance actionable; include a short advisory disclaimer field; bound length to control cost (NFR-007).
- **Reliability:** instruct "respond with JSON only, no prose, no markdown fences." Parse defensively (strip fences if present).

### 4.5 Plan JSON schema

```json
{
  "plan_version": "1.0",
  "language": "ur",
  "generated_at": "ISO-8601",
  "context_used": {
    "season": "Rabi",
    "weather": true,
    "soil_data": false
  },
  "recommended_crops": [
    {
      "crop_id": "tomato",
      "name": "ٹماٹر",
      "why": "short rationale, localized",
      "suitability": "high | medium | low"
    }
  ],
  "calendar": [
    {
      "stage": "Land preparation",
      "timing": "Week 1",
      "actions": ["localized action", "..."]
    }
  ],
  "input_guidance": {
    "water": "localized guidance",
    "fertilizer": "localized guidance",
    "other_inputs": ["seed rate", "pest notes", "..."]
  },
  "yield_prediction": {
    "estimate": "e.g., 20–25 tons/acre",
    "confidence": "low | medium | high",
    "assumptions": ["localized assumption", "..."]
  },
  "disclaimer": "AI-generated advice; verify locally."
}
```

- `recommended_crops` (FR-008), `calendar` (FR-009), `input_guidance` (FR-010) are Should; `yield_prediction` (FR-011) is Could — the client renders whichever sections are present, so a lean demo can omit yield.
- If `let_ai_choose_crop = true`, `recommended_crops` drives the plan; otherwise the plan centers on `preferred_crop_id`.

### 4.6 API contract

```
POST /farms/{farm_id}/plan        (Authorization: Bearer <token>)
{ }   // farm data loaded server-side; body may carry overrides
→ 200 { "plan": { ...schema above... }, "plan_id": "uuid" }
→ 422 { "error": "generation_failed", "retryable": true }
→ 504 { "error": "timeout", "retryable": true }
```

### 4.7 Screens

**S-4.1 — Generating (loading)**
- Full-screen friendly animation + rotating reassurance messages (localized), e.g., "Checking your region's season…", "Preparing your plan…". Keep messages generic and calm.
- Timeout handling: if generation exceeds a ceiling (e.g., 90s), show a retry option rather than hanging (NFR-005).
- States: loading, error (retryable → "Try again"; show a clear message, never a dead-end), success → navigate to plan view (Scenario 5).

### 4.8 Edge cases

- **LLM returns invalid JSON:** one automatic retry with a stricter instruction; then graceful error.
- **Feed timeout/failure:** proceed without that context; set the corresponding `context_used` flag to false so the plan is honest about what it used.
- **No preferred crop (AI choose):** plan recommends crops; UI leads with `recommended_crops`.
- **Unknown soil / no water / no budget:** plan adapts; never blocks (see Scenario 3).
- **Cost control:** bound max tokens; cache identical (farm + season) requests during the demo to avoid repeat spend.
- **Latency:** run enrichment fetches in parallel with short timeouts; do not serialize slow calls.
- **Language integrity:** all human-readable strings in the plan must be in the selected language; `crop_id`/enums stay stable machine values.

### 4.9 Acceptance criteria

- Given a complete `farm`, the system returns a valid, schema-conformant plan in the farmer's language within the performance target, and persists it.
- If weather/soil feeds fail, a plan is still produced and `context_used` reflects what was actually used.
- Malformed LLM output is retried once, then surfaces a retryable error rather than crashing.
- The plan renders section-by-section with no raw JSON visible to the farmer.

---

## Scenario 5 — Plan Display, Language Handling & Sharing

**Related requirements:** FR-012, FR-015, FR-016, US-006/007/008 (rendered outputs), NFR-004 (localization/RTL). Adds share/export (PDF, WhatsApp) as Should/Could enhancements.

### 5.1 Goal

Render the generated plan JSON into a clean, farmer-friendly screen; handle Urdu (RTL) and English (LTR) correctly; let the farmer switch app language sensibly after generation; and allow sharing (WhatsApp/text) and export (PDF / print-friendly view).

### 5.2 Design decisions

- **Layout:** **card-based, expandable sections** on one scrollable page. One card per plan section (recommended crops, calendar, input guidance, yield). The primary card (crops, or calendar when a crop is fixed) is expanded by default; others start collapsed. Cards for absent JSON sections simply don't render.
- **Post-generation language switch:** switching app language flips **UI chrome instantly**; the plan text does **not** auto-translate. Instead the plan shows a gentle prompt — "This plan is in Urdu. Regenerate in English?" — so the farmer controls whether to spend a regeneration. (Storing both languages is a future optimization, not MVP.)
- **Share & export:** provide (a) **share as text** to WhatsApp/messaging, and (b) **PDF / print-friendly view**. Both derive from the same plan data; the PDF view doubles as the printable version.

### 5.3 Screens

**S-5.1 — Plan view**
- Header: crop/plan title, region, season, generated date, language indicator.
- Section cards (render only if present in JSON):
  - **Recommended crops** — list with suitability badge + short rationale.
  - **Calendar** — ordered stages with timing and actions.
  - **Input guidance** — water, fertilizer, other inputs.
  - **Yield prediction** — estimate + confidence + assumptions.
  - **Disclaimer** — always shown, subtle.
- Actions: Save (Scenario 6), Share, Export PDF / Print, Regenerate.
- States:
  - *default*: cards rendered from JSON.
  - *language-mismatch*: banner offering regeneration in the current app language.
  - *empty section*: not shown (no placeholder).
  - *stale/needs-refresh*: if inputs changed, offer regenerate.

**S-5.2 — PDF / print view**
- Stacked, print-optimized rendering of all sections (no collapsed cards).
- Header with product name, farmer name (optional), region, date.
- Generated client- or server-side; must render Urdu correctly (embed a font with full Urdu glyph coverage; ensure RTL text shaping).

### 5.4 Localization & RTL requirements (NFR-004)

- Selecting Urdu sets document direction to **RTL**; English to **LTR**. Applies to layout, icons that imply direction, and list alignment.
- Use a font with complete Urdu (Nastaʿlīq or a clean naskh) glyph coverage across app **and** PDF.
- Numbers, dates, and units render appropriately for the locale.
- All static UI strings come from a localization resource (i18n), keyed, with `ur` and `en` catalogs (FR-015). Missing keys fall back to English but should be flagged in dev.
- Language toggle lives in settings and on relevant screens; the choice persists (FR-016) on the `farmer` record and locally.

### 5.5 Sharing / export contracts

**Share as text** (client-side): flatten the plan JSON into a readable localized message (title, top crops, key calendar steps, disclaimer) and hand to the OS share sheet / WhatsApp intent.

**Export PDF**
```
GET /plans/{plan_id}/pdf?lang=ur      (Authorization: Bearer <token>)
→ 200 application/pdf
```
(Or generate client-side if that's simpler for your stack; either way ensure Urdu font embedding.)

### 5.6 Edge cases

- **Language mismatch after switch:** show the regenerate banner; never silently display mixed-language content.
- **Regenerate cost:** confirm before regenerating so the farmer knows it produces a fresh plan (and, in demo, spends an LLM call).
- **Missing sections:** render gracefully; a lean plan (crops + calendar only) still looks complete.
- **Urdu in PDF:** the single most common failure point — test early with real Urdu strings and confirm shaping/joining in the exported PDF, not just on screen.
- **Long content:** cards scroll; PDF paginates cleanly.
- **Share truncation:** keep the shared text within messaging limits; link back or attach the PDF for the full plan.

### 5.7 Acceptance criteria

- A generated plan renders as expandable section cards, correct in both Urdu (RTL) and English (LTR), on a phone screen.
- Switching app language flips the UI immediately and offers (not forces) plan regeneration.
- The farmer can share a readable summary to WhatsApp and export/print a PDF that renders Urdu correctly.
- Absent plan sections are omitted without broken layout.

---

## Scenario 6 — Save & Revisit (persistence, history, dashboard)

**Related requirements:** FR-002, FR-013, FR-014, US-004. Establishes the data hierarchy and the home experience.

### 6.1 Goal

Persist a farmer's farms and every plan generated for them, and give a returning farmer a home screen to revisit farms, view plan history, and act.

### 6.2 Design decisions & data hierarchy

- **Hierarchy:** one **farmer** → many **farms** → many **plans** per farm (full history kept). The latest plan per farm is shown by default; older plans remain accessible.
- **Editing:** a farmer **can edit a farm's details**; regeneration creates a **new plan version** attached to that farm (history preserved, nothing overwritten). This is preferred over forcing a new farm, so the same plot's plans stay comparable over time.
- **Home screen:** a **dashboard** with the farmer's farms, quick actions (new farm, view latest plan), and an **alerts area** (see Scenario 7). Full alerts engine is a stretch; the dashboard reserves space for it.

### 6.3 Screens

**S-6.1 — Dashboard / home**
- Greeting + language/settings access.
- **Alerts area** (Scenario 7): important notifications (weather, timely reminders). In MVP/demo, may show a simulated feed.
- **My farms**: cards per farm (name/crop, region, latest plan date). Tap → farm detail.
- Primary action: "Add a farm" → onboarding (Scenario 2) or new-farmer wizard (Scenario 3).
- States: default, empty (no farms yet → prompt to create one), loading, error.

**S-6.2 — Farm detail**
- Farm summary (editable) + list of plans (history), newest first.
- Actions: edit farm (→ regenerate → new plan version), view a plan (Scenario 5), delete farm (guarded; see edge cases).
- States: default, loading, empty (no plans yet → "Generate plan"), error.

### 6.4 Data model (relationships & plan)

```
farmer 1───* farm 1───* plan

plan {
  id: uuid (pk)
  farm_id: uuid (fk → farm)
  farmer_id: uuid (fk → farmer)      // denormalized for auth scoping
  language: enum('ur','en')
  content: json                       // the plan JSON (Scenario 4 schema)
  context_used: json
  created_at: timestamp
  version: int                        // increments per farm
}
```

### 6.5 API contracts

```
GET  /farms                          → list farmer's farms (+ latest plan summary)
GET  /farms/{farm_id}                → farm detail
PATCH /farms/{farm_id}               → edit farm details
GET  /farms/{farm_id}/plans          → plan history (newest first)
GET  /plans/{plan_id}                → single plan
POST /farms/{farm_id}/plan           → generate a new plan version (Scenario 4)
```

All endpoints auth-scoped: a farmer can only access their own farms/plans (FR-002, NFR-006).

### 6.6 Edge cases

- **Edit → regenerate:** creates a new `plan` version; old versions remain. Show which plan is current.
- **Delete farm:** guard with confirmation. **Prohibited action note:** hard/permanent deletion should be a deliberate, confirmed action; prefer soft-delete (recoverable) so an accidental tap isn't destructive.
- **Empty states:** no farms → guide to create; farm with no plan → guide to generate.
- **Many plans:** paginate history if long.
- **Auth scoping:** never leak another farmer's data; enforce ownership on every read/write.
- **Offline revisit:** cache the latest plan per farm so a farmer can reread it without connectivity (nice-to-have).

### 6.7 Acceptance criteria

- A returning farmer lands on a dashboard listing their farms with the latest plan accessible.
- Editing a farm and regenerating produces a new plan version without destroying prior plans.
- All farm/plan access is correctly scoped to the authenticated farmer.
- Empty and error states are handled gracefully and localized.

---

## Scenario 7 — Alerts & Notifications Feed (STRETCH — Should/Could)

**Related requirements:** extends the product beyond the PRD's core scope. Flagged as a stretch feature; the Must demo does not depend on it.

> **Scope warning:** A live, continuously-updating alerts system implies background monitoring per farm, a decision layer for "importance," a notification store, and possibly push infrastructure. This is a meaningful build. For the hackathon, implement a **lightweight/simulated** version and treat the full engine as post-hackathon.

### 7.1 Goal

Surface timely, useful notifications to farmers — weather warnings, irrigation/fertilizer reminders derived from the plan calendar, and pest/season alerts — on the dashboard.

### 7.2 Phased approach

- **Demo tier (recommended for the week):** derive alerts on-the-fly from data already present — a current **weather card** for the farm's location, plus **calendar-derived reminders** (e.g., "Your plan says irrigate in Week 2 — that's now"). No background jobs; computed when the dashboard loads. This *looks* like a live feed and demos well.
- **Full tier (post-hackathon):** scheduled background job per farm that pulls weather/agri data, an AI/rules layer that flags important changes, a persistent notifications store, read/unread state, and push notifications.

### 7.3 Screens

**S-7.1 — Alerts area (on dashboard)**
- List of alert cards: type icon, short localized message, timestamp, optional action ("view plan step").
- Types: weather, reminder, pest/season, informational.
- States: default (alerts present), empty (no alerts → hide or show "all clear"), loading, error (feed unavailable → hide gracefully, never block the dashboard).

### 7.4 Data model (full tier)

```
alert {
  id: uuid (pk)
  farmer_id: uuid
  farm_id: uuid | null
  type: enum('weather','reminder','pest','info')
  message: string        // localized at generation or via i18n key + params
  severity: enum('info','warning','critical')
  action_ref: string | null    // e.g., link to a plan step
  read: boolean
  created_at: timestamp
}
```

### 7.5 API contracts (full tier)

```
GET  /alerts                    → farmer's alerts (newest first)
POST /alerts/{id}/read          → mark read
```
Demo tier can compute alerts inline in the dashboard response instead of a store.

### 7.6 Edge cases

- **Feed down:** dashboard renders without alerts; never blocks core flow.
- **Notification spam:** de-duplicate and cap frequency in the full tier.
- **Localization:** alert text respects the farmer's language.
- **Relevance:** tie reminders to the actual plan calendar so they're specific, not generic.

### 7.7 Acceptance criteria

- **Demo tier:** the dashboard shows a weather card and at least one plan-derived reminder for a farm, localized, without a background pipeline.
- **Full tier (if built):** alerts persist, carry read/unread state, and can be marked read.
- Alert failures never block the dashboard.

---

## Scenario 8 — Farm Twinning (Farm Care & Companion Planting)

**Priority:** Should. Origin term: "Farm Twinning" (kept per stakeholder). Extends input guidance for multi-crop farms.

### 8.1 Goal

Help a farmer care for a farm that has multiple crops: advise which crops can or cannot be planted together (companion planting), and provide ongoing input/care guidance (which fertilizer/urea, how much, when).

### 8.2 Design decisions

- **Layout scope:** a farm can hold **multiple crops**; the system advises on the *combination*, not a detailed plot map. (A full plot-mapping UI is a future extension.)
- **Knowledge sources — hybrid:**
  - **Companion-planting compatibility** comes from a **deterministic data table** (crop-pair → good / bad / neutral + reason). Reliable, fast, explainable — not left to the LLM.
  - **Care/input guidance** (fertilizer type, quantity, timing, pest notes) comes from the **LLM**, given the crop set, farm context, and season.

### 8.3 Flow

1. From a farm, the farmer adds/selects the crops currently (or intended to be) grown.
2. System evaluates each crop pair against the compatibility table → flags conflicts and good pairings.
3. System calls the LLM for consolidated care guidance across the crop set.
4. Farmer sees a combined view: compatibility warnings + care plan.

### 8.4 Screens

**S-8.1 — Manage crops on farm**
- Add crops (searchable list, reuse the crop catalog). Shows current crop set.
- States: default, empty (no crops → prompt to add), success.

**S-8.2 — Compatibility & care view**
- **Compatibility section:** for each notable pair, a badge (good / avoid / neutral) with a one-line reason from the table. Highlight conflicts prominently.
- **Care guidance section:** LLM output — fertilizer/urea guidance, watering, timing, pest notes, localized.
- Actions: adjust crops, regenerate care guidance.
- States: default, loading (care guidance generating), error (LLM failure → retry; table results still shown since they don't depend on the LLM).

### 8.5 Companion-planting table

```
crop_compatibility {
  crop_a: crop_id
  crop_b: crop_id
  relation: enum('good','avoid','neutral')
  reason: string (localized or i18n key)
}
```
- Seed with well-known pairings. **[OPEN]** finalize the pair list; a modest curated set covers the demo. Unknown pairs default to `neutral` (not shown as a warning).

### 8.6 API contracts

```
PUT  /farms/{farm_id}/crops           { "crop_ids": ["tomato","basil","potato"] }
GET  /farms/{farm_id}/compatibility   → pairs with relations + reasons (from table)
POST /farms/{farm_id}/care-guidance    → LLM care plan for the crop set (JSON, localized)
```

### 8.7 Edge cases

- **LLM fails:** still show the table-based compatibility (it's independent).
- **Unknown pair:** treat as neutral; don't fabricate a warning.
- **Single crop:** no compatibility warnings; care guidance still applies.
- **Localization:** reasons and care text in the farmer's language.

### 8.8 Acceptance criteria

- A farmer can list multiple crops on a farm and see reliable good/avoid pairings from the table plus LLM care guidance.
- Compatibility results render even if the LLM call fails.
- Everything is localized (Urdu/English).

---

## Scenario 9 — Suggested Crops (AI + Community Blend)

**Priority:** Should. Recommends vegetables/fruits by blending AI reasoning with what nearby farmers in the same region grow.

### 9.1 Goal

Suggest crops well-suited to a farmer's farm, combining (a) AI reasoning over the farm's data and (b) a community signal — crops that other farmers in the same region grow/succeed with.

### 9.2 Design decisions

- **Blended source:** the suggestion engine assembles a **community signal** (aggregated crop frequency/success by region) and passes it, with the farm's data, to the LLM, which produces a ranked, reasoned suggestion list. Community data grounds the AI; the AI adds context and rationale.
- **Privacy:** community data is **aggregated and anonymized** — never expose individual farmers' data (NFR-006).

### 9.3 Flow

1. Region-aggregation layer maintains counts of crops per region (updated as farms/plans are created).
2. On request, the engine fetches the region's top crops + the farm's context.
3. LLM ranks and explains suggestions ("popular and suitable in your area").
4. Farmer sees suggestions and can pick one to seed a plan or add to the farm.

### 9.4 Screen

**S-9.1 — Suggested crops**
- Ranked list: crop, a short reason (why it suits this farm/region), and a signal chip (e.g., "grown by many nearby farms").
- Action: "Use this crop" → feeds onboarding/plan.
- States: default, loading, empty (sparse region data → fall back to AI-only suggestions), error.

### 9.5 Data & contracts

```
region_crop_stats {
  region_code: string
  crop_id: crop_id
  farm_count: int
  updated_at: timestamp
}

GET /suggestions?farm_id=..   → { "suggestions": [ { "crop_id","reason","community_signal" } ] }
```

### 9.6 Edge cases

- **Sparse region (few farms):** degrade gracefully to AI-only suggestions; label them as such.
- **Privacy:** only aggregated counts leave the data layer; no individual identities.
- **Cold start:** seed region stats with reasonable defaults or accept AI-only until data accrues.
- **Localization:** reasons localized.

### 9.7 Acceptance criteria

- A farmer sees ranked crop suggestions that reflect both suitability and regional popularity.
- With little regional data, suggestions still appear (AI-only) without error.
- No individual farmer data is exposed.

---

## Scenario 10 — Admin Console

**Priority:** Should. Web-only surface for operators.

### 10.1 Goal

Give operators tools to manage farmers and content, curate AI plans and the crop catalog, and view usage analytics.

### 10.2 Capabilities

- **Manage farmers & content:** search/view farmers, view their farms/plans (with appropriate access controls), moderate or correct content.
- **Curate AI plans & crop catalog:** edit the crop catalog (add/edit/disable crops, icons, localized names), maintain the companion-planting table, review flagged/sampled AI plans for quality.
- **Analytics/usage:** dashboards for signups, plans generated, active farms, popular crops/regions, LLM cost/volume.

### 10.3 Screens (high level)

- **S-10.1 Admin dashboard:** key metrics + quick links.
- **S-10.2 Farmers:** searchable table; drill into a farmer's farms/plans.
- **S-10.3 Crop catalog editor:** CRUD on crops (localized names, icons, enable/disable).
- **S-10.4 Compatibility table editor:** manage companion-planting pairs.
- **S-10.5 Plan review:** sampled/flagged plans for quality curation.
- **S-10.6 Analytics:** charts for usage and cost.

### 10.4 Access control & security

- **Separate admin role**, distinct from farmer auth; do not reuse farmer phone-OTP alone for privileged access — require stronger admin authentication and role checks on every admin endpoint.
- All admin actions audit-logged.
- Respect farmer privacy: access to personal data gated by role and logged.
- **Destructive actions** (disabling accounts/content) confirmed and, where possible, reversible (soft-delete).

### 10.5 API surface (illustrative, all admin-scoped)

```
GET   /admin/metrics
GET   /admin/farmers?q=..
GET   /admin/farmers/{id}
GET   /admin/plans?flagged=true
PATCH /admin/crops/{id}            // catalog CRUD
PUT   /admin/compatibility         // table edits
```

### 10.6 Edge cases & acceptance criteria

- Non-admins cannot reach any `/admin` endpoint (enforced server-side).
- Catalog and compatibility edits propagate to the farmer apps.
- Analytics reflect real usage; cost view helps manage LLM spend (NFR-007).

---

## Scenario 11 — Web + Mobile Parity (platform architecture)

**Priority:** Must (platform strategy). Note: PRD MVP was mobile-first; full parity is the stated target as the product grows.

### 11.1 Goal

Deliver the same farmer features on web and mobile, backed by one shared API, with the admin console as a separate web-only surface.

### 11.2 Design decisions

- **Shared backend / single API:** both farmer clients call the same API gateway and services (see architecture diagram). No feature forks by platform.
- **Full parity:** every farmer feature (auth, onboarding, wizards, plan generation/display, twinning, suggestions, save/revisit, alerts) works on both web and mobile.
- **Admin is separate:** web-only, behind admin auth; not part of farmer parity.
- **Responsive & localized:** both clients are responsive and fully localized (Urdu RTL / English LTR).
- **Hackathon note:** parity is the target; for the one-week build, **mobile-first** remains the pragmatic priority (PRD), with web reaching parity as time allows. Because the backend is shared, adding the web client is mostly a front-end effort, not a re-architecture.

### 11.3 Considerations

- Shared API contracts and i18n resources across clients to avoid drift.
- Platform-specific concerns handled per client: GPS (mobile native vs. web geolocation), share sheets (native vs. web share/WhatsApp link), push (mobile) vs. in-app alerts (web).
- Auth/session model consistent across platforms.

### 11.4 Acceptance criteria

- A farmer can accomplish the same tasks on web and mobile against one backend.
- The admin console is reachable only on web and only by admins.
- Both clients render correctly in Urdu (RTL) and English (LTR).

---

## Appendix A — Build order & priority summary

| # | Scenario | Priority | Notes |
|---|----------|----------|-------|
| 1 | Phone OTP auth | Must | Mock OTP first; unified passwordless flow |
| 2 | Onboarding & input capture | Must | 4-step wizard; area→acres canonical |
| 3 | New-farmer guided wizard | Should | Educational; soil/water/budget; AI can fill gaps |
| 4 | Crop plan generation | **Must (core)** | JSON output, in-language; feeds are graceful enrichment |
| 5 | Plan display, language, sharing | Must (display) / Should (share/PDF) | Card layout; Urdu-in-PDF is the key risk |
| 6 | Save & revisit + dashboard | Must | farmer→farms→plans; history kept; edit→new version |
| 7 | Alerts & notifications | Stretch | Demo tier = simulated; full engine post-hackathon |
| 8 | Farm Twinning (care & companion) | Should | Table for pairings + LLM for care |
| 9 | Suggested crops (AI + community) | Should | Needs region-aggregation layer; privacy-safe |
| 10 | Admin console | Should | Web-only; separate admin auth + audit logs |
| 11 | Web + mobile parity | Must (platform) | Shared API; mobile-first for the week, web to parity |

## Appendix B — Consolidated open questions

- LLM/provider choice and per-plan cost/token budget.
- SMS/OTP provider for Pakistan (for live mode).
- Final crop catalog (~20–30 items for demo).
- Whether AI plans need agronomy-expert review for the demo, or disclaimer suffices.
- Web platform parity target vs. mobile-first only this cycle.
- Weather / soil-agri data source(s) for enrichment.
- Alerts: demo-tier only, or attempt the full engine?
- Companion-planting table: finalize the crop-pair list and reasons.
- Suggested crops: minimum regional data threshold before community signal is used vs. AI-only.
- Admin: what admin auth method (separate from farmer OTP) and which roles/permissions?
- Parity: confirm whether web reaches full parity within the hackathon or is explicitly phased after.

---

*End of current draft. All eleven scenarios (six core + alerts stretch + four new features) are specified. Ready for team review.*

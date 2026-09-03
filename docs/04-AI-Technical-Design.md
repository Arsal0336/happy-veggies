# 04 — AI Technical Design

| | |
|---|---|
| **Source of truth** | HAPPY-VEGGIE-SRS.md v1.3 |
| **Audience** | Backend / AI engineers |
| **Purpose** | Where AI is used, what stays deterministic, assistant & retrieval design |
| **Stack [SRS]** | Configurable LLM provider behind adapters; cost/latency bounded |

**Legend:** **[SRS]** · **[TECH]** · **[TBD]**

---

## 1. Separation of concerns (mandatory)

### 1.1 Deterministic logic (system of record) **[SRS + TECH]**

The LLM is **not** the source of truth for:

| Area | Examples |
|------|----------|
| Validation | Phone, areas, land sum ≤ farm total, enums |
| Units | Acre/kanal/marla/sq ft storage & conversion helpers |
| Economics | `ReferenceGrossValue = ExpectedYield × GovernmentReferenceRate` |
| Compatibility | `crop_compatibility` table (good/avoid/neutral) |
| Privacy | Aggregate-only nearby stats; owner scoping |
| Green score math | Dimension availability + aggregation (weights config) |
| Thresholds | OTP rate limits, token caps, cohort N |
| Provenance labels | Never reclassify estimate as measured |
| AuthZ | Farmer vs admin |
| Admin plan review | Humans review flagged outputs — LLM does not self-approve |

These run in Domain / Application services (`01`, `03`) **before or after** any LLM call.

### 1.2 LLM responsibilities **[SRS]**

| Allowed | Notes |
|---------|-------|
| FarmPlan narrative sections | Structured JSON schema; validated |
| Care / input guidance prose | Grounded in twin; fail open to tables |
| Seed variety rationale text | After deterministic ranking |
| Portfolio explanation | After optimizer/rules propose allocation |
| AI Farm Assistant Q&A | Farm-scoped twin grounding |
| Summaries / “what to do this week” | Cite twin signals |
| Green tip wording | After score/factors computed |

### 1.3 Forbidden LLM behaviors **[TECH enforcing SRS]**

- Invent farm facts when twin data missing (FR-062) — refuse or disclaimer.
- Assume outdoor conditions for protected areas (FR-118, C-015).
- Expose other farmers’ private data (FR-066, FR-035).
- Claim Green Score is certification (FR-132).
- Replace compatibility table results (FR-032).
- Bypass water/soil/season unsuitability for “greener” crops (FR-117).

---

## 2. Provider abstraction **[SRS C-002]**

```text
ILlmProvider
  ├─ CompleteChatAsync(messages, options)
  ├─ CompleteJsonAsync(schema, messages, options)  // plans
  └─ (optional) EmbedAsync(texts)                  // if embeddings enabled
```

Config: provider name, model, max tokens, temperature, timeout, cost budget per request type.  
Swap providers without client changes. Log usage for admin cost visibility (NFR-007) — no secrets in logs.

---

## 3. Farm-specific AI Assistant

### 3.1 Flow

```text
Farmer message
  ↓
Resolve Farm + Thread (owner check)
  ↓
Build FarmContext pack (from Twin + related read models)
  ↓
Retrieve optional knowledge snippets (see §4)
  ↓
Prompt assembly (system + context + history window + user)
  ↓
ILlmProvider
  ↓
Response validation (safety, no PII leak, disclaimer)
  ↓
Persist AssistantMessage + optional citations
  ↓
Return to farmer (localized)
```

### 3.2 FarmContext pack contents **[SRS FR-061]**

Include when available (omit + mark missing — do not invent):

- Farm identity: region, lat/lng, total area, language  
- ProductionAreas: type, area/units, env attrs + provenance  
- CropZones: crop, variety, stage, planting date, expected yield  
- Weather snapshot + `context_used`  
- Soil profile + provenance  
- Water sources / irrigation  
- Latest plan summary / economics snapshot  
- GreenFarmScore factors (if computed)  
- Experimental flags  
- Recent activities / outcomes (summarized)  
- Anonymized nearby signals only (aggregates)

**Environment rule:** Tag each zone with `productionAreaType` so the model cannot treat shed cucumber as open-field.

### 3.3 Prompt assembly **[TECH]**

1. System: Pakistan agri advisor; JSON/text rules; language = farmer language; advisory disclaimer; never fabricate; never certify green score.  
2. Twin context block (compact structured text/JSON).  
3. Tool-like facts: compatibility results / green factors precomputed.  
4. Conversation window (see §5).  
5. User message.

Exact prompt templates **[TBD]**; keep versioned in repo/config.

### 3.4 Response validation **[TECH]**

- Strip/reject if references another farmer’s identity.  
- Ensure disclaimer present on advice (NFR-017).  
- Optional citation chips: weather, area type, growth stage (FR-065).  
- On provider failure → retryable error to UI (NFR-005).

---

## 4. Embeddings / vector search

### 4.1 When useful **[TECH — optional capability]**

Embeddings are **not required** to ship P0. Consider for P1+ only if retrieval quality needs it:

| Corpus | Why |
|--------|-----|
| Curated crop care / agronomy snippets (non-personal) | Ground care answers |
| Farm’s own historical plan summaries / outcomes | “What worked last season” |
| Prior assistant turns (same farm) beyond context window | Long-term memory |

### 4.2 If enabled — rules

| Topic | Rule |
|-------|------|
| What to embed | Chunked text + metadata: `farmId` (or `null` for global catalog), `lang`, `docType`, `cropId?` |
| Chunking | **[TBD]** size/overlap |
| Filtering | **Mandatory** `farmId` filter for farm-private vectors; global corpus never mixes PII |
| Tenant isolation | Separate index partition or hard metadata filter + tests |
| Relevance | Top-k with score threshold; drop low relevance |
| When **not** to use | Live weather numbers, rate math, compatibility table, auth, green score calculation, anything needing exact current twin field values |

**Default recommendation [TECH]:** P0/P1 assistant uses **structured TwinContext only**; add vectors later if grounded Q&A quality demands it.

---

## 5. Chat functionality

| Topic | Design |
|-------|--------|
| Create conversation | `StartThread` for `farmId`; one active or many **[TBD]** |
| History | Persist all messages owner-scoped (FR-064) |
| Context window | Keep last N turns + always inject fresh TwinContext snapshot **[TBD]** N |
| Streaming | **[TBD]** stream vs full response (NFR-011 SLO applies) |
| Errors | Map provider timeout/429 to retryable API errors |
| Cost controls | Max tokens/request; rate limit per farmer (NFR-019); optional daily cap **[TBD]** |
| Safety | Disclaimer; refuse insufficient data; no certification language |
| Provenance | Prefer citing twin fields (“based on shed humidity — farmer_provided”) |

### 5.1 Plan generation (non-chat LLM)

```text
Assemble twin context (+ weather/soil flags)
  ↓
CompleteJsonAsync(plan schema)
  ↓
Validate JSON (retry once if malformed — SRS)
  ↓
Persist FarmPlan version
  ↓
UI renders sections only (FR-023)
```

Language: generate **in** farmer language (no silent translate).

---

## 6. AI vs optimization engine

| Step | Owner |
|------|-------|
| Candidate crops / constraints / portfolio scoring | Deterministic (+ config weights) |
| Compatibility | Table |
| Green score | `GreenFarmScoringService` |
| Explanation & NL recommendations | LLM |
| Final structured plan sections | LLM JSON validated against schema |
| Farmer action & actuals | CRUD + learning records |

---

## 7. Open decisions (AI)

| ID | Topic |
|----|--------|
| A-1 | LLM vendor/model per environment |
| A-2 | Streaming assistant |
| A-3 | Enable embeddings in P1 or defer |
| A-4 | Context window size / summarization strategy |
| A-5 | Per-farmer daily token budget |
| A-6 | Plan JSON schema versioning process |

---

*Business rules detail: `01`. Endpoints: `03` / `05`.*

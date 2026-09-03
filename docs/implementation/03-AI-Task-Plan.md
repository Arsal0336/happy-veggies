# 03 — AI Task Plan

| | |
|---|---|
| **Track** | AI |
| **Sources** | `01-Core-Technical-Logic.md`, `04-AI-Technical-Design.md`, `03-Backend-Technical-Design.md` |
| **Master** | [00-Master-Implementation-Plan.md](00-Master-Implementation-Plan.md) |
| **Owner role** | `AI` |

Statuses and Task IDs **must match the Master**. Default status: `NOT STARTED`.

**Hard rule:** LLM is never source of truth for deterministic calculations (units, rates, compatibility table, green score math, authz, privacy aggregates). See Doc 04 §1.

---

## Dependencies on other tracks

| Need from others | Tasks |
|------------------|-------|
| Backend solution host | TASK-001 |
| DigitalTwinAssembler / twin data | TASK-040 |
| CropPlanningService orchestration | TASK-083 |
| Assistant persistence APIs | Backend TASK-105 (calls into AI services) |
| FE chat | Frontend TASK-107 (consumes APIs) |

---

## AI task table

| Task ID | Phase | Area | Task | Description | Deliverable | Dependencies | Priority | Status | Owner | Estimate | Notes |
| ------- | ----- | ---- | ---- | ----------- | ----------- | ------------ | -------- | ------ | ----- | -------- | ----- |
| TASK-100 | 7 | AI | ILlmProvider abstraction | Chat + JSON completion; config-driven | Interface + impl/stub | TASK-001 | P0 | DONE | AI | — | Doc 04 §2 |
| TASK-101 | 7 | AI | Prompt + plan JSON schema infra | Versioned prompts; plan schema | Artifacts | TASK-100 | P0 | DONE | AI | — | Doc 04 §3.3 / §5.1 |
| TASK-102 | 7 | AI | Token/cost/timeout controls | Bounds; rate-limit hooks | Options | TASK-100 | P0 | DONE | AI | — | NFR-007/019 |
| TASK-103 | 7 | AI | FarmContext pack builder | Twin-grounded context; env tags | Builder | TASK-040, TASK-100 | P1 | DONE | AI | — | Doc 04 §3.2 |
| TASK-104 | 7 | AI | Plan JSON generation + validate | LLM JSON; retry once; handoff to BE | Service | TASK-101, TASK-103, TASK-083 | P0 | DONE | AI | — | Retry on malformed JSON |
| TASK-106 | 7 | AI | Assistant response validation | Disclaimer; no PII; citations | Validator | TASK-103, TASK-100 | P1 | DONE | AI | — | Doc 04 §3.4 |
| TASK-108 | 7 | AI | AI grounding & isolation tests | Refuse invent; farm isolation | Tests | TASK-103, TASK-106 | P1 | DONE | AI | — | 21 AI tests |
| TASK-109 | 7 | AI | Embeddings / vector search | Optional retrieval | Capability | TASK-100 | P2 | DEFERRED | AI | — | Per Doc 04 §4 recommendation |
| TASK-123 | 9 | AI | Green tip wording | NL tips after deterministic score | Prompt path | TASK-120, TASK-103 | P1 | DONE | AI | — | FR-131 labels |
| TASK-145 | 11 | AI | Prompt + cost control tests | Schema + token bounds | Tests | TASK-104, TASK-102 | P0 | DONE | AI | — | Schema validation + prompt tests |

---

## AI foundation checklist

- [x] TASK-100 Provider abstraction (no vendor lock-in in domain)  
- [x] TASK-101 Prompts + plan schema versioning  
- [x] TASK-102 Cost/timeout/rate controls  
- [ ] Logging of usage for admin cost visibility (no secrets)  

## Farm context pipeline tasks

```text
Farm + Twin (TASK-040)
  → FarmContext pack (TASK-103)
  → Prompt assembly (TASK-101)
  → ILlmProvider (TASK-100)
  → Validation (TASK-106 / plan validate in TASK-104)
  → Persist via Backend APIs
```

Context must include when available: production areas (type!), crops/stages, weather, soil+provenance, water, economics, green summary, experimental flags, anonymized nearby aggregates only.

## Deterministic vs AI ownership

| Capability | Owner | AI role |
|------------|-------|---------|
| Compatibility | Backend TASK-080 | Optional explanation only |
| Economics yield×rate | Backend TASK-081 | Explanation only |
| Green score math | Backend TASK-120 | Tip wording TASK-123 |
| Plan section narrative | AI TASK-104 | Structured JSON |
| Assistant Q&A | AI TASK-103/106 | Grounded NL |

## Embeddings (TASK-109)

Only if TwinContext quality is insufficient. Must enforce farmId filter / tenant isolation. **Do not** embed live rates, compatibility table, or green math. Team should set status to `DEFERRED` until explicitly pulled into scope.

## AI testing focus

- Malformed plan JSON → one retry then failure  
- Missing twin fields → refuse/disclaimer (not hallucinate)  
- Protected area questions use shed/GH context (not outdoor assumptions)  
- Cross-farm prompt injection cannot return other farmer data  
- Token budget exceeded → controlled error  

---

*Update status in Master and this file together.*

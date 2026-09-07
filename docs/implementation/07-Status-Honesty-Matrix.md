# GAP-001 — Honest Status Matrix (vs SRS DoD)

| Date | 2026-09-04 |
| **Rule** | DONE only if Backend + DB + Contract + FE (if needed) + AuthZ + Audit/provenance + Tests + E2E evidence |

## Track honesty (updated 2026-09-04 after GAP train)

| Area | Prior plan claim | Honest status | Notes |
|------|------------------|---------------|-------|
| Backend entities/CRUD shell | DONE | **PARTIAL → much improved** | Soft-delete HTTP done; providers still stub by default |
| Twin refresh | DONE | **PARTIAL (stub-wired)** | Calls weather/soil providers; live vendors TBD |
| Plans / Assistant | DONE | **PARTIAL (stub en/ur + OpenAI-compatible live)** | `LiveLlmProvider` (Groq default locally; DashScope/Qwen configurable); needs `Llm:UseLive` + API key |
| Green score | DONE | **PARTIAL** | Factors + disclaimer; weights TBD-06 |
| Experimental | DONE | **PARTIAL → loop min** | Approve + outcome → CropCycle |
| Admin portal | DONE | **PARTIAL → writes live** | Catalog mutations, review, twin, flags, analytics; MFA BLOCKED |
| Frontend routes/UI | DONE | **PARTIAL → wired (Angular SPA)** | Plan yield/market tables; water/soil/economics/weather/graphic/alerts; PDF deferred |
| Integration E2E | DONE (some) | **PARTIAL** | Backend unit tests green; full live E2E pack incomplete |
| Water/Soil/Economics HTTP | Implied | **IMPLEMENTED (API+UI)** | Stub twin enrichment |
| Auth refresh FR-044 | — | **IMPLEMENTED (interim JWT re-issue)** | Full refresh-token store later |
| Feature flags | — | **IMPLEMENTED** | |
| Learning | — | **IMPLEMENTED (min)** | Predicted vs actual delta |
| Portfolio | — | **BLOCKED** | GAP-054 / TBD-11 |
| Release gate GAP-080 | — | **NOT READY** | See `12-Release-Gate-GAP-080.md` |

## Master plan action

Tasks that are scaffold-only should be treated as **PARTIAL** against this matrix until GAP backlog items reach VERIFIED. Do not reset historical TASK ids to NOT STARTED en masse without evidence review; use this matrix + GAP-xxx as the execution source of truth going forward.

## SRS → GAP traceability (post train 2026-09-04)

| SRS | GAP | Status |
|-----|-----|--------|
| FR-044 | GAP-010 | IMPLEMENTED (interim JWT re-issue) |
| C-009 / FR-045 | GAP-011 | IMPLEMENTED |
| FR-042 / NFR-008 | GAP-012 | IMPLEMENTED (privileged writes) |
| FR-097 | GAP-013 | IMPLEMENTED |
| FR-067–070 | GAP-020 | IMPLEMENTED (stub wire; live TBD) |
| FR-071–074 | GAP-021 | IMPLEMENTED |
| FR-050,075–076 | GAP-022 | IMPLEMENTED |
| FR-079–082 | GAP-023 | IMPLEMENTED |
| FR-052,054 | GAP-024 | IMPLEMENTED |
| EIR-004 | GAP-030 | BLOCKED (adapter slot; vendor TBD) |
| FR-007+ | GAP-031 | IMPLEMENTED (stub LLM grounded) |
| FR-060+ | GAP-032 | IMPLEMENTED (stub LLM grounded) |
| FR-039 | GAP-040 | IMPLEMENTED |
| FR-040 | GAP-041 | IMPLEMENTED (interim review enum) |
| Admin twin | GAP-042 | IMPLEMENTED |
| FR-041 | GAP-043 | IMPLEMENTED |
| FR-042 MFA | GAP-044 | TBD / BLOCKED |
| FR-037,093 | GAP-050 | IMPLEMENTED (cadence TBD-10) |
| FR-086–088 | GAP-051 | IMPLEMENTED (min loop) |
| FR-090–091 | GAP-052 | IMPLEMENTED (min; TBD-12) |
| FR-127–133 | GAP-053 | PARTIAL (weights TBD-06) |
| FR-056–059 | GAP-054 | BLOCKED (TBD-11) |
| FR-024 | GAP-060 | DEFERRED (TBD-13) |
| Release | GAP-080 | NOT READY — `12-Release-Gate-GAP-080.md` |

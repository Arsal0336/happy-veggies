# Happy Veggie documentation map

## Product north star

From the SRS: **twin the farm → arrange crops/zones → predict yield → apply government reference rates → advise next actions.**

The Farm Plan UI surfaces **yield and market value as tables** (zone, crop, area, expected yield, gov rate, reference gross) so farmers can scan numbers without reading long English paragraphs. Short AI section prose sits below those tables.

---

## Source of truth (normative — do not rewrite casually)

| Document | Role |
|---|---|
| [HAPPY-VEGGIE-SRS.md](./HAPPY-VEGGIE-SRS.md) | Authoritative production requirements |
| [01-Core-Technical-Logic.md](./01-Core-Technical-Logic.md) | Domain / twin / planning logic |
| [02-Frontend-Technical-Design.md](./02-Frontend-Technical-Design.md) | Frontend design (normative stack may differ from shipped UI) |
| [03-Backend-Technical-Design.md](./03-Backend-Technical-Design.md) | Backend design |
| [04-AI-Technical-Design.md](./04-AI-Technical-Design.md) | AI / LLM design |
| [05-Frontend-Backend-Integration.md](./05-Frontend-Backend-Integration.md) | Integration contracts |

Also related product specs (not rewritten by the output-docs upgrade): [HAPPY-VEGGIE-PRD.md](./HAPPY-VEGGIE-PRD.md), [HAPPY-VEGGIE-DEV-SPEC.md](./HAPPY-VEGGIE-DEV-SPEC.md).

---

## Derived docs (keep aligned with shipped product)

| Document | Role |
|---|---|
| [../README.md](../README.md) | Repo entry, quick start, demo path |
| [DEMO-PITCH.md](./DEMO-PITCH.md) | Judge talk track |
| [hackathon/PRESENTATION.md](./hackathon/PRESENTATION.md) | Slide deck markdown |
| [hackathon/PORTAL-COPY.md](./hackathon/PORTAL-COPY.md) | Portal paste-ready copy |
| [implementation/07-Status-Honesty-Matrix.md](./implementation/07-Status-Honesty-Matrix.md) | What is stub vs live |
| [implementation/09-Provider-Architecture.md](./implementation/09-Provider-Architecture.md) | Provider ports |

Implementation task plans under `implementation/` are historical planning artifacts; prefer the honesty matrix for current status.

---

## Known stack delta (SRS vs shipped)

| Topic | Normative SRS / design docs | Shipped runtime |
|---|---|---|
| Farmer + admin UI | React FC (SRS §2.7) | **Angular SPA** at `Frontend/` · `:4200` (farmer `/`, admin `/admin`) |
| LLM local default | Often DashScope/Qwen in pitch history | **OpenAI-compatible** `LiveLlmProvider` — **Groq** local default; DashScope/Qwen configurable via endpoint + model |

Do **not** rewrite SRS §2.7 to claim Angular. Document the delta here and in derived README/pitch docs only.

---

## Demo path (yield-first)

1. Twin the farm (areas, zones, weather/soil/water)  
2. Arrange crops / zones  
3. Open **Farm Plan** → scan **yield & market value** tables (+ farm at a glance, warnings)  
4. Read short advice sections; ask the **AI Farm Assistant** if needed  

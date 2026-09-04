# HAPPY VEGGIE — Hackathon presentation

**Event:** Alibaba Cloud AI Hackathon Pakistan 2026 (Bano Qabil × Alibaba Cloud)  
**Format:** Markdown pitch deck — paste into slides/PDF as needed  
**Repo:** https://github.com/Arsal0336/happy-veggies

Use one slide per section below. Keep claims honest: providers default to **stub**; live LLM is **OpenAI-compatible** (Groq local default; DashScope/Qwen configurable), gated by config and a server-side API key.

---

## Slide 1 — Title

**HAPPY VEGGIE**  
AI Farm Digital Twin for Pakistan

*Digitalize your farm. Arrange crops. Predict yield. Apply market rates.*

Alibaba Cloud AI Hackathon Pakistan 2026 · Bano Qabil × Alibaba Cloud

**Speaker note:** Open with the brand, not a feature list. One sentence: a living digital replica of a Pakistani farm that forecasts yield with government rates and tells the farmer what to do next — in Urdu or English.

---

## Slide 2 — The problem (and who it affects)

| Reality on the ground | What happens today |
|---|---|
| New and established farmers lack region-specific guidance | Decisions from habit, neighbours, or guesswork |
| Weather, soil, and water are treated separately | No single picture of the farm |
| Yield and market rates stay in someone’s head | No scannable plan for money and harvest |
| Advice is English-first and desktop-first | Hard to use for many rural users |
| “AI for agri” is often a chatbot | No farm state, no twin, no memory |

**Who is hurt:** smallholders and new farmers, rural livelihoods, and food production when water and inputs are wasted.

**Core question the system answers:**

> Twin this farm → what yield and reference market value should we expect — and what should the farmer do next?

---

## Slide 3 — The solution (and who it serves)

HAPPY VEGGIE is **not** a generic agricultural chatbot. The chat is only one interface.

**Product:** Farm Digital Twin → crop arrangement → yield forecast → government rates → next actions

```text
Soil + Weather + Water + Crop zones + Gov. rates
                    │
                    ▼
           FARM DIGITAL TWIN
     (open field · shed · greenhouse · tunnel · experimental)
                    │
                    ▼
        YIELD + MARKET TABLES  (farmer-scannable)
                    │
                    ▼
     Short plan advice + AI ASSISTANT  (Urdu / English)
```

**Audience**

- **Farmers** — mobile-first Angular app: OTP login, farm setup, twin, **tabular Farm Plan**, assistant  
- **Operators** — admin console: catalogs, rates, feature flags, audit, intelligence oversight

---

## Slide 4 — Need and impact

Aligned with the hackathon bar: practical AI for a real Pakistani problem, with a path past demo day.

| Need | Impact thesis |
|---|---|
| Better crop choice and input timing | Higher yield, lower waste |
| Yield × government rates visible in tables | Farmers see money implications without reading essays |
| Inclusive UX (Urdu + English, phone OTP) | Rural users can actually use it |
| Twin-grounded advice | Decisions tied to *their* fields, not generic tips |

Predictions and scores are **advisory decision-support**, not legal, scientific, or government certification.

---

## Slide 5 — Innovation

What makes this more than “LLM + farm wallpaper”:

1. **Twin-grounded AI** — plans and assistant answers constrained by farm twin context (areas, crops, water, weather/soil signals, neighbours).
2. **Yield & market tables** — deterministic zone rows (yield × gov rate → reference gross) above short prose.
3. **Neighbour / nearby intelligence** — crop compatibility on-farm and anonymized nearby signals.
4. **Green Farm Score** — explainable sustainability indicator for decision support.
5. **Provider ports** — LLM, weather, soil, OTP behind interfaces; stub for reliable demos; live OpenAI-compatible (Groq / DashScope) when keyed.

---

## Slide 6 — Technology

| Layer | Choice |
|---|---|
| API | ASP.NET Core (.NET 10), JWT, CQRS handlers |
| Persistence | EF Core · SQL Server (system of record) · SQLite fallback for local demo |
| Farmer & admin UI | **Angular SPA** (`Frontend/`), Tailwind, ngx-translate EN + Urdu RTL · `:4200` |
| Auth | Phone OTP (mock in demo; live SMS gated by config) |
| Intelligence | Twin assembler · plan generation · AI assistant · alerts · green score |
| Live LLM | OpenAI-compatible `LiveLlmProvider` — Groq default locally; DashScope/Qwen via endpoint + model |

Secrets stay server-side. Weather/soil failures degrade the twin; they do not take the farm down.

> SRS still lists React FC as normative; shipped UI is Angular — documented in `docs/README.md`.

---

## Slide 7 — Feasibility: what we actually built

**Farmer app (mobile-first)**

- Phone OTP auth · GPS farm capture · new-farmer wizard  
- Digital Twin · **Farm Plan with yield/market tables** · AI Farm Assistant · Green Farm Score · alerts  

**Admin console (desktop)**

- Operations, catalogs, government rates, feature flags, audit, intelligence oversight  

**Local demo path**

```powershell
.\scripts\run-all.ps1
```

| Service | URL |
|---|---|
| API / Swagger | http://localhost:5262 · `/swagger` |
| App (farmer) | http://localhost:4200 |
| Admin | http://localhost:4200/admin |

---

## Slide 8 — Live demo narrative

1. Open **http://localhost:4200** → choose **اردو** or **English**.  
2. Sign in with `+923001234567` and demo OTP **1234**.  
3. Open seeded farm — twin weather/water/green score; refresh twin.  
4. Open **Farm Plan** — call out **yield & market value** table, then short advice.  
5. Ask the **AI Farm Assistant** a farm-specific question (e.g. irrigation timing for a crop block).  
6. Optional **Admin**: `admin@happyveggie.pk` / `HappyVeggie!2026` — rates, flags, ops.

**Honest line if live LLM is off:**  
*Provider architecture is OpenAI-compatible (Groq / DashScope); this run uses the twin-grounded stub so the demo is reliable offline.*

---

## Slide 9 — Closing / what’s next

- Turn on live LLM with Groq or DashScope keys (env / user secrets — never committed).  
- Swap weather/soil stubs for live providers behind the same ports.  
- Scale ops via admin console; keep advisory disclaimers clear.  

**GitHub:** https://github.com/Arsal0336/happy-veggies  

> Pakistani talent. Global-grade AI. Farms that can think.

**Speaker note:** End on feasibility — judges can clone, run `run-all`, and walk the farmer journey today.

# HAPPY VEGGIE — Hackathon presentation

**Event:** Alibaba Cloud AI Hackathon Pakistan 2026 (Bano Qabil × Alibaba Cloud)  
**Format:** Markdown pitch deck — paste into slides/PDF as needed  
**Repo:** https://github.com/Arsal0336/happy-veggies

Use one slide per section below. Keep claims honest: providers default to **stub**; live LLM (DashScope / Qwen) is gated by config and a server-side API key.

---

## Slide 1 — Title

**HAPPY VEGGIE**  
AI Farm Digital Twin for Pakistan

*Digitalize your farm. Simulate your decisions. Predict your yield. Optimize every acre.*

Alibaba Cloud AI Hackathon Pakistan 2026 · Bano Qabil × Alibaba Cloud

**Speaker note:** Open with the brand, not a feature list. One sentence: a living digital replica of a Pakistani farm that tells the farmer what to do next — in Urdu or English.

---

## Slide 2 — The problem (and who it affects)

| Reality on the ground | What happens today |
|---|---|
| New and established farmers lack region-specific guidance | Decisions from habit, neighbours, or guesswork |
| Weather, soil, and water are treated separately | No single picture of the farm |
| Advice is English-first and desktop-first | Hard to use for many rural users |
| “AI for agri” is often a chatbot | No farm state, no simulation, no memory |

**Who is hurt:** smallholders and new farmers, rural livelihoods, and food production when water and inputs are wasted.

**Core question the system answers:**

> Given the current state of *this* farm, what should the farmer do next to maximize yield, profitability, and sustainable resource use?

---

## Slide 3 — The solution (and who it serves)

HAPPY VEGGIE is **not** a generic agricultural chatbot. The chat is only the interface.

**Product:** Farm Digital Twin + Farm Intelligence Engine

```text
Soil + Weather + Water + Crop state + Farmer activity
                    │
                    ▼
           FARM DIGITAL TWIN
     (open field · shed · greenhouse · tunnel · experimental)
                    │
                    ▼
           AI FARM ASSISTANT  (Urdu / English)
                    │
     Advice · Risk · Yield · Green Score
```

**Audience**

- **Farmers** — mobile-first app: OTP login, farm setup, crop plan, twin, assistant  
- **Operators** — admin console: catalogs, feature flags, audit, intelligence oversight

---

## Slide 4 — Need and impact

Aligned with the hackathon bar: practical AI for a real Pakistani problem, with a path past demo day.

| Need | Impact thesis |
|---|---|
| Better crop choice and input timing | Higher yield, lower waste |
| Inclusive UX (Urdu + English, phone OTP) | Rural users can actually use it |
| Twin-grounded advice | Decisions tied to *their* fields, not generic tips |

Predictions and scores are **advisory decision-support**, not legal, scientific, or government certification.

---

## Slide 5 — Innovation

What makes this more than “LLM + farm wallpaper”:

1. **Twin-grounded AI** — plans and assistant answers constrained by farm twin context (areas, crops, water, weather/soil signals, neighbours).
2. **Neighbour / nearby intelligence** — crop compatibility on-farm and anonymized nearby signals.
3. **Green Farm Score** — explainable sustainability indicator for decision support.
4. **Custom crop plan in ~60 seconds** — region- and season-aware calendar, inputs, advisory yield.
5. **Provider ports** — LLM, weather, soil, OTP behind interfaces; stub for reliable demos; live DashScope/Qwen when keyed.

---

## Slide 6 — Technology

| Layer | Choice |
|---|---|
| API | ASP.NET Core (.NET 10), JWT, CQRS handlers |
| Persistence | EF Core · SQL Server (system of record) · SQLite fallback for local demo |
| Farmer & admin UI | React, Vite, pnpm workspace, shared i18n (EN + Urdu RTL) |
| Auth | Phone OTP (mock in demo; live SMS gated by config) |
| Intelligence | Twin assembler · plan generation · AI assistant · alerts · green score |
| Cloud AI path | DashScope-compatible endpoint / Qwen models when `Llm:UseLive=true` |

Secrets stay server-side. Weather/soil failures degrade the twin; they do not take the farm down.

---

## Slide 7 — Feasibility: what we actually built

**Farmer app (mobile-first)**

- Phone OTP auth · GPS farm capture · new-farmer wizard  
- Custom crop plan · farming calendar · input guidance  
- Digital Twin view · AI Farm Assistant · Green Farm Score · alerts  

**Admin console (desktop)**

- Operations, catalogs, feature flags, audit, intelligence oversight  

**Local demo path**

```powershell
.\scripts\run-all.ps1
```

| Service | URL |
|---|---|
| API / Swagger | http://localhost:5262 · `/swagger` |
| Farmer web | http://localhost:5173 |
| Admin web | http://localhost:5174 |

---

## Slide 8 — Live demo narrative

1. Open **Farmer web** → choose **اردو** or **English**.  
2. Sign in with `+923001234567` and demo OTP **1234**.  
3. Open seeded farm (or create one): GPS, area, crop, soil/water.  
4. Generate a **custom crop plan** — calendar, inputs, advisory yield.  
5. Open the **Digital Twin**: production areas, weather/soil context, green score; refresh twin.  
6. Ask the **AI Farm Assistant** a farm-specific question (e.g. irrigation timing for a crop block).  
7. Optional **Admin**: `admin@happyveggie.pk` / `HappyVeggie!2026` — catalogs, flags, ops.

**Honest line if live LLM is off:**  
*Provider architecture is wired to DashScope/Qwen; this run uses the twin-grounded stub so the demo is reliable offline.*

---

## Slide 9 — Closing / what’s next

- Turn on live LLM with a DashScope key (env / user secrets — never committed).  
- Swap weather/soil stubs for live providers behind the same ports.  
- Scale ops via admin console; keep advisory disclaimers clear.  

**GitHub:** https://github.com/Arsal0336/happy-veggies  

> Pakistani talent. Global-grade AI. Farms that can think.

**Speaker note:** End on feasibility — judges can clone, run `run-all`, and walk the farmer journey today.

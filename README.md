# HAPPY VEGGIE

### AI Farm Digital Twin for Pakistan

**Digitalize your farm. Arrange crops. Predict yield. Apply market rates. Optimize every acre.**

A living digital replica of a farm that combines weather, soil, water, crop zones, regional intelligence, and **government reference rates** — then shows the farmer, in Urdu or English, **expected yield and money in tables**, plus what to do next.

[![Hackathon](https://img.shields.io/badge/Bano%20Qabil%20×%20Alibaba%20Cloud-AI%20Hackathon%202026-1B7A4E)](https://www.alkhidmat.org/about-us/latest/blog/bano-qabil-alibaba-cloud-launch-ai-hackathon-2026)
[![Impact](https://img.shields.io/badge/Focus-Food%20security%20%26%20rural%20AI-0F766E)](#the-problem)
[![Stack](https://img.shields.io/badge/Stack-.NET%2010%20%7C%20Angular%20%7C%20SQL%20Server-0EA5E9)](#architecture)
[![Languages](https://img.shields.io/badge/Languages-English%20%2B%20Urdu%20(RTL)-7C3AED)](#product)

> Built for the **[Alibaba Cloud AI Hackathon 2026](https://www.alkhidmat.org/about-us/latest/blog/bano-qabil-alibaba-cloud-launch-ai-hackathon-2026)** — a nationwide competition by **Bano Qabil** (Alkhidmat Foundation Pakistan) and **Alibaba Cloud** to turn Pakistani talent into practical AI with global reach.

---

## Why this project exists

Pakistan has no shortage of farmers — and no shortage of talent. What it has lacked is **connective tissue**: between a smallholder with a phone, and world-class AI, weather, soil, and market intelligence.

That is exactly the gap [the hackathon is built to fill](https://www.alkhidmat.org/about-us/latest/blog/bano-qabil-alibaba-cloud-launch-ai-hackathon-2026): not a weekend demo for bragging rights, but a **real-world AI product** that can scale, commercialize, and travel.

**HAPPY VEGGIE** is our answer.

Agriculture employs a huge share of Pakistan’s workforce. Crop choice, planting windows, water, fertilizer, and neighbour-crop conflicts are still decided with incomplete information — especially for **new farmers**. The cost is wasted water, wasted inputs, and lost yield.

We built a platform that a farmer can open on a phone, authenticate with OTP, twin their land (GPS, areas, crop zones, soil, water), and get a **personalized Farm Plan with scannable yield and market-value tables** — then keep a living **Digital Twin** so advice stays grounded in *their* fields, not a generic chatbot.

---

## The problem

| Reality on the ground | What happens today |
|---|---|
| New and established farmers lack region-specific guidance | Decisions from habit, neighbours, or guesswork |
| Weather, soil, and water are treated separately | No single picture of the farm |
| Advice is English-first and desktop-first | Unusable for many rural users |
| “AI for agri” is often a chatbot | No farm state, no simulation, no memory |

**Core question the system answers continuously:**

> Given the current state of *this* farm, what yield and market value should we expect — and what should the farmer do next?

---

## The solution

HAPPY VEGGIE is **not** a generic agricultural chatbot. The chat is only one interface.

The product is:

> **Farm Digital Twin → crop arrangement → yield forecast → government rates → next actions**

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

A farm can be a large property with **many production areas** (open field, protected/in-house, experimental). Each area has crop zones. The twin keeps state for every area — yield estimates × reference rates become **tables on the Farm Plan**, with short AI prose underneath.

---

## Product

### Farmer app (mobile-first)

| Capability | What the farmer gets |
|---|---|
| **Phone OTP auth** | Passwordless login; +92 first |
| **Urdu + English** | Full UI, including RTL for Urdu |
| **GPS farm capture** | Location, region, area, preferred crop |
| **New-farmer wizard** | Soil, budget, water access — start from scratch |
| **Custom crop plan** | Twin-grounded plan with **yield & market tables** + short advice sections |
| **Farming calendar** | Step-by-step “what to do when” |
| **Input guidance** | Water, fertilizer, and resource use |
| **Yield & economics** | Zone-level expected yield × government reference rates (PKR) |
| **Digital Twin** | Living replica of the whole farm ecosystem |
| **AI Farm Assistant** | Per-farm chat grounded in twin context, not generic answers |
| **Green Farm Score** | Explainable sustainability indicator (decision support, not a certification) |
| **Neighbour / nearby intelligence** | Crop compatibility on-farm and anonymized nearby-farm signals |

### Admin console (desktop)

Operations, catalogs, feature flags, audit, and intelligence oversight — web-only, separate session from the farmer app.

---

## Why judges (and farmers) should care

Aligned with what [Bano Qabil × Alibaba Cloud](https://www.alkhidmat.org/about-us/latest/blog/bano-qabil-alibaba-cloud-launch-ai-hackathon-2026) asked for: **practical AI, real-world problems, a path past demo day**.

| Hackathon expectation | How HAPPY VEGGIE delivers |
|---|---|
| Solve a real Pakistani problem | Food production, water, and rural livelihoods |
| AI that is more than a wrapper | Twin-grounded LLM: plans, assistant, green tips; OpenAI-compatible live provider (Groq local default; DashScope/Qwen configurable) |
| Built to scale | CQRS API, SQL Server, provider adapters, feature flags |
| Inclusive | Urdu/English, mobile-first, phone OTP |
| Commercialization-ready | Farmer product + admin ops; not a one-shot notebook |
| Cloud-native path | Stateless API + swap-in LLM/weather/soil providers (Groq, DashScope-class, or other OpenAI-compatible endpoints) |
| Global relevance | Digital twins + sustainable intensification apply beyond Pakistan |

**Impact thesis:** better crop choice and input timing → higher yield and lower waste → more produce for households and markets. Predictions are **advisory**, never a legal guarantee.

---

## Architecture

```text
┌─────────────────────────────┐
│  Angular SPA (:4200)        │
│  Farmer / · Admin /admin    │
│  Tailwind 3 · EN/UR RTL     │
└──────────────┬──────────────┘
               │  HTTPS JSON
               ▼
           ┌────────────────────────────┐
           │  ASP.NET Core Web API      │
           │  JWT · CQRS · thin APIs    │
           │  Twin engine · alerts      │
           └────────────┬───────────────┘
                        ▼
           ┌────────────────────────────┐
           │  SQL Server / SQLite       │
           └────────────────────────────┘
                        ▲
        ports / adapters│
   LLM · weather · soil · OTP
   (stub in local/CI · live behind flags)
```

**Intelligence modules**

1. Farm management (production areas & crop zones)  
2. Digital Farm Twin  
3. Farm twinning (multi-crop / multi-environment)  
4. AI Farm Assistant  
5. Weather, soil, and water intelligence  
6. Crop & seed variety intelligence  
7. Yield & economic intelligence  
8. Nearby farm (anonymized) intelligence  
9. Experimental zones & learning loop  
10. Alerts, history, Green Farm Score  

Providers are **interfaces only**. Composition root selects stub vs live. Secrets stay on the server. Weather/soil failures degrade the twin; they do not take the farm down.

---

## Tech stack

| Layer | Choice |
|---|---|
| API | ASP.NET Core (`.NET 10`) |
| Application | CQRS command/query handlers |
| Persistence | Entity Framework Core, SQL Server |
| Farmer & admin UI | Angular SPA (`Frontend/`), Tailwind 3, ngx-translate EN/UR RTL |
| i18n | `Frontend/src/assets/i18n` — English + Urdu (Nastaliq fonts) |
| Auth | Phone OTP (mock in demo; live SMS gated by config) |
| LLM | `ILlmProvider` — stub by default; live OpenAI-compatible (Groq default locally; DashScope/Qwen via config) |
| Tests | xUnit (backend) |

---

## Quick start

**Prerequisites:** .NET 10 SDK, Node 20+, npm. SQL Server is optional — if it is unreachable, the API uses a local **SQLite** file under `src/HappyVeggie.Api/App_Data/`.

### Run everything (Windows)

```powershell
.\scripts\run-all.ps1
```

| Service | URL |
|---|---|
| API | http://localhost:5262 |
| Swagger | http://localhost:5262/swagger |
| App (farmer) | http://localhost:4200 |
| Admin | http://localhost:4200/admin |

**Demo logins**

| Role | Credentials |
|---|---|
| Farmer | Phone `+923001234567`, OTP `1234` (`Otp:UseMock=true`) |
| Admin | `admin@happyveggie.pk` / `HappyVeggie!2026` |

Logs: `scripts/.runtime/`

Remote SQL Server belongs in gitignored `src/HappyVeggie.Api/appsettings.Local.json`. Set `Database:Provider` to `Auto` (default), `SqlServer`, or `Sqlite`.

**Secrets:** copy [`src/HappyVeggie.Api/.env.example`](src/HappyVeggie.Api/.env.example) for required variable names. Put real values in local `.env`, user secrets, or `appsettings.Local.json` — never commit API keys, tokens, passwords, or production signing keys. `.env` and `.env.*` are gitignored (examples and fixture `.env.test` are excepted).

### Stop everything

```powershell
.\scripts\stop-all.ps1
```

(`scripts/run-all.cmd` and `scripts/stop-all.cmd` do the same.)

### Manual

```bash
# API
dotnet run --project src/HappyVeggie.Api/HappyVeggie.Api.csproj --launch-profile http

# Frontend (Angular)
cd Frontend
npm install
npm start   # :4200 — farmer at / · admin at /admin
```

Demo OTP is mocked (`Otp:UseMock`, code **1234**) so judges can complete the farmer journey without SMS. The API contract is identical for live OTP.

> **Docs note:** Normative SRS still mandates React FC (§2.7). Shipped UI is Angular — see [docs/README.md](docs/README.md). Authoritative specs live under `docs/HAPPY-VEGGIE-*.md` and `docs/01`–`05`.

---

## Repository map

```text
happy-veggies/
├── src/                    # .NET API, domain, application, infrastructure
├── tests/                  # Backend tests
├── Frontend/               # Angular SPA — farmer (/) + admin (/admin)
├── scripts/                # run-all / stop-all (API :5262 + app :4200)
└── docs/                   # SoT (SRS, 01–05) + derived pitch/status — see docs/README.md
```

---

## Demo narrative (judges)

Full talk track: **[docs/DEMO-PITCH.md](docs/DEMO-PITCH.md)**. Document map: **[docs/README.md](docs/README.md)**.

1. Open **http://localhost:4200** → choose **اردو** or **English**.  
2. Sign in with `+923001234567` and demo OTP **1234**.  
3. Open seeded **Green Valley Farm** — call out the **farm schematic**, twin weather/water/green score, and alerts.  
4. **Refresh twin** → weather/green update; open alerts (heat / irrigation).  
5. Open or regenerate the **Farm Plan** — lead with **yield & market value tables** (zone, crop, expected yield, gov rate, gross PKR), then short advice sections.  
6. Ask the **AI Farm Assistant** a farm-specific question (grounded in the twin).  
7. (Optional) **http://localhost:4200/admin** — `admin@happyveggie.pk` / `HappyVeggie!2026` — metrics, plan review, LLM usage. Explore APIs at `/swagger`.

Time-to-wow target: **under ~90 seconds** from login on the seeded farm.

**LLM honesty:** Local live default is often **Groq** (OpenAI-compatible). **DashScope / Qwen** works when `Llm:Endpoint` + `Llm:Model` + API key are set. Stub remains available for offline demos (`Llm:UseLive=false`).

---

## Competition

**Event:** [Alibaba Cloud AI Hackathon 2026](https://www.alkhidmat.org/about-us/latest/blog/bano-qabil-alibaba-cloud-launch-ai-hackathon-2026)  
**Organizers:** [Bano Qabil](https://banoqabil.org/hackathon) (Alkhidmat Foundation Pakistan) × [Alibaba Cloud](https://www.alibabacloud.com/)  
**Launch:** July 2026, Lahore — with Alibaba Cloud, Cogniser Pakistan, Cognix Solutions, universities, and incubators.

The competition is a **pipeline**, not a trophy table: training, international mentorship, Alibaba Cloud technology, and investor/industry exposure for projects that can leave the building.

HAPPY VEGGIE is built for that bar — a production-shaped AI product for Pakistani farmers, designed to be shown to investors as a **launchpad**, not a finish line.

> “Through world-class mentorship, practical learning, and international collaboration, we aim to equip young innovators with the skills, networks, and opportunities needed to transform promising ideas into scalable solutions with global impact.”  
> — **Naveed Ali Baig**, Chairman, Bano Qabil Pakistan

---

## License & disclaimer

Advisory agronomy and economics only. Yield, price, and Green Farm Score are **decision-support**, not government, scientific, or financial certification.

---

**HAPPY VEGGIE** — Pakistani talent. Global-grade AI. Farms that can think.

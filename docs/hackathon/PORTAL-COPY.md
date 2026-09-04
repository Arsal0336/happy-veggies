# HAPPY VEGGIE — Portal submission copy

Paste-ready text for the Alibaba Cloud AI Hackathon Pakistan 2026 submission portal.  
**Deadline:** 4 September 2026, 23:59 PKT.

---

## Project name

HAPPY VEGGIE

---

## One-liner / tagline

AI farm digital twin that tells Pakistani farmers what to do next — in Urdu or English.

---

## Problem (short)

Farmers decide crops, water, and inputs with incomplete, fragmented information. Generic “AI for agri” chatbots ignore farm state, language, and rural phone-first use — leading to wasted water, wasted inputs, and lost yield.

---

## Problem (longer)

Pakistan’s agriculture workforce still makes crop choice, planting windows, irrigation, and fertilizer decisions from habit, neighbours, or guesswork. Weather, soil, and water are treated separately; advice is often English-first and desktop-first. Chatbot-only solutions have no lasting farm model. New and smallholder farmers pay the cost in lower yield and higher waste — which hurts rural livelihoods and food security.

---

## Solution

HAPPY VEGGIE is a **Farm Digital Twin + Farm Intelligence Engine**, not a generic chatbot. Farmers authenticate with phone OTP, describe their land (GPS, area, crop, soil, water), and receive a personalized, region-aware farming plan in about a minute. A living digital twin keeps production areas, crop zones, water, weather/soil context, alerts, and a Green Farm Score. An AI Farm Assistant answers in Urdu or English, grounded in *that* farm’s twin. An admin console supports catalogs, feature flags, audit, and operations.

---

## Impact

Better crop choice and input timing → higher yield and lower waste → more produce for households and markets. Inclusive Urdu/English RTL UX and phone OTP lower the barrier for rural users. All yield, price, and green-score outputs are **advisory decision-support**, not certification.

---

## Innovation

- Twin-grounded LLM plans and chat (stub or live DashScope/Qwen) — not ChatGPT with a farm wallpaper  
- Neighbour / crop compatibility intelligence  
- Explainable Green Farm Score  
- Provider architecture (LLM, weather, soil, OTP) with stub/live ports for reliable demos and a clear cloud path  
- Farmer product + admin ops in one platform  

---

## Technology / tech stack

- **API:** ASP.NET Core (.NET 10), JWT, CQRS  
- **Data:** Entity Framework Core, SQL Server (SQLite fallback for local demo)  
- **Frontend:** React, Vite, pnpm monorepo — farmer-web + admin-web  
- **i18n:** English + Urdu (RTL)  
- **Auth:** Phone OTP (mock in demo; live SMS gated by config)  
- **AI path:** `ILlmProvider` — twin-grounded stub by default; DashScope-compatible / Qwen when `Llm:UseLive` + API key  
- **Tests:** xUnit (backend), Vitest (frontend)  

---

## What’s built / demo instructions

```powershell
.\scripts\run-all.ps1
```

| Service | URL |
|---|---|
| API | http://localhost:5262 |
| Swagger | http://localhost:5262/swagger |
| Farmer web | http://localhost:5173 |
| Admin web | http://localhost:5174 |

**Demo logins**

| Role | Credentials |
|---|---|
| Farmer | Phone `+923001234567`, OTP `1234` (`Otp:UseMock=true`) |
| Admin | `admin@happyveggie.pk` / `HappyVeggie!2026` |

**Judge path:** language → OTP login → farm / twin → generate plan → AI assistant → optional admin.

Time-to-plan target: under ~60 seconds from complete inputs.  
Detailed talk track: [PRESENTATION.md](./PRESENTATION.md) · live demo script: [../DEMO-PITCH.md](../DEMO-PITCH.md)

---

## Repository URL

https://github.com/Arsal0336/happy-veggies

**Branch note:** Prefer submitting **`main`** after merging hygiene + demo work. Feature work currently lives on `faisal/enhance-the-app-to-award-winning-`. Commit/push hygiene (`.gitignore`, `.env.example`, hackathon docs) and merge before the portal deadline if that branch is the demo judges should see.

---

## Presentation

- Deck (Markdown): `docs/hackathon/PRESENTATION.md` in the repo  
- Export to PDF/Google Slides if the portal requires an upload  
- Companion demo script: `docs/DEMO-PITCH.md`

---

## Team / access reminder

Portal account is held by the **team lead** who registered. Team members do not need separate logins. Programme instructions come only via the official email, the portal, and Discord — never share passwords or codes.

---

## Pre-submit checklist

- [ ] Set portal password (email from `no-reply@aihackathon.cognix-pk.com`)
- [ ] Repo hygiene: `.env` / `.env.*` gitignored; examples present; no real API keys committed
- [ ] Secret scan: empty `Llm:ApiKey`; JWT keys are placeholders only; no `appsettings.Local.json` in git
- [ ] GitHub repo is public and cloneable
- [ ] Desired demo branch merged to `main` (or portal notes the correct branch/commit)
- [ ] Presentation uploaded or linked (`docs/hackathon/PRESENTATION.md` / PDF)
- [ ] Portal fields pasted from this file
- [ ] Submit before **4 September 2026, 23:59 PKT**

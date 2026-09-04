# HAPPY VEGGIE — Portal submission copy

Paste-ready text for the Alibaba Cloud AI Hackathon Pakistan 2026 submission portal.  
**Deadline:** 4 September 2026, 23:59 PKT.

---

## Project name

HAPPY VEGGIE

---

## One-liner / tagline

AI farm digital twin that forecasts yield with government rates and tells Pakistani farmers what to do next — in Urdu or English.

---

## Problem (short)

Farmers decide crops, water, and inputs with incomplete, fragmented information. Generic “AI for agri” chatbots ignore farm state, language, and rural phone-first use — and never make yield vs market rates scannable — leading to wasted water, wasted inputs, and lost yield.

---

## Problem (longer)

Pakistan’s agriculture workforce still makes crop choice, planting windows, irrigation, and fertilizer decisions from habit, neighbours, or guesswork. Weather, soil, and water are treated separately; advice is often English-first and desktop-first. Chatbot-only solutions have no lasting farm model and bury numbers in paragraphs. New and smallholder farmers pay the cost in lower yield and higher waste — which hurts rural livelihoods and food security.

---

## Solution

HAPPY VEGGIE is a **Farm Digital Twin** that arranges crop zones, **predicts yield**, applies **government reference rates**, and advises next actions — not a generic chatbot. Farmers authenticate with phone OTP, twin their land (GPS, areas, zones, soil, water), and open a Farm Plan with **scannable yield and market-value tables** plus short advice. An AI Farm Assistant answers in Urdu or English, grounded in *that* farm’s twin. An admin console supports catalogs, rates, feature flags, audit, and operations.

---

## Impact

Better crop choice and input timing → higher yield and lower waste → more produce for households and markets. Inclusive Urdu/English RTL UX and phone OTP lower the barrier for rural users. All yield, price, and green-score outputs are **advisory decision-support**, not certification.

---

## Innovation

- Twin → zones → yield × gov rates → tabular Farm Plan + short grounded chat — not ChatGPT with a farm wallpaper  
- Neighbour / crop compatibility intelligence  
- Explainable Green Farm Score  
- Provider architecture (LLM, weather, soil, OTP) with stub/live ports — OpenAI-compatible live (Groq local / DashScope configurable)  
- Farmer product + admin ops in one Angular SPA  

---

## Technology / tech stack

- **API:** ASP.NET Core (.NET 10), JWT, CQRS  
- **Data:** Entity Framework Core, SQL Server (SQLite fallback for local demo)  
- **Frontend:** Angular SPA (`Frontend/`) — farmer `/` + admin `/admin` on `:4200`  
- **i18n:** English + Urdu (RTL)  
- **Auth:** Phone OTP (mock in demo; live SMS gated by config)  
- **AI path:** `ILlmProvider` — twin-grounded stub by default; live OpenAI-compatible (`Llm:UseLive` + API key; Groq default locally; DashScope/Qwen via endpoint)  
- **Tests:** xUnit (backend)  

---

## What’s built / demo instructions

```powershell
.\scripts\run-all.ps1
```

| Service | URL |
|---|---|
| API | http://localhost:5262 |
| Swagger | http://localhost:5262/swagger |
| Farmer app | http://localhost:4200 |
| Admin | http://localhost:4200/admin |

**Demo logins**

| Role | Credentials |
|---|---|
| Farmer | Phone `+923001234567`, OTP `1234` (`Otp:UseMock=true`) |
| Admin | `admin@happyveggie.pk` / `HappyVeggie!2026` |

**Judge path:** language → OTP login → farm / twin → **Farm Plan tables (yield/rates)** → AI assistant → optional admin.

Time-to-plan target: under ~60 seconds from complete inputs.  
Detailed talk track: [PRESENTATION.md](./PRESENTATION.md) · live demo script: [../DEMO-PITCH.md](../DEMO-PITCH.md) · docs map: [../README.md](../README.md)

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

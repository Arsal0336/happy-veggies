# Happy Veggie — Judge demo script & selling narrative

**Hackathon:** Bano Qabil × Alibaba Cloud AI Hackathon 2026  
**Product line:** AI farm digital twin for Pakistani growers — **yield forecast + government rates** grounded in *this* farm’s land, water, weather, and crop neighbours.

---

## Credentials (local / stage demo)

| Role | Login |
|------|--------|
| Farmer | Phone `+923001234567` · OTP `1234` |
| Admin | `admin@happyveggie.pk` · `HappyVeggie!2026` |

Apps (default): API `:5262` · **Angular SPA `:4200`** (farmer `/` · admin `/admin`).

---

## 90-second live path

1. **Language** → English (or Urdu to show RTL chrome).
2. **OTP login** → lands on **My farms** → open **Green Valley Farm**.
3. **Farm home** — call out:
   - Weather temperature + condition from twin snapshot  
   - Water reliability / furrow irrigation  
   - Green score (completeness of twin data)  
   - Unread **Heat advisory** + irrigation alerts  
   - Farm schematic: tomato + onion + marigold neighbours  
4. Tap **Refresh twin** — status updates; story: “advice follows the twin, not a generic chat.”
5. Open **Plan** (or regenerate) — lead with tables:
   - **Farm at a glance**  
   - **Yield & market value** (zone · crop · area · expected yield · gov rate · reference gross PKR)  
   - Compatibility warnings if any  
   - Then short advice sections (not long English essays)  
6. **Assistant** — ask: *“When should I irrigate my tomato block?”*  
   Answer cites cool hours + twin rainfall / water notes.
7. Optional **Admin** flip: metrics → farmers → inspect farm twin → plan review / LLM usage.

**Closing line:**  
*Not ChatGPT with a farm wallpaper — twin-grounded AI (stub offline, or live OpenAI-compatible: Groq locally / DashScope Qwen when configured), constrained by this farm’s digital twin and government rates.*

---

## Before / after selling contrast

| Generic chatbot | Happy Veggie |
|-----------------|--------------|
| “Water your crops more.” | “Furrow-irrigate **Tomato block A** early morning; twin shows ~2 mm rain and tube-well reliability ~0.85; heat advisory → avoid midday spray.” |
| Vague yield talk | **Table:** zone yield × gov rate → reference gross PKR |
| One-size Pakistan advice | Islamabad farm, open-field zones, neighbour marigold border, seeded plan + alerts |
| English-only dump | UI en/ur RTL; plan/assistant bodies follow `language` |
| No ops story | Admin portal: farmers, rates, plan review, usage analytics |

---

## Live LLM — honest config

Default for CI / offline: **stub** (`Llm:UseLive=false`).

Live path uses **OpenAI-compatible** `LiveLlmProvider` (`Llm:Endpoint` + `Llm:ApiKey` + `Llm:Model`).

### Local default (Groq)

```bash
# PowerShell example — keys in appsettings.Local.json or user-secrets (never commit)
cd src/HappyVeggie.Api
dotnet user-secrets set "Llm:UseLive" "true"
dotnet user-secrets set "Llm:ApiKey" "<YOUR_GROQ_KEY>"
# Typical: Llm:Endpoint = https://api.groq.com/openai/v1
# Model e.g. openai/gpt-oss-120b (check current Groq catalog)
```

### Alibaba Cloud (DashScope / Qwen) alternate

1. Create a DashScope API key (Model Studio / DashScope).
2. Set:

```bash
dotnet user-secrets set "Llm:UseLive" "true"
dotnet user-secrets set "Llm:ApiKey" "<YOUR_DASHSCOPE_KEY>"
dotnet user-secrets set "Llm:Model" "qwen-plus"
dotnet user-secrets set "Llm:Endpoint" "https://dashscope-intl.aliyuncs.com/compatible-mode/v1"
```

(China region may use `https://dashscope.aliyuncs.com/compatible-mode/v1`.)

3. Optional: enable DB feature flag `llm.live` in Admin → Feature flags.
4. Restart API → regenerate plan / ask assistant → admin analytics should show non-stub model + token usage.

**Honest badge for judges:** If live is off, say *“Provider architecture is OpenAI-compatible (Groq / DashScope); this run uses the twin-grounded stub so the demo is reliable offline.”*

---

## Pitch one-pager (talk track)

**Problem:** Pakistani growers get generic advice that ignores their plot, water, neighbours, language — and cannot see yield vs market rates at a glance.

**Solution:** Happy Veggie **twins the farm**, arranges crop zones, **estimates yield**, applies **government reference rates**, and shows **scannable plan tables** plus short grounded advice through `ILlmProvider`.

**Why us:** End-to-end farmer + admin product (Angular SPA), Urdu/RTL, compatibility neighbours, green score honesty, and a clear path from hackathon demo to NGO/extension ops.

**Ask:** Pilot with extension officers / progressive growers; expand live weather + learning loop next.

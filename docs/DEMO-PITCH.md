# Happy Veggie — Judge demo script & selling narrative

**Hackathon:** Bano Qabil × Alibaba Cloud AI Hackathon 2026  
**Product line:** AI farm digital twin for Pakistani growers — plans and advice grounded in *this* farm’s land, water, weather, and crop neighbours.

---

## Credentials (local / stage demo)

| Role | Login |
|------|--------|
| Farmer | Phone `+923001234567` · OTP `1234` |
| Admin | `admin@happyveggie.pk` · `HappyVeggie!2026` |

Apps (default): API `:5262` · Farmer `:5173` · Admin `:5174`.

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
5. Open **Plan** (or generate) — structured sections (overview, water, next actions) with disclaimer.
6. **Assistant** — ask: *“When should I irrigate my tomato block?”*  
   Answer cites cool hours + twin rainfall / water notes.
7. Optional **Admin** flip: metrics → farmers → inspect farm twin → plan review / LLM usage.

**Closing line:**  
*Not ChatGPT with a farm wallpaper — Alibaba Cloud Qwen (when live) or twin-grounded stub AI, constrained by this farm’s digital twin.*

---

## Before / after selling contrast

| Generic chatbot | Happy Veggie |
|-----------------|--------------|
| “Water your crops more.” | “Furrow-irrigate **Tomato block A** early morning; twin shows ~2 mm rain and tube-well reliability ~0.85; heat advisory → avoid midday spray.” |
| One-size Pakistan advice | Islamabad farm, open-field zones, neighbour marigold border, seeded plan + alerts |
| English-only dump | UI en/ur RTL; plan/assistant bodies follow `language` (stub Urdu + live Qwen Urdu system hint) |
| No ops story | Admin portal: farmers, rates, plan review, usage analytics |

---

## Alibaba Cloud (DashScope / Qwen) — how to go live

Default remains **stub** for CI and offline demos (`Llm:UseLive=false`).

1. Create a DashScope API key (Alibaba Cloud Model Studio / DashScope).
2. Configure API (user-secrets or env — never commit keys):

```bash
# PowerShell example
cd src/HappyVeggie.Api
dotnet user-secrets set "Llm:ApiKey" "<YOUR_DASHSCOPE_KEY>"
dotnet user-secrets set "Llm:UseLive" "true"
```

Or env: `Llm__ApiKey`, `Llm__UseLive=true`.

3. Optional: enable DB feature flag `llm.live` in Admin → Feature flags (either config `UseLive` or flag is enough when key is set).
4. Confirm `appsettings` model/endpoint:

- `Llm:Model` = `qwen-plus` (or your entitled Qwen model)  
- `Llm:Endpoint` = `https://dashscope-intl.aliyuncs.com/compatible-mode/v1`  
  (China region may use `https://dashscope.aliyuncs.com/compatible-mode/v1`)

5. Restart API → generate plan / ask assistant → admin analytics should show non-stub model + token usage.

**Honest badge for judges:** If live is off, say *“Provider architecture is wired to DashScope; this run uses the twin-grounded stub so the demo is reliable offline.”*

---

## Pitch one-pager (talk track)

**Problem:** Pakistani growers get generic advice that ignores their plot, water, neighbours, and language.

**Solution:** Happy Veggie builds a **farm digital twin** (areas, zones, water, soil, weather snapshot, alerts) and generates **structured plans + grounded chat** through `ILlmProvider` — stub for demos, **Alibaba Cloud Qwen via DashScope** when keys are present.

**Why us:** End-to-end farmer + admin product, Urdu/RTL, compatibility neighbours, green score honesty, and a clear path from hackathon demo to NGO/extension ops.

**Ask:** Pilot with extension officers / progressive growers; expand live weather + learning loop next.

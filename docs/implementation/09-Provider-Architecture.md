# GAP-004 — Provider Architecture Blueprint

## Principle
Application/domain code depends on **interfaces only**. Composition root selects stub vs live via config/feature flags.

## Interfaces

| Interface | Stub | Live | Flag / config |
|-----------|------|------|---------------|
| `ILlmProvider` | `StubLlmProvider` (en/ur twin-grounded templates) | `LiveLlmProvider` (Groq OpenAI-compatible by default) | `Llm:UseLive` + flag `llm.live` + `Llm:ApiKey` |
| `IWeatherProvider` | `StubWeatherProvider` | **Open-Meteo** `LiveWeatherProvider` | `Weather:UseLive` + `Weather:BaseUrl` |
| `ISoilProvider` | `StubSoilProvider` | **ISRIC SoilGrids** `LiveSoilProvider` | `Soil:UseLive` + `Soil:BaseUrl` |
| `IOtpProvider` | `MockOtpProvider` | `LiveOtpProvider` (TBD-03; throws) | `Otp:UseMock` |
| `IPortfolioOptimizerClient` | N/A (degrade) | **PyPortfolioOpt** FastAPI sidecar | `Portfolio:UseLive` + `Portfolio:BaseUrl` |

## Decided vendors (2026-09-04)

| Concern | Vendor | Notes |
|---------|--------|-------|
| LLM | Groq (`openai/gpt-oss-120b`) default | OpenAI-compatible; DashScope/Qwen via `Llm:Endpoint` + `Llm:Model` + key |
| Weather | [Open-Meteo](https://open-meteo.com/) | No API key; `api.open-meteo.com/v1/forecast` |
| Soil | [ISRIC SoilGrids](https://www.isric.org/explore/soilgrids) REST v2 | Beta; may pause — degrade to null / status failed |
| Portfolio | [PyPortfolioOpt](https://pyportfolioopt.readthedocs.io/) | Sidecar `services/portfolio-optimizer` on `:8091` |

## Behavior contract

| Concern | Rule |
|---------|------|
| Secrets | Server-only; Open-Meteo/SoilGrids need none; LLM key never in git |
| Timeouts | `Providers:TimeoutSeconds`; SoilGrids uses longer bound (60s); Portfolio `Portfolio:TimeoutSeconds`; LLM `Llm:TimeoutSeconds` |
| Weather/soil fail | Twin refresh still succeeds; status = `failed` (EIR-005) |
| Portfolio fail | Returns `status: degraded` with reason; farm CRUD unaffected |
| OTP fail | Rate-limit friendly; never log OTP codes |

## Wiring

1. `RefreshTwinCommandHandler.TryGetWeatherAsync` / `TryGetSoilAsync` — `CancelAfter(Providers:TimeoutSeconds)` then catch → status `failed`.
2. `GET /farms/{id}/portfolio` → `PortfolioService` → PyPortfolioOpt sidecar.
3. `StubLlmProvider` / `LiveLlmProvider` — linked CTS with `options.Timeout` before work / readiness checks.
4. Feature flags may still gate enrichment intent (`weather.enrichment`, `soil.enrichment`, `llm.live`).
5. Config: `appsettings.json` → `Providers:TimeoutSeconds`, `Llm:TimeoutSeconds`, `Weather:*`, `Soil:*`, `Portfolio:*`.

See also `docs/implementation/10-Observability.md`.

## Wiring targets

1. `RefreshTwinCommandHandler` must call weather/soil providers (not hardcode `"stub"` only)
2. Plan/Assistant/GreenTips already call `ILlmProvider` — swap implementation at DI
3. Feature flags (GAP-013) override config at runtime when entity exists

## LLM DI (GAP-030)

- Default: `StubLlmProvider` (safe for CI/dev). Optionally writes `LlmUsageLogs` with `model=stub`, `EstimatedCostUsd=0`. Urdu plan/assistant bodies when context language is `ur`.
- `Llm:UseLive=true` → register `LiveLlmProvider` (OpenAI-compatible Chat Completions; Groq default).
- Live checks: `Llm:ApiKey` required; `llm.live` flag **or** `Llm:UseLive` allows the call.
- Config: `Llm:Model` (default `openai/gpt-oss-120b`), `Llm:Endpoint` (default `https://api.groq.com/openai/v1`). Alternate: DashScope-compatible endpoint + Qwen model IDs.
- Usage table: `LlmUsageLogs` (`Id`, `FarmId?`, `Purpose`, `Model`, `PromptTokens`, `CompletionTokens`, `EstimatedCostUsd`, `CreatedAt`).
- Judge script: `docs/DEMO-PITCH.md`.

## Dev / test
- Default live weather/soil enabled in appsettings (no keys)
- Portfolio requires sidecar running; otherwise API degrades honestly
- CI unit tests mock HttpClient for Open-Meteo/SoilGrids JSON mapping
- Stubs remain when `UseLive=false`

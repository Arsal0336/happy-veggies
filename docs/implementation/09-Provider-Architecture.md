# GAP-004 — Provider Architecture Blueprint

## Principle
Application/domain code depends on **interfaces only**. Composition root selects stub vs live via config/feature flags. **Vendors remain TBD** (register 08).

## Interfaces (existing)

| Interface | Stub | Live slot | Flag / config |
|-----------|------|-----------|---------------|
| `ILlmProvider` | `StubLlmProvider` (en/ur twin-grounded templates) | `LiveLlmProvider` (Alibaba DashScope / Qwen OpenAI-compatible) | `Llm:UseLive` + flag `llm.live` + `Llm:ApiKey` |
| `IWeatherProvider` | `StubWeatherProvider` | `LiveWeatherProvider` (TBD-04) | `Weather:Enabled` / `weather.enrichment` |
| `ISoilProvider` | `StubSoilProvider` | `LiveSoilProvider` (TBD-05) | `Soil:Enabled` / `soil.enrichment` |
| `IOtpProvider` | `MockOtpProvider` | `LiveOtpProvider` (TBD-03; currently throws) | `Otp:UseMock` |

## Behavior contract

| Concern | Rule |
|---------|------|
| Secrets | Server-only (user secrets / env / KeyVault); never in FE |
| Timeouts | `Providers:TimeoutSeconds` (default **5s**) via linked `CancellationTokenSource` in `RefreshTwinCommandHandler` for weather/soil; LLM uses `LlmOptions.Timeout` / `Llm:TimeoutSeconds` inside `StubLlmProvider` / `LiveLlmProvider` (GAP-073) |
| Retry | Retryable errors → `retryable: true` in API envelope where applicable |
| LLM cost | Log token/usage estimates to support admin analytics |
| Weather/soil fail | Twin refresh still succeeds; status = `failed` / `stub` (EIR-005); timeout → `failed` |
| OTP fail | Rate-limit friendly errors; never log OTP codes |
| Circuit breaker | Optional in-memory breaker **not** required this phase — prefer timeout + degrade already in RefreshTwin |

## Timeout evidence (GAP-073)

1. `RefreshTwinCommandHandler.TryGetWeatherAsync` / `TryGetSoilAsync` — `CancelAfter(Providers:TimeoutSeconds)` then catch → status `failed`.
2. `StubLlmProvider` / `LiveLlmProvider` — linked CTS with `options.Timeout` before work / readiness checks.
3. Config: `appsettings.json` → `Providers:TimeoutSeconds`, `Llm:TimeoutSeconds`.

See also `docs/implementation/10-Observability.md`.

## Wiring targets

1. `RefreshTwinCommandHandler` must call weather/soil providers (not hardcode `"stub"` only)
2. Plan/Assistant/GreenTips already call `ILlmProvider` — swap implementation at DI
3. Feature flags (GAP-013) override config at runtime when entity exists

## LLM DI (GAP-030)

- Default: `StubLlmProvider` (safe for CI/dev). Optionally writes `LlmUsageLogs` with `model=stub`, `EstimatedCostUsd=0`. Urdu plan/assistant bodies when context language is `ur`.
- `Llm:UseLive=true` → register `LiveLlmProvider` (DashScope OpenAI-compatible Chat Completions).
- Live checks: `Llm:ApiKey` required; `llm.live` flag **or** `Llm:UseLive` allows the call.
- Config: `Llm:Model` (default `qwen-plus`), `Llm:Endpoint` (default `https://dashscope-intl.aliyuncs.com/compatible-mode/v1`).
- Usage table: `LlmUsageLogs` (`Id`, `FarmId?`, `Purpose`, `Model`, `PromptTokens`, `CompletionTokens`, `EstimatedCostUsd`, `CreatedAt`).
- Judge script: `docs/DEMO-PITCH.md`.

## Dev / test
- Default: stubs/mock OTP
- CI: stubs only
- Staging: live behind flags when vendors decided

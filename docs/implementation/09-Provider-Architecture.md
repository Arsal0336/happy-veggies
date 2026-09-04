# GAP-004 — Provider Architecture Blueprint

## Principle
Application/domain code depends on **interfaces only**. Composition root selects stub vs live via config/feature flags.

## Interfaces

| Interface | Stub | Live | Flag / config |
|-----------|------|------|---------------|
| `ILlmProvider` | `StubLlmProvider` | `LiveLlmProvider` (vendor TBD-02) | `Llm:UseLive` + flag `llm.live` |
| `IWeatherProvider` | `StubWeatherProvider` | **Open-Meteo** `LiveWeatherProvider` | `Weather:UseLive` + `Weather:BaseUrl` |
| `ISoilProvider` | `StubSoilProvider` | **ISRIC SoilGrids** `LiveSoilProvider` | `Soil:UseLive` + `Soil:BaseUrl` |
| `IOtpProvider` | `MockOtpProvider` | `LiveOtpProvider` (TBD-03; throws) | `Otp:UseMock` |
| `IPortfolioOptimizerClient` | N/A (degrade) | **PyPortfolioOpt** FastAPI sidecar | `Portfolio:UseLive` + `Portfolio:BaseUrl` |

## Decided vendors (2026-09-04)

| Concern | Vendor | Notes |
|---------|--------|-------|
| Weather | [Open-Meteo](https://open-meteo.com/) | No API key; `api.open-meteo.com/v1/forecast` |
| Soil | [ISRIC SoilGrids](https://www.isric.org/explore/soilgrids) REST v2 | Beta; may pause — degrade to null / status failed |
| Portfolio | [PyPortfolioOpt](https://pyportfolioopt.readthedocs.io/) | Sidecar `services/portfolio-optimizer` on `:8091` |

## Behavior contract

| Concern | Rule |
|---------|------|
| Secrets | Server-only; Open-Meteo/SoilGrids need none |
| Timeouts | `Providers:TimeoutSeconds`; SoilGrids uses longer bound (3×); Portfolio `Portfolio:TimeoutSeconds` |
| Weather/soil fail | Twin refresh still succeeds; status = `failed` (EIR-005) |
| Portfolio fail | Returns `status: degraded` with reason; farm CRUD unaffected |
| OTP fail | Rate-limit friendly; never log OTP codes |

## Wiring

1. `RefreshTwinCommandHandler` calls weather/soil providers
2. `GET /farms/{id}/portfolio` → `PortfolioService` → PyPortfolioOpt sidecar
3. Feature flags may still gate enrichment intent (`weather.enrichment`, `soil.enrichment`)

## Dev / test
- Default live weather/soil enabled in appsettings (no keys)
- Portfolio requires sidecar running; otherwise API degrades honestly
- CI unit tests mock HttpClient for Open-Meteo/SoilGrids JSON mapping
- Stubs remain when `UseLive=false`

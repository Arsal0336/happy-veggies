# Observability (GAP-071 / GAP-074)

## Approach

Built-in ASP.NET Core host logging only. **No external APM vendors** are required or invented for this phase.

| Signal | Mechanism |
|--------|-----------|
| Structured logs | Default host + `AddConsole()` in `Program.cs` (category, message templates, scopes) |
| Correlation | `X-Correlation-Id` request header honored by `CorrelationIdMiddleware`; otherwise `HttpContext.TraceIdentifier`; echoed on responses; included as `correlationId` in `ApiErrorResponse` |
| Errors | `ExceptionHandlingMiddleware` logs path + exception; returns Doc 05 envelope |
| Availability | `GET /api/v1/system/health` — DB reachable + `FeatureFlags` count (503 if DB down) |
| Liveness | `GET /api/v1/system/ping` — process up |

## What is logged

- Validation / authz / not-found warnings with request path
- Unhandled exceptions (server error path; no stack traces in response body)
- Live LLM attempt warnings (`Purpose`, `Model`) — never API keys
- LLM usage rows in `LlmUsageLogs` (tokens, model, estimated cost) for admin analytics

## Prohibitions (NFR-013)

- **Never** log OTP codes, passwords, JWT signing keys, or provider API keys
- **Never** log raw Authorization bearer tokens
- `MockOtpProvider` does not emit OTP codes (opaque request id only; validation does not log `code`)

## Rate-limit telemetry

Rejected requests return HTTP **429** with envelope `code: RATE_LIMITED`, `retryable: true` (see Doc 05). Limits documented in `appsettings.json` → `RateLimiting`.

## SLO intent (GAP-074) — targets TBD

| Metric | Intent | Status |
|--------|--------|--------|
| API availability | NFR-010 aspirational ≥ 99.5% monthly excl. maintenance | **TBD / target** — measure via `/system/health` probes in hosting |
| Plan generate p95 | NFR-001 ~60s | **TBD / target** |
| Assistant short-answer p95 | NFR-011 e.g. ≤ 15s | **TBD / target** |

Host-level uptime checks should hit `/api/v1/system/health` (and optionally `/ping`). Detailed SLOs remain open until ops hosting tier is fixed.

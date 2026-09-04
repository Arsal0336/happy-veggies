# Portfolio optimizer (PyPortfolioOpt)

Sidecar used by Happy Veggie API for `GET /api/v1/farms/{farmId}/portfolio` (GAP-054 / TBD-11).

## Setup

```bash
cd services/portfolio-optimizer
python -m venv .venv
# Windows:
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app:app --host 127.0.0.1 --port 8091
```

## Health

`GET http://127.0.0.1:8091/health`

## Config (ASP.NET)

```json
"Portfolio": {
  "UseLive": true,
  "BaseUrl": "http://127.0.0.1:8091",
  "TimeoutSeconds": 15
}
```

When `UseLive=false` or the sidecar is unreachable, the API returns a structured degrade response (farm CRUD still works).

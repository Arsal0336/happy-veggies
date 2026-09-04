"""
Happy Veggie portfolio optimizer sidecar (PyPortfolioOpt).

POST /optimize
{
  "assets": [
    {
      "id": "tomato",
      "name": "Tomato",
      "expected_return": 0.18,
      "risk": 0.22,
      "min_weight": 0.0,
      "max_weight": 0.6,
      "area_type": "open_field",
      "suitability": 0.9,
      "water_fit": 0.8,
      "green_factor": 0.5
    }
  ],
  "risk_free_rate": 0.02
}

Returns max-Sharpe (or min-volatility fallback) weights; area acres applied by the .NET caller.
"""

from __future__ import annotations

import math
from typing import Any

import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from pypfopt import EfficientFrontier

app = FastAPI(title="Happy Veggie Portfolio Optimizer", version="1.0.0")


class AssetIn(BaseModel):
    id: str
    name: str = ""
    expected_return: float = Field(..., description="Expected economic return (fraction)")
    risk: float = Field(0.2, ge=0.01, description="Standalone risk (stdev proxy)")
    min_weight: float = Field(0.0, ge=0.0, le=1.0)
    max_weight: float = Field(1.0, ge=0.0, le=1.0)
    area_type: str | None = None
    suitability: float = 1.0
    water_fit: float = 1.0
    green_factor: float = 0.5


class OptimizeRequest(BaseModel):
    assets: list[AssetIn]
    risk_free_rate: float = 0.02


class AllocationOut(BaseModel):
    id: str
    name: str
    weight: float
    area_type: str | None = None


class OptimizeResponse(BaseModel):
    status: str = "ok"
    method: str
    allocations: list[AllocationOut]
    expected_portfolio_return: float | None = None
    portfolio_volatility: float | None = None
    engine: str = "pypfopt"


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "engine": "pypfopt"}


@app.post("/optimize", response_model=OptimizeResponse)
def optimize(req: OptimizeRequest) -> OptimizeResponse:
    if len(req.assets) < 1:
        raise HTTPException(status_code=400, detail="At least one asset required")

    # Soft-fold suitability / water / green into expected return (FR-117: green is one dimension).
    # Suitability and water dominate; green is a mild tilt only.
    adjusted: list[tuple[AssetIn, float]] = []
    for a in req.assets:
        soft = (0.55 * a.suitability) + (0.30 * a.water_fit) + (0.15 * a.green_factor)
        mu = max(a.expected_return, 1e-4) * max(soft, 0.05)
        adjusted.append((a, mu))

    if len(adjusted) == 1:
        a, _ = adjusted[0]
        return OptimizeResponse(
            method="single_asset",
            allocations=[AllocationOut(id=a.id, name=a.name or a.id, weight=1.0, area_type=a.area_type)],
            expected_portfolio_return=adjusted[0][1],
            portfolio_volatility=a.risk,
        )

    ids = [a.id for a, _ in adjusted]
    mu = pd.Series({a.id: m for a, m in adjusted})
    # Diagonal covariance from risk proxies (no historical series available).
    risks = np.array([max(a.risk, 0.01) for a, _ in adjusted], dtype=float)
    cov = np.diag(np.square(risks))
    S = pd.DataFrame(cov, index=ids, columns=ids)

    # Bounds per asset
    lower = {a.id: a.min_weight for a, _ in adjusted}
    upper = {a.id: max(a.max_weight, a.min_weight) for a, _ in adjusted}
    # Ensure upper sum can reach 1
    if sum(upper.values()) < 0.999:
        raise HTTPException(status_code=400, detail="max_weight sum < 1; cannot fully allocate")

    bounds = [(lower[aid], upper[aid]) for aid in ids]
    method = "max_sharpe"
    expected_ret: float | None
    vol: float | None
    try:
        ef = EfficientFrontier(mu, S, weight_bounds=bounds)
        ef.max_sharpe(risk_free_rate=req.risk_free_rate)
        cleaned = ef.clean_weights()
        expected_ret, vol, _ = ef.portfolio_performance(risk_free_rate=req.risk_free_rate)
    except Exception:
        method = "min_volatility"
        try:
            ef = EfficientFrontier(mu, S, weight_bounds=bounds)
            ef.min_volatility()
            cleaned = ef.clean_weights()
            expected_ret, vol, _ = ef.portfolio_performance(risk_free_rate=req.risk_free_rate)
        except Exception:
            # Equal-weight fallback among assets
            method = "equal_weight_fallback"
            n = len(adjusted)
            cleaned = {a.id: 1.0 / n for a, _ in adjusted}
            expected_ret = float(np.mean([m for _, m in adjusted]))
            vol = float(np.mean(risks))

    # Renormalize
    total = sum(max(0.0, float(w)) for w in cleaned.values()) or 1.0
    by_id = {a.id: a for a, _ in adjusted}
    allocations = [
        AllocationOut(
            id=aid,
            name=by_id[aid].name or aid,
            weight=round(float(cleaned.get(aid, 0.0)) / total, 6),
            area_type=by_id[aid].area_type,
        )
        for aid in ids
        if float(cleaned.get(aid, 0.0)) / total > 1e-6
    ]

    return OptimizeResponse(
        method=method,
        allocations=allocations,
        expected_portfolio_return=None if expected_ret is None or (isinstance(expected_ret, float) and math.isnan(expected_ret)) else float(expected_ret),
        portfolio_volatility=None if vol is None or (isinstance(vol, float) and math.isnan(vol)) else float(vol),
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=8091)

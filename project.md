# Stack Compare — Product Spec

## The idea

A generic asset-reallocation simulator with Monte Carlo–powered projections. It answers the question:

> "I have X — should I reallocate (part of it) to Y? Show me the distribution of outcomes."

This is a spiritual successor to `btc-planner` (which is hard-wired to "sell Bulgarian land, buy BTC"). Stack Compare generalizes the idea: any asset in, any asset out, with guardrails for emergency-buffer discipline and support for DCA + portfolio mixes.

---

## Target user

Anyone considering a reallocation decision:

- "Should I sell rental property and buy index funds?"
- "Should I take my cash pile and DCA into BTC + gold over 24 months?"
- "Should I rotate NVDA profits into a 60/40 portfolio?"
- "Is holding bonds worth the opportunity cost vs S&P over 10 years?"

No engineering knowledge required. No config files. Everything is driven by the UI.

---

## Core differentiators

1. **Asset-class library** — not a blank textbox. Curated cards for major asset classes with sensible defaults (historical CAGR, volatility, correlations).
2. **BTC power-law engine** — ported from `btc-planner`; the "crown jewel" model for BTC projections (better than plain GBM for Bitcoin).
3. **Correlated portfolio mixes** — Cholesky-decomposed multivariate paths, so "60% S&P + 40% BTC" doesn't assume independence.
4. **Emergency buffer discipline** — tool enforces a recommended buffer before any capital is considered deployable.
5. **DCA + lump-sum + hybrid** — supports single-shot deployment, monthly DCA, or both.
6. **Client-only, privacy-first** — no backend, no accounts. Everything in `localStorage`, exportable/importable as JSON.

---

## User journey

### 1. First visit → Onboarding (3–5 minutes)

**Screen 1 — "What are you comparing?"**
- Grid of asset-class cards. Each card shows: icon, name, historical CAGR, volatility, 1-sentence explainer.
- User picks a **"sell side"** (asset(s) they might liquidate) and a **"buy side"** (target deployment, which may be a mix).
- Examples: Cash, BTC, S&P 500, NASDAQ, Gold, Silver, Bonds (AGG), Real Estate (generic), Chinese Stocks, Individual Stock (custom), HYSA.

**Screen 2 — "Your starting point"**
- Lump-sum from liquidation (USD amount)
- Monthly allocation from income (USD/month)
- Time horizon (1 / 3 / 5 / 10 years)

**Screen 3 — "Safety net"**
- Monthly essential expenses → tool auto-calculates 6 months buffer (default; adjustable 3/6/9/12)
- Buffer is **subtracted from deployable capital** by default.
- Clear warning if user overrides.

**Rule of thumb:** 3–6 months for stable employment, 6–12 months for self-employed/variable, 12+ months for volatile industries / dependents.

**Screen 4 — "Target mix"**
- If buy side has multiple assets, user assigns % weights (sums to 100%).
- Optional: the tool proposes a suggested mix based on risk tolerance.

### 2. Planner

- Left: sliders for tweaking allocations, costs, time horizon, DCA amount.
- Right: MC results — fan charts (10/25/50/75/90 percentiles) for each asset / portfolio mix.
- Side-by-side comparison: "buy-side projection vs sell-side-if-held projection."
- Win rate: "Target portfolio beats holding in X% of simulations over N years."
- "Run" button re-seeds and re-simulates.

### 3. Tweak & explore

- Real-time deterministic math (net deployable, fees, buffer).
- Clicking "Run" re-simulates MC (10k paths) on a web worker.

### 4. Come back later

- Config persisted in `localStorage`.
- "Edit Setup" to revise assumptions.
- Export/import JSON for portability across devices.

### 5. Portfolio tracker

- Second top-level tab.
- Manually enter positions (asset, quantity, cost basis, date).
- Compute P&L (requires live prices — initial version may stub; future integration with CoinGecko / Yahoo Finance / Alpha Vantage).
- Links back to planner: "Run a simulation on this position."

---

## Modeling approach

### Asset-level models

| Asset | Model | Key params |
|---|---|---|
| **BTC** | Power-law + macro-scenario regime switching | Cycle schedule, power-law exponent, macro scenario |
| **S&P 500** | GBM (lognormal) | μ ≈ 10%, σ ≈ 16% |
| **NASDAQ / tech** | GBM | μ ≈ 13%, σ ≈ 22% |
| **Gold** | Mean-reverting GBM | μ ≈ 7%, σ ≈ 15% |
| **Silver** | Mean-reverting GBM | μ ≈ 5%, σ ≈ 25% |
| **Bonds (AGG)** | GBM (low vol) | μ ≈ 4.5%, σ ≈ 5% |
| **Real estate (generic)** | GBM + transaction friction | μ ≈ 5%, σ ≈ 10% |
| **Chinese stocks (FXI)** | GBM, higher vol | μ ≈ 8%, σ ≈ 28% |
| **Individual stock** | GBM with user-entered μ/σ | user-defined |
| **HYSA / Cash** | Deterministic | μ = current rate, σ ≈ 0 |

### Portfolio mixes (correlations)

- User-defined weights sum to 100%.
- Correlation matrix lives in `src/config/correlations.ts` (estimated from historical data; documented in-source).
- Cholesky decomposition generates correlated random normals per time step.
- Each asset's log-return = μ·dt + σ·√dt·z where `z` is the correlated shock.
- Portfolio path = weighted sum of individual paths (monthly rebalance assumption, documented).

### DCA

- Given a monthly contribution `c` and time horizon `T`, simulate `T × 12` purchases along each path.
- Each purchase accumulates units at that period's price.
- Terminal portfolio value = units × final price, summed across assets.

### Lump-sum vs DCA vs hybrid

- Hybrid: treat as two independent contribution streams (one at t=0, one monthly); combine at terminal value.

---

## Architecture

```
stack-compare/
├── src/
│   ├── config/
│   │   ├── assetClasses.ts        # card definitions, default params per asset
│   │   ├── correlations.ts        # correlation matrix between asset classes
│   │   └── bufferRules.ts         # emergency-fund guideline logic
│   ├── engines/
│   │   ├── gbm.ts                 # generic GBM MC with Cholesky correlations
│   │   ├── btc.ts                 # power-law BTC engine (ported)
│   │   ├── portfolio.ts           # combine assets into portfolio paths
│   │   ├── stats.ts               # percentiles, win rates, CAGR
│   │   └── mc.worker.ts           # web-worker orchestrator
│   ├── components/
│   │   ├── Onboarding/            # wizard screens
│   │   ├── Planner/               # main simulation UI
│   │   ├── Portfolio/             # manual position tracker
│   │   ├── charts/                # D3 fan chart, comparison chart
│   │   └── common/                # cards, sliders, nav, tokens
│   ├── hooks/
│   │   ├── useUserConfig.ts       # localStorage-backed config
│   │   ├── useMcWorker.ts         # worker communication
│   │   └── useLivePrices.ts       # (stub initially)
│   ├── types/
│   │   └── index.ts               # AssetClass, UserConfig, McResult, Position, etc.
│   └── utils/
│       ├── storage.ts             # localStorage helpers, import/export
│       └── tokens.ts              # design tokens
```

---

## Tech stack

- **React 19** + **Vite 8**
- **TypeScript** (strict)
- **D3 v7** for fan charts and comparison viz (no chart-library lock-in)
- **Web Workers** for MC
- **No backend**; `localStorage` for persistence
- **No testing framework initially** (can add Vitest when the engine stabilizes)

---

## Scope for v1

### Must-have (in this build)

- [x] Project scaffolding (Vite + React + TS + d3)
- [ ] Onboarding wizard (4 screens)
- [ ] 10+ asset classes in the catalog
- [ ] GBM engine with correlated paths
- [ ] BTC power-law engine
- [ ] Portfolio-mix support with Cholesky
- [ ] DCA + lump-sum + hybrid
- [ ] Emergency buffer enforcement
- [ ] D3 fan chart + comparison view
- [ ] Win rate + percentile results
- [ ] localStorage persistence + JSON export/import
- [ ] Portfolio tracker (manual entry + P&L)

### Nice-to-have (later)

- Live price integration (CoinGecko + Alpha Vantage/Yahoo)
- Mean-reverting models for gold/silver
- Regime-switching equity models
- Tax-aware modelling (cap gains on sell side)
- Shareable URL-encoded scenarios
- Mobile-optimized layout (basic responsive is v1; full mobile polish later)
- Risk-tolerance-driven suggested mixes
- Templates ("Sell property, buy index funds", etc.)

---

## Open questions

- **Correlation freshness**: hardcoded vs re-estimated from a time series. V1 is hardcoded with documented sources.
- **Inflation adjustment**: all returns are nominal by default. Add a real/nominal toggle later.
- **Tax modelling**: v1 treats deployments as post-tax (user enters net amount). Full tax engine is a later addition.

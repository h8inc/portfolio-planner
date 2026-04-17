# Portfolio Planner

A browser-side Monte-Carlo sandbox for comparing "sell X, buy Y" decisions across
asset classes (BTC, S&P 500, NASDAQ, gold, silver, bonds, real estate, Chinese
equities, individual stocks, cash), with portfolio mixes, correlated returns,
DCA, emergency buffer advice, and a manual portfolio tracker.

Nothing is sent to a server — your config and positions live in `localStorage`.

## Stack

- React 19 + TypeScript (strict)
- Vite 8
- D3 v7 for fan and comparison charts
- Web Worker for Monte-Carlo simulation (Cholesky-correlated GBM + a BTC
  power-law regime)

## Run locally

```bash
npm install
npm run dev
```

Dev server starts on <http://localhost:5173> (falls back to next free port).

## Build

```bash
npm run build
npm run preview
```

Static output goes to `dist/`. Any static host works — see `netlify.toml` for
the zero-config Netlify setup.

## Project layout

```
src/
  components/     # UI (Onboarding, Planner, Portfolio, charts, common)
  engines/        # MC engines (gbm, btc powerlaw, stats, rng, linalg, portfolio)
                  # mc.worker.ts is the Web-Worker entry point
  config/         # Asset catalog, correlation matrix, buffer rules
  hooks/          # useUserConfig, usePortfolio, useMcWorker
  types/          # Shared TypeScript contracts
  utils/          # tokens, format, storage
```

## Engineering rules

See `AGENTS.md` — scope discipline, MC engine rules (correlated paths go
through Cholesky; no fake correlation), persistence (`localStorage` with
versioning), UI conventions (D3 only for charts, design tokens, monospace
typography).

See `project.md` for the product scope, target user, and v1 feature list.

## Related

The BTC-vs-land personal-decision prototype this was extracted from lives in a
separate directory (`btc-planner/`). This project is the generic, end-user
version of the same modeling approach.

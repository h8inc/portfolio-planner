import type { AssetId, CorrelationMatrix } from '../types'

/**
 * Correlation matrix between asset classes, estimated from monthly returns
 * over roughly 2010–2024 where data permits.
 *
 * Sources (approximate, rounded):
 *  - Equities (SPY/QQQ/FXI): Yahoo Finance monthly closes
 *  - Bonds (AGG): iShares Core US Aggregate Bond ETF
 *  - Gold/Silver: LBMA spot prices
 *  - BTC: CoinMetrics community data
 *  - Real estate (generic): Case-Shiller + REIT index blend
 *  - Cash: uncorrelated baseline
 *
 * These are reasonable defaults for simulation. They are not tradeable
 * precision and will drift over time. Future versions may re-estimate
 * from a bundled time series.
 */

const IDS: readonly AssetId[] = [
  'btc',
  'sp500',
  'nasdaq',
  'gold',
  'silver',
  'bonds',
  'realestate',
  'china',
  'custom_stock',
  'cash',
]

// Symmetric matrix, diagonal = 1. Rough monthly-return correlations.
// Order must match IDS above.
//           btc   sp5   ndq   gold  silv  bond  re    cn    stk   cash
const MATRIX: readonly (readonly number[])[] = [
  [1.00, 0.25, 0.30, 0.10, 0.15, -0.05, 0.10, 0.20, 0.30, 0.00], // btc
  [0.25, 1.00, 0.92, 0.05, 0.20, 0.10, 0.55, 0.55, 0.70, 0.00], // sp500
  [0.30, 0.92, 1.00, 0.05, 0.15, 0.05, 0.45, 0.50, 0.75, 0.00], // nasdaq
  [0.10, 0.05, 0.05, 1.00, 0.80, 0.10, 0.10, 0.10, 0.05, 0.00], // gold
  [0.15, 0.20, 0.15, 0.80, 1.00, 0.05, 0.10, 0.20, 0.15, 0.00], // silver
  [-0.05, 0.10, 0.05, 0.10, 0.05, 1.00, 0.15, 0.10, 0.05, 0.00], // bonds
  [0.10, 0.55, 0.45, 0.10, 0.10, 0.15, 1.00, 0.30, 0.40, 0.00], // realestate
  [0.20, 0.55, 0.50, 0.10, 0.20, 0.10, 0.30, 1.00, 0.45, 0.00], // china
  [0.30, 0.70, 0.75, 0.05, 0.15, 0.05, 0.40, 0.45, 1.00, 0.00], // custom_stock
  [0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 1.00], // cash
]

export const CORRELATIONS: CorrelationMatrix = {
  ids: IDS,
  matrix: MATRIX,
}

export function correlationBetween(a: AssetId, b: AssetId): number {
  if (a === b) return 1
  const i = CORRELATIONS.ids.indexOf(a)
  const j = CORRELATIONS.ids.indexOf(b)
  if (i < 0 || j < 0) return 0
  return CORRELATIONS.matrix[i][j]
}

export function subCorrelation(ids: readonly AssetId[]): number[][] {
  const n = ids.length
  const out: number[][] = Array.from({ length: n }, () => Array(n).fill(0))
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      out[i][j] = correlationBetween(ids[i], ids[j])
    }
  }
  return out
}

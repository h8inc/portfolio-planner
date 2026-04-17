import type { AssetId } from '../types'
import { applyCholesky, cholesky } from './linalg'
import { mulberry32 } from './rng'
import { subCorrelation } from '../config/correlations'

export interface GbmAssetSpec {
  readonly id: AssetId
  readonly meanReturn: number
  readonly volatility: number
}

export interface GbmRunOptions {
  readonly assets: readonly GbmAssetSpec[]
  readonly years: number
  readonly paths: number
  readonly seed: number
  readonly stepsPerYear?: number
}

export interface GbmRunResult {
  readonly assets: readonly AssetId[]
  readonly months: number
  readonly paths: readonly Float64Array[][]
}

/**
 * Run correlated GBM Monte Carlo.
 *
 * Returns paths indexed [assetIndex][pathIndex] = Float64Array of length months+1,
 * where index 0 is the starting price normalized to 1.0.
 *
 * Monthly stepping by default. Each step, we sample correlated standard-normal
 * shocks via Cholesky decomposition of the sub-correlation matrix for the
 * requested assets.
 */
export function runGbm(opts: GbmRunOptions): GbmRunResult {
  const stepsPerYear = opts.stepsPerYear ?? 12
  const months = Math.round(opts.years * stepsPerYear)
  const dt = 1 / stepsPerYear
  const sqrtDt = Math.sqrt(dt)
  const n = opts.assets.length
  const rng = mulberry32(opts.seed)

  const corr = subCorrelation(opts.assets.map((a) => a.id))
  const L = cholesky(corr)

  const paths: Float64Array[][] = opts.assets.map(() => {
    const arr: Float64Array[] = new Array(opts.paths)
    for (let p = 0; p < opts.paths; p++) {
      arr[p] = new Float64Array(months + 1)
      arr[p][0] = 1
    }
    return arr
  })

  const drift = opts.assets.map((a) => (a.meanReturn - 0.5 * a.volatility * a.volatility) * dt)
  const diffusion = opts.assets.map((a) => a.volatility * sqrtDt)

  for (let p = 0; p < opts.paths; p++) {
    const prev = new Float64Array(n).fill(1)
    for (let m = 1; m <= months; m++) {
      const z = new Array<number>(n)
      for (let i = 0; i < n; i++) z[i] = rng.normal()
      const zc = applyCholesky(L, z)
      for (let i = 0; i < n; i++) {
        const next = prev[i] * Math.exp(drift[i] + diffusion[i] * zc[i])
        paths[i][p][m] = next
        prev[i] = next
      }
    }
  }

  return {
    assets: opts.assets.map((a) => a.id),
    months,
    paths,
  }
}

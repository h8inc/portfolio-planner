import { mulberry32 } from './rng'

export interface BtcRunOptions {
  readonly years: number
  readonly paths: number
  readonly seed: number
  readonly stepsPerYear?: number
  readonly annualVol?: number
  readonly powerLawCagr?: number
  readonly cycleAmplitude?: number
}

export interface BtcRunResult {
  readonly months: number
  readonly paths: readonly Float64Array[]
}

/**
 * Simplified BTC power-law engine.
 *
 * Baseline price at t (years from start) grows as a power-law fit with an
 * approximate CAGR that decays with time. We approximate it with a declining
 * annualized drift: starts near ~35% CAGR, trends toward ~10% as the market
 * matures. On top of that drift we add:
 *   - A ~4-year sinusoidal cycle component (halving-driven)
 *   - Random lognormal shocks with high annual volatility
 *
 * This is a pragmatic approximation of the btc-planner BTC engine. It is
 * meant to capture the "high expected return, high variance, cyclical"
 * character of BTC better than plain GBM with a single mean return.
 */
export function runBtc(opts: BtcRunOptions): BtcRunResult {
  const stepsPerYear = opts.stepsPerYear ?? 12
  const months = Math.round(opts.years * stepsPerYear)
  const dt = 1 / stepsPerYear
  const sqrtDt = Math.sqrt(dt)
  const rng = mulberry32(opts.seed ^ 0xbbc_bbc)
  const vol = opts.annualVol ?? 0.7
  const diffusion = vol * sqrtDt

  const paths: Float64Array[] = new Array(opts.paths)

  for (let p = 0; p < opts.paths; p++) {
    const path = new Float64Array(months + 1)
    path[0] = 1
    let price = 1
    for (let m = 1; m <= months; m++) {
      const tYears = m * dt
      const drift = instantaneousDrift(tYears, opts) * dt
      const z = rng.normal()
      price = price * Math.exp(drift - 0.5 * vol * vol * dt + diffusion * z)
      path[m] = price
    }
    paths[p] = path
  }

  return { months, paths }
}

function instantaneousDrift(tYears: number, opts: BtcRunOptions): number {
  const baseCagrStart = opts.powerLawCagr ?? 0.35
  const baseCagrEnd = 0.12
  const decayYears = 15
  const alpha = Math.min(tYears / decayYears, 1)
  const longRun = baseCagrStart + (baseCagrEnd - baseCagrStart) * alpha

  const cycleAmp = opts.cycleAmplitude ?? 0.15
  const cycleYears = 4
  const cycle = cycleAmp * Math.sin((2 * Math.PI * tYears) / cycleYears)

  return longRun + cycle
}

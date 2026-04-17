import type { Percentile } from '../types'

export const DEFAULT_PERCENTILES: readonly Percentile[] = [5, 10, 25, 50, 75, 90, 95]

export function percentile(sorted: readonly number[], p: number): number {
  if (sorted.length === 0) return 0
  const idx = (p / 100) * (sorted.length - 1)
  const lo = Math.floor(idx)
  const hi = Math.ceil(idx)
  if (lo === hi) return sorted[lo]
  const frac = idx - lo
  return sorted[lo] * (1 - frac) + sorted[hi] * frac
}

export function percentilesAt(
  paths: readonly Float64Array[],
  monthIndex: number,
  ps: readonly Percentile[] = DEFAULT_PERCENTILES,
): Record<Percentile, number> {
  const n = paths.length
  const col = new Float64Array(n)
  for (let i = 0; i < n; i++) col[i] = paths[i][monthIndex]
  const sorted = Array.from(col).sort((a, b) => a - b)
  const out = {} as Record<Percentile, number>
  for (const p of ps) out[p] = percentile(sorted, p)
  return out
}

export function meanAt(paths: readonly Float64Array[], monthIndex: number): number {
  const n = paths.length
  if (n === 0) return 0
  let s = 0
  for (let i = 0; i < n; i++) s += paths[i][monthIndex]
  return s / n
}

export function buildPercentileBands(
  paths: readonly Float64Array[],
  months: number,
  ps: readonly Percentile[] = DEFAULT_PERCENTILES,
): { percentiles: { p: Percentile; values: number[] }[]; mean: number[] } {
  const percentiles = ps.map((p) => ({ p, values: new Array<number>(months + 1) }))
  const mean = new Array<number>(months + 1)
  const n = paths.length
  const col = new Float64Array(n)
  for (let m = 0; m <= months; m++) {
    for (let i = 0; i < n; i++) col[i] = paths[i][m]
    const sorted = Array.from(col).sort((a, b) => a - b)
    let sum = 0
    for (let i = 0; i < n; i++) sum += col[i]
    mean[m] = sum / n
    for (const band of percentiles) band.values[m] = percentile(sorted, band.p)
  }
  return { percentiles, mean }
}

export function cagrFromTerminal(terminalValue: number, initialValue: number, years: number): number {
  if (initialValue <= 0 || years <= 0) return 0
  if (terminalValue <= 0) return -1
  return Math.pow(terminalValue / initialValue, 1 / years) - 1
}

export function finalValues(paths: readonly Float64Array[], months: number): number[] {
  return paths.map((p) => p[months])
}

export function cagrPercentiles(
  terminalValues: readonly number[],
  initialValue: number,
  years: number,
  ps: readonly Percentile[] = DEFAULT_PERCENTILES,
): Record<Percentile, number> {
  const sorted = [...terminalValues].sort((a, b) => a - b)
  const out = {} as Record<Percentile, number>
  for (const p of ps) {
    const term = percentile(sorted, p)
    out[p] = cagrFromTerminal(term, initialValue, years)
  }
  return out
}

export function finalPercentiles(
  terminalValues: readonly number[],
  ps: readonly Percentile[] = DEFAULT_PERCENTILES,
): Record<Percentile, number> {
  const sorted = [...terminalValues].sort((a, b) => a - b)
  const out = {} as Record<Percentile, number>
  for (const p of ps) out[p] = percentile(sorted, p)
  return out
}

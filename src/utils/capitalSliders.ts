export const LUMP_LADDER = [50_000, 100_000, 250_000, 500_000, 1_000_000, 2_000_000, 5_000_000, 10_000_000] as const
export const DCA_LADDER = [2_000, 5_000, 10_000, 25_000, 50_000] as const
export const EXPENSE_LADDER = [3_000, 6_000, 10_000, 20_000, 50_000] as const

/** Smallest lump-sum slider ceiling so onboarding isn't stuck in a tiny $0–50k band. */
export const LUMP_SLIDER_MIN_MAX = 250_000

/**
 * Next slider ceiling above `current`. Uses strict `<` on ladder rungs so a value exactly at a
 * rung can still grow into the next band (avoids getting stuck at e.g. $50k forever).
 */
export function sliderMax(current: number, ladder: readonly number[]): number {
  for (const cap of ladder) {
    if (current < cap) return cap
  }
  const last = ladder[ladder.length - 1]
  if (current <= last) return last
  const coarse =
    last >= 5_000_000 ? 5_000_000 : last >= 500_000 ? 500_000 : last >= 50_000 ? 50_000 : 5_000
  return Math.min(100_000_000, Math.ceil(current / coarse) * coarse)
}

export function lumpSumSliderMeta(value: number): { readonly max: number; readonly step: number } {
  const max = Math.max(LUMP_SLIDER_MIN_MAX, sliderMax(value, LUMP_LADDER))
  return { max, step: max >= 1_000_000 ? 5_000 : 1_000 }
}

export function monthlyDcaSliderMeta(value: number): { readonly max: number; readonly step: number } {
  const max = sliderMax(value, DCA_LADDER)
  return { max, step: max >= 10_000 ? 100 : 50 }
}

export function monthlyExpenseSliderMeta(value: number): { readonly max: number; readonly step: number } {
  const max = sliderMax(value, EXPENSE_LADDER)
  return { max, step: max >= 10_000 ? 100 : 50 }
}

export function formatShortUsd(v: number): string {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(v % 1_000_000 === 0 ? 0 : 2)}M`
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`
  return `$${v.toLocaleString()}`
}

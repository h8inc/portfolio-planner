export function formatUsd(v: number, opts?: { compact?: boolean; fractionDigits?: number }): string {
  const isCompact = opts?.compact ?? Math.abs(v) >= 10000
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: isCompact ? 'compact' : 'standard',
    maximumFractionDigits: opts?.fractionDigits ?? (isCompact ? 2 : 0),
  }).format(v)
}

export function formatPct(v: number, fractionDigits = 1): string {
  return `${(v * 100).toFixed(fractionDigits)}%`
}

export function formatNumber(v: number, fractionDigits = 2): string {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: fractionDigits,
  }).format(v)
}

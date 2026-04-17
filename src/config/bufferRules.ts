export interface BufferGuidance {
  readonly recommendedMonths: number
  readonly rationale: string
}

export function recommendBufferMonths(situation: 'stable' | 'variable' | 'volatile'): BufferGuidance {
  switch (situation) {
    case 'stable':
      return {
        recommendedMonths: 6,
        rationale: 'Standard guideline for stable employment: 3–6 months of essential expenses. We default to 6 for margin.',
      }
    case 'variable':
      return {
        recommendedMonths: 9,
        rationale: 'Self-employed / variable income: 6–12 months is prudent. Defaulting to 9.',
      }
    case 'volatile':
      return {
        recommendedMonths: 12,
        rationale: 'Volatile industry, dependents, or single-income household: at least 12 months.',
      }
  }
}

export function deployableCapital(lumpSumUsd: number, bufferUsd: number, override: boolean): number {
  if (override) return lumpSumUsd
  return Math.max(0, lumpSumUsd - bufferUsd)
}

export function bufferWarning(lumpSumUsd: number, bufferUsd: number, override: boolean): string | null {
  if (!override) return null
  if (bufferUsd <= 0) return null
  if (lumpSumUsd <= 0) return null
  return `You are deploying your emergency buffer. A drawdown could force selling at a loss to cover living expenses. Consider keeping at least ${formatUsd(bufferUsd)} in cash.`
}

function formatUsd(v: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v)
}

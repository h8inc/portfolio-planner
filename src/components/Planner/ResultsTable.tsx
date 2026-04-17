import type { McPortfolioResult, Percentile } from '../../types'
import { color } from '../../utils/tokens'
import { formatPct, formatUsd } from '../../utils/format'

interface ResultsTableProps {
  readonly result: McPortfolioResult
  readonly initial: number
  readonly years: number
}

const ROWS: { p: Percentile; label: string; emphasis?: boolean }[] = [
  { p: 10, label: 'P10 · pessimistic' },
  { p: 25, label: 'P25 · lower' },
  { p: 50, label: 'P50 · median', emphasis: true },
  { p: 75, label: 'P75 · upper' },
  { p: 90, label: 'P90 · optimistic' },
]

const COLS = '1.4fr 1fr 0.7fr 0.8fr'

export const ResultsTable = ({ result, initial, years }: ResultsTableProps) => {
  return (
    <div
      style={{
        marginTop: 12,
        border: `1px solid ${color.border}`,
        borderRadius: 6,
        overflow: 'hidden',
        background: color.bg,
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: COLS,
          padding: '6px 10px',
          fontSize: 9,
          color: color.textMuted,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          fontWeight: 600,
        }}
      >
        <span>Outcome</span>
        <span style={{ textAlign: 'right' }}>Terminal</span>
        <span style={{ textAlign: 'right' }}>Mult</span>
        <span style={{ textAlign: 'right' }}>CAGR</span>
      </div>
      {ROWS.map((row) => {
        const terminal = result.finalPercentiles[row.p]
        const multiple = initial > 0 ? terminal / initial : 0
        const cagr = result.cagrPercentiles[row.p]
        return (
          <div
            key={row.p}
            style={{
              display: 'grid',
              gridTemplateColumns: COLS,
              padding: '6px 10px',
              fontSize: 12,
              borderTop: `1px solid ${color.border}`,
              background: row.emphasis ? color.bgSubtle : 'transparent',
              fontWeight: row.emphasis ? 600 : 400,
              fontVariantNumeric: 'tabular-nums',
              alignItems: 'baseline',
            }}
          >
            <span style={{ color: row.emphasis ? color.text : color.textSec }}>{row.label}</span>
            <span style={{ textAlign: 'right', color: color.text }}>{formatUsd(terminal, { compact: true })}</span>
            <span style={{ textAlign: 'right', color: color.textMuted }}>{multiple.toFixed(2)}×</span>
            <span
              style={{
                textAlign: 'right',
                color: cagr > 0 ? color.positive : color.negative,
              }}
            >
              {formatPct(cagr, 1)}
            </span>
          </div>
        )
      })}
      <div
        style={{
          padding: '5px 10px',
          fontSize: 9,
          color: color.textMuted,
          background: color.bg,
          borderTop: `1px solid ${color.border}`,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
        }}
      >
        {years}y · {result.months} monthly steps
      </div>
    </div>
  )
}

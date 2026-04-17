import type { UserConfig } from '../../types'
import { color } from '../../utils/tokens'
import { formatUsd } from '../../utils/format'
import { Card, SectionHeader, Slider, Row, Divider } from '../common/ui'

interface PlannerControlsProps {
  readonly config: UserConfig
  readonly onUpdate: (patch: Partial<UserConfig>) => void
  readonly onRun: () => void
  readonly running: boolean
  readonly canRun: boolean
  readonly onEdit: () => void
}

const HORIZONS = [1, 3, 5, 10, 15, 20] as const
const BUFFER_MONTHS = [0, 3, 6, 9, 12] as const

function sliderMax(current: number, ladder: readonly number[]): number {
  for (const cap of ladder) {
    if (current <= cap) return cap
  }
  return ladder[ladder.length - 1]
}

const LUMP_LADDER = [50_000, 100_000, 250_000, 500_000, 1_000_000, 2_000_000, 5_000_000, 10_000_000] as const
const DCA_LADDER = [2_000, 5_000, 10_000, 25_000, 50_000] as const
const EXPENSE_LADDER = [3_000, 6_000, 10_000, 20_000, 50_000] as const

function formatShortUsd(v: number): string {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(v % 1_000_000 === 0 ? 0 : 2)}M`
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`
  return `$${v.toLocaleString()}`
}

export const PlannerControls = ({ config, onUpdate, onRun, running, canRun, onEdit }: PlannerControlsProps) => {
  const bufferUsd = config.monthlyExpensesUsd * config.bufferMonths
  const deployable = config.bufferOverride
    ? config.lumpSumUsd
    : Math.max(0, config.lumpSumUsd - bufferUsd)

  const lumpMax = sliderMax(config.lumpSumUsd, LUMP_LADDER)
  const dcaMax = sliderMax(config.monthlyDcaUsd, DCA_LADDER)
  const expenseMax = sliderMax(config.monthlyExpensesUsd, EXPENSE_LADDER)

  const lumpStep = lumpMax >= 1_000_000 ? 5_000 : 1_000
  const dcaStep = dcaMax >= 10_000 ? 100 : 50
  const expenseStep = expenseMax >= 10_000 ? 100 : 50

  return (
    <Card style={{ marginBottom: 0, padding: '14px 14px 12px' }}>
      <SectionHeader suffix={formatUsd(deployable, { compact: true })}>Controls</SectionHeader>

      <Slider
        label="Lump sum"
        value={config.lumpSumUsd}
        min={0}
        max={lumpMax}
        step={lumpStep}
        onChange={(v) => onUpdate({ lumpSumUsd: v })}
        format={(v) => formatShortUsd(v)}
        sub={`max ${formatShortUsd(lumpMax)}`}
      />

      <Slider
        label="Monthly DCA"
        value={config.monthlyDcaUsd}
        min={0}
        max={dcaMax}
        step={dcaStep}
        onChange={(v) => onUpdate({ monthlyDcaUsd: v })}
        format={(v) => `${formatShortUsd(v)}/mo`}
      />

      <Slider
        label="Monthly expenses"
        value={config.monthlyExpensesUsd}
        min={0}
        max={expenseMax}
        step={expenseStep}
        onChange={(v) => onUpdate({ monthlyExpensesUsd: v })}
        format={(v) => `${formatShortUsd(v)}/mo`}
        sub="feeds buffer calc"
      />

      <Slider
        label="Horizon"
        value={config.horizonYears}
        min={HORIZONS[0]}
        max={HORIZONS[HORIZONS.length - 1]}
        step={1}
        onChange={(v) => onUpdate({ horizonYears: v })}
        format={(v) => `${v}y`}
      />

      <Slider
        label="Buffer"
        value={config.bufferMonths}
        min={BUFFER_MONTHS[0]}
        max={BUFFER_MONTHS[BUFFER_MONTHS.length - 1]}
        step={1}
        onChange={(v) => onUpdate({ bufferMonths: v })}
        format={(v) => `${v}mo`}
        sub={formatUsd(bufferUsd, { compact: true })}
        disabled={config.bufferOverride}
      />

      <Divider />

      <Row label="Buffer held" value={formatUsd(config.bufferOverride ? 0 : bufferUsd, { compact: true })} />
      <Row label="Deployable" value={formatUsd(deployable, { compact: true })} accent bold />
      {config.bufferOverride && (
        <div style={{ fontSize: 10, color: color.warning, marginTop: 4 }}>
          Buffer override active — no cash reserved.
        </div>
      )}

      <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
        <button className="primary" onClick={onRun} disabled={!canRun || running} style={{ flex: 1 }}>
          {running ? 'Running…' : 'Run'}
        </button>
        <button className="ghost" onClick={onEdit} title="Full setup">
          Setup
        </button>
      </div>
    </Card>
  )
}

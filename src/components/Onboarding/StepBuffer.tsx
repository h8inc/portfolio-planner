import type { UserConfig } from '../../types'
import { color } from '../../utils/tokens'
import { NumberInput } from '../common/NumberInput'
import { Card, SectionHeader, CheckRow, Row } from '../common/ui'
import { formatUsd } from '../../utils/format'

interface StepBufferProps {
  readonly config: UserConfig
  readonly onUpdate: (patch: Partial<UserConfig>) => void
}

const OPTIONS = [
  { months: 3, label: '3 months', desc: 'Stable employment, dual income, no dependents' },
  { months: 6, label: '6 months', desc: 'Recommended default for most people' },
  { months: 9, label: '9 months', desc: 'Variable income / self-employed' },
  { months: 12, label: '12 months', desc: 'Volatile industry, single income, dependents' },
]

export const StepBuffer = ({ config, onUpdate }: StepBufferProps) => {
  const bufferUsd = config.monthlyExpensesUsd * config.bufferMonths
  const deployableAfter = Math.max(0, config.lumpSumUsd - bufferUsd)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div>
        <h2>Your safety net</h2>
        <p style={{ color: color.textMuted, marginTop: 4, fontSize: 11, lineHeight: 1.55 }}>
          Standard rule: keep 3–6 months of essential expenses in cash before deploying into risk
          assets. Self-employed or volatile industry → 6–12 months. Dependents on a single income → 12+.
        </p>
      </div>

      <Card>
        <SectionHeader>Monthly essential expenses</SectionHeader>
        <NumberInput
          label="USD per month"
          prefix="$"
          suffix="/mo"
          value={config.monthlyExpensesUsd}
          onChange={(v) => onUpdate({ monthlyExpensesUsd: v })}
          hint="Housing, food, utilities, insurance, min. debt payments"
        />
      </Card>

      <Card>
        <SectionHeader>Buffer length</SectionHeader>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
          {OPTIONS.map((opt) => {
            const active = config.bufferMonths === opt.months
            return (
              <button
                key={opt.months}
                type="button"
                onClick={() => onUpdate({ bufferMonths: opt.months })}
                style={{
                  padding: '8px 10px',
                  textAlign: 'left',
                  background: active ? color.accentSoft : color.bgSubtle,
                  color: active ? color.text : color.textSec,
                  border: `1px solid ${active ? color.accentDim : color.border}`,
                  borderRadius: 4,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontWeight: 400,
                }}
              >
                <span style={{ fontWeight: 600, fontSize: 12, color: active ? color.accent : color.text }}>
                  {opt.label}
                </span>
                <span style={{ fontSize: 10, color: color.textMuted, lineHeight: 1.4 }}>{opt.desc}</span>
              </button>
            )
          })}
        </div>
      </Card>

      <Card
        style={{
          borderColor: config.bufferOverride ? color.negative : color.border,
          background: config.bufferOverride ? 'rgba(248, 113, 113, 0.05)' : color.bgElevated,
        }}
      >
        <SectionHeader
          suffix={
            <CheckRow
              checked={config.bufferOverride}
              onChange={(v) => onUpdate({ bufferOverride: v })}
              style={{ marginBottom: 0 }}
            >
              Deploy it all (override)
            </CheckRow>
          }
        >
          Deployable capital
        </SectionHeader>

        <Row label="Lump sum" value={formatUsd(config.lumpSumUsd, { compact: true })} />
        <Row
          label={`Buffer · ${config.bufferMonths}mo`}
          value={formatUsd(bufferUsd, { compact: true })}
          sub={config.bufferOverride ? 'Not held' : undefined}
        />
        <Row
          label="Deployable"
          value={formatUsd(config.bufferOverride ? config.lumpSumUsd : deployableAfter, { compact: true })}
          accent
          bold
        />

        {config.bufferOverride && bufferUsd > 0 && (
          <div
            style={{
              marginTop: 10,
              padding: 8,
              background: color.negativeBg,
              border: `1px solid ${color.negative}`,
              borderRadius: 4,
              fontSize: 10,
              color: color.text,
              lineHeight: 1.5,
            }}
          >
            Warning: deploying your emergency buffer means a drawdown could force you to sell at a loss.
            Proceed only if you have other liquid reserves.
          </div>
        )}
      </Card>
    </div>
  )
}

import type { UserConfig } from '../../types'
import { color } from '../../utils/tokens'
import { NumberInput } from '../common/NumberInput'
import { Card, SectionHeader, ButtonGroup } from '../common/ui'

interface StepCapitalProps {
  readonly config: UserConfig
  readonly onUpdate: (patch: Partial<UserConfig>) => void
}

const HORIZON_OPTIONS = [
  { value: 1, label: '1y' },
  { value: 3, label: '3y' },
  { value: 5, label: '5y' },
  { value: 10, label: '10y' },
  { value: 15, label: '15y' },
  { value: 20, label: '20y' },
] as const

export const StepCapital = ({ config, onUpdate }: StepCapitalProps) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div>
        <h2>Starting point & horizon</h2>
        <p style={{ color: color.textMuted, marginTop: 4, fontSize: 11 }}>
          Lump sum from a liquidation, monthly contributions from income, or both.
        </p>
      </div>

      <Card>
        <SectionHeader>Capital</SectionHeader>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <NumberInput
            label="Lump sum (USD, post-tax)"
            prefix="$"
            value={config.lumpSumUsd}
            onChange={(v) => onUpdate({ lumpSumUsd: v })}
            hint="Net proceeds you could deploy today"
          />
          <NumberInput
            label="Monthly contribution (USD)"
            prefix="$"
            suffix="/mo"
            value={config.monthlyDcaUsd}
            onChange={(v) => onUpdate({ monthlyDcaUsd: v })}
            hint="DCA from income. 0 if none"
          />
        </div>
      </Card>

      <Card>
        <SectionHeader>Time horizon</SectionHeader>
        <p style={{ color: color.textMuted, fontSize: 11, marginBottom: 10 }}>
          Longer horizons reveal compounding but widen uncertainty bands.
        </p>
        <ButtonGroup
          value={config.horizonYears}
          options={HORIZON_OPTIONS}
          onChange={(v) => onUpdate({ horizonYears: v })}
        />
      </Card>
    </div>
  )
}

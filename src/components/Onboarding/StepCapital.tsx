import type { UserConfig } from '../../types'
import { color } from '../../utils/tokens'
import { formatShortUsd, lumpSumSliderMeta, monthlyDcaSliderMeta } from '../../utils/capitalSliders'
import { Card, SectionHeader, ButtonGroup, Slider } from '../common/ui'

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
  const lump = lumpSumSliderMeta(config.lumpSumUsd)
  const dca = monthlyDcaSliderMeta(config.monthlyDcaUsd)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div>
        <h2>How much are you working with?</h2>
        <p
          style={{
            color: color.textSec,
            marginTop: 6,
            fontSize: 12,
            lineHeight: 1.6,
            maxWidth: 620,
          }}
        >
          A lump sum from a liquidation, ongoing monthly contributions from income, or both. And
          how long you'd leave it alone — longer horizons give compounding room to work, but widen
          the uncertainty bands.
        </p>
      </div>

      <Card>
        <SectionHeader>Capital</SectionHeader>
        <div className="onboarding-capital-sliders">
          <Slider
            label="Lump sum (USD, post-tax)"
            value={config.lumpSumUsd}
            min={0}
            max={lump.max}
            step={lump.step}
            onChange={(v) => onUpdate({ lumpSumUsd: v })}
            format={(v) => formatShortUsd(v)}
            sub={`Net proceeds you could deploy today · max ${formatShortUsd(lump.max)}`}
          />
          <Slider
            label="Monthly contribution (USD)"
            value={config.monthlyDcaUsd}
            min={0}
            max={dca.max}
            step={dca.step}
            onChange={(v) => onUpdate({ monthlyDcaUsd: v })}
            format={(v) => `${formatShortUsd(v)}/mo`}
            sub={`DCA from income — $0 if none · max ${formatShortUsd(dca.max)}/mo`}
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

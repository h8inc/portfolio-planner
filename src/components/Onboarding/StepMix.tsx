import type { SideAllocation, UserConfig } from '../../types'
import { color } from '../../utils/tokens'
import { WeightSliders } from '../common/WeightSliders'
import { Card, SectionHeader } from '../common/ui'

interface StepMixProps {
  readonly config: UserConfig
  readonly onUpdate: (patch: Partial<UserConfig>) => void
}

export const StepMix = ({ config, onUpdate }: StepMixProps) => {
  const updateSide = (key: 'sellSide' | 'buySide') => (next: SideAllocation[]) => {
    onUpdate({ [key]: next } as Partial<UserConfig>)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div>
        <h2>Set your weights</h2>
        <p style={{ color: color.textMuted, marginTop: 4, fontSize: 11 }}>
          Drag sliders to set how much of each asset. Single-asset sides auto-size to 100%.
        </p>
      </div>

      <Card>
        <SectionHeader>Sell side · what you hold</SectionHeader>
        <WeightSliders allocations={config.sellSide} onChange={updateSide('sellSide')} />
      </Card>

      <Card>
        <SectionHeader>Buy side · target</SectionHeader>
        <WeightSliders allocations={config.buySide} onChange={updateSide('buySide')} />
      </Card>
    </div>
  )
}

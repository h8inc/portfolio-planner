import type { AssetId } from '../../types'
import { ASSET_CLASSES } from '../../config/assetClasses'
import { AssetCard } from '../common/AssetCard'
import { color } from '../../utils/tokens'

interface StepAssetsProps {
  readonly title: string
  readonly subtitle: string
  readonly selected: readonly AssetId[]
  readonly onChange: (ids: AssetId[]) => void
}

export const StepAssets = ({ title, subtitle, selected, onChange }: StepAssetsProps) => {
  const toggle = (id: AssetId) => {
    if (selected.includes(id)) onChange(selected.filter((s) => s !== id))
    else onChange([...selected, id])
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div>
        <h2>{title}</h2>
        <p
          style={{
            color: color.textSec,
            marginTop: 6,
            fontSize: 12,
            lineHeight: 1.6,
            maxWidth: 620,
          }}
        >
          {subtitle}
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 8,
        }}
      >
        {ASSET_CLASSES.map((a) => (
          <AssetCard
            key={a.id}
            asset={a}
            selected={selected.includes(a.id)}
            onClick={() => toggle(a.id)}
          />
        ))}
      </div>

      {selected.length > 0 && (
        <div
          style={{
            fontSize: 10,
            color: color.textMuted,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          {selected.length} selected
          {selected.length > 1 && ' — you can set weights on the review step'}
        </div>
      )}
    </div>
  )
}

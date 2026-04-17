import type { SideAllocation } from '../../types'
import { getAsset } from '../../config/assetClasses'
import { assetPalette, color } from '../../utils/tokens'
import { formatPct } from '../../utils/format'

interface SideSummaryProps {
  readonly side: readonly SideAllocation[]
}

export const SideSummary = ({ side }: SideSummaryProps) => {
  const total = side.reduce((s, a) => s + a.weight, 0) || 1
  return (
    <span style={{ display: 'inline-flex', gap: 4, flexWrap: 'wrap', alignItems: 'center' }}>
      {side.map((a) => {
        const asset = getAsset(a.assetId)
        const tint = assetPalette[a.assetId] ?? color.accent
        return (
          <span
            key={a.assetId}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: '1px 6px',
              fontSize: 10,
              border: `1px solid ${tint}`,
              color: color.text,
              background: `${tint}18`,
              borderRadius: 3,
              fontVariantNumeric: 'tabular-nums',
              letterSpacing: 0,
              textTransform: 'none',
            }}
          >
            {asset.short}
            {side.length > 1 && (
              <span style={{ color: color.textMuted }}>{formatPct(a.weight / total, 0)}</span>
            )}
          </span>
        )
      })}
    </span>
  )
}

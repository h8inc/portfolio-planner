import type { AssetClass } from '../../types'
import { assetPalette, color } from '../../utils/tokens'
import { formatPct } from '../../utils/format'

interface AssetCardProps {
  readonly asset: AssetClass
  readonly selected: boolean
  readonly onClick: () => void
}

export const AssetCard = ({ asset, selected, onClick }: AssetCardProps) => {
  const tint = assetPalette[asset.id] ?? color.accent
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        padding: '10px 12px',
        textAlign: 'left',
        border: `1px solid ${selected ? color.accentDim : color.border}`,
        background: color.bgElevated,
        borderRadius: 6,
        cursor: 'pointer',
        transition: 'all 120ms ease',
        minHeight: 120,
        fontFamily: 'inherit',
        fontWeight: 300,
        color: color.text,
        letterSpacing: 0,
        textTransform: 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div
          style={{
            width: 26,
            height: 26,
            borderRadius: 4,
            background: `${tint}22`,
            color: tint,
            fontWeight: 700,
            fontSize: 12,
            display: 'grid',
            placeItems: 'center',
          }}
        >
          {asset.icon}
        </div>
        <div>
          <div style={{ fontWeight: 500, fontSize: 12, color: color.text }}>{asset.name}</div>
          <div
            style={{
              fontSize: 9,
              color: color.textMuted,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            {asset.short}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 12, fontSize: 10 }}>
        <div style={{ color: color.textMuted, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          CAGR{' '}
          <span style={{ color: color.text, fontWeight: 600, letterSpacing: 0 }}>
            {formatPct(asset.meanReturn, 1)}
          </span>
        </div>
        <div style={{ color: color.textMuted, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          Vol{' '}
          <span style={{ color: color.text, fontWeight: 600, letterSpacing: 0 }}>
            {formatPct(asset.volatility, 0)}
          </span>
        </div>
      </div>
      <div style={{ fontSize: 11, color: color.textSec, lineHeight: 1.45 }}>{asset.explainer}</div>
    </button>
  )
}

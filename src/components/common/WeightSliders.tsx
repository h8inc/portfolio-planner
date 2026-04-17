import type { SideAllocation } from '../../types'
import { getAsset } from '../../config/assetClasses'
import { assetPalette, color } from '../../utils/tokens'
import { formatPct } from '../../utils/format'

interface WeightSlidersProps {
  readonly allocations: readonly SideAllocation[]
  readonly onChange: (next: SideAllocation[]) => void
}

export const WeightSliders = ({ allocations, onChange }: WeightSlidersProps) => {
  const total = allocations.reduce((s, a) => s + a.weight, 0) || 1

  const handleWeight = (idx: number, newWeight: number) => {
    const next = allocations.map((a, i) => (i === idx ? { ...a, weight: Math.max(0, newWeight) } : a))
    onChange(next)
  }

  const handleEqualize = () => {
    const n = allocations.length
    if (n === 0) return
    const w = 1 / n
    onChange(allocations.map((a) => ({ ...a, weight: w })))
  }

  if (allocations.length === 0) {
    return <div style={{ color: color.textMuted, fontSize: 11 }}>No assets selected.</div>
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span
          style={{
            fontSize: 10,
            color: color.textMuted,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            fontWeight: 600,
          }}
        >
          Weights · normalized
        </span>
        <button onClick={handleEqualize} className="ghost" style={{ padding: '3px 8px', fontSize: 10 }}>
          Equal
        </button>
      </div>
      {allocations.map((a, i) => {
        const asset = getAsset(a.assetId)
        const pct = a.weight / total
        const tint = assetPalette[a.assetId] ?? color.accent
        return (
          <div
            key={a.assetId}
            style={{
              display: 'grid',
              gridTemplateColumns: '90px 1fr 50px',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: tint, flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: color.text }}>{asset.short}</span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={a.weight}
              onChange={(e) => handleWeight(i, Number(e.target.value))}
              style={{ accentColor: tint }}
            />
            <span style={{ fontSize: 12, textAlign: 'right', color: color.text }}>{formatPct(pct, 0)}</span>
          </div>
        )
      })}
    </div>
  )
}

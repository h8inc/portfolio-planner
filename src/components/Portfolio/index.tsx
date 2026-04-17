import { useState } from 'react'
import type { AssetId, PortfolioState, Position } from '../../types'
import { ASSET_CLASSES, getAsset } from '../../config/assetClasses'
import { assetPalette, color } from '../../utils/tokens'
import { formatNumber, formatPct, formatUsd } from '../../utils/format'
import { NumberInput } from '../common/NumberInput'
import { Card, SectionHeader } from '../common/ui'

interface PortfolioProps {
  readonly state: PortfolioState
  readonly onAdd: (position: Omit<Position, 'id' | 'addedAt'>) => void
  readonly onUpdate: (id: string, patch: Partial<Position>) => void
  readonly onRemove: (id: string) => void
}

const TABLE_COLS = '1fr 1fr 1fr 1fr 1fr 1fr 32px'

export const Portfolio = ({ state, onAdd, onUpdate, onRemove }: PortfolioProps) => {
  const totals = computeTotals(state.positions)
  const pnl = totals.value - totals.cost
  const pnlPct = totals.cost > 0 ? pnl / totals.cost : 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div>
        <h1 style={{ letterSpacing: '0.04em' }}>Portfolio</h1>
        <p style={{ color: color.textMuted, marginTop: 4, fontSize: 11, lineHeight: 1.55 }}>
          Manually track positions you already hold. Cost basis is what you paid;
          current value uses a price you enter.
        </p>
      </div>

      <Card>
        <SectionHeader>Summary</SectionHeader>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          <Stat label="Cost basis" value={formatUsd(totals.cost, { compact: true })} />
          <Stat label="Current value" value={formatUsd(totals.value, { compact: true })} />
          <Stat
            label="Unrealized P&L"
            value={formatUsd(pnl, { compact: true })}
            tone={pnl >= 0 ? 'positive' : 'negative'}
          />
          <Stat
            label="Return"
            value={formatPct(pnlPct, 1)}
            tone={pnl >= 0 ? 'positive' : 'negative'}
          />
        </div>
      </Card>

      <AddPositionForm onAdd={onAdd} />

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '10px 12px 8px' }}>
          <SectionHeader style={{ marginBottom: 0, border: 'none', paddingBottom: 0 }}>
            Positions · {state.positions.length}
          </SectionHeader>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: TABLE_COLS,
            padding: '6px 12px',
            background: color.bgSubtle,
            fontSize: 9,
            color: color.textMuted,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            fontWeight: 600,
            borderTop: `1px solid ${color.border}`,
            borderBottom: `1px solid ${color.border}`,
          }}
        >
          <span>Asset</span>
          <span>Label</span>
          <span style={{ textAlign: 'right' }}>Qty</span>
          <span style={{ textAlign: 'right' }}>Current px</span>
          <span style={{ textAlign: 'right' }}>Cost basis</span>
          <span style={{ textAlign: 'right' }}>P&L</span>
          <span />
        </div>
        {state.positions.length === 0 && (
          <div
            style={{
              padding: 24,
              textAlign: 'center',
              color: color.textMuted,
              fontSize: 11,
              letterSpacing: '0.04em',
            }}
          >
            No positions yet. Add one above.
          </div>
        )}
        {state.positions.map((p) => (
          <PositionRow key={p.id} position={p} onUpdate={onUpdate} onRemove={onRemove} />
        ))}
      </Card>
    </div>
  )
}

function computeTotals(positions: readonly Position[]): { cost: number; value: number } {
  let cost = 0
  let value = 0
  for (const p of positions) {
    cost += p.costBasisUsd
    value += (p.currentPriceUsd ?? 0) * p.quantity
  }
  return { cost, value }
}

const Stat = ({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone?: 'positive' | 'negative'
}) => (
  <div>
    <div
      style={{
        fontSize: 9,
        color: color.textMuted,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        fontWeight: 600,
      }}
    >
      {label}
    </div>
    <div
      style={{
        fontSize: 18,
        fontWeight: 600,
        marginTop: 4,
        fontVariantNumeric: 'tabular-nums',
        color: tone === 'positive' ? color.positive : tone === 'negative' ? color.negative : color.text,
      }}
    >
      {value}
    </div>
  </div>
)

const AddPositionForm = ({ onAdd }: { onAdd: (p: Omit<Position, 'id' | 'addedAt'>) => void }) => {
  const [assetId, setAssetId] = useState<AssetId>('btc')
  const [label, setLabel] = useState('')
  const [quantity, setQuantity] = useState(0)
  const [costBasis, setCostBasis] = useState(0)
  const [currentPrice, setCurrentPrice] = useState(0)

  const valid = quantity > 0 && costBasis > 0

  return (
    <Card>
      <SectionHeader>Add position</SectionHeader>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr) auto',
          gap: 10,
          alignItems: 'end',
        }}
      >
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span
            style={{
              fontSize: 10,
              color: color.textMuted,
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            Asset
          </span>
          <select
            value={assetId}
            onChange={(e) => setAssetId(e.target.value as AssetId)}
          >
            {ASSET_CLASSES.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} ({a.short})
              </option>
            ))}
          </select>
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span
            style={{
              fontSize: 10,
              color: color.textMuted,
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            Label (optional)
          </span>
          <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Coinbase" />
        </label>
        <NumberInput label="Quantity" value={quantity} onChange={setQuantity} step={0.00000001} />
        <NumberInput label="Current price" prefix="$" value={currentPrice} onChange={setCurrentPrice} />
        <NumberInput label="Total cost basis" prefix="$" value={costBasis} onChange={setCostBasis} />
        <button
          className="primary"
          disabled={!valid}
          onClick={() => {
            const a = getAsset(assetId)
            onAdd({
              assetId,
              label: label || a.name,
              quantity,
              costBasisUsd: costBasis,
              currentPriceUsd: currentPrice || undefined,
            })
            setLabel('')
            setQuantity(0)
            setCostBasis(0)
            setCurrentPrice(0)
          }}
          style={{ height: 30 }}
        >
          Add
        </button>
      </div>
    </Card>
  )
}

const PositionRow = ({
  position,
  onUpdate,
  onRemove,
}: {
  position: Position
  onUpdate: (id: string, patch: Partial<Position>) => void
  onRemove: (id: string) => void
}) => {
  const asset = getAsset(position.assetId)
  const tint = assetPalette[position.assetId] ?? color.accent
  const value = (position.currentPriceUsd ?? 0) * position.quantity
  const pnl = value - position.costBasisUsd
  const pnlPct = position.costBasisUsd > 0 ? pnl / position.costBasisUsd : 0
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: TABLE_COLS,
        padding: '8px 12px',
        fontSize: 12,
        borderTop: `1px solid ${color.border}`,
        alignItems: 'center',
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: color.text }}>
        <span style={{ width: 8, height: 8, borderRadius: 2, background: tint, flexShrink: 0 }} />
        {asset.short}
      </span>
      <span style={{ color: color.textMuted }}>{position.label}</span>
      <span style={{ textAlign: 'right', color: color.text }}>{formatNumber(position.quantity, 6)}</span>
      <input
        type="number"
        value={position.currentPriceUsd ?? 0}
        onChange={(e) => onUpdate(position.id, { currentPriceUsd: Number(e.target.value) || 0 })}
        style={{ textAlign: 'right', padding: '2px 6px', fontSize: 12 }}
      />
      <span style={{ textAlign: 'right', color: color.textMuted }}>
        {formatUsd(position.costBasisUsd, { compact: true })}
      </span>
      <span
        style={{
          textAlign: 'right',
          color: pnl >= 0 ? color.positive : color.negative,
          fontWeight: 600,
        }}
      >
        {formatUsd(pnl, { compact: true })}{' '}
        <span style={{ fontSize: 10, opacity: 0.8 }}>{formatPct(pnlPct, 1)}</span>
      </span>
      <button
        onClick={() => onRemove(position.id)}
        className="ghost"
        style={{ padding: '2px 6px', fontSize: 14, color: color.negative, border: 'none', background: 'transparent' }}
        title="Remove"
      >
        ×
      </button>
    </div>
  )
}

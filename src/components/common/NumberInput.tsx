import { color } from '../../utils/tokens'

interface NumberInputProps {
  readonly label: string
  readonly value: number
  readonly onChange: (v: number) => void
  readonly prefix?: string
  readonly suffix?: string
  readonly hint?: string
  readonly min?: number
  readonly max?: number
  readonly step?: number
}

export const NumberInput = ({
  label,
  value,
  onChange,
  prefix,
  suffix,
  hint,
  min,
  max,
  step,
}: NumberInputProps) => {
  return (
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
        {label}
      </span>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 0,
          border: `1px solid ${color.borderDefault}`,
          borderRadius: 4,
          background: color.bgElevated,
          overflow: 'hidden',
        }}
      >
        {prefix && (
          <span style={{ padding: '6px 8px', color: color.textMuted, fontSize: 12 }}>{prefix}</span>
        )}
        <input
          type="number"
          value={Number.isFinite(value) ? value : ''}
          onChange={(e) => {
            const v = e.target.value === '' ? 0 : Number(e.target.value)
            onChange(Number.isFinite(v) ? v : 0)
          }}
          min={min}
          max={max}
          step={step}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            boxShadow: 'none',
            padding: '6px 8px',
            color: color.text,
            fontSize: 12,
          }}
        />
        {suffix && (
          <span style={{ padding: '6px 8px', color: color.textMuted, fontSize: 12 }}>{suffix}</span>
        )}
      </div>
      {hint && <span style={{ fontSize: 10, color: color.textMuted }}>{hint}</span>}
    </label>
  )
}

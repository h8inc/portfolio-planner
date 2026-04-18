import type { CSSProperties, ReactNode } from 'react'
import { color } from '../../utils/tokens'
import { labelStyle, valueStyle } from './uiStyles'

interface CardProps {
  children: ReactNode
  style?: CSSProperties
}

export function Card({ children, style }: CardProps) {
  return (
    <div
      style={{
        background: color.bgElevated,
        border: `1px solid ${color.border}`,
        borderRadius: 8,
        padding: '12px 14px',
        marginBottom: 8,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

interface SectionHeaderProps {
  children: ReactNode
  suffix?: ReactNode
  style?: CSSProperties
}

export function SectionHeader({ children, suffix, style }: SectionHeaderProps) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        gap: 10,
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: color.textMuted,
        borderBottom: `1px solid ${color.border}`,
        paddingBottom: 6,
        marginBottom: 10,
        ...style,
      }}
    >
      <span style={{ flex: '1 1 auto', minWidth: 0 }}>{children}</span>
      {suffix != null && suffix !== '' && (
        <span
          style={{
            flex: '0 0 auto',
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: 'normal',
            textTransform: 'none',
            color: color.text,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {suffix}
        </span>
      )}
    </div>
  )
}

interface RowProps {
  label: ReactNode
  value: ReactNode
  sub?: ReactNode
  accent?: boolean
  bold?: boolean
}

export function Row({ label, value, sub, accent, bold }: RowProps) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
      <span style={{ ...labelStyle, flex: '1 1 auto', minWidth: 0 }}>{label}</span>
      <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
        <span
          style={{
            fontSize: 12,
            fontWeight: bold ? 600 : 400,
            color: accent ? color.accent : color.text,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {value}
        </span>
        {sub && <span style={{ fontSize: 10, color: color.textMuted }}>{sub}</span>}
      </span>
    </div>
  )
}

export function Divider({ style }: { style?: CSSProperties }) {
  return <div style={{ borderTop: `1px solid ${color.border}`, margin: '8px 0', ...style }} />
}

interface SliderProps {
  label: ReactNode
  value: number
  min: number
  max: number
  step?: number
  onChange: (v: number) => void
  format?: (v: number) => string
  sub?: ReactNode
  disabled?: boolean
}

export function Slider({ label, value, min, max, step = 1, onChange, format, sub, disabled }: SliderProps) {
  return (
    <div style={{ marginBottom: 10, opacity: disabled ? 0.5 : 1 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 3,
          gap: 8,
        }}
      >
        <span style={{ ...labelStyle, flex: '1 1 auto', minWidth: 0 }}>{label}</span>
        <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flex: '0 0 auto', textAlign: 'right' }}>
          <span style={valueStyle}>{format ? format(value) : value}</span>
          {sub && <span style={{ fontSize: 10, color: color.textMuted }}>{sub}</span>}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
      />
    </div>
  )
}

interface CheckRowProps {
  checked: boolean
  onChange: (next: boolean) => void
  children: ReactNode
  style?: CSSProperties
}

export function CheckRow({ checked, onChange, children, style }: CheckRowProps) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', marginBottom: 5, ...style }}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span style={labelStyle}>{children}</span>
    </label>
  )
}

interface ButtonGroupProps<T extends string | number> {
  value: T
  options: readonly { value: T; label: string }[]
  onChange: (next: T) => void
}

export function ButtonGroup<T extends string | number>({ value, options, onChange }: ButtonGroupProps<T>) {
  return (
    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
      {options.map((o) => {
        const active = o.value === value
        return (
          <button
            key={String(o.value)}
            type="button"
            onClick={() => onChange(o.value)}
            className={active ? 'active' : 'ghost'}
            style={{ fontSize: 11, padding: '4px 10px' }}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

import type { CSSProperties } from 'react'
import { color } from '../../utils/tokens'

export const labelStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 400,
  lineHeight: '16px',
  color: color.textSec,
}

export const valueStyle: CSSProperties = {
  fontSize: 12,
  lineHeight: '16px',
  color: color.text,
  fontVariantNumeric: 'tabular-nums',
}

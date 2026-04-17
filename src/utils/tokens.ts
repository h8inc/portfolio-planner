export const color = {
  bg: '#080d0b',
  bgElevated: '#0c1210',
  bgSubtle: '#111916',

  border: '#1a2420',
  borderDefault: '#243029',
  borderEm: 'rgba(20,241,149,0.25)',

  text: '#d4ddd8',
  textSec: '#9aaba3',
  textMuted: '#6b7d74',
  textDisabled: '#3d4a44',

  accent: '#14f195',
  accentDim: 'rgba(20,241,149,0.38)',
  accentSoft: 'rgba(20,241,149,0.10)',

  positive: '#14f195',
  positiveBg: 'rgba(20,241,149,0.10)',
  negative: '#f87171',
  negativeBg: 'rgba(248,113,113,0.10)',
  warning: '#fbbf24',

  btcOrange: '#f7931a',

  panel: '#0c1210',
  panelRaised: '#111916',
  borderStrong: '#243029',
  success: '#14f195',
  danger: '#f87171',
  info: '#14f195',
  textDim: '#6b7d74',
} as const

export const assetPalette: Record<string, string> = {
  btc: '#f7931a',
  sp500: '#6fbcf0',
  nasdaq: '#b388ff',
  gold: '#fbbf24',
  silver: '#b0bec5',
  bonds: '#14f195',
  realestate: '#ff9454',
  china: '#f87171',
  custom_stock: '#c084fc',
  cash: '#6b7d74',
}

export const space = {
  0: 0,
  1: 4,
  2: 6,
  3: 8,
  4: 10,
  5: 12,
  6: 16,
  8: 20,
  10: 24,
} as const

export const radius = {
  sm: 3,
  md: 4,
  lg: 6,
  xl: 8,
} as const

export const font = {
  mono: "'JetBrains Mono', 'SF Mono', 'Fira Code', ui-monospace, Menlo, Consolas, monospace",
} as const

export const size = {
  xs: 9,
  sm: 10,
  base: 11,
  md: 12,
  lg: 14,
  xl: 16,
  xxl: 18,
} as const

export const weight = {
  light: 300,
  regular: 400,
  medium: 500,
  semibold: 600,
} as const

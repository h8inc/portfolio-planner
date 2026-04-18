import type { ComponentType, SVGProps } from 'react'
import {
  Banknote,
  Bitcoin,
  CandlestickChart,
  Coins,
  Cpu,
  Gem,
  Globe2,
  Home,
  Landmark,
  TrendingUp,
} from 'lucide-react'
import type { AssetId } from '../../types'

type LucideIconComponent = ComponentType<SVGProps<SVGSVGElement>>

// Semantic, same stroke-weight icons so every card speaks one visual language.
// Color identity still comes from `assetPalette` in tokens.ts.
const ASSET_ICONS: Readonly<Record<AssetId, LucideIconComponent>> = {
  btc: Bitcoin,
  sp500: TrendingUp,
  nasdaq: Cpu,
  gold: Coins,
  silver: Gem,
  bonds: Landmark,
  realestate: Home,
  china: Globe2,
  custom_stock: CandlestickChart,
  cash: Banknote,
}

interface AssetIconProps {
  readonly id: AssetId
  readonly size?: number
  readonly color?: string
  readonly strokeWidth?: number
}

export const AssetIcon = ({ id, size = 16, color, strokeWidth = 1.75 }: AssetIconProps) => {
  const Icon = ASSET_ICONS[id] ?? CandlestickChart
  return (
    <Icon
      width={size}
      height={size}
      strokeWidth={strokeWidth}
      color={color}
      aria-hidden="true"
    />
  )
}

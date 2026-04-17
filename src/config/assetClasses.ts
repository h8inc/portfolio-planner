import type { AssetClass } from '../types'

export const ASSET_CLASSES: readonly AssetClass[] = [
  {
    id: 'btc',
    name: 'Bitcoin',
    short: 'BTC',
    icon: '₿',
    explainer:
      'Hardest money in history. Extremely volatile. Projections use a power-law growth curve calibrated to on-chain history.',
    model: 'btc_powerlaw',
    meanReturn: 0.35,
    volatility: 0.70,
    allowUserOverride: false,
    notes: 'BTC uses its own power-law engine, not GBM. Mean/vol here are approximate for card display only.',
  },
  {
    id: 'sp500',
    name: 'S&P 500',
    short: 'SPY',
    icon: 'US',
    explainer:
      'Large-cap US equities. The default benchmark. ~10% nominal CAGR over the long run with moderate volatility.',
    model: 'gbm',
    meanReturn: 0.10,
    volatility: 0.16,
    allowUserOverride: true,
    notes: 'Source: 1928–2023 S&P 500 total returns (Damodaran dataset).',
  },
  {
    id: 'nasdaq',
    name: 'NASDAQ / Tech',
    short: 'QQQ',
    icon: 'TECH',
    explainer:
      'US tech-heavy index. Higher expected return than S&P 500 with meaningfully higher volatility.',
    model: 'gbm',
    meanReturn: 0.13,
    volatility: 0.22,
    allowUserOverride: true,
    notes: 'Source: QQQ 2000–2024 total returns.',
  },
  {
    id: 'gold',
    name: 'Gold',
    short: 'AU',
    icon: 'Au',
    explainer:
      'Ancient monetary metal. Inflation hedge. Modest real returns with moderate volatility.',
    model: 'gbm',
    meanReturn: 0.07,
    volatility: 0.15,
    allowUserOverride: true,
    notes: 'Source: LBMA gold price 1971–2024.',
  },
  {
    id: 'silver',
    name: 'Silver',
    short: 'AG',
    icon: 'Ag',
    explainer:
      'Industrial + monetary metal. More volatile than gold with lower long-run returns.',
    model: 'gbm',
    meanReturn: 0.05,
    volatility: 0.25,
    allowUserOverride: true,
    notes: 'Source: LBMA silver price 1971–2024.',
  },
  {
    id: 'bonds',
    name: 'Bonds (AGG)',
    short: 'AGG',
    icon: 'B',
    explainer:
      'Broad US investment-grade bonds. Low volatility, low expected return. Diversifier against equities (most of the time).',
    model: 'gbm',
    meanReturn: 0.045,
    volatility: 0.05,
    allowUserOverride: true,
    notes: 'Source: AGG ETF 2003–2024 + US 10Y yield.',
  },
  {
    id: 'realestate',
    name: 'Real Estate',
    short: 'RE',
    icon: '⌂',
    explainer:
      'Generic residential/commercial real estate appreciation. Illiquid with transaction costs. Models raw price appreciation, not net rental yield.',
    model: 'gbm',
    meanReturn: 0.05,
    volatility: 0.10,
    allowUserOverride: true,
    notes: 'Source: Case-Shiller US National Home Price Index 1987–2024.',
  },
  {
    id: 'china',
    name: 'Chinese Stocks',
    short: 'FXI',
    icon: 'CN',
    explainer:
      'Large-cap Chinese equities. Higher vol, meaningful political-risk tail. Long-run returns have disappointed despite GDP growth.',
    model: 'gbm',
    meanReturn: 0.08,
    volatility: 0.28,
    allowUserOverride: true,
    notes: 'Source: FXI + MCHI 2004–2024 total returns.',
  },
  {
    id: 'custom_stock',
    name: 'Individual Stock',
    short: 'STK',
    icon: '●',
    explainer:
      'Single stock (e.g. NVDA, TSLA). Very high idiosyncratic risk. You set the expected return and volatility.',
    model: 'gbm',
    meanReturn: 0.15,
    volatility: 0.40,
    allowUserOverride: true,
    notes: 'Default params are placeholder — users should override based on their stock.',
  },
  {
    id: 'cash',
    name: 'Cash / HYSA',
    short: 'USD',
    icon: '$',
    explainer:
      'High-yield savings or money market. Modelled as deterministic compounding at the current rate. Inflation erodes real value.',
    model: 'deterministic',
    meanReturn: 0.04,
    volatility: 0,
    allowUserOverride: true,
    notes: 'Default reflects a typical HYSA rate; override with your actual rate.',
  },
]

export const ASSET_BY_ID: Readonly<Record<string, AssetClass>> = Object.fromEntries(
  ASSET_CLASSES.map((a) => [a.id, a]),
) as Readonly<Record<string, AssetClass>>

export function getAsset(id: string): AssetClass {
  const a = ASSET_BY_ID[id]
  if (!a) throw new Error(`Unknown asset id: ${id}`)
  return a
}

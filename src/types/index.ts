export type AssetId =
  | 'btc'
  | 'sp500'
  | 'nasdaq'
  | 'gold'
  | 'silver'
  | 'bonds'
  | 'realestate'
  | 'china'
  | 'custom_stock'
  | 'cash'

export type AssetModel = 'gbm' | 'btc_powerlaw' | 'deterministic'

export interface AssetClass {
  readonly id: AssetId
  readonly name: string
  readonly short: string
  readonly icon: string
  readonly explainer: string
  readonly model: AssetModel
  readonly meanReturn: number
  readonly volatility: number
  readonly allowUserOverride: boolean
  readonly notes?: string
}

export interface CorrelationMatrix {
  readonly ids: readonly AssetId[]
  readonly matrix: readonly (readonly number[])[]
}

export type SideAllocation = {
  readonly assetId: AssetId
  readonly weight: number
  readonly meanOverride?: number
  readonly volOverride?: number
}

export interface UserConfig {
  readonly version: number
  readonly createdAt: number
  readonly updatedAt: number

  readonly sellSide: readonly SideAllocation[]
  readonly buySide: readonly SideAllocation[]

  readonly lumpSumUsd: number
  readonly monthlyDcaUsd: number
  readonly horizonYears: number

  readonly monthlyExpensesUsd: number
  readonly bufferMonths: number
  readonly bufferOverride: boolean

  readonly seed: number
}

export type Percentile = 5 | 10 | 25 | 50 | 75 | 90 | 95

export interface PercentileBand {
  readonly p: Percentile
  readonly values: readonly number[]
}

export interface McAssetResult {
  readonly assetId: AssetId
  readonly label: string
  readonly months: number
  readonly percentiles: readonly PercentileBand[]
  readonly mean: readonly number[]
  readonly finalPercentiles: Readonly<Record<Percentile, number>>
  readonly cagrPercentiles: Readonly<Record<Percentile, number>>
}

export interface McPortfolioResult {
  readonly label: string
  readonly months: number
  readonly percentiles: readonly PercentileBand[]
  readonly finalPercentiles: Readonly<Record<Percentile, number>>
  readonly cagrPercentiles: Readonly<Record<Percentile, number>>
  readonly finalValues: readonly number[]
}

export interface McComparisonResult {
  readonly horizonYears: number
  readonly paths: number
  readonly seed: number
  readonly buySide: McPortfolioResult
  readonly sellSide: McPortfolioResult
  readonly buyWinRate: number
  readonly medianEdgePct: number
}

export interface McRunRequest {
  readonly id: number
  readonly config: UserConfig
  readonly paths: number
}

export type McWorkerMessage =
  | { readonly type: 'progress'; readonly id: number; readonly pct: number }
  | { readonly type: 'result'; readonly id: number; readonly result: McComparisonResult }
  | { readonly type: 'error'; readonly id: number; readonly message: string }

export interface Position {
  readonly id: string
  readonly assetId: AssetId
  readonly label: string
  readonly quantity: number
  readonly costBasisUsd: number
  readonly addedAt: number
  readonly currentPriceUsd?: number
}

export interface PortfolioState {
  readonly version: number
  readonly positions: readonly Position[]
}

export type OnboardingStep = 'assets' | 'capital' | 'buffer' | 'mix' | 'done'

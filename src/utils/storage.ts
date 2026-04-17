import type { PortfolioState, UserConfig } from '../types'

const CONFIG_KEY = 'stack-compare.config.v1'
const PORTFOLIO_KEY = 'stack-compare.portfolio.v1'

export const CONFIG_VERSION = 1
export const PORTFOLIO_VERSION = 1

export const DEFAULT_CONFIG: UserConfig = {
  version: CONFIG_VERSION,
  createdAt: 0,
  updatedAt: 0,
  sellSide: [{ assetId: 'cash', weight: 1 }],
  buySide: [{ assetId: 'btc', weight: 1 }],
  lumpSumUsd: 0,
  monthlyDcaUsd: 0,
  horizonYears: 5,
  monthlyExpensesUsd: 0,
  bufferMonths: 6,
  bufferOverride: false,
  seed: 42,
}

export const DEFAULT_PORTFOLIO: PortfolioState = {
  version: PORTFOLIO_VERSION,
  positions: [],
}

export function loadConfig(): UserConfig | null {
  try {
    const raw = window.localStorage.getItem(CONFIG_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as UserConfig
    if (!parsed.version || parsed.version !== CONFIG_VERSION) return null
    return parsed
  } catch {
    return null
  }
}

export function saveConfig(config: UserConfig): void {
  const toSave: UserConfig = { ...config, updatedAt: Date.now() }
  window.localStorage.setItem(CONFIG_KEY, JSON.stringify(toSave, null, 2))
}

export function clearConfig(): void {
  window.localStorage.removeItem(CONFIG_KEY)
}

export function loadPortfolio(): PortfolioState {
  try {
    const raw = window.localStorage.getItem(PORTFOLIO_KEY)
    if (!raw) return DEFAULT_PORTFOLIO
    const parsed = JSON.parse(raw) as PortfolioState
    if (!parsed.version || parsed.version !== PORTFOLIO_VERSION) return DEFAULT_PORTFOLIO
    return parsed
  } catch {
    return DEFAULT_PORTFOLIO
  }
}

export function savePortfolio(state: PortfolioState): void {
  window.localStorage.setItem(PORTFOLIO_KEY, JSON.stringify(state, null, 2))
}

export function exportAllJson(config: UserConfig, portfolio: PortfolioState): string {
  return JSON.stringify(
    {
      app: 'stack-compare',
      exportedAt: new Date().toISOString(),
      config,
      portfolio,
    },
    null,
    2,
  )
}

export interface ImportResult {
  readonly config?: UserConfig
  readonly portfolio?: PortfolioState
  readonly error?: string
}

export function importAllJson(raw: string): ImportResult {
  try {
    const parsed = JSON.parse(raw) as { config?: UserConfig; portfolio?: PortfolioState }
    const result: ImportResult = {}
    if (parsed.config && parsed.config.version === CONFIG_VERSION) {
      return { ...result, config: parsed.config, portfolio: parsed.portfolio }
    }
    return { ...result, portfolio: parsed.portfolio, error: 'Config version mismatch or missing' }
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) }
  }
}

import type {
  AssetId,
  McComparisonResult,
  McPortfolioResult,
  SideAllocation,
  UserConfig,
} from '../types'
import { getAsset } from '../config/assetClasses'
import { runGbm, type GbmAssetSpec } from './gbm'
import { runBtc } from './btc'
import {
  DEFAULT_PERCENTILES,
  buildPercentileBands,
  cagrPercentiles,
  finalPercentiles,
  finalValues,
} from './stats'

export interface PortfolioSimInput {
  readonly side: readonly SideAllocation[]
  readonly initialUsd: number
  readonly monthlyDcaUsd: number
  readonly years: number
  readonly seed: number
  readonly paths: number
}

interface AssetPricePaths {
  readonly id: AssetId
  readonly paths: readonly Float64Array[]
}

function simulateAssetPrices(
  side: readonly SideAllocation[],
  years: number,
  paths: number,
  seed: number,
): { months: number; priceMaps: AssetPricePaths[] } {
  if (side.length === 0) {
    const months = Math.round(years * 12)
    return { months, priceMaps: [] }
  }

  const gbmAssets: GbmAssetSpec[] = []
  let btcSpec: { id: AssetId; seed: number } | null = null

  for (const a of side) {
    const asset = getAsset(a.assetId)
    if (asset.model === 'btc_powerlaw') {
      btcSpec = { id: asset.id, seed: seed + 7 }
    } else if (asset.model === 'deterministic') {
      gbmAssets.push({
        id: asset.id,
        meanReturn: a.meanOverride ?? asset.meanReturn,
        volatility: 0,
      })
    } else {
      gbmAssets.push({
        id: asset.id,
        meanReturn: a.meanOverride ?? asset.meanReturn,
        volatility: a.volOverride ?? asset.volatility,
      })
    }
  }

  let months = Math.round(years * 12)
  const priceMaps: AssetPricePaths[] = []

  if (gbmAssets.length > 0) {
    const gbm = runGbm({
      assets: gbmAssets,
      years,
      paths,
      seed,
    })
    months = gbm.months
    for (let i = 0; i < gbm.assets.length; i++) {
      priceMaps.push({ id: gbm.assets[i], paths: gbm.paths[i] })
    }
  }

  if (btcSpec) {
    const btc = runBtc({
      years,
      paths,
      seed: btcSpec.seed,
    })
    months = btc.months
    priceMaps.push({ id: btcSpec.id, paths: btc.paths })
  }

  return { months, priceMaps }
}

function portfolioPaths(
  side: readonly SideAllocation[],
  initialUsd: number,
  monthlyDcaUsd: number,
  months: number,
  priceMaps: readonly AssetPricePaths[],
  pathCount: number,
): Float64Array[] {
  if (side.length === 0 || priceMaps.length === 0) {
    const out: Float64Array[] = new Array(pathCount)
    for (let p = 0; p < pathCount; p++) {
      const arr = new Float64Array(months + 1)
      for (let m = 0; m <= months; m++) {
        arr[m] = initialUsd + monthlyDcaUsd * m
      }
      out[p] = arr
    }
    return out
  }

  const totalWeight = side.reduce((s, a) => s + a.weight, 0) || 1
  const weights = side.map((a) => a.weight / totalWeight)

  const out: Float64Array[] = new Array(pathCount)
  const pathsByAsset = side.map((a) => priceMaps.find((pm) => pm.id === a.assetId)?.paths)

  for (let p = 0; p < pathCount; p++) {
    const path = new Float64Array(months + 1)
    const unitsPerAsset = new Float64Array(side.length)

    for (let i = 0; i < side.length; i++) {
      const pa = pathsByAsset[i]
      if (!pa) continue
      const initAlloc = initialUsd * weights[i]
      const p0 = pa[p][0]
      unitsPerAsset[i] = p0 > 0 ? initAlloc / p0 : 0
    }

    path[0] = initialUsd

    for (let m = 1; m <= months; m++) {
      if (monthlyDcaUsd > 0) {
        for (let i = 0; i < side.length; i++) {
          const pa = pathsByAsset[i]
          if (!pa) continue
          const price = pa[p][m]
          if (price > 0) {
            const buyUsd = monthlyDcaUsd * weights[i]
            unitsPerAsset[i] += buyUsd / price
          }
        }
      }
      let value = 0
      for (let i = 0; i < side.length; i++) {
        const pa = pathsByAsset[i]
        if (!pa) continue
        value += unitsPerAsset[i] * pa[p][m]
      }
      path[m] = value
    }

    out[p] = path
  }

  return out
}

function summarize(
  paths: readonly Float64Array[],
  months: number,
  years: number,
  initialUsd: number,
  label: string,
): McPortfolioResult {
  const { percentiles } = buildPercentileBands(paths, months, DEFAULT_PERCENTILES)
  const terminals = finalValues(paths, months)
  return {
    label,
    months,
    percentiles,
    finalPercentiles: finalPercentiles(terminals),
    cagrPercentiles: cagrPercentiles(terminals, Math.max(1, initialUsd), years),
    finalValues: terminals,
  }
}

export function simulateSide(input: PortfolioSimInput, label: string): McPortfolioResult {
  const { side, initialUsd, monthlyDcaUsd, years, paths, seed } = input
  const { months, priceMaps } = simulateAssetPrices(side, years, paths, seed)
  const pp = portfolioPaths(side, initialUsd, monthlyDcaUsd, months, priceMaps, paths)
  return summarize(pp, months, years, Math.max(1, initialUsd + monthlyDcaUsd), label)
}

export function runComparison(config: UserConfig, pathCount: number): McComparisonResult {
  const years = config.horizonYears
  const bufferUsd = config.monthlyExpensesUsd * config.bufferMonths
  const deployable = config.bufferOverride
    ? config.lumpSumUsd
    : Math.max(0, config.lumpSumUsd - bufferUsd)

  const buySide = simulateSide(
    {
      side: config.buySide,
      initialUsd: deployable,
      monthlyDcaUsd: config.monthlyDcaUsd,
      years,
      seed: config.seed,
      paths: pathCount,
    },
    'Buy side',
  )

  const sellSide = simulateSide(
    {
      side: config.sellSide,
      initialUsd: deployable,
      monthlyDcaUsd: config.monthlyDcaUsd,
      years,
      seed: config.seed + 1013904223,
      paths: pathCount,
    },
    'Sell side (held)',
  )

  const buyWinRate =
    buySide.finalValues.length > 0
      ? buySide.finalValues.reduce(
          (acc, v, i) => acc + (v > (sellSide.finalValues[i] ?? 0) ? 1 : 0),
          0,
        ) / buySide.finalValues.length
      : 0

  const buyMedian = buySide.finalPercentiles[50]
  const sellMedian = sellSide.finalPercentiles[50]
  const medianEdgePct = sellMedian > 0 ? (buyMedian - sellMedian) / sellMedian : 0

  return {
    horizonYears: years,
    paths: pathCount,
    seed: config.seed,
    buySide,
    sellSide,
    buyWinRate,
    medianEdgePct,
  }
}

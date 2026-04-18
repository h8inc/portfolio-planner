import type { ReactNode } from 'react'
import type { SideAllocation, UserConfig } from '../../types'
import { color } from '../../utils/tokens'
import { Card, SectionHeader } from '../common/ui'
import { WeightSliders } from '../common/WeightSliders'
import { getAsset } from '../../config/assetClasses'
import { formatUsd } from '../../utils/format'

interface StepReviewProps {
  readonly config: UserConfig
  readonly onUpdate: (patch: Partial<UserConfig>) => void
}

const describeSide = (side: readonly SideAllocation[]): string => {
  if (side.length === 0) return '—'
  const total = side.reduce((s, a) => s + a.weight, 0) || 1
  if (side.length === 1) return getAsset(side[0].assetId).short
  return side
    .map((a) => `${getAsset(a.assetId).short} ${Math.round((a.weight / total) * 100)}%`)
    .join(' · ')
}

export const StepReview = ({ config, onUpdate }: StepReviewProps) => {
  const bufferUsd = config.monthlyExpensesUsd * config.bufferMonths
  const deployable = config.bufferOverride
    ? config.lumpSumUsd
    : Math.max(0, config.lumpSumUsd - bufferUsd)

  const sellText = describeSide(config.sellSide)
  const buyText = describeSide(config.buySide)

  const needsWeights =
    config.sellSide.length > 1 || config.buySide.length > 1

  const updateSide = (key: 'sellSide' | 'buySide') => (next: SideAllocation[]) => {
    onUpdate({ [key]: next } as Partial<UserConfig>)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h2>Here's what the math will chew on</h2>
        <p style={{ color: color.textMuted, marginTop: 6, fontSize: 11, lineHeight: 1.6 }}>
          One last look before we run 10,000 simulated futures. Adjust weights below if your mix
          isn't right, then kick it off.
        </p>
      </div>

      {needsWeights && (
        <Card>
          <SectionHeader>Fine-tune your mix</SectionHeader>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {config.sellSide.length > 1 && (
              <div>
                <div
                  style={{
                    fontSize: 10,
                    color: color.textMuted,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    fontWeight: 600,
                    marginBottom: 6,
                  }}
                >
                  What you're holding
                </div>
                <WeightSliders
                  allocations={config.sellSide}
                  onChange={updateSide('sellSide')}
                />
              </div>
            )}
            {config.buySide.length > 1 && (
              <div>
                <div
                  style={{
                    fontSize: 10,
                    color: color.textMuted,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    fontWeight: 600,
                    marginBottom: 6,
                  }}
                >
                  What you'd rotate into
                </div>
                <WeightSliders
                  allocations={config.buySide}
                  onChange={updateSide('buySide')}
                />
              </div>
            )}
          </div>
        </Card>
      )}

      <TeaserCard
        sellText={sellText}
        buyText={buyText}
        years={config.horizonYears}
        deployable={deployable}
        monthlyDca={config.monthlyDcaUsd}
        bufferUsd={bufferUsd}
        bufferOverride={config.bufferOverride}
      />

      <p
        style={{
          fontSize: 10,
          color: color.textMuted,
          lineHeight: 1.6,
          letterSpacing: '0.02em',
        }}
      >
        Simulations are probabilistic, not predictions. Volatile assets produce wide outcome bands —
        the wider the band, the less certain the future. Nothing here is financial advice.
      </p>
    </div>
  )
}

interface TeaserCardProps {
  readonly sellText: string
  readonly buyText: string
  readonly years: number
  readonly deployable: number
  readonly monthlyDca: number
  readonly bufferUsd: number
  readonly bufferOverride: boolean
}

const TeaserCard = ({
  sellText,
  buyText,
  years,
  deployable,
  monthlyDca,
  bufferUsd,
  bufferOverride,
}: TeaserCardProps) => {
  return (
    <div
      style={{
        border: `1px solid ${color.accentDim}`,
        borderRadius: 10,
        background:
          'linear-gradient(180deg, rgba(20,241,149,0.08) 0%, rgba(20,241,149,0.02) 100%)',
        padding: '20px 22px',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}
    >
      <div
        style={{
          fontSize: 9,
          color: color.accent,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          fontWeight: 600,
        }}
      >
        The question you're asking
      </div>

      <div style={{ fontSize: 15, lineHeight: 1.65, color: color.text, fontWeight: 400 }}>
        <span style={{ color: color.textSec }}>Is it worth holding </span>
        <Chip>{sellText}</Chip>
        <span style={{ color: color.textSec }}> versus rotating into </span>
        <Chip>{buyText}</Chip>
        <span style={{ color: color.textSec }}> over </span>
        <Chip>{years} {years === 1 ? 'year' : 'years'}</Chip>
        <span style={{ color: color.textSec }}>, with </span>
        <Chip>{formatUsd(deployable, { compact: true })}</Chip>
        <span style={{ color: color.textSec }}> deployable</span>
        {monthlyDca > 0 && (
          <>
            <span style={{ color: color.textSec }}> plus </span>
            <Chip>{formatUsd(monthlyDca, { compact: true })}/mo</Chip>
          </>
        )}
        <span style={{ color: color.textSec }}>?</span>
      </div>

      <div
        style={{
          display: 'flex',
          gap: 10,
          flexWrap: 'wrap',
          paddingTop: 6,
          borderTop: `1px solid ${color.accentDim}`,
          fontSize: 10,
          color: color.textMuted,
          letterSpacing: '0.04em',
          lineHeight: 1.5,
        }}
      >
        {bufferOverride ? (
          <span>
            Safety net override on — full lump sum deployed, buffer of{' '}
            {formatUsd(bufferUsd, { compact: true })} treated as at-risk.
          </span>
        ) : (
          <span>
            {formatUsd(bufferUsd, { compact: true })} kept aside as your safety net before anything
            is deployed.
          </span>
        )}
      </div>
    </div>
  )
}

const Chip = ({ children }: { children: ReactNode }) => (
  <span
    style={{
      display: 'inline-block',
      padding: '1px 8px',
      borderRadius: 4,
      background: color.bgElevated,
      border: `1px solid ${color.accentDim}`,
      color: color.text,
      fontWeight: 500,
      fontVariantNumeric: 'tabular-nums',
      whiteSpace: 'nowrap',
    }}
  >
    {children}
  </span>
)

import { useEffect, useMemo } from 'react'
import type { UserConfig } from '../../types'
import { useMcWorker } from '../../hooks/useMcWorker'
import { color } from '../../utils/tokens'
import { formatPct, formatUsd } from '../../utils/format'
import { ComparisonChart } from '../charts/ComparisonChart'
import { FanChart } from '../charts/FanChart'
import { Card, SectionHeader } from '../common/ui'
import { PlannerControls } from './PlannerControls'
import { SideSummary } from './SideSummary'
import { ResultsTable } from './ResultsTable'

const BUY_TINT = '#14f195'
const SELL_TINT = '#9aaba3'

interface PlannerProps {
  readonly config: UserConfig
  readonly onUpdate: (patch: Partial<UserConfig>) => void
  readonly onEdit: () => void
}

export const Planner = ({ config, onUpdate, onEdit }: PlannerProps) => {
  const mc = useMcWorker()

  const bufferUsd = config.monthlyExpensesUsd * config.bufferMonths
  const deployable = config.bufferOverride
    ? config.lumpSumUsd
    : Math.max(0, config.lumpSumUsd - bufferUsd)

  const canRun = (deployable > 0 || config.monthlyDcaUsd > 0) && config.buySide.length > 0 && config.sellSide.length > 0

  const handleRun = () => {
    if (!canRun) return
    onUpdate({ seed: Math.floor(Math.random() * 2 ** 31) })
  }

  useEffect(() => {
    if (canRun && !mc.running) {
      mc.run(config, 4000)
    }
  }, [config.seed]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (canRun && !mc.result && !mc.running) {
      mc.run(config, 4000)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const initialForCagr = useMemo(
    () => Math.max(1, deployable + config.monthlyDcaUsd * config.horizonYears * 12),
    [deployable, config.monthlyDcaUsd, config.horizonYears]
  )

  const buyWins = mc.result ? mc.result.buyWinRate > 0.5 : false
  const winColor = buyWins ? color.positive : color.negative

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 16, alignItems: 'start' }}>
      <aside style={{ position: 'sticky', top: 72 }}>
        <PlannerControls
          config={config}
          onUpdate={onUpdate}
          onRun={handleRun}
          running={mc.running}
          onEdit={onEdit}
          canRun={canRun}
        />
      </aside>

      <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Card>
          <SectionHeader
            suffix={
              mc.result ? (
                <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ color: color.textMuted, fontWeight: 400, letterSpacing: 0 }}>Buy wins</span>
                  <span
                    style={{
                      color: winColor,
                      fontSize: 14,
                      fontWeight: 600,
                      letterSpacing: 0,
                    }}
                  >
                    {formatPct(mc.result.buyWinRate, 0)}
                  </span>
                  <span style={{ color: color.textMuted, fontWeight: 400, letterSpacing: 0 }}>
                    edge {formatPct(mc.result.medianEdgePct, 0)}
                  </span>
                </span>
              ) : null
            }
          >
            Comparison · {config.horizonYears}y
          </SectionHeader>

          <div style={{ fontSize: 11, color: color.textMuted, marginBottom: 10 }}>
            Median + P10–P90 band per side. Deploying{' '}
            <span style={{ color: color.text }}>{formatUsd(deployable, { compact: true })}</span>
            {config.monthlyDcaUsd > 0 && (
              <>
                {' '}
                + <span style={{ color: color.text }}>{formatUsd(config.monthlyDcaUsd, { compact: true })}</span>/mo DCA
              </>
            )}
            .
          </div>

          {mc.error && (
            <div
              style={{
                padding: 10,
                background: color.negativeBg,
                border: `1px solid ${color.negative}`,
                borderRadius: 6,
                color: color.negative,
                fontSize: 11,
              }}
            >
              Simulation error: {mc.error}
            </div>
          )}

          {!mc.result && !mc.running && (
            <EmptyState>
              {canRun ? 'Click Run to generate comparison.' : 'Configure capital and both sides, then run.'}
            </EmptyState>
          )}

          {mc.running && <EmptyState>Running Monte Carlo…</EmptyState>}

          {mc.result && (
            <>
              <ComparisonChart
                buy={mc.result.buySide}
                sell={mc.result.sellSide}
                buyTint={BUY_TINT}
                sellTint={SELL_TINT}
                height={300}
                baseline={deployable}
              />
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: 20,
                  marginTop: 8,
                  fontSize: 10,
                  color: color.textMuted,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                <LegendDot dotColor={BUY_TINT} label={`Buy · ${sideLabel(config, 'buy')}`} />
                <LegendDot dotColor={SELL_TINT} label={`Sell held · ${sideLabel(config, 'sell')}`} />
                <LegendDot dotColor={color.textMuted} label="Start" dashed />
              </div>
            </>
          )}
        </Card>

        {mc.result && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
              gap: 12,
            }}
          >
            <Card>
              <SectionHeader suffix={<SideSummary side={config.buySide} />}>
                <span style={{ color: BUY_TINT }}>Buy side</span>
              </SectionHeader>
              <FanChart result={mc.result.buySide} tint={BUY_TINT} height={200} baseline={deployable} />
              <ResultsTable result={mc.result.buySide} initial={initialForCagr} years={config.horizonYears} />
            </Card>
            <Card>
              <SectionHeader suffix={<SideSummary side={config.sellSide} />}>
                <span style={{ color: color.textSec }}>Sell side (held)</span>
              </SectionHeader>
              <FanChart result={mc.result.sellSide} tint={SELL_TINT} height={200} baseline={deployable} />
              <ResultsTable result={mc.result.sellSide} initial={initialForCagr} years={config.horizonYears} />
            </Card>
          </div>
        )}
      </section>
    </div>
  )
}

function sideLabel(config: UserConfig, side: 'buy' | 'sell'): string {
  const s = side === 'buy' ? config.buySide : config.sellSide
  return s.map((a) => a.assetId.toUpperCase()).join(' + ')
}

const LegendDot = ({ dotColor, label, dashed }: { dotColor: string; label: string; dashed?: boolean }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
    <span
      style={{
        width: 14,
        height: 0,
        display: 'inline-block',
        borderTop: dashed ? `2px dashed ${dotColor}` : `2px solid ${dotColor}`,
      }}
    />
    <span>{label}</span>
  </span>
)

const EmptyState = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      padding: '28px 12px',
      textAlign: 'center',
      color: color.textMuted,
      border: `1px dashed ${color.border}`,
      borderRadius: 6,
      fontSize: 11,
      letterSpacing: '0.04em',
    }}
  >
    {children}
  </div>
)

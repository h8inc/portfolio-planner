import { useState } from 'react'
import type { AssetId, UserConfig } from '../../types'
import { color } from '../../utils/tokens'
import { StepAssets } from './StepAssets'
import { StepMix } from './StepMix'
import { StepCapital } from './StepCapital'
import { StepBuffer } from './StepBuffer'

interface OnboardingProps {
  readonly config: UserConfig
  readonly onUpdate: (patch: Partial<UserConfig>) => void
  readonly onDone: () => void
  readonly onCancel?: () => void
}

type StepId = 'sell' | 'buy' | 'mix' | 'capital' | 'buffer'
const STEPS: readonly StepId[] = ['sell', 'buy', 'mix', 'capital', 'buffer']

const STEP_LABELS: Record<StepId, string> = {
  sell: '01 · Hold',
  buy: '02 · Target',
  mix: '03 · Mix',
  capital: '04 · Capital',
  buffer: '05 · Safety',
}

export const Onboarding = ({ config, onUpdate, onDone, onCancel }: OnboardingProps) => {
  const [step, setStep] = useState<StepId>('sell')
  const stepIndex = STEPS.indexOf(step)

  const handleSellSide = (ids: AssetId[]) => {
    onUpdate({
      sellSide: ids.map((id) => {
        const existing = config.sellSide.find((a) => a.assetId === id)
        return existing ?? { assetId: id, weight: 1 / Math.max(1, ids.length) }
      }),
    })
  }

  const handleBuySide = (ids: AssetId[]) => {
    onUpdate({
      buySide: ids.map((id) => {
        const existing = config.buySide.find((a) => a.assetId === id)
        return existing ?? { assetId: id, weight: 1 / Math.max(1, ids.length) }
      }),
    })
  }

  const next = () => {
    const i = STEPS.indexOf(step)
    if (i < STEPS.length - 1) setStep(STEPS[i + 1])
    else onDone()
  }
  const back = () => {
    const i = STEPS.indexOf(step)
    if (i > 0) setStep(STEPS[i - 1])
  }

  const canContinue = (() => {
    if (step === 'sell') return config.sellSide.length > 0
    if (step === 'buy') return config.buySide.length > 0
    if (step === 'capital') return config.lumpSumUsd > 0 || config.monthlyDcaUsd > 0
    return true
  })()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          borderBottom: `1px solid ${color.border}`,
          paddingBottom: 12,
        }}
      >
        <div>
          <h1 style={{ letterSpacing: '0.04em' }}>Set up your comparison</h1>
          <p style={{ color: color.textMuted, marginTop: 4, fontSize: 11 }}>
            A few minutes to answer what you're weighing. Everything stays on this device.
          </p>
        </div>
        {onCancel && (
          <button className="ghost" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>

      <Stepper steps={STEPS} current={step} />

      <div style={{ minHeight: 380 }}>
        {step === 'sell' && (
          <StepAssets
            title="What are you thinking of reducing or selling?"
            subtitle="Pick the asset(s) you currently hold. If you're starting from cash, pick Cash."
            selected={config.sellSide.map((a) => a.assetId)}
            onChange={handleSellSide}
          />
        )}
        {step === 'buy' && (
          <StepAssets
            title="What would you rotate into?"
            subtitle="Pick one or more target assets. Multiple picks creates a portfolio mix."
            selected={config.buySide.map((a) => a.assetId)}
            onChange={handleBuySide}
          />
        )}
        {step === 'mix' && <StepMix config={config} onUpdate={onUpdate} />}
        {step === 'capital' && <StepCapital config={config} onUpdate={onUpdate} />}
        {step === 'buffer' && <StepBuffer config={config} onUpdate={onUpdate} />}
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          paddingTop: 10,
          borderTop: `1px solid ${color.border}`,
        }}
      >
        <button onClick={back} disabled={stepIndex === 0} className="ghost">
          ← Back
        </button>
        <button onClick={next} disabled={!canContinue} className="primary">
          {stepIndex === STEPS.length - 1 ? 'Finish & run' : 'Continue →'}
        </button>
      </div>
    </div>
  )
}

const Stepper = ({ steps, current }: { steps: readonly StepId[]; current: StepId }) => {
  const i = steps.indexOf(current)
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {steps.map((s, idx) => {
        const active = s === current
        const done = idx < i
        return (
          <div
            key={s}
            style={{
              flex: 1,
              padding: '6px 10px',
              borderRadius: 4,
              border: `1px solid ${active ? color.accentDim : color.border}`,
              background: active ? color.accentSoft : done ? color.bgSubtle : color.bgElevated,
              fontSize: 10,
              color: active ? color.accent : done ? color.textSec : color.textMuted,
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            {STEP_LABELS[s]}
          </div>
        )
      })}
    </div>
  )
}

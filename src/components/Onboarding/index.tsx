import { useState } from 'react'
import type { AssetId, UserConfig } from '../../types'
import { color } from '../../utils/tokens'
import { StepAssets } from './StepAssets'
import { StepCapital } from './StepCapital'
import { StepBuffer } from './StepBuffer'
import { StepReview } from './StepReview'

interface OnboardingProps {
  readonly config: UserConfig
  readonly onUpdate: (patch: Partial<UserConfig>) => void
  readonly onDone: () => void
  readonly onCancel?: () => void
}

type StepId = 'hold' | 'target' | 'capital' | 'safety' | 'review'
const STEPS: readonly StepId[] = ['hold', 'target', 'capital', 'safety', 'review']

const STEP_LABELS: Record<StepId, string> = {
  hold: 'Hold',
  target: 'Target',
  capital: 'Capital',
  safety: 'Safety',
  review: 'Review',
}

export const Onboarding = ({ config, onUpdate, onDone, onCancel }: OnboardingProps) => {
  const [step, setStep] = useState<StepId>('hold')
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
    if (step === 'hold') return config.sellSide.length > 0
    if (step === 'target') return config.buySide.length > 0
    if (step === 'capital') return config.lumpSumUsd > 0 || config.monthlyDcaUsd > 0
    return true
  })()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          borderBottom: `1px solid ${color.border}`,
          paddingBottom: 14,
        }}
      >
        <div>
          <h1 style={{ letterSpacing: '0.04em' }}>Set up your comparison</h1>
          <p style={{ color: color.textMuted, marginTop: 6, fontSize: 11, lineHeight: 1.55 }}>
            A few minutes to answer what you're weighing. Everything stays on this device — no
            account, no server, no tracking.
          </p>
        </div>
        {onCancel && (
          <button className="ghost" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>

      <Stepper steps={STEPS} current={step} labels={STEP_LABELS} />

      <div style={{ minHeight: 380 }}>
        {step === 'hold' && (
          <StepAssets
            title="What are you holding?"
            subtitle="Pick the asset(s) you already own and might reduce or sell. Starting from cash? Pick Cash."
            selected={config.sellSide.map((a) => a.assetId)}
            onChange={handleSellSide}
          />
        )}
        {step === 'target' && (
          <StepAssets
            title="What are you considering?"
            subtitle="Pick one or more assets you'd rotate into. Multiple picks become a portfolio mix you'll weight on the review step."
            selected={config.buySide.map((a) => a.assetId)}
            onChange={handleBuySide}
          />
        )}
        {step === 'capital' && <StepCapital config={config} onUpdate={onUpdate} />}
        {step === 'safety' && <StepBuffer config={config} onUpdate={onUpdate} />}
        {step === 'review' && <StepReview config={config} onUpdate={onUpdate} />}
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: 14,
          borderTop: `1px solid ${color.border}`,
        }}
      >
        <button onClick={back} disabled={stepIndex === 0} className="ghost">
          ← Back
        </button>
        <div style={{ fontSize: 10, color: color.textMuted, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Step {stepIndex + 1} of {STEPS.length}
        </div>
        <button onClick={next} disabled={!canContinue} className="primary">
          {stepIndex === STEPS.length - 1 ? 'Run 10,000 simulations' : 'Continue →'}
        </button>
      </div>
    </div>
  )
}

interface StepperProps {
  readonly steps: readonly StepId[]
  readonly current: StepId
  readonly labels: Record<StepId, string>
}

const Stepper = ({ steps, current, labels }: StepperProps) => {
  const i = steps.indexOf(current)
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${steps.length}, 1fr)`,
        alignItems: 'flex-start',
      }}
    >
      {steps.map((s, idx) => {
        const active = idx === i
        const done = idx < i
        const prevDone = idx > 0 && idx - 1 < i
        const nextDone = idx < steps.length - 1 && idx < i
        return (
          <div
            key={s}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
              position: 'relative',
              paddingTop: 4,
            }}
          >
            <div
              style={{
                position: 'relative',
                width: '100%',
                height: 22,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {idx > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: 0,
                    width: '50%',
                    height: 1,
                    background: prevDone ? color.accentDim : color.border,
                  }}
                />
              )}
              {idx < steps.length - 1 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '50%',
                    right: 0,
                    width: '50%',
                    height: 1,
                    background: nextDone ? color.accentDim : color.border,
                  }}
                />
              )}
              <span
                style={{
                  position: 'relative',
                  width: 22,
                  height: 22,
                  borderRadius: 11,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: 0,
                  background: active ? color.accent : done ? color.accentSoft : color.bgElevated,
                  border: `1px solid ${active || done ? color.accentDim : color.border}`,
                  color: active ? '#050805' : done ? color.accent : color.textMuted,
                  boxShadow: active ? `0 0 0 3px ${color.accentSoft}` : 'none',
                  transition: 'all 150ms ease',
                }}
              >
                {idx + 1}
              </span>
            </div>
            <span
              style={{
                fontSize: 10,
                fontWeight: active ? 600 : 400,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: active ? color.text : done ? color.textSec : color.textMuted,
                textAlign: 'center',
                lineHeight: 1.3,
              }}
            >
              {labels[s]}
            </span>
          </div>
        )
      })}
    </div>
  )
}

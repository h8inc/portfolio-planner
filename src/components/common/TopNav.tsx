import type { ReactNode } from 'react'
import { color } from '../../utils/tokens'

interface TopNavProps {
  readonly tab: 'planner' | 'portfolio'
  readonly onTabChange: (t: 'planner' | 'portfolio') => void
  readonly showTabs: boolean
  readonly onEditSetup: () => void
  readonly onReset: () => void
}

export const TopNav = ({ tab, onTabChange, showTabs, onEditSetup, onReset }: TopNavProps) => {
  return (
    <header
      style={{
        borderBottom: `1px solid ${color.border}`,
        background: color.bgElevated,
        padding: '10px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div
          style={{
            width: 22,
            height: 22,
            borderRadius: 4,
            background: color.accent,
            color: '#050805',
            fontWeight: 700,
            fontSize: 12,
            display: 'grid',
            placeItems: 'center',
          }}
        >
          ◆
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              fontWeight: 600,
              fontSize: 12,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: color.text,
            }}
          >
            Stack Compare
          </div>
          <div style={{ fontSize: 9, color: color.textMuted, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            reallocation simulator
          </div>
        </div>
      </div>

      {showTabs && (
        <nav style={{ display: 'flex', gap: 2 }}>
          <TabButton active={tab === 'planner'} onClick={() => onTabChange('planner')}>
            Planner
          </TabButton>
          <TabButton active={tab === 'portfolio'} onClick={() => onTabChange('portfolio')}>
            Portfolio
          </TabButton>
        </nav>
      )}

      <div style={{ display: 'flex', gap: 6 }}>
        {showTabs && (
          <button onClick={onEditSetup} className="ghost">
            Edit setup
          </button>
        )}
        <button onClick={onReset} className="ghost" title="Clear saved data">
          Reset
        </button>
      </div>
    </header>
  )
}

const TabButton = ({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
}) => (
  <button
    onClick={onClick}
    style={{
      background: active ? color.accentSoft : 'transparent',
      border: `1px solid ${active ? color.accentDim : color.border}`,
      padding: '6px 14px',
      borderRadius: 4,
      color: active ? color.accent : color.textSec,
      fontSize: 11,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      fontWeight: 600,
    }}
  >
    {children}
  </button>
)

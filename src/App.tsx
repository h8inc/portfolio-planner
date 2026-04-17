import { useState } from 'react'
import { useUserConfig } from './hooks/useUserConfig'
import { usePortfolio } from './hooks/usePortfolio'
import { Onboarding } from './components/Onboarding'
import { Planner } from './components/Planner'
import { Portfolio } from './components/Portfolio'
import { TopNav } from './components/common/TopNav'

type Tab = 'planner' | 'portfolio'

function App() {
  const cfg = useUserConfig()
  const portfolio = usePortfolio()
  const [tab, setTab] = useState<Tab>('planner')
  const [editing, setEditing] = useState(false)

  const needsOnboarding = !cfg.hasSaved || editing

  const handleOnboardingDone = () => {
    cfg.markComplete()
    setEditing(false)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <TopNav
        tab={tab}
        onTabChange={setTab}
        showTabs={!needsOnboarding}
        onEditSetup={() => setEditing(true)}
        onReset={() => {
          cfg.reset()
          setEditing(false)
        }}
      />

      <main style={{ flex: 1, padding: '20px 24px', maxWidth: 1320, margin: '0 auto', width: '100%' }}>
        {needsOnboarding ? (
          <Onboarding
            config={cfg.config}
            onUpdate={cfg.update}
            onDone={handleOnboardingDone}
            onCancel={editing ? () => setEditing(false) : undefined}
          />
        ) : tab === 'planner' ? (
          <Planner config={cfg.config} onUpdate={cfg.update} onEdit={() => setEditing(true)} />
        ) : (
          <Portfolio
            state={portfolio.state}
            onAdd={portfolio.addPosition}
            onUpdate={portfolio.updatePosition}
            onRemove={portfolio.removePosition}
          />
        )}
      </main>
    </div>
  )
}

export default App

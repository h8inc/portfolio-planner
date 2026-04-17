import { useCallback, useState } from 'react'
import type { PortfolioState, Position } from '../types'
import { DEFAULT_PORTFOLIO, loadPortfolio, savePortfolio } from '../utils/storage'

export interface UsePortfolio {
  readonly state: PortfolioState
  addPosition: (position: Omit<Position, 'id' | 'addedAt'>) => void
  updatePosition: (id: string, patch: Partial<Position>) => void
  removePosition: (id: string) => void
  clearAll: () => void
}

export function usePortfolio(): UsePortfolio {
  const [state, setState] = useState<PortfolioState>(() => loadPortfolio())

  const persist = useCallback((next: PortfolioState) => {
    setState(next)
    savePortfolio(next)
  }, [])

  const addPosition = useCallback((position: Omit<Position, 'id' | 'addedAt'>) => {
    setState((prev) => {
      const newPos: Position = {
        ...position,
        id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
        addedAt: Date.now(),
      }
      const next: PortfolioState = { ...prev, positions: [...prev.positions, newPos] }
      savePortfolio(next)
      return next
    })
  }, [])

  const updatePosition = useCallback((id: string, patch: Partial<Position>) => {
    setState((prev) => {
      const next: PortfolioState = {
        ...prev,
        positions: prev.positions.map((p) => (p.id === id ? { ...p, ...patch } : p)),
      }
      savePortfolio(next)
      return next
    })
  }, [])

  const removePosition = useCallback((id: string) => {
    setState((prev) => {
      const next: PortfolioState = { ...prev, positions: prev.positions.filter((p) => p.id !== id) }
      savePortfolio(next)
      return next
    })
  }, [])

  const clearAll = useCallback(() => persist(DEFAULT_PORTFOLIO), [persist])

  return { state, addPosition, updatePosition, removePosition, clearAll }
}

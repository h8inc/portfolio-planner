import { useCallback, useState } from 'react'
import type { UserConfig } from '../types'
import { DEFAULT_CONFIG, loadConfig, saveConfig, clearConfig } from '../utils/storage'

export interface UseUserConfig {
  readonly config: UserConfig
  readonly hasSaved: boolean
  update: (patch: Partial<UserConfig>) => void
  replace: (next: UserConfig) => void
  reset: () => void
  markComplete: () => void
}

export function useUserConfig(): UseUserConfig {
  const [config, setConfig] = useState<UserConfig>(() => loadConfig() ?? DEFAULT_CONFIG)
  const [hasSaved, setHasSaved] = useState<boolean>(() => loadConfig() !== null)

  const persist = useCallback((next: UserConfig) => {
    setConfig(next)
    saveConfig(next)
    setHasSaved(true)
  }, [])

  const update = useCallback(
    (patch: Partial<UserConfig>) => {
      setConfig((prev) => {
        const next: UserConfig = { ...prev, ...patch, updatedAt: Date.now() }
        saveConfig(next)
        return next
      })
    },
    [],
  )

  const replace = useCallback((next: UserConfig) => persist(next), [persist])

  const reset = useCallback(() => {
    clearConfig()
    setConfig({ ...DEFAULT_CONFIG, createdAt: Date.now() })
    setHasSaved(false)
  }, [])

  const markComplete = useCallback(() => {
    setConfig((prev) => {
      const next: UserConfig = {
        ...prev,
        createdAt: prev.createdAt || Date.now(),
        updatedAt: Date.now(),
      }
      saveConfig(next)
      setHasSaved(true)
      return next
    })
  }, [])

  return { config, hasSaved, update, replace, reset, markComplete }
}

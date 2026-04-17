import { useCallback, useEffect, useRef, useState } from 'react'
import type { McComparisonResult, McRunRequest, McWorkerMessage, UserConfig } from '../types'

export interface UseMcWorker {
  readonly result: McComparisonResult | null
  readonly running: boolean
  readonly error: string | null
  run: (config: UserConfig, paths?: number) => void
}

export function useMcWorker(): UseMcWorker {
  const workerRef = useRef<Worker | null>(null)
  const idRef = useRef(0)
  const [result, setResult] = useState<McComparisonResult | null>(null)
  const [running, setRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const w = new Worker(new URL('../engines/mc.worker.ts', import.meta.url), {
      type: 'module',
    })
    workerRef.current = w
    w.addEventListener('message', (ev: MessageEvent<McWorkerMessage>) => {
      const msg = ev.data
      if (msg.type === 'result' && msg.id === idRef.current) {
        setResult(msg.result)
        setRunning(false)
        setError(null)
      } else if (msg.type === 'error' && msg.id === idRef.current) {
        setError(msg.message)
        setRunning(false)
      }
    })
    return () => {
      w.terminate()
      workerRef.current = null
    }
  }, [])

  const run = useCallback((config: UserConfig, paths = 10000) => {
    const w = workerRef.current
    if (!w) return
    idRef.current += 1
    setRunning(true)
    setError(null)
    const req: McRunRequest = { id: idRef.current, config, paths }
    w.postMessage(req)
  }, [])

  return { result, running, error, run }
}

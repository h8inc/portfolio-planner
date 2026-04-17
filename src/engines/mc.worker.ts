import type { McRunRequest, McWorkerMessage } from '../types'
import { runComparison } from './portfolio'

self.addEventListener('message', (ev: MessageEvent<McRunRequest>) => {
  const req = ev.data
  try {
    const result = runComparison(req.config, req.paths)
    const msg: McWorkerMessage = { type: 'result', id: req.id, result }
    ;(self as unknown as Worker).postMessage(msg)
  } catch (err) {
    const msg: McWorkerMessage = {
      type: 'error',
      id: req.id,
      message: err instanceof Error ? err.message : String(err),
    }
    ;(self as unknown as Worker).postMessage(msg)
  }
})

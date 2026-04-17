export interface Rng {
  next(): number
  normal(): number
}

export function mulberry32(seed: number): Rng {
  let a = seed >>> 0
  const next = (): number => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  let spare: number | null = null
  const normal = (): number => {
    if (spare !== null) {
      const v = spare
      spare = null
      return v
    }
    let u = 0
    let v = 0
    while (u === 0) u = next()
    while (v === 0) v = next()
    const mag = Math.sqrt(-2.0 * Math.log(u))
    const angle = 2.0 * Math.PI * v
    spare = mag * Math.sin(angle)
    return mag * Math.cos(angle)
  }
  return { next, normal }
}

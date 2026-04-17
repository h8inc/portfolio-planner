export function cholesky(matrix: readonly (readonly number[])[]): number[][] {
  const n = matrix.length
  const L: number[][] = Array.from({ length: n }, () => Array(n).fill(0))
  for (let i = 0; i < n; i++) {
    for (let j = 0; j <= i; j++) {
      let sum = 0
      for (let k = 0; k < j; k++) sum += L[i][k] * L[j][k]
      if (i === j) {
        const diag = matrix[i][i] - sum
        L[i][j] = Math.sqrt(Math.max(diag, 1e-12))
      } else {
        L[i][j] = (matrix[i][j] - sum) / (L[j][j] || 1e-12)
      }
    }
  }
  return L
}

export function applyCholesky(L: readonly number[][], z: readonly number[]): number[] {
  const n = L.length
  const out = new Array<number>(n).fill(0)
  for (let i = 0; i < n; i++) {
    let s = 0
    for (let j = 0; j <= i; j++) s += L[i][j] * z[j]
    out[i] = s
  }
  return out
}

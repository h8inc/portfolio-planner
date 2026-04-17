import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import type { McPortfolioResult } from '../../types'
import { color } from '../../utils/tokens'

interface ComparisonChartProps {
  readonly buy: McPortfolioResult
  readonly sell: McPortfolioResult
  readonly buyTint: string
  readonly sellTint: string
  readonly height?: number
  readonly baseline?: number
}

export const ComparisonChart = ({
  buy,
  sell,
  buyTint,
  sellTint,
  height = 320,
  baseline,
}: ComparisonChartProps) => {
  const ref = useRef<SVGSVGElement | null>(null)

  useEffect(() => {
    const svg = ref.current
    if (!svg) return
    const container = svg.parentElement
    const width = container?.clientWidth ?? 600
    svg.setAttribute('width', String(width))
    svg.setAttribute('height', String(height))

    const margin = { top: 20, right: 16, bottom: 34, left: 60 }
    const innerW = width - margin.left - margin.right
    const innerH = height - margin.top - margin.bottom

    const months = Math.max(buy.months, sell.months)
    const x = d3.scaleLinear().domain([0, months]).range([0, innerW])

    const all: number[] = []
    for (const src of [buy, sell]) {
      for (const b of src.percentiles) {
        if (b.p === 5 || b.p === 95) for (const v of b.values) all.push(v)
      }
    }
    if (baseline != null) all.push(baseline)
    const yMax = d3.max(all) ?? 1
    const yMin = Math.max(0, d3.min(all) ?? 0)
    const y = d3.scaleLinear().domain([yMin, yMax]).nice().range([innerH, 0])

    const root = d3.select(svg)
    root.selectAll('*').remove()
    const g = root.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

    const yearTicks = yearTickValues(months)
    g.append('g')
      .attr('transform', `translate(0,${innerH})`)
      .call(
        d3
          .axisBottom(x)
          .tickValues(yearTicks)
          .tickFormat((d) => `${Math.round(Number(d) / 12)}y`),
      )
      .call((sel) => {
        sel.selectAll('text').style('fill', color.textMuted).style('font-size', 10).style('font-family', 'var(--font-mono)')
        sel.selectAll('line').style('stroke', color.border)
        sel.selectAll('path').style('stroke', color.border)
      })

    g.append('g')
      .call(
        d3
          .axisLeft(y)
          .ticks(5)
          .tickFormat((d) => {
            const n = Number(d)
            if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
            if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}k`
            return `$${n.toFixed(0)}`
          }),
      )
      .call((sel) => {
        sel.selectAll('text').style('fill', color.textMuted).style('font-size', 10).style('font-family', 'var(--font-mono)')
        sel.selectAll('line').style('stroke', color.border)
        sel.selectAll('path').style('stroke', color.border)
      })

    for (const [src, tint] of [
      [buy, buyTint] as const,
      [sell, sellTint] as const,
    ]) {
      const p10 = src.percentiles.find((b) => b.p === 10)?.values as number[] | undefined
      const p90 = src.percentiles.find((b) => b.p === 90)?.values as number[] | undefined
      const median = src.percentiles.find((b) => b.p === 50)?.values as number[] | undefined
      if (p10 && p90) {
        const area = d3
          .area<number>()
          .x((_, i) => x(i))
          .y0((_, i) => y(p10[i]))
          .y1((_, i) => y(p90[i]))
          .curve(d3.curveMonotoneX)
        g.append('path').datum(p90).attr('d', area).attr('fill', tint).attr('opacity', 0.15)
      }
      if (median) {
        const line = d3
          .line<number>()
          .x((_, i) => x(i))
          .y((d) => y(d))
          .curve(d3.curveMonotoneX)
        g.append('path').datum(median).attr('d', line).attr('fill', 'none').attr('stroke', tint).attr('stroke-width', 2.5)
      }
    }

    if (baseline != null) {
      g.append('line')
        .attr('x1', 0)
        .attr('x2', innerW)
        .attr('y1', y(baseline))
        .attr('y2', y(baseline))
        .attr('stroke', color.textDim)
        .attr('stroke-dasharray', '4,4')
        .attr('stroke-width', 1)
    }
  }, [buy, sell, buyTint, sellTint, height, baseline])

  return <svg ref={ref} style={{ display: 'block', width: '100%' }} />
}

function yearTickValues(months: number): number[] {
  const years = months / 12
  const maxTicks = 8
  const stepYears = Math.max(1, Math.ceil(years / maxTicks))
  const out: number[] = [0]
  for (let y = stepYears; y <= years + 0.001; y += stepYears) {
    out.push(Math.round(y * 12))
  }
  return out
}

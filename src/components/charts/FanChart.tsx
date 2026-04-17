import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import type { McPortfolioResult, Percentile } from '../../types'
import { color } from '../../utils/tokens'

interface FanChartProps {
  readonly result: McPortfolioResult
  readonly tint: string
  readonly height?: number
  readonly baseline?: number
}

const BANDS: { inner: Percentile; outer: Percentile; opacity: number }[] = [
  { inner: 25, outer: 75, opacity: 0.28 },
  { inner: 10, outer: 90, opacity: 0.18 },
  { inner: 5, outer: 95, opacity: 0.1 },
]

export const FanChart = ({ result, tint, height = 260, baseline }: FanChartProps) => {
  const ref = useRef<SVGSVGElement | null>(null)

  useEffect(() => {
    const svg = ref.current
    if (!svg) return
    const container = svg.parentElement
    const width = container?.clientWidth ?? 600
    svg.setAttribute('width', String(width))
    svg.setAttribute('height', String(height))

    const margin = { top: 14, right: 14, bottom: 28, left: 56 }
    const innerW = width - margin.left - margin.right
    const innerH = height - margin.top - margin.bottom

    const months = result.months
    const x = d3.scaleLinear().domain([0, months]).range([0, innerW])

    const pByName = (p: Percentile): number[] =>
      result.percentiles.find((band) => band.p === p)?.values as number[]

    const allValues: number[] = []
    for (const band of result.percentiles) for (const v of band.values) allValues.push(v)
    if (baseline != null) allValues.push(baseline)
    const yMax = d3.max(allValues) ?? 1
    const yMin = Math.max(0, d3.min(allValues) ?? 0)
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

    g.append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(0,${innerH})`)
      .call(
        d3
          .axisBottom(x)
          .tickValues(yearTicks)
          .tickSize(-innerH)
          .tickFormat(() => ''),
      )
      .call((sel) => {
        sel.selectAll('line').style('stroke', color.border).style('stroke-dasharray', '2,3').style('opacity', 0.4)
        sel.select('.domain').remove()
      })

    for (const band of BANDS) {
      const upper = pByName(band.outer)
      const lower = pByName(band.inner)
      if (!upper || !lower) continue
      const area = d3
        .area<number>()
        .x((_, i) => x(i))
        .y0((_, i) => y(lower[i]))
        .y1((_, i) => y(upper[i]))
        .curve(d3.curveMonotoneX)
      g.append('path').datum(upper).attr('d', area).attr('fill', tint).attr('opacity', band.opacity)
    }

    const median = pByName(50)
    if (median) {
      const line = d3
        .line<number>()
        .x((_, i) => x(i))
        .y((d) => y(d))
        .curve(d3.curveMonotoneX)
      g.append('path')
        .datum(median)
        .attr('d', line)
        .attr('fill', 'none')
        .attr('stroke', tint)
        .attr('stroke-width', 2)
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
      g.append('text')
        .attr('x', innerW - 4)
        .attr('y', y(baseline) - 4)
        .attr('text-anchor', 'end')
        .style('fill', color.textMuted)
        .style('font-size', 9)
        .style('font-family', 'var(--font-mono)')
        .style('letter-spacing', '0.08em')
        .style('text-transform', 'uppercase')
        .text('start')
    }
  }, [result, tint, height, baseline])

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

<script lang="ts">
  import * as d3 from 'd3'
  import type { Belief } from '$lib/db'
  import { Card } from '$lib/components/ui/index.js'

  let { belief }: { belief: Belief } = $props()

  let containerWidth = $state(0)
  let svgEl = $state<SVGSVGElement | null>(null)
  let gradientId = $derived(`strength-gradient-${belief.id.slice(0, 8)}`)

  const MARGIN = { top: 20, right: 20, bottom: 32, left: 45 }

  $effect(() => {
    if (!svgEl || !containerWidth || !belief.history.length) return

    const width = containerWidth - MARGIN.left - MARGIN.right
    const height = 200 - MARGIN.top - MARGIN.bottom

    const svg = d3.select(svgEl)
    svg.selectAll('*').remove()

    const g = svg
      .append('g')
      .attr('transform', `translate(${MARGIN.left},${MARGIN.top})`)

    const data = [...belief.history]
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

    const extent = d3.extent(data, d => new Date(d.timestamp)) as [Date, Date]
    const xDomain: [Date, Date] =
      extent[0].getTime() === extent[1].getTime()
        ? [d3.timeDay.offset(extent[0], -1), d3.timeDay.offset(extent[0], 1)]
        : extent

    const xScale = d3.scaleTime().domain(xDomain).range([0, width])

    const yScale = d3.scaleLinear().domain([0, 1]).range([height, 0])

    const lineGen = d3
      .line<(typeof data)[0]>()
      .x(d => xScale(new Date(d.timestamp)))
      .y(d => yScale(d.strength))
      .curve(d3.curveMonotoneX)

    g.append('path')
      .datum(data)
      .attr('d', lineGen)
      .attr('fill', 'none')
      .attr('stroke', '#7c3aed')
      .attr('stroke-width', 2.5)
      .attr('stroke-linejoin', 'round')
      .attr('stroke-linecap', 'round')

    g.selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', d => xScale(new Date(d.timestamp)))
      .attr('cy', d => yScale(d.strength))
      .attr('r', 4)
      .attr('fill', '#a78bfa')
      .attr('stroke', '#7c3aed')
      .attr('stroke-width', 1.5)

    const fmtDate = d3.timeFormat('%b %d')
    const fmtPct = (n: number) => `${Math.round(n * 100)}%`

    const xAxis = d3
      .axisBottom(xScale)
      .ticks(Math.min(data.length, 6))
      .tickFormat(d => fmtDate(d as Date))

    const yAxis = d3
      .axisLeft(yScale)
      .ticks(5)
      .tickFormat(d => fmtPct(Number(d)))

    const xAxisG = g
      .append('g')
      .attr('transform', `translate(0,${height})`)
      .call(xAxis)

    xAxisG.selectAll('text').attr('fill', '#9e9e9e').attr('font-size', '11px')
    xAxisG.selectAll('.domain, .tick line').attr('stroke', '#424242')

    const yAxisG = g.append('g').call(yAxis)

    yAxisG.selectAll('text').attr('fill', '#9e9e9e').attr('font-size', '11px')
    yAxisG.selectAll('.domain, .tick line').attr('stroke', '#424242')

    yAxisG.selectAll('.tick line').attr('stroke-dasharray', '3 3').attr('opacity', 0.4)

    if (data.length >= 2) {
      const areaGen = d3
        .area<(typeof data)[0]>()
        .x(d => xScale(new Date(d.timestamp)))
        .y0(height)
        .y1(d => yScale(d.strength))
        .curve(d3.curveMonotoneX)

      g.append('path')
        .datum(data)
        .attr('d', areaGen)
        .attr('fill', `url(#${gradientId})`)
        .attr('opacity', 0.2)
    }

    const defs = svg.select('defs')
    if (!defs.empty()) defs.remove()

    svg
      .append('defs')
      .append('linearGradient')
      .attr('id', gradientId)
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%')
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#7c3aed')
      .attr('stop-opacity', 1)

    svg.select('defs linearGradient').append('stop').attr('offset', '100%').attr('stop-color', '#7c3aed').attr('stop-opacity', 0)
  })
</script>

<Card class="p-2 overflow-hidden" bind:clientWidth={containerWidth}>
  {#if belief.history.length === 0}
    <div class="flex items-center justify-center h-[100px] text-muted-foreground text-sm">
      <p>Brak danych historycznych dla tego przekonania</p>
    </div>
  {:else}
    <svg
      bind:this={svgEl}
      width={containerWidth}
      height="200"
      class="timeline-svg"
    ></svg>
  {/if}
</Card>

<style>
  .timeline-svg {
    display: block;
  }
</style>

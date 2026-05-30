<script lang="ts">
  import * as d3 from 'd3'
  import type { Belief, Observation, Decision } from '$lib/db'

  let { beliefs, observations, decisions }: {
    beliefs: Belief[]
    observations: Observation[]
    decisions: Decision[]
  } = $props()

  let barChartEl: HTMLDivElement = $state()
  let pieChartEl: HTMLDivElement = $state()
  let histChartEl: HTMLDivElement = $state()

  let categoryData = $derived.by(() => {
    const map = new Map<string, number>()
    beliefs.forEach(b => map.set(b.category, (map.get(b.category) || 0) + 1))
    return [...map.entries()]
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
  })

  let strengthData = $derived.by(() => {
    const bins = Array.from({ length: 10 }, (_, i) => ({
      label: `${i * 10}-${(i + 1) * 10}%`,
      min: i / 10,
      max: (i + 1) / 10,
      value: 0,
    }))
    beliefs.forEach(b => {
      const idx = Math.min(Math.floor(b.strength * 10), 9)
      bins[idx].value++
    })
    return bins
  })

  let sourceData = $derived.by(() => {
    const map = new Map<string, number>()
    observations.forEach(o => map.set(o.sourceType, (map.get(o.sourceType) || 0) + 1))
    return [...map.entries()]
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
  })

  let outcomeData = $derived.by(() => {
    const map = new Map<string, number>()
    decisions.forEach(d => map.set(d.outcome, (map.get(d.outcome) || 0) + 1))
    return [...map.entries()]
      .map(([label, value]) => ({ label, value }))
  })

  let sourceLabel = $derived.by(() => {
    const labels: Record<string, string> = {
      person: 'Osoby',
      social_media: 'Social Media',
      news: 'Wiadomości',
      book: 'Książki',
      conversation: 'Rozmowy',
      other: 'Inne',
    }
    return (key: string) => labels[key] || key
  })

  let outcomeLabel = $derived.by(() => {
    const labels: Record<string, string> = {
      positive: 'Pozytywny',
      negative: 'Negatywny',
      neutral: 'Neutralny',
      pending: 'Oczekujący',
    }
    return (key: string) => labels[key] || key
  })

  const COLORS = ['var(--sl-color-accent)', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
  const PIE_COLORS = ['#10b981', '#ef4444', '#94a3b8', '#f59e0b']

  function drawBarChart(container: HTMLDivElement, data: { label: string; value: number }[], color: string, format?: (v: number) => string) {
    if (!data.length) return
    const width = container.clientWidth
    const height = 220
    const margin = { top: 10, right: 20, bottom: 50, left: 40 }
    const innerW = width - margin.left - margin.right
    const innerH = height - margin.top - margin.bottom

    d3.select(container).selectAll('svg').remove()
    const svg = d3.select(container).append('svg').attr('width', width).attr('height', height)
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

    const x = d3.scaleBand().domain(data.map(d => d.label)).range([0, innerW]).padding(0.25)
    const y = d3.scaleLinear().domain([0, d3.max(data, d => d.value) || 1]).range([innerH, 0])

    g.append('g')
      .attr('transform', `translate(0,${innerH})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('fill', 'var(--sl-color-gray-3)')
      .attr('font-size', '9px')
      .attr('transform', 'rotate(-25)')
      .attr('text-anchor', 'end')

    g.selectAll('.domain, .tick line').attr('stroke', 'var(--sl-color-gray-5)')
    g.selectAll('.tick line').remove()

    g.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', d => x(d.label) || 0)
      .attr('y', d => y(d.value))
      .attr('width', x.bandwidth())
      .attr('height', d => innerH - y(d.value))
      .attr('fill', color)
      .attr('rx', 3)

    g.selectAll('.label')
      .data(data)
      .enter()
      .append('text')
      .attr('x', d => (x(d.label) || 0) + x.bandwidth() / 2)
      .attr('y', d => y(d.value) - 5)
      .attr('text-anchor', 'middle')
      .attr('fill', 'var(--sl-color-gray-3)')
      .attr('font-size', '9px')
      .text(d => format ? format(d.value) : d.value)
  }

  function drawPieChart(container: HTMLDivElement, data: { label: string; value: number }[], colors: string[], labelFn: (k: string) => string) {
    const valid = data.filter(d => d.value > 0)
    if (!valid.length) return
    const width = container.clientWidth
    const height = 220
    const radius = Math.min(width, height) / 2 - 50

    d3.select(container).selectAll('svg').remove()
    const svg = d3.select(container).append('svg').attr('width', width).attr('height', height)
    const g = svg.append('g').attr('transform', `translate(${width / 2},${height / 2})`)

    const pie = d3.pie<{ label: string; value: number }>().value(d => d.value)
    const arc = d3.arc<d3.PieArcDatum<{ label: string; value: number }>>().innerRadius(0).outerRadius(radius)
    const labelArc = d3.arc<d3.PieArcDatum<{ label: string; value: number }>>().innerRadius(radius * 0.6).outerRadius(radius * 0.6)

    g.selectAll('path')
      .data(pie(valid))
      .enter()
      .append('path')
      .attr('d', arc)
      .attr('fill', (_, i) => colors[i % colors.length])
      .attr('stroke', 'var(--sl-color-bg-card)')
      .attr('stroke-width', 2)

    g.selectAll('text')
      .data(pie(valid))
      .enter()
      .append('text')
      .attr('transform', d => `translate(${labelArc.centroid(d)})`)
      .attr('text-anchor', 'middle')
      .attr('fill', '#fff')
      .attr('font-size', '10px')
      .attr('font-weight', '600')
      .text(d => d.data.value > 0 ? `${labelFn(d.data.label)} ${d.data.value}` : '')
  }

  $effect(() => {
    if (barChartEl) drawBarChart(barChartEl, categoryData, 'var(--sl-color-accent)')
  })

  $effect(() => {
    if (histChartEl) drawBarChart(histChartEl, strengthData, '#06b6d4')
  })

  $effect(() => {
    if (pieChartEl) drawPieChart(pieChartEl, outcomeData, PIE_COLORS, outcomeLabel)
  })
</script>

<div class="insights-grid">
  <div class="card">
    <h3 class="section-title">Przekonania według kategorii</h3>
    <div bind:this={barChartEl} class="chart-box"></div>
  </div>

  <div class="card">
    <h3 class="section-title">Rozkład siły przekonań</h3>
    <div bind:this={histChartEl} class="chart-box"></div>
  </div>

  <div class="card">
    <h3 class="section-title">Źródła obserwacji</h3>
    <div class="source-list">
      {#if sourceData.length === 0}
        <p class="empty">Brak danych</p>
      {:else}
        {#each sourceData as item}
          <div class="source-row">
            <span class="source-label">{sourceLabel(item.label)}</span>
            <div class="source-bar-track">
              <div
                class="source-bar-fill"
                style="width: {item.value / Math.max(...sourceData.map(d => d.value)) * 100}%"
              ></div>
            </div>
            <span class="source-value">{item.value}</span>
          </div>
        {/each}
      {/if}
    </div>
  </div>

  <div class="card">
    <h3 class="section-title">Wyniki decyzji</h3>
    <div bind:this={pieChartEl} class="chart-box"></div>
  </div>
</div>

<style>
  .insights-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .card {
    background: var(--sl-color-bg-card);
    border: 1px solid var(--sl-color-border);
    border-radius: 8px;
    padding: 1rem;
  }

  .section-title {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--sl-color-gray-2);
    margin-bottom: 0.75rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid var(--sl-color-border);
  }

  .chart-box {
    width: 100%;
    min-height: 220px;
  }

  .empty {
    color: var(--sl-color-gray-4);
    font-size: 0.8125rem;
    font-style: italic;
    text-align: center;
    padding: 2rem;
  }

  .source-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .source-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .source-label {
    font-size: 0.8125rem;
    color: var(--sl-color-text);
    min-width: 7rem;
    flex-shrink: 0;
  }

  .source-bar-track {
    flex: 1;
    height: 8px;
    background: var(--sl-color-gray-5);
    border-radius: 4px;
    overflow: hidden;
  }

  .source-bar-fill {
    height: 100%;
    background: linear-gradient(90deg, #10b981, #34d399);
    border-radius: 4px;
    transition: width 0.3s;
  }

  .source-value {
    font-size: 0.75rem;
    color: var(--sl-color-gray-3);
    min-width: 1.5rem;
    text-align: right;
  }
</style>

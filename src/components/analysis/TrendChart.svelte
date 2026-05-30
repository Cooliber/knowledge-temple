<script lang="ts">
  import * as d3 from 'd3'
  import type { Belief } from '$lib/db'

  let { beliefs }: { beliefs: Belief[] } = $props()

  let selectedId: string = $state('')
  let chartEl: HTMLDivElement = $state()

  let selectedBelief = $derived(beliefs.find(b => b.id === selectedId) || null)

  let sortedHistory = $derived(
    selectedBelief
      ? [...selectedBelief.history].sort(
          (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        )
      : []
  )

  $effect(() => {
    if (!chartEl || sortedHistory.length < 2) return

    const width = chartEl.clientWidth
    const height = 300
    const margin = { top: 20, right: 20, bottom: 40, left: 50 }
    const innerW = width - margin.left - margin.right
    const innerH = height - margin.top - margin.bottom

    d3.select(chartEl).selectAll('svg').remove()

    const svg = d3.select(chartEl)
      .append('svg')
      .attr('width', width)
      .attr('height', height)

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

    const x = d3.scaleTime()
      .domain(d3.extent(sortedHistory, d => new Date(d.timestamp)) as [Date, Date])
      .range([0, innerW])

    const y = d3.scaleLinear()
      .domain([0, 1])
      .range([innerH, 0])

    g.append('g')
      .attr('transform', `translate(0,${innerH})`)
      .call(d3.axisBottom(x).ticks(5).tickFormat(d => d3.timeFormat('%d %b')(d as Date)))
      .selectAll('text')
      .attr('fill', 'var(--sl-color-gray-3)')
      .attr('font-size', '10px')

    g.selectAll('.domain, .tick line')
      .attr('stroke', 'var(--sl-color-gray-5)')

    g.append('g')
      .call(d3.axisLeft(y).ticks(5))
      .selectAll('text')
      .attr('fill', 'var(--sl-color-gray-3)')
      .attr('font-size', '10px')

    const line = d3.line<typeof sortedHistory[0]>()
      .x(d => x(new Date(d.timestamp)))
      .y(d => y(d.strength))
      .curve(d3.curveMonotoneX)

    g.append('path')
      .datum(sortedHistory)
      .attr('fill', 'none')
      .attr('stroke', 'var(--sl-color-accent)')
      .attr('stroke-width', 2)
      .attr('d', line)

    g.selectAll('.dot')
      .data(sortedHistory)
      .enter()
      .append('circle')
      .attr('cx', d => x(new Date(d.timestamp)))
      .attr('cy', d => y(d.strength))
      .attr('r', 4)
      .attr('fill', 'var(--sl-color-accent)')
      .attr('stroke', 'var(--sl-color-bg-card)')
      .attr('stroke-width', 2)
  })
</script>

<div class="trend-chart">
  <div class="controls">
    <select bind:value={selectedId}>
      <option value="">Wybierz przekonanie...</option>
      {#each beliefs as belief}
        <option value={belief.id}>{belief.text}</option>
      {/each}
    </select>
  </div>

  {#if selectedBelief && sortedHistory.length >= 2}
    <div class="chart-info">
      <span class="belief-name">{selectedBelief.text}</span>
      <span class="belief-range">
        {d3.format('.0%')(sortedHistory[0].strength)} → {d3.format('.0%')(sortedHistory[sortedHistory.length - 1].strength)}
      </span>
    </div>
    <div bind:this={chartEl} class="chart-container"></div>
  {:else if selectedId}
    <p class="empty-state">Za mało danych do wyświetlenia trendu (wymagane co najmniej 2 punkty)</p>
  {:else}
    <p class="empty-state">Wybierz przekonanie aby zobaczyć trend</p>
  {/if}
</div>

<style>
  .trend-chart {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .controls select {
    width: 100%;
    padding: 0.5rem 0.75rem;
    background: var(--sl-color-gray-7);
    border: 1px solid var(--sl-color-border);
    border-radius: 6px;
    color: var(--sl-color-text);
    font-size: 0.875rem;
  }

  .controls select:focus {
    outline: none;
    border-color: var(--sl-color-accent);
  }

  .chart-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .belief-name {
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--sl-color-accent-high);
  }

  .belief-range {
    font-size: 0.75rem;
    color: var(--sl-color-gray-3);
  }

  .chart-container {
    width: 100%;
    overflow: hidden;
  }

  .empty-state {
    color: var(--sl-color-gray-4);
    font-size: 0.875rem;
    text-align: center;
    padding: 3rem 1rem;
    font-style: italic;
  }
</style>

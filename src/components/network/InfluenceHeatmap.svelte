<script lang="ts">
  import type { NetworkNode, NetworkConnection } from '$lib/db/schema'

  let {
    nodes = [],
    connections = [],
  }: {
    nodes: NetworkNode[]
    connections: NetworkConnection[]
  } = $props()

  interface MatrixCell {
    value: number
    type: NetworkConnection['type']
    exists: boolean
    bidirectional: boolean
  }

  function buildMatrix() {
    return nodes.map(source => {
      return nodes.map(target => {
        if (source.id === target.id) return null
        const conn = connections.find(c => c.sourceId === source.id && c.targetId === target.id)
        if (!conn) return null
        return {
          value: conn.influenceStrength,
          type: conn.type,
          exists: true,
          bidirectional: conn.bidirectional,
        }
      })
    })
  }

  const matrix = $derived(buildMatrix())

  function cellBg(value: number): string {
    if (value > 0) {
      const alpha = Math.min(0.8, value * 0.8)
      return `rgba(74, 222, 128, ${alpha})`
    }
    const alpha = Math.min(0.8, Math.abs(value) * 0.8)
    return `rgba(248, 113, 113, ${alpha})`
  }

  function cellText(value: number): string {
    return Math.abs(value) < 0.3 ? 'var(--sl-color-gray-2)' : '#fff'
  }

  function min(a: number, b: number): number { return a < b ? a : b }
  function max(a: number, b: number): number { return a > b ? a : b }
</script>

<div class="heatmap-container">
  <h3 class="heatmap-title">Matryca wpływów</h3>

  {#if nodes.length === 0}
    <p class="no-data">Brak węzłów do wyświetlenia</p>
  {:else}
    <div class="table-wrapper">
      <table class="heatmap-table">
        <thead>
          <tr>
            <th class="corner">Źródło \ Cel</th>
            {#each nodes as target}
              <th class="col-header" title={target.name}>
                <span class="col-label">{target.name}</span>
              </th>
            {/each}
          </tr>
        </thead>
        <tbody>
          {#each nodes as source, rowIdx}
            <tr>
              <th class="row-header" title={source.name}>
                <span class="row-label">{source.name}</span>
              </th>
              {#each nodes as target, colIdx}
                {@const cell = matrix[rowIdx][colIdx]}
                <td class="cell">
                  {#if cell}
                    <div
                      class="cell-content"
                      style="background: {cellBg(cell.value)}; color: {cellText(cell.value)}"
                      title="{source.name} → {target.name}: {(cell.value * 100).toFixed(0)}% ({cell.type}){cell.bidirectional ? ' dwukierunkowe' : ''}"
                    >
                      <span class="cell-value">{(cell.value * 100).toFixed(0)}%</span>
                    </div>
                  {:else}
                    <div class="cell-empty">·</div>
                  {/if}
                </td>
              {/each}
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <div class="heatmap-legend">
      <span class="legend-label">Negatywny</span>
      <div class="legend-gradient">
        <span class="legend-stop" style="background: rgba(248, 113, 113, 0.8)"></span>
        <span class="legend-stop" style="background: rgba(248, 113, 113, 0.3)"></span>
        <span class="legend-stop" style="background: transparent"></span>
        <span class="legend-stop" style="background: rgba(74, 222, 128, 0.3)"></span>
        <span class="legend-stop" style="background: rgba(74, 222, 128, 0.8)"></span>
      </div>
      <span class="legend-label">Pozytywny</span>
    </div>
  {/if}
</div>

<style>
  .heatmap-container {
    padding: 1rem;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .heatmap-title {
    margin: 0 0 1rem;
    font-size: 0.9375rem;
    font-weight: 600;
    color: var(--sl-color-white);
  }

  .no-data {
    color: var(--sl-color-gray-5);
    font-size: 0.875rem;
    font-style: italic;
  }

  .table-wrapper {
    overflow: auto;
    flex: 1;
  }

  .heatmap-table {
    border-collapse: collapse;
    font-size: 0.75rem;
    width: 100%;
  }

  .heatmap-table th,
  .heatmap-table td {
    padding: 0.125rem;
    text-align: center;
    border: 1px solid var(--sl-color-border);
  }

  .corner {
    padding: 0.5rem 0.375rem;
    color: var(--sl-color-gray-5);
    font-weight: 500;
    font-size: 0.6875rem;
    white-space: nowrap;
    background: var(--sl-color-bg);
    position: sticky;
    top: 0;
    left: 0;
    z-index: 2;
  }

  .col-header {
    padding: 0.375rem 0.25rem;
    font-weight: 500;
    color: var(--sl-color-gray-3);
    font-size: 0.6875rem;
    background: var(--sl-color-bg);
    position: sticky;
    top: 0;
    z-index: 1;
    min-width: 60px;
  }

  .col-label {
    display: block;
    max-width: 80px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .row-header {
    padding: 0.25rem 0.375rem;
    font-weight: 500;
    color: var(--sl-color-gray-3);
    font-size: 0.6875rem;
    background: var(--sl-color-bg);
    position: sticky;
    left: 0;
    z-index: 1;
    text-align: right;
    max-width: 80px;
  }

  .row-label {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .cell {
    padding: 0;
  }

  .cell-content {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 48px;
    min-height: 32px;
    border-radius: 4px;
    transition: all 0.15s;
  }

  .cell-content:hover {
    transform: scale(1.08);
    box-shadow: 0 0 8px rgba(255, 255, 255, 0.15);
  }

  .cell-value {
    font-weight: 600;
    font-size: 0.6875rem;
  }

  .cell-empty {
    color: var(--sl-color-gray-6);
    font-size: 0.625rem;
    min-width: 48px;
    min-height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .heatmap-legend {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.75rem;
    padding-top: 0.75rem;
    border-top: 1px solid var(--sl-color-border);
  }

  .legend-label {
    font-size: 0.6875rem;
    color: var(--sl-color-gray-4);
    white-space: nowrap;
  }

  .legend-gradient {
    display: flex;
    gap: 0;
    border-radius: 4px;
    overflow: hidden;
  }

  .legend-stop {
    width: 32px;
    height: 10px;
  }
</style>

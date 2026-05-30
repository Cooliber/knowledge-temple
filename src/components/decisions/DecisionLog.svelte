<script lang="ts">
  import DecisionOutcome from './DecisionOutcome.svelte'
  import type { Decision } from '$lib/db'

  let {
    decisions = [],
    selectedId = null,
    onselect,
  }: {
    decisions: Decision[]
    selectedId: string | null
    onselect?: (id: string) => void
  } = $props()

  let filterOutcome: string | null = $state(null)

  const filtered = $derived(
    filterOutcome
      ? decisions.filter((d) => d.outcome === filterOutcome)
      : decisions
  )

  const outcomes = $derived([
    { value: null, label: 'Wszystkie', count: decisions.length },
    ...(['pending', 'positive', 'negative', 'neutral'] as const).map((o) => ({
      value: o,
      label: { positive: 'Pozytywne', negative: 'Negatywne', neutral: 'Neutralne', pending: 'Oczekujące' }[o],
      count: decisions.filter((d) => d.outcome === o).length,
    })),
  ])

  function truncate(text: string, max = 60) {
    return text.length > max ? text.slice(0, max) + '…' : text
  }

  function formatDate(ts: string) {
    return new Date(ts).toLocaleDateString('pl-PL', {
      day: 'numeric',
      month: 'short',
    })
  }
</script>

<div class="log-container">
  <div class="filters">
    {#each outcomes as f}
      <button
        class="filter-btn"
        class:active={filterOutcome === f.value}
        onclick={() => (filterOutcome = f.value)}
      >
        {f.label}
        <span class="count">{f.count}</span>
      </button>
    {/each}
  </div>

  <div class="list">
    {#if filtered.length === 0}
      <div class="empty">Brak decyzji</div>
    {:else}
      {#each filtered as decision (decision.id)}
        <button
          class="item"
          class:selected={decision.id === selectedId}
          onclick={() => onselect?.(decision.id)}
        >
          <div class="item-header">
            <span class="item-desc">{truncate(decision.description)}</span>
            <DecisionOutcome outcome={decision.outcome} />
          </div>
          <div class="item-meta">
            <span class="item-date">{formatDate(decision.timestamp)}</span>
            <div class="threshold-bar">
              <div
                class="threshold-fill"
                style="width: {decision.threshold * 100}%"
              ></div>
            </div>
          </div>
        </button>
      {/each}
    {/if}
  </div>
</div>

<style>
  .log-container {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .filters {
    display: flex;
    gap: 0.375rem;
    flex-wrap: wrap;
  }

  .filter-btn {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.3rem 0.6rem;
    border-radius: 6px;
    border: 1px solid var(--sl-color-border);
    background: transparent;
    color: var(--sl-color-gray-3);
    font-size: 0.75rem;
    cursor: pointer;
    transition: all 0.15s;
  }

  .filter-btn:hover {
    background: var(--sl-color-gray-6);
    color: var(--sl-color-white);
  }

  .filter-btn.active {
    background: color-mix(in srgb, var(--sl-color-accent) 20%, transparent);
    border-color: var(--sl-color-accent);
    color: var(--sl-color-accent-high);
  }

  .count {
    font-size: 0.6875rem;
    opacity: 0.6;
  }

  .list {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
  }

  .item {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
    padding: 0.625rem 0.75rem;
    border-radius: 6px;
    border: 1px solid transparent;
    background: transparent;
    color: var(--sl-color-text);
    cursor: pointer;
    text-align: left;
    transition: all 0.15s;
    width: 100%;
  }

  .item:hover {
    background: var(--sl-color-gray-6);
    border-color: var(--sl-color-border);
  }

  .item.selected {
    background: color-mix(in srgb, var(--sl-color-accent) 15%, transparent);
    border-color: var(--sl-color-accent);
  }

  .item-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }

  .item-desc {
    font-size: 0.8125rem;
    font-weight: 500;
    line-height: 1.3;
  }

  .item-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }

  .item-date {
    font-size: 0.6875rem;
    color: var(--sl-color-gray-3);
  }

  .threshold-bar {
    width: 60px;
    height: 4px;
    background: var(--sl-color-gray-5);
    border-radius: 2px;
    overflow: hidden;
  }

  .threshold-fill {
    height: 100%;
    background: var(--sl-color-accent);
    border-radius: 2px;
    transition: width 0.2s;
  }

  .empty {
    padding: 2rem 0;
    text-align: center;
    color: var(--sl-color-gray-4);
    font-size: 0.875rem;
  }
</style>

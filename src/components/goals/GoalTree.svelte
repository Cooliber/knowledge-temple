<script lang="ts">
  import type { Goal } from '$lib/db'

  let {
    goals = [],
    selectedId = null,
    onselect,
    parentId = null as string | null,
    depth = 0,
  }: {
    goals: Goal[]
    selectedId: string | null
    onselect?: (id: string) => void
    parentId?: string | null
    depth?: number
  } = $props()

  let expanded = $state<Set<string>>(new Set())

  const visibleGoals = $derived(
    goals.filter((g) => g.parentId === parentId)
  )

  function hasChildren(id: string): boolean {
    return goals.some((g) => g.parentId === id)
  }

  function toggleExpand(id: string) {
    const next = new Set(expanded)
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
    expanded = next
  }

  function pc(p: number) {
    if (p < 33) return '#f87171'
    if (p < 66) return '#fbbf24'
    return '#4ade80'
  }

  function pl(p: number) {
    if (p >= 8) return 'Wysoki'
    if (p >= 5) return 'Średni'
    return 'Niski'
  }

  function pc2(p: number) {
    if (p >= 8) return '#f87171'
    if (p >= 5) return '#fbbf24'
    return '#9e9e9e'
  }

  function si(status: Goal['status']) {
    if (status === 'completed') return '✓'
    if (status === 'abandoned') return '✗'
    return '○'
  }
</script>

<div class="tree">
  {#each visibleGoals as goal (goal.id)}
    <button
      class="node-row"
      class:selected={goal.id === selectedId}
      class:has-children={hasChildren(goal.id)}
      style="padding-left: {0.75 + depth * 1.25}rem"
      onclick={() => onselect?.(goal.id)}
    >
      <span
        class="expand-icon"
        class:visible={hasChildren(goal.id)}
        onclick={(e) => {
          e.stopPropagation()
          toggleExpand(goal.id)
        }}
      >
        {hasChildren(goal.id) ? (expanded.has(goal.id) ? '▾' : '▸') : '  '}
      </span>
      <span class="status-dot" style="color: {pc(goal.progress)}">
        {si(goal.status)}
      </span>
      <span class="node-title">{goal.title}</span>
      <span class="node-meta">
        <span class="priority-badge" style="color: {pc2(goal.priority)}">
          {pl(goal.priority)}
        </span>
        <span class="progress-text">{goal.progress}%</span>
      </span>
    </button>

    {#if expanded.has(goal.id) && hasChildren(goal.id)}
      <svelte:self
        {goals}
        {selectedId}
        {onselect}
        parentId={goal.id}
        depth={depth + 1}
      />
    {/if}
  {:else}
    {#if depth === 0}
      <div class="empty">Brak celów</div>
    {/if}
  {/each}
</div>

<style>
  .tree {
    display: flex;
    flex-direction: column;
  }

  .node-row {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.5rem 0.75rem;
    border: none;
    background: transparent;
    color: var(--sl-color-text);
    cursor: pointer;
    text-align: left;
    border-radius: 4px;
    transition: all 0.15s;
    width: 100%;
  }

  .node-row:hover {
    background: var(--sl-color-gray-6);
  }

  .node-row.selected {
    background: color-mix(in srgb, var(--sl-color-accent) 15%, transparent);
  }

  .expand-icon {
    width: 1rem;
    font-size: 0.6875rem;
    color: transparent;
    flex-shrink: 0;
    cursor: default;
    user-select: none;
  }

  .expand-icon.visible {
    color: var(--sl-color-gray-3);
    cursor: pointer;
  }

  .status-dot {
    font-size: 0.75rem;
    flex-shrink: 0;
    width: 1rem;
    text-align: center;
  }

  .node-title {
    font-size: 0.8125rem;
    font-weight: 500;
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .node-meta {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-shrink: 0;
  }

  .priority-badge {
    font-size: 0.6875rem;
    font-weight: 600;
  }

  .progress-text {
    font-size: 0.6875rem;
    color: var(--sl-color-gray-3);
    min-width: 3ch;
    text-align: right;
  }

  .empty {
    padding: 2rem 0;
    text-align: center;
    color: var(--sl-color-gray-4);
    font-size: 0.875rem;
  }
</style>

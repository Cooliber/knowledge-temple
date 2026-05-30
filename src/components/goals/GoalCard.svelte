<script lang="ts">
  import BeliefAlignment from './BeliefAlignment.svelte'
  import type { Goal, Belief } from '$lib/db'

  let {
    goal,
    beliefs = [],
    onedit,
    ondelete,
    onupdate,
  }: {
    goal: Goal
    beliefs: Belief[]
    onedit?: () => void
    ondelete?: () => void
    onupdate?: (id: string, data: Partial<Goal>) => void
  } = $props()

  const supportingBeliefs = $derived(
    beliefs.filter((b) => goal.supportingBeliefs.includes(b.id))
  )

  const blockingBeliefs = $derived(
    beliefs.filter((b) => goal.blockingBeliefs.includes(b.id))
  )

  function progressColor(p: number) {
    if (p < 33) return '#f87171'
    if (p < 66) return '#fbbf24'
    return '#4ade80'
  }

  function horizonLabel(h: Goal['horizon']) {
    const map = { short: 'Krótki', medium: 'Średni', long: 'Długi' }
    return map[h]
  }

  function statusLabel(s: Goal['status']) {
    const map = { active: 'Aktywny', completed: 'Ukończony', abandoned: 'Porzucony' }
    return map[s]
  }

  function priorityStars(p: number) {
    return '★'.repeat(Math.ceil(p / 2)) + '☆'.repeat(5 - Math.ceil(p / 2))
  }

  function formatDate(d?: string) {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('pl-PL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  function isOverdue(d?: string) {
    if (!d) return false
    return new Date(d) < new Date() && goal.status === 'active'
  }

  let editingProgress = $state(false)
  let progressValue = $state(goal.progress)

  function saveProgress() {
    onupdate?.(goal.id, { progress: Math.max(0, Math.min(100, progressValue)) })
    editingProgress = false
  }
</script>

<div class="card">
  <div class="card-header">
    <div class="header-info">
      <h3 class="card-title">{goal.title}</h3>
      <div class="header-badges">
        <span class="status-badge" class:active={goal.status === 'active'} class:completed={goal.status === 'completed'} class:abandoned={goal.status === 'abandoned'}>
          {statusLabel(goal.status)}
        </span>
        <span class="horizon-badge">
          {horizonLabel(goal.horizon)}
        </span>
        <span class="priority-stars" title="Priorytet {goal.priority}/10">
          {priorityStars(goal.priority)}
        </span>
      </div>
    </div>
    <div class="card-actions">
      <button class="btn btn-small btn-ghost" onclick={() => onedit?.()}>
        Edytuj
      </button>
      <button class="btn btn-small btn-danger" onclick={() => ondelete?.()}>
        Usuń
      </button>
    </div>
  </div>

  {#if goal.description}
    <p class="description">{goal.description}</p>
  {/if}

  <div class="progress-section">
    <div class="progress-header">
      <span class="section-label">Postęp</span>
      {#if editingProgress}
        <div class="progress-edit">
          <input
            type="range"
            min="0"
            max="100"
            bind:value={progressValue}
            class="progress-slider"
          />
          <span class="progress-value" style="color: {progressColor(progressValue)}">
            {progressValue}%
          </span>
          <button class="btn btn-tiny btn-primary" onclick={saveProgress}>OK</button>
        </div>
      {:else}
        <button class="btn btn-tiny btn-ghost" onclick={() => {
          progressValue = goal.progress
          editingProgress = true
        }}>
          Zmień
        </button>
      {/if}
    </div>
    <div class="progress-bar">
      <div
        class="progress-fill"
        style="width: {goal.progress}%; background: {progressColor(goal.progress)}"
      ></div>
    </div>
    <div class="progress-labels">
      <span>0%</span>
      <span class="progress-center" style="color: {progressColor(goal.progress)}">
        {goal.progress}%
      </span>
      <span>100%</span>
    </div>
  </div>

  <div class="meta-grid">
    <div class="meta-item">
      <span class="meta-label">Priorytet</span>
      <span class="meta-value">{goal.priority}/10</span>
    </div>
    <div class="meta-item">
      <span class="meta-label">Horyzont</span>
      <span class="meta-value">{horizonLabel(goal.horizon)}</span>
    </div>
    {#if goal.deadline}
      <div class="meta-item" class:overdue={isOverdue(goal.deadline)}>
        <span class="meta-label">Deadline</span>
        <span class="meta-value">
          {formatDate(goal.deadline)}
          {#if isOverdue(goal.deadline)}
            <span class="overdue-icon">⚠️</span>
          {/if}
        </span>
      </div>
    {/if}
    {#if goal.parentId}
      <div class="meta-item">
        <span class="meta-label">Cel nadrzędny</span>
        <span class="meta-value">ID: {goal.parentId.slice(0, 8)}…</span>
      </div>
    {/if}
  </div>

  <div class="section">
    <h4 class="section-title">Zgodność przekonań</h4>
    <BeliefAlignment
      supporting={supportingBeliefs}
      blocking={blockingBeliefs}
    />
  </div>
</div>

<style>
  .card {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .card-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 0.5rem;
  }

  .header-info {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    flex: 1;
  }

  .card-title {
    font-size: 1.125rem;
    font-weight: 700;
    color: var(--sl-color-white);
    line-height: 1.3;
  }

  .header-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 0.375rem;
    align-items: center;
  }

  .status-badge {
    padding: 0.15rem 0.5rem;
    border-radius: 999px;
    font-size: 0.6875rem;
    font-weight: 600;
  }

  .status-badge.active {
    background: color-mix(in srgb, var(--sl-color-accent) 20%, transparent);
    color: var(--sl-color-accent-high);
  }

  .status-badge.completed {
    background: color-mix(in srgb, #4ade80 20%, transparent);
    color: #4ade80;
  }

  .status-badge.abandoned {
    background: color-mix(in srgb, #f87171 20%, transparent);
    color: #f87171;
  }

  .horizon-badge {
    padding: 0.15rem 0.5rem;
    border-radius: 999px;
    font-size: 0.6875rem;
    font-weight: 600;
    background: var(--sl-color-gray-5);
    color: var(--sl-color-gray-2);
  }

  .priority-stars {
    font-size: 0.75rem;
    color: #fbbf24;
    letter-spacing: -1px;
  }

  .card-actions {
    display: flex;
    gap: 0.375rem;
    flex-shrink: 0;
  }

  .description {
    font-size: 0.875rem;
    line-height: 1.5;
    color: var(--sl-color-gray-2);
  }

  .progress-section {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
  }

  .progress-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }

  .section-label {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--sl-color-gray-3);
  }

  .progress-edit {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .progress-slider {
    -webkit-appearance: none;
    appearance: none;
    width: 100px;
    height: 4px;
    background: var(--sl-color-gray-5);
    border-radius: 2px;
    outline: none;
  }

  .progress-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: var(--sl-color-accent);
    cursor: pointer;
  }

  .progress-value {
    font-size: 0.8125rem;
    font-weight: 700;
    min-width: 3ch;
  }

  .progress-bar {
    height: 8px;
    background: var(--sl-color-gray-5);
    border-radius: 4px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    border-radius: 4px;
    transition: width 0.3s;
  }

  .progress-labels {
    display: flex;
    justify-content: space-between;
    font-size: 0.625rem;
    color: var(--sl-color-gray-4);
  }

  .progress-center {
    font-weight: 600;
  }

  .meta-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 0.5rem;
  }

  .meta-item {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    padding: 0.5rem;
    background: var(--sl-color-gray-6);
    border: 1px solid var(--sl-color-border);
    border-radius: 6px;
  }

  .meta-item.overdue {
    border-color: color-mix(in srgb, #f87171 40%, transparent);
    background: color-mix(in srgb, #f87171 6%, var(--sl-color-gray-6));
  }

  .meta-label {
    font-size: 0.6875rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--sl-color-gray-4);
  }

  .meta-value {
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--sl-color-gray-1);
  }

  .overdue-icon {
    font-size: 0.75rem;
    margin-left: 0.25rem;
  }

  .section {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .section-title {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--sl-color-gray-3);
  }

  .btn {
    padding: 0.375rem 0.75rem;
    border-radius: 6px;
    font-size: 0.75rem;
    font-weight: 600;
    cursor: pointer;
    border: 1px solid transparent;
    transition: all 0.15s;
  }

  .btn-tiny {
    padding: 0.2rem 0.5rem;
    font-size: 0.6875rem;
  }

  .btn-ghost {
    background: transparent;
    color: var(--sl-color-gray-3);
    border-color: var(--sl-color-gray-5);
  }

  .btn-ghost:hover {
    background: var(--sl-color-gray-5);
    color: var(--sl-color-white);
  }

  .btn-danger {
    background: transparent;
    color: #f87171;
    border-color: color-mix(in srgb, #f87171 40%, transparent);
  }

  .btn-danger:hover {
    background: color-mix(in srgb, #f87171 15%, transparent);
    color: #f87171;
  }

  .btn-primary {
    background: var(--sl-color-accent);
    color: white;
  }
</style>

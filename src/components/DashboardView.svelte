<script lang="ts">
  import StatsCard from './layout/StatsCard.svelte'
  import { beliefs, observations, network, decisions, goals } from '$lib/db'
  import type { Belief, Observation, Decision, Goal } from '$lib/db'

  let allBeliefs: Belief[] = $state([])
  let allObservations: Observation[] = $state([])
  let allDecisions: Decision[] = $state([])
  let allGoals: Goal[] = $state([])
  let allNodes = $state<Awaited<ReturnType<typeof network.getAllNodes>>>([])
  let allConns = $state<Awaited<ReturnType<typeof network.getAllConnections>>>([])

  $effect(() => {
    beliefs.getAllBeliefs().then(d => allBeliefs = d)
    observations.getAllObservations().then(d => allObservations = d)
    decisions.getAllDecisions().then(d => allDecisions = d)
    goals.getAllGoals().then(d => allGoals = d)
    network.getAllNodes().then(d => allNodes = d)
    network.getAllConnections().then(d => allConns = d)
  })

  let stats = $derived({
    beliefCount: allBeliefs.length,
    firstOrder: allBeliefs.filter(b => b.type === 'first_order').length,
    secondOrder: allBeliefs.filter(b => b.type === 'second_order').length,
    thirdOrder: allBeliefs.filter(b => b.type === 'third_order').length,
    obsThisWeek: allObservations.filter(o => {
      const d = new Date(o.timestamp)
      const now = new Date()
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      return d >= weekAgo
    }).length,
    obsTotal: allObservations.length,
    decisionCount: allDecisions.length,
    positiveDecisions: allDecisions.filter(d => d.outcome === 'positive').length,
    positivePct: allDecisions.length > 0
      ? Math.round(allDecisions.filter(d => d.outcome === 'positive').length / allDecisions.length * 100)
      : 0,
    activeGoals: allGoals.filter(g => g.status === 'active').length,
    completedGoals: allGoals.filter(g => g.status === 'completed').length,
    goalTotal: allGoals.length,
  })

  let recentObservations = $derived(allObservations.slice(0, 5))
  let recentDecisions = $derived(allDecisions.slice(0, 5))
  let strongestBeliefs = $derived([...allBeliefs].sort((a, b) => b.strength - a.strength).slice(0, 5))
  let goalsByProgress = $derived([...allGoals].sort((a, b) => b.progress - a.progress))

  function outcomeClass(outcome: string) {
    if (outcome === 'positive') return 'badge badge-positive'
    if (outcome === 'negative') return 'badge badge-negative'
    if (outcome === 'neutral') return 'badge badge-neutral'
    return 'badge badge-pending'
  }

  function outcomeLabel(outcome: string) {
    const labels: Record<string, string> = {
      positive: 'Pozytywny',
      negative: 'Negatywny',
      neutral: 'Neutralny',
      pending: 'Oczekujący',
    }
    return labels[outcome] || outcome
  }

  function typeLabel(type: string) {
    const labels: Record<string, string> = {
      first_order: 'I-rzędu',
      second_order: 'II-rzędu',
      third_order: 'III-rzędu',
    }
    return labels[type] || type
  }

  function formatDate(ts: string) {
    return new Date(ts).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' })
  }
</script>

<div class="dashboard">
  <div class="stats-grid">
    <StatsCard
      title="Przekonania"
      value={stats.beliefCount}
      subtitle="I: {stats.firstOrder} · II: {stats.secondOrder} · III: {stats.thirdOrder}"
      icon="🧠"
      color="var(--sl-color-accent)"
    />
    <StatsCard
      title="Obserwacje"
      value={stats.obsTotal}
      subtitle="{stats.obsThisWeek} w tym tygodniu"
      icon="👁️"
      color="#06b6d4"
    />
    <StatsCard
      title="Decyzje"
      value={stats.decisionCount}
      subtitle="{stats.positivePct}% pozytywnych"
      icon="⚖️"
      color="#10b981"
    />
    <StatsCard
      title="Cele"
      value={stats.goalTotal}
      subtitle="Aktywne: {stats.activeGoals} · Ukończone: {stats.completedGoals}"
      icon="🎯"
      color="#f59e0b"
    />
  </div>

  <div class="row-2col">
    <div class="card">
      <h3 class="card-title">Ostatnie Obserwacje</h3>
      {#if recentObservations.length === 0}
        <p class="empty">Brak obserwacji</p>
      {:else}
        <ul class="item-list">
          {#each recentObservations as obs}
            <li class="item">
              <span class="item-source">{obs.source}</span>
              <span class="item-text">{obs.content}</span>
              <span class="item-date">{formatDate(obs.timestamp)}</span>
            </li>
          {/each}
        </ul>
      {/if}
    </div>
    <div class="card">
      <h3 class="card-title">Ostatnie Decyzje</h3>
      {#if recentDecisions.length === 0}
        <p class="empty">Brak decyzji</p>
      {:else}
        <ul class="item-list">
          {#each recentDecisions as dec}
            <li class="item">
              <span class="item-text">{dec.description}</span>
              <span class="item-date">{formatDate(dec.timestamp)}</span>
              <span class={outcomeClass(dec.outcome)}>{outcomeLabel(dec.outcome)}</span>
            </li>
          {/each}
        </ul>
      {/if}
    </div>
  </div>

  <div class="row-2col">
    <div class="card">
      <h3 class="card-title">Najsilniejsze Przekonania</h3>
      {#if strongestBeliefs.length === 0}
        <p class="empty">Brak przekonań</p>
      {:else}
        <div class="belief-bars">
          {#each strongestBeliefs as belief}
            <div class="belief-row">
              <div class="belief-label">
                <span class="belief-text">{belief.text}</span>
                <span class="belief-type">{typeLabel(belief.type)}</span>
              </div>
              <div class="bar-track">
                <div
                  class="bar-fill"
                  style="width: {belief.strength * 100}%"
                ></div>
              </div>
              <span class="bar-value">{Math.round(belief.strength * 100)}%</span>
            </div>
          {/each}
        </div>
      {/if}
    </div>
    <div class="card">
      <h3 class="card-title">Postęp Celów</h3>
      {#if goalsByProgress.length === 0}
        <p class="empty">Brak celów</p>
      {:else}
        <div class="goal-list">
          {#each goalsByProgress as goal}
            <div class="goal-row">
              <div class="goal-header">
                <span class="goal-title">{goal.title}</span>
                <span class="goal-status" class:completed={goal.status === 'completed'} class:abandoned={goal.status === 'abandoned'}>
                  {goal.status === 'completed' ? 'Ukończony' : goal.status === 'abandoned' ? 'Porzucony' : 'Aktywny'}
                </span>
              </div>
              <div class="bar-track">
                <div class="bar-fill progress-fill" style="width: {goal.progress}%"></div>
              </div>
              <span class="bar-value">{Math.round(goal.progress)}%</span>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .dashboard {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
  }

  .row-2col {
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

  .card-title {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--sl-color-gray-2);
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid var(--sl-color-border);
  }

  .empty {
    color: var(--sl-color-gray-4);
    font-size: 0.875rem;
    font-style: italic;
  }

  .item-list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
    border-radius: 4px;
    background: var(--sl-color-gray-7);
    font-size: 0.8125rem;
  }

  .item-source {
    color: var(--sl-color-accent-high);
    font-weight: 600;
    flex-shrink: 0;
  }

  .item-text {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--sl-color-text);
  }

  .item-date {
    color: var(--sl-color-gray-4);
    font-size: 0.75rem;
    flex-shrink: 0;
  }

  .badge {
    font-size: 0.6875rem;
    font-weight: 600;
    padding: 0.125rem 0.5rem;
    border-radius: 999px;
    flex-shrink: 0;
  }

  .badge-positive {
    background: rgba(16, 185, 129, 0.15);
    color: #34d399;
  }

  .badge-negative {
    background: rgba(239, 68, 68, 0.15);
    color: #f87171;
  }

  .badge-neutral {
    background: rgba(148, 163, 184, 0.15);
    color: #94a3b8;
  }

  .badge-pending {
    background: rgba(245, 158, 11, 0.15);
    color: #fbbf24;
  }

  .belief-bars,
  .goal-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .belief-row,
  .goal-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .belief-label {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
  }

  .belief-text {
    font-size: 0.8125rem;
    color: var(--sl-color-text);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .belief-type {
    font-size: 0.6875rem;
    color: var(--sl-color-gray-4);
  }

  .goal-header {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .goal-title {
    font-size: 0.8125rem;
    color: var(--sl-color-text);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .goal-status {
    font-size: 0.6875rem;
    color: var(--sl-color-accent-high);
    flex-shrink: 0;
  }

  .goal-status.completed {
    color: #34d399;
  }

  .goal-status.abandoned {
    color: var(--sl-color-gray-4);
  }

  .bar-track {
    flex: 1;
    height: 6px;
    background: var(--sl-color-gray-5);
    border-radius: 3px;
    overflow: hidden;
    min-width: 80px;
  }

  .bar-fill {
    height: 100%;
    background: var(--sl-color-accent);
    border-radius: 3px;
    transition: width 0.3s;
  }

  .progress-fill {
    background: linear-gradient(90deg, var(--sl-color-accent), var(--sl-color-accent-high));
  }

  .bar-value {
    font-size: 0.75rem;
    color: var(--sl-color-gray-3);
    min-width: 2.5rem;
    text-align: right;
    flex-shrink: 0;
  }
</style>

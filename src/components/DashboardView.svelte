<script lang="ts">
  import { beliefs, observations, decisions, goals } from '$lib/db'
  import StatsCard from './layout/StatsCard.svelte'
  import type { Belief, Observation, Decision, Goal } from '$lib/db'

  let allBeliefs: Belief[] = $state([])
  let allObservations: Observation[] = $state([])
  let allDecisions: Decision[] = $state([])
  let allGoals: Goal[] = $state([])
  let loaded = $state(false)

  $effect(() => {
    loadData()
  })

  async function loadData() {
    allBeliefs = await beliefs.getAllBeliefs()
    allObservations = await observations.getAllObservations()
    allDecisions = await decisions.getAllDecisions()
    allGoals = await goals.getAllGoals()
    loaded = true
  }

  const stats = $derived({
    beliefCount: allBeliefs.length,
    firstOrder: allBeliefs.filter(b => b.type === 'first_order').length,
    secondOrder: allBeliefs.filter(b => b.type === 'second_order').length,
    thirdOrder: allBeliefs.filter(b => b.type === 'third_order').length,
    obsCount: allObservations.length,
    obsThisWeek: allObservations.filter(o => {
      const d = new Date(o.timestamp)
      const now = new Date()
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      return d >= weekAgo
    }).length,
    decisionCount: allDecisions.length,
    positiveDecisions: allDecisions.filter(d => d.outcome === 'positive').length,
    activeGoals: allGoals.filter(g => g.status === 'active').length,
    completedGoals: allGoals.filter(g => g.status === 'completed').length,
  })

  const recentObservations = $derived(
    allObservations.slice(0, 5)
  )

  const recentDecisions = $derived(
    allDecisions.slice(0, 5)
  )

  const topBeliefs = $derived(
    [...allBeliefs].sort((a, b) => b.strength - a.strength).slice(0, 5)
  )

  const activeGoalsList = $derived(
    allGoals.filter(g => g.status === 'active').slice(0, 4)
  )

  function obsSourceIcon(type: string) {
    const icons: Record<string, string> = {
      person: '⊙',
      social_media: '◎',
      news: '◈',
      book: '▣',
      conversation: '◉',
      other: '◇',
    }
    return icons[type] || '◇'
  }

  function decisionOutcomeColor(outcome: string) {
    const colors: Record<string, string> = {
      positive: 'var(--mh-success)',
      negative: 'var(--mh-danger)',
      neutral: 'var(--mh-text-muted)',
      pending: 'var(--mh-warning)',
    }
    return colors[outcome] || colors.neutral
  }

  function decisionOutcomeLabel(outcome: string) {
    const labels: Record<string, string> = {
      positive: 'Pozytywny',
      negative: 'Negatywny',
      neutral: 'Neutralny',
      pending: 'Oczekuje',
    }
    return labels[outcome] || outcome
  }

  function shortDate(ts: string) {
    const d = new Date(ts)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    if (days === 0) return 'dziś'
    if (days === 1) return 'wczoraj'
    if (days < 7) return `${days} dni temu`
    return d.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' })
  }

  function progressColor(p: number) {
    if (p < 33) return 'var(--mh-danger)'
    if (p < 66) return 'var(--mh-warning)'
    return 'var(--mh-success)'
  }
</script>

{#if !loaded}
  <div class="loading-state">
    <div class="loading-grid">
      {#each Array(4) as _}
        <div class="mh-skeleton" style="height: 120px"></div>
      {/each}
    </div>
  </div>
{:else}
  <!-- Stats Grid -->
  <div class="stats-grid">
    <div class="mh-animate mh-animate-d1">
      <StatsCard
        title="Przekonania"
        value={stats.beliefCount}
        subtitle="{stats.firstOrder} first · {stats.secondOrder} second · {stats.thirdOrder} third"
        icon="◈"
        color="var(--mh-accent)"
      />
    </div>
    <div class="mh-animate mh-animate-d2">
      <StatsCard
        title="Obserwacje"
        value={stats.obsCount}
        subtitle="{stats.obsThisWeek} w tym tygodniu"
        icon="◎"
        color="var(--mh-info)"
      />
    </div>
    <div class="mh-animate mh-animate-d3">
      <StatsCard
        title="Decyzje"
        value={stats.decisionCount}
        subtitle="{stats.positiveDecisions} pozytywnych"
        icon="⊜"
        color="var(--mh-success)"
      />
    </div>
    <div class="mh-animate mh-animate-d4">
      <StatsCard
        title="Cele"
        value={stats.activeGoals}
        subtitle="{stats.completedGoals} ukończonych z {allGoals.length}"
        icon="⊚"
        color="var(--mh-warning)"
      />
    </div>
  </div>

  <!-- Middle Row -->
  <div class="content-grid">
    <div class="mh-card mh-animate mh-animate-d5">
      <div class="card-header">
        <span class="mh-section-title">Ostatnie Obserwacje</span>
        {#if stats.obsCount > 5}
          <a href="/app/observations" class="card-link">Zobacz wszystkie</a>
        {/if}
      </div>
      {#if recentObservations.length === 0}
        <div class="empty-state">
          <span class="empty-icon">◎</span>
          <p>Brak obserwacji</p>
          <a href="/app/observations" class="mh-btn mh-btn-primary">Dodaj pierwszą</a>
        </div>
      {:else}
        <div class="entry-list">
          {#each recentObservations as obs}
            <div class="entry-row">
              <span class="entry-icon">{obsSourceIcon(obs.sourceType)}</span>
              <div class="entry-body">
                <span class="entry-text">{obs.content}</span>
                <span class="entry-meta">{obs.source} · {shortDate(obs.timestamp)}</span>
              </div>
              <div class="entry-attention" style="width: {obs.attentionLevel * 100}%"></div>
            </div>
          {/each}
        </div>
      {/if}
    </div>

    <div class="mh-card mh-animate mh-animate-d6">
      <div class="card-header">
        <span class="mh-section-title">Ostatnie Decyzje</span>
        {#if stats.decisionCount > 5}
          <a href="/app/decisions" class="card-link">Zobacz wszystkie</a>
        {/if}
      </div>
      {#if recentDecisions.length === 0}
        <div class="empty-state">
          <span class="empty-icon">⊜</span>
          <p>Brak decyzji</p>
          <a href="/app/decisions" class="mh-btn mh-btn-primary">Dodaj pierwszą</a>
        </div>
      {:else}
        <div class="entry-list">
          {#each recentDecisions as dec}
            <div class="entry-row">
              <span
                class="outcome-dot"
                style="background: {decisionOutcomeColor(dec.outcome)}"
              ></span>
              <div class="entry-body">
                <span class="entry-text">{dec.description}</span>
                <span class="entry-meta">
                  <span
                    class="outcome-badge"
                    style="color: {decisionOutcomeColor(dec.outcome)}"
                  >{decisionOutcomeLabel(dec.outcome)}</span>
                  · {shortDate(dec.timestamp)}
                </span>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>

  <!-- Bottom Row -->
  <div class="content-grid">
    <div class="mh-card mh-animate mh-animate-d7">
      <div class="card-header">
        <span class="mh-section-title">Najsilniejsze Przekonania</span>
      </div>
      {#if topBeliefs.length === 0}
        <div class="empty-state">
          <span class="empty-icon">◈</span>
          <p>Brak przekonań</p>
          <a href="/app/beliefs" class="mh-btn mh-btn-primary">Dodaj pierwsze</a>
        </div>
      {:else}
        <div class="belief-bars">
          {#each topBeliefs as belief}
            <div class="belief-row">
              <div class="belief-info">
                <span class="belief-text">{belief.text}</span>
                <span class="belief-strength-label">{Math.round(belief.strength * 100)}%</span>
              </div>
              <div class="belief-track">
                <div
                  class="belief-fill"
                  style="width: {belief.strength * 100}%"
                ></div>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>

    <div class="mh-card mh-animate mh-animate-d8">
      <div class="card-header">
        <span class="mh-section-title">Postęp Celów</span>
        {#if stats.activeGoals > 4}
          <a href="/app/goals" class="card-link">Zobacz wszystkie</a>
        {/if}
      </div>
      {#if activeGoalsList.length === 0}
        <div class="empty-state">
          <span class="empty-icon">⊚</span>
          <p>Brak aktywnych celów</p>
          <a href="/app/goals" class="mh-btn mh-btn-primary">Dodaj pierwszy</a>
        </div>
      {:else}
        <div class="goal-list">
          {#each activeGoalsList as goal}
            <div class="goal-row">
              <div class="goal-info">
                <span class="goal-title">{goal.title}</span>
                <span class="goal-meta">{goal.horizon === 'short' ? 'Krótki' : goal.horizon === 'medium' ? 'Średni' : 'Długi'} termin</span>
              </div>
              <div class="goal-track">
                <div
                  class="goal-fill"
                  style="width: {goal.progress}%; background: {progressColor(goal.progress)}"
                ></div>
              </div>
              <span class="goal-pct">{goal.progress}%</span>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .loading-state {
    padding: 2rem 0;
  }
  .loading-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .content-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.75rem;
  }

  .card-link {
    font-size: 0.75rem;
    color: var(--mh-accent);
    text-decoration: none;
    font-weight: 500;
    transition: color var(--mh-transition-fast);
  }
  .card-link:hover {
    color: var(--mh-accent-hover);
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 2rem 0;
    text-align: center;
  }
  .empty-icon {
    font-size: 1.5rem;
    opacity: 0.2;
  }
  .empty-state p {
    font-size: 0.8125rem;
    color: var(--mh-text-muted);
  }

  .entry-list {
    display: flex;
    flex-direction: column;
  }
  .entry-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.625rem 0;
    border-bottom: 1px solid var(--mh-border);
    position: relative;
    overflow: hidden;
  }
  .entry-row:last-child {
    border-bottom: none;
  }
  .entry-icon {
    font-size: 0.875rem;
    opacity: 0.35;
    width: 1.25rem;
    text-align: center;
    flex-shrink: 0;
  }
  .entry-body {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }
  .entry-text {
    font-size: 0.8125rem;
    color: var(--mh-text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .entry-meta {
    font-size: 0.6875rem;
    color: var(--mh-text-muted);
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }
  .entry-attention {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 2px;
    background: var(--mh-accent);
    opacity: 0.3;
    transition: width var(--mh-transition);
  }

  .outcome-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .outcome-badge {
    font-size: 0.6875rem;
    font-weight: 500;
  }

  .belief-bars {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  .belief-row {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  .belief-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .belief-text {
    font-size: 0.8125rem;
    color: var(--mh-text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .belief-strength-label {
    font-size: 0.75rem;
    color: var(--mh-text-muted);
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    flex-shrink: 0;
    margin-left: 0.5rem;
  }
  .belief-track {
    height: 4px;
    background: rgba(255, 255, 255, 0.06);
    border-radius: 2px;
    overflow: hidden;
  }
  .belief-fill {
    height: 100%;
    background: var(--mh-accent);
    border-radius: 2px;
    transition: width var(--mh-transition);
  }

  .goal-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  .goal-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  .goal-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }
  .goal-title {
    font-size: 0.8125rem;
    color: var(--mh-text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .goal-meta {
    font-size: 0.6875rem;
    color: var(--mh-text-muted);
  }
  .goal-track {
    flex: 1;
    height: 4px;
    background: rgba(255, 255, 255, 0.06);
    border-radius: 2px;
    overflow: hidden;
    max-width: 120px;
  }
  .goal-fill {
    height: 100%;
    border-radius: 2px;
    transition: width var(--mh-transition);
  }
  .goal-pct {
    font-size: 0.75rem;
    color: var(--mh-text-muted);
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    min-width: 3ch;
    text-align: right;
  }

  @media (max-width: 1024px) {
    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
    }
    .content-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 768px) {
    .stats-grid {
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
    }
  }
</style>

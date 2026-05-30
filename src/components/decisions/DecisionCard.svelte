<script lang="ts">
  import DecisionOutcome from './DecisionOutcome.svelte'
  import { Button, Card, CardHeader, CardTitle, CardAction, CardContent, Input } from '$lib/components/ui'
  import type { Decision, Belief, Goal } from '$lib/db'

  let {
    decision,
    beliefs = [],
    goals = [],
    onedit,
    ondelete,
    onupdate,
  }: {
    decision: Decision
    beliefs: Belief[]
    goals: Goal[]
    onedit?: () => void
    ondelete?: () => void
    onupdate?: (id: string, data: Partial<Decision>) => void
  } = $props()

  let newOutcome = $state(decision.outcome)
  let newActualOutcome = $state(decision.actualOutcome ?? '')

  const linkedBeliefs = $derived(
    beliefs.filter((b) => decision.beliefs.includes(b.id))
  )

  const linkedGoals = $derived(
    goals.filter((g) => decision.goals.includes(g.id))
  )

  function formatDate(ts: string) {
    return new Date(ts).toLocaleDateString('pl-PL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  function thresholdColor(t: number) {
    if (t < 0.4) return '#f87171'
    if (t < 0.7) return '#fbbf24'
    return '#4ade80'
  }

  function handleUpdate() {
    onupdate?.(decision.id, {
      outcome: newOutcome,
      actualOutcome: newActualOutcome || undefined,
    })
  }

  function strengthColor(s: number) {
    if (s < 0.4) return '#f87171'
    if (s < 0.7) return '#fbbf24'
    return '#4ade80'
  }
</script>

<Card>
  <CardHeader>
    <CardTitle>{decision.description}</CardTitle>
    <CardAction>
      <Button variant="ghost" size="sm" onclick={() => onedit?.()}>
        Edytuj
      </Button>
      <Button variant="destructive" size="sm" onclick={() => ondelete?.()}>
        Usuń
      </Button>
    </CardAction>
  </CardHeader>

  <CardContent>
  <div class="meta-row">
    <DecisionOutcome outcome={decision.outcome} />
    <span class="date">{formatDate(decision.timestamp)}</span>
  </div>

  {#if decision.context}
    <div class="section">
      <h4 class="section-title">Kontekst</h4>
      <p class="text">{decision.context}</p>
    </div>
  {/if}

  <div class="section">
    <h4 class="section-title">Próg decyzyjny</h4>
    <div class="gauge-wrapper">
      <div class="gauge">
        <div
          class="gauge-fill"
          style="
            width: {decision.threshold * 100}%;
            background: {thresholdColor(decision.threshold)};
          "
        ></div>
        <div
          class="gauge-needle"
          style="left: {decision.threshold * 100}%"
        ></div>
      </div>
      <span class="gauge-value" style="color: {thresholdColor(decision.threshold)}">
        {Math.round(decision.threshold * 100)}%
      </span>
    </div>
  </div>

  <div class="section">
    <h4 class="section-title">
      Powiązane przekonania ({linkedBeliefs.length})
    </h4>
    <div class="links">
      {#each linkedBeliefs as belief (belief.id)}
        <span
          class="link-badge"
          style="--link-color: {strengthColor(belief.strength)}"
        >
          {belief.text}
        </span>
      {:else}
        <span class="empty">Brak powiązań</span>
      {/each}
    </div>
  </div>

  <div class="section">
    <h4 class="section-title">
      Powiązane cele ({linkedGoals.length})
    </h4>
    <div class="links">
      {#each linkedGoals as goal (goal.id)}
        <span class="link-badge goal-badge">
          {goal.title}
        </span>
      {:else}
        <span class="empty">Brak powiązań</span>
      {/each}
    </div>
  </div>

  {#if decision.expectedOutcome}
    <div class="section">
      <h4 class="section-title">Oczekiwany rezultat</h4>
      <p class="text">{decision.expectedOutcome}</p>
    </div>
  {/if}

  <div class="section outcome-section">
    <h4 class="section-title">Rzeczywisty rezultat</h4>
    <div class="outcome-controls">
      <select
        class="select"
        bind:value={newOutcome}
        onchange={handleUpdate}
      >
        <option value="pending">Oczekuje</option>
        <option value="positive">Pozytywny</option>
        <option value="negative">Negatywny</option>
        <option value="neutral">Neutralny</option>
      </select>
      <Input
        type="text"
        bind:value={newActualOutcome}
        placeholder="Opis rezultatu..."
        onchange={handleUpdate}
      />
    </div>
  </div>

  {#if decision.expectedOutcome && decision.actualOutcome}
    <div class="comparison">
      <div class="comparison-item expected">
        <span class="comparison-label">Oczekiwano</span>
        <span>{decision.expectedOutcome}</span>
      </div>
      <div class="comparison-item actual">
        <span class="comparison-label">Faktycznie</span>
        <span>{decision.actualOutcome}</span>
      </div>
    </div>
  {/if}
  </CardContent>
</Card>

<style>
  .meta-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .date {
    font-size: 0.75rem;
    color: var(--sl-color-gray-4);
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

  .text {
    font-size: 0.875rem;
    line-height: 1.5;
    color: var(--sl-color-gray-2);
  }

  .links {
    display: flex;
    flex-wrap: wrap;
    gap: 0.375rem;
  }

  .link-badge {
    display: inline-flex;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.75rem;
    background: color-mix(in srgb, var(--link-color, var(--sl-color-accent)) 15%, transparent);
    border: 1px solid color-mix(in srgb, var(--link-color, var(--sl-color-accent)) 30%, transparent);
    color: var(--link-color, var(--sl-color-accent-high));
    line-height: 1.3;
  }

  .goal-badge {
    --link-color: var(--sl-color-accent);
  }

  .empty {
    font-size: 0.75rem;
    color: var(--sl-color-gray-4);
    font-style: italic;
  }

  .gauge-wrapper {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .gauge {
    flex: 1;
    height: 12px;
    background: var(--sl-color-gray-5);
    border-radius: 6px;
    position: relative;
    overflow: visible;
  }

  .gauge-fill {
    height: 100%;
    border-radius: 6px;
    transition: all 0.3s;
  }

  .gauge-needle {
    position: absolute;
    top: -3px;
    width: 3px;
    height: 18px;
    background: var(--sl-color-white);
    border-radius: 2px;
    transform: translateX(-50%);
    transition: left 0.3s;
    box-shadow: 0 0 4px rgba(0, 0, 0, 0.5);
  }

  .gauge-value {
    font-size: 0.875rem;
    font-weight: 700;
    min-width: 3ch;
    text-align: right;
  }

  .outcome-controls {
    display: flex;
    gap: 0.5rem;
  }

  .select {
    min-width: 140px;
    background: var(--sl-color-gray-6);
    border: 1px solid var(--sl-color-gray-5);
    color: var(--sl-color-white);
    border-radius: 4px;
    padding: 0.5rem;
    font-size: 0.8125rem;
    font-family: inherit;
    flex: 1;
  }

  .select:focus {
    outline: none;
    border-color: var(--sl-color-accent);
  }

  .comparison {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
  }

  .comparison-item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding: 0.625rem;
    border-radius: 6px;
    font-size: 0.8125rem;
    border: 1px solid var(--sl-color-border);
  }

  .comparison-item.expected {
    background: color-mix(in srgb, #4ade80 8%, transparent);
    border-color: color-mix(in srgb, #4ade80 30%, transparent);
  }

  .comparison-item.actual {
    background: color-mix(in srgb, var(--sl-color-accent) 8%, transparent);
    border-color: color-mix(in srgb, var(--sl-color-accent) 30%, transparent);
  }

  .comparison-label {
    font-size: 0.6875rem;
    font-weight: 600;
    text-transform: uppercase;
    color: var(--sl-color-gray-4);
  }

</style>

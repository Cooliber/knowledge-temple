<script lang="ts">
  import { Button, Input, Label } from '$lib/components/ui'
  import type { Decision, Belief, Goal } from '$lib/db'

  let {
    decision,
    beliefs = [],
    goals = [],
    onsave,
    oncancel,
  }: {
    decision?: Decision
    beliefs: Belief[]
    goals: Goal[]
    onsave?: (data: any) => void
    oncancel?: () => void
  } = $props()

  let description = $state(decision?.description ?? '')
  let context = $state(decision?.context ?? '')
  let selectedBeliefs = $state<string[]>(decision?.beliefs ?? [])
  let selectedGoals = $state<string[]>(decision?.goals ?? [])
  let threshold = $state(decision ? decision.threshold * 100 : 50)
  let expectedOutcome = $state(decision?.expectedOutcome ?? '')

  function toggleBelief(id: string) {
    if (selectedBeliefs.includes(id)) {
      selectedBeliefs = selectedBeliefs.filter((b) => b !== id)
    } else {
      selectedBeliefs = [...selectedBeliefs, id]
    }
  }

  function toggleGoal(id: string) {
    if (selectedGoals.includes(id)) {
      selectedGoals = selectedGoals.filter((g) => g !== id)
    } else {
      selectedGoals = [...selectedGoals, id]
    }
  }

  function handleSubmit(e: Event) {
    e.preventDefault()
    onsave?.({
      description,
      context,
      beliefs: selectedBeliefs,
      goals: selectedGoals,
      threshold: threshold / 100,
      expectedOutcome: expectedOutcome || undefined,
      outcome: decision?.outcome ?? 'pending',
      timestamp: decision?.timestamp ?? new Date().toISOString(),
      actualOutcome: decision?.actualOutcome,
    })
  }
</script>

<form class="form mh-animate" onsubmit={handleSubmit}>
  <div class="field">
    <Label for="desc">Opis decyzji</Label>
    <textarea
      id="desc"
      class="textarea"
      bind:value={description}
      rows="2"
      placeholder="Co postanowiłeś?"
      required
    ></textarea>
  </div>

  <div class="field">
    <Label for="ctx">Kontekst</Label>
    <textarea
      id="ctx"
      class="textarea"
      bind:value={context}
      rows="3"
      placeholder="Okoliczności, sytuacja, myśli..."
    ></textarea>
  </div>

  <div class="field">
    <Label>Powiązane przekonania</Label>
    <div class="checkbox-grid">
      {#each beliefs as belief (belief.id)}
        <label class="checkbox-item">
          <input
            type="checkbox"
            checked={selectedBeliefs.includes(belief.id)}
            onchange={() => toggleBelief(belief.id)}
          />
          <span class="checkbox-text">{belief.text}</span>
        </label>
      {:else}
        <span class="empty-hint">Brak przekonań</span>
      {/each}
    </div>
  </div>

  <div class="field">
    <Label>Powiązane cele</Label>
    <div class="checkbox-grid">
      {#each goals as goal (goal.id)}
        <label class="checkbox-item">
          <input
            type="checkbox"
            checked={selectedGoals.includes(goal.id)}
            onchange={() => toggleGoal(goal.id)}
          />
          <span class="checkbox-text">{goal.title}</span>
        </label>
      {:else}
        <span class="empty-hint">Brak celów</span>
      {/each}
    </div>
  </div>

  <div class="field">
    <Label for="threshold">Próg decyzyjny: {threshold}%</Label>
    <input
      id="threshold"
      type="range"
      min="0"
      max="100"
      bind:value={threshold}
      class="slider"
    />
    <div class="slider-labels">
      <span>Niepewna</span>
      <span>Pewna</span>
    </div>
  </div>

  <div class="field">
    <Label for="expected">Oczekiwany rezultat</Label>
    <Input
      id="expected"
      type="text"
      bind:value={expectedOutcome}
      placeholder="Co预计 się wydarzyć?"
    />
  </div>

  <div class="actions">
    <Button type="submit">
      {decision ? 'Zapisz zmiany' : 'Dodaj decyzję'}
    </Button>
    <Button type="button" variant="outline" onclick={() => oncancel?.()}>
      Anuluj
    </Button>
  </div>
</form>

<style>
  .form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
  }

  .textarea {
    background: var(--sl-color-gray-6);
    border: 1px solid var(--sl-color-gray-5);
    color: var(--sl-color-white);
    border-radius: 4px;
    padding: 0.5rem;
    font-size: 0.8125rem;
    font-family: inherit;
    width: 100%;
    resize: vertical;
  }

  .textarea:focus {
    outline: none;
    border-color: var(--sl-color-accent);
  }

  .checkbox-grid {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    max-height: 160px;
    overflow-y: auto;
    padding: 0.375rem;
    border: 1px solid var(--mh-border);
    border-radius: var(--mh-radius-sm);
  }

  .checkbox-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.3rem 0.375rem;
    border-radius: 3px;
    cursor: pointer;
    font-size: 0.78125rem;
    color: var(--mh-text-secondary);
  }

  .checkbox-item:hover {
    background: var(--mh-bg-elevated);
  }

  .slider {
    -webkit-appearance: none;
    appearance: none;
    height: 6px;
    background: var(--mh-bg-elevated);
    border-radius: 3px;
    outline: none;
  }

  .slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--mh-accent);
    cursor: pointer;
  }

  .slider::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--mh-accent);
    cursor: pointer;
    border: none;
  }

  .slider-labels {
    display: flex;
    justify-content: space-between;
    font-size: 0.6875rem;
    color: var(--mh-text-muted);
  }

  .actions {
    display: flex;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }
</style>

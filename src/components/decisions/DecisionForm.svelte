<script lang="ts">
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

<form class="form" onsubmit={handleSubmit}>
  <div class="field">
    <label class="label" for="desc">Opis decyzji</label>
    <textarea
      id="desc"
      class="input"
      bind:value={description}
      rows="2"
      placeholder="Co postanowiłeś?"
      required
    ></textarea>
  </div>

  <div class="field">
    <label class="label" for="ctx">Kontekst</label>
    <textarea
      id="ctx"
      class="input"
      bind:value={context}
      rows="3"
      placeholder="Okoliczności, sytuacja, myśli..."
    ></textarea>
  </div>

  <div class="field">
    <label class="label">Powiązane przekonania</label>
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
    <label class="label">Powiązane cele</label>
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
    <label class="label" for="threshold">
      Próg decyzyjny: {threshold}%
    </label>
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
    <label class="label" for="expected">Oczekiwany rezultat</label>
    <input
      id="expected"
      type="text"
      class="input"
      bind:value={expectedOutcome}
      placeholder="Co预计 się wydarzyć?"
    />
  </div>

  <div class="actions">
    <button type="submit" class="btn btn-primary">
      {decision ? 'Zapisz zmiany' : 'Dodaj decyzję'}
    </button>
    <button type="button" class="btn btn-ghost" onclick={() => oncancel?.()}>
      Anuluj
    </button>
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

  .label {
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--sl-color-gray-2);
  }

  .input {
    background: var(--sl-color-gray-6);
    border: 1px solid var(--sl-color-gray-5);
    color: var(--sl-color-white);
    border-radius: 4px;
    padding: 0.5rem;
    font-size: 0.8125rem;
    font-family: inherit;
    resize: vertical;
  }

  .input:focus {
    outline: none;
    border-color: var(--sl-color-accent);
  }

  input[type="text"].input {
    resize: none;
  }

  .checkbox-grid {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    max-height: 160px;
    overflow-y: auto;
    padding: 0.375rem;
    background: var(--sl-color-gray-6);
    border: 1px solid var(--sl-color-gray-5);
    border-radius: 4px;
  }

  .checkbox-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.3rem 0.375rem;
    border-radius: 3px;
    cursor: pointer;
    font-size: 0.78125rem;
    color: var(--sl-color-gray-2);
  }

  .checkbox-item:hover {
    background: var(--sl-color-gray-5);
  }

  .checkbox-text {
    line-height: 1.3;
  }

  .empty-hint {
    color: var(--sl-color-gray-4);
    font-size: 0.75rem;
    padding: 0.5rem;
  }

  .slider {
    -webkit-appearance: none;
    appearance: none;
    height: 6px;
    background: var(--sl-color-gray-5);
    border-radius: 3px;
    outline: none;
  }

  .slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--sl-color-accent);
    cursor: pointer;
  }

  .slider::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--sl-color-accent);
    cursor: pointer;
    border: none;
  }

  .slider-labels {
    display: flex;
    justify-content: space-between;
    font-size: 0.6875rem;
    color: var(--sl-color-gray-4);
  }

  .actions {
    display: flex;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }

  .btn {
    padding: 0.5rem 1rem;
    border-radius: 6px;
    font-size: 0.8125rem;
    font-weight: 600;
    cursor: pointer;
    border: 1px solid transparent;
    transition: all 0.15s;
  }

  .btn-primary {
    background: var(--sl-color-accent);
    color: white;
  }

  .btn-primary:hover {
    background: color-mix(in srgb, var(--sl-color-accent) 80%, white);
  }

  .btn-ghost {
    background: transparent;
    color: var(--sl-color-gray-3);
    border-color: var(--sl-color-gray-5);
  }

  .btn-ghost:hover {
    background: var(--sl-color-gray-6);
    color: var(--sl-color-white);
  }
</style>

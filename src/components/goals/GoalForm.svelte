<script lang="ts">
  import type { Goal } from '$lib/db'

  let {
    goal,
    allGoals = [],
    onsave,
    oncancel,
  }: {
    goal?: Goal
    allGoals: Goal[]
    onsave?: (data: any) => void
    oncancel?: () => void
  } = $props()

  let title = $state(goal?.title ?? '')
  let description = $state(goal?.description ?? '')
  let parentId = $state<string | null>(goal?.parentId ?? null)
  let priority = $state(goal?.priority ?? 5)
  let horizon = $state<Goal['horizon']>(goal?.horizon ?? 'medium')
  let deadline = $state(goal?.deadline ?? '')
  let status = $state<Goal['status']>(goal?.status ?? 'active')

  const availableParents = $derived(
    goal
      ? allGoals.filter((g) => g.id !== goal.id && g.parentId !== goal.id)
      : allGoals
  )

  function handleSubmit(e: Event) {
    e.preventDefault()
    onsave?.({
      title,
      description,
      parentId: parentId || null,
      priority,
      horizon,
      progress: goal?.progress ?? 0,
      deadline: deadline || undefined,
      status,
      supportingBeliefs: goal?.supportingBeliefs ?? [],
      blockingBeliefs: goal?.blockingBeliefs ?? [],
    })
  }
</script>

<form class="form mh-animate mh-animate-d2" onsubmit={handleSubmit}>
  <div class="field">
    <label class="label" for="title">Tytuł</label>
    <input
      id="title"
      type="text"
      class="mh-input"
      bind:value={title}
      placeholder="Nazwa celu"
      required
    />
  </div>

  <div class="field">
    <label class="label" for="desc">Opis</label>
    <textarea
      id="desc"
      class="mh-input"
      bind:value={description}
      rows="3"
      placeholder="Szczegóły celu..."
    ></textarea>
  </div>

  <div class="field">
    <label class="label" for="parent">Cel nadrzędny</label>
    <select class="mh-input" bind:value={parentId}>
      <option value={null}>Brak (cel główny)</option>
      {#each availableParents as p (p.id)}
        <option value={p.id}>{p.title}</option>
      {/each}
    </select>
  </div>

  <div class="field-row">
    <div class="field">
      <label class="label" for="priority">Priorytet (1–10)</label>
      <input
        id="priority"
        type="number"
        class="mh-input"
        bind:value={priority}
        min="1"
        max="10"
      />
    </div>

    <div class="field">
      <label class="label">Horyzont</label>
      <div class="radio-group">
        {#each ['short', 'medium', 'long'] as h}
          <label class="radio-item">
            <input
              type="radio"
              name="horizon"
              value={h}
              checked={horizon === h}
              onchange={() => (horizon = h as Goal['horizon'])}
            />
            <span class="radio-label">
              {h === 'short' ? 'Krótki' : h === 'medium' ? 'Średni' : 'Długi'}
            </span>
          </label>
        {/each}
      </div>
    </div>
  </div>

  <div class="field-row">
    <div class="field">
      <label class="label" for="deadline">Deadline</label>
      <input
        id="deadline"
        type="date"
        class="mh-input"
        bind:value={deadline}
      />
    </div>

    <div class="field">
      <label class="label" for="status">Status</label>
      <select class="mh-input" bind:value={status}>
        <option value="active">Aktywny</option>
        <option value="completed">Ukończony</option>
        <option value="abandoned">Porzucony</option>
      </select>
    </div>
  </div>

  <div class="actions">
    <button type="submit" class="mh-btn mh-btn-primary">
      {goal ? 'Zapisz zmiany' : 'Dodaj cel'}
    </button>
    <button type="button" class="mh-btn mh-btn-secondary" onclick={() => oncancel?.()}>
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
    flex: 1;
  }

  .field-row {
    display: flex;
    gap: 0.75rem;
  }

  @media (max-width: 500px) {
    .field-row {
      flex-direction: column;
    }
  }

  .label {
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--mh-text-secondary);
  }

  .radio-group {
    display: flex;
    gap: 0.5rem;
    padding: 0.375rem;
    border: 1px solid var(--mh-border);
    border-radius: var(--mh-radius-sm);
  }

  .radio-item {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.3rem 0.5rem;
    border-radius: 3px;
    cursor: pointer;
    font-size: 0.78125rem;
    color: var(--mh-text-secondary);
  }

  .radio-item:hover {
    background: var(--mh-bg-elevated);
  }

  .radio-item:has(input:checked) {
    background: color-mix(in srgb, var(--mh-accent) 20%, transparent);
    color: var(--mh-accent-hover);
  }

  .radio-label {
    white-space: nowrap;
  }

  .actions {
    display: flex;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }


</style>

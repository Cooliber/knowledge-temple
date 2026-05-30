<script lang="ts">
  import DecisionLog from './DecisionLog.svelte'
  import DecisionCard from './DecisionCard.svelte'
  import DecisionForm from './DecisionForm.svelte'
  import { decisions, beliefs, goals } from '$lib/db'
  import type { Decision as DecisionType, Belief, Goal } from '$lib/db'

  let allDecisions: DecisionType[] = $state([])
  let allBeliefs: Belief[] = $state([])
  let allGoals: Goal[] = $state([])
  let selectedId: string | null = $state(null)
  let showForm = $state(false)
  let editingDecision: DecisionType | undefined = $state(undefined)
  let loading = $state(true)

  const selectedDecision = $derived(
    allDecisions.find((d) => d.id === selectedId) ?? null
  )

  $effect(() => {
    async function load() {
      loading = true
      try {
        const [d, b, g] = await Promise.all([
          decisions.getAllDecisions(),
          beliefs.getAllBeliefs(),
          goals.getAllGoals(),
        ])
        allDecisions = d
        allBeliefs = b
        allGoals = g
      } finally {
        loading = false
      }
    }
    load()
  })

  async function handleSave(data: any) {
    if (editingDecision) {
      const updated = await decisions.updateDecision(editingDecision.id, data)
      if (updated) {
        allDecisions = allDecisions.map((d) =>
          d.id === editingDecision.id ? updated : d
        )
      }
    } else {
      const created = await decisions.createDecision(data)
      allDecisions = [created, ...allDecisions]
    }
    showForm = false
    editingDecision = undefined
  }

  async function handleDelete(id: string) {
    await decisions.deleteDecision(id)
    allDecisions = allDecisions.filter((d) => d.id !== id)
    if (selectedId === id) {
      selectedId = null
    }
  }

  async function handleUpdate(id: string, data: Partial<DecisionType>) {
    const updated = await decisions.updateDecision(id, data)
    if (updated) {
      allDecisions = allDecisions.map((d) =>
        d.id === id ? updated : d
      )
    }
  }

  function handleEdit() {
    if (selectedDecision) {
      editingDecision = selectedDecision
      showForm = true
    }
  }

  function handleAdd() {
    editingDecision = undefined
    showForm = true
  }

  function handleCancel() {
    showForm = false
    editingDecision = undefined
  }
</script>

<div class="view">
  <div class="toolbar">
    <h2 class="view-title">Bramka Decyzyjna</h2>
    <button class="btn btn-primary" onclick={handleAdd}>
      + Nowa decyzja
    </button>
  </div>

  {#if loading}
    <div class="loading">Ładowanie...</div>
  {:else}
    <div class="columns">
      <div class="column-left">
        <div class="card-container">
          <DecisionLog
              decisions={allDecisions}
            selectedId={selectedId}
            onselect={(id: string) => {
              selectedId = id
              showForm = false
              editingDecision = undefined
            }}
          />
        </div>
      </div>
      <div class="column-right">
        {#if showForm}
          <div class="card-container">
            <h3 class="panel-title">
              {editingDecision ? 'Edytuj decyzję' : 'Nowa decyzja'}
            </h3>
            <DecisionForm
              decision={editingDecision}
              beliefs={allBeliefs}
              goals={allGoals}
              onsave={handleSave}
              oncancel={handleCancel}
            />
          </div>
        {:else if selectedDecision}
          <div class="card-container">
            <DecisionCard
              decision={selectedDecision}
              beliefs={allBeliefs}
              goals={allGoals}
              onedit={handleEdit}
              onupdate={handleUpdate}
              ondelete={() => handleDelete(selectedDecision!.id)}
            />
          </div>
        {:else}
          <div class="empty-state">
            <div class="empty-icon">⚖️</div>
            <p class="empty-text">Wybierz decyzję z listy lub dodaj nową</p>
          </div>
        {/if}
      </div>
    </div>
  {/if}
</div>

<style>
  .view {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .view-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--sl-color-white);
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

  .columns {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    align-items: start;
  }

  @media (max-width: 900px) {
    .columns {
      grid-template-columns: 1fr;
    }
  }

  .column-left,
  .column-right {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .card-container {
    background: var(--sl-color-bg-card);
    border: 1px solid var(--sl-color-border);
    border-radius: 8px;
    padding: 1rem;
  }

  .panel-title {
    font-size: 1rem;
    font-weight: 600;
    color: var(--sl-color-white);
    margin-bottom: 0.75rem;
  }

  .loading {
    padding: 3rem 0;
    text-align: center;
    color: var(--sl-color-gray-4);
    font-size: 0.875rem;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem 1rem;
    background: var(--sl-color-bg-card);
    border: 1px solid var(--sl-color-border);
    border-radius: 8px;
    text-align: center;
  }

  .empty-icon {
    font-size: 2.5rem;
    margin-bottom: 0.75rem;
    opacity: 0.5;
  }

  .empty-text {
    font-size: 0.875rem;
    color: var(--sl-color-gray-4);
  }
</style>

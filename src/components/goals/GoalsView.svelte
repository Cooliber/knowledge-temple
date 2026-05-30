<script lang="ts">
  import GoalTree from './GoalTree.svelte'
  import GoalCard from './GoalCard.svelte'
  import GoalForm from './GoalForm.svelte'
  import { goals, beliefs } from '$lib/db'
  import type { Goal, Belief } from '$lib/db'

  let allGoals: Goal[] = $state([])
  let allBeliefs: Belief[] = $state([])
  let selectedId: string | null = $state(null)
  let showForm = $state(false)
  let editingGoal: Goal | undefined = $state(undefined)
  let loading = $state(true)

  const selectedGoal = $derived(
    allGoals.find((g) => g.id === selectedId) ?? null
  )

  const stats = $derived({
    active: allGoals.filter((g) => g.status === 'active').length,
    completed: allGoals.filter((g) => g.status === 'completed').length,
    abandoned: allGoals.filter((g) => g.status === 'abandoned').length,
    total: allGoals.length,
  })

  $effect(() => {
    async function load() {
      loading = true
      try {
        const [g, b] = await Promise.all([
          goals.getAllGoals(),
          beliefs.getAllBeliefs(),
        ])
        allGoals = g
        allBeliefs = b
      } finally {
        loading = false
      }
    }
    load()
  })

  async function handleSave(data: any) {
    if (editingGoal) {
      const updated = await goals.updateGoal(editingGoal.id, data)
      if (updated) {
        allGoals = allGoals.map((g) =>
          g.id === editingGoal.id ? updated : g
        )
      }
    } else {
      const created = await goals.createGoal(data)
      allGoals = [...allGoals, created]
    }
    showForm = false
    editingGoal = undefined
  }

  async function handleDelete(id: string) {
    await goals.deleteGoal(id)
    allGoals = allGoals.filter((g) => g.id !== id)
    if (selectedId === id) {
      selectedId = null
    }
  }

  async function handleUpdate(id: string, data: Partial<Goal>) {
    const updated = await goals.updateGoal(id, data)
    if (updated) {
      allGoals = allGoals.map((g) =>
        g.id === id ? updated : g
      )
    }
  }

  function handleEdit() {
    if (selectedGoal) {
      editingGoal = selectedGoal
      showForm = true
    }
  }

  function handleAdd() {
    editingGoal = undefined
    showForm = true
  }

  function handleCancel() {
    showForm = false
    editingGoal = undefined
  }
</script>

<div class="view mh-animate">
  <div class="toolbar">
    <h2 class="view-title">System Celów</h2>
    <button class="mh-btn mh-btn-primary" onclick={handleAdd}>
      + Nowy cel
    </button>
  </div>

  {#if loading}
    <div class="loading">Ładowanie...</div>
  {:else}
    <div class="stats-row">
      <div class="stat mh-card">
        <span class="stat-value">{stats.total}</span>
        <span class="stat-label">Wszystkie</span>
      </div>
      <div class="stat accent mh-card">
        <span class="stat-value">{stats.active}</span>
        <span class="stat-label">Aktywne</span>
      </div>
      <div class="stat success mh-card">
        <span class="stat-value">{stats.completed}</span>
        <span class="stat-label">Ukończone</span>
      </div>
      <div class="stat danger mh-card">
        <span class="stat-value">{stats.abandoned}</span>
        <span class="stat-label">Porzucone</span>
      </div>
    </div>

    <div class="columns">
      <div class="column-left mh-animate-d1">
        <div class="mh-card">
          <GoalTree
            goals={allGoals}
            {selectedId}
            onselect={(id: string) => {
              selectedId = id
              showForm = false
              editingGoal = undefined
            }}
          />
        </div>
      </div>
      <div class="column-right mh-animate-d2">
        {#if showForm}
          <div class="mh-card">
            <h3 class="panel-title">
              {editingGoal ? 'Edytuj cel' : 'Nowy cel'}
            </h3>
            <GoalForm
              goal={editingGoal}
              allGoals={allGoals}
              onsave={handleSave}
              oncancel={handleCancel}
            />
          </div>
        {:else if selectedGoal}
          <div class="mh-card">
            <GoalCard
              goal={selectedGoal}
              beliefs={allBeliefs}
              onedit={handleEdit}
              onupdate={handleUpdate}
              ondelete={() => handleDelete(selectedGoal!.id)}
            />
          </div>
        {:else}
          <div class="empty-state mh-card">
            <div class="empty-icon">🎯</div>
            <p class="empty-text">Wybierz cel z listy lub dodaj nowy</p>
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
    color: var(--mh-text);
  }

  .stats-row {
    display: flex;
    gap: 0.75rem;
  }

  .stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.125rem;
    padding: 0.75rem 1rem;
    flex: 1;
    min-width: 0;
  }

  .stat-value {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--mh-text);
  }

  .stat-label {
    font-size: 0.6875rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--mh-text-secondary);
  }

  .stat.accent .stat-value {
    color: var(--mh-accent-hover);
  }

  .stat.success .stat-value {
    color: #4ade80;
  }

  .stat.danger .stat-value {
    color: #f87171;
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

  .panel-title {
    font-size: 1rem;
    font-weight: 600;
    color: var(--mh-text);
    margin-bottom: 0.75rem;
  }

  .loading {
    padding: 3rem 0;
    text-align: center;
    color: var(--mh-text-muted);
    font-size: 0.875rem;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem 1rem;
    text-align: center;
  }

  .empty-icon {
    font-size: 2.5rem;
    margin-bottom: 0.75rem;
    opacity: 0.5;
  }

  .empty-text {
    font-size: 0.875rem;
    color: var(--mh-text-muted);
  }
</style>

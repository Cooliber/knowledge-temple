<script lang="ts">
  import GoalTree from './GoalTree.svelte'
  import GoalCard from './GoalCard.svelte'
  import GoalForm from './GoalForm.svelte'
  import { goals, beliefs } from '$lib/db'
  import type { Goal, Belief } from '$lib/db'
  import { Button, Card, CardHeader, CardTitle, CardContent } from '$lib/components/ui/index.js'
  import { toast } from 'svelte-sonner'

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
    const wasEdit = !!editingGoal
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
    toast.success(wasEdit ? 'Cel zaktualizowany' : 'Cel utworzony')
  }

  async function handleDelete(id: string) {
    await goals.deleteGoal(id)
    allGoals = allGoals.filter((g) => g.id !== id)
    if (selectedId === id) {
      selectedId = null
    }
    toast.success('Cel usunięty')
  }

  async function handleUpdate(id: string, data: Partial<Goal>) {
    const updated = await goals.updateGoal(id, data)
    if (updated) {
      allGoals = allGoals.map((g) =>
        g.id === id ? updated : g
      )
      toast.success('Cel zaktualizowany')
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
    <Button variant="default" onclick={handleAdd}>
      + Nowy cel
    </Button>
  </div>

  {#if loading}
    <div class="loading">Ładowanie...</div>
  {:else}
    <div class="stats-row">
      <Card class="stat">
        <span class="stat-value">{stats.total}</span>
        <span class="stat-label">Wszystkie</span>
      </Card>
      <Card class="stat accent">
        <span class="stat-value">{stats.active}</span>
        <span class="stat-label">Aktywne</span>
      </Card>
      <Card class="stat success">
        <span class="stat-value">{stats.completed}</span>
        <span class="stat-label">Ukończone</span>
      </Card>
      <Card class="stat danger">
        <span class="stat-value">{stats.abandoned}</span>
        <span class="stat-label">Porzucone</span>
      </Card>
    </div>

    <div class="columns">
      <div class="column-left mh-animate-d1">
        <Card>
          <GoalTree
            goals={allGoals}
            {selectedId}
            onselect={(id: string) => {
              selectedId = id
              showForm = false
              editingGoal = undefined
            }}
          />
        </Card>
      </div>
      <div class="column-right mh-animate-d2">
        {#if showForm}
          <Card>
            <CardHeader>
              <CardTitle class="text-sm">
                {editingGoal ? 'Edytuj cel' : 'Nowy cel'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <GoalForm
                goal={editingGoal}
                allGoals={allGoals}
                onsave={handleSave}
                oncancel={handleCancel}
              />
            </CardContent>
          </Card>
        {:else if selectedGoal}
          <Card>
            <GoalCard
              goal={selectedGoal}
              beliefs={allBeliefs}
              onedit={handleEdit}
              onupdate={handleUpdate}
              ondelete={() => handleDelete(selectedGoal!.id)}
            />
          </Card>
        {:else}
          <Card class="empty-state">
            <div class="empty-icon">🎯</div>
            <p class="empty-text">Wybierz cel z listy lub dodaj nowy</p>
          </Card>
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

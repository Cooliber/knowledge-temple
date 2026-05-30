<script lang="ts">
  import { onMount } from 'svelte'
  import { observations as db, beliefs as beliefsDb } from '$lib/db'
  import type { Observation, Belief } from '$lib/db'
  import ObsJournal from './ObsJournal.svelte'
  import ObsEntry from './ObsEntry.svelte'
  import ObsForm from './ObsForm.svelte'
  import { Button } from '$lib/components/ui'

  let allObservations: Observation[] = $state([])
  let allBeliefs: Belief[] = $state([])
  let selectedId: string | null = $state(null)
  let showForm = $state(false)
  let editingObservation: Observation | null = $state(null)

  let selectedObservation = $derived(
    allObservations.find(o => o.id === selectedId) ?? null
  )

  onMount(async () => {
    await loadData()
  })

  async function loadData() {
    allObservations = await db.getAllObservations()
    allBeliefs = await beliefsDb.getAllBeliefs()
  }

  function handleSelect(id: string) {
    selectedId = id
    showForm = false
    editingObservation = null
  }

  function handleAdd() {
    selectedId = null
    editingObservation = null
    showForm = true
  }

  function handleEdit(obs: Observation) {
    editingObservation = obs
    showForm = true
    selectedId = null
  }

  function handleCancel() {
    showForm = false
    editingObservation = null
  }

  async function handleSave() {
    showForm = false
    editingObservation = null
    await loadData()
  }

  async function handleDelete(id: string) {
    await db.deleteObservation(id)
    if (selectedId === id) selectedId = null
    await loadData()
  }

  async function handleLinkBelief(obsId: string, beliefId: string) {
    await db.linkBeliefToObservation(obsId, beliefId)
    await loadData()
  }

  let showDetail = $derived(!!selectedObservation && !showForm)
</script>

<div class="observations-view mh-animate">
  <div class="view-header">
    <h1 class="view-title">Dziennik Obserwacji</h1>
    <Button variant="default" onclick={handleAdd}>
      + Nowa obserwacja
    </Button>
  </div>

  <div class="view-body mh-animate-d1">
    <div class="view-sidebar">
      <ObsJournal
        observations={allObservations}
        selectedId={selectedId}
        onselect={handleSelect}
      />
    </div>

    <div class="view-detail">
      {#if showForm}
        <ObsForm
          observation={editingObservation}
          beliefs={allBeliefs}
          onsave={handleSave}
          oncancel={handleCancel}
        />
      {:else if showDetail}
        <ObsEntry
          observation={selectedObservation}
          beliefs={allBeliefs}
          onedit={handleEdit}
          ondelete={handleDelete}
          onlinkbelief={handleLinkBelief}
        />
      {:else}
        <ObsEntry
          observation={null}
          beliefs={[]}
        />
      {/if}
    </div>
  </div>
</div>

<style>
  .observations-view {
    display: flex;
    flex-direction: column;
    height: 100%;
    gap: 1rem;
  }

  .view-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .view-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--mh-text);
    margin: 0;
  }

  .view-body {
    display: grid;
    grid-template-columns: 380px 1fr;
    gap: 1rem;
    flex: 1;
    min-height: 0;
  }

  .view-sidebar {
    min-height: 0;
    height: 100%;
  }

  .view-detail {
    min-height: 0;
    height: 100%;
    overflow-y: auto;
  }
</style>

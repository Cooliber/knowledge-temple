<script lang="ts">
  import { onMount } from 'svelte'
  import { beliefs, type Belief } from '$lib/db'
  import BeliefCard from './BeliefCard.svelte'
  import BeliefForm from './BeliefForm.svelte'
  import BeliefTimeline from './BeliefTimeline.svelte'
  import BeliefHierarchy from './BeliefHierarchy.svelte'
  import NestedBeliefDialog from './NestedBeliefDialog.svelte'
  import { Button, Badge, Input, Progress, Card, CardContent, CardTitle } from '$lib/components/ui/index.js'

  let allBeliefs = $state<Belief[]>([])
  let selectedBelief = $state<Belief | null>(null)
  let showForm = $state(false)
  let searchQuery = $state('')
  let filterType = $state<string>('all')
  let filterCategory = $state<string>('all')
  let showNestedDialog = $state(false)
  let nestedParent = $state<Belief | null>(null)
  let viewMode = $state<'list' | 'hierarchy'>('list')

  let categories = $derived(['all', ...new Set(allBeliefs.map(b => b.category).filter(Boolean))])

  let filteredBeliefs = $derived(
    allBeliefs.filter(b => {
      if (filterType !== 'all' && b.type !== filterType) return false
      if (filterCategory !== 'all' && b.category !== filterCategory) return false
      if (searchQuery && !b.text.toLowerCase().includes(searchQuery.toLowerCase())) return false
      return true
    })
  )

  let displayBeliefs = $derived(viewMode === 'hierarchy' ? allBeliefs : filteredBeliefs)

  function typeLabel(t: string): string {
    const map: Record<string, string> = {
      first_order: '1. rzędu',
      second_order: '2. rzędu',
      third_order: '3. rzędu',
    }
    return map[t] || t
  }

  onMount(loadBeliefs)

  async function loadBeliefs() {
    allBeliefs = await beliefs.getAllBeliefs()
  }

  function handleSelect(belief: Belief) {
    selectedBelief = belief
    showForm = false
  }

  function handleCreate() {
    selectedBelief = null
    showForm = true
  }

  function handleEdit(belief: Belief) {
    selectedBelief = belief
    showForm = true
  }

  async function handleSave(data: any) {
    if (selectedBelief) {
      await beliefs.updateBelief(selectedBelief.id, data)
    } else {
      await beliefs.createBelief(data)
    }
    await loadBeliefs()
    showForm = false
    selectedBelief = null
  }

  async function handleDelete(id: string) {
    await beliefs.deleteBelief(id)
    if (selectedBelief?.id === id) selectedBelief = null
    await loadBeliefs()
  }

  function handleCreateNested(belief: Belief) {
    selectedBelief = belief
    showNestedDialog = true
    nestedParent = belief
  }

  async function handleNestedSave(data: any) {
    await beliefs.createBelief(data)
    await loadBeliefs()
    showNestedDialog = false
    nestedParent = null
  }

  function handleCloseNested() {
    showNestedDialog = false
    nestedParent = null
  }
</script>

<div class="beliefs-view mh-animate">
  <aside class="sidebar mh-animate-d1">
    <div class="sidebar-header">
      <CardTitle class="text-sm">Przekonania</CardTitle>
      <Button onclick={handleCreate}>+ Nowe</Button>
    </div>

    <div class="sidebar-controls">
      <Input
        type="search"
        placeholder="Szukaj przekonań..."
        bind:value={searchQuery}
      />

      <div class="filter-row">
        <select class="mh-input" bind:value={filterType}>
          <option value="all">Wszystkie typy</option>
          <option value="first_order">1. rzędu</option>
          <option value="second_order">2. rzędu</option>
          <option value="third_order">3. rzędu</option>
        </select>

        <select class="mh-input" bind:value={filterCategory}>
          {#each categories as cat}
            <option value={cat}>{cat === 'all' ? 'Wszystkie kategorie' : cat}</option>
          {/each}
        </select>
      </div>

      <div class="view-toggle">
        <Button
          variant={viewMode === 'list' ? 'default' : 'secondary'}
          onclick={() => viewMode = 'list'}>Lista</Button>
        <Button
          variant={viewMode === 'hierarchy' ? 'default' : 'secondary'}
          onclick={() => viewMode = 'hierarchy'}>Hierarchia</Button>
      </div>
    </div>

    <div class="belief-list">
      {#if displayBeliefs.length === 0}
        <div class="empty-state">
          <p>Brak przekonań</p>
          <p class="empty-hint">Dodaj pierwsze przekonanie</p>
        </div>
      {:else}
        {#each displayBeliefs as belief (belief.id)}
          <BeliefCard
            {belief}
            selected={selectedBelief?.id === belief.id}
            onselect={() => handleSelect(belief)}
            onedit={() => handleEdit(belief)}
            ondelete={() => handleDelete(belief.id)}
            oncreatenested={() => handleCreateNested(belief)}
          />
        {/each}
      {/if}
    </div>
  </aside>

  <main class="main-panel mh-animate-d2">
    {#if showForm}
      <BeliefForm
        belief={selectedBelief ?? undefined}
        onsave={handleSave}
        oncancel={() => {
          showForm = false
          selectedBelief = null
        }}
      />
    {:else if selectedBelief && viewMode === 'list'}
      <Card>
        <CardContent class="flex flex-col gap-5 p-6">
          <div class="detail-header">
            <h3 class="detail-title">{selectedBelief.text}</h3>
            <div class="detail-actions">
              <Button variant="secondary" onclick={() => handleEdit(selectedBelief!)}>Edytuj</Button>
              <Button variant="secondary" onclick={() => handleCreateNested(selectedBelief!)}>+ Zagnieżdżone</Button>
            </div>
          </div>

          <div class="detail-meta">
            <Badge class="type-{selectedBelief.type}">
              {typeLabel(selectedBelief.type)}
            </Badge>
            {#if selectedBelief.subject}
              <span class="meta-item">
                <span class="meta-label">Osoba:</span> {selectedBelief.subject}
              </span>
            {/if}
            <span class="meta-item">
              <span class="meta-label">Kategoria:</span> {selectedBelief.category || '—'}
            </span>
            <span class="meta-item">
              <span class="meta-label">ID:</span> {selectedBelief.id.slice(0, 8)}...
            </span>
          </div>

          <div class="strength-section">
            <div class="strength-header">
              <span class="strength-label">Siła przekonania</span>
              <span class="strength-value">{Math.round(selectedBelief.strength * 100)}%</span>
            </div>
            <Progress value={selectedBelief.strength * 100} />
          </div>

          {#if selectedBelief.tags.length > 0}
            <div class="tags-section">
              <span class="section-label">Tagi:</span>
              <div class="tags-list">
                {#each selectedBelief.tags as tag}
                  <Badge variant="secondary">{tag}</Badge>
                {/each}
              </div>
            </div>
          {/if}

          <div class="timeline-section">
            <h4 class="section-heading">Historia siły przekonania</h4>
            <BeliefTimeline belief={selectedBelief} />
          </div>
        </CardContent>
      </Card>
    {:else if viewMode === 'hierarchy'}
      <BeliefHierarchy beliefs={allBeliefs} />
    {:else}
      <Card class="empty-detail">
        <CardContent class="flex items-center justify-center h-full">
          <p class="text-muted-foreground text-sm">Wybierz przekonanie z listy lub dodaj nowe</p>
        </CardContent>
      </Card>
    {/if}
  </main>
</div>

<NestedBeliefDialog
  show={showNestedDialog}
  parentBelief={nestedParent}
  onsave={handleNestedSave}
  oncancel={handleCloseNested}
/>

<style>
  .beliefs-view {
    display: grid;
    grid-template-columns: 340px 1fr;
    gap: 1.5rem;
    height: calc(100vh - 8rem);
  }

  .sidebar {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    overflow: hidden;
  }

  .sidebar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .sidebar-controls {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .filter-row {
    display: flex;
    gap: 0.5rem;
  }

  .filter-row select {
    flex: 1;
  }

  .belief-list {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding-right: 0.25rem;
  }

  .empty-state {
    text-align: center;
    padding: 2rem 1rem;
    color: var(--mh-text-muted);
  }

  .empty-hint {
    font-size: 0.8rem;
    margin-top: 0.25rem;
  }

  .main-panel {
    overflow-y: auto;
  }

  .detail-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
  }

  .detail-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--mh-text);
    line-height: 1.5;
  }

  .detail-actions {
    display: flex;
    gap: 0.5rem;
    flex-shrink: 0;
  }

  .detail-meta {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .meta-item {
    font-size: 0.8rem;
    color: var(--mh-text-secondary);
  }

  .meta-label {
    color: var(--mh-text-muted);
  }

  .strength-section {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
  }

  .strength-header {
    display: flex;
    justify-content: space-between;
    font-size: 0.8rem;
  }

  .strength-label {
    color: var(--mh-text-secondary);
  }

  .strength-value {
    color: var(--mh-accent-hover);
    font-weight: 600;
  }

  .tags-section {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .section-label {
    font-size: 0.8rem;
    color: var(--mh-text-secondary);
  }

  .tags-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.375rem;
  }

  .timeline-section {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .section-heading {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--mh-text-secondary);
  }

  .type-first_order {
    background: var(--mh-info-subtle);
    color: var(--mh-info);
  }

  .type-second_order {
    background: var(--mh-accent-subtle);
    color: var(--mh-accent-hover);
  }

  .type-third_order {
    background: var(--mh-danger-subtle);
    color: var(--mh-danger);
  }
</style>

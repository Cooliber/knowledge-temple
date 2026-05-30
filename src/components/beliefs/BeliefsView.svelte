<script lang="ts">
  import { onMount } from 'svelte'
  import { beliefs, type Belief } from '$lib/db'
  import BeliefCard from './BeliefCard.svelte'
  import BeliefForm from './BeliefForm.svelte'
  import BeliefTimeline from './BeliefTimeline.svelte'
  import BeliefHierarchy from './BeliefHierarchy.svelte'
  import NestedBeliefDialog from './NestedBeliefDialog.svelte'

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

<div class="beliefs-view">
  <aside class="sidebar">
    <div class="sidebar-header">
      <h2 class="sidebar-title">Przekonania</h2>
      <button class="btn btn-primary" onclick={handleCreate}>+ Nowe</button>
    </div>

    <div class="sidebar-controls">
      <input
        type="search"
        class="search-input"
        placeholder="Szukaj przekonań..."
        bind:value={searchQuery}
      />

      <div class="filter-row">
        <select class="filter-select" bind:value={filterType}>
          <option value="all">Wszystkie typy</option>
          <option value="first_order">1. rzędu</option>
          <option value="second_order">2. rzędu</option>
          <option value="third_order">3. rzędu</option>
        </select>

        <select class="filter-select" bind:value={filterCategory}>
          {#each categories as cat}
            <option value={cat}>{cat === 'all' ? 'Wszystkie kategorie' : cat}</option>
          {/each}
        </select>
      </div>

      <div class="view-toggle">
        <button
          class="toggle-btn"
          class:active={viewMode === 'list'}
          onclick={() => viewMode = 'list'}>Lista</button>
        <button
          class="toggle-btn"
          class:active={viewMode === 'hierarchy'}
          onclick={() => viewMode = 'hierarchy'}>Hierarchia</button>
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

  <main class="main-panel">
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
      <div class="detail-panel">
        <div class="detail-header">
          <h3 class="detail-title">{selectedBelief.text}</h3>
          <div class="detail-actions">
            <button class="btn btn-outline" onclick={() => handleEdit(selectedBelief!)}>Edytuj</button>
            <button class="btn btn-outline" onclick={() => handleCreateNested(selectedBelief!)}>+ Zagnieżdżone</button>
          </div>
        </div>

        <div class="detail-meta">
          <span class="type-badge type-{selectedBelief.type}">
            {typeLabel(selectedBelief.type)}
          </span>
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
          <div class="strength-bar-track">
            <div
              class="strength-bar-fill"
              style="width: {selectedBelief.strength * 100}%"
            ></div>
          </div>
        </div>

        {#if selectedBelief.tags.length > 0}
          <div class="tags-section">
            <span class="section-label">Tagi:</span>
            <div class="tags-list">
              {#each selectedBelief.tags as tag}
                <span class="tag">{tag}</span>
              {/each}
            </div>
          </div>
        {/if}

        <div class="timeline-section">
          <h4 class="section-heading">Historia siły przekonania</h4>
          <BeliefTimeline belief={selectedBelief} />
        </div>
      </div>
    {:else if viewMode === 'hierarchy'}
      <BeliefHierarchy beliefs={allBeliefs} />
    {:else}
      <div class="empty-detail">
        <p>Wybierz przekonanie z listy lub dodaj nowe</p>
      </div>
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

  .sidebar-title {
    font-size: 1.125rem;
    font-weight: 700;
    color: var(--sl-color-white);
  }

  .sidebar-controls {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .search-input {
    background: var(--sl-color-bg-card);
    border: 1px solid var(--sl-color-border);
    border-radius: 6px;
    padding: 0.5rem 0.75rem;
    color: var(--sl-color-text);
    font-size: 0.875rem;
    outline: none;
    transition: border-color 0.15s;
  }

  .search-input:focus {
    border-color: var(--sl-color-accent);
  }

  .filter-row {
    display: flex;
    gap: 0.5rem;
  }

  .filter-select {
    flex: 1;
    background: var(--sl-color-bg-card);
    border: 1px solid var(--sl-color-border);
    border-radius: 6px;
    padding: 0.375rem 0.5rem;
    color: var(--sl-color-text);
    font-size: 0.8rem;
    outline: none;
  }

  .filter-select:focus {
    border-color: var(--sl-color-accent);
  }

  .view-toggle {
    display: flex;
    background: var(--sl-color-bg-card);
    border: 1px solid var(--sl-color-border);
    border-radius: 6px;
    overflow: hidden;
  }

  .toggle-btn {
    flex: 1;
    padding: 0.375rem 0.75rem;
    font-size: 0.8rem;
    color: var(--sl-color-gray-3);
    background: transparent;
    border: none;
    cursor: pointer;
    transition: all 0.15s;
  }

  .toggle-btn.active {
    background: var(--sl-color-accent);
    color: var(--sl-color-white);
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
    color: var(--sl-color-gray-4);
  }

  .empty-hint {
    font-size: 0.8rem;
    margin-top: 0.25rem;
  }

  .main-panel {
    overflow-y: auto;
  }

  .detail-panel {
    background: var(--sl-color-bg-card);
    border: 1px solid var(--sl-color-border);
    border-radius: 8px;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
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
    color: var(--sl-color-white);
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
    color: var(--sl-color-gray-3);
  }

  .meta-label {
    color: var(--sl-color-gray-4);
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
    color: var(--sl-color-gray-3);
  }

  .strength-value {
    color: var(--sl-color-accent-high);
    font-weight: 600;
  }

  .strength-bar-track {
    height: 6px;
    background: var(--sl-color-gray-5);
    border-radius: 3px;
    overflow: hidden;
  }

  .strength-bar-fill {
    height: 100%;
    background: var(--sl-color-accent);
    border-radius: 3px;
    transition: width 0.3s;
  }

  .tags-section {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .section-label {
    font-size: 0.8rem;
    color: var(--sl-color-gray-3);
  }

  .tags-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.375rem;
  }

  .tag {
    display: inline-block;
    padding: 0.125rem 0.5rem;
    font-size: 0.75rem;
    background: rgba(124, 58, 237, 0.15);
    color: var(--sl-color-accent-high);
    border-radius: 4px;
  }

  .timeline-section {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .section-heading {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--sl-color-gray-2);
  }

  .empty-detail {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: var(--sl-color-gray-4);
    font-size: 0.9rem;
  }

  .btn {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.4375rem 0.875rem;
    font-size: 0.8125rem;
    font-weight: 500;
    border-radius: 6px;
    border: none;
    cursor: pointer;
    transition: all 0.15s;
    white-space: nowrap;
  }

  .btn-primary {
    background: var(--sl-color-accent);
    color: var(--sl-color-white);
  }

  .btn-primary:hover {
    opacity: 0.9;
  }

  .btn-outline {
    background: transparent;
    border: 1px solid var(--sl-color-border);
    color: var(--sl-color-gray-2);
  }

  .btn-outline:hover {
    border-color: var(--sl-color-accent);
    color: var(--sl-color-white);
  }

  .type-badge {
    display: inline-block;
    padding: 0.125rem 0.5rem;
    font-size: 0.7rem;
    font-weight: 600;
    border-radius: 4px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .type-first_order {
    background: rgba(59, 130, 246, 0.15);
    color: #60a5fa;
  }

  .type-second_order {
    background: rgba(124, 58, 237, 0.15);
    color: #a78bfa;
  }

  .type-third_order {
    background: rgba(239, 68, 68, 0.15);
    color: #f87171;
  }
</style>

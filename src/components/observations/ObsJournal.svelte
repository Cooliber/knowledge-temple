<script lang="ts">
  import type { Observation } from '$lib/db'
  import { Card, CardHeader, CardTitle, Badge, Input } from '$lib/components/ui'

  let {
    observations = [],
    selectedId = null,
    onselect
  }: {
    observations?: Observation[]
    selectedId?: string | null
    onselect?: (id: string) => void
  } = $props()

  let sourceTypeFilter = $state('')
  let searchQuery = $state('')

  const sourceTypes: Observation['sourceType'][] = ['person', 'social_media', 'news', 'book', 'conversation', 'other']

  const sourceTypeIcons: Record<string, string> = {
    person: '👤',
    social_media: '📱',
    news: '📰',
    book: '📚',
    conversation: '💬',
    other: '📝',
  }

  const sourceTypeLabels: Record<string, string> = {
    person: 'Osoba',
    social_media: 'Social media',
    news: 'Newsy',
    book: 'Książka',
    conversation: 'Rozmowa',
    other: 'Inne',
  }

  let filtered = $derived(
    observations.filter(o => {
      if (sourceTypeFilter && o.sourceType !== sourceTypeFilter) return false
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        return (
          o.content.toLowerCase().includes(q) ||
          o.source.toLowerCase().includes(q) ||
          o.category.toLowerCase().includes(q) ||
          o.tags.some(t => t.toLowerCase().includes(q))
        )
      }
      return true
    })
  )

  function formatDate(ts: string) {
    const d = new Date(ts)
    return d.toLocaleDateString('pl-PL', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  function attentionColor(level: number) {
    if (level >= 0.7) return 'var(--sl-color-accent)'
    if (level >= 0.4) return '#f59e0b'
    return '#6b7280'
  }

  function truncate(text: string, len = 70) {
    return text.length > len ? text.slice(0, len) + '…' : text
  }
</script>

<Card class="journal">
  <CardHeader class="journal-head">
    <CardTitle class="text-base">Obserwacje</CardTitle>
    <Badge>{filtered.length}</Badge>
  </CardHeader>

  <div class="journal-filters">
    <select bind:value={sourceTypeFilter} class="filter-select">
      <option value="">Wszystkie źródła</option>
      {#each sourceTypes as st}
        <option value={st}>{sourceTypeLabels[st]}</option>
      {/each}
    </select>
    <Input
      type="text"
      value={searchQuery}
      oninput={(e) => searchQuery = e.currentTarget.value}
      placeholder="Szukaj w treści, źródle, tagach…"
    />
  </div>

  <div class="journal-list">
    {#if filtered.length === 0}
      <div class="journal-empty">
        <p>Brak obserwacji{searchQuery || sourceTypeFilter ? ' dla tych kryteriów' : ''}</p>
      </div>
    {:else}
      {#each filtered as obs (obs.id)}
        <button
          class="journal-entry"
          class:selected={obs.id === selectedId}
          onclick={() => onselect?.(obs.id)}
        >
          <div class="je-top">
            <span class="je-icon">{sourceTypeIcons[obs.sourceType] || '📝'}</span>
            <span class="je-text">{truncate(obs.content)}</span>
          </div>
          <div class="je-bottom">
            <span class="je-source">{obs.source}</span>
            <div class="je-right">
              <span class="je-date">{formatDate(obs.timestamp)}</span>
              <span class="je-attention" style="color: {attentionColor(obs.attentionLevel)}">
                {Math.round(obs.attentionLevel * 100)}%
              </span>
            </div>
          </div>
          <div class="je-bar">
            <div
              class="je-bar-fill"
              style="width: {obs.attentionLevel * 100}%; background: {attentionColor(obs.attentionLevel)}"
            ></div>
          </div>
        </button>
      {/each}
    {/if}
  </div>
</Card>

<style>
  .journal {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }

  .journal-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .journal-filters {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    padding: 0.5rem 1rem 0.75rem;
    border-bottom: 1px solid var(--sl-color-border);
  }

  .filter-select {
    background: var(--sl-color-gray-6);
    border: 1px solid var(--sl-color-gray-5);
    color: var(--sl-color-white);
    padding: 0.4rem 0.5rem;
    border-radius: 4px;
    font-size: 0.8rem;
    outline: none;
    transition: border-color 0.15s;
  }

  .filter-select:focus {
    border-color: var(--sl-color-accent);
  }

  .filter-select option {
    background: var(--sl-color-gray-6);
    color: var(--sl-color-white);
  }

  .journal-list {
    flex: 1;
    overflow-y: auto;
    padding: 0.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .journal-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
    padding: 2rem 1rem;
    text-align: center;
  }

  .journal-empty p {
    font-size: 0.85rem;
    color: var(--sl-color-gray-4);
    margin: 0;
  }

  .journal-entry {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    width: 100%;
    padding: 0.6rem 0.75rem;
    background: var(--sl-color-gray-6);
    border: 1px solid transparent;
    border-radius: 6px;
    cursor: pointer;
    text-align: left;
    color: inherit;
    font: inherit;
    transition: all 0.15s;
  }

  .journal-entry:hover {
    border-color: var(--sl-color-gray-4);
    background: var(--sl-color-gray-5);
  }

  .journal-entry.selected {
    border-color: var(--sl-color-accent);
    background: color-mix(in srgb, var(--sl-color-accent) 12%, var(--sl-color-gray-6));
  }

  .je-top {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .je-icon {
    font-size: 0.9rem;
    flex-shrink: 0;
    margin-top: 0.05rem;
  }

  .je-text {
    font-size: 0.82rem;
    line-height: 1.4;
    color: var(--sl-color-gray-1);
  }

  .je-bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }

  .je-source {
    font-size: 0.7rem;
    color: var(--sl-color-gray-4);
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .je-right {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-shrink: 0;
  }

  .je-date {
    font-size: 0.65rem;
    color: var(--sl-color-gray-4);
    white-space: nowrap;
  }

  .je-attention {
    font-size: 0.7rem;
    font-weight: 600;
    min-width: 2.5rem;
    text-align: right;
  }

  .je-bar {
    height: 2px;
    background: var(--sl-color-gray-5);
    border-radius: 1px;
    overflow: hidden;
  }

  .je-bar-fill {
    height: 100%;
    border-radius: 1px;
    transition: width 0.2s;
  }
</style>

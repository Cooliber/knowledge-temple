<script lang="ts">
  import { observations as db } from '$lib/db'
  import type { Observation, Belief } from '$lib/db'
  import OmegaFilter from './OmegaFilter.svelte'
  import { Card, CardHeader, CardTitle, CardFooter, Badge, Button } from '$lib/components/ui'

  let {
    observation,
    beliefs = [],
    onedit,
    ondelete,
    onlinkbelief
  }: {
    observation: Observation | null
    beliefs?: Belief[]
    onedit?: (obs: Observation) => void
    ondelete?: (id: string) => void
    onlinkbelief?: (obsId: string, beliefId: string) => void
  } = $props()

  let showLinkSelector = $state(false)

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

  let linkedBeliefTexts = $derived(
    observation
      ? observation.linkedBeliefs
          .map(id => beliefs.find(b => b.id === id))
          .filter((b): b is Belief => !!b)
      : []
  )

  let unlinkedBeliefs = $derived(
    observation
      ? beliefs.filter(b => !observation.linkedBeliefs.includes(b.id))
      : []
  )

  function formatDate(ts: string) {
    const d = new Date(ts)
    return d.toLocaleDateString('pl-PL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  function tagColor(i: number) {
    const colors = ['#7c3aed', '#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#14b8a6']
    return colors[i % colors.length]
  }
</script>

{#if observation}
  <Card>
    <CardHeader class="entry-head">
      <div class="entry-type-badge">
        <span class="et-icon">{sourceTypeIcons[observation.sourceType] || '📝'}</span>
        <span class="et-label">{sourceTypeLabels[observation.sourceType] || observation.sourceType}</span>
      </div>
      <span class="entry-date">{formatDate(observation.timestamp)}</span>
    </CardHeader>

    <div class="entry-content">
      <p class="entry-text">{observation.content}</p>
      {#if observation.rawContent}
        <details class="raw-toggle">
          <summary class="raw-summary">Treść źródłowa</summary>
          <pre class="raw-content">{observation.rawContent}</pre>
        </details>
      {/if}
    </div>

    <div class="entry-meta">
      <div class="meta-item">
        <span class="meta-label">Źródło</span>
        <span class="meta-value">{observation.source}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Kategoria</span>
        <Badge variant="outline" class="font-normal">{observation.category}</Badge>
      </div>
    </div>

    <div class="entry-section">
      <CardTitle class="section-label">Omega — poziom uwagi</CardTitle>
      <OmegaFilter
        attentionLevel={observation.attentionLevel}
      />
    </div>

    {#if observation.tags.length > 0}
      <div class="entry-section">
        <CardTitle class="section-label">Tagi</CardTitle>
        <div class="tags-row">
          {#each observation.tags as tag, i}
            <span class="tag-chip" style="background: {tagColor(i)}33; border-color: {tagColor(i)}">
              {tag}
            </span>
          {/each}
        </div>
      </div>
    {/if}

    <div class="entry-section">
      <CardTitle class="section-label">Powiązane przekonania ({linkedBeliefTexts.length})</CardTitle>
      {#if linkedBeliefTexts.length > 0}
        <div class="linked-beliefs">
          {#each linkedBeliefTexts as belief}
            <div class="linked-belief">
              <span class="lb-text">{belief.text}</span>
              <span class="lb-strength">{Math.round(belief.strength * 100)}%</span>
            </div>
          {/each}
        </div>
      {:else}
        <p class="empty-hint">Brak powiązanych przekonań</p>
      {/if}

      {#if unlinkedBeliefs.length > 0}
        <Button
          variant="outline"
          size="sm"
          onclick={() => showLinkSelector = !showLinkSelector}
        >
          {showLinkSelector ? 'Zamknij' : '+ Połącz z przekonaniem'}
        </Button>

        {#if showLinkSelector}
          <div class="link-selector">
            {#each unlinkedBeliefs as belief}
              <button
                class="link-option"
                onclick={() => {
                  onlinkbelief?.(observation.id, belief.id)
                  showLinkSelector = false
                }}
              >
                <span class="lo-text">{belief.text}</span>
                <span class="lo-strength" style="opacity: {belief.strength}">
                  {Math.round(belief.strength * 100)}%
                </span>
              </button>
            {/each}
          </div>
        {/if}
      {/if}
    </div>

    <CardFooter class="entry-actions">
      <Button variant="outline" onclick={() => onedit?.(observation)}>
        Edytuj
      </Button>
      <Button variant="destructive" onclick={() => ondelete?.(observation.id)}>
        Usuń
      </Button>
    </CardFooter>
  </Card>
{:else}
  <Card class="flex flex-col items-center justify-center h-full min-h-[300px] text-center p-8">
    <div class="text-4xl mb-3 opacity-50">👁️</div>
    <CardTitle class="text-base text-muted mb-1">Wybierz obserwację</CardTitle>
    <p class="text-sm text-muted mt-0">Kliknij obserwację z listy, aby zobaczyć szczegóły</p>
  </Card>
{/if}

<style>
  .entry-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .entry-type-badge {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.3rem 0.6rem;
    background: color-mix(in srgb, var(--sl-color-accent) 15%, transparent);
    border-radius: 4px;
    font-size: 0.8rem;
  }

  .et-icon {
    font-size: 1rem;
  }

  .et-label {
    color: var(--sl-color-accent);
    font-weight: 500;
  }

  .entry-date {
    font-size: 0.75rem;
    color: var(--sl-color-gray-4);
  }

  .entry-content {
    padding: 0 1.5rem;
    margin-bottom: 1rem;
  }

  .entry-text {
    font-size: 0.95rem;
    line-height: 1.6;
    color: var(--sl-color-gray-1);
    margin: 0;
    white-space: pre-wrap;
  }

  .raw-toggle {
    margin-top: 0.75rem;
  }

  .raw-summary {
    font-size: 0.75rem;
    color: var(--sl-color-gray-4);
    cursor: pointer;
  }

  .raw-content {
    margin-top: 0.4rem;
    padding: 0.75rem;
    background: var(--sl-color-gray-6);
    border-radius: 4px;
    font-size: 0.8rem;
    color: var(--sl-color-gray-2);
    overflow-x: auto;
    white-space: pre-wrap;
  }

  .entry-meta {
    display: flex;
    gap: 1rem;
    margin: 0 1.5rem 1rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid var(--sl-color-border);
  }

  .meta-item {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }

  .meta-label {
    font-size: 0.7rem;
    color: var(--sl-color-gray-4);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .meta-value {
    font-size: 0.85rem;
    color: var(--sl-color-white);
  }

  .entry-section {
    padding: 0 1.5rem;
    margin-bottom: 1rem;
  }

  .section-label {
    font-size: 0.75rem;
    color: var(--sl-color-gray-4);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 0.5rem;
  }

  .tags-row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
  }

  .tag-chip {
    padding: 0.2rem 0.55rem;
    border: 1px solid;
    border-radius: 12px;
    font-size: 0.75rem;
    color: var(--sl-color-white);
    font-weight: 500;
  }

  .linked-beliefs {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .linked-belief {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.4rem 0.6rem;
    background: var(--sl-color-gray-6);
    border: 1px solid var(--sl-color-gray-5);
    border-radius: 4px;
  }

  .lb-text {
    font-size: 0.8rem;
    color: var(--sl-color-white);
    flex: 1;
  }

  .lb-strength {
    font-size: 0.7rem;
    color: var(--sl-color-accent);
    font-weight: 600;
    margin-left: 0.5rem;
  }

  .empty-hint {
    font-size: 0.8rem;
    color: var(--sl-color-gray-4);
    margin: 0.25rem 0;
  }

  .link-selector {
    margin-top: 0.5rem;
    max-height: 180px;
    overflow-y: auto;
    border: 1px solid var(--sl-color-border);
    border-radius: 4px;
    background: var(--sl-color-gray-6);
  }

  .link-option {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 0.4rem 0.6rem;
    background: none;
    border: none;
    border-bottom: 1px solid var(--sl-color-gray-5);
    color: var(--sl-color-white);
    font-size: 0.8rem;
    cursor: pointer;
    text-align: left;
    transition: background 0.15s;
  }

  .link-option:last-child {
    border-bottom: none;
  }

  .link-option:hover {
    background: color-mix(in srgb, var(--sl-color-accent) 15%, transparent);
  }

  .lo-text {
    flex: 1;
  }

  .lo-strength {
    font-size: 0.7rem;
    font-weight: 600;
    margin-left: 0.5rem;
  }

  .entry-actions {
    display: flex;
    gap: 0.5rem;
  }
</style>

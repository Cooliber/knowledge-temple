<script lang="ts">
  import { observations as db } from '$lib/db'
  import type { Observation, Belief } from '$lib/db'
  import OmegaFilter from './OmegaFilter.svelte'

  let {
    observation,
    beliefs = [],
    onsave,
    oncancel
  }: {
    observation?: Observation | null
    beliefs?: Belief[]
    onsave?: () => void
    oncancel?: () => void
  } = $props()

  let isEdit = $derived(!!observation)

  let formContent = $state(observation?.content ?? '')
  let formSource = $state(observation?.source ?? '')
  let formSourceType = $state(observation?.sourceType ?? 'other')
  let formAttention = $state(observation?.attentionLevel ?? 0.5)
  let formCategory = $state(observation?.category ?? '')
  let formTags = $state(observation?.tags.join(', ') ?? '')
  let formLinked = $state<string[]>(observation?.linkedBeliefs ?? [])
  let saving = $state(false)

  let sourceTypes: Observation['sourceType'][] = ['person', 'social_media', 'news', 'book', 'conversation', 'other']

  const sourceTypeLabels: Record<string, string> = {
    person: 'Osoba',
    social_media: 'Social media',
    news: 'Newsy',
    book: 'Książka',
    conversation: 'Rozmowa',
    other: 'Inne',
  }

  function toggleLinkedBelief(beliefId: string) {
    if (formLinked.includes(beliefId)) {
      formLinked = formLinked.filter(id => id !== beliefId)
    } else {
      formLinked = [...formLinked, beliefId]
    }
  }

  async function handleSave() {
    if (!formContent.trim()) return
    saving = true

    const data = {
      content: formContent.trim(),
      source: formSource.trim() || 'nieznane',
      sourceType: formSourceType,
      attentionLevel: formAttention,
      category: formCategory.trim() || 'ogólne',
      tags: formTags.split(',').map(t => t.trim()).filter(Boolean),
      linkedBeliefs: formLinked,
    }

    if (isEdit && observation) {
      await db.updateObservation(observation.id, data)
    } else {
      await db.createObservation({ ...data, timestamp: new Date().toISOString() } as any)
    }

    saving = false
    onsave?.()
  }

  function handleCancel() {
    oncancel?.()
  }
</script>

<div class="obs-form mh-card mh-animate mh-animate-d3">
  <h2 class="form-title">{isEdit ? 'Edytuj obserwację' : 'Nowa obserwacja'}</h2>

  <div class="form-group">
    <label class="form-label" for="obs-content">Treść</label>
    <textarea
      id="obs-content"
      bind:value={formContent}
      class="mh-input"
      placeholder="Co zaobserwowałeś/aś?"
      rows={5}
    ></textarea>
  </div>

  <div class="form-row">
    <div class="form-group flex-1">
      <label class="form-label" for="obs-source">Źródło</label>
      <input
        id="obs-source"
        type="text"
        bind:value={formSource}
        class="mh-input"
        placeholder="np. rozmowa z Anną, artykuł z X"
      />
    </div>
    <div class="form-group flex-1">
      <label class="form-label" for="obs-category">Kategoria</label>
      <input
        id="obs-category"
        type="text"
        bind:value={formCategory}
        class="mh-input"
        placeholder="np. psychologia, polityka"
      />
    </div>
  </div>

  <div class="form-group">
    <label class="form-label">Typ źródła</label>
    <div class="radio-group">
      {#each sourceTypes as st}
        <label class="radio-item" class:active={formSourceType === st}>
          <input
            type="radio"
            value={st}
            bind:group={formSourceType}
            class="radio-input"
          />
          <span>{sourceTypeLabels[st]}</span>
        </label>
      {/each}
    </div>
  </div>

  <div class="form-group">
    <label class="form-label">Omega — współczynnik uwagi</label>
    <OmegaFilter
      attentionLevel={formAttention}
      onchange={(v) => formAttention = v}
    />
  </div>

  <div class="form-group">
    <label class="form-label" for="obs-tags">Tagi (oddzielone przecinkami)</label>
    <input
      id="obs-tags"
      type="text"
      bind:value={formTags}
      class="mh-input"
      placeholder="np. ważne, praca, rodzina"
    />
  </div>

  {#if beliefs.length > 0}
    <div class="form-group">
      <label class="form-label">Powiązane przekonania</label>
      <div class="beliefs-grid">
        {#each beliefs as belief (belief.id)}
          <label
            class="belief-chip"
            class:selected={formLinked.includes(belief.id)}
          >
            <input
              type="checkbox"
              checked={formLinked.includes(belief.id)}
              onchange={() => toggleLinkedBelief(belief.id)}
              class="belief-checkbox"
            />
            <span class="belief-text">{belief.text}</span>
            <span class="belief-strength" style="opacity: {belief.strength}">
              {Math.round(belief.strength * 100)}%
            </span>
          </label>
        {/each}
      </div>
    </div>
  {/if}

  <div class="form-actions">
    <button class="mh-btn mh-btn-secondary" onclick={handleCancel}>
      Anuluj
    </button>
    <button
      class="mh-btn mh-btn-primary"
      onclick={handleSave}
      disabled={saving || !formContent.trim()}
    >
      {saving ? 'Zapisywanie…' : isEdit ? 'Zapisz zmiany' : 'Dodaj obserwację'}
    </button>
  </div>
</div>

<style>
  .obs-form {
    padding: 1.25rem;
  }

  .form-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--mh-text);
    margin: 0 0 1rem;
  }

  .form-group {
    margin-bottom: 1rem;
  }

  .form-label {
    display: block;
    font-size: 0.8rem;
    color: var(--mh-text-secondary);
    margin-bottom: 0.35rem;
    font-weight: 500;
  }



  .form-row {
    display: flex;
    gap: 0.75rem;
  }

  .flex-1 {
    flex: 1;
  }

  .radio-group {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
  }

  .radio-item {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    padding: 0.35rem 0.65rem;
    background: var(--mh-bg-card);
    border: 1px solid var(--mh-bg-elevated);
    border-radius: 4px;
    font-size: 0.8rem;
    color: var(--mh-text-secondary);
    cursor: pointer;
    transition: all 0.15s;
  }

  .radio-item.active {
    background: color-mix(in srgb, var(--mh-accent) 20%, transparent);
    border-color: var(--mh-accent);
    color: var(--mh-text);
  }

  .radio-input {
    display: none;
  }

  .beliefs-grid {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    max-height: 200px;
    overflow-y: auto;
  }

  .belief-chip {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.4rem 0.6rem;
    background: var(--mh-bg-card);
    border: 1px solid var(--mh-bg-elevated);
    border-radius: 4px;
    font-size: 0.8rem;
    cursor: pointer;
    transition: all 0.15s;
  }

  .belief-chip.selected {
    background: color-mix(in srgb, var(--mh-accent) 20%, transparent);
    border-color: var(--mh-accent);
  }

  .belief-checkbox {
    accent-color: var(--mh-accent);
  }

  .belief-text {
    color: var(--mh-text);
    flex: 1;
  }

  .belief-strength {
    color: var(--mh-accent);
    font-size: 0.7rem;
    font-weight: 600;
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    margin-top: 1.25rem;
    padding-top: 0.75rem;
    border-top: 1px solid var(--mh-border);
  }

  .btn:disabled,
  .mh-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
</style>

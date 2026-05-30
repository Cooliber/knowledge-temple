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

<div class="obs-form">
  <h2 class="form-title">{isEdit ? 'Edytuj obserwację' : 'Nowa obserwacja'}</h2>

  <div class="form-group">
    <label class="form-label" for="obs-content">Treść</label>
    <textarea
      id="obs-content"
      bind:value={formContent}
      class="form-textarea"
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
        class="form-input"
        placeholder="np. rozmowa z Anną, artykuł z X"
      />
    </div>
    <div class="form-group flex-1">
      <label class="form-label" for="obs-category">Kategoria</label>
      <input
        id="obs-category"
        type="text"
        bind:value={formCategory}
        class="form-input"
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
      class="form-input"
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
    <button class="btn btn-secondary" onclick={handleCancel}>
      Anuluj
    </button>
    <button
      class="btn btn-primary"
      onclick={handleSave}
      disabled={saving || !formContent.trim()}
    >
      {saving ? 'Zapisywanie…' : isEdit ? 'Zapisz zmiany' : 'Dodaj obserwację'}
    </button>
  </div>
</div>

<style>
  .obs-form {
    background: var(--sl-color-bg-card);
    border: 1px solid var(--sl-color-border);
    border-radius: 8px;
    padding: 1.25rem;
  }

  .form-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--sl-color-white);
    margin: 0 0 1rem;
  }

  .form-group {
    margin-bottom: 1rem;
  }

  .form-label {
    display: block;
    font-size: 0.8rem;
    color: var(--sl-color-gray-3);
    margin-bottom: 0.35rem;
    font-weight: 500;
  }

  .form-input,
  .form-textarea {
    width: 100%;
    background: var(--sl-color-gray-6);
    border: 1px solid var(--sl-color-gray-5);
    color: var(--sl-color-white);
    padding: 0.5rem;
    border-radius: 4px;
    font-size: 0.875rem;
    outline: none;
    box-sizing: border-box;
    transition: border-color 0.15s;
  }

  .form-input:focus,
  .form-textarea:focus {
    border-color: var(--sl-color-accent);
  }

  .form-textarea {
    resize: vertical;
    font-family: inherit;
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
    background: var(--sl-color-gray-6);
    border: 1px solid var(--sl-color-gray-5);
    border-radius: 4px;
    font-size: 0.8rem;
    color: var(--sl-color-gray-2);
    cursor: pointer;
    transition: all 0.15s;
  }

  .radio-item.active {
    background: color-mix(in srgb, var(--sl-color-accent) 20%, transparent);
    border-color: var(--sl-color-accent);
    color: var(--sl-color-white);
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
    background: var(--sl-color-gray-6);
    border: 1px solid var(--sl-color-gray-5);
    border-radius: 4px;
    font-size: 0.8rem;
    cursor: pointer;
    transition: all 0.15s;
  }

  .belief-chip.selected {
    background: color-mix(in srgb, var(--sl-color-accent) 20%, transparent);
    border-color: var(--sl-color-accent);
  }

  .belief-checkbox {
    accent-color: var(--sl-color-accent);
  }

  .belief-text {
    color: var(--sl-color-white);
    flex: 1;
  }

  .belief-strength {
    color: var(--sl-color-accent);
    font-size: 0.7rem;
    font-weight: 600;
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    margin-top: 1.25rem;
    padding-top: 0.75rem;
    border-top: 1px solid var(--sl-color-border);
  }

  .btn {
    padding: 0.5rem 1rem;
    border-radius: 6px;
    border: none;
    font-size: 0.875rem;
    cursor: pointer;
    font-weight: 500;
    transition: opacity 0.15s;
  }

  .btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .btn-primary {
    background: var(--sl-color-accent);
    color: white;
  }

  .btn-primary:hover:not(:disabled) {
    opacity: 0.9;
  }

  .btn-secondary {
    background: var(--sl-color-gray-5);
    color: var(--sl-color-white);
  }

  .btn-secondary:hover {
    background: var(--sl-color-gray-4);
  }
</style>

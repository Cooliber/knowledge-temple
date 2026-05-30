<script lang="ts">
  import { observations as db } from '$lib/db'
  import type { Observation, Belief } from '$lib/db'
  import OmegaFilter from './OmegaFilter.svelte'
  import { Button, Card, CardHeader, CardTitle, CardContent, CardFooter, Input, Label } from '$lib/components/ui'

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

<Card>
  <CardHeader>
    <CardTitle>{isEdit ? 'Edytuj obserwację' : 'Nowa obserwacja'}</CardTitle>
  </CardHeader>
  <CardContent>
    <div class="form-group">
      <Label for="obs-content">Treść</Label>
      <textarea
        id="obs-content"
        bind:value={formContent}
        placeholder="Co zaobserwowałeś/aś?"
        rows={5}
        class="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      ></textarea>
    </div>

    <div class="form-row">
      <div class="form-group flex-1">
        <Label for="obs-source">Źródło</Label>
        <Input
          id="obs-source"
          type="text"
          value={formSource}
          oninput={(e) => formSource = e.currentTarget.value}
          placeholder="np. rozmowa z Anną, artykuł z X"
        />
      </div>
      <div class="form-group flex-1">
        <Label for="obs-category">Kategoria</Label>
        <Input
          id="obs-category"
          type="text"
          value={formCategory}
          oninput={(e) => formCategory = e.currentTarget.value}
          placeholder="np. psychologia, polityka"
        />
      </div>
    </div>

    <div class="form-group">
      <Label>Typ źródła</Label>
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
      <Label>Omega — współczynnik uwagi</Label>
      <OmegaFilter
        attentionLevel={formAttention}
        onchange={(v) => formAttention = v}
      />
    </div>

    <div class="form-group">
      <Label for="obs-tags">Tagi (oddzielone przecinkami)</Label>
      <Input
        id="obs-tags"
        type="text"
        value={formTags}
        oninput={(e) => formTags = e.currentTarget.value}
        placeholder="np. ważne, praca, rodzina"
      />
    </div>

    {#if beliefs.length > 0}
      <div class="form-group">
        <Label>Powiązane przekonania</Label>
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
  </CardContent>
  <CardFooter class="flex justify-end gap-2 border-t pt-4">
    <Button variant="outline" onclick={handleCancel}>
      Anuluj
    </Button>
    <Button
      variant="default"
      onclick={handleSave}
      disabled={saving || !formContent.trim()}
    >
      {saving ? 'Zapisywanie…' : isEdit ? 'Zapisz zmiany' : 'Dodaj obserwację'}
    </Button>
  </CardFooter>
</Card>

<style>
  .form-group {
    margin-bottom: 1rem;
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
</style>

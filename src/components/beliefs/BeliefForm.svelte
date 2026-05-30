<script lang="ts">
  import type { Belief } from '$lib/db'

  let {
    belief,
    onsave,
    oncancel,
  }: {
    belief?: Belief
    onsave: (data: any) => void
    oncancel: () => void
  } = $props()

  let text = $state(belief?.text ?? '')
  let strength = $state(belief ? Math.round(belief.strength * 100) : 50)
  let type = $state<'first_order' | 'second_order' | 'third_order'>(belief?.type ?? 'first_order')
  let subject = $state(belief?.subject ?? '')
  let category = $state(belief?.category ?? '')
  let tags = $state<string[]>(belief?.tags ?? [])
  let tagInputEl = $state<HTMLInputElement | null>(null)

  let strengthDisplay = $derived(`${strength}%`)

  function addTag(value: string) {
    const trimmed = value.trim()
    if (trimmed && !tags.includes(trimmed)) {
      tags = [...tags, trimmed]
    }
  }

  function removeTag(tag: string) {
    tags = tags.filter(t => t !== tag)
  }

  function handleTagInput() {
    if (!tagInputEl) return
    const val = tagInputEl.value
    if (val.includes(',') || val.includes(';')) {
      const parts = val.split(/[,;]/)
      for (const part of parts.slice(0, -1)) {
        addTag(part)
      }
      tagInputEl.value = parts[parts.length - 1].trim()
    }
  }

  function handleTagKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (tagInputEl?.value) {
        addTag(tagInputEl.value)
        tagInputEl.value = ''
      }
    }
    if (e.key === ',' || e.key === ';') {
      e.preventDefault()
      if (tagInputEl?.value) {
        addTag(tagInputEl.value)
        tagInputEl.value = ''
      }
    }
    if (e.key === 'Backspace' && tagInputEl && !tagInputEl.value && tags.length > 0) {
      tags = tags.slice(0, -1)
    }
  }

  function handleSubmit(e: Event) {
    e.preventDefault()
    onsave({
      text: text.trim(),
      strength: strength / 100,
      type,
      subject: type === 'first_order' ? undefined : subject.trim() || undefined,
      category: category.trim(),
      tags,
    })
  }
</script>

<form class="belief-form" onsubmit={handleSubmit}>
  <h3 class="form-title">{belief ? 'Edytuj przekonanie' : 'Nowe przekonanie'}</h3>

  <div class="form-group">
    <label class="form-label" for="belief-text">Treść przekonania</label>
    <textarea
      id="belief-text"
      class="form-textarea"
      bind:value={text}
      placeholder="Np. Ufam, że ludzie są z natury dobrzy..."
      rows={4}
      required
    ></textarea>
  </div>

  <div class="form-group">
    <label class="form-label">
      Siła przekonania: <span class="slider-value">{strengthDisplay}</span>
    </label>
    <div class="slider-row">
      <span class="slider-end">Słabe</span>
      <input
        type="range"
        min="0"
        max="100"
        bind:value={strength}
        class="strength-slider"
      />
      <span class="slider-end">Silne</span>
    </div>
    <div class="strength-bar-track">
      <div class="strength-bar-fill" style="width: {strength}%"></div>
    </div>
  </div>

  <div class="form-group">
    <label class="form-label">Typ przekonania</label>
    <div class="radio-group">
      {#each [
        { value: 'first_order' as const, label: '1. rzędu — o świecie', desc: 'Podstawowe przekonanie o rzeczywistości' },
        { value: 'second_order' as const, label: '2. rzędu — o innych', desc: 'Przekonanie o tym, co ktoś myśli' },
        { value: 'third_order' as const, label: '3. rzędu — o relacjach', desc: 'Przekonanie o tym, co ktoś myśli, że ktoś myśli' },
      ] as opt}
        <label class="radio-option" class:active={type === opt.value}>
          <input type="radio" name="type" value={opt.value} bind:group={type} />
          <div class="radio-content">
            <span class="radio-label">{opt.label}</span>
            <span class="radio-desc">{opt.desc}</span>
          </div>
        </label>
      {/each}
    </div>
  </div>

  {#if type !== 'first_order'}
    <div class="form-group">
      <label class="form-label" for="belief-subject">O kim?</label>
      <input
        id="belief-subject"
        type="text"
        class="form-input"
        bind:value={subject}
        placeholder="Imię lub nazwa osoby"
      />
    </div>
  {/if}

  <div class="form-group">
    <label class="form-label" for="belief-category">Kategoria</label>
    <input
      id="belief-category"
      type="text"
      class="form-input"
      bind:value={category}
      placeholder="Np. relacje, praca, zdrowie..."
    />
  </div>

  <div class="form-group">
    <label class="form-label">Tagi</label>
    <div class="tags-input-wrapper">
      {#each tags as tag}
        <span class="tag-chip">
          {tag}
          <button type="button" class="tag-remove" onclick={() => removeTag(tag)}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round">
              <path d="M18 6 6 18"/>
              <path d="m6 6 12 12"/>
            </svg>
          </button>
        </span>
      {/each}
      <input
        type="text"
        class="tag-input"
        placeholder={tags.length === 0 ? 'Dodaj tag, naciśnij Enter...' : ''}
        bind:this={tagInputEl}
        oninput={handleTagInput}
        onkeydown={handleTagKeydown}
      />
    </div>
  </div>

  <div class="form-actions">
    <button type="submit" class="btn btn-primary">
      {belief ? 'Zapisz zmiany' : 'Utwórz przekonanie'}
    </button>
    <button type="button" class="btn btn-outline" onclick={oncancel}>
      Anuluj
    </button>
  </div>
</form>

<style>
  .belief-form {
    background: var(--sl-color-bg-card);
    border: 1px solid var(--sl-color-border);
    border-radius: 8px;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .form-title {
    font-size: 1.125rem;
    font-weight: 700;
    color: var(--sl-color-white);
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
  }

  .form-label {
    font-size: 0.8125rem;
    font-weight: 500;
    color: var(--sl-color-gray-2);
  }

  .form-textarea {
    background: var(--sl-color-black);
    border: 1px solid var(--sl-color-border);
    border-radius: 6px;
    padding: 0.625rem 0.75rem;
    color: var(--sl-color-text);
    font-size: 0.875rem;
    font-family: inherit;
    line-height: 1.5;
    outline: none;
    resize: vertical;
    min-height: 80px;
    transition: border-color 0.15s;
  }

  .form-textarea:focus {
    border-color: var(--sl-color-accent);
  }

  .form-input {
    background: var(--sl-color-black);
    border: 1px solid var(--sl-color-border);
    border-radius: 6px;
    padding: 0.5rem 0.75rem;
    color: var(--sl-color-text);
    font-size: 0.875rem;
    outline: none;
    transition: border-color 0.15s;
  }

  .form-input:focus {
    border-color: var(--sl-color-accent);
  }

  .slider-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .slider-end {
    font-size: 0.75rem;
    color: var(--sl-color-gray-4);
    white-space: nowrap;
    min-width: 3rem;
  }

  .slider-end:last-child {
    text-align: right;
  }

  .slider-value {
    color: var(--sl-color-accent-high);
    font-weight: 600;
  }

  .strength-slider {
    flex: 1;
    -webkit-appearance: none;
    appearance: none;
    height: 6px;
    background: var(--sl-color-gray-5);
    border-radius: 3px;
    outline: none;
    cursor: pointer;
  }

  .strength-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--sl-color-accent);
    cursor: pointer;
    border: 2px solid var(--sl-color-white);
  }

  .strength-slider::-moz-range-thumb {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--sl-color-accent);
    cursor: pointer;
    border: 2px solid var(--sl-color-white);
  }

  .strength-bar-track {
    height: 4px;
    background: var(--sl-color-gray-5);
    border-radius: 2px;
    overflow: hidden;
  }

  .strength-bar-fill {
    height: 100%;
    background: var(--sl-color-accent);
    border-radius: 2px;
    transition: width 0.15s;
  }

  .radio-group {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
  }

  .radio-option {
    display: flex;
    align-items: flex-start;
    gap: 0.625rem;
    padding: 0.625rem 0.75rem;
    background: var(--sl-color-black);
    border: 1px solid var(--sl-color-border);
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.15s;
  }

  .radio-option.active {
    border-color: var(--sl-color-accent);
    background: rgba(124, 58, 237, 0.08);
  }

  .radio-option input[type="radio"] {
    accent-color: var(--sl-color-accent);
    margin-top: 0.125rem;
  }

  .radio-content {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }

  .radio-label {
    font-size: 0.8125rem;
    font-weight: 500;
    color: var(--sl-color-white);
  }

  .radio-desc {
    font-size: 0.75rem;
    color: var(--sl-color-gray-4);
  }

  .tags-input-wrapper {
    display: flex;
    flex-wrap: wrap;
    gap: 0.375rem;
    padding: 0.5rem;
    background: var(--sl-color-black);
    border: 1px solid var(--sl-color-border);
    border-radius: 6px;
    transition: border-color 0.15s;
  }

  .tags-input-wrapper:focus-within {
    border-color: var(--sl-color-accent);
  }

  .tag-chip {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.125rem 0.375rem;
    font-size: 0.75rem;
    background: rgba(124, 58, 237, 0.15);
    color: var(--sl-color-accent-high);
    border-radius: 4px;
    white-space: nowrap;
  }

  .tag-remove {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    border: none;
    background: transparent;
    color: var(--sl-color-accent-high);
    cursor: pointer;
    padding: 0;
    opacity: 0.7;
    transition: opacity 0.15s;
  }

  .tag-remove:hover {
    opacity: 1;
  }

  .tag-input {
    flex: 1;
    min-width: 120px;
    border: none;
    background: transparent;
    color: var(--sl-color-text);
    font-size: 0.8125rem;
    outline: none;
    padding: 0.125rem 0;
  }

  .tag-input::placeholder {
    color: var(--sl-color-gray-5);
  }

  .form-actions {
    display: flex;
    gap: 0.75rem;
    padding-top: 0.5rem;
  }

  .btn {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
    font-weight: 500;
    border-radius: 6px;
    border: none;
    cursor: pointer;
    transition: all 0.15s;
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
    border-color: var(--sl-color-gray-4);
    color: var(--sl-color-white);
  }
</style>

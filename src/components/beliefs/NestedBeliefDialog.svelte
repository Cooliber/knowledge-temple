<script lang="ts">
  import type { Belief } from '$lib/db'

  let {
    show = false,
    parentBelief,
    onsave,
    oncancel,
  }: {
    show?: boolean
    parentBelief?: Belief | null
    onsave: (data: any) => void
    oncancel: () => void
  } = $props()

  let subject = $state('')
  let text = $state('')
  let strength = $state(50)

  let inferredType = $derived(
    parentBelief?.type === 'second_order' ? 'third_order' : 'second_order'
  )

  let strengthDisplay = $derived(`${strength}%`)

  $effect(() => {
    if (show && parentBelief) {
      if (parentBelief.subject) {
        subject = parentBelief.subject
      } else {
        subject = ''
      }
      text = ''
      strength = 50
    }
  })

  function handleSubmit(e: Event) {
    e.preventDefault()
    onsave({
      text: text.trim(),
      strength: strength / 100,
      type: inferredType,
      subject: subject.trim() || undefined,
      category: parentBelief?.category ?? '',
      tags: [],
    })
  }

  function handleOverlayClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      oncancel()
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      oncancel()
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if show}
  <div class="modal-overlay" onclick={handleOverlayClick} role="dialog" aria-modal="true">
    <div class="modal-content">
      <div class="modal-header">
        <h3 class="modal-title">
          Nowe przekonanie {inferredType === 'second_order' ? '2.' : '3.'} rzędu
        </h3>
        <p class="modal-subtitle">
          {#if parentBelief}
            Na podstawie: <em>"{parentBelief.text}"</em>
          {:else}
            Utwórz zagnieżdżone przekonanie o innej osobie
          {/if}
        </p>
      </div>

      <form class="modal-form" onsubmit={handleSubmit}>
        <div class="form-group">
          <label class="form-label" for="nested-subject">O kim?</label>
          <input
            id="nested-subject"
            type="text"
            class="form-input"
            bind:value={subject}
            placeholder="Imię lub nazwa osoby"
            required
          />
        </div>

        <div class="form-group">
          <label class="form-label" for="nested-text">
            Co {subject ? `${subject} ` : ''}{inferredType === 'second_order' ? 'myśli?' : 'myśli, że ktoś myśli?'}
          </label>
          <textarea
            id="nested-text"
            class="form-textarea"
            bind:value={text}
            placeholder="Treść przekonania..."
            rows={3}
            required
          ></textarea>
        </div>

        <div class="form-group">
          <label class="form-label">
            Siła przekonania: <span class="slider-value">{strengthDisplay}</span>
          </label>
          <input
            type="range"
            min="0"
            max="100"
            bind:value={strength}
            class="strength-slider"
          />
          <div class="strength-bar-track">
            <div class="strength-bar-fill" style="width: {strength}%"></div>
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary">Utwórz</button>
          <button type="button" class="btn btn-outline" onclick={oncancel}>Anuluj</button>
        </div>
      </form>
    </div>
  </div>
{/if}

<style>
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
    backdrop-filter: blur(2px);
  }

  .modal-content {
    width: 100%;
    max-width: 480px;
    background: var(--sl-color-bg-card);
    border: 1px solid var(--sl-color-border);
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  }

  .modal-header {
    padding: 1.25rem 1.5rem 0.75rem;
    border-bottom: 1px solid var(--sl-color-border);
  }

  .modal-title {
    font-size: 1.0625rem;
    font-weight: 700;
    color: var(--sl-color-white);
  }

  .modal-subtitle {
    font-size: 0.8rem;
    color: var(--sl-color-gray-4);
    margin-top: 0.25rem;
  }

  .modal-subtitle em {
    color: var(--sl-color-gray-2);
    font-style: normal;
  }

  .modal-form {
    padding: 1.25rem 1.5rem 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
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

  .form-textarea {
    background: var(--sl-color-black);
    border: 1px solid var(--sl-color-border);
    border-radius: 6px;
    padding: 0.5rem 0.75rem;
    color: var(--sl-color-text);
    font-size: 0.875rem;
    font-family: inherit;
    line-height: 1.5;
    outline: none;
    resize: vertical;
    min-height: 60px;
    transition: border-color 0.15s;
  }

  .form-textarea:focus {
    border-color: var(--sl-color-accent);
  }

  .slider-value {
    color: var(--sl-color-accent-high);
    font-weight: 600;
  }

  .strength-slider {
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

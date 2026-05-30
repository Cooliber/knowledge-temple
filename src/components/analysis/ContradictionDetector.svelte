<script lang="ts">
  import type { Belief } from '$lib/db'

  let { beliefs }: { beliefs: Belief[] } = $props()

  let beliefAId: string = $state('')
  let beliefBId: string = $state('')
  let result: string = $state('')

  let beliefA = $derived(beliefs.find(b => b.id === beliefAId) || null)
  let beliefB = $derived(beliefs.find(b => b.id === beliefBId) || null)

  let filteredBeliefs = $derived(beliefs.filter(b => b.id !== beliefAId))
  let filteredBeliefsB = $derived(beliefs.filter(b => b.id !== beliefBId))

  function check() {
    if (!beliefA || !beliefB) return
    result = 'Analiza sprzeczności wymaga integracji z modelem LLM. Wybrane przekonania zostaną przesłane do analizy.'
  }

  function reset() {
    beliefAId = ''
    beliefBId = ''
    result = ''
  }
</script>

<div class="contradiction-detector">
  <div class="selectors">
    <div class="selector-group">
      <label for="belief-a">Przekonanie A</label>
      <select id="belief-a" bind:value={beliefAId}>
        <option value="">Wybierz...</option>
        {#each filteredBeliefs as b}
          <option value={b.id}>{b.text}</option>
        {/each}
      </select>
      {#if beliefA}
        <div class="belief-preview">
          <span class="preview-category">{beliefA.category}</span>
          <span class="preview-type">{beliefA.type === 'first_order' ? 'I-rzędu' : beliefA.type === 'second_order' ? 'II-rzędu' : 'III-rzędu'}</span>
          <span class="preview-strength">{Math.round(beliefA.strength * 100)}%</span>
        </div>
      {/if}
    </div>

    <div class="selector-group">
      <label for="belief-b">Przekonanie B</label>
      <select id="belief-b" bind:value={beliefBId}>
        <option value="">Wybierz...</option>
        {#each filteredBeliefsB as b}
          <option value={b.id}>{b.text}</option>
        {/each}
      </select>
      {#if beliefB}
        <div class="belief-preview">
          <span class="preview-category">{beliefB.category}</span>
          <span class="preview-type">{beliefB.type === 'first_order' ? 'I-rzędu' : beliefB.type === 'second_order' ? 'II-rzędu' : 'III-rzędu'}</span>
          <span class="preview-strength">{Math.round(beliefB.strength * 100)}%</span>
        </div>
      {/if}
    </div>
  </div>

  <div class="actions">
    <button onclick={check} disabled={!beliefA || !beliefB} class="btn btn-primary">
      Sprawdź Sprzeczność
    </button>
    <button onclick={reset} class="btn btn-ghost">Reset</button>
  </div>

  {#if result}
    <div class="result-card">
      <h4>Wynik Analizy</h4>
      <div class="beliefs-comparison">
        <div class="belief-col">
          <div class="belief-text">{beliefA?.text}</div>
          <div class="belief-detail">Siła: {Math.round((beliefA?.strength ?? 0) * 100)}%</div>
          <div class="belief-detail">Kategoria: {beliefA?.category}</div>
        </div>
        <div class="vs">vs</div>
        <div class="belief-col">
          <div class="belief-text">{beliefB?.text}</div>
          <div class="belief-detail">Siła: {Math.round((beliefB?.strength ?? 0) * 100)}%</div>
          <div class="belief-detail">Kategoria: {beliefB?.category}</div>
        </div>
      </div>
      <p class="result-message">{result}</p>
    </div>
  {:else}
    <p class="empty-state">Wybierz dwa przekonania do analizy</p>
  {/if}
</div>

<style>
  .contradiction-detector {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .selectors {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .selector-group {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
  }

  .selector-group label {
    font-size: 0.75rem;
    color: var(--sl-color-gray-3);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .selector-group select {
    padding: 0.5rem 0.75rem;
    background: var(--sl-color-gray-7);
    border: 1px solid var(--sl-color-border);
    border-radius: 6px;
    color: var(--sl-color-text);
    font-size: 0.875rem;
  }

  .selector-group select:focus {
    outline: none;
    border-color: var(--sl-color-accent);
  }

  .belief-preview {
    display: flex;
    gap: 0.5rem;
    padding: 0.375rem 0.5rem;
    background: var(--sl-color-gray-7);
    border-radius: 4px;
    font-size: 0.75rem;
  }

  .preview-category {
    color: var(--sl-color-accent-high);
    font-weight: 600;
  }

  .preview-type {
    color: var(--sl-color-gray-4);
  }

  .preview-strength {
    color: var(--sl-color-gray-3);
    margin-left: auto;
  }

  .actions {
    display: flex;
    gap: 0.5rem;
  }

  .btn {
    padding: 0.5rem 1rem;
    border-radius: 6px;
    font-size: 0.8125rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;
    border: none;
  }

  .btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .btn-primary {
    background: var(--sl-color-accent);
    color: #fff;
  }

  .btn-primary:hover:not(:disabled) {
    background: #6d28d9;
  }

  .btn-ghost {
    background: transparent;
    color: var(--sl-color-gray-3);
    border: 1px solid var(--sl-color-border);
  }

  .btn-ghost:hover {
    background: var(--sl-color-gray-7);
    color: var(--sl-color-white);
  }

  .result-card {
    background: var(--sl-color-gray-7);
    border: 1px solid var(--sl-color-border);
    border-radius: 8px;
    padding: 1rem;
  }

  .result-card h4 {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--sl-color-white);
    margin-bottom: 0.75rem;
  }

  .beliefs-comparison {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    gap: 1rem;
    align-items: center;
    margin-bottom: 1rem;
  }

  .belief-col {
    background: var(--sl-color-bg-card);
    border: 1px solid var(--sl-color-border);
    border-radius: 6px;
    padding: 0.75rem;
  }

  .belief-text {
    font-size: 0.8125rem;
    color: var(--sl-color-text);
    font-weight: 500;
    margin-bottom: 0.375rem;
  }

  .belief-detail {
    font-size: 0.6875rem;
    color: var(--sl-color-gray-4);
  }

  .vs {
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--sl-color-gray-4);
    text-transform: uppercase;
  }

  .result-message {
    font-size: 0.8125rem;
    color: var(--sl-color-gray-3);
    font-style: italic;
  }

  .empty-state {
    color: var(--sl-color-gray-4);
    font-size: 0.875rem;
    text-align: center;
    padding: 3rem 1rem;
    font-style: italic;
  }
</style>

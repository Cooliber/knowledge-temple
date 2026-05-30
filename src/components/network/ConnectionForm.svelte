<script lang="ts">
  import type { NetworkNode, NetworkConnection } from '$lib/db/schema'

  let {
    nodes = [],
    sourceId = undefined,
    onsave,
    oncancel,
  }: {
    nodes: NetworkNode[]
    sourceId?: string
    onsave?: (data: Omit<NetworkConnection, 'id'>) => void
    oncancel?: () => void
  } = $props()

  let formSourceId = $state(sourceId ?? '')
  let formTargetId = $state('')
  let influenceStrength = $state(50)
  let connectionType: NetworkConnection['type'] = $state('trust')
  let bidirectional = $state(false)
  let error = $state('')

  const availableTargets = $derived(
    nodes.filter(n => n.id !== formSourceId)
  )

  const displayStrength = $derived(
    (influenceStrength / 100).toFixed(2)
  )

  function connectionTypeLabel(t: string) {
    return t === 'trust' ? 'Zaufanie' : t === 'expertise' ? 'Ekspertyza' : t === 'emotional' ? 'Emocjonalna' : 'Autorytet'
  }

  $effect(() => {
    if (sourceId) {
      formSourceId = sourceId
    }
  })

  function validate(): boolean {
    if (!formSourceId) { error = 'Wybierz źródło'; return false }
    if (!formTargetId) { error = 'Wybierz cel'; return false }
    if (formSourceId === formTargetId) { error = 'Źródło i cel muszą być różne'; return false }
    error = ''
    return true
  }

  function handleSubmit() {
    if (!validate()) return
    onsave?.({
      sourceId: formSourceId,
      targetId: formTargetId,
      influenceStrength: influenceStrength / 100,
      type: connectionType,
      bidirectional,
    })
  }

  function handleCancel() {
    oncancel?.()
  }
</script>

<div class="card">
  <h3>Nowe połączenie</h3>

  <div class="form-group">
    <label for="conn-source">Źródło (kto/wpływający)</label>
    <select id="conn-source" bind:value={formSourceId}>
      <option value="" disabled>— wybierz —</option>
      {#each nodes as n}
        <option value={n.id}>{n.name}</option>
      {/each}
    </select>
  </div>

  <div class="form-group">
    <label for="conn-target">Cel (kto/co podlega wpływowi)</label>
    <select id="conn-target" bind:value={formTargetId}>
      <option value="" disabled>— wybierz —</option>
      {#each availableTargets as n}
        <option value={n.id}>{n.name}</option>
      {/each}
    </select>
  </div>

  <div class="form-group">
    <label for="conn-strength">
      Siła wpływu: <strong>{displayStrength}</strong>
    </label>
    <div class="slider-wrapper">
      <span class="slider-label negative">-1.0</span>
      <input
        id="conn-strength"
        type="range"
        min="-100"
        max="100"
        bind:value={influenceStrength}
        class="influence-slider"
      />
      <span class="slider-label positive">+1.0</span>
    </div>
    <div class="slider-value-indicator" class:pos={influenceStrength > 0} class:neg={influenceStrength < 0}>
      {influenceStrength > 0 ? 'pozytywny' : influenceStrength < 0 ? 'negatywny' : 'neutralny'}
    </div>
  </div>

  <div class="form-group">
    <label>Typ połączenia</label>
    <div class="radio-group">
      {#each ['trust', 'expertise', 'emotional', 'authority'] as type}
        <label class="radio-label">
          <input
            type="radio"
            name="conn-type"
            value={type}
            checked={connectionType === type}
            onchange={() => connectionType = type as NetworkConnection['type']}
          />
          <span class="radio-text">
            {connectionTypeLabel(type)}
          </span>
        </label>
      {/each}
    </div>
  </div>

  <div class="form-group">
    <label class="checkbox-label">
      <input type="checkbox" bind:checked={bidirectional} />
      <span>Dwukierunkowe</span>
    </label>
  </div>

  {#if error}
    <div class="error">{error}</div>
  {/if}

  <div class="form-actions">
    <button class="btn btn-primary" onclick={handleSubmit}>Zapisz</button>
    <button class="btn" onclick={handleCancel}>Anuluj</button>
  </div>
</div>

<style>
  .card {
    background: var(--sl-color-bg-card);
    border: 1px solid var(--sl-color-border);
    border-radius: 8px;
    padding: 1rem;
  }

  .card h3 {
    margin: 0 0 1rem;
    font-size: 0.9375rem;
    font-weight: 600;
    color: var(--sl-color-white);
  }

  .form-group {
    margin-bottom: 1rem;
  }

  .form-group label {
    display: block;
    margin-bottom: 0.375rem;
    font-size: 0.8125rem;
    color: var(--sl-color-gray-3);
  }

  .form-group select,
  .form-group input[type="text"] {
    width: 100%;
    padding: 0.5rem 0.625rem;
    border-radius: 6px;
    border: 1px solid var(--sl-color-border);
    background: var(--sl-color-black);
    color: var(--sl-color-white);
    font-size: 0.875rem;
    box-sizing: border-box;
  }

  .form-group select:focus {
    outline: none;
    border-color: var(--sl-color-accent);
  }

  .slider-wrapper {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .slider-label {
    font-size: 0.6875rem;
    color: var(--sl-color-gray-5);
    flex-shrink: 0;
  }

  .slider-label.negative { color: #f87171; }
  .slider-label.positive { color: #4ade80; }

  .influence-slider {
    flex: 1;
    -webkit-appearance: none;
    appearance: none;
    height: 4px;
    border-radius: 2px;
    background: linear-gradient(to right, #f87171, var(--sl-color-gray-5), #4ade80);
    outline: none;
    cursor: pointer;
  }

  .influence-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--sl-color-accent);
    border: 2px solid var(--sl-color-white);
    cursor: pointer;
  }

  .influence-slider::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--sl-color-accent);
    border: 2px solid var(--sl-color-white);
    cursor: pointer;
  }

  .slider-value-indicator {
    margin-top: 0.25rem;
    font-size: 0.6875rem;
    color: var(--sl-color-gray-5);
  }

  .slider-value-indicator.pos { color: #4ade80; }
  .slider-value-indicator.neg { color: #f87171; }

  .radio-group {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .radio-label {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    cursor: pointer;
    padding: 0.375rem 0.625rem;
    border-radius: 6px;
    border: 1px solid var(--sl-color-border);
    background: var(--sl-color-black);
    transition: all 0.15s;
  }

  .radio-label:has(input:checked) {
    border-color: var(--sl-color-accent);
    background: var(--sl-color-accent)10;
  }

  .radio-label input {
    accent-color: var(--sl-color-accent);
  }

  .radio-text {
    font-size: 0.8125rem;
    color: var(--sl-color-gray-2);
  }

  .checkbox-label {
    display: flex !important;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
  }

  .checkbox-label input {
    accent-color: var(--sl-color-accent);
  }

  .checkbox-label span {
    font-size: 0.8125rem;
    color: var(--sl-color-gray-2);
  }

  .error {
    padding: 0.5rem 0.75rem;
    border-radius: 6px;
    background: #f8717115;
    border: 1px solid #f8717140;
    color: #f87171;
    font-size: 0.8125rem;
    margin-bottom: 0.75rem;
  }

  .form-actions {
    display: flex;
    gap: 0.5rem;
  }

  .btn {
    flex: 1;
    padding: 0.5rem 0.75rem;
    border-radius: 6px;
    border: 1px solid var(--sl-color-border);
    background: transparent;
    color: var(--sl-color-gray-3);
    font-size: 0.8125rem;
    cursor: pointer;
    transition: all 0.15s;
    text-align: center;
  }

  .btn:hover {
    background: var(--sl-color-gray-6);
    color: var(--sl-color-white);
  }

  .btn-primary {
    background: var(--sl-color-accent);
    color: var(--sl-color-white);
    border-color: var(--sl-color-accent);
  }

  .btn-primary:hover {
    background: var(--sl-color-accent-high);
    border-color: var(--sl-color-accent-high);
  }
</style>

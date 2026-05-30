<script lang="ts">
  import { Progress } from '$lib/components/ui'

  let { attentionLevel = 0.5, onchange }: {
    attentionLevel?: number
    onchange?: (value: number) => void
  } = $props()

  let sliderValue = $state(Math.round(attentionLevel * 100))

  $effect(() => {
    sliderValue = Math.round(attentionLevel * 100)
  })

  function handleInput(e: Event) {
    const t = e.target as HTMLInputElement
    sliderValue = parseInt(t.value)
    onchange?.(sliderValue / 100)
  }

  let pct = $derived(`${Math.round(attentionLevel * 100)}%`)
</script>

<div class="omega-filter">
  <div class="filter-labels">
    <span class="ll">Środowisko</span>
    <span class="lc">Ω filter</span>
    <span class="lr">Użytkownik</span>
  </div>
  <Progress value={attentionLevel * 100} class="h-3" />
  <div class="gauge-meta">
    <span class="gp">{pct}</span>
    <span class="gd">informacji przepuszczonej do modelu</span>
  </div>
  <div class="arrow-hint">
    <span class="ah-arrow">─── środowisko ──▶</span>
    <span class="ah-label">Ω = {pct}</span>
    <span class="ah-arrow">▶─── model ───</span>
  </div>
  <input
    type="range"
    min="0"
    max="100"
    value={sliderValue}
    oninput={handleInput}
    class="filter-slider"
  />
  <div class="slider-labels">
    <span>całkowicie odcięty</span>
    <span>pełna świadomość</span>
  </div>
</div>

<style>
  .omega-filter {
    background: var(--sl-color-bg-card);
    border: 1px solid var(--sl-color-border);
    border-radius: 8px;
    padding: 1rem;
  }

  .filter-labels {
    display: flex;
    justify-content: space-between;
    font-size: 0.7rem;
    color: var(--sl-color-gray-3);
    margin-bottom: 0.5rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .lc {
    color: var(--sl-color-accent);
    font-weight: 700;
    font-size: 0.8rem;
  }

  .gauge-meta {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.4rem;
    font-size: 0.75rem;
  }

  .gp {
    color: var(--sl-color-accent);
    font-weight: 700;
    font-size: 0.85rem;
  }

  .gd {
    color: var(--sl-color-gray-3);
  }

  .arrow-hint {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    margin-top: 0.75rem;
    font-size: 0.65rem;
    color: var(--sl-color-gray-4);
    font-family: monospace;
  }

  .ah-label {
    color: var(--sl-color-accent);
    font-weight: 700;
    font-size: 0.75rem;
    padding: 0.1rem 0.4rem;
    background: color-mix(in srgb, var(--sl-color-accent) 15%, transparent);
    border-radius: 4px;
  }

  .filter-slider {
    width: 100%;
    margin-top: 0.75rem;
    appearance: none;
    height: 4px;
    background: var(--sl-color-gray-6);
    border-radius: 2px;
    outline: none;
    cursor: pointer;
  }

  .filter-slider::-webkit-slider-thumb {
    appearance: none;
    width: 16px;
    height: 16px;
    background: var(--sl-color-accent);
    border-radius: 50%;
    cursor: pointer;
    border: 2px solid var(--sl-color-white);
  }

  .filter-slider::-moz-range-thumb {
    width: 16px;
    height: 16px;
    background: var(--sl-color-accent);
    border-radius: 50%;
    cursor: pointer;
    border: 2px solid var(--sl-color-white);
  }

  .slider-labels {
    display: flex;
    justify-content: space-between;
    font-size: 0.6rem;
    color: var(--sl-color-gray-4);
    margin-top: 0.25rem;
  }
</style>

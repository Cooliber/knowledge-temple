<script lang="ts">
  import type { Belief } from '$lib/db'

  let {
    supporting = [],
    blocking = [],
  }: {
    supporting: Belief[]
    blocking: Belief[]
  } = $props()

  function strengthWidth(s: number) {
    return Math.round(s * 100) + '%'
  }

  function strengthColor(s: number) {
    if (s < 0.4) return '#f87171'
    if (s < 0.7) return '#fbbf24'
    return '#4ade80'
  }
</script>

<div class="alignment">
  <div class="column">
    <h4 class="column-title supporting-title">
      Wspierające ({supporting.length})
    </h4>
    <div class="beliefs-list">
      {#each supporting as belief (belief.id)}
        <div class="belief-card supporting">
          <p class="belief-text">{belief.text}</p>
          <div class="strength-row">
            <div class="strength-bar">
              <div
                class="strength-fill"
                style="width: {strengthWidth(belief.strength)}; background: {strengthColor(belief.strength)}"
              ></div>
            </div>
            <span class="strength-label">
              {Math.round(belief.strength * 100)}%
            </span>
          </div>
        </div>
      {:else}
        <p class="empty">Brak wspierających przekonań</p>
      {/each}
    </div>
  </div>

  <div class="column">
    <h4 class="column-title blocking-title">
      Blokujące ({blocking.length})
    </h4>
    <div class="beliefs-list">
      {#each blocking as belief (belief.id)}
        <div class="belief-card blocking">
          <p class="belief-text">{belief.text}</p>
          <div class="strength-row">
            <div class="strength-bar">
              <div
                class="strength-fill"
                style="width: {strengthWidth(belief.strength)}; background: {strengthColor(belief.strength)}"
              ></div>
            </div>
            <span class="strength-label">
              {Math.round(belief.strength * 100)}%
            </span>
          </div>
        </div>
      {:else}
        <p class="empty">Brak blokujących przekonań</p>
      {/each}
    </div>
  </div>
</div>

<style>
  .alignment {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
  }

  @media (max-width: 600px) {
    .alignment {
      grid-template-columns: 1fr;
    }
  }

  .column {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .column-title {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .supporting-title {
    color: #4ade80;
  }

  .blocking-title {
    color: #f87171;
  }

  .beliefs-list {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
  }

  .belief-card {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
    padding: 0.5rem;
    border-radius: 6px;
    border: 1px solid var(--sl-color-border);
    background: var(--sl-color-gray-6);
  }

  .belief-card.supporting {
    border-color: color-mix(in srgb, #4ade80 40%, transparent);
    background: color-mix(in srgb, #4ade80 6%, var(--sl-color-gray-6));
  }

  .belief-card.blocking {
    border-color: color-mix(in srgb, #f87171 40%, transparent);
    background: color-mix(in srgb, #f87171 6%, var(--sl-color-gray-6));
  }

  .belief-text {
    font-size: 0.75rem;
    line-height: 1.4;
    color: var(--sl-color-gray-2);
  }

  .strength-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .strength-bar {
    flex: 1;
    height: 4px;
    background: var(--sl-color-gray-5);
    border-radius: 2px;
    overflow: hidden;
  }

  .strength-fill {
    height: 100%;
    border-radius: 2px;
    transition: width 0.3s;
  }

  .strength-label {
    font-size: 0.6875rem;
    color: var(--sl-color-gray-4);
    min-width: 3ch;
    text-align: right;
  }

  .empty {
    font-size: 0.75rem;
    color: var(--sl-color-gray-4);
    font-style: italic;
  }
</style>

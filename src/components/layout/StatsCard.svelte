<script lang="ts">
  let { title, value, subtitle, icon, color = 'var(--sl-color-accent)' }: {
    title: string
    value: string | number
    subtitle?: string
    icon?: string
    color?: string
  } = $props()
</script>

<div class="stats-card" style="--accent-color: {color}">
  {#if icon}
    <span class="card-icon">{icon}</span>
  {/if}
  <div class="card-body">
    <div class="card-title">{title}</div>
    <div class="card-value">{value}</div>
    {#if subtitle}
      <div class="card-subtitle">{subtitle}</div>
    {/if}
  </div>
</div>

<style>
  .stats-card {
    background: var(--sl-color-bg-card);
    border: 1px solid var(--sl-color-border);
    border-radius: 8px;
    padding: 1rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    border-left: 3px solid var(--accent-color);
  }
  .card-icon {
    font-size: 1.5rem;
    flex-shrink: 0;
    width: 2rem;
    text-align: center;
  }
  .card-body {
    flex: 1;
    min-width: 0;
  }
  .card-title {
    font-size: 0.75rem;
    color: var(--sl-color-gray-3);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-weight: 600;
  }
  .card-value {
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--sl-color-white);
    line-height: 1.2;
    margin-top: 0.125rem;
  }
  .card-subtitle {
    font-size: 0.75rem;
    color: var(--sl-color-accent-high);
    margin-top: 0.125rem;
  }
</style>

<script lang="ts">
  let {
    title = '',
    value = '',
    subtitle = '',
    icon = '',
    color = 'var(--mh-accent)',
  }: {
    title?: string
    value?: string | number
    subtitle?: string
    icon?: string
    color?: string
  } = $props()
</script>

<div class="double-bezel" style="--accent: {color}">
  <div class="inner">
    <div class="card-top">
      {#if icon}
        <span class="card-icon">{icon}</span>
      {/if}
      <span class="card-title">{title}</span>
    </div>
    <div class="card-value">{value}</div>
    {#if subtitle}
      <div class="card-subtitle">{subtitle}</div>
    {/if}
  </div>
</div>

<style>
  .double-bezel {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid var(--mh-border);
    border-radius: calc(var(--mh-radius) + 4px);
    padding: 1.5px;
    transition: all var(--mh-transition);
  }

  .double-bezel:hover {
    border-color: var(--mh-border-hover);
    background: rgba(255, 255, 255, 0.05);
  }

  .inner {
    background: var(--mh-bg-card);
    border-radius: var(--mh-radius);
    padding: 1.25rem;
    transition: background var(--mh-transition);
    border-left: 3px solid var(--accent);
  }

  .card-top {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }

  .card-icon {
    font-size: 0.875rem;
    opacity: 0.5;
  }

  .card-title {
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--mh-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .card-value {
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--mh-text);
    letter-spacing: -0.03em;
    line-height: 1;
    margin-bottom: 0.25rem;
  }

  .card-subtitle {
    font-size: 0.75rem;
    color: var(--mh-text-secondary);
  }
</style>

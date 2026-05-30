<script lang="ts">
  let { outcome = 'pending' }: { outcome: string } = $props()

  const labels: Record<string, string> = {
    positive: 'Pozytywny',
    negative: 'Negatywny',
    neutral: 'Neutralny',
    pending: 'Oczekuje',
  }

  const colors: Record<string, string> = {
    positive: '#4ade80',
    negative: '#f87171',
    neutral: '#9e9e9e',
    pending: '#fbbf24',
  }
</script>

<span
  class="outcome-badge"
  style="--badge-color: {colors[outcome] ?? '#9e9e9e'}"
>
  {labels[outcome] ?? outcome}
</span>

<style>
  .outcome-badge {
    display: inline-flex;
    align-items: center;
    padding: 0.2rem 0.6rem;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 600;
    background: color-mix(in srgb, var(--badge-color) 20%, transparent);
    color: var(--badge-color);
    border: 1px solid color-mix(in srgb, var(--badge-color) 40%, transparent);
  }
</style>

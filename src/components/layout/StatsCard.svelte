<script lang="ts">
  import { Card, CardHeader, CardTitle, CardContent } from '$lib/components/ui/index.js'

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

<Card class="border-l-[3px]" style="border-left-color: {color}">
  <CardHeader class="p-4 pb-0">
    <div class="flex items-center gap-2">
      {#if icon}
        <span class="text-sm opacity-50">{icon}</span>
      {/if}
      <CardTitle class="text-xs font-medium text-muted uppercase tracking-wider">{title}</CardTitle>
    </div>
  </CardHeader>
  <CardContent class="p-4 pt-1">
    <p class="text-[1.75rem] font-bold text-foreground -tracking-[0.03em] leading-none mb-1">{value}</p>
    {#if subtitle}
      <p class="text-xs text-muted">{subtitle}</p>
    {/if}
  </CardContent>
</Card>

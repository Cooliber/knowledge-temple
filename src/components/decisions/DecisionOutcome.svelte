<script lang="ts">
  import { Badge } from '$lib/components/ui'

  let { outcome = 'pending' }: { outcome: string } = $props()

  const labels: Record<string, string> = {
    positive: 'Pozytywny',
    negative: 'Negatywny',
    neutral: 'Neutralny',
    pending: 'Oczekuje',
  }

  const variants: Record<string, string> = {
    positive: 'success',
    negative: 'destructive',
    neutral: 'secondary',
    pending: 'warning',
  }
</script>

<Badge variant={variants[outcome] ?? 'secondary'}>
  {labels[outcome] ?? outcome}
</Badge>
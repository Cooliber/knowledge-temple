<script lang="ts">
  import { cn } from "$lib/utils.js"
  import type { HTMLAttributes } from "svelte/elements"

  let { class: className, children, ...rest }: {
    class?: string
    children?: import("svelte").Snippet
  } & HTMLAttributes<HTMLDivElement> = $props()
</script>

<div class={cn("rounded-xl border border-border bg-card-bg text-card-fg shadow-sm", className)} {...rest}>
  {#if children}{@render children()}{/if}
</div>

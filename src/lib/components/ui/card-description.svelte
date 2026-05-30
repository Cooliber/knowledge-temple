<script lang="ts">
  import { cn } from "$lib/utils.js"
  import type { HTMLAttributes } from "svelte/elements"

  let { class: className, children, ...rest }: {
    class?: string; children?: import("svelte").Snippet
  } & HTMLAttributes<HTMLDivElement> = $props()
</script>

<div data-slot="card-description" class={cn("text-muted text-sm", className)} {...rest}>
  {#if children}{@render children()}{/if}
</div>

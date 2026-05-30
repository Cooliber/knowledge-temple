<script lang="ts">
  import { cn } from "$lib/utils.js"
  import type { HTMLAttributes } from "svelte/elements"

  let { class: className, children, ...rest }: {
    class?: string; children?: import("svelte").Snippet
  } & HTMLAttributes<HTMLDivElement> = $props()
</script>

<div data-slot="card-action" class={cn("col-start-2 row-span-2 row-start-1 self-start justify-self-end", className)} {...rest}>
  {#if children}{@render children()}{/if}
</div>

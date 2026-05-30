<script lang="ts">
  import { cn } from "$lib/utils.js"
  import type { HTMLAttributes } from "svelte/elements"

  let { class: className, children, ...rest }: {
    class?: string; children?: import("svelte").Snippet
  } & HTMLAttributes<HTMLDivElement> = $props()
</script>

<div class={cn("flex flex-col space-y-1.5 p-6", className)} {...rest}>
  {#if children}{@render children()}{/if}
</div>

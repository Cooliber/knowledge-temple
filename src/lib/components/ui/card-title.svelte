<script lang="ts">
  import { cn } from "$lib/utils.js"
  import type { HTMLAttributes } from "svelte/elements"

  let { class: className, children, ...rest }: {
    class?: string; children?: import("svelte").Snippet
  } & HTMLAttributes<HTMLHeadingElement> = $props()
</script>

<h3 class={cn("font-semibold leading-none tracking-tight", className)} {...rest}>
  {#if children}{@render children()}{/if}
</h3>

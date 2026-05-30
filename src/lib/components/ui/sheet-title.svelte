<script lang="ts">
  import { cn } from "$lib/utils.js"
  import type { HTMLAttributes } from "svelte/elements"

  let { class: className, children, ...rest }: {
    class?: string; children?: import("svelte").Snippet
  } & HTMLAttributes<HTMLHeadingElement> = $props()
</script>

<h4 class={cn("text-lg font-semibold text-foreground", className)} {...rest}>
  {#if children}{@render children()}{/if}
</h4>

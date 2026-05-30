<script lang="ts">
  import { cn } from "$lib/utils.js"
  import type { HTMLAttributes } from "svelte/elements"

  let { class: className, children, ...rest }: {
    class?: string; children?: import("svelte").Snippet
  } & HTMLAttributes<HTMLParagraphElement> = $props()
</script>

<p class={cn("text-sm text-muted", className)} {...rest}>
  {#if children}{@render children()}{/if}
</p>

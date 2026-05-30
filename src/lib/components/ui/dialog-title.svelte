<script lang="ts">
  import { Dialog as DialogPrimitive } from "bits-ui"
  import type { HTMLAttributes } from "svelte/elements"
  import { cn } from "$lib/utils.js"

  let { class: className, children, ...rest }: {
    class?: string; children?: import("svelte").Snippet
  } & HTMLAttributes<HTMLHeadingElement> = $props()
</script>

<DialogPrimitive.Title class={cn("text-lg font-semibold leading-none tracking-tight", className)} {...rest}>
  {#if children}{@render children()}{/if}
</DialogPrimitive.Title>

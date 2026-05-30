<script lang="ts">
  import { Dialog as DialogPrimitive } from "bits-ui"
  import { cn } from "$lib/utils.js"
  import type { HTMLAttributes } from "svelte/elements"

  let { class: className, children, ...rest }: {
    class?: string; children?: import("svelte").Snippet
  } & HTMLAttributes<HTMLDivElement> = $props()
</script>

<DialogPrimitive.Header class={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...rest}>
  {#if children}{@render children()}{/if}
</DialogPrimitive.Header>

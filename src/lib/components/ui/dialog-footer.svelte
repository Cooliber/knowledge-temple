<script lang="ts">
  import { Dialog as DialogPrimitive } from "bits-ui"
  import { cn } from "$lib/utils.js"
  import type { HTMLAttributes } from "svelte/elements"

  let { class: className, children, ...rest }: {
    class?: string; children?: import("svelte").Snippet
  } & HTMLAttributes<HTMLDivElement> = $props()
</script>

<DialogPrimitive.Footer class={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...rest}>
  {#if children}{@render children()}{/if}
</DialogPrimitive.Footer>

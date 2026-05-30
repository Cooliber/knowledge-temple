<script lang="ts">
  import { Dialog as DialogPrimitive } from "bits-ui"
  import type { HTMLAttributes } from "svelte/elements"
  import { cn } from "$lib/utils.js"

  let { class: className, children, ...rest }: {
    class?: string; children?: import("svelte").Snippet
  } & HTMLAttributes<HTMLParagraphElement> = $props()
</script>

<DialogPrimitive.Description class={cn("text-sm text-muted", className)} {...rest}>
  {#if children}{@render children()}{/if}
</DialogPrimitive.Description>

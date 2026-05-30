<script lang="ts">
  import { Dialog as SheetPrimitive } from "bits-ui"
  import { cn } from "$lib/utils.js"

  let { class: className, children, ...rest }: {
    class?: string; children?: import("svelte").Snippet
  } & SheetPrimitive.TriggerProps = $props()
</script>

<SheetPrimitive.Trigger class={cn("", className)} {...rest}>
  {#if children}{@render children()}{/if}
</SheetPrimitive.Trigger>

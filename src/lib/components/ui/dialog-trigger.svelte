<script lang="ts">
  import { Dialog as DialogPrimitive } from "bits-ui"
  import { cn } from "$lib/utils.js"

  let {
    class: className,
    children,
    ...rest
  }: {
    class?: string
    children?: import("svelte").Snippet
  } & DialogPrimitive.TriggerProps = $props()
</script>

<DialogPrimitive.Trigger class={cn("", className)} {...rest}>
  {#if children}{@render children()}{/if}
</DialogPrimitive.Trigger>

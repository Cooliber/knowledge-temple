<script lang="ts">
  import { Dialog as SheetPrimitive } from "bits-ui"
  import { cn } from "$lib/utils.js"

  let {
    ref: ref = $bindable(null),
    class: className,
    children,
    open = $bindable(false),
    side = "right",
    ...rest
  }: {
    ref?: HTMLElement | null
    class?: string
    children?: import("svelte").Snippet
    open?: boolean
    side?: "left" | "right"
  } & SheetPrimitive.RootProps = $props()
</script>

<SheetPrimitive.Root bind:ref bind:open class={className} {...rest}>
  {#if children}{@render children()}{/if}
</SheetPrimitive.Root>

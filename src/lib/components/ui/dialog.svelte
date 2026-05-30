<script lang="ts">
  import { Dialog as DialogPrimitive } from "bits-ui"
  import { cn } from "$lib/utils.js"

  let {
    ref: ref = $bindable(null),
    class: className,
    children,
    open = $bindable(false),
    ...rest
  }: {
    ref?: HTMLElement | null
    class?: string
    children?: import("svelte").Snippet
    open?: boolean
  } & DialogPrimitive.RootProps = $props()
</script>

<DialogPrimitive.Root bind:ref bind:open class={className} {...rest}>
  {#if children}{@render children()}{/if}
</DialogPrimitive.Root>

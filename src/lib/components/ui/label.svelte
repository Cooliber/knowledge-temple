<script lang="ts">
  import { Label as LabelPrimitive } from "bits-ui"
  import { cn } from "$lib/utils.js"

  let {
    ref: ref = $bindable(null),
    class: className,
    children,
    ...rest
  }: {
    ref?: HTMLElement | null
    class?: string
    children?: import("svelte").Snippet
  } & LabelPrimitive.RootProps = $props()
</script>

<LabelPrimitive.Root
  bind:ref
  class={cn(
    "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
    className
  )}
  {...rest}
>
  {#if children}{@render children()}{/if}
</LabelPrimitive.Root>

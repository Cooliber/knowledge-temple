<script lang="ts">
  import { Tabs as TabsPrimitive } from "bits-ui"
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
  } & TabsPrimitive.ListProps = $props()
</script>

<TabsPrimitive.List
  bind:ref
  class={cn(
    "inline-flex h-10 items-center justify-center rounded-lg bg-muted/10 p-1 text-muted",
    className
  )}
  {...rest}
>
  {#if children}{@render children()}{/if}
</TabsPrimitive.List>

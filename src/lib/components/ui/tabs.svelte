<script lang="ts">
  import { Tabs as TabsPrimitive } from "bits-ui"
  import { cn } from "$lib/utils.js"

  let {
    ref: ref = $bindable(null),
    class: className,
    value = $bindable(""),
    children,
    ...rest
  }: {
    ref?: HTMLElement | null
    class?: string
    value?: string
    children?: import("svelte").Snippet
  } & TabsPrimitive.RootProps = $props()
</script>

<TabsPrimitive.Root
  bind:ref
  bind:value
  class={cn("w-full", className)}
  {...rest}
>
  {#if children}{@render children()}{/if}
</TabsPrimitive.Root>

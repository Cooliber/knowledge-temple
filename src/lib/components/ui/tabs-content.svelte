<script lang="ts">
  import { Tabs as TabsPrimitive } from "bits-ui"
  import { cn } from "$lib/utils.js"

  let {
    class: className,
    value,
    children,
    ...rest
  }: {
    class?: string
    value: string
    children?: import("svelte").Snippet
  } & TabsPrimitive.ContentProps = $props()
</script>

<TabsPrimitive.Content
  class={cn(
    "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    className
  )}
  {value}
  {...rest}
>
  {#if children}{@render children()}{/if}
</TabsPrimitive.Content>

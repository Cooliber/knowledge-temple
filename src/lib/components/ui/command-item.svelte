<script lang="ts">
  import { Command as CommandPrimitive } from "bits-ui"
  import { cn } from "$lib/utils.js"
  import type { HTMLAttributes } from "svelte/elements"

  let {
    class: className,
    value,
    onSelect,
    children,
    ...rest
  }: {
    class?: string
    value: string
    onSelect?: (value: string) => void
    children?: import("svelte").Snippet
  } & CommandPrimitive.ItemProps = $props()
</script>

<CommandPrimitive.Item
  {value}
  onSelect={() => onSelect?.(value)}
  class={cn(
    "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled=true]:pointer-events-none data-[selected=true]:bg-accent/15 data-[selected=true]:text-accent data-[disabled=true]:opacity-50",
    className
  )}
  {...rest}
>
  {#if children}{@render children()}{/if}
</CommandPrimitive.Item>

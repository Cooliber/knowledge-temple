<script lang="ts">
  import { Command as CommandPrimitive } from "bits-ui"
  import { cn } from "$lib/utils.js"

  let {
    class: className,
    children,
    label = "Command Palette",
    shouldFilter = true,
    loop = true,
    value = $bindable(""),
    ...rest
  }: {
    class?: string
    children?: import("svelte").Snippet
    label?: string
    shouldFilter?: boolean
    loop?: boolean
    value?: string
  } & CommandPrimitive.RootProps = $props()
</script>

<CommandPrimitive.Root
  {label}
  {shouldFilter}
  {loop}
  bind:value
  class={cn(
    "flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground",
    className
  )}
  {...rest}
>
  {#if children}{@render children()}{/if}
</CommandPrimitive.Root>

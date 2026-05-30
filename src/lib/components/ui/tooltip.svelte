<script lang="ts">
  import { cn } from "$lib/utils.js"
  import { Tooltip as TooltipPrimitive } from "bits-ui"

  let {
    class: className,
    children,
    content = "",
    side = "top",
    ...rest
  }: {
    class?: string
    children?: import("svelte").Snippet
    content?: string
    side?: "top" | "bottom" | "left" | "right"
  } & TooltipPrimitive.RootProps = $props()
</script>

<TooltipPrimitive.Provider>
  <TooltipPrimitive.Root { ...rest }>
    <TooltipPrimitive.Trigger>
      {#if children}{@render children()}{/if}
    </TooltipPrimitive.Trigger>
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        {side}
        class={cn(
          "z-50 overflow-hidden rounded-md border border-border bg-card-bg px-3 py-1.5 text-xs text-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          className
        )}
      >
        {content}
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  </TooltipPrimitive.Root>
</TooltipPrimitive.Provider>

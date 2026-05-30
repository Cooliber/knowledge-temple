<script lang="ts">
  import { Command as CommandPrimitive } from "bits-ui"
  import { cn } from "$lib/utils.js"
  import type { HTMLAttributes } from "svelte/elements"

  let { class: className, children, ...rest }: {
    class?: string; children?: import("svelte").Snippet
  } & HTMLAttributes<HTMLDivElement> = $props()
</script>

<CommandPrimitive.List
  class={cn("max-h-[300px] overflow-y-auto overflow-x-hidden", className)}
  {...rest}
>
  <CommandPrimitive.Empty class="py-6 text-center text-sm text-muted">
    Nie znaleziono.
  </CommandPrimitive.Empty>
  {#if children}{@render children()}{/if}
</CommandPrimitive.List>

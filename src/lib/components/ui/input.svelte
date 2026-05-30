<script lang="ts">
  import { cn } from "$lib/utils.js"
  import type { HTMLInputAttributes } from "svelte/elements"

  let {
    class: className,
    placeholder = "",
    ...rest
  }: {
    class?: string
    placeholder?: string
  } & HTMLInputAttributes = $props()
</script>

<input
  class={cn(
    "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50",
    className
  )}
  {placeholder}
  {...rest}
/>

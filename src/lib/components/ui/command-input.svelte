<script lang="ts">
  import { Command as CommandPrimitive } from "bits-ui"
  import { cn } from "$lib/utils.js"
  import type { HTMLAttributes } from "svelte/elements"

  let { class: className, children, ...rest }: {
    class?: string; children?: import("svelte").Snippet
  } & HTMLAttributes<HTMLDivElement> = $props()
</script>

<div class={cn("flex items-center border-b border-border px-3", className)} cmdk-input-wrapper="">
  <svg
    class="mr-2 h-4 w-4 shrink-0 opacity-50"
    xmlns="http://www.w3.org/2000/svg"
    width="24" height="24" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" stroke-width="2"
    stroke-linecap="round" stroke-linejoin="round"
  >
    <circle cx="11" cy="11" r="8"></circle>
    <path d="m21 21-4.3-4.3"></path>
  </svg>
  <CommandPrimitive.Input
    class={cn(
      "flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...rest}
  />
</div>

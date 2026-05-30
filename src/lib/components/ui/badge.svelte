<script lang="ts">
  import { cn } from "$lib/utils.js"
  import type { HTMLAttributes } from "svelte/elements"

  let {
    class: className,
    variant = "default",
    children,
    ...rest
  }: {
    class?: string
    variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning"
    children?: import("svelte").Snippet
  } & HTMLAttributes<HTMLSpanElement> = $props()
</script>

<span
  class={cn(
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    variant === "default" && "border-transparent bg-primary text-primary-fg shadow",
    variant === "secondary" && "border-transparent bg-secondary text-secondary-fg",
    variant === "destructive" && "border-transparent bg-destructive text-destructive-fg shadow",
    variant === "outline" && "text-foreground",
    variant === "success" && "border-transparent bg-success/15 text-success",
    variant === "warning" && "border-transparent bg-warning/15 text-warning",
    className
  )}
  {...rest}
>
  {#if children}{@render children()}{/if}
</span>

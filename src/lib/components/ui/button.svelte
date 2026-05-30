<script lang="ts">
  import { Button as ButtonPrimitive } from "bits-ui"
  import { cn } from "$lib/utils.js"

  let {
    ref: ref = $bindable(null),
    class: className,
    variant = "default",
    size = "default",
    children,
    ...rest
  }: {
    ref?: HTMLElement | null
    class?: string
    variant?: "default" | "secondary" | "destructive" | "outline" | "ghost" | "link"
    size?: "default" | "sm" | "lg" | "icon"
    children?: import("svelte").Snippet
  } & ButtonPrimitive.RootProps = $props()
</script>

<ButtonPrimitive.Root
  bind:ref
  class={cn(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
    variant === "default" && "bg-primary text-primary-fg shadow hover:bg-primary/90 active:scale-[0.97]",
    variant === "secondary" && "bg-secondary text-secondary-fg shadow-sm hover:bg-secondary/80 active:scale-[0.97]",
    variant === "destructive" && "bg-destructive text-destructive-fg shadow-sm hover:bg-destructive/90 active:scale-[0.97]",
    variant === "outline" && "border border-input bg-transparent shadow-sm hover:bg-accent/10 hover:text-accent",
    variant === "ghost" && "hover:bg-accent/10 hover:text-accent",
    variant === "link" && "text-primary underline-offset-4 hover:underline",
    size === "default" && "h-9 px-4 py-2",
    size === "sm" && "h-8 rounded-md px-3 text-xs",
    size === "lg" && "h-10 rounded-md px-8",
    size === "icon" && "h-9 w-9",
    className
  )}
  {...rest}
>
  {#if children}
    {@render children()}
  {/if}
</ButtonPrimitive.Root>

<script lang="ts">
  import { Dialog as DialogPrimitive } from "bits-ui"
  import { cn } from "$lib/utils.js"
  import type { HTMLAttributes } from "svelte/elements"

  let {
    class: className,
    children,
    ...rest
  }: {
    class?: string
    children?: import("svelte").Snippet
  } & HTMLAttributes<HTMLDivElement> = $props()
</script>

<DialogPrimitive.Portal>
  <DialogPrimitive.Overlay
    class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
  />
  <DialogPrimitive.Content
    class={cn(
      "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-border bg-card-bg p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
      className
    )}
    {...rest}
  >
    {#if children}{@render children()}{/if}
  </DialogPrimitive.Content>
</DialogPrimitive.Portal>

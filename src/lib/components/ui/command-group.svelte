<script lang="ts">
  import { Command as CommandPrimitive } from "bits-ui"
  import { cn } from "$lib/utils.js"
  import type { HTMLAttributes } from "svelte/elements"

  let { class: className, children, heading, ...rest }: {
    class?: string; children?: import("svelte").Snippet; heading?: string
  } & HTMLAttributes<HTMLDivElement> = $props()
</script>

<CommandPrimitive.Group
  class={cn("overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted", className)}
  {...rest}
>
  {#if heading}
    <CommandPrimitive.GroupHeading>{heading}</CommandPrimitive.GroupHeading>
  {/if}
  {#if children}{@render children()}{/if}
</CommandPrimitive.Group>

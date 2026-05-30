<script lang="ts">
  import { Separator as SeparatorPrimitive } from "bits-ui"
  import { cn } from "$lib/utils.js"

  let {
    ref: ref = $bindable(null),
    class: className,
    ...rest
  }: {
    ref?: HTMLElement | null
    class?: string
  } & SeparatorPrimitive.RootProps = $props()
</script>

<SeparatorPrimitive.Root
  bind:ref
  class={cn("shrink-0 bg-border", className)}
  {...rest}
/>

<script lang="ts">
  import { Progress as ProgressPrimitive } from "bits-ui"
  import { cn } from "$lib/utils.js"

  let {
    ref: ref = $bindable(null),
    class: className,
    value = 0,
    ...rest
  }: {
    ref?: HTMLElement | null
    class?: string
    value?: number
  } & ProgressPrimitive.RootProps = $props()
</script>

<ProgressPrimitive.Root
  bind:ref
  class={cn("relative h-2 w-full overflow-hidden rounded-full bg-muted/20", className)}
  {...rest}
>
  <div
    class="h-full w-full flex-1 rounded-full bg-primary transition-all duration-500 ease-out"
    style="transform: translateX(-{100 - value}%)"
  ></div>
</ProgressPrimitive.Root>

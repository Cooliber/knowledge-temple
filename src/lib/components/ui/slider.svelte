<script lang="ts">
  import { cn } from "$lib/utils.js"
  import { Slider as SliderPrimitive } from "bits-ui"

  let {
    ref: ref = $bindable(null),
    class: className,
    value = $bindable([50]),
    min = 0,
    max = 100,
    step = 1,
    ...rest
  }: {
    ref?: HTMLElement | null
    class?: string
    value?: number[]
    min?: number
    max?: number
    step?: number
  } & SliderPrimitive.RootProps = $props()
</script>

<SliderPrimitive.Root
  bind:ref
  bind:value
  {min}
  {max}
  {step}
  class={cn("relative flex w-full touch-none select-none items-center py-1", className)}
  {...rest}
>
  <div class="relative h-1.5 w-full grow overflow-hidden rounded-full bg-muted/20">
    <SliderPrimitive.Range class="absolute h-full bg-primary" />
  </div>
  <SliderPrimitive.Thumb
    class="block h-4 w-4 rounded-full border border-primary/50 bg-card-bg shadow transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 hover:border-primary"
  />
</SliderPrimitive.Root>

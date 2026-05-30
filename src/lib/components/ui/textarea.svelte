<script lang="ts">
  import { cn } from "$lib/utils.js"
  import type { HTMLTextareaAttributes } from "svelte/elements"

  let {
    class: className,
    placeholder = "",
    value = $bindable(""),
    maxlength,
    ...rest
  }: {
    class?: string
    placeholder?: string
    value?: string
    maxlength?: number
  } & HTMLTextareaAttributes = $props()
</script>

<textarea
  bind:value
  {maxlength}
  class={cn(
    "flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-all placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50",
    className
  )}
  {placeholder}
  {...rest}
></textarea>
{#if maxlength}
  <p class="mt-1 text-right text-xs text-muted">{value.length}/{maxlength}</p>
{/if}

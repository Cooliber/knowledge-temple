<script lang="ts">
  import { cn } from "$lib/utils.js"
  import type { HTMLAttributes } from "svelte/elements"

  let { class: className, children, ...rest }: {
    class?: string; children?: import("svelte").Snippet
  } & HTMLAttributes<HTMLDivElement> = $props()
</script>

<div
  data-slot="card"
  class={cn("bg-card-bg text-card-fg flex flex-col gap-6 rounded-xl border border-border py-6 shadow-sm", className)}
  {...rest}
>
  {#if children}{@render children()}{/if}
</div>

<script lang="ts">
  import type { Belief } from '$lib/db'
  import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, Button, Input, Label, Progress } from '$lib/components/ui/index.js'

  let {
    show = false,
    parentBelief,
    onsave,
    oncancel,
  }: {
    show?: boolean
    parentBelief?: Belief | null
    onsave: (data: any) => void
    oncancel: () => void
  } = $props()

  let subject = $state('')
  let text = $state('')
  let strength = $state(50)

  let inferredType = $derived(
    parentBelief?.type === 'second_order' ? 'third_order' : 'second_order'
  )

  let strengthDisplay = $derived(`${strength}%`)

  $effect(() => {
    if (show && parentBelief) {
      if (parentBelief.subject) {
        subject = parentBelief.subject
      } else {
        subject = ''
      }
      text = ''
      strength = 50
    }
  })

  function handleSubmit(e: Event) {
    e.preventDefault()
    onsave({
      text: text.trim(),
      strength: strength / 100,
      type: inferredType,
      subject: subject.trim() || undefined,
      category: parentBelief?.category ?? '',
      tags: [],
    })
  }


</script>

<Dialog open={show} onOpenChange={(o) => { if (!o) oncancel() }}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>
        Nowe przekonanie {inferredType === 'second_order' ? '2.' : '3.'} rzędu
      </DialogTitle>
      <DialogDescription>
        {#if parentBelief}
          Na podstawie: <em>"{parentBelief.text}"</em>
        {:else}
          Utwórz zagnieżdżone przekonanie o innej osobie
        {/if}
      </DialogDescription>
    </DialogHeader>

    <form onsubmit={handleSubmit} class="flex flex-col gap-4">
      <div class="grid gap-2">
        <Label for="nested-subject">O kim?</Label>
        <Input
          id="nested-subject"
          type="text"
          bind:value={subject}
          placeholder="Imię lub nazwa osoby"
          required
        />
      </div>

      <div class="grid gap-2">
        <Label for="nested-text">
          Co {subject ? `${subject} ` : ''}{inferredType === 'second_order' ? 'myśli?' : 'myśli, że ktoś myśli?'}
        </Label>
        <Input
          id="nested-text"
          as="textarea"
          bind:value={text}
          placeholder="Treść przekonania..."
          rows={3}
          required
        />
      </div>

      <div class="grid gap-2">
        <Label>
          Siła przekonania: <span class="slider-value">{strengthDisplay}</span>
        </Label>
        <input
          type="range"
          min="0"
          max="100"
          bind:value={strength}
          class="strength-slider"
        />
        <Progress value={strength} />
      </div>

      <DialogFooter>
        <Button type="submit">Utwórz</Button>
        <Button type="button" variant="secondary" onclick={oncancel}>Anuluj</Button>
      </DialogFooter>
    </form>
  </DialogContent>
</Dialog>

<style>
  .slider-value {
    color: var(--sl-color-accent-high);
    font-weight: 600;
  }

  .strength-slider {
    -webkit-appearance: none;
    appearance: none;
    height: 6px;
    background: var(--sl-color-gray-5);
    border-radius: 3px;
    outline: none;
    cursor: pointer;
  }

  .strength-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--sl-color-accent);
    cursor: pointer;
    border: 2px solid var(--sl-color-white);
  }

  .strength-slider::-moz-range-thumb {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--sl-color-accent);
    cursor: pointer;
    border: 2px solid var(--sl-color-white);
  }
</style>

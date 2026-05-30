<script lang="ts">
  import type { Belief } from '$lib/db'
  import { Button, Card, CardHeader, CardTitle, CardContent, Label, Badge } from '$lib/components/ui/index.js'

  let { beliefs }: { beliefs: Belief[] } = $props()

  let beliefAId: string = $state('')
  let beliefBId: string = $state('')
  let result: string = $state('')

  let beliefA = $derived(beliefs.find(b => b.id === beliefAId) || null)
  let beliefB = $derived(beliefs.find(b => b.id === beliefBId) || null)

  let filteredBeliefs = $derived(beliefs.filter(b => b.id !== beliefAId))
  let filteredBeliefsB = $derived(beliefs.filter(b => b.id !== beliefBId))

  function check() {
    if (!beliefA || !beliefB) return
    result = 'Analiza sprzeczności wymaga integracji z modelem LLM. Wybrane przekonania zostaną przesłane do analizy.'
  }

  function reset() {
    beliefAId = ''
    beliefBId = ''
    result = ''
  }
</script>

<div class="contradiction-detector">
  <div class="grid grid-cols-2 gap-4">
    <div class="flex flex-col gap-1.5">
      <Label for="belief-a">Przekonanie A</Label>
      <select id="belief-a" bind:value={beliefAId}
        class="w-full p-2 bg-card-bg border border-border rounded-md text-sm text-foreground focus:outline-none focus:border-primary">
        <option value="">Wybierz...</option>
        {#each filteredBeliefs as b}
          <option value={b.id}>{b.text}</option>
        {/each}
      </select>
      {#if beliefA}
        <div class="flex gap-2 p-1.5 bg-muted/10 rounded text-xs">
          <Badge variant="secondary" class="text-[11px]">{beliefA.category}</Badge>
          <span class="text-muted">{beliefA.type === 'first_order' ? 'I-rzędu' : beliefA.type === 'second_order' ? 'II-rzędu' : 'III-rzędu'}</span>
          <span class="text-muted ml-auto">{Math.round(beliefA.strength * 100)}%</span>
        </div>
      {/if}
    </div>

    <div class="flex flex-col gap-1.5">
      <Label for="belief-b">Przekonanie B</Label>
      <select id="belief-b" bind:value={beliefBId}
        class="w-full p-2 bg-card-bg border border-border rounded-md text-sm text-foreground focus:outline-none focus:border-primary">
        <option value="">Wybierz...</option>
        {#each filteredBeliefsB as b}
          <option value={b.id}>{b.text}</option>
        {/each}
      </select>
      {#if beliefB}
        <div class="flex gap-2 p-1.5 bg-muted/10 rounded text-xs">
          <Badge variant="secondary" class="text-[11px]">{beliefB.category}</Badge>
          <span class="text-muted">{beliefB.type === 'first_order' ? 'I-rzędu' : beliefB.type === 'second_order' ? 'II-rzędu' : 'III-rzędu'}</span>
          <span class="text-muted ml-auto">{Math.round(beliefB.strength * 100)}%</span>
        </div>
      {/if}
    </div>
  </div>

  <div class="flex gap-2">
    <Button onclick={check} disabled={!beliefA || !beliefB}>
      Sprawdź Sprzeczność
    </Button>
    <Button variant="ghost" onclick={reset}>Reset</Button>
  </div>

  {#if result}
    <Card>
      <CardHeader>
        <CardTitle class="text-sm">Wynik Analizy</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-[1fr_auto_1fr] gap-4 items-center mb-4">
          <div class="bg-card-bg border border-border rounded-md p-3">
            <p class="text-sm font-medium text-foreground mb-1">{beliefA?.text}</p>
            <p class="text-[11px] text-muted">Siła: {Math.round((beliefA?.strength ?? 0) * 100)}%</p>
            <p class="text-[11px] text-muted">Kategoria: {beliefA?.category}</p>
          </div>
          <span class="text-xs font-bold text-muted uppercase">vs</span>
          <div class="bg-card-bg border border-border rounded-md p-3">
            <p class="text-sm font-medium text-foreground mb-1">{beliefB?.text}</p>
            <p class="text-[11px] text-muted">Siła: {Math.round((beliefB?.strength ?? 0) * 100)}%</p>
            <p class="text-[11px] text-muted">Kategoria: {beliefB?.category}</p>
          </div>
        </div>
        <p class="text-sm text-muted italic">{result}</p>
      </CardContent>
    </Card>
  {:else}
    <p class="text-sm text-muted italic text-center py-12">Wybierz dwa przekonania do analizy</p>
  {/if}
</div>

<style>
  .contradiction-detector {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }
</style>

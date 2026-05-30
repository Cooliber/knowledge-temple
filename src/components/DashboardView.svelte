<script lang="ts">
  import { beliefs, observations, decisions, goals } from '$lib/db'
  import type { Belief, Observation, Decision, Goal } from '$lib/db'
  import {
    Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter,
    Button, Badge, Progress, Tabs, TabsList, TabsTrigger, TabsContent,
    Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
    Command, CommandInput, CommandList, CommandGroup, CommandItem,
    Input, Separator, Label,
  } from '$lib/components/ui/index.js'

  let allBeliefs: Belief[] = $state([])
  let allObservations: Observation[] = $state([])
  let allDecisions: Decision[] = $state([])
  let allGoals: Goal[] = $state([])
  let loaded = $state(false)
  let cmdOpen = $state(false)
  let addDialog = $state(false)
  let quickType = $state<'observation' | 'belief'>('observation')
  let quickText = $state('')
  let quickSource = $state('')

  let activeTab = $state('overview')
  let searchQuery = $state('')

  $effect(() => { loadData() })

  async function loadData() {
    allBeliefs = await beliefs.getAllBeliefs()
    allObservations = await observations.getAllObservations()
    allDecisions = await decisions.getAllDecisions()
    allGoals = await goals.getAllGoals()
    loaded = true
  }

  const stats = $derived({
    beliefs: allBeliefs.length,
    obs: allObservations.length,
    obsWeek: allObservations.filter(o => {
      const d = new Date(o.timestamp)
      return d >= new Date(Date.now() - 7 * 864e5)
    }).length,
    decisions: allDecisions.length,
    decisionsPositive: allDecisions.filter(d => d.outcome === 'positive').length,
    goalsActive: allGoals.filter(g => g.status === 'active').length,
    goalsCompleted: allGoals.filter(g => g.status === 'completed').length,
  })

  const recentObs = $derived(allObservations.slice(0, 6))
  const recentDecisions = $derived(allDecisions.slice(0, 6))
  const topBeliefs = $derived([...allBeliefs].sort((a, b) => b.strength - a.strength).slice(0, 5))
  const activeGoals = $derived(allGoals.filter(g => g.status === 'active').slice(0, 5))

  const cmdItems = [
    { section: 'Nawigacja', items: [
      { label: 'Dashboard', action: () => window.location.href = '/app/dashboard' },
      { label: 'Przekonania', action: () => window.location.href = '/app/beliefs' },
      { label: 'Obserwacje', action: () => window.location.href = '/app/observations' },
      { label: 'Sieć społeczna', action: () => window.location.href = '/app/network' },
      { label: 'Decyzje', action: () => window.location.href = '/app/decisions' },
      { label: 'Cele', action: () => window.location.href = '/app/goals' },
      { label: 'Analiza', action: () => window.location.href = '/app/analysis' },
      { label: 'Ustawienia', action: () => window.location.href = '/app/settings' },
    ]},
    { section: 'Akcje', items: [
      { label: 'Dodaj obserwację', action: () => { quickType = 'observation'; addDialog = true; cmdOpen = false } },
      { label: 'Dodaj przekonanie', action: () => { quickType = 'belief'; addDialog = true; cmdOpen = false } },
    ]},
  ]

  function handleCmdSelect(value: string) {
    cmdOpen = false
  }

  async function handleQuickAdd() {
    if (!quickText.trim()) return
    if (quickType === 'observation') {
      await observations.createObservation({
        content: quickText,
        source: quickSource || 'quick',
        sourceType: 'other',
        attentionLevel: 0.5,
        category: 'general',
        tags: [],
        linkedBeliefs: [],
        timestamp: new Date().toISOString(),
      })
    } else {
      await beliefs.createBelief({
        text: quickText,
        strength: 0.5,
        type: 'first_order',
        category: 'general',
        tags: [],
        history: [{ strength: 0.5, timestamp: new Date().toISOString() }],
      })
    }
    quickText = ''
    quickSource = ''
    addDialog = false
    await loadData()
  }

  function shortDate(ts: string) {
    const d = new Date(ts)
    const diff = Date.now() - d.getTime()
    const days = Math.floor(diff / 864e5)
    if (days === 0) return 'dziś'
    if (days === 1) return 'wczoraj'
    if (days < 7) return `${days} dni temu`
    return d.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' })
  }

  function catColor(s: number) {
    if (s < 33) return 'text-destructive'
    if (s < 66) return 'text-warning'
    return 'text-success'
  }
</script>

{#if !loaded}
  <div class="flex items-center justify-center py-24">
    <div class="flex flex-col items-center gap-3">
      <div class="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
      <p class="text-sm text-muted">Ładowanie danych...</p>
    </div>
  </div>
{:else}
  <!-- Command Palette Trigger -->
  <div class="mb-6">
    <button
      onclick={() => cmdOpen = true}
      class="flex w-full items-center gap-2 rounded-lg border border-border bg-card-bg px-4 py-2.5 text-sm text-muted shadow-sm transition-all hover:border-primary/30 hover:text-foreground"
    >
      <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
      <span class="flex-1 text-left">Szukaj modułu lub dodaj...</span>
      <kbd class="hidden rounded border border-border bg-muted/10 px-1.5 py-0.5 text-xs sm:inline-block">⌘K</kbd>
    </button>
  </div>

  <!-- Stats Grid -->
  <div class="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
    <Card>
      <CardHeader class="p-4 pb-2">
        <div class="flex items-center justify-between">
          <CardTitle class="text-xs font-medium text-muted">Przekonania</CardTitle>
          <span class="text-lg opacity-30">◈</span>
        </div>
        <CardDescription class="text-2xl font-bold text-foreground">{stats.beliefs}</CardDescription>
      </CardHeader>
      <CardContent class="px-4 pb-3 pt-0">
        <p class="text-xs text-muted">{allBeliefs.filter(b => b.strength > 0.7).length} silnych</p>
      </CardContent>
    </Card>
    <Card>
      <CardHeader class="p-4 pb-2">
        <div class="flex items-center justify-between">
          <CardTitle class="text-xs font-medium text-muted">Obserwacje</CardTitle>
          <span class="text-lg opacity-30">◎</span>
        </div>
        <CardDescription class="text-2xl font-bold text-foreground">{stats.obs}</CardDescription>
      </CardHeader>
      <CardContent class="px-4 pb-3 pt-0">
        <p class="text-xs text-muted">{stats.obsWeek} w tym tygodniu</p>
      </CardContent>
    </Card>
    <Card>
      <CardHeader class="p-4 pb-2">
        <div class="flex items-center justify-between">
          <CardTitle class="text-xs font-medium text-muted">Decyzje</CardTitle>
          <span class="text-lg opacity-30">⊜</span>
        </div>
        <CardDescription class="text-2xl font-bold text-foreground">{stats.decisions}</CardDescription>
      </CardHeader>
      <CardContent class="px-4 pb-3 pt-0">
        <p class="text-xs text-muted">{stats.decisionsPositive} pozytywnych</p>
      </CardContent>
    </Card>
    <Card>
      <CardHeader class="p-4 pb-2">
        <div class="flex items-center justify-between">
          <CardTitle class="text-xs font-medium text-muted">Cele</CardTitle>
          <span class="text-lg opacity-30">⊚</span>
        </div>
        <CardDescription class="text-2xl font-bold text-foreground">{stats.goalsActive}</CardDescription>
      </CardHeader>
      <CardContent class="px-4 pb-3 pt-0">
        <p class="text-xs text-muted">{stats.goalsCompleted} ukończonych</p>
      </CardContent>
    </Card>
  </div>

  <!-- Tabs -->
  <Tabs bind:value={activeTab}>
    <TabsList class="mb-6">
      <TabsTrigger value="overview">Przegląd</TabsTrigger>
      <TabsTrigger value="beliefs">Przekonania</TabsTrigger>
      <TabsTrigger value="decisions">Decyzje</TabsTrigger>
      <TabsTrigger value="goals">Cele</TabsTrigger>
    </TabsList>

    <!-- Overview Tab -->
    <TabsContent value="overview">
      <div class="grid gap-4 md:grid-cols-2">
        <!-- Recent Observations -->
        <Card>
          <CardHeader>
            <CardTitle class="text-sm">Ostatnie Obserwacje</CardTitle>
            <CardDescription>Ostatnie 6 wpisów</CardDescription>
          </CardHeader>
          <CardContent class="p-0">
            {#if recentObs.length === 0}
              <div class="flex flex-col items-center gap-3 px-6 pb-6 pt-2">
                <p class="text-sm text-muted italic">Brak obserwacji</p>
                <Button size="sm" onclick={() => { quickType = 'observation'; addDialog = true }}>Dodaj pierwszą</Button>
              </div>
            {:else}
              <div class="divide-y divide-border">
                {#each recentObs as obs}
                  <div class="flex items-start gap-3 px-6 py-3">
                    <div class="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-primary/40"></div>
                    <div class="min-w-0 flex-1">
                      <p class="truncate text-sm">{obs.content}</p>
                      <p class="mt-0.5 text-xs text-muted">{obs.source} · {shortDate(obs.timestamp)}</p>
                    </div>
                    <div class="flex items-center gap-1">
                      <div class="h-1 w-12 rounded-full bg-muted/20">
                        <div class="h-full rounded-full bg-primary/40" style="width: {obs.attentionLevel * 100}%"></div>
                      </div>
                    </div>
                  </div>
                {/each}
              </div>
            {/if}
          </CardContent>
        </Card>

        <!-- Recent Decisions -->
        <Card>
          <CardHeader>
            <CardTitle class="text-sm">Ostatnie Decyzje</CardTitle>
            <CardDescription>Ostatnie 6 wpisów</CardDescription>
          </CardHeader>
          <CardContent class="p-0">
            {#if recentDecisions.length === 0}
              <div class="flex flex-col items-center gap-3 px-6 pb-6 pt-2">
                <p class="text-sm text-muted italic">Brak decyzji</p>
                <Button size="sm" variant="secondary" onclick={() => window.location.href = '/app/decisions'}>Dodaj pierwszą</Button>
              </div>
            {:else}
              <div class="divide-y divide-border">
                {#each recentDecisions as dec}
                  <div class="flex items-start gap-3 px-6 py-3">
                    <div
                      class="mt-1 h-2 w-2 shrink-0 rounded-full"
                      class:bg-success={dec.outcome === 'positive'}
                      class:bg-destructive={dec.outcome === 'negative'}
                      class:bg-muted={dec.outcome === 'neutral'}
                      class:bg-warning={dec.outcome === 'pending'}
                    ></div>
                    <div class="min-w-0 flex-1">
                      <p class="truncate text-sm">{dec.description}</p>
                      <p class="mt-0.5 text-xs text-muted">
                        <Badge
                          variant={dec.outcome === 'positive' ? 'success' : dec.outcome === 'negative' ? 'destructive' : dec.outcome === 'pending' ? 'warning' : 'default'}
                          class="mr-1 px-1.5 py-0 text-[10px]"
                        >
                          {dec.outcome === 'positive' ? 'Pozytywny' : dec.outcome === 'negative' ? 'Negatywny' : dec.outcome === 'pending' ? 'Oczekuje' : 'Neutralny'}
                        </Badge>
                        · {shortDate(dec.timestamp)}
                      </p>
                    </div>
                  </div>
                {/each}
              </div>
            {/if}
          </CardContent>
        </Card>
      </div>
    </TabsContent>

    <!-- Beliefs Tab -->
    <TabsContent value="beliefs">
      <Card>
        <CardHeader>
          <CardTitle class="text-sm">Najsilniejsze Przekonania</CardTitle>
          <CardDescription>Top 5 według siły</CardDescription>
        </CardHeader>
        <CardContent>
          {#if topBeliefs.length === 0}
            <div class="flex flex-col items-center gap-3 py-6">
              <p class="text-sm text-muted italic">Brak przekonań</p>
              <Button size="sm" onclick={() => window.location.href = '/app/beliefs'}>Dodaj pierwsze</Button>
            </div>
          {:else}
            <div class="space-y-4">
              {#each topBeliefs as belief}
                <div>
                  <div class="mb-1 flex items-center justify-between">
                    <span class="truncate text-sm">{belief.text}</span>
                    <span class="ml-2 shrink-0 text-xs font-medium tabular-nums {catColor(belief.strength * 100)}">
                      {Math.round(belief.strength * 100)}%
                    </span>
                  </div>
                  <Progress value={Math.round(belief.strength * 100)} />
                </div>
              {/each}
            </div>
          {/if}
        </CardContent>
        <CardFooter>
          <Button variant="ghost" size="sm" class="w-full text-xs" onclick={() => window.location.href = '/app/beliefs'}>
            Zarządzaj przekonaniami →
          </Button>
        </CardFooter>
      </Card>
    </TabsContent>

    <!-- Decisions Tab -->
    <TabsContent value="decisions">
      <Card>
        <CardHeader>
          <CardTitle class="text-sm">Struktura Decyzji</CardTitle>
          <CardDescription>{stats.decisions} decyzji · {stats.decisionsPositive} pozytywnych</CardDescription>
        </CardHeader>
        <CardContent class="p-0">
          {#if allDecisions.length === 0}
            <div class="flex flex-col items-center gap-3 px-6 pb-6 pt-2">
              <p class="text-sm text-muted italic">Brak decyzji</p>
            </div>
          {:else}
            <div class="divide-y divide-border">
              {#each allDecisions as dec}
                <div class="flex items-center gap-3 px-6 py-3">
                  <Badge
                    variant={dec.outcome === 'positive' ? 'success' : dec.outcome === 'negative' ? 'destructive' : dec.outcome === 'pending' ? 'warning' : 'outline'}
                    class="shrink-0 text-[10px]"
                  >
                    {dec.outcome === 'positive' ? 'OK' : dec.outcome === 'negative' ? 'FAIL' : dec.outcome === 'pending' ? '...' : '—'}
                  </Badge>
                  <div class="min-w-0 flex-1">
                    <p class="truncate text-sm">{dec.description}</p>
                    <p class="text-xs text-muted">{shortDate(dec.timestamp)}</p>
                  </div>
                </div>
              {/each}
            </div>
          {/if}
        </CardContent>
        <CardFooter>
          <Button variant="ghost" size="sm" class="w-full text-xs" onclick={() => window.location.href = '/app/decisions'}>
            Wszystkie decyzje →
          </Button>
        </CardFooter>
      </Card>
    </TabsContent>

    <!-- Goals Tab -->
    <TabsContent value="goals">
      <div class="grid gap-4 md:grid-cols-2">
        <!-- Active Goals -->
        <Card>
          <CardHeader>
            <CardTitle class="text-sm">Aktywne Cele</CardTitle>
            <CardDescription>{stats.goalsActive} aktywnych</CardDescription>
          </CardHeader>
          <CardContent>
            {#if activeGoals.length === 0}
              <div class="flex flex-col items-center gap-3 py-6">
                <p class="text-sm text-muted italic">Brak aktywnych celów</p>
                <Button size="sm" onclick={() => window.location.href = '/app/goals'}>Dodaj pierwszy</Button>
              </div>
            {:else}
              <div class="space-y-4">
                {#each activeGoals as goal}
                  <div>
                    <div class="mb-1 flex items-center justify-between">
                      <span class="truncate text-sm">{goal.title}</span>
                      <span class="ml-2 shrink-0 text-xs font-medium tabular-nums text-muted">{goal.progress}%</span>
                    </div>
                    <Progress value={goal.progress} />
                    <p class="mt-0.5 text-xs text-muted">
                      {goal.horizon === 'short' ? 'Krótki' : goal.horizon === 'medium' ? 'Średni' : 'Długi'} termin
                      {#if goal.deadline} · do {new Date(goal.deadline).toLocaleDateString('pl-PL')}{/if}
                    </p>
                  </div>
                {/each}
              </div>
            {/if}
          </CardContent>
          <CardFooter>
            <Button variant="ghost" size="sm" class="w-full text-xs" onclick={() => window.location.href = '/app/goals'}>
              Zarządzaj celami →
            </Button>
          </CardFooter>
        </Card>

        <!-- Stats Overview -->
        <Card>
          <CardHeader>
            <CardTitle class="text-sm">Podsumowanie</CardTitle>
            <CardDescription>Stan systemu</CardDescription>
          </CardHeader>
          <CardContent>
            <div class="space-y-4">
              <div>
                <div class="mb-1 flex justify-between text-sm">
                  <span class="text-muted">Przekonania</span>
                  <span class="font-medium">{stats.beliefs}</span>
                </div>
                <Progress value={Math.min(100, stats.beliefs * 10)} />
              </div>
              <div>
                <div class="mb-1 flex justify-between text-sm">
                  <span class="text-muted">Obserwacje</span>
                  <span class="font-medium">{stats.obs}</span>
                </div>
                <Progress value={Math.min(100, stats.obs * 5)} />
              </div>
              <div>
                <div class="mb-1 flex justify-between text-sm">
                  <span class="text-muted">Realizacja celów</span>
                  <span class="font-medium">{allGoals.length > 0 ? Math.round(allGoals.reduce((a, g) => a + g.progress, 0) / allGoals.length) : 0}%</span>
                </div>
                <Progress value={allGoals.length > 0 ? Math.round(allGoals.reduce((a, g) => a + g.progress, 0) / allGoals.length) : 0} />
              </div>
              <Separator />
              <div class="grid grid-cols-2 gap-2 text-center text-sm">
                <div class="rounded-lg bg-muted/10 p-3">
                  <div class="text-lg font-bold text-primary">{stats.obsWeek}</div>
                  <div class="text-xs text-muted">w tym tyg.</div>
                </div>
                <div class="rounded-lg bg-muted/10 p-3">
                  <div class="text-lg font-bold text-success">{stats.decisionsPositive}</div>
                  <div class="text-xs text-muted">+ decyzje</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TabsContent>
  </Tabs>

  <!-- Quick Add Dialog -->
  <Dialog bind:open={addDialog}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{quickType === 'observation' ? 'Szybka obserwacja' : 'Szybkie przekonanie'}</DialogTitle>
        <DialogDescription>
          {quickType === 'observation' ? 'Zanotuj szybką obserwację' : 'Dodaj nowe przekonanie'}
        </DialogDescription>
      </DialogHeader>
      <div class="space-y-4">
        <div class="flex gap-2">
          <Button
            variant={quickType === 'observation' ? 'default' : 'secondary'}
            size="sm"
            onclick={() => quickType = 'observation'}
          >
            Obserwacja
          </Button>
          <Button
            variant={quickType === 'belief' ? 'default' : 'secondary'}
            size="sm"
            onclick={() => quickType = 'belief'}
          >
            Przekonanie
          </Button>
        </div>
        <div class="space-y-2">
          <Label for="quick-text">Treść</Label>
          <Input
            id="quick-text"
            bind:value={quickText}
            placeholder={quickType === 'observation' ? 'Co zaobserwowałeś...' : 'Nowe przekonanie...'}
          />
        </div>
        {#if quickType === 'observation'}
          <div class="space-y-2">
            <Label for="quick-source">Źródło</Label>
            <Input id="quick-source" bind:value={quickSource} placeholder="Skąd to masz?" />
          </div>
        {/if}
      </div>
      <DialogFooter>
        <Button variant="secondary" onclick={() => addDialog = false}>Anuluj</Button>
        <Button onclick={handleQuickAdd} disabled={!quickText.trim()}>
          {quickType === 'observation' ? 'Dodaj obserwację' : 'Dodaj przekonanie'}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <!-- Command Palette Dialog -->
  <Dialog bind:open={cmdOpen}>
    <DialogContent class="max-w-md p-0">
      <Command shouldFilter={true} loop={true}>
        <CommandInput bind:value={searchQuery} placeholder="Szukaj modułu lub akcji..." />
        <CommandList>
          {#each cmdItems as group}
            <CommandGroup heading={group.section}>
              {#each group.items as item}
                <CommandItem value={item.label} onSelect={item.action}>
                  {item.label}
                </CommandItem>
              {/each}
            </CommandGroup>
          {/each}
        </CommandList>
      </Command>
    </DialogContent>
  </Dialog>
{/if}

<svelte:window
  onkeydown={(e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault()
      cmdOpen = true
    }
  }}
/>

<style>
  :global(body) {
    font-family: var(--font-sans);
    -webkit-font-smoothing: antialiased;
  }
</style>

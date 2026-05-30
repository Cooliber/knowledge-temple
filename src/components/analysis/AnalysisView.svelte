<script lang="ts">
  import InsightsDashboard from './InsightsDashboard.svelte'
  import TrendChart from './TrendChart.svelte'
  import ContradictionDetector from './ContradictionDetector.svelte'
  import InfluenceAnalysis from './InfluenceAnalysis.svelte'
  import { beliefs, observations, decisions, network } from '$lib/db'
  import type { Belief, Observation, Decision, NetworkNode, NetworkConnection } from '$lib/db'
  import { Tabs, TabsList, TabsTrigger, TabsContent, Card, CardHeader, CardTitle, CardDescription, CardContent } from '$lib/components/ui/index.js'

  let allBeliefs: Belief[] = $state([])
  let allObservations: Observation[] = $state([])
  let allDecisions: Decision[] = $state([])
  let allNodes: NetworkNode[] = $state([])
  let allConnections: NetworkConnection[] = $state([])

  let activeTab: string = $state('insights')

  const tabs = [
    { id: 'insights', label: 'Insighty' },
    { id: 'trends', label: 'Trendy' },
    { id: 'contradictions', label: 'Sprzeczności' },
    { id: 'influences', label: 'Wpływy' },
    { id: 'blindspots', label: 'Slepe Plamy' },
  ]

  $effect(() => {
    beliefs.getAllBeliefs().then(d => allBeliefs = d)
    observations.getAllObservations().then(d => allObservations = d)
    decisions.getAllDecisions().then(d => allDecisions = d)
    network.getAllNodes().then(d => allNodes = d)
    network.getAllConnections().then(d => allConnections = d)
  })

  let blindSpots = $derived.by(() => {
    const spots: { title: string; description: string }[] = []

    const catCounts = new Map<string, number>()
    allBeliefs.forEach(b => catCounts.set(b.category, (catCounts.get(b.category) || 0) + 1))
    const weakCats = [...catCounts.entries()].filter(([_, c]) => c < 2)
    if (weakCats.length > 0) {
      spots.push({
        title: 'Słabo rozwinięte kategorie',
        description: `Kategorie z najmniejszą liczbą przekonań: ${weakCats.map(([c, n]) => `${c} (${n})`).join(', ')}`,
      })
    }

    const usedSources = new Set(allObservations.map(o => o.sourceType))
    const allTypes = ['person', 'social_media', 'news', 'book', 'conversation', 'other'] as const
    const typeLabels: Record<string, string> = {
      person: 'osoby', social_media: 'social media', news: 'wiadomości',
      book: 'książki', conversation: 'rozmowy', other: 'inne',
    }
    const missingTypes = allTypes.filter(t => !usedSources.has(t))
    if (missingTypes.length > 0) {
      spots.push({
        title: 'Niewykorzystane źródła obserwacji',
        description: `Nie masz obserwacji z: ${missingTypes.map(t => typeLabels[t]).join(', ')}`,
      })
    }

    const pendingDecisions = allDecisions.filter(d => d.outcome === 'pending')
    if (pendingDecisions.length > 0) {
      spots.push({
        title: 'Oczekujące decyzje',
        description: `${pendingDecisions.length} decyzji oczekuje na rozstrzygnięcie. Przegląd i aktualizacja mogą dostarczyć nowych insightów.`,
      })
    }

    const noHistoryBeliefs = allBeliefs.filter(b => b.history.length < 2)
    if (noHistoryBeliefs.length > 0) {
      spots.push({
        title: 'Przekonania bez historii',
        description: `${noHistoryBeliefs.length} przekonań ma tylko jeden pomiar. Regularne aktualizacje pokażą trendy zmian.`,
      })
    }

    if (allBeliefs.length === 0) {
      spots.push({
        title: 'Brak danych',
        description: 'Dodaj przekonania, obserwacje i decyzje aby zobaczyć pełną analizę.',
      })
    }

    return spots
  })
</script>

<div class="analysis-view">
  <Tabs bind:value={activeTab}>
    <TabsList class="mb-6">
      {#each tabs as tab}
        <TabsTrigger value={tab.id}>{tab.label}</TabsTrigger>
      {/each}
    </TabsList>

    <TabsContent value="insights">
      <InsightsDashboard
        beliefs={allBeliefs}
        observations={allObservations}
        decisions={allDecisions}
      />
    </TabsContent>

    <TabsContent value="trends">
      <Card>
        <TrendChart beliefs={allBeliefs} />
      </Card>
    </TabsContent>

    <TabsContent value="contradictions">
      <Card>
        <ContradictionDetector beliefs={allBeliefs} />
      </Card>
    </TabsContent>

    <TabsContent value="influences">
      <InfluenceAnalysis
        nodes={allNodes}
        connections={allConnections}
        beliefs={allBeliefs}
        observations={allObservations}
      />
    </TabsContent>

    <TabsContent value="blindspots">
      <Card>
        <CardHeader>
          <CardTitle class="text-sm">Slepe Plamy</CardTitle>
          <CardDescription>Obszary, które mogą wymagać większej uwagi</CardDescription>
        </CardHeader>
        <CardContent>
          {#if blindSpots.length === 0}
            <p class="text-sm text-muted italic text-center py-8">Brak zidentyfikowanych ślepych plam. Dane są dobrze zrównoważone.</p>
          {:else}
            <div class="flex flex-col gap-3">
              {#each blindSpots as spot}
                <Card>
                  <CardContent class="p-3">
                    <h4 class="text-sm font-semibold text-amber-500 mb-1">{spot.title}</h4>
                    <p class="text-xs text-muted">{spot.description}</p>
                  </CardContent>
                </Card>
              {/each}
            </div>
          {/if}
        </CardContent>
      </Card>
    </TabsContent>
  </Tabs>
</div>

<style>
  .analysis-view {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
</style>

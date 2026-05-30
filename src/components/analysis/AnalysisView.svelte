<script lang="ts">
  import InsightsDashboard from './InsightsDashboard.svelte'
  import TrendChart from './TrendChart.svelte'
  import ContradictionDetector from './ContradictionDetector.svelte'
  import InfluenceAnalysis from './InfluenceAnalysis.svelte'
  import { beliefs, observations, decisions, network } from '$lib/db'
  import type { Belief, Observation, Decision, NetworkNode, NetworkConnection } from '$lib/db'

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

<div class="analysis-view mh-animate">
  <div class="tabs">
    {#each tabs as tab}
      <button
        class="mh-btn tab"
        class:active={activeTab === tab.id}
        onclick={() => activeTab = tab.id}
      >
        {tab.label}
      </button>
    {/each}
  </div>

  <div class="tab-content">
    {#if activeTab === 'insights'}
      <InsightsDashboard
        beliefs={allBeliefs}
        observations={allObservations}
        decisions={allDecisions}
      />
    {:else if activeTab === 'trends'}
      <div class="mh-card">
        <TrendChart beliefs={allBeliefs} />
      </div>
    {:else if activeTab === 'contradictions'}
      <div class="mh-card">
        <ContradictionDetector beliefs={allBeliefs} />
      </div>
    {:else if activeTab === 'influences'}
      <InfluenceAnalysis
        nodes={allNodes}
        connections={allConnections}
        beliefs={allBeliefs}
      />
    {:else if activeTab === 'blindspots'}
      <div class="mh-card">
        <h3 class="mh-section-title">Slepe Plamy</h3>
        <p class="section-desc">Obszary, które mogą wymagać większej uwagi</p>
        {#if blindSpots.length === 0}
          <p class="empty">Brak zidentyfikowanych ślepych plam. Dane są dobrze zrównoważone.</p>
        {:else}
          <div class="blind-spots">
            {#each blindSpots as spot}
              <div class="mh-card blind-spot-card">
                <h4>{spot.title}</h4>
                <p>{spot.description}</p>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    {/if}
  </div>
</div>

<style>
  .analysis-view {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .tabs {
    display: flex;
    gap: 0.25rem;
    border-bottom: 1px solid var(--mh-border);
  }

  .tab {
    color: var(--mh-text-secondary);
    border: none;
    border-bottom: 2px solid transparent;
    border-radius: 0;
    background: none;
    padding: 0.5rem 1rem;
  }

  .tab:hover {
    color: var(--mh-text);
  }

  .tab.active {
    color: var(--mh-accent-hover);
    border-bottom-color: var(--mh-accent);
  }

  .tab-content {
    min-height: 300px;
  }

  .section-title {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--mh-text-secondary);
    margin-bottom: 0.25rem;
  }

  .section-desc {
    font-size: 0.75rem;
    color: var(--mh-text-muted);
    margin-bottom: 1rem;
  }

  .empty {
    color: var(--mh-text-muted);
    font-size: 0.8125rem;
    font-style: italic;
    padding: 2rem 0;
    text-align: center;
  }

  .blind-spots {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .blind-spot-card {
    padding: 0.75rem;
  }

  .blind-spot-card h4 {
    font-size: 0.8125rem;
    font-weight: 600;
    color: #f59e0b;
    margin-bottom: 0.25rem;
  }

  .blind-spot-card p {
    font-size: 0.75rem;
    color: var(--mh-text-secondary);
    line-height: 1.5;
  }
</style>

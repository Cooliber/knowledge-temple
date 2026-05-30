<script lang="ts">
  import type { NetworkNode, NetworkConnection, Belief, Observation } from '$lib/db'
  import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge } from '$lib/components/ui/index.js'

  let { nodes, connections, beliefs, observations }: {
    nodes: NetworkNode[]
    connections: NetworkConnection[]
    beliefs: Belief[]
    observations: Observation[]
  } = $props()

  let personObservations = $derived.by(() => {
    const map = new Map<string, { observations: number; linkedBeliefIds: Set<string> }>()
    return map
  })

  let influenceData = $derived.by(() => {
    if (!nodes.length || !connections.length) return []

    const nodeMap = new Map(nodes.map(n => [n.id, n]))

    return connections
      .filter(c => c.influenceStrength > 0)
      .map(c => {
        const source = nodeMap.get(c.sourceId)
        const target = nodeMap.get(c.targetId)
        return {
          sourceName: source?.name || 'Nieznany',
          targetName: target?.name || 'Nieznany',
          type: c.type,
          strength: c.influenceStrength,
          bidirectional: c.bidirectional,
        }
      })
      .sort((a, b) => b.strength - a.strength)
      .slice(0, 20)
  })

  let sourceBeliefMap = $derived.by(() => {
    const map = new Map<string, { count: number; beliefs: string[] }>()

    observations
      .filter(o => o.sourceType === 'person' || o.sourceType === 'conversation')
      .forEach(o => {
        const source = o.source
        if (!map.has(source)) map.set(source, { count: 0, beliefs: [] })
        const entry = map.get(source)!
        entry.count++

        o.linkedBeliefs.forEach(beliefId => {
          const belief = beliefs.find(b => b.id === beliefId)
          if (belief && !entry.beliefs.includes(belief.text)) {
            entry.beliefs.push(belief.text)
          }
        })
      })

    return [...map.entries()]
      .map(([source, data]) => ({ source, ...data }))
      .sort((a, b) => b.count - a.count)
  })

  let typeLabel = $derived.by(() => {
    const labels: Record<string, string> = {
      trust: 'Zaufanie',
      expertise: 'Ekspertyza',
      emotional: 'Emocjonalny',
      authority: 'Autorytet',
    }
    return (key: string) => labels[key] || key
  })
</script>

<div class="influence-analysis">
  {#if influenceData.length > 0}
    <Card>
      <CardHeader>
        <CardTitle class="text-sm">Najsilniejsze wpływy w sieci</CardTitle>
      </CardHeader>
      <CardContent class="p-0">
        <table class="influence-table">
          <thead>
            <tr>
              <th>Źródło</th>
              <th>Cel</th>
              <th>Typ</th>
              <th>Siła wpływu</th>
            </tr>
          </thead>
          <tbody>
            {#each influenceData.slice(0, 10) as item}
              <tr>
                <td class="source-cell">{item.sourceName}</td>
                <td>{item.targetName}</td>
                <td><Badge variant="secondary" class="text-[11px]">{typeLabel(item.type)}</Badge></td>
                <td>
                  <div class="influence-bar-track">
                    <div class="influence-bar-fill" style="width: {item.strength * 100}%"></div>
                  </div>
                  <span class="influence-value">{Math.round(item.strength * 100)}%</span>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </CardContent>
    </Card>
  {:else}
    <Card>
      <CardHeader>
        <CardTitle class="text-sm">Najsilniejsze wpływy w sieci</CardTitle>
      </CardHeader>
      <CardContent>
        <p class="text-sm text-muted italic">Brak danych o połączeniach sieciowych. Dodaj węzły i połączenia w module Sieć.</p>
      </CardContent>
    </Card>
  {/if}

  {#if sourceBeliefMap.length > 0}
    <Card>
      <CardHeader>
        <CardTitle class="text-sm">Wpływ osób na przekonania</CardTitle>
        <CardDescription>Osoby i źródła, które pojawiają się w obserwacjach i ich powiązania z przekonaniami</CardDescription>
      </CardHeader>
      <CardContent class="p-0">
        <table class="influence-table">
          <thead>
            <tr>
              <th>Źródło</th>
              <th>Obserwacje</th>
              <th>Powiązane przekonania</th>
            </tr>
          </thead>
          <tbody>
            {#each sourceBeliefMap as item}
              <tr>
                <td class="source-cell">{item.source}</td>
                <td>{item.count}</td>
                <td class="beliefs-cell">
                  {#if item.beliefs.length === 0}
                    <span class="text-muted italic">Brak powiązanych przekonań</span>
                  {:else}
                    {item.beliefs.join(', ')}
                  {/if}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </CardContent>
    </Card>
  {:else}
    <Card>
      <CardHeader>
        <CardTitle class="text-sm">Wpływ osób na przekonania</CardTitle>
      </CardHeader>
      <CardContent>
        <p class="text-sm text-muted italic">Brak obserwacji od osób lub rozmów. Dodaj obserwacje z źródłem "osoba" lub "rozmowa".</p>
      </CardContent>
    </Card>
  {/if}
</div>

<style>
  .influence-analysis {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .influence-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.8125rem;
  }

  .influence-table th {
    text-align: left;
    padding: 0.5rem 0.5rem 0.5rem 1rem;
    color: var(--sl-color-gray-3);
    font-weight: 600;
    font-size: 0.6875rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border-bottom: 1px solid var(--sl-color-border);
  }

  .influence-table td {
    padding: 0.5rem 0.5rem 0.5rem 1rem;
    border-bottom: 1px solid var(--sl-color-gray-7);
    color: var(--sl-color-text);
  }

  .influence-table tr:last-child td {
    border-bottom: none;
  }

  .source-cell {
    font-weight: 600;
    color: var(--sl-color-accent-high);
  }

  .influence-bar-track {
    display: inline-block;
    width: 80px;
    height: 6px;
    background: var(--sl-color-gray-5);
    border-radius: 3px;
    overflow: hidden;
    vertical-align: middle;
    margin-right: 0.375rem;
  }

  .influence-bar-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--sl-color-accent), #a78bfa);
    border-radius: 3px;
  }

  .influence-value {
    font-size: 0.75rem;
    color: var(--sl-color-gray-3);
  }

  .beliefs-cell {
    font-size: 0.75rem;
    color: var(--sl-color-gray-3);
    max-width: 300px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>

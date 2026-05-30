<script lang="ts">
  import type { Belief } from '$lib/db'
  import { Card, CardContent, CardTitle } from '$lib/components/ui/index.js'

  let { beliefs }: { beliefs: Belief[] } = $props()

  let firstOrder = $derived(beliefs.filter(b => b.type === 'first_order'))
  let secondOrder = $derived(beliefs.filter(b => b.type === 'second_order'))
  let thirdOrder = $derived(beliefs.filter(b => b.type === 'third_order'))

  let subjectGroups = $derived(
    (() => {
      const map = new Map<string, Belief[]>()
      for (const b of [...secondOrder, ...thirdOrder]) {
        if (b.subject) {
          const list = map.get(b.subject) ?? []
          list.push(b)
          map.set(b.subject, list)
        }
      }
      return [...map.entries()]
        .map(([subject, items]) => ({
          subject,
          items: items.sort((a, b) => {
            const order: Record<string, number> = { first_order: 0, second_order: 1, third_order: 2 }
            return order[a.type] - order[b.type]
          }),
        }))
        .sort((a, b) => a.subject.localeCompare(b.subject))
    })()
  )

  function typeLabel(t: string): string {
    const map: Record<string, string> = {
      first_order: '1. rzędu',
      second_order: '2. rzędu',
      third_order: '3. rzędu',
    }
    return map[t] || t
  }
</script>

<Card class="hierarchy-container">
  <CardContent>
    <CardTitle class="text-lg font-bold mb-5">Hierarchia przekonań</CardTitle>

  {#if firstOrder.length === 0 && subjectGroups.length === 0}
    <div class="hierarchy-empty">
      <p>Brak przekonań do wyświetlenia w hierarchii</p>
    </div>
  {:else}
    <div class="tree">
      {#if firstOrder.length > 0}
        <div class="tree-level">
          <span class="level-label">Przekonania 1. rzędu</span>
          {#each firstOrder as belief (belief.id)}
            <div class="tree-node root-node">
              <div class="node-indent"></div>
              <div class="node-line"></div>
              <div class="node-content">
                <span class="node-type type-badge type-first_order">1.</span>
                <span class="node-text">{belief.text}</span>
                <span class="node-strength">{Math.round(belief.strength * 100)}%</span>
              </div>
            </div>
          {/each}
        </div>
      {/if}

      {#each subjectGroups as group}
        <div class="tree-level">
          <span class="level-label subject-label">
            Osoba: <strong>{group.subject}</strong>
          </span>
          {#each group.items as belief (belief.id)}
            <div class="tree-node {belief.type}-node">
              <div class="node-indent"></div>
              <div class="node-line"></div>
              <div class="node-content">
                <span class="node-type type-badge type-{belief.type}">
                  {belief.type === 'second_order' ? '2.' : '3.'}
                </span>
                <span class="node-text">{belief.text}</span>
                <span class="node-strength">{Math.round(belief.strength * 100)}%</span>
              </div>
            </div>
          {/each}
        </div>
      {/each}
    </div>
  {/if}
  </CardContent>
</Card>

<style>
  .hierarchy-container {
    overflow-y: auto;
  }

  .hierarchy-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 120px;
    color: var(--sl-color-gray-4);
    font-size: 0.875rem;
  }

  .tree {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .tree-level {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .level-label {
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--sl-color-gray-4);
    margin-bottom: 0.25rem;
    padding-left: 0.5rem;
  }

  .subject-label {
    color: var(--sl-color-accent-high);
    font-size: 0.8rem;
    text-transform: none;
    letter-spacing: normal;
  }

  .subject-label strong {
    font-weight: 600;
  }

  .tree-node {
    display: flex;
    align-items: stretch;
    position: relative;
  }

  .node-indent {
    width: 1.5rem;
    flex-shrink: 0;
    position: relative;
  }

  .root-node .node-indent::after {
    content: '';
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    width: 1px;
    background: var(--sl-color-border);
    opacity: 0;
  }

  .second_order-node .node-indent::after,
  .third_order-node .node-indent::after {
    content: '';
    position: absolute;
    right: 0;
    top: 50%;
    bottom: 50%;
    width: 1px;
    background: var(--sl-color-accent);
    opacity: 0.3;
  }

  .node-line {
    width: 0.75rem;
    flex-shrink: 0;
    position: relative;
  }

  .tree-node:not(.root-node) .node-line::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    width: 100%;
    height: 1px;
    background: var(--sl-color-accent);
    opacity: 0.3;
  }

  .node-content {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.625rem;
    background: var(--sl-color-black);
    border: 1px solid var(--sl-color-border);
    border-radius: 6px;
    transition: border-color 0.15s;
  }

  .node-content:hover {
    border-color: var(--sl-color-gray-4);
  }

  .node-type {
    font-size: 0.65rem;
    font-weight: 700;
    padding: 0.0625rem 0.3125rem;
    border-radius: 3px;
    flex-shrink: 0;
    line-height: 1.3;
  }

  .type-badge {
    display: inline-block;
  }

  .type-first_order {
    background: rgba(59, 130, 246, 0.15);
    color: #60a5fa;
  }

  .type-second_order {
    background: rgba(124, 58, 237, 0.15);
    color: #a78bfa;
  }

  .type-third_order {
    background: rgba(239, 68, 68, 0.15);
    color: #f87171;
  }

  .node-text {
    flex: 1;
    font-size: 0.8125rem;
    color: var(--sl-color-gray-1);
    line-height: 1.4;
  }

  .node-strength {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--sl-color-accent-high);
    flex-shrink: 0;
  }
</style>

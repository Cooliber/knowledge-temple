<script lang="ts">
  import type { NetworkNode, NetworkConnection } from '$lib/db/schema'

  let {
    node = null,
    nodes = [],
    connections = [],
    onedit,
    ondelete,
    ondeleteConnection,
  }: {
    node: NetworkNode | null
    nodes: NetworkNode[]
    connections: NetworkConnection[]
    onedit?: (node: NetworkNode) => void
    ondelete?: (nodeId: string) => void
    ondeleteConnection?: (connectionId: string) => void
  } = $props()

  const typeColors: Record<string, string> = {
    person: '#7c3aed',
    group: '#3b82f6',
    institution: '#f59e0b',
    media: '#10b981',
  }

  const typeLabels: Record<string, string> = {
    person: 'Osoba',
    group: 'Grupa',
    institution: 'Instytucja',
    media: 'Media',
  }

  const typeNames: Record<string, string> = {
    trust: 'Zaufanie',
    expertise: 'Ekspertyza',
    emotional: 'Emocjonalna',
    authority: 'Autorytet',
  }

  function getNodeName(nodeId: string): string {
    return nodes.find(n => n.id === nodeId)?.name ?? 'Nieznany'
  }
</script>

{#if node}
  <div class="card node-detail">
    <div class="node-header">
      <div class="node-title-row">
        <h3 class="node-name">{node.name}</h3>
        <span
          class="type-badge"
          style="background: {typeColors[node.type] || '#7c3aed'}20; color: {typeColors[node.type] || '#7c3aed'}; border-color: {typeColors[node.type] || '#7c3aed'}40"
        >
          {typeLabels[node.type] || node.type}
        </span>
      </div>
    </div>

    {#if Object.keys(node.metadata).length > 0}
      <div class="section">
        <h4>Metadane</h4>
        <div class="metadata-grid">
          {#each Object.entries(node.metadata) as [key, value]}
            <div class="meta-item">
              <span class="meta-key">{key}</span>
              <span class="meta-value">{typeof value === 'object' ? JSON.stringify(value) : String(value)}</span>
            </div>
          {/each}
        </div>
      </div>
    {/if}

    <div class="section">
      <h4>Połączenia ({connections.length})</h4>
      {#if connections.length === 0}
        <p class="no-data">Brak połączeń</p>
      {:else}
        <div class="connections-list">
          {#each connections as conn}
            {@const isOutgoing = conn.sourceId === node.id}
            {@const otherId = isOutgoing ? conn.targetId : conn.sourceId}
            {@const strength = conn.influenceStrength}
            <div class="connection-row">
              <div class="conn-direction">
                {#if isOutgoing}
                  <span class="dir-icon outgoing" title="Wychodzące">→</span>
                {:else}
                  <span class="dir-icon incoming" title="Przychodzące">←</span>
                {/if}
              </div>
              <div class="conn-body">
                <div class="conn-name">{getNodeName(otherId)}</div>
                <div class="conn-meta">
                  <span class="conn-type">{typeNames[conn.type] || conn.type}</span>
                  <span class="conn-strength" class:positive={strength > 0} class:negative={strength < 0}>
                    {strength > 0 ? '+' : ''}{(strength * 100).toFixed(0)}%
                  </span>
                  {#if conn.bidirectional}
                    <span class="conn-bidi" title="Dwukierunkowe">⇄</span>
                  {/if}
                </div>
              </div>
              {#if ondeleteConnection}
                <button
                  class="btn-icon"
                  title="Usuń połączenie"
                  onclick={() => ondeleteConnection!(conn.id)}
                >
                  ✕
                </button>
              {/if}
            </div>
          {/each}
        </div>
      {/if}
    </div>

    <div class="section info-section">
      <div class="info-row">
        <span class="info-label">ID</span>
        <span class="info-value mono">{node.id.slice(0, 8)}…</span>
      </div>
    </div>

    <div class="card-actions">
      {#if onedit}
        <button class="btn" onclick={() => onedit!(node)}>
          Edytuj
        </button>
      {/if}
      {#if ondelete}
        <button class="btn btn-danger" onclick={() => ondelete!(node.id)}>
          Usuń
        </button>
      {/if}
    </div>
  </div>
{/if}

<style>
  .card {
    background: var(--sl-color-bg-card);
    border: 1px solid var(--sl-color-border);
    border-radius: 8px;
    padding: 1rem;
  }

  .node-header {
    margin-bottom: 1rem;
  }

  .node-title-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .node-name {
    margin: 0;
    font-size: 1.0625rem;
    font-weight: 600;
    color: var(--sl-color-white);
  }

  .type-badge {
    display: inline-block;
    padding: 0.125rem 0.5rem;
    border-radius: 999px;
    font-size: 0.6875rem;
    font-weight: 500;
    border: 1px solid;
  }

  .section {
    margin-bottom: 1rem;
  }

  .section h4 {
    margin: 0 0 0.5rem;
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--sl-color-gray-3);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .metadata-grid {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .meta-item {
    display: flex;
    justify-content: space-between;
    gap: 0.5rem;
    padding: 0.25rem 0;
    border-bottom: 1px solid var(--sl-color-border);
    font-size: 0.8125rem;
  }

  .meta-key {
    color: var(--sl-color-gray-4);
    font-weight: 500;
  }

  .meta-value {
    color: var(--sl-color-gray-2);
    text-align: right;
    word-break: break-all;
  }

  .no-data {
    color: var(--sl-color-gray-5);
    font-size: 0.8125rem;
    font-style: italic;
    margin: 0;
  }

  .connections-list {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
  }

  .connection-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
    border-radius: 6px;
    background: var(--sl-color-black);
    border: 1px solid var(--sl-color-border);
  }

  .dir-icon {
    font-size: 1rem;
    font-weight: 700;
    width: 1.25rem;
    text-align: center;
    flex-shrink: 0;
  }

  .dir-icon.outgoing {
    color: var(--sl-color-accent);
  }

  .dir-icon.incoming {
    color: #f59e0b;
  }

  .conn-body {
    flex: 1;
    min-width: 0;
  }

  .conn-name {
    font-size: 0.8125rem;
    font-weight: 500;
    color: var(--sl-color-white);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .conn-meta {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.125rem;
  }

  .conn-type {
    font-size: 0.6875rem;
    color: var(--sl-color-gray-4);
  }

  .conn-strength {
    font-size: 0.6875rem;
    font-weight: 600;
  }

  .conn-strength.positive {
    color: #4ade80;
  }

  .conn-strength.negative {
    color: #f87171;
  }

  .conn-bidi {
    font-size: 0.75rem;
    color: var(--sl-color-gray-4);
  }

  .btn-icon {
    background: transparent;
    border: none;
    color: var(--sl-color-gray-5);
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 4px;
    font-size: 0.75rem;
    flex-shrink: 0;
  }

  .btn-icon:hover {
    color: #f87171;
    background: #f8717110;
  }

  .info-section {
    border-top: 1px solid var(--sl-color-border);
    padding-top: 0.75rem;
  }

  .info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .info-label {
    font-size: 0.75rem;
    color: var(--sl-color-gray-5);
  }

  .info-value {
    font-size: 0.75rem;
    color: var(--sl-color-gray-4);
  }

  .info-value.mono {
    font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
  }

  .card-actions {
    display: flex;
    gap: 0.5rem;
    margin-top: 1rem;
    padding-top: 0.75rem;
    border-top: 1px solid var(--sl-color-border);
  }

  .btn {
    flex: 1;
    padding: 0.5rem 0.75rem;
    border-radius: 6px;
    border: 1px solid var(--sl-color-border);
    background: transparent;
    color: var(--sl-color-gray-3);
    font-size: 0.8125rem;
    cursor: pointer;
    transition: all 0.15s;
    text-align: center;
  }

  .btn:hover {
    background: var(--sl-color-gray-6);
    color: var(--sl-color-white);
  }

  .btn-danger {
    border-color: #f8717140;
    color: #f87171;
  }

  .btn-danger:hover {
    background: #f8717115;
    border-color: #f87171;
  }
</style>

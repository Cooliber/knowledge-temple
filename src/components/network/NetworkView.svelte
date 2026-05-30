<script lang="ts">
  import { network } from '$lib/db'
  import type { NetworkNode, NetworkConnection } from '$lib/db/schema'
  import NetworkGraph from './NetworkGraph.svelte'
  import NodeDetail from './NodeDetail.svelte'
  import ConnectionForm from './ConnectionForm.svelte'
  import InfluenceHeatmap from './InfluenceHeatmap.svelte'

  let nodes: NetworkNode[] = $state([])
  let connections: NetworkConnection[] = $state([])
  let loading = $state(true)
  let selectedNodeId: string | null = $state(null)
  let showAddNode = $state(false)
  let showAddConnection = $state(false)
  let showHeatmap = $state(false)
  let connectionSourceId: string | null = $state(null)
  let editingNode: NetworkNode | null = $state(null)

  let newNodeName = $state('')
  let newNodeType: NetworkNode['type'] = $state('person')
  let editName = $state('')
  let editType: NetworkNode['type'] = $state('person')

  $effect(() => {
    loadData()
  })

  async function loadData() {
    loading = true
    try {
      nodes = await network.getAllNodes()
      connections = await network.getAllConnections()
    } finally {
      loading = false
    }
  }

  const selectedNode = $derived(
    nodes.find(n => n.id === selectedNodeId) ?? null
  )

  const selectedNodeConnections = $derived(
    selectedNodeId
      ? connections.filter(c => c.sourceId === selectedNodeId || c.targetId === selectedNodeId)
      : []
  )

  async function handleCreateNode() {
    if (!newNodeName.trim()) return
    const node = await network.createNode({
      name: newNodeName.trim(),
      type: newNodeType,
      metadata: {},
    })
    nodes = [...nodes, node]
    newNodeName = ''
    showAddNode = false
  }

  async function handleCreateConnection(data: Omit<NetworkConnection, 'id'>) {
    const conn = await network.createConnection(data)
    connections = [...connections, conn]
    showAddConnection = false
    connectionSourceId = null
  }

  async function handleDeleteNode(nodeId: string) {
    await network.deleteNode(nodeId)
    nodes = nodes.filter(n => n.id !== nodeId)
    connections = connections.filter(c => c.sourceId !== nodeId && c.targetId !== nodeId)
    selectedNodeId = null
    editingNode = null
  }

  async function handleUpdateNode(id: string, data: Partial<NetworkNode>) {
    const updated = await network.updateNode(id, data)
    if (updated) {
      nodes = nodes.map(n => n.id === id ? updated : n)
      editingNode = null
    }
  }

  async function handleDeleteConnection(id: string) {
    await network.deleteConnection(id)
    connections = connections.filter(c => c.id !== id)
  }

  function handleSelectNode(nodeId: string) {
    if (nodeId === '') {
      selectedNodeId = null
      return
    }
    if (selectedNodeId && selectedNodeId !== nodeId) {
      connectionSourceId = selectedNodeId
      selectedNodeId = nodeId
      showAddConnection = true
    } else if (selectedNodeId === nodeId) {
      selectedNodeId = null
    } else {
      selectedNodeId = nodeId
    }
  }

  function handleGraphCreateConnection(sourceId: string, targetId: string) {
    connectionSourceId = sourceId
    selectedNodeId = targetId
    showAddConnection = true
  }

  function handleEditNode(node: NetworkNode) {
    editingNode = node
    editName = node.name
    editType = node.type
  }

  function handleCancelEdit() {
    editingNode = null
  }
</script>

<div class="network-view">
  <div class="graph-panel">
    <div class="panel-header">
      <h2>Sieć powiązań</h2>
      <div class="panel-actions">
        <button class="btn btn-sm" onclick={() => showHeatmap = !showHeatmap}>
          {showHeatmap ? 'Graf' : 'Mapa wpływów'}
        </button>
        <button class="btn btn-sm" onclick={() => { showAddNode = !showAddNode; showAddConnection = false }}>
          + Węzeł
        </button>
        <button class="btn btn-sm" onclick={() => { showAddConnection = !showAddConnection; showAddNode = false }}>
          + Połączenie
        </button>
      </div>
    </div>

    {#if loading}
      <div class="loading">Ładowanie sieci...</div>
    {:else if showHeatmap}
      <InfluenceHeatmap nodes={nodes} connections={connections} />
    {:else}
      <NetworkGraph
        nodes={nodes}
        connections={connections}
        selectedNodeId={selectedNodeId}
        onselectNode={handleSelectNode}
        oncreateConnection={handleGraphCreateConnection}
      />
    {/if}
  </div>

  <div class="detail-panel">
    {#if showAddNode}
      <div class="card">
        <h3>Nowy węzeł</h3>
        <div class="form-group">
          <label for="new-node-name">Nazwa</label>
          <input id="new-node-name" type="text" bind:value={newNodeName} placeholder="Nazwa węzła..." />
        </div>
        <div class="form-group">
          <label for="new-node-type">Typ</label>
          <select id="new-node-type" bind:value={newNodeType}>
            <option value="person">Osoba</option>
            <option value="group">Grupa</option>
            <option value="institution">Instytucja</option>
            <option value="media">Media</option>
          </select>
        </div>
        <div class="form-actions">
          <button class="btn btn-primary" onclick={handleCreateNode}>Zapisz</button>
          <button class="btn" onclick={() => showAddNode = false}>Anuluj</button>
        </div>
      </div>
    {/if}

    {#if showAddConnection}
      <ConnectionForm
        nodes={nodes}
        sourceId={connectionSourceId}
        onsave={handleCreateConnection}
        oncancel={() => { showAddConnection = false; connectionSourceId = null }}
      />
    {/if}

    {#if editingNode}
      <div class="card">
        <h3>Edytuj węzeł</h3>
        <div class="form-group">
          <label for="edit-node-name">Nazwa</label>
          <input id="edit-node-name" type="text" bind:value={editName} placeholder="Nazwa węzła..." />
        </div>
        <div class="form-group">
          <label for="edit-node-type">Typ</label>
          <select id="edit-node-type" bind:value={editType}>
            <option value="person">Osoba</option>
            <option value="group">Grupa</option>
            <option value="institution">Instytucja</option>
            <option value="media">Media</option>
          </select>
        </div>
        <div class="form-actions">
          <button class="btn btn-primary" onclick={() => handleUpdateNode(editingNode!.id, { name: editName, type: editType })}>Zapisz</button>
          <button class="btn" onclick={handleCancelEdit}>Anuluj</button>
        </div>
      </div>
    {:else if selectedNode}
      <NodeDetail
        node={selectedNode}
        nodes={nodes}
        connections={selectedNodeConnections}
        onedit={handleEditNode}
        ondelete={handleDeleteNode}
        ondeleteConnection={handleDeleteConnection}
      />
    {:else}
      <div class="empty-state">
        <p>Wybierz węzeł, aby zobaczyć szczegóły</p>
        <p class="hint">Kliknij dowolny węzeł na grafie</p>
      </div>
    {/if}
  </div>
</div>

<style>
  .network-view {
    display: flex;
    gap: 1rem;
    height: 100%;
    min-height: calc(100vh - 3rem);
  }

  .graph-panel {
    flex: 3;
    display: flex;
    flex-direction: column;
    background: var(--sl-color-bg-card);
    border: 1px solid var(--sl-color-border);
    border-radius: 8px;
    overflow: hidden;
    min-height: 500px;
  }

  .detail-panel {
    flex: 2;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    min-width: 320px;
    max-width: 420px;
  }

  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    border-bottom: 1px solid var(--sl-color-border);
  }

  .panel-header h2 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: var(--sl-color-white);
  }

  .panel-actions {
    display: flex;
    gap: 0.5rem;
  }

  .btn {
    padding: 0.375rem 0.75rem;
    border-radius: 6px;
    border: 1px solid var(--sl-color-border);
    background: transparent;
    color: var(--sl-color-gray-3);
    font-size: 0.8125rem;
    cursor: pointer;
    transition: all 0.15s;
  }

  .btn:hover {
    background: var(--sl-color-gray-6);
    color: var(--sl-color-white);
    border-color: var(--sl-color-gray-4);
  }

  .btn-sm {
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
  }

  .btn-primary {
    background: var(--sl-color-accent);
    color: var(--sl-color-white);
    border-color: var(--sl-color-accent);
  }

  .btn-primary:hover {
    background: var(--sl-color-accent-high);
    border-color: var(--sl-color-accent-high);
  }

  .card {
    background: var(--sl-color-bg-card);
    border: 1px solid var(--sl-color-border);
    border-radius: 8px;
    padding: 1rem;
  }

  .card h3 {
    margin: 0 0 1rem;
    font-size: 0.9375rem;
    font-weight: 600;
    color: var(--sl-color-white);
  }

  .form-group {
    margin-bottom: 0.75rem;
  }

  .form-group label {
    display: block;
    margin-bottom: 0.25rem;
    font-size: 0.8125rem;
    color: var(--sl-color-gray-3);
  }

  .form-group input,
  .form-group select {
    width: 100%;
    padding: 0.5rem 0.625rem;
    border-radius: 6px;
    border: 1px solid var(--sl-color-border);
    background: var(--sl-color-black);
    color: var(--sl-color-white);
    font-size: 0.875rem;
    box-sizing: border-box;
  }

  .form-group input:focus,
  .form-group select:focus {
    outline: none;
    border-color: var(--sl-color-accent);
  }

  .form-actions {
    display: flex;
    gap: 0.5rem;
    margin-top: 1rem;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem 1rem;
    text-align: center;
    color: var(--sl-color-gray-3);
  }

  .empty-state p {
    margin: 0;
    font-size: 0.875rem;
  }

  .empty-state .hint {
    margin-top: 0.5rem;
    font-size: 0.75rem;
    color: var(--sl-color-gray-5);
  }

  .loading {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
    color: var(--sl-color-gray-3);
    font-size: 0.875rem;
  }
</style>

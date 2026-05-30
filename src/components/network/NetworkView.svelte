<script lang="ts">
  import { network } from '$lib/db'
  import type { NetworkNode, NetworkConnection } from '$lib/db/schema'
  import { Button, Card, CardContent, CardFooter, CardHeader, CardTitle, Input, Label } from '$lib/components/ui'
  import { toast } from 'svelte-sonner'
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
    toast.success('Węzeł utworzony')
  }

  async function handleCreateConnection(data: Omit<NetworkConnection, 'id'>) {
    const conn = await network.createConnection(data)
    connections = [...connections, conn]
    showAddConnection = false
    connectionSourceId = null
    toast.success('Połączenie utworzone')
  }

  async function handleDeleteNode(nodeId: string) {
    await network.deleteNode(nodeId)
    nodes = nodes.filter(n => n.id !== nodeId)
    connections = connections.filter(c => c.sourceId !== nodeId && c.targetId !== nodeId)
    selectedNodeId = null
    editingNode = null
    toast.success('Węzeł usunięty')
  }

  async function handleUpdateNode(id: string, data: Partial<NetworkNode>) {
    const updated = await network.updateNode(id, data)
    if (updated) {
      nodes = nodes.map(n => n.id === id ? updated : n)
      editingNode = null
      toast.success('Węzeł zaktualizowany')
    }
  }

  async function handleDeleteConnection(id: string) {
    await network.deleteConnection(id)
    connections = connections.filter(c => c.id !== id)
    toast.success('Połączenie usunięte')
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
        <Button variant="outline" size="sm" onclick={() => showHeatmap = !showHeatmap}>
          {showHeatmap ? 'Graf' : 'Mapa wpływów'}
        </Button>
        <Button variant="outline" size="sm" onclick={() => { showAddNode = !showAddNode; showAddConnection = false }}>
          + Węzeł
        </Button>
        <Button variant="outline" size="sm" onclick={() => { showAddConnection = !showAddConnection; showAddNode = false }}>
          + Połączenie
        </Button>
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
      <Card>
        <CardHeader>
          <CardTitle class="text-sm">Nowy węzeł</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="form-group">
            <Label for="new-node-name">Nazwa</Label>
            <Input id="new-node-name" type="text" bind:value={newNodeName} placeholder="Nazwa węzła..." />
          </div>
          <div class="form-group">
            <Label for="new-node-type">Typ</Label>
            <select id="new-node-type" bind:value={newNodeType}>
              <option value="person">Osoba</option>
              <option value="group">Grupa</option>
              <option value="institution">Instytucja</option>
              <option value="media">Media</option>
            </select>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="default" onclick={handleCreateNode}>Zapisz</Button>
          <Button variant="outline" onclick={() => showAddNode = false}>Anuluj</Button>
        </CardFooter>
      </Card>
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
      <Card>
        <CardHeader>
          <CardTitle class="text-sm">Edytuj węzeł</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="form-group">
            <Label for="edit-node-name">Nazwa</Label>
            <Input id="edit-node-name" type="text" bind:value={editName} placeholder="Nazwa węzła..." />
          </div>
          <div class="form-group">
            <Label for="edit-node-type">Typ</Label>
            <select id="edit-node-type" bind:value={editType}>
              <option value="person">Osoba</option>
              <option value="group">Grupa</option>
              <option value="institution">Instytucja</option>
              <option value="media">Media</option>
            </select>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="default" onclick={() => handleUpdateNode(editingNode!.id, { name: editName, type: editType })}>Zapisz</Button>
          <Button variant="outline" onclick={handleCancelEdit}>Anuluj</Button>
        </CardFooter>
      </Card>
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

  .form-group {
    margin-bottom: 0.75rem;
  }

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

  .form-group select:focus {
    outline: none;
    border-color: var(--sl-color-accent);
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

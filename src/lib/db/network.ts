import { v4 as uuid } from 'uuid'
import { db } from './database'
import type { NetworkNode, NetworkConnection } from './schema'

export async function getAllNodes(): Promise<NetworkNode[]> {
  return db.networkNodes.toArray()
}

export async function createNode(data: Omit<NetworkNode, 'id'>): Promise<NetworkNode> {
  const node: NetworkNode = { ...data, id: uuid() }
  await db.networkNodes.add(node)
  return node
}

export async function updateNode(id: string, data: Partial<NetworkNode>): Promise<NetworkNode | undefined> {
  const node = await db.networkNodes.get(id)
  if (!node) return undefined

  const updated = { ...node, ...data }
  await db.networkNodes.put(updated)
  return updated
}

export async function deleteNode(id: string): Promise<void> {
  await db.networkNodes.delete(id)
  const connections = await db.networkConnections.where('sourceId').equals(id).or('targetId').equals(id).toArray()
  await db.networkConnections.bulkDelete(connections.map(c => c.id))
}

export async function getAllConnections(): Promise<NetworkConnection[]> {
  return db.networkConnections.toArray()
}

export async function createConnection(data: Omit<NetworkConnection, 'id'>): Promise<NetworkConnection> {
  const connection: NetworkConnection = { ...data, id: uuid() }
  await db.networkConnections.add(connection)
  return connection
}

export async function updateConnection(id: string, data: Partial<NetworkConnection>): Promise<NetworkConnection | undefined> {
  const conn = await db.networkConnections.get(id)
  if (!conn) return undefined

  const updated = { ...conn, ...data }
  await db.networkConnections.put(updated)
  return updated
}

export async function deleteConnection(id: string): Promise<void> {
  await db.networkConnections.delete(id)
}

export async function getConnectionsForNode(nodeId: string): Promise<NetworkConnection[]> {
  return db.networkConnections.where('sourceId').equals(nodeId)
    .or('targetId').equals(nodeId)
    .toArray()
}

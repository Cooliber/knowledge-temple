import Dexie, { type Table } from 'dexie'
import type { Belief, Observation, NetworkNode, NetworkConnection, Decision, Goal } from './schema'

export class MindHarnessDB extends Dexie {
  beliefs!: Table<Belief, string>
  observations!: Table<Observation, string>
  networkNodes!: Table<NetworkNode, string>
  networkConnections!: Table<NetworkConnection, string>
  decisions!: Table<Decision, string>
  goals!: Table<Goal, string>

  constructor() {
    super('mind-harness')
    this.version(1).stores({
      beliefs: 'id, type, category, createdAt',
      observations: 'id, sourceType, category, timestamp',
      networkNodes: 'id, type, name',
      networkConnections: 'id, sourceId, targetId, type',
      decisions: 'id, outcome, timestamp',
      goals: 'id, status, horizon, parentId',
    })
  }
}

export const db = new MindHarnessDB()

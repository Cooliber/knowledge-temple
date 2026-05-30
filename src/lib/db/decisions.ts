import { v4 as uuid } from 'uuid'
import { db } from './database'
import type { Decision } from './schema'

export async function getAllDecisions(): Promise<Decision[]> {
  return db.decisions.orderBy('timestamp').reverse().toArray()
}

export async function getDecisionById(id: string): Promise<Decision | undefined> {
  return db.decisions.get(id)
}

export async function createDecision(data: Omit<Decision, 'id'>): Promise<Decision> {
  const decision: Decision = { ...data, id: uuid() }
  await db.decisions.add(decision)
  return decision
}

export async function updateDecision(id: string, data: Partial<Decision>): Promise<Decision | undefined> {
  const decision = await db.decisions.get(id)
  if (!decision) return undefined

  const updated = { ...decision, ...data }
  await db.decisions.put(updated)
  return updated
}

export async function deleteDecision(id: string): Promise<void> {
  await db.decisions.delete(id)
}

export async function getDecisionsByOutcome(outcome: Decision['outcome']): Promise<Decision[]> {
  return db.decisions.where('outcome').equals(outcome).toArray()
}

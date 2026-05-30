import { v4 as uuid } from 'uuid'
import { db } from './database'
import type { Belief } from './schema'

export async function getAllBeliefs(): Promise<Belief[]> {
  return db.beliefs.orderBy('createdAt').reverse().toArray()
}

export async function getBeliefById(id: string): Promise<Belief | undefined> {
  return db.beliefs.get(id)
}

export async function createBelief(data: Omit<Belief, 'id' | 'createdAt' | 'updatedAt' | 'history'>): Promise<Belief> {
  const now = new Date().toISOString()
  const belief: Belief = {
    ...data,
    id: uuid(),
    history: [{ strength: data.strength, timestamp: now }],
    createdAt: now,
    updatedAt: now,
  }
  await db.beliefs.add(belief)
  return belief
}

export async function updateBeliefStrength(id: string, newStrength: number, observationId?: string): Promise<Belief | undefined> {
  const belief = await db.beliefs.get(id)
  if (!belief) return undefined

  const snapshot = { strength: newStrength, timestamp: new Date().toISOString(), observationId }
  const updated = {
    ...belief,
    strength: newStrength,
    history: [...belief.history, snapshot],
    updatedAt: new Date().toISOString(),
  }
  await db.beliefs.put(updated)
  return updated
}

export async function updateBelief(id: string, data: Partial<Belief>): Promise<Belief | undefined> {
  const belief = await db.beliefs.get(id)
  if (!belief) return undefined

  const updated = { ...belief, ...data, updatedAt: new Date().toISOString() }
  await db.beliefs.put(updated)
  return updated
}

export async function deleteBelief(id: string): Promise<void> {
  await db.beliefs.delete(id)
}

export async function getBeliefsByCategory(category: string): Promise<Belief[]> {
  return db.beliefs.where('category').equals(category).toArray()
}

export async function getBeliefsByType(type: Belief['type']): Promise<Belief[]> {
  return db.beliefs.where('type').equals(type).toArray()
}

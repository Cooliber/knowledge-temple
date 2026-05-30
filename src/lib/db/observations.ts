import { v4 as uuid } from 'uuid'
import { db } from './database'
import type { Observation } from './schema'

export async function getAllObservations(): Promise<Observation[]> {
  return db.observations.orderBy('timestamp').reverse().toArray()
}

export async function getObservationById(id: string): Promise<Observation | undefined> {
  return db.observations.get(id)
}

export async function createObservation(data: Omit<Observation, 'id'>): Promise<Observation> {
  const observation: Observation = { ...data, id: uuid() }
  await db.observations.add(observation)
  return observation
}

export async function updateObservation(id: string, data: Partial<Observation>): Promise<Observation | undefined> {
  const obs = await db.observations.get(id)
  if (!obs) return undefined

  const updated = { ...obs, ...data }
  await db.observations.put(updated)
  return updated
}

export async function deleteObservation(id: string): Promise<void> {
  await db.observations.delete(id)
}

export async function getObservationsBySourceType(sourceType: Observation['sourceType']): Promise<Observation[]> {
  return db.observations.where('sourceType').equals(sourceType).toArray()
}

export async function linkBeliefToObservation(observationId: string, beliefId: string): Promise<void> {
  const obs = await db.observations.get(observationId)
  if (!obs) return

  const beliefs = obs.linkedBeliefs.includes(beliefId) ? obs.linkedBeliefs : [...obs.linkedBeliefs, beliefId]
  await db.observations.put({ ...obs, linkedBeliefs: beliefs })
}

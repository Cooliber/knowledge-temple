import { v4 as uuid } from 'uuid'
import { db } from './database'
import type { Goal } from './schema'

export async function getAllGoals(): Promise<Goal[]> {
  return db.goals.toArray()
}

export async function getGoalById(id: string): Promise<Goal | undefined> {
  return db.goals.get(id)
}

export async function createGoal(data: Omit<Goal, 'id'>): Promise<Goal> {
  const goal: Goal = { ...data, id: uuid() }
  await db.goals.add(goal)
  return goal
}

export async function updateGoal(id: string, data: Partial<Goal>): Promise<Goal | undefined> {
  const goal = await db.goals.get(id)
  if (!goal) return undefined

  const updated = { ...goal, ...data }
  await db.goals.put(updated)
  return updated
}

export async function deleteGoal(id: string): Promise<void> {
  await db.goals.delete(id)
}

export async function getChildGoals(parentId: string): Promise<Goal[]> {
  return db.goals.where('parentId').equals(parentId).toArray()
}

export async function getRootGoals(): Promise<Goal[]> {
  return db.goals.where('parentId').equals('').or('parentId').equals(null).toArray()
}

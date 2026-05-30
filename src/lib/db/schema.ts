export interface BeliefSnapshot {
	strength: number
	timestamp: string
	observationId?: string
}

export interface Belief {
	id: string
	text: string
	strength: number
	type: 'first_order' | 'second_order' | 'third_order'
	subject?: string
	category: string
	tags: string[]
	history: BeliefSnapshot[]
	createdAt: string
	updatedAt: string
}

export interface Observation {
	id: string
	content: string
	source: string
	sourceType: 'person' | 'social_media' | 'news' | 'book' | 'conversation' | 'other'
	attentionLevel: number
	category: string
	tags: string[]
	linkedBeliefs: string[]
	rawContent?: string
	timestamp: string
}

export interface NetworkNode {
	id: string
	name: string
	type: 'person' | 'group' | 'institution' | 'media'
	metadata: Record<string, unknown>
}

export interface NetworkConnection {
	id: string
	sourceId: string
	targetId: string
	influenceStrength: number
	type: 'trust' | 'expertise' | 'emotional' | 'authority'
	bidirectional: boolean
}

export interface Decision {
	id: string
	description: string
	context: string
	beliefs: string[]
	goals: string[]
	threshold: number
	outcome: 'positive' | 'negative' | 'neutral' | 'pending'
	expectedOutcome?: string
	actualOutcome?: string
	timestamp: string
}

export interface Goal {
	id: string
	title: string
	description: string
	parentId: string | null
	priority: number
	progress: number
	deadline?: string
	horizon: 'short' | 'medium' | 'long'
	supportingBeliefs: string[]
	blockingBeliefs: string[]
	status: 'active' | 'completed' | 'abandoned'
}

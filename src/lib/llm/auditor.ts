import { callNVIDIA, type LLMConfig } from './client'
import { AUDITOR_SYSTEM, buildAuditorPrompt } from './prompts'

export interface AuditResult {
  contradiction: boolean
  confidence: number
  explanation: string
}

export async function auditBeliefs(beliefA: string, beliefB: string, config: LLMConfig): Promise<AuditResult> {
  const content = await callNVIDIA(
    [
      { role: 'system', content: AUDITOR_SYSTEM },
      { role: 'user', content: buildAuditorPrompt(beliefA, beliefB) },
    ],
    config,
  )

  try {
    return JSON.parse(content) as AuditResult
  } catch {
    return { contradiction: false, confidence: 0, explanation: 'Failed to parse response' }
  }
}

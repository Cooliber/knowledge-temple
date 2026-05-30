import { callNVIDIA, type LLMConfig } from './client'
import { ANALYZER_SYSTEM, buildAnalyzerPrompt } from './prompts'

export interface AnalysisResult {
  trends: Array<{ description: string; strength: number }>
  blindSpots: Array<{ description: string }>
  suggestions: Array<{ action: string; reason: string }>
}

export async function analyzePatterns(
  beliefs: Array<{ text: string; strength: number; history: Array<{ timestamp: string; strength: number }> }>,
  observations: Array<{ content: string; source: string; timestamp: string }>,
  config: LLMConfig,
): Promise<AnalysisResult> {
  const content = await callNVIDIA(
    [
      { role: 'system', content: ANALYZER_SYSTEM },
      { role: 'user', content: buildAnalyzerPrompt(beliefs, observations) },
    ],
    { ...config, maxTokens: 2048 },
  )

  try {
    return JSON.parse(content) as AnalysisResult
  } catch {
    return { trends: [], blindSpots: [], suggestions: [] }
  }
}

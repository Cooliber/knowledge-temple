import { callNVIDIA, type LLMConfig } from './client'
import { TRANSLATOR_SYSTEM, buildTranslatePrompt } from './prompts'

export interface TranslateResult {
  observation: {
    content: string
    source: string
    sourceType: 'person' | 'social_media' | 'news' | 'book' | 'conversation' | 'other'
  } | null
  beliefUpdate: {
    text: string
    strength: number
    category: string
  } | null
}

export async function translateEntry(rawText: string, config: LLMConfig): Promise<TranslateResult> {
  const content = await callNVIDIA(
    [
      { role: 'system', content: TRANSLATOR_SYSTEM },
      { role: 'user', content: buildTranslatePrompt(rawText) },
    ],
    config,
  )

  try {
    return JSON.parse(content) as TranslateResult
  } catch {
    return {
      observation: { content: rawText, source: 'unknown', sourceType: 'other' },
      beliefUpdate: null,
    }
  }
}

const NVIDIA_API_URL = 'https://integrate.api.nvidia.com/v1/chat/completions'

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface LLMConfig {
  apiKey: string
  model: string
  temperature?: number
  maxTokens?: number
}

export async function callNVIDIA(
  messages: LLMMessage[],
  config: LLMConfig,
): Promise<string> {
  const response = await fetch(NVIDIA_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages,
      temperature: config.temperature ?? 0.3,
      max_tokens: config.maxTokens ?? 1024,
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`NVIDIA NIM API error (${response.status}): ${text}`)
  }

  const data = await response.json()
  return data.choices[0].message.content
}

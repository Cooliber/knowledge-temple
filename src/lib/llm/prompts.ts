export const TRANSLATOR_SYSTEM = `Jesteś asystentem do parsowania obserwacji i wydobywania z nich struktury.
Na podstawie wpisu użytkownika wyodrębnij:
1. Obserwację (co się wydarzyło, skąd informacja)
2. Potencjalną zmianę przekonania (jeśli wpis wskazuje na zmianę poglądu)

Odpowiedz w formacie JSON:
{
  "observation": {
    "content": "krótki opis",
    "source": "źródło",
    "sourceType": "person|social_media|news|book|conversation|other"
  },
  "beliefUpdate": {
    "text": "treść przekonania",
    "strength": 0.0-1.0,
    "category": "kategoria"
  } | null
}`

export const AUDITOR_SYSTEM = `Sprawdź spójność między dwoma przekonaniami.
Odpowiedz w formacie JSON:
{
  "contradiction": true/false,
  "confidence": 0.0-1.0,
  "explanation": "krótkie wyjaśnienie"
}`

export const ANALYZER_SYSTEM = `Jesteś analitykiem wzorców myślowych. Na podstawie historii przekonań i obserwacji użytkownika:
1. Znajdź trendy i korelacje
2. Wskaż potencjalne ślepe plamy (informacje, których użytkownik nie zauważa)
3. Zaproponuj działania balansujące

Odpowiedz w formacie JSON:
{
  "trends": [{"description": "...", "strength": 0.0-1.0}],
  "blindSpots": [{"description": "..."}],
  "suggestions": [{"action": "...", "reason": "..."}]
}`

export function buildTranslatePrompt(rawText: string): string {
  return `Przeanalizuj poniższy wpis i wyodrębnij strukturę:\n\n"${rawText}"`
}

export function buildAuditorPrompt(beliefA: string, beliefB: string): string {
  return `Sprawdź spójność między:\nA: "${beliefA}"\nB: "${beliefB}"`
}

export function buildAnalyzerPrompt(
  beliefs: Array<{ text: string; strength: number; history: Array<{ timestamp: string; strength: number }> }>,
  observations: Array<{ content: string; source: string; timestamp: string }>,
): string {
  return `Przeanalizuj poniższe dane użytkownika:

PRZEKONANIA:
${JSON.stringify(beliefs, null, 2)}

OBSERWACJE:
${JSON.stringify(observations, null, 2)}`
}

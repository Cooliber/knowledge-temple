# Mind Harness — Architektura Aplikacji

## Cel

Aplikacja do zarządzania sobą i swoimi sieciami, oparta na koncepcji **User Harness** z research paper "Human Mind Reconstruction w AI (ToM, UserHarness)".

Odwraca architekturę z narzędzia manipulacji (jak w oryginalnym paper) w narzędzie **samorozwoju i samoświadomości**.

## Tech Stack

| Warstwa | Technologia |
|---------|-------------|
| Site framework | Astro 6 + Starlight |
| App framework | Svelte 5 (runes) |
| UI komponenty | shadcn-svelte / Melt UI |
| Wizualizacje | D3.js |
| Persistence | Dexie.js (IndexedDB) |
| LLM Integration | NVIDIA NIM API (`NVIDIA_NIM_API_KEY`) |
| Routing app | `src/pages/app/` (Astro) + Svelte komponenty |

## Struktura Plików

```
src/
├── components/
│   ├── layout/          # AppShell, AppNav, StatsCard
│   ├── beliefs/         # BeliefList, BeliefCard, BeliefForm, BeliefTimeline, BeliefHierarchy
│   ├── observations/    # ObsJournal, ObsEntry, ObsForm, OmegaFilter
│   ├── network/         # NetworkGraph, NodeDetail, ConnectionForm, InfluenceHeatmap
│   ├── decisions/       # DecisionLog, DecisionForm, DecisionCard, DecisionOutcome
│   ├── goals/           # GoalTree, GoalForm, GoalCard, BeliefAlignment
│   ├── analysis/        # InsightsDashboard, InfluenceAnalysis, ContradictionDetector, TrendChart
│   └── shared/          # StrengthSlider, TagInput, Timeline, EmptyState
├── lib/
│   ├── db/              # schema.ts, database.ts, beliefs.ts, observations.ts, network.ts, decisions.ts, goals.ts
│   └── llm/             # client.ts, prompts.ts, translator.ts, auditor.ts, analyzer.ts
├── pages/
│   └── app/             # dashboard, beliefs, observations, network, decisions, goals, analysis, settings
└── content/
    └── docs/            # Starlight documentation
docs/
└── plans/               # Plany architektury
```

## Data Schema (IndexedDB — Dexie.js)

### Belief
- `id: string` — UUID
- `text: string` — treść przekonania
- `strength: number` — siła 0.0–1.0
- `type: 'first_order' | 'second_order' | 'third_order'`
- `subject?: string` — dla 2nd/3rd: o kim to przekonanie
- `category: string`
- `tags: string[]`
- `history: BeliefSnapshot[]` — { strength, timestamp, observationId? }
- `createdAt: Date`
- `updatedAt: Date`

### Observation
- `id: string`
- `content: string` — treść obserwacji
- `source: string` — źródło
- `sourceType: 'person' | 'social_media' | 'news' | 'book' | 'conversation' | 'other'`
- `attentionLevel: number` — 0.0–1.0 (filtr epistemiczny)
- `category: string`
- `tags: string[]`
- `linkedBeliefs: string[]` — ID przekonań
- `rawContent?: string` — dla LLM
- `timestamp: Date`

### NetworkNode
- `id: string`
- `name: string`
- `type: 'person' | 'group' | 'institution' | 'media'`
- `metadata: Record<string, any>`

### NetworkConnection
- `sourceId: string`
- `targetId: string`
- `influenceStrength: number` — -1.0 do 1.0
- `type: 'trust' | 'expertise' | 'emotional' | 'authority'`
- `bidirectional: boolean`

### Decision
- `id: string`
- `description: string`
- `context: string`
- `beliefs: string[]` — ID przekonań
- `goals: string[]` — ID celów
- `threshold: number` — próg aktywacji
- `outcome: 'positive' | 'negative' | 'neutral' | 'pending'`
- `expectedOutcome?: string`
- `actualOutcome?: string`
- `timestamp: Date`

### Goal
- `id: string`
- `title: string`
- `description: string`
- `parentId: string | null`
- `priority: number` — 1–10
- `progress: number` — 0–100%
- `deadline?: Date`
- `horizon: 'short' | 'medium' | 'long'`
- `supportingBeliefs: string[]`
- `blockingBeliefs: string[]`
- `status: 'active' | 'completed' | 'abandoned'`

## LLM Integration (NVIDIA NIM)

Trzy role (wzorem User Harness paper):

1. **Translator** — surowy tekst → struktura (observation + beliefUpdate)
2. **Auditor** — sprawdza spójność przekonań
3. **Pattern Analyzer** — wykrywa wzorce i trendy

Endpoint: `https://integrate.api.nvidia.com/v1/chat/completions`

## Mapa Stron

```
/ (Starlight docs)
├── theory/overview              # Czym jest User Harness
├── theory/omega-filter          # Filtr epistemiczny
├── theory/belief-dynamics       # Dynamika przekonań
├── theory/decision-policy       # Polityka decyzyjna
├── theory/nested-beliefs        # Zagnieżdżone przekonania
├── theory/group-dynamics        # Dynamika grupowa
├── app/getting-started          # Pierwsze kroki
├── app/beliefs                  # Moduł przekonań
├── app/observations             # Dziennik obserwacji
├── app/network                  # Mapa sieci
├── app/decisions                # Decyzje
└── app/analysis                 # Analiza

/app/dashboard                   # Główny dashboard
/app/beliefs                     # Mapa przekonań (CRUD + ewolucja)
/app/observations                # Dziennik obserwacji (filtr Omega)
/app/network                     # Mapa sieci społecznej (graf D3)
/app/decisions                   # Bramka decyzyjna
/app/goals                       # System celów
/app/analysis                    # Analiza wpływów
/app/settings                    # Ustawienia (LLM API key, etc.)
```

## Kolejność Implementacji

| Krok | Co | Zależności |
|------|----|-----------|
| 0 | Setup: @astrojs/svelte + zależności | — |
| 1 | Database Schema + CRUD (wszystkie kolekcje) | Krok 0 |
| 2 | Beliefs moduł: lista, formularz, karta | Krok 1 |
| 3 | Belief Timeline (D3) + Hierarchy | Krok 2 |
| 4 | Observations moduł: dziennik, formularz | Krok 1 |
| 5 | Dashboard główny | Kroki 2-4 |
| 6 | LLM Integration: NVIDIA NIM client | Krok 0 |
| 7 | LLM-assisted form | Kroki 4+6 |
| 8 | Network moduł: D3 force graph | Krok 1 |
| 9 | Decisions moduł | Krok 1 |
| 10 | Goals moduł | Krok 1 |
| 11 | Analysis: Insights + Contradiction | Kroki 2-10 |
| 12 | Starlight docs | — |
| 13 | Polerowanie | Wszystko |

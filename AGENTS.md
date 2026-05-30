# Memory

## Project Overview
Mind Harness - aplikacja do zarządzania sobą i swoimi sieciami, oparta na koncepcji **User Harness** (rekonstrukcja modelu poznawczego z Theory of Mind).

Odwraca architekturę z narzędzia manipulacji w narzędzie **samorozwoju i samoświadomości**.

See @README.md for detailed overview and @package.json for available npm/pnpm commands.

## Tech Stack

| Warstwa | Technologia |
|---------|-------------|
| Site framework | Astro 6 + Starlight |
| App framework | Svelte 5 (runes) |
| UI komponenty | shadcn-svelte / Melt UI |
| Wizualizacje | D3.js |
| Persistence | Dexie.js (IndexedDB) |
| LLM Integration | NVIDIA NIM API |

## Architecture

### Struktura Plików
```
src/
├── components/
│   ├── layout/          # AppShell, AppNav, StatsCard
│   ├── beliefs/         # BeliefList, BeliefCard, BeliefForm, BeliefTimeline
│   ├── observations/    # ObsJournal, ObsEntry, ObsForm, OmegaFilter
│   ├── network/         # NetworkGraph, NodeDetail, ConnectionForm
│   ├── decisions/       # DecisionLog, DecisionForm, DecisionCard
│   ├── goals/           # GoalTree, GoalForm, GoalCard
│   ├── analysis/        # InsightsDashboard, ContradictionDetector
│   └── shared/          # StrengthSlider, TagInput, Timeline
├── lib/
│   ├── db/              # Dexie schema + CRUD (beliefs, observations, network, decisions, goals)
│   └── llm/             # NVIDIA NIM client + role (translator, auditor, analyzer)
├── pages/app/           # Dashboard routes
└── content/docs/        # Starlight documentation
```

### Data Schema (Dexie.js / IndexedDB)

**Belief**: id, text, strength (0-1), type (first/second/third_order), subject, category, tags, history[], timestamps

**Observation**: id, content, source, sourceType, attentionLevel (0-1), category, tags, linkedBeliefs[], rawContent, timestamp

**NetworkNode**: id, name, type (person/group/institution/media), metadata

**NetworkConnection**: sourceId, targetId, influenceStrength (-1 to 1), type (trust/expertise/emotional/authority), bidirectional

**Decision**: id, description, context, beliefs[], goals[], threshold, outcome, expected/actualOutcome, timestamp

**Goal**: id, title, description, parentId, priority (1-10), progress (0-100%), deadline, horizon (short/medium/long), supporting/blockingBeliefs[], status

### LLM Integration (NVIDIA NIM)

Trzy role (zgodnie z User Harness paper):
1. **Translator** — parsuje surowy tekst → struktura (observation + beliefUpdate)
2. **Auditor** — sprawdza spójność przekonań
3. **Analyzer** — wykrywa wzorce i trendy

Endpoint: `https://integrate.api.nvidia.com/v1/chat/completions`

## Code Style Guidelines
- Use descriptive variable names
- Follow existing patterns in the codebase
- Extract complex conditions into meaningful boolean variables
- Svelte 5 runes syntax (`$state`, `$derived`, `$effect`)

## Common Workflows

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run preview  # Preview build
```

Dashboard: `/app/dashboard`
Dokumentacja: `/`

## Implementation Plan

See @docs/plans/architecture.md for full implementation roadmap.

| Krok | Co | Status |
|------|----|--------|
| 0 | Setup: Astro + Svelte + deps | ✅ |
| 1 | Database Schema + CRUD | ✅ |
| 2 | Beliefs module | ✅ |
| 3 | Belief Timeline (D3) | ✅ |
| 4 | Observations module | ✅ |
| 5 | Dashboard | ✅ |
| 6 | LLM Integration | ⏳ |
| 7 | LLM-assisted forms | ⏳ |
| 8 | Network module (D3 force) | ⏳ |
| 9 | Decisions module | ⏳ |
| 10 | Goals module | ⏳ |
| 11 | Analysis module | ⏳ |
| 12 | Starlight docs | ⏳ |
| 13 | Polishing | ⏳ |

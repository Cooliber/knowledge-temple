# Mind Harness

Aplikacja do zarządzania sobą i swoimi sieciami, oparta na koncepcji **User Harness** — rekonstrukcji ludzkiego modelu poznawczego z użyciem Theory of Mind.

## Stack

- **Astro 6** + **Starlight** — dokumentacja i strony statyczne
- **Svelte 5** (runes) — interaktywny dashboard
- **Dexie.js** — IndexedDB offline
- **D3.js** — wizualizacje (force graph, timeline, wykresy)
- **NVIDIA NIM** — LLM integration (translator, auditor, analyzer)
- **shadcn-inspired** — dark theme UI

## Moduły

| Moduł | Koncept User Harness | Opis |
|-------|---------------------|------|
| Dashboard | — | Panel główny z podsumowaniem |
| Przekonania | `B_u(t)` — belief state | Śledzenie przekonań 1st/2nd/3rd order z historią |
| Obserwacje | `Ω` — omega filter | Dziennik obserwacji z filtrem epistemicznym |
| Sieć | nested beliefs | Graf wpływów społecznych (D3 force) |
| Decyzje | `π(B,G)→A` — policy | Rejestr decyzji z threshold gauge |
| Cele | `G(t)` — goal hierarchy | Drzewo celów z progress barami |
| Analiza | pattern detection | Wykresy, trendy, detekcja sprzeczności (LLM) |

## Szybki start

```bash
npm install
npm run dev
```

Dashboard: `/app/dashboard`
Dokumentacja: `/`

## LLM Integration (NVIDIA NIM)

1. Wejdź w **Ustawienia** → **LLM API Key**
2. Wpisz klucz NVIDIA NIM
3. Domyślny model: `meta/llama-3.1-8b-instruct`

Trzy role (zgodnie z User Harness paper):
- **Translator** — parsuje surowy tekst na strukturę (observation + beliefUpdate)
- **Auditor** — sprawdza spójność przekonań
- **Analyzer** — wykrywa wzorce i trendy

## Struktura

```
src/
├── components/       # Svelte 5 komponenty UI
│   ├── beliefs/      # Moduł przekonań
│   ├── observations/ # Dziennik obserwacji
│   ├── network/      # Mapa sieci (D3)
│   ├── decisions/    # Rejestr decyzji
│   ├── goals/        # System celów
│   ├── analysis/     # Analiza i insighty
│   └── layout/       # Aplikacyjny shell
├── lib/
│   ├── db/           # Dexie.js — IndexedDB schema + CRUD
│   └── llm/          # NVIDIA NIM client + role
├── pages/app/        # Dashboard routes
└── content/docs/     # Starlight dokumentacja
```

## Teoria

Oparte na research paper "User Harness" (University of Illinois Urbana-Champaign, May 2026):
- Filtr epistemiczny Omega (Ω) — co użytkownik faktycznie zauważa
- Dynamika przekonań Gamma (γ) — reguły aktualizacji
- Polityka decyzyjna Pi (π) — kiedy przekonania → akcja
- Zagnieżdżone przekonania — 1st/2nd/3rd order Theory of Mind

## Licencja

MIT

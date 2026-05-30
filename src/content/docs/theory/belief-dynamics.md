---
title: Dynamika Przekonań (γ)
description: Jak przekonania ewoluują w czasie — belief update operator
---

Funkcja gamma (γ) odpowiada za aktualizację przekonań na podstawie nowych obserwacji.

**Zasady aktualizacji (zgodnie z User Harness):**
1. **Brak obserwacji** → brak zmiany: `B_u(t) = B_u(t-1)`
2. **Wiadomość** → wpływa tylko jeśli użytkownik jest odbiorcą
3. **Zagnieżdżone przekonania** — zmiana wymaga propagacji przez hierarchię

**Hierarchia przekonań:**
- First-order: "Wierzę, że X"
- Second-order: "Wierzę, że Anna wierzy, że X"
- Third-order: "Wierzę, że Anna wierzy, że Kasia wierzy, że X"

W aplikacji każde przekonanie ma **siłę** (0.0–1.0) i **historię zmian**.

<script lang="ts">
  import { db } from '$lib/db'

  let apiKey: string = $state('')
  let modelName: string = $state('meta/llama-3.1-8b-instruct')
  let apiSaved: boolean = $state(false)
  let confirmClear: boolean = $state(false)
  let importStatus: string = $state('')
  let exportStatus: string = $state('')

  $effect(() => {
    const savedKey = localStorage.getItem('mind-harness-nvidia-key')
    const savedModel = localStorage.getItem('mind-harness-nvidia-model')
    if (savedKey) apiKey = savedKey
    if (savedModel) modelName = savedModel
  })

  function saveApiSettings() {
    localStorage.setItem('mind-harness-nvidia-key', apiKey)
    localStorage.setItem('mind-harness-nvidia-model', modelName)
    apiSaved = true
    setTimeout(() => apiSaved = false, 2000)
  }

  async function exportData() {
    try {
      const data = {
        beliefs: await db.beliefs.toArray(),
        observations: await db.observations.toArray(),
        networkNodes: await db.networkNodes.toArray(),
        networkConnections: await db.networkConnections.toArray(),
        decisions: await db.decisions.toArray(),
        goals: await db.goals.toArray(),
      }
      const json = JSON.stringify(data, null, 2)
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `mind-harness-export-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
      exportStatus = 'Dane wyeksportowane'
      setTimeout(() => exportStatus = '', 3000)
    } catch (err) {
      exportStatus = 'Błąd eksportu'
    }
  }

  async function importData(event: Event) {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]
    if (!file) return
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      await db.beliefs.clear()
      await db.observations.clear()
      await db.networkNodes.clear()
      await db.networkConnections.clear()
      await db.decisions.clear()
      await db.goals.clear()
      if (data.beliefs?.length) await db.beliefs.bulkAdd(data.beliefs)
      if (data.observations?.length) await db.observations.bulkAdd(data.observations)
      if (data.networkNodes?.length) await db.networkNodes.bulkAdd(data.networkNodes)
      if (data.networkConnections?.length) await db.networkConnections.bulkAdd(data.networkConnections)
      if (data.decisions?.length) await db.decisions.bulkAdd(data.decisions)
      if (data.goals?.length) await db.goals.bulkAdd(data.goals)
      importStatus = `Zaimportowano dane`
      setTimeout(() => importStatus = '', 5000)
    } catch {
      importStatus = 'Błąd importu — nieprawidłowy plik'
    }
    input.value = ''
  }

  async function clearAll() {
    try {
      await db.beliefs.clear()
      await db.observations.clear()
      await db.networkNodes.clear()
      await db.networkConnections.clear()
      await db.decisions.clear()
      await db.goals.clear()
      confirmClear = false
      importStatus = 'Wszystkie dane usunięte'
      setTimeout(() => importStatus = '', 3000)
    } catch {
      importStatus = 'Błąd usuwania danych'
    }
  }
</script>

<div class="settings">
  <section class="mh-card settings-section mh-animate mh-animate-d1">
    <h2 class="section-title">
      <span class="section-icon">⚿</span>
      LLM API Key
    </h2>
    <p class="section-desc">Skonfiguruj dostęp do modeli NVIDIA NIM do analizy przekonań i wykrywania sprzeczności.</p>

    <div class="field">
      <label for="api-key">NVIDIA NIM API Key</label>
      <input
        id="api-key"
        type="password"
        bind:value={apiKey}
        placeholder="nvapi-..."
        class="mh-input"
      />
    </div>

    <div class="field">
      <label for="model-name">Model</label>
      <input
        id="model-name"
        type="text"
        bind:value={modelName}
        placeholder="meta/llama-3.1-8b-instruct"
        class="mh-input"
      />
    </div>

    <div class="field-actions">
      <button onclick={saveApiSettings} class="mh-btn mh-btn-primary">
        {apiSaved ? 'Zapisano ✓' : 'Zapisz'}
      </button>
    </div>
  </section>

  <section class="mh-card settings-section mh-animate mh-animate-d2">
    <h2 class="section-title">
      <span class="section-icon">▦</span>
      Zarządzanie Danymi
    </h2>
    <p class="section-desc">Eksportuj, importuj lub usuwaj dane aplikacji.</p>

    <div class="data-actions">
      <div class="action-row">
        <div class="action-info">
          <strong>Eksport danych</strong>
          <span>Pobierz wszystkie dane jako plik JSON</span>
        </div>
        <button onclick={exportData} class="mh-btn mh-btn-secondary">Eksportuj</button>
      </div>

      <div class="action-row">
        <div class="action-info">
          <strong>Import danych</strong>
          <span>Wczytaj dane z pliku JSON (zastępuje istniejące)</span>
        </div>
        <label class="mh-btn mh-btn-secondary file-btn">
          Importuj
          <input type="file" accept=".json" onchange={importData} hidden />
        </label>
      </div>

      <div class="action-row danger">
        <div class="action-info">
          <strong>Usuń wszystkie dane</strong>
          <span>Trwale usuwa wszystkie przekonania, obserwacje, decyzje i cele</span>
        </div>
        {#if confirmClear}
          <div class="confirm-group">
            <span class="confirm-text">Na pewno?</span>
            <button onclick={clearAll} class="mh-btn mh-btn-danger">Tak, usuń</button>
            <button onclick={() => confirmClear = false} class="mh-btn mh-btn-secondary">Anuluj</button>
          </div>
        {:else}
          <button onclick={() => confirmClear = true} class="mh-btn mh-btn-danger">Usuń wszystko</button>
        {/if}
      </div>
    </div>

    {#if importStatus}
      <div class="status-bar">{importStatus}</div>
    {/if}
  </section>

  <section class="mh-card settings-section mh-animate mh-animate-d3">
    <h2 class="section-title">
      <span class="section-icon">◉</span>
      O aplikacji
    </h2>
    <div class="about-grid">
      <div class="about-item">
        <span class="about-label">Nazwa</span>
        <span class="about-value">Mind Harness</span>
      </div>
      <div class="about-item">
        <span class="about-label">Wersja</span>
        <span class="about-value">1.0.0</span>
      </div>
      <div class="about-item">
        <span class="about-label">Silnik</span>
        <span class="about-value">User Harness / Theory of Mind</span>
      </div>
      <div class="about-item">
        <span class="about-label">Dane</span>
        <span class="about-value">IndexedDB (lokalnie)</span>
      </div>
    </div>
  </section>
</div>

<style>
  .settings {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-width: 640px;
  }

  .settings-section {
    padding: 1.25rem;
  }

  .section-title {
    font-size: 0.9375rem;
    font-weight: 700;
    color: var(--mh-text);
    margin-bottom: 0.25rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .section-icon {
    font-size: 0.875rem;
    opacity: 0.4;
  }

  .section-desc {
    font-size: 0.75rem;
    color: var(--mh-text-muted);
    margin-bottom: 1rem;
  }

  .field {
    margin-bottom: 0.75rem;
  }

  .field label {
    display: block;
    font-size: 0.75rem;
    color: var(--mh-text-secondary);
    font-weight: 500;
    margin-bottom: 0.375rem;
  }

  .field-actions {
    margin-top: 0.75rem;
  }

  .data-actions {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .action-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.75rem;
    background: var(--mh-bg-elevated);
    border-radius: var(--mh-radius-sm);
    border: 1px solid transparent;
    transition: border-color var(--mh-transition-fast);
  }

  .action-row.danger {
    border-color: rgba(239, 68, 68, 0.15);
  }

  .action-info {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    flex: 1;
    min-width: 0;
  }

  .action-info strong {
    font-size: 0.8125rem;
    color: var(--mh-text);
    font-weight: 600;
  }

  .action-info span {
    font-size: 0.75rem;
    color: var(--mh-text-muted);
  }

  .confirm-group {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-shrink: 0;
  }

  .confirm-text {
    font-size: 0.75rem;
    color: var(--mh-danger);
    font-weight: 600;
  }

  .file-btn {
    cursor: pointer;
  }

  .status-bar {
    margin-top: 0.75rem;
    padding: 0.5rem 0.75rem;
    background: var(--mh-success-subtle);
    border: 1px solid rgba(34, 197, 94, 0.2);
    border-radius: var(--mh-radius-sm);
    font-size: 0.8125rem;
    color: var(--mh-success);
  }

  .about-grid {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
  }

  .about-item {
    display: flex;
    gap: 1rem;
    padding: 0.5rem 0;
    border-bottom: 1px solid var(--mh-border);
  }

  .about-item:last-child {
    border-bottom: none;
  }

  .about-label {
    font-size: 0.75rem;
    color: var(--mh-text-muted);
    min-width: 5rem;
    flex-shrink: 0;
  }

  .about-value {
    font-size: 0.8125rem;
    color: var(--mh-text);
  }
</style>

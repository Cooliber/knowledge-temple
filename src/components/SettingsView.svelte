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
      exportStatus = 'Dane wyeksportowane pomyślnie'
      setTimeout(() => exportStatus = '', 3000)
    } catch (err) {
      exportStatus = 'Błąd eksportu: ' + (err instanceof Error ? err.message : 'nieznany błąd')
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

      importStatus = `Zaimportowano: ${data.beliefs?.length || 0} przekonań, ${data.observations?.length || 0} obserwacji, ${data.decisions?.length || 0} decyzji, ${data.goals?.length || 0} celów`
      setTimeout(() => importStatus = '', 5000)
    } catch (err) {
      importStatus = 'Błąd importu: ' + (err instanceof Error ? err.message : 'nieprawidłowy plik')
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
      importStatus = 'Wszystkie dane zostały usunięte'
      setTimeout(() => importStatus = '', 3000)
    } catch (err) {
      importStatus = 'Błąd usuwania danych: ' + (err instanceof Error ? err.message : 'nieznany błąd')
    }
  }
</script>

<div class="settings">
  <section class="card">
    <h2 class="section-title">LLM API Key</h2>
    <p class="section-desc">Skonfiguruj dostęp do modeli NVIDIA NIM dla analizy przekonań i wykrywania sprzeczności.</p>

    <div class="form-group">
      <label for="api-key">NVIDIA NIM API Key</label>
      <input
        id="api-key"
        type="password"
        bind:value={apiKey}
        placeholder="nvapi-..."
        class="input"
      />
    </div>

    <div class="form-group">
      <label for="model-name">Model</label>
      <input
        id="model-name"
        type="text"
        bind:value={modelName}
        placeholder="meta/llama-3.1-8b-instruct"
        class="input"
      />
    </div>

    <div class="form-actions">
      <button onclick={saveApiSettings} class="btn btn-primary">
        {apiSaved ? 'Zapisano ✓' : 'Zapisz'}
      </button>
    </div>
  </section>

  <section class="card">
    <h2 class="section-title">Zarządzanie Danymi</h2>
    <p class="section-desc">Eksportuj, importuj lub usuwaj wszystkie dane aplikacji.</p>

    <div class="data-actions">
      <div class="action-row">
        <div class="action-info">
          <strong>Eksport danych</strong>
          <span>Pobierz wszystkie dane jako plik JSON</span>
        </div>
        <button onclick={exportData} class="btn btn-secondary">Eksportuj</button>
      </div>

      <div class="action-row">
        <div class="action-info">
          <strong>Import danych</strong>
          <span>Wczytaj dane z pliku JSON (zastępuje istniejące)</span>
        </div>
        <label class="btn btn-secondary file-btn">
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
            <button onclick={clearAll} class="btn btn-danger">Tak, usuń</button>
            <button onclick={() => confirmClear = false} class="btn btn-ghost">Anuluj</button>
          </div>
        {:else}
          <button onclick={() => confirmClear = true} class="btn btn-danger">Usuń wszystko</button>
        {/if}
      </div>
    </div>

    {#if importStatus}
      <div class="status-message">{importStatus}</div>
    {/if}
  </section>

  <section class="card">
    <h2 class="section-title">O aplikacji</h2>
    <div class="about-info">
      <div class="about-row">
        <span class="about-label">Nazwa</span>
        <span class="about-value">Mind Harness</span>
      </div>
      <div class="about-row">
        <span class="about-label">Wersja</span>
        <span class="about-value">1.0.0</span>
      </div>
      <div class="about-row">
        <span class="about-label">Opis</span>
        <span class="about-value">Osobiste narzędzie do zarządzania sobą oparte na koncepcjach Theory of Mind</span>
      </div>
      <div class="about-row">
        <span class="about-label">Źródła</span>
        <span class="about-value">Based on User Harness research paper</span>
      </div>
    </div>
  </section>
</div>

<style>
  .settings {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    max-width: 640px;
  }

  .card {
    background: var(--sl-color-bg-card);
    border: 1px solid var(--sl-color-border);
    border-radius: 8px;
    padding: 1.25rem;
  }

  .section-title {
    font-size: 1rem;
    font-weight: 700;
    color: var(--sl-color-white);
    margin-bottom: 0.25rem;
  }

  .section-desc {
    font-size: 0.8125rem;
    color: var(--sl-color-gray-4);
    margin-bottom: 1rem;
  }

  .form-group {
    margin-bottom: 0.75rem;
  }

  .form-group label {
    display: block;
    font-size: 0.75rem;
    color: var(--sl-color-gray-3);
    font-weight: 600;
    margin-bottom: 0.375rem;
  }

  .input {
    width: 100%;
    padding: 0.5rem 0.75rem;
    background: var(--sl-color-gray-7);
    border: 1px solid var(--sl-color-border);
    border-radius: 6px;
    color: var(--sl-color-text);
    font-size: 0.875rem;
    font-family: inherit;
  }

  .input:focus {
    outline: none;
    border-color: var(--sl-color-accent);
  }

  .form-actions {
    margin-top: 0.75rem;
  }

  .btn {
    padding: 0.5rem 1rem;
    border-radius: 6px;
    font-size: 0.8125rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;
    border: none;
    font-family: inherit;
  }

  .btn-primary {
    background: var(--sl-color-accent);
    color: #fff;
  }

  .btn-primary:hover {
    background: #6d28d9;
  }

  .btn-secondary {
    background: var(--sl-color-gray-7);
    color: var(--sl-color-text);
    border: 1px solid var(--sl-color-border);
  }

  .btn-secondary:hover {
    background: var(--sl-color-gray-5);
  }

  .btn-danger {
    background: #dc2626;
    color: #fff;
  }

  .btn-danger:hover {
    background: #b91c1c;
  }

  .btn-ghost {
    background: transparent;
    color: var(--sl-color-gray-3);
    border: 1px solid var(--sl-color-border);
  }

  .btn-ghost:hover {
    background: var(--sl-color-gray-7);
    color: var(--sl-color-white);
  }

  .file-btn {
    display: inline-block;
    cursor: pointer;
  }

  .data-actions {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .action-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.75rem;
    background: var(--sl-color-gray-7);
    border-radius: 6px;
  }

  .action-row.danger {
    border: 1px solid rgba(220, 38, 38, 0.3);
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
    color: var(--sl-color-text);
  }

  .action-info span {
    font-size: 0.75rem;
    color: var(--sl-color-gray-4);
  }

  .confirm-group {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-shrink: 0;
  }

  .confirm-text {
    font-size: 0.75rem;
    color: #f87171;
    font-weight: 600;
  }

  .status-message {
    margin-top: 0.75rem;
    padding: 0.5rem 0.75rem;
    background: rgba(16, 185, 129, 0.1);
    border: 1px solid rgba(16, 185, 129, 0.3);
    border-radius: 6px;
    font-size: 0.8125rem;
    color: #34d399;
  }

  .about-info {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .about-row {
    display: flex;
    gap: 1rem;
    padding: 0.375rem 0;
    border-bottom: 1px solid var(--sl-color-gray-7);
  }

  .about-row:last-child {
    border-bottom: none;
  }

  .about-label {
    font-size: 0.8125rem;
    color: var(--sl-color-gray-3);
    min-width: 5rem;
    flex-shrink: 0;
  }

  .about-value {
    font-size: 0.8125rem;
    color: var(--sl-color-text);
  }
</style>

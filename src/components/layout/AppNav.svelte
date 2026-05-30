<script lang="ts">
  let { activePath = '/app/dashboard' }: { activePath?: string } = $props()

  const links = [
    { href: '/app/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/app/beliefs', label: 'Przekonania', icon: '🧠' },
    { href: '/app/observations', label: 'Obserwacje', icon: '👁️' },
    { href: '/app/network', label: 'Sieć', icon: '🔗' },
    { href: '/app/decisions', label: 'Decyzje', icon: '⚖️' },
    { href: '/app/goals', label: 'Cele', icon: '🎯' },
    { href: '/app/analysis', label: 'Analiza', icon: '📈' },
    { href: '/app/settings', label: 'Ustawienia', icon: '⚙️' },
  ]

  function isActive(href: string) {
    return activePath.startsWith(href)
  }
</script>

<nav class="app-nav">
  <div class="nav-header">
    <a href="/" class="nav-logo">Mind Harness</a>
    <span class="nav-subtitle">Zarządzanie sobą i sieciami</span>
  </div>
  <div class="nav-links">
    {#each links as link}
      <a
        href={link.href}
        class="nav-link"
        class:active={isActive(link.href)}
      >
        <span class="nav-icon">{link.icon}</span>
        <span class="nav-label">{link.label}</span>
      </a>
    {/each}
  </div>
</nav>

<style>
  .app-nav {
    width: 240px;
    min-height: 100vh;
    background: var(--sl-color-gray-7);
    border-right: 1px solid var(--sl-color-gray-6);
    display: flex;
    flex-direction: column;
    padding: 1rem 0;
    flex-shrink: 0;
  }

  .nav-header {
    padding: 0 1.25rem 1rem;
    border-bottom: 1px solid var(--sl-color-gray-6);
    margin-bottom: 0.75rem;
  }

  .nav-logo {
    font-size: 1.125rem;
    font-weight: 700;
    color: var(--sl-color-white);
    text-decoration: none;
    display: block;
  }

  .nav-subtitle {
    font-size: 0.75rem;
    color: var(--sl-color-gray-3);
    margin-top: 0.25rem;
    display: block;
  }

  .nav-links {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    padding: 0 0.5rem;
  }

  .nav-link {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    padding: 0.5rem 0.75rem;
    border-radius: 0.375rem;
    color: var(--sl-color-gray-3);
    text-decoration: none;
    font-size: 0.875rem;
    transition: all 0.15s;
  }

  .nav-link:hover {
    background: var(--sl-color-gray-6);
    color: var(--sl-color-white);
  }

  .nav-link.active {
    background: var(--sl-color-gray-5);
    color: var(--sl-color-white);
    font-weight: 600;
  }

  .nav-icon {
    font-size: 1.125rem;
    width: 1.25rem;
    text-align: center;
  }

  .nav-label {
    white-space: nowrap;
  }
</style>

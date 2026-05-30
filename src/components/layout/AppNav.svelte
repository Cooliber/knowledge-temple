<script lang="ts">
  let { activePath = '/app/dashboard' }: { activePath?: string } = $props()

  const links = [
    { href: '/app/dashboard', label: 'Dashboard', icon: '◉' },
    { href: '/app/beliefs', label: 'Przekonania', icon: '◈' },
    { href: '/app/observations', label: 'Obserwacje', icon: '◎' },
    { href: '/app/network', label: 'Sieć', icon: '⬡' },
    { href: '/app/decisions', label: 'Decyzje', icon: '⊜' },
    { href: '/app/goals', label: 'Cele', icon: '⊚' },
    { href: '/app/analysis', label: 'Analiza', icon: '◇' },
    { href: '/app/settings', label: 'Ustawienia', icon: '▤' },
  ]

  function isActive(href: string) {
    return activePath === href || (href !== '/app/dashboard' && activePath.startsWith(href))
  }
</script>

<nav class="nav">
  <div class="nav-brand">
    <div class="brand-icon">⦿</div>
    <div class="brand-text">
      <span class="brand-name">Mind Harness</span>
      <span class="brand-sub">Self-Management</span>
    </div>
  </div>

  <div class="nav-section">
    <span class="nav-section-label">Moduły</span>
    <div class="nav-links">
      {#each links as link, i}
        <a
          href={link.href}
          class="nav-link"
          class:active={isActive(link.href)}
          style="animation-delay: {i * 40}ms"
        >
          <span class="link-icon">{link.icon}</span>
          <span class="link-label">{link.label}</span>
          {#if isActive(link.href)}
            <span class="link-indicator"></span>
          {/if}
        </a>
      {/each}
    </div>
  </div>

  <div class="nav-footer">
    <div class="footer-dot"></div>
    <span class="footer-text">dane lokalne</span>
  </div>
</nav>

<style>
  .nav {
    width: 220px;
    min-width: 220px;
    height: 100vh;
    background: var(--mh-bg-nav);
    border-right: 1px solid var(--mh-border);
    display: flex;
    flex-direction: column;
    padding: 1.25rem 0.75rem;
    flex-shrink: 0;
  }

  .nav-brand {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    padding: 0 0.75rem 1.25rem;
    border-bottom: 1px solid var(--mh-border);
    margin-bottom: 1.25rem;
  }

  .brand-icon {
    font-size: 1.25rem;
    color: var(--mh-accent);
    line-height: 1;
  }

  .brand-text {
    display: flex;
    flex-direction: column;
  }

  .brand-name {
    font-size: 0.9375rem;
    font-weight: 700;
    color: var(--mh-text);
    letter-spacing: -0.01em;
    line-height: 1.2;
  }

  .brand-sub {
    font-size: 0.6875rem;
    color: var(--mh-text-muted);
    font-weight: 400;
  }

  .nav-section {
    flex: 1;
  }

  .nav-section-label {
    display: block;
    font-size: 0.625rem;
    font-weight: 600;
    color: var(--mh-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    padding: 0 0.75rem;
    margin-bottom: 0.5rem;
  }

  .nav-links {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .nav-link {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    padding: 0.5rem 0.75rem;
    border-radius: var(--mh-radius-sm);
    color: var(--mh-text-secondary);
    text-decoration: none;
    font-size: 0.8125rem;
    font-weight: 500;
    transition: all var(--mh-transition-fast);
    position: relative;
    animation: slide-right 400ms cubic-bezier(0.16, 1, 0.3, 1) backwards;
  }

  .nav-link:hover {
    background: rgba(255, 255, 255, 0.04);
    color: var(--mh-text);
  }

  .nav-link.active {
    background: var(--mh-accent-subtle);
    color: var(--mh-accent-hover);
    font-weight: 600;
  }

  .link-icon {
    font-size: 0.875rem;
    width: 1.25rem;
    text-align: center;
    opacity: 0.7;
    transition: opacity var(--mh-transition-fast);
  }

  .nav-link:hover .link-icon {
    opacity: 1;
  }

  .nav-link.active .link-icon {
    opacity: 1;
  }

  .link-label {
    flex: 1;
  }

  .link-indicator {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: var(--mh-accent);
    animation: pulse-glow 2s ease-in-out infinite;
  }

  .nav-footer {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem 0.75rem 0;
    border-top: 1px solid var(--mh-border);
    margin-top: auto;
  }

  .footer-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--mh-success);
  }

  .footer-text {
    font-size: 0.6875rem;
    color: var(--mh-text-muted);
  }
</style>

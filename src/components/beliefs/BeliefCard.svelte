<script lang="ts">
  import type { Belief } from '$lib/db'
  import { Badge, Progress } from '$lib/components/ui/index.js'

  let {
    belief,
    selected = false,
    onselect,
    onedit,
    ondelete,
    oncreatenested,
  }: {
    belief: Belief
    selected?: boolean
    onselect: () => void
    onedit: () => void
    ondelete: () => void
    oncreatenested: () => void
  } = $props()

  let confirmDelete = $state(false)

  function typeLabel(t: string): string {
    const map: Record<string, string> = {
      first_order: '1.',
      second_order: '2.',
      third_order: '3.',
    }
    return map[t] || t
  }

  function handleDeleteClick(e: Event) {
    e.stopPropagation()
    if (confirmDelete) {
      ondelete()
    } else {
      confirmDelete = true
    }
  }

  function handleCancelDelete(e: Event) {
    e.stopPropagation()
    confirmDelete = false
  }

  function handleEditClick(e: Event) {
    e.stopPropagation()
    onedit()
  }

  function handleNestedClick(e: Event) {
    e.stopPropagation()
    oncreatenested()
  }
</script>

<button
  class="belief-card"
  class:selected
  onclick={onselect}
  type="button"
>
  <div class="card-top">
    <Badge class="type-{belief.type}">{typeLabel(belief.type)} rzędu</Badge>
    {#if belief.subject}
      <span class="subject-tag">{belief.subject}</span>
    {/if}
    <span class="strength-pct">{Math.round(belief.strength * 100)}%</span>
  </div>

  <p class="card-text">{belief.text}</p>

  <Progress value={belief.strength * 100} />

  <div class="card-bottom">
    {#if belief.category}
      <span class="category-label">{belief.category}</span>
    {/if}
    {#if belief.tags.length > 0}
      <div class="card-tags">
        {#each belief.tags.slice(0, 3) as tag}
          <span class="mini-tag">{tag}</span>
        {/each}
        {#if belief.tags.length > 3}
          <span class="mini-tag more">+{belief.tags.length - 3}</span>
        {/if}
      </div>
    {/if}
  </div>

  <div class="card-actions">
    {#if confirmDelete}
      <div class="confirm-delete">
        <span class="confirm-text">Usunąć?</span>
        <button class="action-btn confirm-yes" onclick={handleDeleteClick}>Tak</button>
        <button class="action-btn confirm-no" onclick={handleCancelDelete}>Nie</button>
      </div>
    {:else}
      <button class="action-btn edit-btn" onclick={handleEditClick} title="Edytuj">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
        </svg>
      </button>
      <button class="action-btn nested-btn" onclick={handleNestedClick} title="Dodaj zagnieżdżone">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 5v14"/>
          <path d="M5 12h14"/>
        </svg>
      </button>
      <button class="action-btn delete-btn" onclick={handleDeleteClick} title="Usuń">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 6h18"/>
          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
        </svg>
      </button>
    {/if}
  </div>
</button>

<style>
  .belief-card {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    width: 100%;
    padding: 0.75rem;
    background: var(--sl-color-bg-card);
    border: 1px solid var(--sl-color-border);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.15s;
    text-align: left;
    color: inherit;
    font: inherit;
  }

  .belief-card:hover {
    border-color: var(--sl-color-gray-4);
    background: #323232;
  }

  .belief-card.selected {
    border-color: var(--sl-color-accent);
    box-shadow: 0 0 0 1px var(--sl-color-accent);
  }

  .card-top {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .type-first_order {
    background: rgba(59, 130, 246, 0.15);
    color: #60a5fa;
  }

  .type-second_order {
    background: rgba(124, 58, 237, 0.15);
    color: #a78bfa;
  }

  .type-third_order {
    background: rgba(239, 68, 68, 0.15);
    color: #f87171;
  }

  .subject-tag {
    font-size: 0.7rem;
    color: var(--sl-color-accent-high);
    background: rgba(124, 58, 237, 0.1);
    padding: 0.0625rem 0.375rem;
    border-radius: 3px;
  }

  .strength-pct {
    margin-left: auto;
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--sl-color-accent-high);
  }

  .card-text {
    font-size: 0.8125rem;
    color: var(--sl-color-gray-1);
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .card-bottom {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .category-label {
    font-size: 0.7rem;
    color: var(--sl-color-gray-3);
    padding: 0.0625rem 0.375rem;
    background: var(--sl-color-gray-5);
    border-radius: 3px;
  }

  .card-tags {
    display: flex;
    gap: 0.25rem;
    flex-wrap: wrap;
  }

  .mini-tag {
    font-size: 0.65rem;
    color: var(--sl-color-gray-3);
    padding: 0.0625rem 0.3125rem;
    background: rgba(124, 58, 237, 0.08);
    border-radius: 3px;
  }

  .mini-tag.more {
    background: transparent;
    color: var(--sl-color-gray-4);
  }

  .card-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.25rem;
    padding-top: 0.25rem;
    border-top: 1px solid var(--sl-color-border);
  }

  .action-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    border-radius: 4px;
    border: none;
    background: transparent;
    color: var(--sl-color-gray-4);
    cursor: pointer;
    transition: all 0.15s;
  }

  .action-btn:hover {
    background: var(--sl-color-gray-5);
    color: var(--sl-color-gray-2);
  }

  .delete-btn:hover {
    background: rgba(239, 68, 68, 0.15);
    color: #f87171;
  }

  .edit-btn:hover {
    background: rgba(59, 130, 246, 0.15);
    color: #60a5fa;
  }

  .nested-btn:hover {
    background: rgba(124, 58, 237, 0.15);
    color: #a78bfa;
  }

  .confirm-delete {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    font-size: 0.75rem;
  }

  .confirm-text {
    color: #f87171;
    font-weight: 500;
  }

  .confirm-yes {
    color: #f87171;
    font-weight: 600;
  }

  .confirm-no {
    color: var(--sl-color-gray-3);
  }
</style>

<script lang="ts">
  import { onMount } from 'svelte';
  import { pendingScrollAnchor, isScrollLoading } from '../stores/scrollAnchor';
  import { lazyLoadAll } from '../stores/lazyLoadTrigger';

  const sections = [
    { label: 'Prologue', anchor: 'intro' },
    { label: 'The Show', anchor: 'intro-calendar-container' },
    { label: 'Episode Catalog', anchor: 'catalog-section' },
    { label: 'Data Gathering', anchor: 'data-gathering' },
    { label: 'Lead Characters', anchor: 'lead-chars' },
    { label: 'Supporting Characters', anchor: 'supporting-chars' },
    { label: 'Locations', anchor: 'locations' },
    { label: 'Laughs Exploration', anchor: 'laughs-exploration' },
    { label: 'Methodology & Credits', anchor: 'methodology' },
  ];

  let activeAnchor = $state('intro');
  let isDarkBg = $state(true); // start on Prologue (dark)
  let innerWidth = $state(1200);

  // Colour tokens derived from whether any .bg-black element is currently
  // in the viewport — covers Prologue + the pinned SectionTitle headers in
  // Lead Characters, Supporting Characters, and Locations.
  let dotInactive = $derived(isDarkBg ? 'rgba(249,245,247,0.35)' : 'rgba(18,2,10,0.25)');
  let dotActive   = $derived(isDarkBg ? '#F9F5F7' : '#E71D80');
  let labelColor  = $derived(isDarkBg ? '#F9F5F7' : '#12020A');

  function updateActive() {
    const center = window.innerHeight / 2;
    let closest: string | null = null;
    let closestDist = Infinity;
    for (const { anchor } of sections) {
      const el = document.getElementById(anchor);
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      // Ignore sections entirely out of the viewport
      if (rect.bottom < 0 || rect.top > window.innerHeight) continue;
      const midDist = Math.abs(rect.top + rect.height / 2 - center);
      if (midDist < closestDist) {
        closestDist = midDist;
        closest = anchor;
      }
    }
    if (closest) activeAnchor = closest;

    // Check whether a .bg-black element covers the vertical midpoint of the viewport
    // (where the progress bar is anchored via top: 50%). This prevents sections that
    // are only partially visible at the viewport edges (e.g. Quotes above, Footer below)
    // from incorrectly switching the dots to their light/invisible colours.
    const mid = window.innerHeight / 2;
    const bgBlackEls = document.querySelectorAll<HTMLElement>('.bg-black');
    let anyDark = false;
    for (const el of bgBlackEls) {
      const rect = el.getBoundingClientRect();
      if (rect.top <= mid && rect.bottom >= mid) {
        anyDark = true;
        break;
      }
    }
    isDarkBg = anyDark;
  }

  function navigateTo(anchor: string) {
    if (!document.getElementById(anchor)) {
      isScrollLoading.set(true);
      lazyLoadAll.set(true);
    }
    pendingScrollAnchor.set(anchor);
  }

  onMount(() => {
    let rafId: number | null = null;
    const onScroll = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        updateActive();
        rafId = null;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    updateActive();
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  });
</script>

<svelte:window bind:innerWidth />

{#if innerWidth >= 1024}
  <nav class="progress-bar" aria-label="Page sections">
    {#each sections as section}
      <button
        class="dot-wrapper"
        class:active={activeAnchor === section.anchor}
        onclick={() => navigateTo(section.anchor)}
        aria-label="Go to {section.label}"
        style="--dot-inactive: {dotInactive}; --dot-active: {dotActive}; --label-color: {labelColor};"
      >
        <span class="label">{section.label}</span>
        <span class="dot"></span>
      </button>
    {/each}
  </nav>
{/if}

<style>
  .progress-bar {
    position: fixed;
    right: 20px;
    top: 50%;
    transform: translateY(-50%);
    z-index: 1000;
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: flex-end;
  }

  .dot-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    gap: 10px;
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px 0;
  }

  .dot {
    flex-shrink: 0;
    display: block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--dot-inactive);
    transition: width 200ms ease, height 200ms ease, background 200ms ease, opacity 200ms ease;
  }

  .dot-wrapper.active .dot {
    width: 9px;
    height: 9px;
    background: var(--dot-active);
  }

  .dot-wrapper:hover .dot {
    background: var(--dot-active);
    opacity: 0.7;
  }

  .label {
    white-space: nowrap;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--label-color);
    opacity: 0;
    transform: translateX(6px);
    transition: opacity 150ms ease, transform 150ms ease;
    pointer-events: none;
  }

  .dot-wrapper.active .label {
    opacity: 1;
    transform: translateX(0);
  }

  .dot-wrapper:hover .label {
    opacity: 0.75;
    transform: translateX(0);
  }
</style>

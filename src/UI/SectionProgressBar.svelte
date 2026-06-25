<script lang="ts">
  import { onMount } from 'svelte';
  import { pendingScrollAnchor, isScrollLoading } from '../stores/scrollAnchor';
  import { lazyLoadAll } from '../stores/lazyLoadTrigger';

  const sections = [
    { label: 'Prologue', anchor: 'intro' },
    { label: 'The Show', anchor: 'title-screen' },
    { label: 'Episode Catalogue', anchor: 'bridge-to-catalog' },
    { label: 'Lead Characters', anchor: 'lead-chars' },
    { label: 'Supporting Characters', anchor: 'supporting-chars' },
    { label: 'Locations', anchor: 'locations' },
    { label: 'Combinations & Findings', anchor: 'laughs-exploration' },
    { label: 'Credits & Methodology', anchor: 'methodology' },
  ];

  let activeAnchor = $state('intro');
  let isDarkBg = $state(true); // start on Prologue (dark)
  let innerWidth = $state(0);

  // Colour tokens derived from whether any .bg-black element is currently
  // in the viewport — covers Prologue + the pinned SectionTitle headers in
  // Lead Characters, Supporting Characters, and Locations.
  let dotInactive = $derived(isDarkBg ? 'rgba(249,245,247,0.35)' : 'rgba(18,2,10,0.45)');
  let dotActive = $state('#E71D80');
  let labelColor = $derived(isDarkBg ? '#F9F5F7' : '#12020A');

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
    // title-screen and data-gathering-3 have dark backgrounds but no bg-black class
    if (!anyDark) {
      for (const id of ['title-screen', 'data-gathering-3']) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= mid && rect.bottom >= mid) {
            anyDark = true;
            break;
          }
        }
      }
    }
    isDarkBg = anyDark;
  }

  function navigateTo(anchor: string) {
    pendingScrollAnchor.set(anchor);
    if (!document.getElementById(anchor)) {
      isScrollLoading.set(true);
      lazyLoadAll.set(true);
    }
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
  <nav class="progress-bar pointer-events-none" aria-label="Page sections">
    {#each sections as section}
      <div
        class="dot-wrapper"
        class:active={activeAnchor === section.anchor}
        style="--dot-inactive: {dotInactive}; --dot-active: {dotActive}; --label-color: {labelColor};"
      >
        <span class="label">{section.label}</span>
        <button
          class="dot pointer-events-auto"
          onclick={() => navigateTo(section.anchor)}
          aria-label="Go to {section.label}"
        ></button>
      </div>
    {/each}
  </nav>
{/if}

<style>
  .progress-bar {
    position: fixed;
    right: 10px;
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
    padding: 4px 0;
  }

  .dot {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
  }

  .dot::after {
    content: '';
    display: block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--dot-inactive);
    transition:
      width 200ms ease,
      height 200ms ease,
      background 200ms ease,
      opacity 200ms ease;
  }

  .dot-wrapper.active .dot::after {
    width: 9px;
    height: 9px;
    background: var(--dot-active);
  }

  .dot-wrapper:has(.dot:hover) .dot::after {
    background: var(--dot-active);
    opacity: 0.7;
  }

  .label {
    white-space: nowrap;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 6%;
    text-transform: uppercase;
    color: var(--label-color);
    opacity: 0;
    transform: translateX(6px);
    transition:
      opacity 150ms ease,
      transform 150ms ease;
    pointer-events: none;
  }

  .dot-wrapper:has(.dot:hover) .label {
    opacity: 1;
    transform: translateX(0);
  }
</style>

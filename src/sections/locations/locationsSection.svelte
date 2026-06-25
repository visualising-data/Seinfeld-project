<script>
  // @ts-nocheck
  import { tick, onMount } from 'svelte';
  import { get } from 'svelte/store';
  import { inview } from 'svelte-inview';
  import { lazyLoadAll } from '../../stores/lazyLoadTrigger';
  import { isScrollLoading, navigationAnchor } from '../../stores/scrollAnchor';

  // SectionTitle and Intro are the first visible components — load immediately.
  import SectionTitle from '../SectionTitle.svelte';
  import Intro from './Intro.svelte';

  let { episodesData, ScrollTrigger } = $props();

  // ── Fine-grained lazy loading ─────────────────────────────────────────────
  let ScreenTimeVsLaughRate = $state(null);
  let Marimekko = $state(null);
  let Alluvial = $state(null);

  // Mobile: directional rootMargin (below-only preload).
  // Desktop: symmetric rootMargin. content-visibility:auto was removed — it caused
  // layout-shift scroll jumps on mobile when placeholder heights diverged from actual heights.
  let isMobile = $state(false);
  const sentinelMargin = $derived(isMobile ? '0px 0px 1000px 0px' : '1000px');

  let _refreshTimer = null;
  function scheduleRefresh() {
    if (_refreshTimer) clearTimeout(_refreshTimer);
    _refreshTimer = setTimeout(() => {
      _refreshTimer = null;
      // Skip while the nav-scroll loader is active — +page.svelte does one
      // authoritative refresh+scroll inside stopBodyObserver() before hiding
      // the loader, which covers any spacers we'd set up here.
      if (get(isScrollLoading)) return;
      if (window.matchMedia('(max-width: 1023px)').matches) return;
      ScrollTrigger.refresh();
      const navAnchor = get(navigationAnchor);
      if (navAnchor) {
        const el = document.getElementById(navAnchor);
        if (el) window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY);
      }
    }, 150);
  }

  async function loadScreenTime() {
    if (ScreenTimeVsLaughRate) return;
    ScreenTimeVsLaughRate = await import(
      '../ScreenTimeVsLaughRate/ScreenTimeVsLaughRate.svelte'
    ).then((m) => m.default);
    await tick();
    scheduleRefresh();
  }

  async function loadMarimekko() {
    if (Marimekko) return;
    Marimekko = await import('./Marimekko.svelte').then((m) => m.default);
    await tick();
    scheduleRefresh();
  }

  async function loadAlluvial() {
    if (Alluvial) return;
    Alluvial = await import('./Alluvial.svelte').then((m) => m.default);
    await tick();
    scheduleRefresh();
  }

  onMount(() => {
    isMobile = window.matchMedia('(max-width: 1023px)').matches;
    return lazyLoadAll.subscribe(async (shouldLoad) => {
      if (!shouldLoad) return;
      if (window.matchMedia('(max-width: 1023px)').matches) return;
      await Promise.all([loadScreenTime(), loadMarimekko(), loadAlluvial()]);
    });
  });
</script>

<section id="locations">
  <div class="bg-black">
    <SectionTitle section="locations" title="Locations" />
  </div>
  <Intro />

  <!-- Sentinel 1: loads ScreenTimeVsLaughRate -->
  <div
    use:inview={{ rootMargin: sentinelMargin }}
    oninview_change={async (event) => {
      if (event.detail.inView && !get(isScrollLoading)) await loadScreenTime();
    }}
  ></div>

  {#if ScreenTimeVsLaughRate}
    <ScreenTimeVsLaughRate {episodesData} currentSection="locations" />

    <!-- Sentinel 2: loads Marimekko -->
    <div
      use:inview={{ rootMargin: sentinelMargin }}
      oninview_change={async (event) => {
        if (event.detail.inView && !get(isScrollLoading)) await loadMarimekko();
      }}
    ></div>

    {#if Marimekko}
      <Marimekko />

      <!-- Sentinel 3: loads Alluvial -->
      <div
        use:inview={{ rootMargin: sentinelMargin }}
        oninview_change={async (event) => {
          if (event.detail.inView && !get(isScrollLoading)) await loadAlluvial();
        }}
      ></div>

      {#if Alluvial}
        <Alluvial />
      {/if}
    {/if}
  {/if}
</section>

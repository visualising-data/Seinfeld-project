<script>
  // @ts-nocheck
  import { tick, onMount } from 'svelte';
  import { inview } from 'svelte-inview';
  import { get } from 'svelte/store';
  import { lazyLoadAll } from '../../stores/lazyLoadTrigger';
  import { isScrollLoading, navigationAnchor } from '../../stores/scrollAnchor';

  // SectionTitle and Intro are the first visible components — load immediately.
  import SectionTitle from '../SectionTitle.svelte';
  import Intro from './Intro.svelte';

  let { episodesData, ScrollTrigger } = $props();

  // ── Fine-grained lazy loading ─────────────────────────────────────────────
  let ScreenTimeVsLaughRate = $state(null);
  let Marimekko = $state(null);
  let PeakPerformances = $state(null);

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

  async function loadPeakPerformances() {
    if (PeakPerformances) return;
    PeakPerformances = await import('./PeakPerformances.svelte').then((m) => m.default);
    await tick();
    scheduleRefresh();
  }

  onMount(() => {
    isMobile = window.matchMedia('(max-width: 1023px)').matches;

    const unsubLazyLoad = lazyLoadAll.subscribe(async (shouldLoad) => {
      if (!shouldLoad) return;
      if (!window.matchMedia('(max-width: 1023px)').matches) {
        await Promise.all([loadScreenTime(), loadMarimekko(), loadPeakPerformances()]);
        return;
      }
      // Mobile: load sequentially while the nav loader covers the screen so all
      // three sub-components are ready before the user can scroll. Sentinels are
      // gated by isScrollLoading during menu navigation and miss their trigger.
      await loadScreenTime();
      await loadMarimekko();
      await loadPeakPerformances();
    });

    // Mobile fallback: fires on isScrollLoading true→false in case lazyLoadAll
    // wasn't triggered (e.g. navigating to a section that was already in the DOM).
    let prevLoading = get(isScrollLoading);
    const unsubIsLoading = isScrollLoading.subscribe(async (loading) => {
      const was = prevLoading;
      prevLoading = loading;
      if (loading || !was || !isMobile) return;
      await loadScreenTime();
      await loadMarimekko();
      await loadPeakPerformances();
    });

    return () => {
      unsubLazyLoad();
      unsubIsLoading();
    };
  });
</script>

<section id="lead-chars">
  <div class="bg-black">
    <SectionTitle section="main_char" title="Lead Characters" />
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
    <ScreenTimeVsLaughRate {episodesData} currentSection="main_chars" />

    <!-- Mobile spacer: buffer before Marimekko sentinel so it doesn't preload too early -->
    <div class="lg:hidden h-8"></div>

    <!-- Sentinel 2: loads Marimekko -->
    <div
      use:inview={{ rootMargin: sentinelMargin }}
      oninview_change={async (event) => {
        if (event.detail.inView && !get(isScrollLoading)) await loadMarimekko();
      }}
    ></div>

    {#if Marimekko}
      <Marimekko />

      <!-- Sentinel 3: loads PeakPerformances -->
      <div
        use:inview={{ rootMargin: sentinelMargin }}
        oninview_change={async (event) => {
          if (event.detail.inView && !get(isScrollLoading)) await loadPeakPerformances();
        }}
      ></div>

      {#if PeakPerformances}
        <PeakPerformances />
      {/if}
    {/if}
  {/if}
</section>

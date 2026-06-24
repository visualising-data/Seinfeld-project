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

  // Mobile: directional rootMargin (below-only preload) + content-visibility wrappers.
  // Desktop: symmetric rootMargin, no content-visibility (GSAP needs accurate positions).
  let isMobile = $state(false);
  const sentinelMargin = $derived(isMobile ? '0px 0px 1000px 0px' : '1000px');
  const cvStyle = $derived(
    isMobile ? 'content-visibility: auto; contain-intrinsic-block-size: auto 100vh;' : '',
  );

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
    return lazyLoadAll.subscribe(async (shouldLoad) => {
      if (!shouldLoad) return;
      if (window.matchMedia('(max-width: 1023px)').matches) return;
      await Promise.all([loadScreenTime(), loadMarimekko(), loadPeakPerformances()]);
    });
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
    <div style={cvStyle}>
      <ScreenTimeVsLaughRate {episodesData} currentSection="main_chars" />
    </div>

    <!-- Mobile spacer: lets the sticky viz fully clear before Marimekko enters -->
    <div class="lg:hidden h-[100dvh]"></div>

    <!-- Sentinel 2: loads Marimekko -->
    <div
      use:inview={{ rootMargin: sentinelMargin }}
      oninview_change={async (event) => {
        if (event.detail.inView && !get(isScrollLoading)) await loadMarimekko();
      }}
    ></div>

    {#if Marimekko}
      <div style={cvStyle}>
        <Marimekko />
      </div>

      <!-- Sentinel 3: loads PeakPerformances -->
      <div
        use:inview={{ rootMargin: sentinelMargin }}
        oninview_change={async (event) => {
          if (event.detail.inView && !get(isScrollLoading)) await loadPeakPerformances();
        }}
      ></div>

      {#if PeakPerformances}
        <div style={cvStyle}>
          <PeakPerformances />
        </div>
      {/if}
    {/if}
  {/if}
</section>

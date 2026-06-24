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

  onMount(() => {
    return lazyLoadAll.subscribe(async (shouldLoad) => {
      if (!shouldLoad) return;
      if (window.matchMedia('(max-width: 1023px)').matches) return;
      await Promise.all([loadScreenTime(), loadMarimekko()]);
    });
  });
</script>

<section id="supporting-chars">
  <div class="bg-black">
    <SectionTitle section="supp_char" title="Supporting Characters" />
  </div>
  <Intro />

  <!-- Sentinel 1: loads ScreenTimeVsLaughRate -->
  <div
    use:inview={{ rootMargin: '1000px' }}
    oninview_change={async (event) => {
      if (event.detail.inView && !get(isScrollLoading)) await loadScreenTime();
    }}
  ></div>

  {#if ScreenTimeVsLaughRate}
    <ScreenTimeVsLaughRate {episodesData} currentSection="supporting_chars" />

    <!-- Sentinel 2: loads Marimekko -->
    <div
      use:inview={{ rootMargin: '1000px' }}
      oninview_change={async (event) => {
        if (event.detail.inView && !get(isScrollLoading)) await loadMarimekko();
      }}
    ></div>

    {#if Marimekko}
      <Marimekko />
    {/if}
  {/if}
</section>

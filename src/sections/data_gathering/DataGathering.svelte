<script lang="ts">
  import { csv } from 'd3-fetch';
  import { tick, onMount } from 'svelte';
  import { inview } from 'svelte-inview';

  // Laughs is the first visible component when DataGathering mounts — load it immediately.
  import Laughs from './Laughs.svelte';
  import BeforeVideo from './BeforeVideo.svelte';
  import { get } from 'svelte/store';
  import { lazyLoadAll } from '../../stores/lazyLoadTrigger';
  import { isScrollLoading, navigationAnchor } from '../../stores/scrollAnchor';

  import type { Episode } from '$lib/types/episode';
  import { episodesInfo } from '$lib/data/episodesInfo';

  let { episodesData, ScrollTrigger } = $props();

  const sonificationCharactersDataUrl =
    'https://amdufour.github.io/hosted-data/apis/sonificationCharactersData.csv';
  const sonificationLocationDataUrl =
    'https://amdufour.github.io/hosted-data/apis/sonificationLocationsData.csv';

  let innerHeight = $state(800);

  const currentSeason = 5;
  const currentEpisode = 14;
  const episodeInfo = episodesInfo.find(
    (e) => e.season === currentSeason && e.episode === currentEpisode,
  );
  const episodeData = $derived(
    episodesData
      .filter((d: Episode) => d.season === 5 && d.episode === 14)
      .map((d: Episode) => d.data)[0],
  );
  const laughData = $derived(
    episodesData
      .filter((d: Episode) => d.season === 5 && d.episode === 14)
      .map((d: { laughs: any }) => d.laughs)[0],
  );

  // ── Fine-grained lazy loading ─────────────────────────────────────────────
  // Each heavy sub-section is a separate dynamic import triggered by its own
  // sentinel, so only one chunk mounts at a time and ScrollTrigger never has
  // to recalculate the full page in a single burst.

  let DataGatheringDetails: any = $state(null);
  let Bridge: any = $state(null);
  let EpisodeExample: any = $state(null);
  let BridgeToCatalog: any = $state(null);
  let Catalog: any = $state(null);

  // Local debounced refresh — ScrollTrigger is already available as a prop.
  let _refreshTimer: ReturnType<typeof setTimeout> | null = null;
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

  // Bridge (34 lines) is trivial — load it alongside DataGatheringDetails so
  // there's no extra sentinel or refresh cycle for such a small component.
  async function loadDataGatheringDetails() {
    if (DataGatheringDetails) return;
    [DataGatheringDetails, Bridge] = await Promise.all([
      import('./DataGatheringDetails.svelte').then((m) => m.default),
      import('./Bridge.svelte').then((m) => m.default),
    ]);
    await tick();
    scheduleRefresh();
  }

  async function loadEpisodeExample() {
    if (EpisodeExample) return;
    EpisodeExample = await import('./EpisodeExample.svelte').then((m) => m.default);
    await tick();
    scheduleRefresh();
  }

  async function loadBridgeToCatalog() {
    if (BridgeToCatalog) return;
    BridgeToCatalog = await import('./BridgeToCatalog.svelte').then((m) => m.default);
    await tick();
    scheduleRefresh();
  }

  async function loadCatalog() {
    if (Catalog) return;
    Catalog = await import('../catalog/Catalog.svelte').then((m) => m.default);
    await tick();
    scheduleRefresh();
  }

  // When menu/sidebar navigation triggers a force-load, chain through all
  // internal sub-sections so episodes exists before the scroll poll fires.
  onMount(() => {
    const unsub = lazyLoadAll.subscribe(async (shouldLoad) => {
      if (!shouldLoad) return;
      if (window.matchMedia('(max-width: 1023px)').matches) return;
      await loadDataGatheringDetails();
      await loadEpisodeExample();
      await loadBridgeToCatalog();
      await loadCatalog();
    });
    return unsub;
  });
</script>

<svelte:window bind:innerHeight />

<section id="data-gathering" class="relative">
  <div class="w-screen">
    <Laughs />

    <!-- Sentinel 1: loads DataGatheringDetails + Bridge -->
    <div
      use:inview={{ rootMargin: '1000px' }}
      oninview_change={async (/** @type {{ detail: { inView: any; }; }} */ event) => {
        if (event.detail.inView && !get(isScrollLoading)) await loadDataGatheringDetails();
      }}
    ></div>

    <BeforeVideo />

    {#if DataGatheringDetails && Bridge}
      <DataGatheringDetails {laughData} />
      <Bridge />

      <!-- Sentinel 2: loads EpisodeExample -->
      <div
        use:inview={{ rootMargin: '1000px' }}
        oninview_change={async (/** @type {{ detail: { inView: any; }; }} */ event) => {
          if (event.detail.inView && !get(isScrollLoading)) await loadEpisodeExample();
        }}
      ></div>

      {#if EpisodeExample}
        <EpisodeExample {episodeInfo} {episodeData} {laughData} {ScrollTrigger} />

        <!-- Sentinel 3: loads BridgeToCatalog -->
        <div
          use:inview={{ rootMargin: '1000px' }}
          oninview_change={async (/** @type {{ detail: { inView: any; }; }} */ event) => {
            if (event.detail.inView && !get(isScrollLoading)) await loadBridgeToCatalog();
          }}
        ></div>

        {#if BridgeToCatalog}
          <BridgeToCatalog />

          <!-- Sentinel 4: loads Catalog component (data fetched in the await blocks below) -->
          <div
            use:inview={{ rootMargin: '1000px' }}
            oninview_change={async (/** @type {{ detail: { inView: any; }; }} */ event) => {
              if (event.detail.inView && !get(isScrollLoading)) await loadCatalog();
            }}
          ></div>

          {#if Catalog}
            {#await Promise.all( [csv(sonificationCharactersDataUrl), csv(sonificationLocationDataUrl)], )}
              <section id="episodes" style="min-height: 100vh; background: #F9F5F7;">
                <div class="flex items-center justify-center" style="height: 100vh;">
                  <div
                    class="w-8 h-8 rounded-full border-2 border-gray-300 border-t-gray-600 animate-spin"
                  ></div>
                </div>
              </section>
            {:then [sonificationCharactersData, sonificationLocationData]}
              <Catalog
                {episodesData}
                {sonificationCharactersData}
                {sonificationLocationData}
                {ScrollTrigger}
              />
            {:catch}
              <section id="episodes" style="min-height: 100vh; background: #F9F5F7;">
                <div class="flex items-center justify-center" style="height: 100vh;">
                  <p style="color: #888; font-size: 0.9rem;">
                    Failed to load episode data. Please refresh the page.
                  </p>
                </div>
              </section>
            {/await}
          {/if}
        {/if}
      {/if}
    {/if}
  </div>
</section>

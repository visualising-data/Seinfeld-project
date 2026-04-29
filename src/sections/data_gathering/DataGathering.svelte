<script lang="ts">
  import { csv } from 'd3-fetch';
  import { tick } from 'svelte';
  import { inview } from 'svelte-inview';

  // Laughs is the first visible component when DataGathering mounts — load it immediately.
  import Laughs from './Laughs.svelte';

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
  let Catalog: any = $state(null);

  // Local debounced refresh — ScrollTrigger is already available as a prop.
  let _refreshTimer: ReturnType<typeof setTimeout> | null = null;
  function scheduleRefresh() {
    if (_refreshTimer) clearTimeout(_refreshTimer);
    _refreshTimer = setTimeout(() => {
      ScrollTrigger.refresh();
      _refreshTimer = null;
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

  async function loadCatalog() {
    if (Catalog) return;
    Catalog = await import('../catalog/Catalog.svelte').then((m) => m.default);
    await tick();
    scheduleRefresh();
  }
</script>

<svelte:window bind:innerHeight />

<section id="data-gathering" class="relative">
  <div class="w-screen">
    <Laughs />

    <!-- Sentinel 1: loads DataGatheringDetails + Bridge -->
    <div
      use:inview={{ rootMargin: '1000px' }}
      oninview_change={async (/** @type {{ detail: { inView: any; }; }} */ event) => {
        if (event.detail.inView) await loadDataGatheringDetails();
      }}
    ></div>

    {#if DataGatheringDetails && Bridge}
      <DataGatheringDetails {laughData} />
      <Bridge />

      <!-- Sentinel 2: loads EpisodeExample -->
      <div
        use:inview={{ rootMargin: '1000px' }}
        oninview_change={async (/** @type {{ detail: { inView: any; }; }} */ event) => {
          if (event.detail.inView) await loadEpisodeExample();
        }}
      ></div>

      {#if EpisodeExample}
        <EpisodeExample {episodeInfo} {episodeData} {laughData} {ScrollTrigger} />

        <!-- Sentinel 3: loads Catalog component (data fetched in the await blocks below) -->
        <div
          use:inview={{ rootMargin: '1000px' }}
          oninview_change={async (/** @type {{ detail: { inView: any; }; }} */ event) => {
            if (event.detail.inView) await loadCatalog();
          }}
        ></div>

        {#if Catalog}
          {#await csv(sonificationCharactersDataUrl) then sonificationCharactersData}
            {#await csv(sonificationLocationDataUrl) then sonificationLocationData}
              <Catalog
                {episodesData}
                {sonificationCharactersData}
                {sonificationLocationData}
                {ScrollTrigger}
              />
            {/await}
          {/await}
        {/if}
      {/if}
    {/if}
  </div>
</section>

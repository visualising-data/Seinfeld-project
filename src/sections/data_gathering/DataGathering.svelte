<script lang="ts">
  import { csv } from 'd3-fetch';

  import DataGatheringDetails from './DataGatheringDetails.svelte';
  import EpisodeExample from './EpisodeExample.svelte';
  import type { Episode } from '$lib/types/episode';
  import { episodesInfo } from '$lib/data/episodesInfo';
  import Bridge from './Bridge.svelte';
  import Catalog from '../catalog/Catalog.svelte';

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
</script>

<svelte:window bind:innerHeight />

<section id="data-gathering" class="relative">
  <div class="w-screen">
    <!-- <DataGatheringDetails {laughData} />
				<Bridge /> -->
    <!-- <EpisodeExample {episodeInfo} {episodeData} {laughData} {ScrollTrigger} /> -->
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
  </div>
</section>

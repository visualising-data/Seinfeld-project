<script lang="ts">
  import LaughsSelectors from './LaughsSelectors.svelte';
  import CombinationEpisodeBars from './CombinationEpisodeBars.svelte';
  import ScenesBeeswarm from './ScenesBeeswarm.svelte';
  import { getCombinationScenes, type EpisodeResult } from '../../utils/getCombinationScenes';
  import { characters } from '$lib/data/characters';
  import { locations } from '$lib/data/locations';

  let { episodesData } = $props();

  let activeMainChars = $state<string[]>(['JERRY']);
  let activeSuppChars = $state<string[]>(["Jerry's family"]);
  let activeLocation = $state<string | null>("Jerry's home");

  let vizWidth = $state(600);
  let viz1Height = $state(200);
  let viz2Height = $state(200);

  let combinationScenes = $state<EpisodeResult[]>([]);
  let isLoading = $state(true);

  $effect(() => {
    // Read reactive deps so Svelte tracks them
    const mainChars = activeMainChars;
    const suppChars = activeSuppChars;
    const loc = activeLocation;

    isLoading = true;
    const timer = setTimeout(() => {
      combinationScenes = getCombinationScenes(episodesData, mainChars, suppChars, loc);
      isLoading = false;
    }, 0);

    return () => clearTimeout(timer);
  });

  function toggleMainChar(id: string) {
    activeMainChars = activeMainChars.includes(id)
      ? activeMainChars.filter((c) => c !== id)
      : [...activeMainChars, id];
  }

  function toggleSuppChar(id: string) {
    activeSuppChars = activeSuppChars.includes(id)
      ? activeSuppChars.filter((c) => c !== id)
      : [...activeSuppChars, id];
  }

  function toggleLocation(id: string) {
    activeLocation = activeLocation === id ? null : id;
  }

  const mainChars = characters.slice(0, 4);
  const suppChars = characters.slice(4, characters.length - 1);

  function pickRandom() {
    activeMainChars = [mainChars[Math.floor(Math.random() * mainChars.length)].id];
    activeSuppChars = [suppChars[Math.floor(Math.random() * suppChars.length)].id];
    activeLocation = locations[Math.floor(Math.random() * locations.length)].id;
  }
</script>

<section id="laughs-exploration" class="w-screen mb-60 flex flex-col">
  <div class="container flex flex-col flex-1 overflow-hidden">
    <!-- Header -->
    <div class="mb-8 shrink-0">
      <h3>"It was Colonel Mustard… with the Candlestick… in the Kitchen!"</h3>
      <div style="max-width: 900px;">
        Like in a game of Cluedo, combinations of lead characters, supporting characters, and
        locations were used to generate laughs.
      </div>
    </div>

    <!-- Layout -->
    <div class="flex flex-col md:grid md:grid-cols-12 md:gap-16 flex-1 overflow-hidden">
      <!-- Left column: selectors -->
      <div class="md:col-span-4 overflow-y-auto">
        <LaughsSelectors
          {activeMainChars}
          {activeSuppChars}
          {activeLocation}
          onMainCharClick={toggleMainChar}
          onSuppCharClick={toggleSuppChar}
          onLocationClick={toggleLocation}
          onPickRandom={pickRandom}
        />
      </div>

      <!-- Right column: visualizations -->
      <div
        class="md:col-span-7 flex flex-col h-full relative"
        style="gap: 48px;"
        bind:clientWidth={vizWidth}
      >
        {#if isLoading}
          <div class="absolute inset-0 flex items-center justify-center z-10">
            <div class="spinner"></div>
          </div>
        {/if}

        <div
          class="flex-1 overflow-hidden"
          class:opacity-30={isLoading}
          bind:clientHeight={viz1Height}
        >
          <CombinationEpisodeBars
            {episodesData}
            {combinationScenes}
            width={vizWidth}
            height={viz1Height}
          />
        </div>
        <div class="flex-1 overflow-hidden" class:opacity-30={isLoading} bind:clientHeight={viz2Height}>
          <ScenesBeeswarm {combinationScenes} width={vizWidth} height={viz2Height} />
        </div>
      </div>
    </div>
  </div>
</section>

<style>
  .spinner {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(231, 29, 128, 0.2);
    border-top-color: #e71d80;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>

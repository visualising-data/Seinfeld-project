<script>
  import { onMount, onDestroy } from 'svelte';
  import { enterSoundSection, leaveSoundSection } from '../../stores/soundSectionIsInView';
  import { sharedScrollLeft } from '../../stores/scrollStore';

  import { fly } from 'svelte/transition';

  import { episodesInfo } from '$lib/data/episodesInfo';
  import { getIllustrationForEpisode } from '$lib/data/illustrations';
  import { formatTime } from '../../utils/formatTime';
  import { scaleLinear } from 'd3-scale';
  import { getRandomEpisode } from '../../utils/getRandom';

  import EpisodeDetails from './EpisodeDetails.svelte';
  import SonificationPlayer from './sonification/SonificationPlayer.svelte';
  import EpisodeScore from './episodeScore/EpisodeScore.svelte';

  let { episodesData, sonificationCharactersData, sonificationLocationData, ScrollTrigger } =
    $props();

  let innerWidth = $state(1200);
  let innerHeight = $state(800);
  const statsWidth = $derived(innerWidth >= 1280 ? 240 : 0);
  const labelsWidth = $derived(innerWidth >= 1280 ? 176 : 60);
  const extraPadding = $derived(innerWidth >= 1280 ? 60 : 10);
  let vizWidth = $derived(
    innerWidth > 1000 ? innerWidth - statsWidth - extraPadding : Math.max(innerWidth * 2, 600),
  );
  let scenesWidth = $derived(vizWidth - labelsWidth);

  let isPlaying = $state(false);
  let playingScene = $state(0);
  const updatePlayingData = (/** @type {boolean} */ playing, /** @type {number} */ sceneNum) => {
    isPlaying = playing;
    playingScene = sceneNum;
  };

  const randomEpisode = getRandomEpisode();
  let currentSeason = $state(randomEpisode?.newSeason);
  let currentEpisode = $state(randomEpisode?.newEpisode);
  let currentEpisodeInfo = $derived(
    episodesInfo.find((e) => e.season === currentSeason && e.episode === currentEpisode),
  );
  let currentEpisodeData = $derived(
    episodesData.filter(
      (/** @type { any } */ e) => e.season === currentSeason && +e.episode === currentEpisode,
    )[0].data,
  );

  let currentEpisodeSonificationCharactersData = $derived(
    sonificationCharactersData.filter(
      (/** @type { any } */ d) =>
        d.Season === `Season${currentSeason}` && +d.Episode === currentEpisode,
    ),
  );

  let currentEpisodeSonificationLocationData = $derived(
    sonificationLocationData.filter(
      (/** @type { any } */ d) =>
        d.Season === `Season${currentSeason}` && +d.Episode === currentEpisode,
    ),
  );

  const scenesData = $derived(
    currentEpisodeData.filter((/** @type { any } */ d) => d.eventCategory === 'SCENE'),
  );
  const scenes = $derived.by(() => {
    const scenesArray = [];
    const lastSceneNumber = +scenesData[scenesData.length - 2].sceneNumber;
    for (let i = 1; i <= lastSceneNumber; i++) {
      const sceneData = scenesData.filter((/** @type { any } */ d) => +d.sceneNumber === i);
      const startTime = sceneData[0].eventTime;
      const endTime = sceneData[sceneData.length - 1].eventTime;
      scenesArray.push({
        sceneNum: i,
        startTime: formatTime(startTime),
        endTime: formatTime(endTime) + 5,
      });
    }

    return scenesArray;
  });

  const xScale = $derived(
    scaleLinear()
      .domain([0, scenes[scenes.length - 1].endTime])
      .range([0, scenesWidth]),
  );

  onMount(() => {
    // Catalog is the last async-mounted section (loaded after CSV fetches inside
    // DataGathering). Its content shifts every ScrollTrigger registered earlier
    // (EpisodeExample pin/fade, IntroEnd, Quotes, MainChars, etc.) downward.
    // Deferred so the refresh doesn't fire mid-scroll and cause a position jump.
    setTimeout(() => ScrollTrigger.refresh(), 150);

    const catalogEl = document.getElementById('episodes');
    if (catalogEl) {
      catalogObserver = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            enterSoundSection();
            showIllustration = true;
          } else {
            leaveSoundSection();
            showIllustration = false;
            sonificationPlayerRef?.stopWithFadeOut();
          }
        },
        { threshold: 0.1 },
      );
      catalogObserver.observe(catalogEl);
    }
  });

  /** @type {IntersectionObserver | undefined} */
  let catalogObserver;

  onDestroy(() => {
    catalogObserver?.disconnect();
    leaveSoundSection();
  });

  // Reset scroll and stop any playing sonification when episode changes
  $effect(() => {
    currentEpisode;
    currentSeason;
    sharedScrollLeft.set(0);
    sonificationPlayerRef?.stopWithFadeOut();
  });

  // Scroll to keep the playing scene near the left edge.
  // Only on narrow screens where the timeline overflows horizontally; on
  // desktop the whole timeline fits, so auto-scrolling just drifts it left.
  $effect(() => {
    if (innerWidth <= 1000 && isPlaying && playingScene > 0 && scenes.length > 0) {
      const scene = scenes.find((s) => s.sceneNum === playingScene);
      if (scene) {
        sharedScrollLeft.set(Math.max(0, xScale(scene.startTime) - 20));
      }
    }
  });

  let showIllustration = $state(false);

  /** @type {any} */
  let sonificationPlayerRef = $state(null);

  let externallyClickedScene = $state();
  const handleClickOnScene = (/** @type {number} */ scene) => {
    externallyClickedScene = scene;
  };

  const catalogIllustration = $derived.by(() => {
    if (currentSeason == null || currentEpisode == null) return null;
    const url = getIllustrationForEpisode(currentSeason, currentEpisode);
    if (!url) return null;
    // Deterministic angle per episode so it's consistent but varied
    const rotation = ((currentSeason * 7 + currentEpisode * 13) % 30) - 15;
    return { url, rotation };
  });
</script>

<svelte:window bind:innerWidth bind:innerHeight />

<section id="episodes" style="min-height: 100vh; background: #F9F5F7;">
  <div id="catalog-inner" class="relative">
    {#if showIllustration && catalogIllustration}
      <img
        class="catalog-illustration hidden lg:block"
        src={catalogIllustration.url}
        alt=""
        style="--rotation: {catalogIllustration.rotation}deg;"
        in:fly={{ y: 50, duration: 300, opacity: 1 }}
      />
    {/if}

    <div id="catalog" class="relative flex w-screen">
      <div class="flex flex-col h-full">
        <!-- Episode details and controls -->
        <EpisodeDetails
          episodes={episodesInfo}
          bind:currentSeason
          bind:currentEpisode
          episodeInfo={currentEpisodeInfo}
        />

        <!-- Sonification player -->
        <SonificationPlayer
          bind:this={sonificationPlayerRef}
          {labelsWidth}
          {scenesWidth}
          {scenes}
          {xScale}
          sonificationCharactersData={currentEpisodeSonificationCharactersData}
          sonificationLocationData={currentEpisodeSonificationLocationData}
          {isPlaying}
          {playingScene}
          {externallyClickedScene}
          {updatePlayingData}
        />

        <!-- Episode data -->
        <div class="score-wrapper">
          <div style="padding-bottom: 20px;">
            <EpisodeScore
              episodeData={currentEpisodeData}
              width={scenesWidth}
              {labelsWidth}
              {statsWidth}
              {scenes}
              {xScale}
              sonificationCharactersData={currentEpisodeSonificationCharactersData}
              sonificationLocationData={currentEpisodeSonificationLocationData}
              {isPlaying}
              {playingScene}
              {handleClickOnScene}
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<style>
  .score-wrapper {
    position: relative;
    flex: 1;
    overflow-y: auto;
    min-height: 0;
  }

  .catalog-illustration {
    position: absolute;
    top: 180px;
    right: 0;
    z-index: 1001;
    max-width: 320px;
    height: auto;
    pointer-events: none;
    transform: rotate(var(--rotation));
    animation: catalog-float 3s ease-in-out infinite;
  }
  @keyframes catalog-float {
    0%,
    100% {
      translate: 0 0;
    }
    50% {
      translate: 0 -16px;
    }
  }
</style>

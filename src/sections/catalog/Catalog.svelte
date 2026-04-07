<script>
  import { onMount } from 'svelte';
  import { gsap } from 'gsap/dist/gsap';

  import { episodesInfo } from '$lib/data/episodesInfo';
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
    innerWidth > 1000
      ? innerWidth - statsWidth - extraPadding
      : Math.max(innerWidth - extraPadding, 1000),
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
    // Pin seasons strip
    ScrollTrigger.create({
      trigger: '#catalog',
      start: 'top top',
      end: 'bottom bottom',
      pin: '#catalog #seasons-strip',
      preventOverlaps: true,
    });

    // Crossfade: catalog-section becomes a solid fixed backdrop only when the
    // crossfade zone begins (episode-example-container bottom hits viewport bottom).
    // This prevents it from covering sections above (Laughs, EpisodeExample).
    gsap.set('#catalog-inner', { opacity: 0 });
    gsap.to('#catalog-inner', {
      opacity: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: '#episode-example-container',
        start: 'bottom bottom',
        end: 'bottom top',
        scrub: true,
        onEnter: () =>
          gsap.set('#catalog-section', {
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            zIndex: 10,
            pointerEvents: 'auto',
          }),
        // onLeave intentionally omitted: stay-zone trigger handles the release
        onEnterBack: () =>
          gsap.set('#catalog-section', {
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            zIndex: 10,
            pointerEvents: 'auto',
          }),
        onLeaveBack: () =>
          gsap.set('#catalog-section', {
            clearProps: 'position,top,left,width,zIndex,pointerEvents',
          }),
      },
    });

    // Stay zone: keep catalog pinned for one viewport after the crossfade ends,
    // then release it into normal flow with the highest z-index so it's fully interactive.
    ScrollTrigger.create({
      trigger: '#episode-example-container',
      start: 'bottom top',
      end: () => `bottom top+=${window.innerHeight * 2}`,
      onEnter: () => {
        gsap.set('#catalog-section', { pointerEvents: 'auto' });
        gsap.set('#episode-example', { pointerEvents: 'none' });
      },
      onLeave: () => {
        gsap.set('#catalog-section', {
          clearProps: 'position,top,left,width,zIndex,pointerEvents',
        });
        gsap.set('#catalog-section', { position: 'relative', zIndex: 1000 });
      },
      onEnterBack: () =>
        gsap.set('#catalog-section', {
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          zIndex: 10,
          pointerEvents: 'auto',
        }),
      onLeaveBack: () => {
        gsap.set('#catalog-section', { pointerEvents: 'none' });
        gsap.set('#episode-example', { pointerEvents: 'auto' });
      },
    });

    // Catalog is the last async-mounted section (loaded after CSV fetches inside
    // DataGathering). Its content shifts every ScrollTrigger registered earlier
    // (EpisodeExample pin/fade, IntroEnd, Quotes, MainChars, etc.) downward.
    // Refreshing here recalculates all positions with the final DOM layout.
    ScrollTrigger.refresh();
  });

  let externallyClickedScene = $state();
  const handleClickOnScene = (/** @type {number} */ scene) => {
    externallyClickedScene = scene;
  };
</script>

<svelte:window bind:innerWidth bind:innerHeight />

<section id="catalog-section" style="background: #F9F5F7;">
  <div id="catalog-inner">
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
</style>

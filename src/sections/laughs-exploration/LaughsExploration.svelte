<script lang="ts">
  import { onMount } from 'svelte';
  import * as Tone from 'tone';
  import LaughsSelectors from './LaughsSelectors.svelte';
  import CombinationEpisodeBars from './CombinationEpisodeBars.svelte';
  import ScenesBeeswarm from './ScenesBeeswarm.svelte';
  import SceneTooltip from './SceneTooltip.svelte';
  import CloseIcon from '../../icons/CloseIcon.svelte';
  import type { HoveredScene } from './ScenesBeeswarm.svelte';
  import { getCombinationScenes, type EpisodeResult } from '../../utils/getCombinationScenes';
  import { characters } from '$lib/data/characters';
  import { locations } from '$lib/data/locations';
  import {
    sonificationFiles,
    getCharSoundFileName,
    getLocationSoundFileName,
  } from '$lib/data/sonificationFilesMapping';
  import { soundIsAuth } from '../../stores/soundAuthStore';

  let { episodesData } = $props();

  let activeMainChars = $state<string[]>(['JERRY', 'GEORGE', 'ELAINE', 'KRAMER']);
  let activeSuppChars = $state<string[]>([]);
  let activeLocation = $state<string | null>("Jerry's home");

  let vizWidth = $state(600);
  let viz1Height = $state(200);
  let viz2Height = $state(200);

  let combinationScenes = $state<EpisodeResult[]>([]);
  let isLoading = $state(true);
  let hoveredEpisodeKey = $state<string | null>(null);
  let hoveredScene = $state<HoveredScene | null>(null);
  let pinnedScene = $state<HoveredScene | null>(null);

  const displayedScene = $derived(pinnedScene ?? hoveredScene);
  const pinnedEpisodeKey = $derived(
    pinnedScene ? `${pinnedScene.season}-${pinnedScene.episode}-${pinnedScene.sceneNumber}` : null,
  );
  // Hover takes priority so hovering while pinned still highlights the hovered item
  const activeEpisodeKey = $derived(hoveredEpisodeKey ?? pinnedEpisodeKey);

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

  function handleSceneClick(scene: HoveredScene) {
    const key = `${scene.season}-${scene.episode}`;
    pinnedScene = pinnedEpisodeKey === key ? null : scene;
  }

  function closePinnedScene() {
    pinnedScene = null;
  }

  const mainChars = characters.slice(0, 4);
  const suppChars = characters.slice(4, characters.length - 1);

  function pickRandom() {
    const locationPool = [...locations.map((l) => l.id), null];
    const MAX_ATTEMPTS = 200;

    for (let i = 0; i < MAX_ATTEMPTS; i++) {
      // Pick 1–4 lead chars (random count, then random subset)
      const numMain = Math.floor(Math.random() * mainChars.length) + 1;
      const shuffledMain = [...mainChars].sort(() => Math.random() - 0.5);
      const selectedMain = shuffledMain.slice(0, numMain).map((c) => c.id);

      // Pick 0–2 supporting chars
      const numSupp = Math.floor(Math.random() * 3);
      const shuffledSupp = [...suppChars].sort(() => Math.random() - 0.5);
      const selectedSupp = shuffledSupp.slice(0, numSupp).map((c) => c.id);

      // Pick a random location or null
      const selectedLocation = locationPool[Math.floor(Math.random() * locationPool.length)];

      if (
        getCombinationScenes(episodesData, selectedMain, selectedSupp, selectedLocation).length > 0
      ) {
        activeMainChars = selectedMain;
        activeSuppChars = selectedSupp;
        activeLocation = selectedLocation;
        return;
      }
    }
  }

  // ── Sonification ────────────────────────────────────────────────────────────

  let soundtrack: Tone.Players | null = null;
  let isInView = $state(false);
  let soundAuthorized = $state(false);
  let sectionEl = $state<HTMLElement | null>(null);
  let playTimeout: ReturnType<typeof setTimeout> | undefined;
  let fadeOutTimeout: ReturnType<typeof setTimeout> | undefined;
  let isSoundLooping = false;
  let wasActiveLastRun = false;
  let currentLaughBin = '2'; // read dynamically by tick — updated without restarting the loop

  const TARGET_VOLUME = -6;
  const FADE_S = 1.5;

  // Track soundIsAuth store reactively
  $effect(() => {
    const unsub = soundIsAuth.subscribe((v) => { soundAuthorized = v; });
    return unsub;
  });

  // Average laugh rate across all matching scenes, for auto-play intensity
  const avgLaughRate = $derived.by(() => {
    const allScenes = combinationScenes.flatMap((ep) => ep.scenes);
    if (allScenes.length === 0) return 0.5;
    return allScenes.reduce((sum, s) => sum + s.laughRate, 0) / allScenes.length;
  });

  // Map LaughsExploration character IDs to the keys getCharSoundFileName expects
  function charIdToSonificationKey(id: string): string {
    switch (id) {
      case 'Love interest': return 'loveinterest';
      case 'Friend/Acquaintance':
      case 'Neighbour':
      case 'Work colleague': return 'fnc';
      case "Jerry's family":
      case "George's family":
      case "Elaine's family":
      case "Kramer's family": return 'families';
      case 'Other': return 'other';
      case 'The situation': return 'Situation';
      default: return id; // JERRY, GEORGE, ELAINE, KRAMER work via toLowerCase in getCharSoundFileName
    }
  }

  // Map LaughsExploration location IDs to the keys getLocationSoundFileName expects
  function locationIdToSonificationKey(id: string): string {
    switch (id) {
      case "Jerry's home":
      case "George's home":
      case "Elaine's home":
      case "Kramer's home": return 'CharacterHome';
      case "Other family home": return 'OtherFamilyHome';
      case 'Diner': return 'Diner';
      case 'Place of leisure': return 'Leisure';
      case 'Workplace': return 'Workplace';
      case 'Transport': return 'Transport';
      case 'Outside': return 'Outside';
      default: return 'other';
    }
  }

  function getLaughBin(laughRate: number): string {
    if (laughRate >= 0.66) return '3'; // wild
    if (laughRate >= 0.33) return '2'; // mid
    return '1'; // mild
  }

  function stopSoundsImmediate() {
    clearTimeout(fadeOutTimeout);
    fadeOutTimeout = undefined;
    clearTimeout(playTimeout);
    playTimeout = undefined;
    isSoundLooping = false;
    if (!soundtrack) return;
    soundtrack.volume.cancelScheduledValues(Tone.now()); // cancel any in-flight ramp
    soundtrack.volume.value = TARGET_VOLUME;
    soundtrack.stopAll();
  }

  function stopSoundsFade() {
    clearTimeout(playTimeout);
    playTimeout = undefined;
    isSoundLooping = false;
    if (!soundtrack) return;
    soundtrack.volume.rampTo(-80, FADE_S);
    fadeOutTimeout = setTimeout(() => {
      soundtrack?.stopAll();
      if (soundtrack) soundtrack.volume.value = TARGET_VOLUME;
      fadeOutTimeout = undefined;
    }, FADE_S * 1000);
  }

  function startLoop(chars: string[], loc: string | null) {
    if (!soundtrack) return;
    const st = soundtrack;
    isSoundLooping = true;

    const tick = () => {
      if (!isSoundLooping) return;
      st.player('rythm').start();

      // currentLaughBin is read from outer scope so pin changes take effect
      // on the next cycle without restarting the loop (avoids rhythm duplication)
      chars.forEach((id) => {
        const playerName = getCharSoundFileName(charIdToSonificationKey(id), currentLaughBin);
        if (playerName) {
          try { st.player(playerName).start(); } catch { /* unknown key */ }
        }
      });

      if (loc) {
        const playerName = getLocationSoundFileName(locationIdToSonificationKey(loc));
        if (playerName) {
          try { st.player(playerName).start(); } catch { /* unknown key */ }
        }
      }

      playTimeout = setTimeout(tick, 8727.272727);
    };

    // Fade in — cancel any previously scheduled ramp first, then start fresh
    st.volume.cancelScheduledValues(Tone.now());
    st.volume.value = -80;
    st.volume.rampTo(TARGET_VOLUME, FADE_S);

    Promise.all([Tone.start(), Tone.loaded()]).then(tick);
  }

  // Keep currentLaughBin in sync without touching the loop
  $effect(() => {
    currentLaughBin = pinnedScene ? getLaughBin(pinnedScene.laughRate) : getLaughBin(avgLaughRate);
  });

  // Restart loop only when chars, location, in-view, or auth change —
  // NOT on pinnedScene (handled above via currentLaughBin)
  $effect(() => {
    const chars = [...activeMainChars, ...activeSuppChars];
    const loc = activeLocation;
    const active = isInView && soundAuthorized;

    if (active) {
      stopSoundsImmediate();
      startLoop(chars, loc);
      wasActiveLastRun = true;
    } else {
      wasActiveLastRun ? stopSoundsFade() : stopSoundsImmediate();
      wasActiveLastRun = false;
    }
  });

  onMount(() => {
    soundtrack = new Tone.Players(sonificationFiles).toDestination();
    soundtrack.volume.value = TARGET_VOLUME;
    return stopSoundsImmediate; // hard stop on component destroy
  });

  // IntersectionObserver — uses $effect so sectionEl is guaranteed to be bound
  $effect(() => {
    if (!sectionEl) return;
    const observer = new IntersectionObserver(
      ([entry]) => { isInView = entry.isIntersecting; },
      { threshold: 0.2 },
    );
    observer.observe(sectionEl);
    return () => observer.disconnect();
  });
</script>

<section id="laughs-exploration" class="w-screen mb-60 flex flex-col" bind:this={sectionEl}>
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
      <!-- Left column: selectors or scene tooltip -->
      <div class="md:col-span-4 relative">
        {#if displayedScene && pinnedScene}
          <button
            onclick={() => (pinnedScene = null)}
            class="absolute top-4 -right-8 p-2 z-10 opacity-70 hover:opacity-100 transition-opacity"
            aria-label="Close"><CloseIcon color="#12020A" /></button
          >
        {/if}
        <div class="overflow-y-auto h-full">
          {#if displayedScene}
            <SceneTooltip
              scene={displayedScene}
              {episodesData}
              {activeMainChars}
              {activeSuppChars}
              {activeLocation}
            />
          {:else}
            <LaughsSelectors
              {activeMainChars}
              {activeSuppChars}
              {activeLocation}
              onMainCharClick={toggleMainChar}
              onSuppCharClick={toggleSuppChar}
              onLocationClick={toggleLocation}
              onPickRandom={pickRandom}
            />
          {/if}
        </div>
      </div>

      <!-- Right column: visualizations -->
      <div
        class="md:col-span-8 flex flex-col h-full relative"
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
            hoveredEpisodeKey={activeEpisodeKey}
            onEpisodeHover={(key) => (hoveredEpisodeKey = key)}
            onSceneHover={(scene) => (hoveredScene = scene)}
            onSceneClick={handleSceneClick}
            onClosePin={closePinnedScene}
          />
        </div>
        <div
          class="flex-1 overflow-hidden"
          class:opacity-30={isLoading}
          bind:clientHeight={viz2Height}
        >
          <ScenesBeeswarm
            {combinationScenes}
            width={vizWidth}
            height={viz2Height}
            hoveredEpisodeKey={activeEpisodeKey}
            onEpisodeHover={(key) => (hoveredEpisodeKey = key)}
            onSceneHover={(scene) => (hoveredScene = scene)}
            onSceneClick={handleSceneClick}
            onClosePin={closePinnedScene}
          />
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

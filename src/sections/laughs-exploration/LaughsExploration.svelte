<script lang="ts">
  import { onMount } from 'svelte';
  import { fly, fade } from 'svelte/transition';
  import * as Tone from 'tone';
  import { gsap } from 'gsap/dist/gsap';
  import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
  gsap.registerPlugin(ScrollTrigger);
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
  import { enterSoundSection, leaveSoundSection } from '../../stores/soundSectionIsInView';
  import SectionTitle from '../SectionTitle.svelte';

  let { episodesData } = $props();

  let activeMainChars = $state<string[]>(['JERRY', 'GEORGE', 'ELAINE', 'KRAMER']);
  let activeSuppChars = $state<string[]>([]);
  let activeLocation = $state<string | null>("Jerry's home");

  let vizWidth = $state(600);
  let viz1Height = $state(200);
  let viz2Height = $state(200);

  let activeChartTab = $state<'bars' | 'beeswarm'>('bars');
  let isMobile = $state(false);
  const MOBILE_BARS_H = 900;
  const MOBILE_BEESWARM_H = 600;

  let globalMaxDuration = $derived.by(() => {
    let maxDur = 0;
    for (const ep of episodesData) {
      const sceneTimes = new Map<number, Set<number>>();
      for (const e of ep.data) {
        const sceneNum = +e.sceneNumber;
        if (!sceneTimes.has(sceneNum)) sceneTimes.set(sceneNum, new Set());
        sceneTimes.get(sceneNum)!.add(e.eventTimeSeconds);
      }
      sceneTimes.forEach((times) => {
        maxDur = Math.max(maxDur, times.size * 5);
      });
    }
    return maxDur;
  });

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

  let _savedScrollY = 0;

  function lockBodyScroll() {
    if (!isMobile || document.body.style.position === 'fixed') return;
    _savedScrollY = window.scrollY;
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${_savedScrollY}px`;
    document.body.style.width = '100%';
  }

  function unlockBodyScroll() {
    if (document.body.style.position !== 'fixed') return;
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    window.scrollTo(0, _savedScrollY);
  }

  function handleSceneClick(scene: HoveredScene) {
    const key = `${scene.season}-${scene.episode}`;
    if (pinnedEpisodeKey === key) {
      closePinnedScene();
      return;
    }
    lockBodyScroll();
    pinnedScene = scene;
  }

  function closePinnedScene() {
    unlockBodyScroll();
    pinnedScene = null;
  }

  const mainChars = characters.slice(0, 4);
  const suppChars = characters.slice(4, characters.length - 1);

  const joinNames = (labels: string[]) =>
    labels.length <= 1
      ? (labels[0] ?? '')
      : labels.slice(0, -1).join(', ') + ' & ' + labels[labels.length - 1];

  const characterSummary = $derived.by(() => {
    const mainMeta = activeMainChars
      .map((id) => characters.find((c) => c.id === id))
      .filter((c): c is (typeof characters)[0] => !!c);
    const suppMeta = activeSuppChars
      .map((id) => characters.find((c) => c.id === id))
      .filter((c): c is (typeof characters)[0] => !!c);
    const locationLabel = activeLocation
      ? (locations.find((l) => l.id === activeLocation)?.label ?? activeLocation)
      : null;
    return [
      joinNames(mainMeta.map((c) => c.label)),
      suppMeta.length > 0 ? `with ${joinNames(suppMeta.map((c) => c.label))}` : '',
      activeLocation && locationLabel ? `in ${locationLabel}` : '',
    ]
      .filter(Boolean)
      .join(' ');
  });

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

  let headerEl = $state<HTMLElement | null>(null);
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
    const unsub = soundIsAuth.subscribe((v) => {
      soundAuthorized = v;
    });
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
      case 'Love interest':
        return 'loveinterest';
      case 'Friend/Acquaintance':
      case 'Neighbour':
      case 'Work colleague':
        return 'fnc';
      case "Jerry's family":
      case "George's family":
      case "Elaine's family":
      case "Kramer's family":
        return 'families';
      case 'Other':
        return 'other';
      case 'The situation':
        return 'Situation';
      default:
        return id; // JERRY, GEORGE, ELAINE, KRAMER work via toLowerCase in getCharSoundFileName
    }
  }

  // Map LaughsExploration location IDs to the keys getLocationSoundFileName expects
  function locationIdToSonificationKey(id: string): string {
    switch (id) {
      case "Jerry's home":
      case "George's home":
      case "Elaine's home":
      case "Kramer's home":
        return 'CharacterHome';
      case 'Other family home':
        return 'OtherFamilyHome';
      case 'Diner':
        return 'Diner';
      case 'Place of leisure':
        return 'Leisure';
      case 'Workplace':
        return 'Workplace';
      case 'Transport':
        return 'Transport';
      case 'Outside':
        return 'Outside';
      default:
        return 'other';
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
          try {
            st.player(playerName).start();
          } catch {
            /* unknown key */
          }
        }
      });

      if (loc) {
        const playerName = getLocationSoundFileName(locationIdToSonificationKey(loc));
        if (playerName) {
          try {
            st.player(playerName).start();
          } catch {
            /* unknown key */
          }
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

  // Clip-path slide: sheet stays at bottom:0 the whole time (never off-screen),
  // so iOS WebKit cannot auto-scroll to bring it into view. rounded-t-3xl = 1.5rem.
  function slideUp(_node: HTMLElement, { duration = 300 }: { duration?: number } = {}) {
    return {
      duration,
      css: (t: number) => `clip-path: inset(${(1 - t) * 100}% 0 0 0 round 1.5rem 1.5rem 0 0)`,
    };
  }

  onMount(() => {
    soundtrack = new Tone.Players(sonificationFiles).toDestination();
    soundtrack.volume.value = TARGET_VOLUME;

    const gsapCtx = gsap.context(() => {
      gsap.to('#laughs-exploration-intro .highlight-reverse', {
        webkitTextFillColor: 'transparent',
        backgroundPosition: '200% center',
        duration: 2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: headerEl,
          start: 'top top',
          toggleActions: 'play reverse play reverse',
        },
      });
    });

    return () => {
      stopSoundsImmediate();
      gsapCtx.revert();
      unlockBodyScroll();
    };
  });

  // IntersectionObserver — uses $effect so sectionEl is guaranteed to be bound
  $effect(() => {
    if (!sectionEl) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        isInView = entry.isIntersecting;
        if (entry.isIntersecting) enterSoundSection();
        else leaveSoundSection();
      },
      { threshold: 0.2 },
    );
    observer.observe(sectionEl);
    return () => observer.disconnect();
  });

  // Mobile detection
  $effect(() => {
    const check = () => {
      isMobile = window.innerWidth < 1080;
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  });
</script>

<section
  id="laughs-exploration"
  class="w-screen mb-20 desktop:mb-60 flex flex-col"
  bind:this={sectionEl}
>
  <SectionTitle title="Combinations & Findings" section="laughs-exploration" />

  <div id="laughs-exploration-intro" class="container flex flex-col flex-1 overflow-hidden">
    <!-- Header -->
    <div class="h-screen flex flex-col justify-center" bind:this={headerEl}>
      <div class="mt-12" style="max-width: 900px;">
        <p>
          Have you ever played the board game Cluedo? “Was it Colonel Mustard… with the Candlestick…
          in the Kitchen?”
        </p>
        <p>
          In this final interactive you have the chance to bring a Cluedo-like approach to <span
            class="highlight-reverse">exploring your own curiosities</span
          > about how often different characters and locations were combined across all episodes.
        </p>
        <p>
          Specifically you can select lead characters, with supporting characters, and set the
          locations to see in which episodes, to what extent, and to what effect they were used.
        </p>
      </div>
    </div>

    <!-- Layout -->
    {#key characterSummary}
      <h3 class="max-w-[1200px] mb-4" in:fly={{ duration: 500, y: 50 }}>{characterSummary}</h3>
    {/key}
    <div
      class="flex flex-col desktop:grid desktop:grid-cols-12 desktop:gap-16 flex-1 overflow-hidden"
    >
      <!-- Left column: selectors or scene tooltip (tooltip only on desktop) -->
      <div class="desktop:col-span-4 relative">
        {#if displayedScene && pinnedScene}
          <button
            onclick={() => (pinnedScene = null)}
            class="hidden desktop:block absolute top-0.5 -right-8 p-2 z-10 opacity-70 hover:opacity-100 transition-opacity"
            aria-label="Close"><CloseIcon color="#12020A" /></button
          >
        {/if}
        <div class="overflow-y-auto h-full">
          {#if displayedScene && !isMobile}
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
              {isMobile}
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
        class="desktop:col-span-8 flex flex-col h-full relative gap-4"
        bind:clientWidth={vizWidth}
      >
        {#if isLoading}
          <div class="absolute inset-0 flex items-center justify-center z-10">
            <div class="spinner"></div>
          </div>
        {/if}

        <!-- Tab toggle: mobile only -->
        <div class="flex desktop:hidden shrink-0 border-b border-[#DDDBDC]">
          <button
            class="flex-1 py-2 text-sm font-medium transition-colors {activeChartTab === 'bars'
              ? 'border-b-2 border-[#E71D80] text-[#E71D80]'
              : 'text-[#928D90]'}"
            onclick={() => (activeChartTab = 'bars')}>By episode</button
          >
          <button
            class="flex-1 py-2 text-sm font-medium transition-colors {activeChartTab === 'beeswarm'
              ? 'border-b-2 border-[#E71D80] text-[#E71D80]'
              : 'text-[#928D90]'}"
            onclick={() => (activeChartTab = 'beeswarm')}>By scene</button
          >
        </div>

        <h5 class:hidden={isMobile && activeChartTab !== 'bars'}>
          Cummulative presence per episode
        </h5>
        <div
          class="desktop:flex-1 overflow-hidden"
          class:opacity-30={isLoading}
          class:hidden={isMobile && activeChartTab !== 'bars'}
          style={isMobile ? `height: ${MOBILE_BARS_H}px;` : ''}
          bind:clientHeight={viz1Height}
        >
          <CombinationEpisodeBars
            {episodesData}
            {combinationScenes}
            width={vizWidth}
            height={isMobile ? MOBILE_BARS_H : viz1Height}
            layout={isMobile ? 'vertical' : 'horizontal'}
            hoveredEpisodeKey={activeEpisodeKey}
            onEpisodeHover={(key) => (hoveredEpisodeKey = key)}
            onSceneHover={(scene) => (hoveredScene = scene)}
            onSceneClick={handleSceneClick}
            onClosePin={closePinnedScene}
          />
        </div>
        <h5 class="mt-8" class:hidden={isMobile && activeChartTab !== 'beeswarm'}>
          All the distinct scenes
        </h5>
        <div
          class="desktop:flex-1 overflow-hidden"
          class:opacity-30={isLoading}
          class:hidden={isMobile && activeChartTab !== 'beeswarm'}
          style={isMobile ? `height: ${MOBILE_BEESWARM_H}px;` : ''}
          bind:clientHeight={viz2Height}
        >
          <ScenesBeeswarm
            {combinationScenes}
            {globalMaxDuration}
            width={vizWidth}
            height={isMobile ? MOBILE_BEESWARM_H : viz2Height}
            layout={isMobile ? 'vertical' : 'horizontal'}
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

  <!-- Bottom sheet: mobile scene tooltip -->
  {#if pinnedScene}
    <div
      class="desktop:hidden fixed inset-0 z-40 bg-[#12020A]/40"
      role="presentation"
      onclick={closePinnedScene}
      transition:fade={{ duration: 200 }}
    ></div>
    <div
      class="desktop:hidden fixed bottom-0 inset-x-0 z-50 bg-[#F9F5F7] rounded-t-3xl shadow-2xl max-h-[75vh] flex flex-col"
      transition:slideUp={{ duration: 300 }}
    >
      <div class="flex justify-between items-center px-5 py-4 border-b border-[#DDDBDC] shrink-0">
        <span class="relative top-0.5 font-semibold text-[#12020A]">Scene detail</span>
        <button
          onclick={closePinnedScene}
          class="p-1 opacity-70 hover:opacity-100 transition-opacity"
          aria-label="Close"><CloseIcon color="#12020A" /></button
        >
      </div>
      <div class="overflow-y-auto flex-1">
        <SceneTooltip
          scene={pinnedScene}
          {episodesData}
          {activeMainChars}
          {activeSuppChars}
          {activeLocation}
        />
      </div>
    </div>
  {/if}
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

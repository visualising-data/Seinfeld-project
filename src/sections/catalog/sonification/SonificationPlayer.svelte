<script>
  // @ts-nocheck
  import { onMount } from 'svelte';
  import * as Tone from 'tone';

  import SonificationControls from './SonificationControls.svelte';
  import SonificationTrack from './SonificationTrack.svelte';
  import SoundIsDisabledPopup from '../../../UI/SoundIsDisabledPopup.svelte';
  import {
    sonificationFiles,
    getCharSoundFileName,
    getLocationSoundFileName,
  } from '$lib/data/sonificationFilesMapping';
  import { soundIsAuth } from '../../../stores/soundAuthStore';
  import { sharedScrollLeft } from '../../../stores/scrollStore';

  let {
    labelsWidth,
    scenesWidth,
    scenes,
    xScale,
    sonificationCharactersData,
    sonificationLocationData,
    isPlaying,
    playingScene,
    updatePlayingData,
    externallyClickedScene,
  } = $props();

  let innerWidth = $state(1200);
  let showSoundDisabledPopup = $state(false);

  let scrollEl = $state(null);
  let lastSyncedLeft = -1;

  const handleScrollEl = () => {
    if (scrollEl && scrollEl.scrollLeft !== lastSyncedLeft) {
      sharedScrollLeft.set(scrollEl.scrollLeft);
    }
  };

  $effect(() => {
    const sl = $sharedScrollLeft;
    if (scrollEl) {
      lastSyncedLeft = sl;
      scrollEl.scrollLeft = sl;
    }
  });
  let popupWasShown = $state(false);
  let hoveredPosition = $state({ x: 0, y: 0 });

  /**
   * @type {Tone.Players}
   */
  let soundtrack;

  /**
   * @type {Tone.Compressor}
   */
  let compressor;
  // --- 🎚️ Reactive compressor state ---
  let threshold = $state(-24);
  let ratio = $state(12);
  let attack = $state(0.003);
  let release = $state(0.25);
  const preload = () => {
    soundtrack = new Tone.Players(sonificationFiles);

    compressor = new Tone.Compressor({
      threshold: threshold,
      ratio: ratio,
      attack: attack,
      release: release,
    });

    soundtrack.connect(compressor);
    compressor.toDestination();
  };

  /**
   * @type {number | undefined}
   */
  let playSceneTimeout;
  const playScene = (/** @type {number} */ sceneNum) => {
    if (isPlaying && $soundIsAuth && playingScene === sceneNum) {
      let chars = sonificationCharactersData.filter(
        (/** @type {{ SceneNumber: string; }} */ d) => +d.SceneNumber === sceneNum,
      );
      let locations = sonificationLocationData.filter(
        (/** @type {{ SceneNumber: string; }} */ d) => +d.SceneNumber === sceneNum,
      );

      // Play audio files
      soundtrack.player('rythm').start();
      chars.forEach((/** @type {{ Character: string; laughBinFull: string; }} */ charData) => {
        const player = getCharSoundFileName(charData.Character, charData.laughBinFull);
        if (player) {
          soundtrack.player(player).start();
        }
      });
      locations.forEach((/** @type {{ Location: string; }} */ locData) => {
        const player = getLocationSoundFileName(locData.Location);
        if (player) {
          soundtrack.player(player).start();
        }
      });

      playSceneTimeout = setTimeout(() => {
        if (sceneNum < scenes.length) {
          updatePlayingData(true, sceneNum + 1);
          playScene(sceneNum + 1);
        } else {
          updatePlayingData(false, 0);
          soundtrack.player('end').start();
        }
      }, 8727.272727);
    }
  };

  const playFirstScene = () => {
    soundtrack.player('start').start();
    setTimeout(() => {
      playScene(1);
    }, 500);
  };

  const play = () => {
    updatePlayingData(true, 1);
    playFirstScene();
  };

  const playNext = () => {
    updatePlayingData(true, playingScene + 1);
    clearTimeout(playSceneTimeout);
    soundtrack.stopAll(); // Stop currently playing scenes
    playScene(playingScene);
  };

  const playPrev = () => {
    updatePlayingData(true, playingScene - 1);
    clearTimeout(playSceneTimeout);
    soundtrack.stopAll(); // Stop currently playing scenes
    playScene(playingScene);
  };

  const stop = () => {
    updatePlayingData(false, 0);
    clearTimeout(playSceneTimeout);
    soundtrack.stopAll();
  };

  export const stopWithFadeOut = () => {
    if (!isPlaying) return;
    const originalVolume = Tone.Destination.volume.value;
    Tone.Destination.volume.rampTo(-60, 0.5);
    setTimeout(() => {
      stop();
      Tone.Destination.volume.value = originalVolume;
    }, 520);
  };

  const handleClickOnScene = (/** @type {number} */ sceneNum) => {
    if ($soundIsAuth) {
      updatePlayingData(true, sceneNum);
      clearTimeout(playSceneTimeout);
      soundtrack.stopAll(); // Stop currently playing scenes

      if (sceneNum === 1) {
        playFirstScene();
      } else {
        playScene(sceneNum);
      }
    }
  };

  /**
   * @type {any}
   */
  let externallyClickedSceneInternal;
  $effect(() => {
    if (externallyClickedScene >= 0 && externallyClickedScene !== externallyClickedSceneInternal) {
      externallyClickedSceneInternal = externallyClickedScene;
      handleClickOnScene(externallyClickedScene);
    }
  });

  onMount(() => {
    // Preload audio files
    preload();
  });

  const handleMouseEnter = (/** @type {MouseEvent} */ e) => {
    if (!$soundIsAuth) {
      hoveredPosition = { x: e.clientX, y: e.clientY };
      showSoundDisabledPopup = true;
    }
  };

  const handleMouseLeave = () => {
    popupWasShown = true;
    showSoundDisabledPopup = false;
  };

  // Close popup as soon as sound becomes authorized
  $effect(() => {
    if ($soundIsAuth && showSoundDisabledPopup) {
      popupWasShown = true;
      showSoundDisabledPopup = false;
    }
  });
</script>

<svelte:window bind:innerWidth />

<div
  class="mb-4 flex flex-col"
  style="margin-left: {labelsWidth}px;"
  role="complementary"
  onmouseenter={handleMouseEnter}
  onmouseleave={handleMouseLeave}
>
  <div class="relative flex-shrink-0" style="max-width: {innerWidth - 63}px; order: {innerWidth < 1280 ? 2 : 0}">
    <div bind:this={scrollEl} onscroll={handleScrollEl} style="overflow: scroll;">
      <SonificationTrack {scenesWidth} {scenes} {xScale} {playingScene} {handleClickOnScene} />
    </div>
    {#if innerWidth < 1280}
      <div class="scroll-fade"></div>
    {/if}
  </div>
  <div style="order: {innerWidth < 1280 ? 1 : 0}">
    <SonificationControls
      {scenesWidth}
      {isPlaying}
      {playingScene}
      numScenes={scenes.length}
      {play}
      {playNext}
      {playPrev}
      {stop}
    />
  </div>

  {#if showSoundDisabledPopup && !popupWasShown}
    {#if innerWidth < 1280}
      <div class="fixed inset-0 z-50 flex items-center justify-center px-4">
        <SoundIsDisabledPopup bind:showSoundDisabledPopup />
      </div>
    {:else}
      <div
        class="absolute z-50"
        style="top: {hoveredPosition.y - 30}px; left: {hoveredPosition.x + 16}px;"
      >
        <SoundIsDisabledPopup bind:showSoundDisabledPopup />
      </div>
    {/if}
  {/if}
</div>

<style>
  .scroll-fade {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    width: 48px;
    background: linear-gradient(to right, transparent, #f9f5f7);
    pointer-events: none;
  }
</style>

<script>
  // @ts-nocheck
  import { onMount } from 'svelte';
  import * as Tone from 'tone';

  import HelpIcon from '../../../icons/HelpIcon.svelte';
  import CloseIcon from '../../../icons/CloseIcon.svelte';
  import { getCharacterImagePath } from '../../../utils/getCharacterImagePath';
  import { getLocationIconPath } from '../../../utils/getLocationIconPath';
  import {
    sonificationFiles,
    getCharSoundFileName,
    getLocationSoundFileName,
  } from '$lib/data/sonificationFilesMapping';

  import SignalMin from '../../../icons/SignalMin.svelte';
  import SignalMid from '../../../icons/SignalMid.svelte';
  import SignalFull from '../../../icons/SignalFull.svelte';

  let { toggleSonificationLegend } = $props();

  const characters = $state([
    { id: 'Jerry', imageId: 'JERRY', currentLevel: 0 },
    { id: 'George', imageId: 'GEORGE', currentLevel: 0 },
    { id: 'Elaine', imageId: 'ELAINE', currentLevel: 0 },
    { id: 'Kramer', imageId: 'KRAMER', currentLevel: 0 },
    { id: 'LoveInterest', imageId: 'Love interest', currentLevel: 0 },
    { id: 'Families', imageId: "Jerry's family", currentLevel: 0 },
    { id: 'FNC', imageId: 'Friend/Acquaintance', currentLevel: 0 },
    { id: 'Other', imageId: 'Other', currentLevel: 0 },
  ]);
  const locations = $state([
    { id: 'CharacterHome', imageId: "Jerry's home", currentLevel: 0 },
    { id: 'Diner', imageId: 'Diner', currentLevel: 0 },
    { id: 'Leisure', imageId: 'Place of leisure', currentLevel: 0 },
    { id: 'OtherFamilyHome', imageId: 'Other family home', currentLevel: 0 },
    { id: 'Outside', imageId: 'Outside', currentLevel: 0 },
    { id: 'Transport', imageId: 'Transport', currentLevel: 0 },
    { id: 'Workplace', imageId: 'Workplace', currentLevel: 0 },
    { id: 'Other', imageId: 'Other', currentLevel: 0 },
  ]);
  let isSelection = $derived.by(() => {
    const playingChars = characters.filter((char) => char.currentLevel > 0);
    const playingLocations = locations.filter((loc) => loc.currentLevel > 0);

    return playingChars.length > 0 || playingLocations.length > 0;
  });

  /**
   * @type {Tone.Players}
   */
  let soundtrack;
  const preload = () => {
    soundtrack = new Tone.Players(sonificationFiles).toDestination(); //connects to the system sound output
  };

  let playLegendTimeout;
  const playLegend = () => {
    characters
      .filter((char) => char.currentLevel > 0)
      .forEach((char) => {
        const player = getCharSoundFileName(char.id, char.currentLevel.toString());
        if (player) {
          soundtrack.player(player).start();
        }
      });
    locations
      .filter((loc) => loc.currentLevel > 0)
      .forEach((loc) => {
        const player = getLocationSoundFileName(loc.id);
        if (player) {
          soundtrack.player(player).start();
        }
      });

    playLegendTimeout = setTimeout(() => {
      playLegend();
    }, 8727.272727);
  };

  const handleClickOnChar = (/** @type {string} */ id) => {
    const char = characters.find((char) => char.id === id);
    if (char.currentLevel === 3) {
      char.currentLevel = 0;
    } else {
      char.currentLevel += 1;
    }

    clearTimeout(playLegendTimeout);
    soundtrack.stopAll();
    playLegend();
  };

  const setCharLevel = (/** @type {string} */ id, /** @type {number} */ level) => {
    const char = characters.find((char) => char.id === id);
    // If clicking on an active level, turn it off; otherwise set to that level
    char.currentLevel = char.currentLevel >= level ? 0 : level;

    clearTimeout(playLegendTimeout);
    soundtrack.stopAll();
    playLegend();
  };

  const handleClickOnLocation = (/** @type {string} */ id) => {
    const loc = locations.find((loc) => loc.id === id);
    if (loc.currentLevel === 1) {
      loc.currentLevel = 0;
    } else {
      loc.currentLevel += 1;
    }

    clearTimeout(playLegendTimeout);
    soundtrack.stopAll();
    playLegend();
  };

  const setLocationLevel = (/** @type {string} */ id, /** @type {number} */ level) => {
    const loc = locations.find((loc) => loc.id === id);
    // If clicking on an active level, turn it off; otherwise set to that level
    loc.currentLevel = loc.currentLevel >= level ? 0 : level;

    clearTimeout(playLegendTimeout);
    soundtrack.stopAll();
    playLegend();
  };

  const clearAll = () => {
    clearTimeout(playLegendTimeout);
    soundtrack.stopAll();

    characters.forEach((char) => (char.currentLevel = 0));
    locations.forEach((loc) => (loc.currentLevel = 0));
  };

  onMount(() => {
    // Preload audio files
    preload();
  });
</script>

<div class="flex justify-between items-center mb-4">
  <h6>Sonification Legend</h6>
  <button
    onclick={(e) => {
      e.stopPropagation();
      toggleSonificationLegend();
    }}
  >
    <CloseIcon color="#F9F5F7" size={20} />
  </button>
</div>
<div class="flex">
  <HelpIcon color="#F9F5F7" />
  <div class="text-xs ml-2">
    <div>Click on a character or a location to listen to its sound.</div>
    <div>Click again to bump intensity or stop.</div>
  </div>
</div>
<div class="mt-4 flex">
  <button
    class="btn text-xs clear-btn flex items-center gap-1 {isSelection
      ? 'cursor-pointer'
      : 'cursor-default'} p-0 {isSelection
      ? 'opacity-100'
      : 'opacity-60'} transition-opacity duration-200 ease-out"
    onclick={clearAll}
  >
    <CloseIcon color="#F9F5F7" size={12} />
    <div>Clear selection</div>
  </button>
</div>
<div class="flex gap-12 mt-4">
  <div>
    <div class="mb-1 text-sm font-semibold">Characters</div>
    <ul>
      <div class="flex justify-end gap-2 mr-[-2px]">
        <SignalMin />
        <SignalMid />
        <SignalFull />
      </div>
      {#each characters as char}
        <li class="mb-6 flex items-center">
          <button
            aria-label="toggle-sound"
            class="image mr-3 h-8 w-8 rounded-full"
            style="background-image: url({getCharacterImagePath(char.imageId)});"
            onclick={() => handleClickOnChar(char.id)}
          ></button>
          <div class="flex gap-3 transition-opacity ease-out duration-200">
            <button
              aria-label="Set level 1"
              class="level-indicator cursor-pointer"
              style="background: #F9F5F7; opacity: {char.currentLevel > 0 ? 1 : 0.3};"
              onclick={() => setCharLevel(char.id, 1)}
            ></button>
            <button
              aria-label="Set level 2"
              class="level-indicator cursor-pointer"
              style="background: #F9F5F7; opacity: {char.currentLevel > 1 ? 1 : 0.3};"
              onclick={() => setCharLevel(char.id, 2)}
            ></button>
            <button
              aria-label="Set level 3"
              class="level-indicator cursor-pointer"
              style="background: #F9F5F7; opacity: {char.currentLevel > 2 ? 1 : 0.3};"
              onclick={() => setCharLevel(char.id, 3)}
            ></button>
          </div>
        </li>
      {/each}
    </ul>
  </div>
  <div>
    <div class="mb-1 text-sm font-semibold">Locations</div>
    <div class="flex justify-end mr-[10px]">
      <SignalMid />
    </div>
    <ul>
      {#each locations as loc}
        <li class="mb-6 flex items-center">
          <button
            aria-label="toggle-sound"
            class="image image-location mr-3 h-8 w-8 rounded-full"
            style="
              background-color: #12020A;
              background-image: url({getLocationIconPath(loc.imageId)});
              background-size: 28px;
            "
            onclick={() => handleClickOnLocation(loc.id)}
          ></button>
          <div class="flex transition-opacity ease-out duration-200">
            <button
              aria-label="Set level 1"
              class="level-indicator cursor-pointer"
              style="background: #F9F5F7; opacity: {loc.currentLevel > 0 ? 1 : 0.3};"
              onclick={() => setLocationLevel(loc.id, 1)}
            ></button>
          </div>
        </li>
      {/each}
    </ul>
  </div>
</div>

<style>
  .image {
    background-repeat: no-repeat;
    background-size: cover;
    background-position: center;
  }
  .image-location {
    border: 2.5px solid #12020a;
    background-size: 60px 60px;
  }
  .level-indicator {
    width: 12px;
    height: 12px;
    border-radius: 10px;
  }
</style>

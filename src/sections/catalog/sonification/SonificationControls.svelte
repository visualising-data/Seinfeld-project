<script>
  import PlayIcon from '../../../icons/PlayIcon.svelte';
  import StopIcon from '../../../icons/StopIcon.svelte';
  import Prev from '../../../icons/Prev.svelte';
  import Next from '../../../icons/Next.svelte';
  import InfoIcon from '../../../icons/Info.svelte';
  import SonificationLegend from './SonificationLegend.svelte';
  import { soundIsAuth } from '../../../stores/soundAuthStore';

  let { scenesWidth, isPlaying, playingScene, numScenes, play, playNext, playPrev, stop } =
    $props();

  let innerWidth = $state(1200);
  let sonificationLegendIsOpen = $state(false);

  const toggleSonificationLegend = () => {
    sonificationLegendIsOpen = !sonificationLegendIsOpen;
  };
</script>

<svelte:window bind:innerWidth />

<div
  class="relative"
  style="max-width: {innerWidth >= 1280 ? scenesWidth : innerWidth - 75}px; margin-top: -4px;"
>
  <div class="mr-8 mt-2 flex flex-col items-start lg:items-center">
    <div class="flex items-center">
      <button
        class="mx-2"
        onclick={playPrev}
        disabled={!isPlaying || !$soundIsAuth || playingScene <= 1}
        style="cursor: {$soundIsAuth ? 'pointer' : 'not-allowed'};"
      >
        <Prev
          color={isPlaying && $soundIsAuth && playingScene > 1 ? '#E71D80' : '#BEBABC'}
          size="md"
        />
      </button>
      <div class="flex mx-1">
        {#if isPlaying}
          <button
            class="mx-2"
            onclick={stop}
            style="cursor: {$soundIsAuth ? 'pointer' : 'not-allowed'};"
          >
            <StopIcon color="#E71D80" />
          </button>
        {:else}
          <button
            class="mx-2"
            onclick={play}
            disabled={!$soundIsAuth}
            style="cursor: {$soundIsAuth ? 'pointer' : 'not-allowed'};"
          >
            <PlayIcon color={$soundIsAuth ? '#E71D80' : '#BEBABC'} />
          </button>
        {/if}
      </div>
      <button
        class="mx-2"
        onclick={playNext}
        disabled={!isPlaying || !$soundIsAuth || playingScene == numScenes}
        style="cursor: {$soundIsAuth ? 'pointer' : 'not-allowed'};"
      >
        <Next
          color={isPlaying && $soundIsAuth && playingScene < numScenes ? '#E71D80' : '#BEBABC'}
          size="md"
        />
      </button>
    </div>
    <div
      class="small pointer-events-none"
      style="margin-top: {innerWidth >= 1280 ? 0 : 16}px; top: {innerWidth >= 1280
        ? 0
        : -67}px; line-height: 24px; color: {$soundIsAuth ? '#E71D80' : '#BEBABC'};"
    >
      Listen to this episode's data
    </div>
  </div>
  <div class="absolute right-0 top-1">
    <button onclick={toggleSonificationLegend}><InfoIcon /></button>
  </div>
</div>

{#if sonificationLegendIsOpen}
  <SonificationLegend toggleLegend={toggleSonificationLegend} />
{/if}

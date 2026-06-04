<script>
  import { soundIsAuth } from '../stores/soundAuthStore';
  import { catalogIsInView } from '../stores/catalogIsInView';
  import { navBarColor } from '../stores/navbarColor';
  import { isAtCatalog } from '../stores/atCatalog';
  import { soundSectionIsInView } from '../stores/soundSectionIsInView';
  import { fade } from 'svelte/transition';
  import AudioOn from '../icons/AudioOn.svelte';
  import AudioOff from '../icons/AudioOff.svelte';
  import Burger from '../icons/Burger.svelte';
  import MainMenu from './MainMenu.svelte';

  let innerWidth = $state(1200);
  let showMenu = $state(false);

  const toggleSound = () => {
    $soundIsAuth = !$soundIsAuth;
  };

  const toggleMenu = () => {
    showMenu = !showMenu;
  };

  let color = $derived($catalogIsInView || $navBarColor === 'white' ? '#F9F5F7' : '#E71D80');
</script>

<svelte:window bind:innerWidth />

<div
  class="fixed top-0 right-0 flex h-14 items-center justify-end px-6"
  style="width: 80px; height: 56px; z-index: 2000;"
>
  <div class="flex">
    <button onclick={toggleSound} class="relative">
      {#if $soundSectionIsInView && !$soundIsAuth}
        <div class="sound-blob-outer" aria-hidden="true" transition:fade={{ duration: 600 }}></div>
        <div class="sound-blob" aria-hidden="true" transition:fade={{ duration: 600 }}></div>
      {/if}
      {#if $soundIsAuth}
        <AudioOn {color} />
      {:else}
        <AudioOff
          color={$soundSectionIsInView ? '#E71D80' : color}
          animated={$soundSectionIsInView}
        />
      {/if}
    </button>
    <button class="ml-4" onclick={toggleMenu} disabled={showMenu}><Burger color={$soundSectionIsInView ? '#E71D80' : color} /></button>
  </div>
</div>
{#if showMenu}
  <MainMenu {toggleMenu} />
{/if}

<style>
  .sound-blob-outer {
    position: absolute;
    inset: -20px;
    border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
    background: #fde824;
    opacity: 0.4;
    animation: blob-morph 6s ease-in-out infinite;
    animation-delay: -2s;
    z-index: -1;
    mask-image: radial-gradient(circle at center, black 20%, transparent 70%);
    -webkit-mask-image: radial-gradient(circle at center, black 20%, transparent 70%);
  }

  .sound-blob {
    position: absolute;
    inset: -10px;
    border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
    background: #fde824;
    opacity: 0.9;
    animation: blob-morph 6s ease-in-out infinite;
    z-index: -1;
    mask-image: radial-gradient(circle at center, black 35%, transparent 80%);
    -webkit-mask-image: radial-gradient(circle at center, black 35%, transparent 80%);
  }

  @keyframes blob-morph {
    0% {
      border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
      background: #fde824;
      transform: scale(1) rotate(0deg);
    }
    11% {
      border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%;
      background: #b8ce32;
      transform: scale(1.1) rotate(8deg);
    }
    22% {
      border-radius: 50% 50% 40% 60% / 40% 50% 60% 50%;
      background: #7dba57;
      transform: scale(1.05) rotate(-5deg);
    }
    33% {
      border-radius: 65% 35% 55% 45% / 70% 30% 65% 35%;
      background: #4cb278;
      transform: scale(1.12) rotate(12deg);
    }
    44% {
      border-radius: 40% 60% 45% 55% / 55% 45% 55% 45%;
      background: #1da388;
      transform: scale(1.04) rotate(-8deg);
    }
    55% {
      border-radius: 55% 45% 60% 40% / 45% 55% 40% 60%;
      background: #228a8d;
      transform: scale(1.14) rotate(4deg);
    }
    66% {
      border-radius: 35% 65% 35% 65% / 60% 40% 60% 40%;
      background: #2f708e;
      transform: scale(1.07) rotate(-12deg);
    }
    77% {
      border-radius: 60% 40% 50% 50% / 40% 60% 50% 50%;
      background: #39578d;
      transform: scale(1.1) rotate(6deg);
    }
    88% {
      border-radius: 45% 55% 65% 35% / 55% 45% 35% 65%;
      background: #453782;
      transform: scale(1.05) rotate(-4deg);
    }
    100% {
      border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
      background: #fde824;
      transform: scale(1) rotate(0deg);
    }
  }
</style>

<script>
  import { soundIsAuth } from '../../../stores/soundAuthStore';

  let { scenesWidth, scenes, xScale, playingScene, handleClickOnScene } = $props();

  let innerWidth = $state(1200);
  const height = 24;
</script>

<svelte:window bind:innerWidth />

<div class="relative">
  <svg
    width={scenesWidth}
    {height}
  >
    <g transform="translate(0, {height / 2})">
      {#each scenes as scene, i}
        <line
          class="scene-player {playingScene === i + 1 ? 'playing' : ''} {$soundIsAuth
            ? 'sound-is-auth'
            : ''}"
          style="cursor: {$soundIsAuth ? 'pointer' : 'not-allowed'};"
          x1={xScale(scene.startTime)}
          y1={0}
          x2={xScale(scene.endTime)}
          y2={0}
          stroke-width={14}
          role="button"
          aria-label="Scene {i + 1}"
          tabindex={$soundIsAuth ? 0 : -1}
          aria-disabled={!$soundIsAuth}
          onclick={() => handleClickOnScene(i + 1)}
          onkeydown={(e) => {
            if ((e.key === 'Enter' || e.key === ' ') && $soundIsAuth) {
              e.preventDefault();
              handleClickOnScene(i + 1);
            }
          }}
        />
        {#if i > 0}
          <line
            x1={xScale(scene.startTime)}
            y1={-10}
            x2={xScale(scene.startTime)}
            y2={10}
            stroke="#F9F5F7"
            stroke-width={4}
            stroke-linecap="round"
          />
        {/if}
      {/each}
    </g>
  </svg>
</div>

<style>
  .scene-player {
    stroke: #bebabc;
    transition: stroke 150ms ease-out;
  }
  .scene-player.sound-is-auth.playing,
  .scene-player.sound-is-auth:hover,
  .scene-player.sound-is-auth:focus-visible {
    stroke: #e71d80;
  }
  .scene-player:focus-visible {
    outline: 2px solid #e71d80;
    outline-offset: 4px;
  }
</style>

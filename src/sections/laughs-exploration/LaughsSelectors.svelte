<script lang="ts">
  import { characters } from '$lib/data/characters';
  import { locations } from '$lib/data/locations';
  import { getCharacterImagePath } from '../../utils/getCharacterImagePath';
  import { getLocationIconPath } from '../../utils/getLocationIconPath';

  import HelpIcon from '../../icons/HelpIcon.svelte';
  import Random from '../../icons/Random.svelte';

  let {
    activeMainChars,
    activeSuppChars,
    activeLocation,
    onMainCharClick,
    onSuppCharClick,
    onLocationClick,
    onPickRandom,
  }: {
    activeMainChars: string[];
    activeSuppChars: string[];
    activeLocation: string | null;
    onMainCharClick: (id: string) => void;
    onSuppCharClick: (id: string) => void;
    onLocationClick: (id: string) => void;
    onPickRandom: () => void;
  } = $props();

  const mainChars = characters.slice(0, 4);
  const suppChars = characters.slice(4, characters.length - 1);
</script>

<div class="flex items-center gap-4">
  <span class="hint small inline-flex items-center gap-2">
    <span class="shrink"><HelpIcon color="#E71D80" /></span>
    <span class="relative top-1">Select a combination of characters and locations.</span>
  </span>
  <span class="small -ml-4">OR</span>
  <button class="hint small inline-flex items-center gap-1" onclick={onPickRandom}>
    <span class="shrink"><Random size="34" color="#F9F5F7" /></span>
    <span class="relative top-1">Click here to select a random combination.</span>
  </button>
</div>
<div class="flex flex-col gap-2">
  <!-- Main characters -->
  <div>
    <p class="hint small mb-3 uppercase tracking-widest" style="font-size: 0.7rem; color: #E71D80;">
      Lead characters
    </p>
    <ul class="grid grid-cols-4 gap-3">
      {#each mainChars as char}
        <li class="flex justify-center">
          <button
            class="selector-button flex flex-col items-center {activeMainChars.includes(char.id)
              ? 'active'
              : ''}"
            onclick={() => onMainCharClick(char.id)}
          >
            <div
              class="selector rounded-full bg-contain bg-center opacity-20"
              style="background-image: url('{getCharacterImagePath(
                char.id,
              )}'); width: 60px; height: 60px;"
            ></div>
            <div class="text-center pt-1" style="font-size: 0.85rem; line-height: 1.2;">
              {char.label}
            </div>
          </button>
        </li>
      {/each}
    </ul>
  </div>

  <!-- Supporting characters -->
  <div>
    <p class="hint small mb-3 uppercase tracking-widest" style="font-size: 0.7rem; color: #E71D80;">
      Supporting characters
    </p>
    <ul class="grid grid-cols-4 gap-3">
      {#each suppChars as char}
        <li class="flex justify-center">
          <button
            class="selector-button flex flex-col items-center {activeSuppChars.includes(char.id)
              ? 'active'
              : ''}"
            onclick={() => onSuppCharClick(char.id)}
          >
            <div
              class="selector rounded-full bg-contain bg-center opacity-20"
              style="background-image: url('{getCharacterImagePath(
                char.id,
              )}'); width: 60px; height: 60px;"
            ></div>
            <div class="text-center pt-1" style="font-size: 0.85rem; line-height: 1.2;">
              {char.label}
            </div>
          </button>
        </li>
      {/each}
    </ul>
  </div>

  <!-- Locations -->
  <div>
    <p class="hint small mb-3 uppercase tracking-widest" style="font-size: 0.7rem; color: #E71D80;">
      Locations
    </p>
    <ul class="grid grid-cols-4 gap-3">
      {#each locations as loc}
        <li class="flex justify-center">
          <button
            class="selector-button flex flex-col items-center {activeLocation === loc.id
              ? 'active'
              : ''}"
            onclick={() => onLocationClick(loc.id)}
          >
            <div
              class="selector rounded-full bg-contain bg-center opacity-20"
              style="background-image: url('{getLocationIconPath(
                loc.id,
              )}'); width: 60px; height: 60px;"
            ></div>
            <div class="text-center pt-1" style="font-size: 0.85rem; line-height: 1.2;">
              {loc.label}
            </div>
          </button>
        </li>
      {/each}
    </ul>
  </div>
</div>

<style>
  .selector {
    transition: opacity 0.3s ease-out;
  }
  .selector-button:hover .selector,
  .selector-button.active .selector {
    opacity: 1;
  }
</style>

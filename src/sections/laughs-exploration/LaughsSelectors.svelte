<script lang="ts">
  import { characters } from '$lib/data/characters';
  import { locations } from '$lib/data/locations';
  import { getCharacterImagePath } from '../../utils/getCharacterImagePath';
  import { getLocationIconPath } from '../../utils/getLocationIconPath';

  import HelpIcon from '../../icons/HelpIcon.svelte';
  import Random from '../../icons/Random.svelte';
  import DownIcon from '../../icons/DownIcon.svelte';

  let {
    activeMainChars,
    activeSuppChars,
    activeLocation,
    isMobile = false,
    onMainCharClick,
    onSuppCharClick,
    onLocationClick,
    onPickRandom,
  }: {
    activeMainChars: string[];
    activeSuppChars: string[];
    activeLocation: string | null;
    isMobile?: boolean;
    onMainCharClick: (id: string) => void;
    onSuppCharClick: (id: string) => void;
    onLocationClick: (id: string) => void;
    onPickRandom: () => void;
  } = $props();

  const mainChars = characters.slice(0, 4);
  const suppChars = characters.slice(4, characters.length - 1);

  let isCollapsed = $state(true);

  const activeMainCharMeta = $derived(
    activeMainChars
      .map((id) => characters.find((c) => c.id === id))
      .filter((c): c is (typeof characters)[0] => !!c),
  );
  const activeSuppCharMeta = $derived(
    activeSuppChars
      .map((id) => characters.find((c) => c.id === id))
      .filter((c): c is (typeof characters)[0] => !!c),
  );
  const activeLocationMeta = $derived(
    activeLocation ? (locations.find((l) => l.id === activeLocation) ?? null) : null,
  );
</script>

<button class="hint small inline-flex items-center gap-1" onclick={onPickRandom}>
  <span class="shrink"><Random size="34" color="#F9F5F7" /></span>
  <span class="relative top-1 max-w-[150px]">Click here to select a random combination.</span>
</button>

{#if isMobile && isCollapsed}
  <!-- Collapsed summary: tap to expand -->
  <button
    class="w-full flex items-start gap-2 my-4"
    onclick={() => (isCollapsed = false)}
    aria-label="Expand combination selector"
  >
    <!-- Wrapping avatar row -->
    <div class="flex flex-wrap items-center gap-2 flex-1 min-w-0">
      <!-- Active main chars -->
      {#each activeMainCharMeta as char}
        <div
          class="rounded-full bg-contain bg-center shrink-0"
          style="background-image: url('{getCharacterImagePath(
            char.id,
          )}'); width: 40px; height: 40px;"
        ></div>
      {/each}
      <!-- Active supporting chars (smaller) -->
      {#if activeSuppCharMeta.length > 0}
        <span class="text-[#928D90] text-sm">with</span>
        {#each activeSuppCharMeta as char}
          <div
            class="rounded-full bg-contain bg-center shrink-0"
            style="background-image: url('{getCharacterImagePath(
              char.id,
            )}'); width: 32px; height: 32px;"
          ></div>
        {/each}
      {/if}
      <!-- Active location -->
      {#if activeLocationMeta}
        <span class="text-[#928D90] text-sm">in</span>
        <div
          class="rounded-full bg-contain bg-center shrink-0"
          style="background-image: url('{getLocationIconPath(
            activeLocationMeta.id,
          )}'); width: 40px; height: 40px;"
        ></div>
      {:else}
        <span class="text-[#928D90] text-sm">anywhere</span>
      {/if}
    </div>
    <!-- Chevron — always visible, aligned to top of button -->
    <span class="shrink-0 mt-1 ml-4"><DownIcon color="#E71D80" /></span>
  </button>
{:else}
  <!-- Collapse toggle on mobile -->
  {#if isMobile}
    <button
      class="w-full flex items-start gap-2 my-4"
      onclick={() => (isCollapsed = true)}
      aria-label="Collapse combination selector"
    >
      <div class="flex flex-wrap items-center gap-2 flex-1 min-w-0">
        {#each activeMainCharMeta as char}
          <div
            class="rounded-full bg-contain bg-center shrink-0"
            style="background-image: url('{getCharacterImagePath(char.id)}'); width: 40px; height: 40px;"
          ></div>
        {/each}
        {#if activeSuppCharMeta.length > 0}
          <span class="text-[#928D90] text-sm">with</span>
          {#each activeSuppCharMeta as char}
            <div
              class="rounded-full bg-contain bg-center shrink-0"
              style="background-image: url('{getCharacterImagePath(char.id)}'); width: 32px; height: 32px;"
            ></div>
          {/each}
        {/if}
        {#if activeLocationMeta}
          <span class="text-[#928D90] text-sm">in</span>
          <div
            class="rounded-full bg-contain bg-center shrink-0"
            style="background-image: url('{getLocationIconPath(activeLocationMeta.id)}'); width: 40px; height: 40px;"
          ></div>
        {:else}
          <span class="text-[#928D90] text-sm">anywhere</span>
        {/if}
      </div>
      <span class="shrink-0 mt-1 ml-4 rotate-180"><DownIcon color="#E71D80" /></span>
    </button>
  {/if}

  <div class="flex items-center gap-4">
    <span class="hint small inline-flex items-center gap-2">
      <span class="shrink"><HelpIcon color="#E71D80" /></span>
      <span class="relative top-1">Select a combination of characters and locations.</span>
    </span>
  </div>
  <div class="flex flex-col gap-2">
    <!-- Main characters -->
    <div>
      <p
        class="hint small mb-3 uppercase tracking-widest"
        style="font-size: 0.7rem; color: #E71D80;"
      >
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
      <p
        class="hint small mb-3 uppercase tracking-widest"
        style="font-size: 0.7rem; color: #E71D80;"
      >
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
      <p
        class="hint small mb-3 uppercase tracking-widest"
        style="font-size: 0.7rem; color: #E71D80;"
      >
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
{/if}

<style>
  .selector {
    transition: opacity 0.3s ease-out;
  }
  .selector-button:hover .selector,
  .selector-button.active .selector {
    opacity: 1;
  }
  .rotate-180 {
    transform: rotate(180deg);
  }
</style>

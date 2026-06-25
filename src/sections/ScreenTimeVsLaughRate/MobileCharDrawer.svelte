<script>
  // @ts-nocheck
  import { fly } from 'svelte/transition';
  import TextsJerry from '../main_characters/texts/TextsJerry.svelte';
  import TextsGeorge from '../main_characters/texts/TextsGeorge.svelte';
  import TextsElaine from '../main_characters/texts/TextsElaine.svelte';
  import TextsKramer from '../main_characters/texts/TextsKramer.svelte';

  let { charData, activeCharacter, isOpen, onClose } = $props();

  const charLabels = { JERRY: 'Jerry', GEORGE: 'George', ELAINE: 'Elaine', KRAMER: 'Kramer' };
</script>

{#if isOpen}
  <!-- Backdrop -->
  <div
    class="fixed inset-0 z-40 bg-black/60"
    role="button"
    tabindex="-1"
    aria-label="Close drawer"
    onclick={onClose}
    onkeydown={(e) => e.key === 'Escape' && onClose()}
  ></div>

  <!-- Drawer -->
  <div
    class="fixed bottom-0 left-0 right-0 z-50 flex flex-col rounded-t-2xl"
    style="background-color: #12020A; max-height: 85dvh; padding-bottom: env(safe-area-inset-bottom);"
    transition:fly={{ y: 400, duration: 300, opacity: 1 }}
  >
    <!-- Handle + header -->
    <div class="flex-none px-6 pt-4 pb-3 border-b border-white/10">
      <div class="mx-auto mb-3 h-1 w-10 rounded-full bg-white/20"></div>
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold" style="color: #F9F5F7; margin: 0;">
          {charLabels[activeCharacter] ?? activeCharacter}
        </h3>
        <button
          onclick={onClose}
          class="flex h-8 w-8 items-center justify-center rounded-full"
          style="background: rgba(249,245,247,0.1); color: #F9F5F7;"
          aria-label="Close"
        >
          ✕
        </button>
      </div>
    </div>

    <!-- Scrollable text content -->
    <div class="flex-1 overflow-y-auto py-4">
      {#if activeCharacter === 'JERRY'}
        <TextsJerry {charData} inline={true} />
      {:else if activeCharacter === 'GEORGE'}
        <TextsGeorge {charData} inline={true} />
      {:else if activeCharacter === 'ELAINE'}
        <TextsElaine {charData} inline={true} />
      {:else if activeCharacter === 'KRAMER'}
        <TextsKramer {charData} inline={true} />
      {/if}
      <!-- Bottom padding so last card isn't flush against the edge -->
      <div class="h-8"></div>
    </div>
  </div>
{/if}

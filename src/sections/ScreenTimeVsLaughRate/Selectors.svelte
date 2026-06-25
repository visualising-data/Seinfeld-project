<script>
  import { getCharacterImagePath } from '../../utils/getCharacterImagePath';
  import { getLocationIconPath } from '../../utils/getLocationIconPath';
  import HelpIcon from '../../icons/HelpIcon.svelte';
  import { fly } from 'svelte/transition';
  import { elasticOut } from 'svelte/easing';

  let {
    currentSection,
    selectors,
    activeSelector,
    handleCharacterClick,
    isMobile = false,
    showHint = false,
  } = $props();
</script>

{#if !isMobile && showHint}
  <div
    class="hint small flex items-center gap-2 mb-6"
    style="max-width: 320px;"
    in:fly={{ y: 12, duration: 700, easing: elasticOut }}
  >
    <span class="shrink"><HelpIcon color="#E71D80" /></span>
    <span class="relative top-1"
      >{`Select a ${currentSection === 'locations' ? 'location' : 'character'} to explore their time on screen and when they were funny.`}</span
    >
  </div>
{/if}
<ul
  class={isMobile
    ? 'flex flex-row flex-wrap justify-center gap-2'
    : `grid gap-6 flex-wrap ${currentSection === 'main_chars' ? 'grid-cols-1' : 'grid-cols-2'}`}
>
  {#each selectors as selector}
    <li class="flex justify-center">
      <button
        class="selector-button flex flex-col items-center {isMobile
          ? 'max-w-16'
          : 'max-w-28'} {activeSelector === selector.id ? 'active' : ''}"
        onclick={() => handleCharacterClick(selector.id)}
      >
        <div
          class="selector rounded-full bg-contain bg-center opacity-20 {isMobile
            ? 'selector-sm'
            : 'selector-lg'}"
          style="background-image: url('{currentSection === 'locations'
            ? getLocationIconPath(selector.id)
            : getCharacterImagePath(selector.id)}');"
        ></div>
        <div class="text-center pt-1 {isMobile ? 'label-sm' : 'label-lg'}">
          {selector.label}
        </div>
      </button>
    </li>
  {/each}
</ul>

<style>
  .selector {
    transition: opacity 0.3s ease-out;
  }
  .selector-button:hover .selector,
  .selector-button.active .selector {
    opacity: 1;
  }
  .selector-button.active .selector {
    cursor: default;
  }
  .selector-sm {
    width: 40px;
    height: 40px;
  }
  .selector-lg {
    width: 75px;
    height: 75px;
  }
  .label-sm {
    font-size: 0.75rem;
    line-height: 1.2;
  }
  .label-lg {
    font-size: 1.25rem;
    line-height: 1.2;
  }

  @media (max-height: 800px) {
    ul {
      gap: 1rem;
    }
    .selector-lg {
      width: 55px;
      height: 55px;
    }
    .label-lg {
      font-size: 1rem;
    }
  }
</style>

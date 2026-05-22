<script>
  import { getCharacterImagePath } from '../../utils/getCharacterImagePath';
  import { getLocationIconPath } from '../../utils/getLocationIconPath';
  import HelpIcon from '../../icons/HelpIcon.svelte';

  let {
    currentSection,
    selectors,
    activeSelector,
    handleCharacterClick,
    isMobile = false,
    hideHint = false,
  } = $props();
</script>

{#if !isMobile}
  <div class="hint small flex items-center gap-2 mb-6" style="max-width: 320px; opacity: {hideHint ? 0 : 1};">
    <span class="shrink"><HelpIcon color="#E71D80" /></span>
    <span class="relative top-1"
      >{`Select a ${currentSection === 'locations' ? 'location' : 'character'} to explore their time on screen and when they were funny.`}</span
    >
  </div>
{/if}
<ul
  class={isMobile
    ? 'flex flex-row flex-wrap justify-center gap-2 mb-3'
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
          class="selector rounded-full bg-contain bg-center opacity-20"
          style="background-image: url('{currentSection === 'locations'
            ? getLocationIconPath(selector.id)
            : getCharacterImagePath(selector.id)}'); width: {isMobile
            ? '40px'
            : '75px'}; height: {isMobile ? '40px' : '75px'};"
        ></div>
        <div
          class="text-center pt-1"
          style="font-size: {isMobile ? '0.75rem' : '1.25rem'}; line-height: 1.2;"
        >
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
</style>

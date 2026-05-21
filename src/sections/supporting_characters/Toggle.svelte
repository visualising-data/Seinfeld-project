<script>
  import TvIcon from '../../icons/TvIcon.svelte';
  import Laugh from '../../icons/Laugh.svelte';

  const FILTER = {
    SCREEN_TIME: 'screenTime',
    LAUGHS: 'causesLaughs',
  };
  let { switchFilter, activeFilter, isMobile, currentSection } = $props();

  let laughLabel = $derived(currentSection === 'locations' ? 'Staging the funny' : 'Being funny');
  let btnWidth = $derived(currentSection === 'locations' ? 340 : 260);

  const selectScreenTime = () => {
    switchFilter(FILTER.SCREEN_TIME);
  };
  const selectLaughRate = () => {
    switchFilter(FILTER.LAUGHS);
  };
</script>

<div
  class="relative rounded-full overflow-hidden mb-4"
  style="width: {btnWidth * 2}px; --btn-width: {btnWidth}px;"
>
  <!-- Background color -->
  <div
    class="button-background relative z-0 {activeFilter === FILTER.SCREEN_TIME ? 'left' : 'right'}"
  ></div>

  <!-- Toggle -->
  <div class="flex items-center relative z-10">
    <button
      class="flex items-center rounded-l-full {activeFilter === FILTER.SCREEN_TIME
        ? 'text-white'
        : 'text-black'} {activeFilter === FILTER.SCREEN_TIME ? 'cursor-default' : 'cursor-pointer'}"
      style="border-color: {activeFilter === FILTER.SCREEN_TIME ? '#E71D80' : '#12020A'};"
      onclick={selectScreenTime}
    >
      <div class="relative" style="top: -2px;">
        <TvIcon
          size={isMobile ? 26 : 32}
          color={activeFilter === FILTER.SCREEN_TIME ? '#F9F5F7' : '#12020A'}
        />
      </div>
      <h4 class="ml-2 text-[16px] md:text-[28px]">On screen</h4>
    </button>
    <button
      class="flex items-center rounded-r-full {activeFilter !== FILTER.SCREEN_TIME
        ? 'text-white'
        : 'text-black'} {activeFilter !== FILTER.SCREEN_TIME ? 'cursor-default' : 'cursor-pointer'}"
      style="border-color: {activeFilter !== FILTER.SCREEN_TIME ? '#E71D80' : '#12020A'};"
      onclick={selectLaughRate}
    >
      <div class="w-8">
        <Laugh
          width={isMobile ? 26 : 32}
          height={isMobile ? 26 : 32}
          color={activeFilter === FILTER.SCREEN_TIME ? '#12020A' : '#F9F5F7'}
        />
      </div>
      <h4 class="ml-2 text-[16px] md:text-[28px]">{laughLabel}</h4>
    </button>
  </div>
</div>

<style>
  button {
    width: var(--btn-width, 260px);
    padding: 4px 12px 5px;
    border: 1px solid;
    overflow: hidden;
    transition: all 300ms ease-out;
  }
  .button-background {
    position: absolute;
    top: 0;
    left: 0;
    width: 164px;
    height: 50px;
    background-color: #e71d80;
    transition: transform 300ms ease-out;
  }
  .button-background.left {
    transform: translateX(0%);
  }
  .button-background.right {
    transform: translateX(100%);
  }
  @media (min-width: 768px) {
    button {
      padding: 6px 24px 7px;
    }
    .button-background {
      width: var(--btn-width, 260px);
    }
  }
</style>

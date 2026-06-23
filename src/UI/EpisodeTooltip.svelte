<script>
  import { fade, fly } from 'svelte/transition';
  import EpisodeIcon from '../icons/EpisodeIcon.svelte';
  import StarIcon from '../icons/StarIcon.svelte';
  import TvIcon from '../icons/TvIcon.svelte';

  let { episode, position } = $props();

  /**
   * @type {number}
   */
  let innerWidth = $state(1600);
  let innerHeight = $state(800);
  let tooltip = $state();

  let tooltipWidth = $derived(innerWidth < 500 ? innerWidth - 40 : 432);
  let tooltipHeight = $state(500);
  $effect(() => {
    if (tooltip) tooltipHeight = tooltip.clientHeight;
  });

  let tooltipLeftPosition = $derived.by(() => {
    const goLeft = position[0] > innerWidth / 2;
    const raw = goLeft ? position[0] - tooltipWidth - 20 : position[0] + 20;
    return Math.min(Math.max(raw, 10), innerWidth - tooltipWidth - 10);
  });
  let tooltipTopPosition = $derived.by(() => {
    const raw = position[1] - 30;
    return Math.min(Math.max(raw, 10), innerHeight - tooltipHeight - 10);
  });
</script>

<svelte:window bind:innerWidth bind:innerHeight />

<div
  bind:this={tooltip}
  class="tooltip fixed z-50"
  role="status"
  aria-live="polite"
  aria-atomic="true"
  style="width: {tooltipWidth}px; max-height: {innerHeight -
    40}px; top: {tooltipTopPosition}px; left: {tooltipLeftPosition}px;"
  in:fly={{ duration: 100, y: 50 }}
  out:fade={{ duration: 100 }}
>
  <div class="tooltip-image" style="background-image: url({episode.img_src});"></div>
  <div class="tooltip-content">
    <h4>{episode.title}</h4>
    <div class="tooltip-tags">
      <div class="tooltip-tag tooltip-tag-episode flex items-center font-semibold">
        <EpisodeIcon size={24} />
        <span class="ml-1">{`s${episode.season}e${episode.episode}`}</span>
      </div>
      <div class="tooltip-tag tooltip-tag-imdb flex items-center">
        <span class="relative" style="top: -3px;">
          <StarIcon size={24} />
        </span>
        <span class="ml-1">
          <span class="mr-1 font-semibold">IMDb rating:</span>
          <span>{episode?.IMDB_rating.replace(',', '.')}/10</span>
        </span>
      </div>
      <div class="tooltip-tag tooltip-tag-tv flex items-center">
        <span class="relative" style="top: -3px;">
          <TvIcon size={24} />
        </span>
        <span class="ml-1">
          <span class="mr-1 font-semibold">First aired:</span>
          <span>{`${episode.MonthPart} ${episode.DayPart}, ${episode.YearPart}`}</span>
        </span>
      </div>
    </div>
    <div class="tooltip-description">{episode.description}</div>
    <div class="small mt-3">
      Photo source: <a href="https://www.imdb.com/title/tt0098904/" target="_blank">IMDb</a>
    </div>
  </div>
</div>

<style>
  .tooltip {
    background-color: #f9f5f7;
    border-radius: 16px;
    box-shadow: 0px 1px 15px 0px rgba(0, 0, 0, 0.15);
  }
  .tooltip-image {
    width: 100%;
    height: 242px;
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;
    border-top-left-radius: 16px;
    border-top-right-radius: 16px;
  }
  .tooltip-content {
    padding: 16px 24px 24px;
  }
  .tooltip-tags {
    margin: 8px 0;
    font-size: 0.9375rem;
  }
  .tooltip-tag {
    height: 28px;
  }
  .tooltip-description {
    font-size: 1.125rem;
    line-height: 1.4;
  }
</style>

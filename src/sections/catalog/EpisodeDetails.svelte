<script>
  import StarIcon from '../../icons/StarIcon.svelte';
  import TvIcon from '../../icons/TvIcon.svelte';
  import MoreIcon from '../../icons/More.svelte';
  import LessIcon from '../../icons/Less.svelte';
  import EpisodeControls from './EpisodeControls.svelte';

  let {
    episodes = null,
    currentSeason = $bindable(),
    currentEpisode = $bindable(),
    episodeInfo,
  } = $props();

  let innerWidth = $state(1200);
  let showMore = $state(false);

  const toggleShowMore = () => {
    showMore = !showMore;
  };
</script>

<svelte:window bind:innerWidth />

<div
  class="relative"
  style="display: {innerWidth >= 1280 ? 'flex' : 'block'}; z-index: {innerWidth <= 539 ? 10 : 50};"
>
  {#if innerWidth >= 1280}
    <div class="shrink-0" style="width: 480px;">
      <img src={episodeInfo.img_src} alt="Episode cover" />
    </div>
  {/if}
  <div style="margin-top: {innerWidth > 540 ? 0 : 56}px;">
    {#if episodes}
      <EpisodeControls {episodes} bind:currentSeason bind:currentEpisode />
    {/if}
    <div class="mx-4">
      {#if !episodes}
        <div class="ml-4" style="margin-top: 42px; margin-bottom: -16px; font-weight: 600;">
          season 5 episode 14
        </div>
      {/if}
      <div
        class="flex items-center justify-between"
        style="margin-left: {innerWidth >= 1280 ? 16 : 0}px;"
      >
        <h2
          style="overflow: {showMore ? 'visible' : 'hidden'}; white-space: {showMore
            ? 'auto'
            : 'nowrap'}"
        >
          {episodeInfo.title}
        </h2>
        {#if innerWidth < 1280}
          <button class="ml-4 mt-2" onclick={toggleShowMore}>
            {#if showMore}
              <LessIcon />
            {:else}
              <MoreIcon />
            {/if}
          </button>
        {/if}
      </div>
      {#if (showMore && innerWidth < 1280) || innerWidth >= 1280}
        <!-- Episode details -->
        {#if innerWidth < 1280}
          <div style="max-width: 450px; width: 100%;">
            <img class="mt-2" src={episodeInfo.img_src} alt="Episode cover" />
          </div>
        {/if}
        <div
          style="margin-left: {innerWidth >= 1280 ? 16 : 0}px; margin-bottom: {innerWidth >= 1280
            ? 0
            : 42}px; display: {innerWidth >= 1280 ? 'flex' : 'block'};"
        >
          <div
            class="desc-wrap relative mid mr-4"
            style="width: {innerWidth >= 1280
              ? Math.min(innerWidth - 25 - 450 - 225 - 100, 800)
              : 450}px;"
          >
            <!-- The clamped, always-visible version -->
            <div class="desc-clamp">
              {episodeInfo.description}
            </div>

            <!-- The full text, shown on hover/focus; does not affect layout -->
            <div class="desc-popover bg-white py-2 rounded-sm" role="tooltip">
              {episodeInfo.description}
            </div>
          </div>
          <div class="mid mt-1 shrink-0">
            <div class="mb-2 flex items-center">
              <StarIcon />
              <span class="relative" style="top: 2px;">
                <span class="mx-1 font-semibold">IMDb rating:</span>
                <span>{episodeInfo.IMDB_rating.replace(',', '.')}/10</span>
              </span>
            </div>
            <div class="flex items-center">
              <TvIcon />
              <span class="relative" style="top: 2px;">
                <span class="mx-1 font-semibold">First aired:</span>
                <span>{episodeInfo.date_aired}</span>
              </span>
            </div>
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  /* 3-line clamp + ellipsis */
  .desc-clamp {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3; /* <= three lines */
    line-clamp: 3; /* <= three lines */
    overflow: hidden;

    /* optional: ensures a stable line height */
    line-height: 1.4;
  }
  /* Hidden by default; absolutely positioned so it won't push anything */
  .desc-popover {
    position: absolute;
    left: 0;
    top: -8px;

    /* Popover sizing */
    width: 100%;
    max-width: 100%;
    max-height: 240px; /* prevents enormous blocks */
    overflow: auto;

    /* Important: it shouldn't affect layout and should overlay */
    z-index: 50;

    /* Hide until hover/focus */
    opacity: 0;
    pointer-events: none;
    transition: opacity 120ms ease;
  }

  /* Show popover when user hovers the wrapper or focuses within it */
  .desc-wrap:hover .desc-popover,
  .desc-wrap:focus-within .desc-popover {
    opacity: 1;
    pointer-events: auto; /* allow selecting/copying/scrolling */
    transform: translateY(0);
  }

  /* Accessibility: keyboard users can focus to reveal */
  .desc-clamp:focus {
    outline: none;
  }
  h2 {
    line-height: 1.4;
  }
  @media (max-width: 540px) {
    h2 {
      font-size: 2.1rem !important;
      text-overflow: ellipsis;
    }
  }
</style>

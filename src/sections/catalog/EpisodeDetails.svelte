<script>
  import * as Tone from 'tone';

  import { soundIsAuth } from '../../stores/soundAuthStore';
  import { quotes } from '$lib/data/quotes';

  import StarIcon from '../../icons/StarIcon.svelte';
  import TvIcon from '../../icons/TvIcon.svelte';
  import EpisodeControls from './EpisodeControls.svelte';
  import Quote from '../../icons/Quote.svelte';

  let {
    episodes = null,
    currentSeason = $bindable(),
    currentEpisode = $bindable(),
    episodeInfo,
  } = $props();

  $inspect(currentSeason, currentEpisode);

  let innerWidth = $state(1200);

  /**
   * @type {Tone.Player}
   */
  let audio;
  const playQuote = () => {
    // @ts-ignore
    audio = new Tone.Player().toDestination();
    const quote = quotes.find((q) => q.season === currentSeason && q.episode === currentEpisode);
    audio
      .load(`https://amdufour.github.io/hosted-data/apis/audio_quotes/${quote.audio_clip_id}.m4a`)
      .then(() => {
        audio.fadeIn = 1;
        audio.fadeOut = 1;
        audio.start();
      });
  };
</script>

<svelte:window bind:innerWidth />

<div
  class="relative flex-none"
  style="display: {innerWidth >= 920 ? 'flex' : 'block'}; z-index: {innerWidth <= 539 ? 10 : 50};"
>
  {#if innerWidth >= 920}
    <div class="shrink-0" style="width: 480px;">
      <img src={episodeInfo.img_src} loading="lazy" alt="Episode cover" />
      <div class="small mt-1 ml-1">
        Photo source: <a href="https://www.imdb.com/title/tt0098904/" target="_blank">IMDb</a>
      </div>
    </div>
  {/if}
  <div>
    {#if episodes}
      <EpisodeControls {episodes} bind:currentSeason bind:currentEpisode />
    {/if}
    <div class="px-4">
      {#if !episodes}
        <div class="mt-5" style="margin-bottom: -16px; font-weight: 600;">season 5 episode 14</div>
      {/if}
      <div class="flex items-center gap-8 mt-2 lg:mt-0">
        <h3 class="pt-4 pb-0 lg:pb-" style="line-height: 1.1;">
          {episodeInfo.title}
        </h3>
        {#if episodes && innerWidth >= 920}
          <span class="quote-btn-wrap">
            <button
              class="flex justify-center items-center w-[42px] h-[42px] rounded-full {$soundIsAuth
                ? 'bg-[#E71D80]'
                : 'bg-[#BEBABC]'}"
              disabled={!$soundIsAuth}
              onclick={playQuote}
            >
              <Quote />
            </button>
          </span>
        {/if}
      </div>

      <!-- Compact mobile metadata -->
      {#if innerWidth < 920 && episodeInfo}
        <div class="flex flex-wrap gap-x-6 gap-y-1 mt-2 mb-3">
          <div class="flex items-center gap-1">
            <TvIcon />
            <span class="small" style="position: relative; top: 1px;">{episodeInfo.date_aired}</span
            >
          </div>
          <div class="flex items-center gap-1">
            <StarIcon />
            <span class="small" style="position: relative; top: 1px;"
              >{episodeInfo.IMDB_rating.replace(',', '.')}/10</span
            >
          </div>
        </div>
      {/if}

      <!-- Episode details -->
      {#if episodes || innerWidth >= 920}
        <div
          style="margin-left: {innerWidth >= 920 ? 16 : 0}px; display: {innerWidth >= 920
            ? 'flex'
            : 'block'};"
        >
          {#if innerWidth >= 920}
            <div
              class="desc-wrap relative mid mr-4"
              style="width: {Math.min(innerWidth - 25 - 450 - 225 - 100, 800)}px;"
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
            <div class="mid shrink-0 mt-3 lg:mt-0">
              <div class="mb-2 flex items-center">
                <TvIcon />
                <span class="relative" style="top: 2px;">
                  <span class="mx-1 font-semibold">First aired:</span>
                  <span>{episodeInfo.date_aired}</span>
                </span>
              </div>
              <div class="flex items-center">
                <StarIcon />
                <span class="relative" style="top: 2px;">
                  <span class="mx-1 font-semibold">IMDb rating:</span>
                  <span>{episodeInfo.IMDB_rating.replace(',', '.')}/10</span>
                </span>
              </div>
            </div>
          {/if}
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
    -webkit-line-clamp: 4; /* <= four lines */
    line-clamp: 4; /* <= four lines */
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
  .quote-btn-wrap {
    position: relative;
  }
  .quote-btn-wrap::after {
    content: 'Play a famous quote from this episode';
    position: absolute;
    bottom: calc(100% + 4px);
    left: 50%;
    transform: translateX(-50%);
    white-space: nowrap;
    background: #12020a;
    color: #f9f5f7;
    font-size: 0.875rem;
    padding: 4px 8px;
    border-radius: 8px;
    pointer-events: none;
    opacity: 0;
    box-shadow: 0px 1px 15px 0px rgba(0, 0, 0, 0.15);
    transition: opacity 120ms ease;
  }
  .quote-btn-wrap:hover::after {
    opacity: 1;
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

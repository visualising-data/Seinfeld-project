<script>
  // @ts-nocheck

  import { onMount, onDestroy, tick } from 'svelte';
  import { gsap } from 'gsap/dist/gsap';
  import { range } from 'd3-array';

  import Laugh from '../../icons/Laugh.svelte';
  import tv_noise from '$lib/assets/tv_noise.png';
  import { soundIsAuth } from '../../stores/soundAuthStore';
  import { enterSoundSection, leaveSoundSection } from '../../stores/soundSectionIsInView';
  import { getCharacterImagePath } from '../../utils/getCharacterImagePath';
  import { characters as charactersAll } from '$lib/data/characters';
  import { formatTimeLabel } from '../../utils/formatTime';

  let { laughData } = $props();

  const characters = charactersAll.slice(0, 4);
  // Must match laugh.eventAttribute values and the order of characters[]
  const charKeys = ['JERRY', 'GEORGE', 'ELAINE', 'KRAMER'];

  const videoStartTime = 18 * 60 + 35; // 18:35
  const videoEndTime = 20 * 60 + 35; // 20:35
  const videoLaughs = laughData.filter(
    (/** @type {{ eventTimeSeconds: string; }} */ d) =>
      +d.eventTimeSeconds >= videoStartTime && +d.eventTimeSeconds <= videoEndTime,
  );
  const videoDuration = videoEndTime - videoStartTime;

  // 24 five-second slots: 18:35 → 20:30
  const timeSlots = range(videoStartTime, videoEndTime, 5);

  // O(1) lookup: "JERRY-1115", "GEORGE-1125", etc.
  const laughsByCharTime = new Set(
    videoLaughs.map((d) => `${d.eventAttribute}-${d.eventTimeSeconds}`),
  );

  let innerWidth = $state(1600);

  // On mobile, fixed-width columns make the grid wider than the viewport.
  // On desktop, 1fr fills the container naturally.
  let colWidth = $derived(innerWidth >= 1024 ? '1fr' : '44px');

  let isMuted = $state(true);
  $effect(() => {
    isMuted = !$soundIsAuth;
  });

  let isVideoLoading = $state(false);

  /** @type {HTMLVideoElement} */
  let videoEl = $state(null);
  $effect(() => {
    if (videoEl) {
      videoEl.muted = isMuted;
      videoEl.volume = 1;
    }
  });

  /** @type {HTMLElement} */
  let gridContainer;
  /** @type {HTMLElement} */
  let gridScrollInner;

  let tlVideo;
  let pendingCanPlay = null;

  let isInView = $state(false);
  let isVideoPlaying = $state(false);

  let playPauseTimer;
  function debouncePlayPause(fn) {
    clearTimeout(playPauseTimer);
    playPauseTimer = setTimeout(fn, 100);
  }

  function playVideo() {
    debouncePlayPause(() => {
      if (!videoEl || !videoEl.paused) return;
      isVideoLoading = true;

      if (pendingCanPlay) videoEl.removeEventListener('canplay', pendingCanPlay);
      // Call play() inside canplay rather than immediately after load() —
      // calling play() while load() is still in progress causes an AbortError
      // on iOS that silently swallows the request without starting playback.
      pendingCanPlay = () => {
        pendingCanPlay = null;
        videoEl.play()
          .then(() => {
            isVideoLoading = false;
            isVideoPlaying = true;
            tlVideo.restart();
          })
          .catch((err) => {
            if (err.name !== 'AbortError') console.warn('Video play failed:', err);
            isVideoLoading = false;
          });
      };
      videoEl.addEventListener('canplay', pendingCanPlay, { once: true });
      videoEl.load();
    });
  }

  function pauseVideo() {
    debouncePlayPause(() => {
      isVideoLoading = false;
      isVideoPlaying = false;
      if (pendingCanPlay && videoEl) {
        videoEl.removeEventListener('canplay', pendingCanPlay);
        pendingCanPlay = null;
      }
      if (!videoEl || videoEl.paused) return;
      videoEl.pause();
      videoEl.currentTime = 0;
      tlVideo?.pause();
    });
  }

  onMount(async () => {
    const laughIconReveal = { opacity: 0, yPercent: 50, duration: 1, ease: 'power3.out' };

    tlVideo = gsap.timeline({
      scrollTrigger: {
        trigger: '#data-gathering-3',
        start: 'top top',
        end: 'bottom top',
        toggleActions: 'play pause resume pause',
        onEnter: () => { isInView = true; if (innerWidth >= 1024) playVideo(); enterSoundSection(); },
        onLeave: () => { isInView = false; pauseVideo(); leaveSoundSection(); },
        onEnterBack: () => { isInView = true; if (innerWidth >= 1024) playVideo(); enterSoundSection(); },
        onLeaveBack: () => { isInView = false; pauseVideo(); leaveSoundSection(); },
      },
    });

    // Wait for Svelte to finish rendering, then wait one rAF for the browser to
    // lay out the grid, so scrollWidth/clientWidth are correct before we bake
    // maxTranslate into the timeline.
    await tick();
    requestAnimationFrame(() => {
      // Distance the inner content needs to travel so that the last column
      // aligns with the right edge of the container at the end of the video.
      const maxTranslate = Math.max(0, gridScrollInner.scrollWidth - gridContainer.clientWidth);

      tlVideo
        // Playhead sweeps from left:0 to left:100% of the visible container
        .to('#viz-playhead', { left: '100%', ease: 'none', duration: videoDuration })
        // Inner content slides left in sync, revealing future columns
        .to(gridScrollInner, { x: -maxTranslate, ease: 'none', duration: videoDuration }, 0)
        .from('.laugh-icon-1115', laughIconReveal, 1115 - videoStartTime)
        .from('.laugh-icon-1125', laughIconReveal, 1125 - videoStartTime)
        .from('.laugh-icon-1130', laughIconReveal, 1130 - videoStartTime)
        .from('.laugh-icon-1145', laughIconReveal, 1145 - videoStartTime)
        .from('.laugh-icon-1150', laughIconReveal, 1150 - videoStartTime)
        .from('.laugh-icon-1160', laughIconReveal, 1160 - videoStartTime)
        .from('.laugh-icon-1165', laughIconReveal, 1165 - videoStartTime)
        .from('.laugh-icon-1170', laughIconReveal, 1170 - videoStartTime)
        .from('.laugh-icon-1185', laughIconReveal, 1185 - videoStartTime)
        .from('.laugh-icon-1190', laughIconReveal, 1190 - videoStartTime)
        .from('.laugh-icon-1195', laughIconReveal, 1195 - videoStartTime)
        .from('.laugh-icon-1200', laughIconReveal, 1200 - videoStartTime)
        .from('.laugh-icon-1205', laughIconReveal, 1205 - videoStartTime)
        .from('.laugh-icon-1210', laughIconReveal, 1210 - videoStartTime)
        .from('.laugh-icon-1215', laughIconReveal, 1215 - videoStartTime)
        .from('.laugh-icon-1220', laughIconReveal, 1220 - videoStartTime)
        .from('.laugh-icon-1225', laughIconReveal, 1225 - videoStartTime)
        .from('.laugh-icon-1230', laughIconReveal, 1230 - videoStartTime);
    });

  });

  onDestroy(() => {
    tlVideo?.kill();
  });
</script>

<svelte:window bind:innerWidth />

<div id="data-gathering-3" class="relative bg-[#000] h-[104dvh] flex flex-col">
  <!-- Video area: fills remaining height above the overlay -->
  <div class="flex-1 relative flex items-center min-h-0 overflow-hidden">
    <video
      id="demo-video"
      class="w-full h-auto"
      playsinline
      muted
      preload="none"
      bind:this={videoEl}
    >
      <source
        src="https://amdufour.github.io/hosted-data/apis/videos/MarineBiologist_edited(CC).mp4"
        type="video/mp4"
      />
    </video>

    <!-- Dark tint -->
    <div
      class="absolute inset-0 pointer-events-none"
      style="background: rgba(18, 2, 10, 0.3)"
      aria-hidden="true"
    ></div>

    <!-- TV noise -->
    <div
      class="absolute inset-0 pointer-events-none"
      style="background-image: url('{tv_noise}')"
      aria-hidden="true"
    ></div>

    <!-- Fallback play button (also shows spinner while loading) -->
    {#if isInView && !isVideoPlaying}
      <div class="absolute inset-0 flex items-center justify-center z-20">
        <button
          class="play-btn"
          disabled={isVideoLoading}
          onclick={playVideo}
          aria-label="Play video"
        >
          {#if isVideoLoading}
            <div class="btn-spinner"></div>
          {:else}
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="6,3 20,12 6,21" />
            </svg>
          {/if}
        </button>
      </div>
    {/if}
  </div>

  <!-- Visualization overlay -->
  <div class="py-8 text-white overflow-hidden">
    <div class="w-full max-w-[1800px] mx-auto px-6 flex items-stretch">
      <!-- Character labels: outside the grid, stays put while grid animates -->
      <div class="shrink-0 w-6.5 ml-[-12px] xl:w-20 xl:ml-0">
        <div class="h-9"></div>
        {#each characters as char}
          <div class="flex items-center justify-end gap-2 pr-3 h-12">
            {#if innerWidth >= 1280}
              <div class="small">{char.label}</div>
            {/if}
            <div
              class="image h-7 w-7 rounded-full shrink-0"
              style="background-image: url({getCharacterImagePath(char.id)});"
              role="img"
              aria-label={char.label}
            ></div>
          </div>
        {/each}
      </div>

      <!-- Time grid: clips the overflowing inner content -->
      <div
        class="flex-1 border border-white/40 relative overflow-hidden min-w-0"
        bind:this={gridContainer}
        role="img"
        aria-label="Visualization showing laughter moments per character from 18:35 to 20:35"
      >
        <!-- Playhead: positioned in the container's coordinate space,
               independent of the inner content's translateX -->
        <div
          id="viz-playhead"
          class="absolute top-0 bottom-0 w-0.5 bg-[#E71D80] z-10 pointer-events-none"
          style="left: 0"
          aria-hidden="true"
        ></div>

        <!-- Inner content: desktop fills full width (1fr works); mobile is w-fit for GSAP translate -->
        <div class={innerWidth >= 1024 ? 'w-full' : 'w-fit'} bind:this={gridScrollInner}>
          <!-- Time header row -->
          <div
            class="grid border-b border-white/40"
            style="grid-template-columns: repeat({timeSlots.length}, {colWidth})"
          >
            {#each timeSlots as slot, i}
              <div
                class="h-9 flex items-center justify-center border-white/40"
                class:border-r={i < timeSlots.length - 1}
              >
                <span class="number text-white/70">
                  {formatTimeLabel(slot)}
                </span>
              </div>
            {/each}
          </div>

          <!-- One row per character -->
          {#each range(characters.length) as ri}
            <div
              class="grid border-white/40"
              class:border-b={ri < characters.length - 1}
              style="grid-template-columns: repeat({timeSlots.length}, {colWidth})"
            >
              {#each timeSlots as slot, i}
                <div
                  class="h-12 flex items-center justify-center border-white/40"
                  class:border-r={i < timeSlots.length - 1}
                >
                  {#if laughsByCharTime.has(`${charKeys[ri]}-${slot}`)}
                    <div class="laugh-icon laugh-icon-{slot}">
                      <Laugh width={32} height={32} color="white" />
                    </div>
                  {/if}
                </div>
              {/each}
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .image {
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;
  }

  .play-btn {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.8);
    background: rgba(0, 0, 0, 0.5);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background-color 0.2s, border-color 0.2s, opacity 0.2s;
  }

  .play-btn:not(:disabled):hover {
    background: rgba(231, 29, 128, 0.4);
    border-color: #e71d80;
  }

  .play-btn:disabled {
    opacity: 0.5;
    cursor: default;
  }

  .btn-spinner {
    width: 24px;
    height: 24px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  #demo-video {
    background-color: #12020a;
    /* Constrain to available flex height without distorting aspect ratio */
    max-height: 100%;
    /* Zoom in to crop embedded pillarbox bars (4:3 content in 16:9 file).
       Scale = 1 / (1 - 2 * bar_fraction). Adjust if bars are a different size. */
    transform: scale(1.334);
    transform-origin: center;
  }
</style>

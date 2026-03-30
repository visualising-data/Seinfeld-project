<script>
  // @ts-nocheck

  import { onMount } from 'svelte';
  import { gsap } from 'gsap/dist/gsap';
  import { range } from 'd3-array';

  import Laugh from '../../icons/Laugh.svelte';
  import tv_noise from '$lib/assets/tv_noise.png';
  import { soundIsAuth } from '../../stores/soundAuthStore';
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

  /** @type {HTMLElement} */
  let gridContainer;
  /** @type {HTMLElement} */
  let gridScrollInner;

  let tlVideo;
  onMount(() => {
    const laughIconReveal = { opacity: 0, yPercent: 50, duration: 1, ease: 'power3.out' };

    tlVideo = gsap.timeline({
      scrollTrigger: {
        trigger: '#data-gathering-3',
        start: 'top top',
        end: 'bottom top',
        toggleActions: 'play pause resume pause',
        onEnter: () => playVideo(),
        onLeave: () => pauseVideo(),
        onEnterBack: () => playVideo(),
        onLeaveBack: () => pauseVideo(),
      },
    });

    // Defer GSAP setup so the DOM has been measured
    setTimeout(() => {
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
    }, 3000);

    const video = document.getElementById('demo-video');

    let playPauseTimer;
    function debouncePlayPause(fn) {
      clearTimeout(playPauseTimer);
      playPauseTimer = setTimeout(fn, 100);
    }

    const playVideo = () =>
      debouncePlayPause(() => {
        if (!video.paused) return;
        video.play().catch((err) => {
          if (err.name !== 'AbortError') console.warn('Video play failed:', err);
        });
        tlVideo.restart();
      });

    const pauseVideo = () =>
      debouncePlayPause(() => {
        if (video.paused) return;
        video.pause();
        video.currentTime = 0;
        tlVideo.pause();
      });
  });
</script>

<svelte:window bind:innerWidth />

<div id="data-gathering-3" class="relative bg-[#000]">
  <div class="sticky top-0 h-screen flex flex-col">
    <!-- Video area: fills remaining height above the overlay -->
    <div class="flex-1 relative flex items-center min-h-0 overflow-hidden">
      <!-- svelte-ignore a11y_media_has_caption -->
      <video
        id="demo-video"
        class="w-full h-auto"
        playsinline
        controls={false}
        preload="none"
        bind:muted={isMuted}
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
      ></div>

      <!-- TV noise -->
      <div
        class="absolute inset-0 pointer-events-none"
        style="background-image: url('{tv_noise}')"
      ></div>
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
              ></div>
            </div>
          {/each}
        </div>

        <!-- Time grid: clips the overflowing inner content -->
        <div
          class="flex-1 border border-white/40 relative overflow-hidden min-w-0"
          bind:this={gridContainer}
        >
          <!-- Playhead: positioned in the container's coordinate space,
               independent of the inner content's translateX -->
          <div
            id="viz-playhead"
            class="absolute top-0 bottom-0 w-0.5 bg-[#E71D80] z-10 pointer-events-none"
            style="left: 0"
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

  <!-- Scroll spacers: keep section pinned long enough to watch the clip -->
  <div class="h-screen"></div>
  <div class="h-screen"></div>
  <div class="h-screen"></div>
</div>

<style>
  .image {
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;
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

<script>
  import { onMount } from 'svelte';
  import { scaleLinear } from 'd3-scale';
  import { gsap } from 'gsap/dist/gsap';

  import { formatTime } from '../../utils/formatTime';
  import EpisodeDetails from '../catalog/EpisodeDetails.svelte';
  import EpisodeScore from '../catalog/episodeScore/EpisodeScore.svelte';
  import EpisodeTexts from './EpisodeTexts.svelte';

  let { episodeInfo, episodeData, laughData, ScrollTrigger } = $props();

  let innerWidth = $state(1200);
  let innerHeight = $state(800);
  let episodeWidth = $derived(innerWidth > 793 ? innerWidth - 273 : innerWidth - 98);
  const statsWidth = $derived(innerWidth >= 1280 ? 240 : 0);

  const timeScale = $derived(
    scaleLinear()
      .domain([0, +laughData[laughData.length - 1].eventTimeSeconds + 5])
      .range([0, episodeWidth]),
  );
  const laughWidth = $derived(timeScale(5));
  const labelsWidth = $derived(innerWidth >= 1280 ? 176 : 60);
  const extraPadding = $derived(innerWidth >= 1280 ? 60 : 10);
  let vizWidth = $derived(
    innerWidth > 1000
      ? innerWidth - statsWidth - extraPadding
      : Math.max(innerWidth - extraPadding, 1000),
  );
  let scenesWidth = $derived(vizWidth - labelsWidth);
  const scenesData = $derived(
    episodeData.filter((/** @type { any } */ d) => d.eventCategory === 'SCENE'),
  );
  const scenes = $derived.by(() => {
    const scenesArray = [];
    const lastSceneNumber = +scenesData[scenesData.length - 2].sceneNumber;
    for (let i = 1; i <= lastSceneNumber; i++) {
      const sceneData = scenesData.filter((/** @type { any } */ d) => +d.sceneNumber === i);
      const startTime = sceneData[0].eventTime;
      const endTime = sceneData[sceneData.length - 1].eventTime;
      scenesArray.push({
        sceneNum: i,
        startTime: formatTime(startTime),
        endTime: formatTime(endTime) + 5,
      });
    }

    return scenesArray;
  });
  const xScale = $derived(
    scaleLinear()
      .domain([0, scenes[scenes.length - 1].endTime])
      .range([0, scenesWidth]),
  );

  onMount(() => {
    // Keep episode-example below the catalog backdrop (z-10) so catalog is always clickable.
    gsap.set('#episode-example', { zIndex: 5 });

    // Establish initial hidden state BEFORE creating ScrollTriggers.
    // If the component mounts while the user is already scrolled into or past this
    // section (e.g. browser scroll restoration, direct navigation, or fast scrolling),
    // GSAP fires onEnter callbacks immediately during ScrollTrigger.create. Setting the
    // hidden state first ensures reveals animate FROM the correct starting position
    // rather than being snapped back to hidden after the reveal has already started.
    gsap.set('#episode-detail-container', {
      translateY: 260,
      opacity: 0,
    });
    gsap.set('#episode-length', {
      translateX: -30,
      opacity: 0,
    });
    gsap.set(
      '#episode-example-container .catalog-character-on-screen, #episode-example-container .catalog-location-on-screen, #episode-example-container .catalog-character-label, #episode-example-container .catalog-location-label',
      {
        translateX: -30,
        opacity: 0,
      },
    );
    gsap.set(
      '#episode-example-container .catalog-character-stats, #episode-example-container .catalog-location-stats',
      { translateX: -30, opacity: 0 },
    );
    gsap.set('#duration-example .episode-start-end', {
      translateY: 20,
      opacity: 0,
    });
    gsap.set('#duration-example .laugh-bar, #episode-example-container .catalog-laugh-bar', {
      translateY: 100,
      opacity: 0,
    });
    gsap.set('#duration-example .label, .score-wrapper', {
      translateY: -30,
      opacity: 0,
    });

    // ScrollTrigger-based step callbacks (replaces svelte-inview for reliability).
    [1, 2, 3, 4, 5, 6, 7, 8].forEach((step) => {
      const el = document.getElementById(`episode-example-text-${step}`);
      if (!el) return;
      ScrollTrigger.create({
        trigger: el,
        start: 'top center',
        onEnter: () => episodeStepChange(step),
        onLeaveBack: () => episodeStepLeave(step),
      });
    });

    // Scrub fade-out during the crossfade zone (the extra 100vh after all text is done).
    gsap.to('#episode-example', {
      opacity: 0,
      ease: 'none',
      scrollTrigger: {
        trigger: '#episode-example-container',
        start: 'bottom bottom',
        end: 'bottom top',
        scrub: true,
        onEnter: () => gsap.set('#episode-example', { pointerEvents: 'none' }),
        onLeave: () => gsap.set('#episode-example', { pointerEvents: 'none' }),
        onEnterBack: () => gsap.set('#episode-example', { pointerEvents: 'none' }),
        onLeaveBack: () => gsap.set('#episode-example', { pointerEvents: 'auto' }),
      },
    });
  });

  const textAnim = {
    webkitTextFillColor: 'transparent',
    backgroundPosition: '200% center',
    duration: 2,
    delay: 1,
    ease: 'power3.out',
  };

  const reveal1 = () => {
    gsap.to('#episode-detail-container', {
      translateY: 0,
      opacity: 1,
      ease: 'power3.out',
      duration: 2,
    });
  };

  const reveal2 = () => {
    gsap.to('#duration-example', { opacity: 1, duration: 0.3 });
    gsap.to('#episode-length', {
      translateX: 0,
      opacity: 1,
      ease: 'power3.out',
      duration: 1,
    });
    gsap.to('#duration-example .episode-start-end', {
      translateY: 0,
      opacity: 1,
      ease: 'power3.out',
      duration: 0.5,
      delay: 0.7,
    });
  };

  const reveal3 = () => {
    gsap.to('#episode-example-text-3 .highlight', textAnim);
    gsap.to('#laughs-group', { opacity: 1, duration: 0.3 });
    gsap.to('#duration-example .laugh-bar', {
      translateY: 0,
      opacity: 1,
      ease: 'power3.out',
      duration: 1,
    });
    gsap.to('#duration-example .label', {
      translateY: 0,
      opacity: 1,
      ease: 'power3.out',
      duration: 1,
      delay: 0.5,
    });
  };

  const reveal4 = () => {
    gsap.to('#episode-example-text-4 .highlight', textAnim);
    gsap.to(
      '#episode-length, #duration-example .episode-start-end, #duration-example .laugh-bar, #duration-example .label',
      {
        translateY: 100,
        opacity: 0,
        ease: 'power3.out',
        duration: 1,
      },
    );
    gsap.to('.score-wrapper', {
      translateY: 0,
      opacity: 1,
      ease: 'power3.out',
      duration: 1,
      delay: 0.7,
    });
  };

  const reveal5 = () => {
    gsap.to('#episode-example-text-5 .highlight', textAnim);
    gsap.to('#episode-example-container .catalog-character-label', {
      translateX: 0,
      opacity: 1,
      ease: 'power3.out',
      duration: 2,
    });
    gsap.to('#episode-example-container .catalog-character-on-screen', {
      translateX: 0,
      opacity: 1,
      ease: 'power3.out',
      duration: 1,
    });
    gsap.to('#episode-example-container .catalog-character-stats', {
      translateX: 0,
      opacity: 1,
      ease: 'power3.out',
      duration: 1,
      delay: 0.3,
    });
  };

  const reveal6 = () => {
    gsap.to('#episode-example-text-6 .highlight', textAnim);
    gsap.to('#episode-example-container .catalog-laugh-bar', {
      translateY: 0,
      opacity: 1,
      ease: 'power3.out',
      duration: 1,
    });
  };

  const reveal7 = () => {
    gsap.to('#episode-example-text-7 .highlight', textAnim);
    gsap.to('#episode-example-container .catalog-location-label', {
      translateX: 0,
      opacity: 1,
      ease: 'power3.out',
      duration: 2,
    });
    gsap.to('#episode-example-container .catalog-location-on-screen', {
      translateX: 0,
      opacity: 1,
      ease: 'power3.out',
      duration: 0.3,
    });
    gsap.to('#episode-example-container .catalog-location-stats', {
      translateX: 0,
      opacity: 1,
      ease: 'power3.out',
      duration: 1,
      delay: 0.3,
    });
  };

  const reveal8 = () => {
    gsap.to('#episode-example-text-8 .highlight', textAnim);
  };

  /**
   * @param {number} number
   */
  function episodeStepChange(number) {
    switch (number) {
      case 1:
        reveal1();
        break;
      case 2:
        reveal2();
        break;
      case 3:
        reveal3();
        break;
      case 4:
        reveal4();
        break;
      case 5:
        reveal5();
        break;
      case 6:
        reveal6();
        break;
      case 7:
        reveal7();
        break;
      case 8:
        reveal8();
        break;
      default:
        return null;
    }
  }

  const undo1 = () => {
    gsap.to('#episode-detail-container', {
      translateY: 260,
      opacity: 0,
      ease: 'power3.in',
      duration: 1,
    });
  };

  const undo2 = () => {
    gsap.to('#episode-length', { translateX: -30, opacity: 0, ease: 'power3.in', duration: 0.7 });
    gsap.to('#duration-example .episode-start-end', {
      translateY: 20,
      opacity: 0,
      ease: 'power3.in',
      duration: 0.5,
    });
    gsap.to('#duration-example', { opacity: 0, ease: 'power3.in', duration: 0.5, delay: 0.7 });
  };

  const undo3 = () => {
    gsap.to('#duration-example .laugh-bar', {
      translateY: 100,
      opacity: 0,
      ease: 'power3.in',
      duration: 0.5,
    });
    gsap.to('#duration-example .label', {
      translateY: -30,
      opacity: 0,
      ease: 'power3.in',
      duration: 0.5,
    });
    gsap.to('#laughs-group', { opacity: 0, ease: 'power3.in', duration: 0.3, delay: 0.5 });
  };

  const undo4 = () => {
    gsap.to('.score-wrapper', { translateY: -30, opacity: 0, ease: 'power3.in', duration: 0.5 });
    gsap.to('#episode-length', {
      translateX: 0,
      translateY: 0,
      opacity: 1,
      ease: 'power3.out',
      duration: 0.7,
      delay: 0.2,
    });
    gsap.to('#duration-example .episode-start-end', {
      translateY: 0,
      opacity: 1,
      ease: 'power3.out',
      duration: 0.5,
      delay: 0.3,
    });
    gsap.to('#duration-example .laugh-bar', {
      translateY: 0,
      opacity: 1,
      ease: 'power3.out',
      duration: 0.7,
      delay: 0.3,
    });
    gsap.to('#duration-example .label', {
      translateY: 0,
      opacity: 1,
      ease: 'power3.out',
      duration: 0.5,
      delay: 0.5,
    });
  };

  const undo5 = () => {
    gsap.to('#episode-example-container .catalog-character-label', {
      translateX: -30,
      opacity: 0,
      ease: 'power3.in',
      duration: 0.7,
    });
    gsap.to('#episode-example-container .catalog-character-on-screen', {
      translateX: -30,
      opacity: 0,
      ease: 'power3.in',
      duration: 0.5,
    });
    gsap.to('#episode-example-container .catalog-character-stats', {
      translateX: -30,
      opacity: 0,
      ease: 'power3.in',
      duration: 0.5,
    });
  };

  const undo6 = () => {
    gsap.to('#episode-example-container .catalog-laugh-bar', {
      translateY: 100,
      opacity: 0,
      ease: 'power3.in',
      duration: 0.5,
    });
  };

  const undo7 = () => {
    gsap.to('#episode-example-container .catalog-location-label', {
      translateX: -30,
      opacity: 0,
      ease: 'power3.in',
      duration: 0.7,
    });
    gsap.to('#episode-example-container .catalog-location-on-screen', {
      translateX: -30,
      opacity: 0,
      ease: 'power3.in',
      duration: 0.3,
    });
    gsap.to('#episode-example-container .catalog-location-stats', {
      translateX: -30,
      opacity: 0,
      ease: 'power3.in',
      duration: 0.5,
    });
  };

  /**
   * @param {number} number
   */
  function episodeStepLeave(number) {
    switch (number) {
      case 1:
        undo1();
        break;
      case 2:
        undo2();
        break;
      case 3:
        undo3();
        break;
      case 4:
        undo4();
        break;
      case 5:
        undo5();
        break;
      case 6:
        undo6();
        break;
      case 7:
        undo7();
        break;
      default:
        return null;
    }
  }
</script>

<svelte:window bind:innerWidth bind:innerHeight />

<div id="episode-example-container" class="relative pointer-events-none">
  <div id="episode-example" class="sticky top-0 w-full" style="z-index: 5;">
    <div class="relative flex flex-col overflow-hidden" style="height: {innerHeight}px;">
      <!-- Episode details -->
      <div class="mask self-start">
        <div id="episode-detail-container">
          <EpisodeDetails {episodeInfo} />
        </div>
      </div>

      <!-- Episode duration and laughs -->
      <div
        id="duration-example"
        class="flex flex-1 items-center justify-center"
        style="width: {innerWidth - 25}px; opacity: 0;"
      >
        <svg width={innerWidth > 793 ? innerWidth - 225 : innerWidth - 50} height="140">
          <g transform="translate(0, 40)">
            <rect
              id="episode-length"
              x={24}
              y={10}
              width={episodeWidth}
              height={50}
              fill="#DDDBDC"
              opacity="0"
            />
            <g class="episode-start-end" opacity="0">
              <text class="number" y={90}>00:00</text>
              <text class="number" x={episodeWidth} y={90}>21:45</text>
              <g transform="translate(60, 86)">
                <text class="small accent" alignment-baseline="middle">Episode run-time</text>
                <g transform="translate({120}, {-3})">
                  <path
                    d="M30 3L25 0.113249V5.88675L30 3ZM0 3V3.5H25.5V3V2.5H0V3Z"
                    fill="#E71D80"
                  />
                </g>
              </g>
            </g>

            <!-- Laughs -->
            <g id="laughs-group" transform="translate(24, 0)" style="opacity: 0">
              {#each laughData as laugh}
                <rect
                  class="laugh-bar"
                  x={timeScale(+laugh.eventTimeSeconds)}
                  y={0}
                  width={laughWidth}
                  height={70}
                  fill="#12020A"
                  stroke="#F9F5F7"
                  stroke-width={innerWidth > 793 ? 1.5 : 0.5}
                />
              {/each}
              <text class="mid label" x={timeScale(+laughData[0].eventTimeSeconds)} y={-20}
                >Each bar represents a block of 5s with audience laughter.</text
              >
              <line
                class="label"
                x1={timeScale(+laughData[0].eventTimeSeconds) + laughWidth / 2}
                y1={-15}
                x2={timeScale(+laughData[0].eventTimeSeconds) + laughWidth / 2}
                y2={-4}
                stroke="#E71D80"
              />
            </g>
          </g>
        </svg>
      </div>

      <!-- Episode data -->
      <div
        class="score-wrapper w-full absolute top-[280px] mt-[40px]"
        style="max-height: {innerHeight - 320}px;"
      >
        <EpisodeScore
          {statsWidth}
          {episodeData}
          width={scenesWidth}
          {labelsWidth}
          {scenes}
          {xScale}
        />
      </div>
    </div>
  </div>

  <!-- Scrolling Texts — negative margin-top pulls them up to overlay #episode-example,
       since sticky keeps it in the normal flow (unlike the old absolute positioning). -->
  <div class="relative" style="pointer-events: none; z-index: 30; margin-top: -{innerHeight}px;">
    <EpisodeTexts />
  </div>
</div>

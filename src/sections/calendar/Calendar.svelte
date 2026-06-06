<script>
  import { onMount, onDestroy } from 'svelte';
  import { scaleTime } from 'd3-scale';
  import { forceSimulation, forceX, forceY, forceCollide } from 'd3-force';
  import { range } from 'd3-array';
  import { gsap } from 'gsap/dist/gsap';
  const PLIP_URL =
    'https://amdufour.github.io/hosted-data/apis/sonification/20250925_Seinfeld_Intro_Plip.mp3';
  import { soundIsAuth } from '../../stores/soundAuthStore';
  import { enterSoundSection, leaveSoundSection } from '../../stores/soundSectionIsInView';
  import { catalogIsInView } from '../../stores/catalogIsInView';
  import { navBarColor } from '../../stores/navbarColor';

  import { seasons } from '$lib/data/seasons';
  import { episodesInfo } from '$lib/data/episodesInfo';
  import EpisodeTooltip from '../../UI/EpisodeTooltip.svelte';
  import CalendarTexts from './CalendarTexts.svelte';

  let { ScrollTrigger } = $props();

  /** @type {ReturnType<typeof gsap.context>} */
  let ctx;

  /**
   * @type {number}
   */
  let innerWidth = $state(1600);
  let innerHeight = $state(800);
  let screenSize = $derived({ width: innerWidth, height: innerHeight });
  let seasonsWidth = $derived(innerWidth >= 793 ? 130 : 54);
  let headersHeight = $derived(innerWidth >= 768 ? 80 : 40);
  let navbarHeight = $derived(innerWidth < 1024 ? 56 : 0);
  let episodeRadius = $derived(innerWidth >= 1400 ? 15 : innerWidth > 540 ? 12 : 10);

  const tvSeasons = [
    {
      season: 'Fall',
      months: ['Sep', 'Oct', 'Nov', 'Dec'],
    },
    {
      season: 'Winter/Spring',
      months: ['Jan', 'Feb', 'Mar', 'Apr'],
    },
    {
      season: 'Summer',
      months: ['May', 'Jun', 'Jul', 'Aug'],
    },
  ];

  /**
   * @type {any[]}
   */
  let nodes = $state([]);

  const getTimeDomain = (/** @type {number} */ season, /** @type {string} */ date) => {
    switch (season) {
      case 1:
        return date === 'July 5 1989'
          ? [new Date(1988, 8, 1), new Date(1989, 7, 31)]
          : [new Date(1989, 8, 1), new Date(1990, 7, 31)];
      case 2:
        return [new Date(1990, 8, 1), new Date(1991, 7, 31)];
      case 3:
        return [new Date(1991, 8, 1), new Date(1992, 7, 31)];
      case 4:
        return date === 'August 12 1992' || date === 'August 19 1992'
          ? [new Date(1991, 8, 1), new Date(1992, 7, 31)]
          : [new Date(1992, 8, 1), new Date(1993, 7, 31)];
      case 5:
        return [new Date(1993, 8, 1), new Date(1994, 7, 31)];
      case 6:
        return [new Date(1994, 8, 1), new Date(1995, 7, 31)];
      case 7:
        return [new Date(1995, 8, 1), new Date(1996, 7, 31)];
      case 8:
        return [new Date(1996, 8, 1), new Date(1997, 7, 31)];
      default:
        return [new Date(1997, 8, 1), new Date(1998, 7, 31)];
    }
  };

  const timeScale = $derived(
    scaleTime()
      .domain(getTimeDomain(1, 'July 6 1989')) // [new Date(1989, 8, 1), new Date(1990, 7, 31)]
      .range([15, screenSize.width - seasonsWidth - 15]),
  );

  const globalTimeScale = (/** @type {string} */ month) => {
    switch (month) {
      case 'Sep':
        return timeScale(new Date('October 1 1989'));
      case 'Oct':
        return timeScale(new Date('November 1 1989'));
      case 'Nov':
        return timeScale(new Date('December 1 1989'));
      case 'Dec':
        return timeScale(new Date('January 1 1990'));
      case 'Jan':
        return timeScale(new Date('February 1 1990'));
      case 'Feb':
        return timeScale(new Date('March 1 1990'));
      case 'Mar':
        return timeScale(new Date('April 1 1990'));
      case 'Apr':
        return timeScale(new Date('May 1 1990'));
      case 'May':
        return timeScale(new Date('June 1 1990'));
      case 'Jun':
        return timeScale(new Date('July 1 1990'));
      case 'Jul':
        return timeScale(new Date('August 1 1990'));
      default:
        return timeScale(new Date('August 31 1990'));
    }
  };

  const monthScale = (/** @type {string} */ month) => {
    let date1;
    let date2;
    switch (month) {
      case 'Sep':
        date1 = timeScale(new Date('September 15 1989'));
        date2 = timeScale(new Date('September 15 1989'));
        break;
      case 'Oct':
        date1 = timeScale(new Date('October 15 1989'));
        date2 = timeScale(new Date('October 16 1989'));
        break;
      case 'Nov':
        date1 = timeScale(new Date('November 15 1989'));
        date2 = timeScale(new Date('November 15 1989'));
        break;
      case 'Dec':
        date1 = timeScale(new Date('December 15 1989'));
        date2 = timeScale(new Date('December 16 1989'));
        break;
      case 'Jan':
        date1 = timeScale(new Date('January 15 1990'));
        date2 = timeScale(new Date('January 16 1990'));
        break;
      case 'Feb':
        date1 = timeScale(new Date('February 14 1990'));
        date2 = timeScale(new Date('February 14 1990'));
        break;
      case 'Mar':
        date1 = timeScale(new Date('March 15 1990'));
        date2 = timeScale(new Date('March 16 1990'));
        break;
      case 'Apr':
        date1 = timeScale(new Date('April 15 1990'));
        date2 = timeScale(new Date('April 15 1990'));
        break;
      case 'May':
        date1 = timeScale(new Date('May 15 1990'));
        date2 = timeScale(new Date('May 16 1990'));
        break;
      case 'Jun':
        date1 = timeScale(new Date('June 15 1990'));
        date2 = timeScale(new Date('June 15 1990'));
        break;
      case 'Jul':
        date1 = timeScale(new Date('July 15 1990'));
        date2 = timeScale(new Date('July 16 1990'));
        break;
      default:
        date1 = timeScale(new Date('August 15 1990'));
        date2 = timeScale(new Date('August 16 1990'));
        break;
    }

    return date1 + (date2 - date1) / 2;
  };

  let getXPosition = $derived.by(
    () => (/** @type {number} */ season, /** @type {string} */ date) => {
      const timeScale = scaleTime()
        .domain(getTimeDomain(season, date))
        .range([15, screenSize.width - seasonsWidth - 15]);
      return timeScale(new Date(date));
    },
  );

  // Season blocks are flex-grow:1 children of a h-[100dvh] flex column with one fixed
  // header row — compute their geometry purely from innerHeight / headersHeight so
  // there are no stale DOM reads on resize.
  let getYPosition = $derived.by(() => {
    const blockHeight = (innerHeight - navbarHeight - headersHeight) / 9;
    const _headersHeight = headersHeight;
    const _episodeRadius = episodeRadius;
    return (
      /** @type {number} */ season,
      /** @type {number} */ episode,
      /** @type {string} */ date,
      /** @type {number} */ verticalStack,
    ) => {
      const seasonId = date === 'August 12 1992' || date === 'August 19 1992' ? season - 1 : season;
      const blockTop = _headersHeight + (seasonId - 1) * blockHeight;

      if (season === 1) {
        return date === 'July 5 1989' ? 20 + _headersHeight : blockHeight / 2 + _headersHeight + 10;
      } else {
        const lastEpisodes = [21, 22, 23, 24];
        const offset = season === 9 && lastEpisodes.includes(episode) ? 16 : 0;
        return blockTop + blockHeight / 2 + verticalStack * 2 * _episodeRadius - offset;
      }
    };
  });

  let isTooltipVisible = $state(false);
  let hoveredEpisode = $state();
  let mousePosition = $state();
  const handleMouseEnter = (
    /** @type {MouseEvent & { currentTarget: EventTarget & SVGGElement; }} */ e,
    /** @type {any} */ episode,
  ) => {
    mousePosition = [e.clientX, e.clientY];
    isTooltipVisible = true;
    hoveredEpisode = episode;
  };
  const handleMouseLeave = () => {
    isTooltipVisible = false;
  };

  const episodesShow1 = ['s1e1'];
  const episodesShow2 = ['s1e2', 's1e3', 's1e4', 's1e5'];
  const twelveArray = range(1, 13);
  const twentyTwoArray = range(1, 23);
  const twentyThreeArray = range(1, 24);
  const twentyFourArray = range(1, 25);
  const episodesShow3 = twelveArray.map((e) => `s2e${e}`);
  const episodesShow4 = twentyThreeArray.map((e) => `s3e${e}`);
  const episodesShow5 = twentyFourArray.map((e) => `s4e${e}`);
  const episodesShow6 = twentyTwoArray
    .map((e) => `s5e${e}`)
    .concat(twentyFourArray.map((e) => `s6e${e}`))
    .concat(twentyFourArray.map((e) => `s7e${e}`))
    .concat(twentyTwoArray.map((e) => `s8e${e}`))
    .concat(twentyFourArray.map((e) => `s9e${e}`));

  const getSelectors = (/** @type {number} */ number) => {
    switch (number) {
      case 1:
        return episodesShow1.map((e) => `#calendar-${e}`).join(',');
      case 2:
        return episodesShow2.map((e) => `#calendar-${e}`).join(',');
      case 3:
        return episodesShow3.map((e) => `#calendar-${e}`).join(',');
      case 4:
        return episodesShow4.map((e) => `#calendar-${e}`).join(',');
      case 5:
        return episodesShow5.map((e) => `#calendar-${e}`).join(',');
      default:
        return episodesShow6.map((e) => `#calendar-${e}`).join(',');
    }
  };

  /** @type {HTMLAudioElement[]} */
  let audioPool = [];
  let poolIndex = 0;
  /** @type {() => void} */
  let unsubSoundAuth = () => {};

  const playSound = () => {
    if (!$soundIsAuth || !$catalogIsInView || audioPool.length === 0) return;
    const audio = audioPool[poolIndex++ % audioPool.length];
    audio.currentTime = 0;
    audio.play().catch(() => {});
  };

  /**
   * @param {number} number
   */
  function showEpisodes(number) {
    const selectors = getSelectors(number);

    if (!selectors) return;

    gsap.killTweensOf(selectors);
    const maxSounds = number >= 5 ? 30 : 20;
    let soundCount = 0;
    gsap.to(selectors, {
      scale: 1,
      opacity: 1,
      ease: 'back.out(3)',
      duration: 1,
      pointerEvents: 'auto',
      stagger: {
        from: 'random',
        amount: 0.4,
        ease: 'power2',
        onStart: () => {
          if (soundCount++ < maxSounds) playSound();
        },
      },
    });
  }
  /**
   * @param {number} number
   */
  function hideEpisodes(number) {
    const selectors = getSelectors(number);
    gsap.to(selectors, {
      scale: 0,
      opacity: 0,
      pointerEvents: 'none',
    });
  }

  /**
   * @param {number} number
   * @param {boolean} stagger
   */
  function animateHighlight(number, stagger = false) {
    const props = {
      webkitTextFillColor: 'transparent',
      backgroundPosition: '200% center',
      duration: 2,
      delay: 0.5,
      ease: 'power3.out',
    };
    if (stagger) /** @type {any} */ (props).stagger = 0.3;
    gsap.to(`#calendar-text-overlay-${number} .highlight`, props);
  }

  /**
   * @type {import("d3-force").Simulation<import("d3-force").SimulationNodeDatum, undefined>}
   */
  let simulation;
  const initializeSimulation = () => {
    simulation = forceSimulation(episodesInfo);
    simulation.on('tick', () => {
      nodes = [...simulation.nodes()];
    });

    simulation
      .force(
        'x',
        forceX((/** @type {any} */ d) => getXPosition(d.season, d.date_aired)).strength(1),
      )
      .force(
        'y',
        forceY((/** @type {any} */ d) =>
          getYPosition(d.season, d.episode, d.date_aired, d.verticalStack ? d.verticalStack : 0),
        ).strength(0.5),
      )
      .force('collide', forceCollide().radius(episodeRadius).strength(1))
      // .force('walls', wallForce)
      .alpha(0.5)
      .alphaDecay(0.1);
  };

  $effect(() => {
    // Explicitly read innerWidth/innerHeight so this effect re-runs on every resize.
    // getXPosition and getYPosition use $derived.by whose outer fn has no reactive reads,
    // so Svelte never marks them as changed — we must track size manually.
    innerWidth;
    innerHeight;
    const _episodeRadius = episodeRadius;

    if (simulation) {
      requestAnimationFrame(() => {
        const getX = getXPosition;
        const getY = getYPosition;

        // Snap nodes directly to new target positions so the visual update is
        // instant rather than animated. The simulation then runs at low alpha
        // only to resolve collisions from the new layout.
        simulation.nodes().forEach((/** @type {any} */ d) => {
          d.x = getX(d.season, d.date_aired);
          d.y = getY(d.season, d.episode, d.date_aired, d.verticalStack ?? 0);
          d.vx = 0;
          d.vy = 0;
        });
        nodes = [...simulation.nodes()];

        simulation
          .force('x', forceX((/** @type {any} */ d) => getX(d.season, d.date_aired)).strength(1))
          .force(
            'y',
            forceY((/** @type {any} */ d) =>
              getY(d.season, d.episode, d.date_aired, d.verticalStack ?? 0),
            ).strength(0.5),
          )
          .force('collide', forceCollide().radius(_episodeRadius).strength(1))
          .alpha(0.3)
          .restart();
      });
    }
  });

  onMount(() => {
    // Preload Plip sound
    const preload = () => {
      audioPool = Array.from({ length: 8 }, () => {
        const a = new Audio(PLIP_URL);
        a.load();
        return a;
      });
    };
    preload();

    // iOS audio unlock: HTMLAudioElement must be played once during a user gesture
    // before it can be played from GSAP callbacks. soundIsAuth.subscribe() fires
    // synchronously when the store changes, so this runs within the "Allow sound"
    // onclick handler — still inside the user gesture callstack.
    unsubSoundAuth = soundIsAuth.subscribe((isAuth) => {
      if (isAuth && audioPool.length > 0) {
        audioPool.forEach((audio) => {
          audio.play().then(() => {
            audio.pause();
            audio.currentTime = 0;
          }).catch(() => {});
        });
      }
    });

    // Run simulation
    initializeSimulation();
    let simulationInitialized = false;
    simulation.on('end', () => {
      if (!simulationInitialized) {
        simulationInitialized = true;
        gsap.set('.calendar-episode', {
          scale: 0.1,
          opacity: 0,
          transformOrigin: 'center',
          pointerEvents: 'none',
        });
        // Restore visible episodes when reloading mid-scroll: ScrollTrigger already
        // fired onEnter before nodes existed in the DOM, so manually re-show any
        // batches whose trigger is already past the viewport center.
        // Uses innerHeight/2 to match the 'center center' trigger start point.
        for (let i = 1; i <= 5; i++) {
          const el = document.querySelector(`#calendar-text-overlay-${i}`);
          if (el) {
            const rect = el.getBoundingClientRect();
            if (rect.top + rect.height / 2 < window.innerHeight / 2) {
              showEpisodes(i);
            }
          }
        }
      }
    });

    ctx = gsap.context(() => {
      // Pin calendar
      ScrollTrigger.create({
        trigger: '#intro-calendar-container',
        start: 'top top',
        end: 'bottom bottom',
        pin: '#intro-calendar',
        invalidateOnRefresh: true,
        onEnter: () => {
          $catalogIsInView = true;
        },
        onLeave: () => {
          $catalogIsInView = false;
          $navBarColor = 'white';
          isTooltipVisible = false;
          leaveSoundSection();
        },
        onEnterBack: () => {
          $catalogIsInView = true;
          $navBarColor = 'pink';
          enterSoundSection();
        },
        onLeaveBack: () => {
          $catalogIsInView = false;
          isTooltipVisible = false;
          leaveSoundSection();
        },
      });

      // Reveal episodes (forward) / hide in reverse order (backward)
      // 'center center' fires when the text element's center reaches the viewport
      // center — the text is fully readable at that point and the trigger is
      // conservative enough to survive ScrollTrigger.refresh() calls from
      // lazy-loading without accidentally firing while the text is off-screen.
      gsap.timeline({
        scrollTrigger: {
          trigger: '#calendar-text-overlay-1',
          start: 'center center',
          invalidateOnRefresh: true,
          onEnter: () => { showEpisodes(1); enterSoundSection(); animateHighlight(1); },
          onLeaveBack: () => {
            hideEpisodes(1);
            hideEpisodes(2);
            hideEpisodes(3);
            hideEpisodes(4);
            hideEpisodes(5);
            hideEpisodes(6);
          },
        },
      });
      gsap.timeline({
        scrollTrigger: {
          trigger: '#calendar-text-overlay-2',
          start: 'center center',
          invalidateOnRefresh: true,
          onEnter: () => { showEpisodes(2); animateHighlight(2); },
          onLeaveBack: () => hideEpisodes(2),
        },
      });
      gsap.timeline({
        scrollTrigger: {
          trigger: '#calendar-text-overlay-3',
          start: 'center center',
          invalidateOnRefresh: true,
          onEnter: () => { showEpisodes(3); animateHighlight(3); },
          onLeaveBack: () => hideEpisodes(3),
        },
      });
      gsap.timeline({
        scrollTrigger: {
          trigger: '#calendar-text-overlay-4',
          start: 'center center',
          invalidateOnRefresh: true,
          onEnter: () => { showEpisodes(4); animateHighlight(4); },
          onLeaveBack: () => hideEpisodes(4),
        },
      });
      gsap.timeline({
        scrollTrigger: {
          trigger: '#calendar-text-overlay-5',
          start: 'center center',
          invalidateOnRefresh: true,
          onEnter: () => { showEpisodes(5); animateHighlight(5); },
          onLeaveBack: () => hideEpisodes(5),
        },
      });
      gsap.timeline({
        scrollTrigger: {
          trigger: '#calendar-text-overlay-6',
          start: 'center center',
          invalidateOnRefresh: true,
          onEnter: () => { showEpisodes(6); animateHighlight(6, true); },
          onLeaveBack: () => hideEpisodes(6),
        },
      });
    });
  });

  onDestroy(() => {
    ctx?.revert();
    $catalogIsInView = false;
    unsubSoundAuth();
  });
</script>

<svelte:window bind:innerWidth bind:innerHeight />

<div id="intro-calendar-container" class="relative">
  <div
    id="intro-calendar"
    class="absolute flex w-screen"
    style="height: {innerHeight}px; padding-top: {navbarHeight}px; background: {navbarHeight > 0
      ? `linear-gradient(#E71D80 ${navbarHeight}px, transparent ${navbarHeight}px)`
      : 'rgb(231 29 128 / 0.05)'};"
  >
    <!-- Seasons -->
    <div class="flex flex-col h-full" style="width: {seasonsWidth}px;">
      <div class="relative px-4 bg-accent" style="height: {headersHeight}px;">
        {#if innerWidth >= 793}
          <div class="relative text-white" style="top: {12}px;">Schedule</div>
        {/if}
      </div>
      {#each seasons as season, i}
        <div
          id={`catalog-season-${i + 1}`}
          class="flex flex-col justify-center px-4"
          style="flex-grow: 1; color: {i > 1 ? '#F9F5F7' : '#12020A'}; background: {season.color};
          font-size: {innerWidth >= 793 ? '1.125rem' : '0.875rem'};"
        >
          <div class="uppercase">{season.id}</div>
          {#if innerWidth >= 793}
            <div>{season.years}</div>
          {/if}
        </div>
      {/each}
    </div>

    <svg
      class="absolute"
      width={innerWidth - seasonsWidth}
      height={innerHeight - navbarHeight}
      style="top: {navbarHeight}px; left: {seasonsWidth}px;"
    >
      <!-- Header background -->
      <rect x={0} y={0} width={innerWidth - seasonsWidth} height={headersHeight} fill="#E71D80" />

      <!-- Seasons and Months -->
      {#each tvSeasons as tvSeason, i}
        <!-- Season labels -->
        <text
          class="text-sm md:text-[22px] leading-none"
          x={i === 0
            ? timeScale(new Date('November 1 1989'))
            : i === 1
              ? timeScale(new Date('March 1 1990'))
              : timeScale(new Date('July 1 1990'))}
          y={innerWidth >= 793 ? 26 : 18}
          text-anchor="middle"
          dominant-baseline="middle"
          fill="white"
        >
          {#if tvSeason.season === 'Winter/Spring' && innerWidth < 640}
            <tspan x={timeScale(new Date('March 1 1990'))} dy="-8" text-anchor="middle"
              >Winter/</tspan
            >
            <tspan x={timeScale(new Date('March 1 1990'))} dy="18" text-anchor="middle"
              >Spring</tspan
            >
          {:else}
            {tvSeason.season}
          {/if}
        </text>

        <!-- Month labels -->
        {#if innerWidth >= 768}
          {#each tvSeason.months as month}
            <text
              class="text-base"
              x={monthScale(month)}
              y={66}
              text-anchor="middle"
              dominant-baseline="middle"
              fill="white"
            >
              {month}
            </text>
          {/each}
        {/if}
      {/each}

      <!-- Month separators -->
      {#if innerWidth >= 768}
        {#each tvSeasons as season}
          {#each season.months as month}
            {#if month !== 'Aug'}
              <line
                x1={globalTimeScale(month)}
                y1={month === 'Dec' || month === 'Apr' ? 0 : 50}
                x2={globalTimeScale(month)}
                y2={innerHeight}
                stroke="#BEBABC"
              />
            {/if}
          {/each}
        {/each}
      {:else}
        {#each tvSeasons as season}
          {#each season.months as month}
            {#if month === 'Dec' || month === 'Apr'}
              <line
                x1={globalTimeScale(month)}
                y1={0}
                x2={globalTimeScale(month)}
                y2={innerHeight}
                stroke="#BEBABC"
              />
            {/if}
          {/each}
        {/each}
      {/if}

      <!-- Episodes -->
      {#each nodes as node}
        <g transform={`translate(${node.x}, ${node.y})`}>
          <g
            id={`calendar-s${node.season}e${node.episode}`}
            class="calendar-episode"
            style="cursor: default;"
            role="document"
            onmouseenter={(e) => handleMouseEnter(e, node)}
            onmouseleave={handleMouseLeave}
          >
            <circle
              r={episodeRadius}
              fill={node.isSpecial
                ? '#BEBABC'
                : seasons.find(
                    (/** @type {{ seasonNum: any; }} */ s) => s.seasonNum === node.season,
                  )?.color}
            />
            <text
              class="number"
              text-anchor="middle"
              dominant-baseline="middle"
              dy={1}
              fill={node.season > 2 && !node.isSpecial ? '#F9F5F7' : '#12020A'}
              style="font-size: {screenSize.width >= 793 ? 15 : 12}px;"
            >
              {node.episode}
            </text>
          </g>
        </g>
      {/each}
    </svg>
  </div>

  <!-- Scrolling Texts -->
  <div class="z-10 relative pointer-events-none">
    <CalendarTexts />
  </div>

  <!-- Tooltip -->
  {#if isTooltipVisible}
    <div class="fixed z-20 top-0 left-0 right-0 bottom-0 pointer-events-none">
      <EpisodeTooltip episode={hoveredEpisode} position={mousePosition} />
    </div>
  {/if}
</div>

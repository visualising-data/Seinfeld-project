<script>
  import { onMount } from 'svelte';
	import { gsap } from 'gsap/dist/gsap';
  import { scaleLinear, scaleBand } from 'd3-scale';
  import { max, sum } from 'd3-array';
  import { episodesInfo } from '$lib/data/episodesInfo';
  import { characters } from '$lib/data/characters';
  import { getCharacterImagePath } from '../../utils/getCharacterImagePath';
  import { getLocationIconPath } from '../../utils/getLocationIconPath';
  import { seasons, totalNumEpisodes } from '$lib/data/seasons';
  import { formatTimeLabel } from '../../utils/formatTime';
  import Toggle from '../supporting_characters/Toggle.svelte';
  import HelpIcon from '../../icons/HelpIcon.svelte';
  import ArrowDown from '../../icons/ArrowDown.svelte';
  import SeasonsStripSingle from '../../UI/SeasonsStripSingle.svelte';
  import EpisodeTooltip from '../../UI/EpisodeTooltip.svelte';
  import MainCharsTexts from './texts/MainCharsTexts.svelte';

  let { episodesData, currentSection } = $props();

  let innerWidth = $state(1600);
  let innerHeight = $state(800);

  let currentChars = characters.slice(0, 4);
  let activeCharacter = $state("JERRY");

  const FILTER = {
    SCREEN_TIME: 'screenTime',
    LAUGHS: 'causesLaughs'
  }
  let activeFilter = $state(FILTER.SCREEN_TIME);

  const handleCharacterClick = (char) => {
    activeCharacter = char.id;
  }

  let visualizationsWidth = $state(800);
  const episodesOverviewWidth = 150;
  const marginEnd = 22;
  let episodeDetailsWidth = $derived(visualizationsWidth - episodesOverviewWidth);
  let visualizationsContainerHeight = $state(800);
  let visualizationsHeight = $derived(innerHeight - 260);

  const margin = { top: 30, right: 100, bottom: 34, left: 14 + 25 };
  let episodeDetailsInnerWidth = $derived(episodeDetailsWidth - margin.left - margin.right);
  let visualizationsInnerHeight = $derived(visualizationsHeight - margin.top - margin.bottom);

  let episodesVerticalScale = $derived(
    scaleBand()
      .domain(episodesInfo.map(d => `${d.season}-${d.episode}`))
      .range([0, visualizationsInnerHeight])
  );
  let episodeMaxDuration = $derived(max(episodesData, d => d.duration) ?? 0);
  let episodeTimeScale = $derived(
    scaleLinear()
        .domain([0, episodeMaxDuration])
        .range([0, episodeDetailsInnerWidth])
  );
  let seasonScale = $derived(
		scaleLinear()
			.domain([0, totalNumEpisodes])
			.range([0, visualizationsInnerHeight])
	);
  let episodeOverviewScale = $derived(
		scaleLinear()
			.domain([0, 1])
			.range([0, episodesOverviewWidth - marginEnd])
	);

  const timeLabels = [0, 5, 10, 15, 20, 25, 30];
  const overviewLabels = [0, 100];

  let charData = $derived.by(() => {
    const mainCharsData = {}

    currentChars.forEach(char => {
      const breakdown = [];

      episodesData.forEach(episode => {
        const onScreen = [];
        const onScreenAtWork = [];
        const aggregatedScreenTime = [];
        const aggregatedScreenTimeAtWork = [];
        const causesLaughs = [];
        const aggregatedLaughs = [];
        const withoutJerry = [];
        const aggregatedWithoutJerry = [];
        const firstSceneWithoutJerry = [];
        const aggregatedFirstSceneWithoutJerry = [];

        episode.data.forEach(d => {
          if (d.eventCategory === 'CHARACTERS' && d.eventAttribute.includes(char.id)) {
            onScreen.push(d)
          }

          if (char.id === 'JERRY' && d.eventCategory === 'LOCATION' && d.eventAttribute === 'Workplace') {
            onScreenAtWork.push(d)
          }

          if (char.id === 'JERRY' && d.eventCategory === 'CHARACTERS' && d.eventAttribute === 'GEORGE' &&
              episode.data.find(e => e.eventAttribute === "ELAINE" && e.eventTimeSeconds === d.eventTimeSeconds) &&
              episode.data.find(e => e.eventAttribute === "KRAMER" && e.eventTimeSeconds === d.eventTimeSeconds) &&
              !episode.data.find(e => e.eventAttribute === "JERRY" && e.eventTimeSeconds === d.eventTimeSeconds)
          ) {
            withoutJerry.push(d)
          }

          if (char.id === 'JERRY' && +d.sceneNumber === 1 && 
              !episode.data.find(e => +e.sceneNumber === 1 && e.eventAttribute === "JERRY")
          ) {
          firstSceneWithoutJerry.push(d)
          }

          if (d.eventCategory === 'CAUSES THE LAUGH' && d.eventAttribute.includes(char.id)) {
            causesLaughs.push(d)
          }

        })

        let start
        let currentTime
        onScreen.forEach((d, i) => {
          if (!start && !currentTime) {
            start = +d.eventTimeSeconds
            currentTime = +d.eventTimeSeconds
          } else if (+d.eventTimeSeconds > currentTime + 5 || i === onScreen.length - 1) {
            aggregatedScreenTime.push({
              start: start - 5,
              duration: currentTime - start
            })
            start = +d.eventTimeSeconds
            currentTime = +d.eventTimeSeconds
          } else if (+d.eventTimeSeconds === currentTime + 5) {
            currentTime = +d.eventTimeSeconds
          }
        })

        start = undefined
        currentTime = undefined
        onScreenAtWork.forEach((d, i) => {
          if (!start && !currentTime) {
            start = +d.eventTimeSeconds
            currentTime = +d.eventTimeSeconds
          } else if (+d.eventTimeSeconds > currentTime + 5 || i === onScreenAtWork.length - 1) {
            aggregatedScreenTimeAtWork.push({
              start: start - 5,
              duration: currentTime - start
            })
            start = +d.eventTimeSeconds
            currentTime = +d.eventTimeSeconds
          } else if (+d.eventTimeSeconds === currentTime + 5) {
            currentTime = +d.eventTimeSeconds
          }
        })

        start = undefined
        currentTime = undefined
        withoutJerry.forEach((d, i) => {
          if (!start && !currentTime) {
            start = +d.eventTimeSeconds
            currentTime = +d.eventTimeSeconds
          } else if (+d.eventTimeSeconds > currentTime + 5 || i === withoutJerry.length - 1) {
            aggregatedWithoutJerry.push({
              start: start - 5,
              duration: currentTime - start
            })
            start = +d.eventTimeSeconds
            currentTime = +d.eventTimeSeconds
          } else if (+d.eventTimeSeconds === currentTime + 5) {
            currentTime = +d.eventTimeSeconds
          }
        })

        start = undefined
        currentTime = undefined
        firstSceneWithoutJerry.forEach((d, i) => {
          if (!start && !currentTime) {
            start = +d.eventTimeSeconds
            currentTime = +d.eventTimeSeconds
          } else if (+d.eventTimeSeconds > currentTime + 5 || i === firstSceneWithoutJerry.length - 1) {
            aggregatedFirstSceneWithoutJerry.push({
              start: start - 5,
              duration: currentTime - start
            })
            start = +d.eventTimeSeconds
            currentTime = +d.eventTimeSeconds
          } else if (+d.eventTimeSeconds === currentTime + 5) {
            currentTime = +d.eventTimeSeconds
          }
        })

        start = undefined
        currentTime = undefined
        causesLaughs.forEach((d, i) => {
          if (!start && !currentTime) {
            start = +d.eventTimeSeconds
            currentTime = +d.eventTimeSeconds
          } else if (+d.eventTimeSeconds > currentTime + 5 || i === onScreenAtWork.length - 1) {
            aggregatedLaughs.push({
              start: start - 5,
              duration: currentTime - start
            })
            start = +d.eventTimeSeconds
            currentTime = +d.eventTimeSeconds
          } else if (+d.eventTimeSeconds === currentTime + 5) {
            currentTime = +d.eventTimeSeconds
          }
        })

        breakdown.push({
          season: episode.season,
          episode: episode.episode,
          duration: episode.duration,
          onScreen: onScreen,
          aggregatedOnScreen: aggregatedScreenTime,
          onScreenAtWork: aggregatedScreenTimeAtWork,
          causesLaughs: causesLaughs,
          episodeLaughs: episode.laughs,
          aggregatedLaughs: aggregatedLaughs,
          withoutJerry: aggregatedWithoutJerry,
          firstSceneWithoutJerry: aggregatedFirstSceneWithoutJerry
        })
      })

      mainCharsData[char.id] = breakdown
    })

    return mainCharsData
  });

  let isMouseOver = $state(false);
  let highlightedEpisode = $state('');
  let highlightedEpisodeInfo = $state();
  let highlightedEpisodeOverviewPercentage = $state(0);
  let highlightedEpisodeTimePosition = $state(0);
  let highlightedEpisodeTimeLabel = $state('');
  let episodeTooltipPosition = $state();
  const handleOverviewMouseEnter = () => {
    isMouseOver = true;
  }
  const handleMouseMove = (/** @type {MouseEvent & { currentTarget: EventTarget & SVGRectElement; }} */ e) => {
    if (!isMouseOver) isMouseOver = true;
    
    const x = e.offsetX - margin.left;
    const y = e.offsetY - margin.top;

    const bandHeight = episodesVerticalScale.bandwidth();
    const episodeIndex = Math.ceil(y / bandHeight);
    const episode = episodesInfo[episodeIndex - 1];
    if (episode) {
      highlightedEpisode = `${episode.season}-${episode.episode}`;
      highlightedEpisodeInfo = episode;
    }
    const data = charData[activeCharacter].find(e => e.season === episode.season && e.episode === episode.episode);
    highlightedEpisodeOverviewPercentage = Math.round((data[activeFilter === FILTER.SCREEN_TIME ? 'onScreen' : 'causesLaughs'].reduce((acc, value) => acc + value.duration, 0)) / data?.duration * 100) ?? undefined;

    const newXPosition = x <= episodeDetailsInnerWidth ? Math.round(x) : 0;
    if (highlightedEpisodeTimePosition !== newXPosition) {
      highlightedEpisodeTimePosition = newXPosition;
    }
    const timeInSeconds = x <= episodeDetailsInnerWidth ? Math.round(episodeTimeScale.invert(x)) : 0;
    const newTimeLabel = formatTimeLabel(timeInSeconds)
    if (highlightedEpisodeTimeLabel !== newTimeLabel) {
      highlightedEpisodeTimeLabel = formatTimeLabel(timeInSeconds)
    }

    episodeTooltipPosition = [-58, y];
  }
  const handleOverviewMouseLeave = () => {
    isMouseOver = false;
  }

  onMount(() => {
    const tl1 = gsap.timeline({
      scrollTrigger: {
        trigger: '#lead-chars-episodes-container',
        start: 'top top',
        end: 'bottom bottom',
        pin: '#lead-chars-episodes'
      }
    });

    const highlightAnimation = {
        webkitTextFillColor: 'transparent',
        backgroundPosition: '200% center',
        duration: 2,
        delay: 1,
        ease: 'power3.out'
    }

    // Jerry
    const tlJerryText2 = gsap.timeline({
      scrollTrigger: {
        trigger: '#jerry-text-2',
        start: 'top bottom',
        // end: 'top top',
        toggleActions: 'play none play none'
      }
    });
    tlJerryText2
      .to('.JERRY-onscreen', { opacity: 0.3 })
      .to('.jerry-at-work', { opacity: 1 }, 0)
      .to('#jerry-text-2 .highlight', highlightAnimation, "<-0.7")

    const tlJerryText3 = gsap.timeline({
      scrollTrigger: {
        trigger: '#jerry-text-3',
        start: 'top bottom',
        // end: 'top top',
        toggleActions: 'play none play none'
      }
    });
    tlJerryText3
      .to('.jerry-at-work', { opacity: 0 })
      .to('.without-jerry', { opacity: 1 }, 0)
      .to('#jerry-text-3 .highlight', highlightAnimation, "<-0.7")

    const tlJerryText4 = gsap.timeline({
      scrollTrigger: {
        trigger: '#jerry-text-4',
        start: 'top bottom',
        // end: 'top top',
        toggleActions: 'play none play none'
      }
    });
    tlJerryText4
      .to('.without-jerry', { opacity: 0 })
      .to('.JERRY-onscreen', { opacity: 0.3 }, 0)
      .to('.JERRY-onscreen.season-1', { opacity: 1 }, 0)
      .to('#jerry-text-4 .highlight', highlightAnimation, "<-0.7")

    const tlJerryText5 = gsap.timeline({
      scrollTrigger: {
        trigger: '#jerry-text-5',
        start: 'top bottom',
        // end: 'top top',
        toggleActions: 'play none play none'
      }
    });
    tlJerryText5
      .to('.JERRY-onscreen', { opacity: 0.3 })
      .to('.first-scene-without-jerry', { opacity: 1 }, 0)
      .to('#jerry-text-5 .highlight', highlightAnimation, "<-0.7")

    const tlJerryText6 = gsap.timeline({
      scrollTrigger: {
        trigger: '#jerry-text-6',
        start: 'top bottom',
        // end: 'top top',
        toggleActions: 'play none play none'
      }
    });
    tlJerryText6
      .to('.first-scene-without-jerry', { opacity: 0 })
      .to('.JERRY-laugh', { opacity: 0 }, 0)
      .to('.JERRY-onscreen, .JERRY-onscreen.season-1', { opacity: 1 }, 0)
      .to('#jerry-text-6 .highlight', highlightAnimation, "<-0.7")

    const tlJerryText7 = gsap.timeline({
      scrollTrigger: {
        trigger: '#jerry-text-7',
        start: 'top bottom',
        // end: 'top top',
        toggleActions: 'play none play none',
        onEnter: () => activeFilter = FILTER.LAUGHS,
        onLeaveBack: () => activeFilter = FILTER.SCREEN_TIME
      }
    });
    tlJerryText7
      .to('.JERRY-onscreen', { opacity: 0.3 })
      .to('.JERRY-laugh', { opacity: 1 }, 0)
      .to('#jerry-text-7 .highlight', highlightAnimation, "<-0.7")

    const tlJerryText8 = gsap.timeline({
      scrollTrigger: {
        trigger: '#jerry-text-8',
        start: 'top bottom'
      }
    });
    tlJerryText8
      .to('#jerry-text-8 .highlight', highlightAnimation, "<-0.7")

    // George
    const tlGeorgeText1 = gsap.timeline({
      scrollTrigger: {
        trigger: '#george-text-1',
        start: 'top bottom',
        // end: 'top top',
        toggleActions: 'play none play none',
        onEnter: () => {
          activeCharacter = 'GEORGE'
          activeFilter = FILTER.SCREEN_TIME
        },
        onLeaveBack: () => {
          activeCharacter = 'JERRY'
          activeFilter = FILTER.LAUGHS
        },
      }
    });

    const tlGeorgeText2 = gsap.timeline({
      scrollTrigger: {
        trigger: '#george-text-2',
        start: 'top bottom',
        // end: 'top top',
        toggleActions: 'play none play none'
      }
    });
    tlGeorgeText2
      .to('#george-text-2 .highlight', highlightAnimation, "<-0.7")
    
    const tlGeorgeText3 = gsap.timeline({
      scrollTrigger: {
        trigger: '#george-text-3',
        start: 'top bottom',
        // end: 'top top',
        toggleActions: 'play none play none',
        onEnter: () => {
          activeFilter = FILTER.LAUGHS
        },
        onLeaveBack: () => {
          activeFilter = FILTER.SCREEN_TIME
        },
      }
    });

    // Elaine
    const tlElaineText1 = gsap.timeline({
      scrollTrigger: {
        trigger: '#elaine-text-1',
        start: 'top bottom',
        // end: 'top top',
        toggleActions: 'play none play none',
        onEnter: () => {
          activeCharacter = 'ELAINE'
          activeFilter = FILTER.SCREEN_TIME
        },
        onLeaveBack: () => {
          activeCharacter = 'GEORGE'
          activeFilter = FILTER.LAUGHS
        },
      }
    });

    const tlElaineText2 = gsap.timeline({
      scrollTrigger: {
        trigger: '#elaine-text-2',
        start: 'top bottom',
        // end: 'top top',
        toggleActions: 'play none play none'
      }
    });
    tlElaineText2
      .to('.episode-duration.season-1-episode-1, .episode-duration.season-4-episode-1, .episode-duration.season-4-episode-2, .episode-duration.season-4-episode-3, .episode-duration.season-4-episode-4', { fill: '#E71D80' })
      .to('#elaine-text-2 .highlight', highlightAnimation, "<-0.7")

    const tlElaineText3 = gsap.timeline({
      scrollTrigger: {
        trigger: '#elaine-text-3',
        start: 'top bottom',
        // end: 'top top',
        toggleActions: 'play none play none'
      }
    });
    tlElaineText3
      .to('.episode-duration.season-1-episode-1, .episode-duration.season-4-episode-1, .episode-duration.season-4-episode-2, .episode-duration.season-4-episode-3, .episode-duration.season-4-episode-4', { fill: '#EEECED' })
      .to('#elaine-text-3 .highlight', highlightAnimation, "<-0.7")

    const tlElaineText4 = gsap.timeline({
      scrollTrigger: {
        trigger: '#elaine-text-4',
        start: 'top bottom',
        // end: 'top top',
        toggleActions: 'play none play none',
        onEnter: () => {
          activeFilter = FILTER.LAUGHS
        },
        onLeaveBack: () => {
          activeFilter = FILTER.SCREEN_TIME
        },
      }
    });
    tlElaineText4
      .to('#elaine-text-3 .highlight', highlightAnimation, "<-0.7")

    
    // Kramer
    const tlKramerText1 = gsap.timeline({
      scrollTrigger: {
        trigger: '#kramer-text-1',
        start: 'top bottom',
        // end: 'top top',
        toggleActions: 'play none play none',
        onEnter: () => {
          activeCharacter = 'KRAMER'
          activeFilter = FILTER.SCREEN_TIME
        },
        onLeaveBack: () => {
          activeCharacter = 'ELAINE'
          activeFilter = FILTER.LAUGHS
        },
      }
    });

    const tlKramerText2 = gsap.timeline({
      scrollTrigger: {
        trigger: '#kramer-text-2',
        start: 'top bottom',
        // end: 'top top',
        toggleActions: 'play none play none'
      }
    });
    tlKramerText2
      .to('#kramer-text-2 .highlight', highlightAnimation, "<-0.7")

    const tlKramerText3 = gsap.timeline({
      scrollTrigger: {
        trigger: '#kramer-text-3',
        start: 'top bottom',
        // end: 'top top',
        toggleActions: 'play none play none',
        onEnter: () => {
          activeFilter = FILTER.LAUGHS
        },
        onLeaveBack: () => {
          activeFilter = FILTER.SCREEN_TIME
        },
      }
    });
    tlKramerText3
      .to('#kramer-text-3 .highlight', highlightAnimation, "<-0.7")

    // Hint
    const tlHint = gsap.timeline({
      scrollTrigger: {
        trigger: '#kramer-text-3',
        start: 'bottom top'
      }
    });
    gsap.set('#lead-chars-episodes .hint', { opacity: 0, translateY: 30 })
    tlHint
      .to('#lead-chars-episodes .hint', { opacity: 1, translateY: 0, ease: 'bounce.out', duration: 1 })
  })
</script>

<svelte:window bind:innerWidth bind:innerHeight />

<div id="lead-chars-episodes-container" class="relative mt-20 mb-52" style="padding-bottom: 200vh;">
  <div id="lead-chars-episodes" class="absolute h-screen w-screen top-0 left-0">
    <div class="container">
      <h3 class="my-8">Screen time vs laughter rate</h3>
      <div class="grid grid-cols-12 md:gap-8">
        <div class="col-span-12 md:col-span-2 flex flex-col items-center relative">
          <div class="hint small flex items-center gap-2 mb-6" style="max-width: 320px;">
            <span class="shrink"><HelpIcon color="#E71D80" /></span>
            <span class="relative top-1">Select a character to explore their screen time and laughter rate.</span>
          </div>
          <ul class="grid gap-6 flex-wrap {currentSection === 'main_chars' ? 'grid-cols-1' : 'grid-cols-2'}">
            {#each currentChars as char}
              <li class="flex justify-center">
                <button 
                  class="character-button flex flex-col items-center max-w-28 {activeCharacter === char.id ? 'active' : ''}"
                  onclick={() => handleCharacterClick(char)}>
                  <div class="character rounded-full bg-contain bg-center opacity-50" 
                      style="background-image: url('{currentSection === "locations" ? getLocationIconPath(char.id) : getCharacterImagePath(char.id)}'); width: 75px; height: 75px;"></div>
                  <div class="text-center pt-1" style="font-size: 1.25rem; line-height: 1.2;">{char.label}</div>
                </button>
              </li>
            {/each}
          </ul>

          {#if isMouseOver && innerWidth >= 793}
            <EpisodeTooltip episode={highlightedEpisodeInfo} position={episodeTooltipPosition} />
          {/if}
        </div>

        <div class="col-span-12 md:col-span-9" bind:clientHeight={visualizationsContainerHeight}>
          <Toggle bind:activeFilter />
          <div class="flex" bind:clientWidth={visualizationsWidth}>
            <!-- Episode details -->
            <svg width={visualizationsWidth} height={visualizationsHeight}>
              <!-- Episode details -->
              <g transform="translate(0, {margin.top})">
                <text text-anchor="end" style="transform: translate(10px, 0px) rotate(-90deg); transform-origin: 0 0;" class="small accent">Episodes</text>
                <g transform="translate(3, 64)">
                  <ArrowDown />
                </g>
                <g transform="translate(14, 0)">
                  <SeasonsStripSingle height={visualizationsInnerHeight} />
                </g>
              </g>

              <!-- Background to detect mouse events -->
              <g transform="translate({margin.left}, {margin.top})">
                <rect
                  x={0}
                  y={0}
                  width={visualizationsWidth - margin.left}
                  height={visualizationsInnerHeight}
                  fill="#F9F5F7"
                  role="document"
                  onmouseenter={handleOverviewMouseEnter}
                  onmousemove={(e) => handleMouseMove(e)}
                  onmouseleave={handleOverviewMouseLeave}
                />
              </g>

              <!-- Season separators -->
              <g transform="translate({margin.left}, {margin.top})" class="pointer-events-none">
                {#each seasons as season, i}
                  {#if i < seasons.length - 1}
                    <line
                      x1={0}
                      y1={seasonScale(sum(seasons.slice(0, i), (d) => d.numEpisodes)) + seasonScale(season.numEpisodes)}
                      x2={visualizationsWidth - margin.left}
                      y2={seasonScale(sum(seasons.slice(0, i), (d) => d.numEpisodes)) + seasonScale(season.numEpisodes)}
                      stroke="#928D90"
                    />
                  {/if}
                {/each}
              </g>

              <g transform="translate({margin.left}, {margin.top})">
                <!-- Time labels -->
                {#each timeLabels as timeLabel}
                  <g transform="translate({episodeTimeScale(timeLabel * 60)}, 0)" class="pointer-events-none">
                    <line
                      x1={0}
                      y1={-12}
                      x2={0}
                      y2={visualizationsInnerHeight + 12}
                      stroke="#928D90"
                    />
                    <g class="number" fill="#928D90" text-anchor="middle" fill-opacity={isMouseOver ? 0.3 : 1}>
                      <text
                        x={0}
                        y={-18}
                      >
                        {`${timeLabel === 0 || timeLabel === 5 ? '0' : ''}${timeLabel}:00`}
                      </text>
                      <text
                        x={0}
                        y={visualizationsInnerHeight + 16}
                        dominant-baseline="hanging"
                      >
                        {`${timeLabel === 0 || timeLabel === 5 ? '0' : ''}${timeLabel}:00`}
                      </text>
                    </g>
                  </g>
                {/each}

                {#each charData[activeCharacter] as d}
                  <g transform="translate(0, {episodesVerticalScale(`${d.season}-${d.episode}`)})">
                    <!-- Episode durations -->
                    <rect
                      class="pointer-events-none episode-duration season-{d.season}-episode-{d.episode}"
                      x={0}
                      y={0}
                      width={episodeTimeScale(d.duration)}
                      height={episodesVerticalScale.bandwidth()}
                      fill="#EEECED"
                      fill-opacity={(isMouseOver && highlightedEpisode === `${d.season}-${d.episode}`) || !isMouseOver ? 1 : 0.3}
                    />

                    <!-- Screen time -->
                    {#each d.aggregatedOnScreen as screenMoment}
                      <rect
                        class="pointer-events-none {activeCharacter}-onscreen season-{d.season}"
                        x={episodeTimeScale(screenMoment.start)}
                        y={0}
                        width={episodeTimeScale(screenMoment.duration)}
                        height={episodesVerticalScale.bandwidth()}
                        fill={characters.find(char => char.id === activeCharacter)?.color}
                        style="opacity: {activeFilter === FILTER.LAUGHS ? 0.3 : (isMouseOver && highlightedEpisode === `${d.season}-${d.episode}`) || !isMouseOver ? 1 : 0.3};"
                      />
                    {/each}

                    {#if activeCharacter === 'JERRY'}
                      <!-- Screen time at work -->
                      {#each d.onScreenAtWork as screenMoment}
                        <rect
                          class="pointer-events-none jerry-at-work"
                          x={episodeTimeScale(screenMoment.start)}
                          y={0}
                          width={episodeTimeScale(screenMoment.duration)}
                          height={episodesVerticalScale.bandwidth()}
                          fill={characters.find(char => char.id === activeCharacter)?.color}
                          style="opacity: 0;"
                        />
                      {/each}

                      <!-- Lead characters on screen without Jerry -->
                      {#each d.withoutJerry as screenMoment}
                        <rect
                          class="pointer-events-none without-jerry"
                          x={episodeTimeScale(screenMoment.start)}
                          y={0}
                          width={episodeTimeScale(screenMoment.duration)}
                          height={episodesVerticalScale.bandwidth()}
                          fill="#E71D80"
                          style="opacity: 0;"
                        />
                      {/each}

                      <!-- First scene without Jerry -->
                      {#each d.firstSceneWithoutJerry as screenMoment}
                        <rect
                          class="pointer-events-none first-scene-without-jerry"
                          x={episodeTimeScale(screenMoment.start)}
                          y={0}
                          width={episodeTimeScale(screenMoment.duration)}
                          height={episodesVerticalScale.bandwidth()}
                          fill="#E71D80"
                          style="opacity: 0;"
                        />
                      {/each}
                    {/if}

                    <!-- Laughs -->
                    {#if activeFilter === FILTER.LAUGHS}
                      {#each d.aggregatedLaughs as screenMoment}
                        <rect
                          class="pointer-events-none {activeCharacter}-laugh"
                          x={episodeTimeScale(screenMoment.start)}
                          y={0}
                          width={episodeTimeScale(screenMoment.duration)}
                          height={episodesVerticalScale.bandwidth()}
                          fill={characters.find(char => char.id === activeCharacter)?.color}
                          style="opacity: {(isMouseOver && highlightedEpisode === `${d.season}-${d.episode}`) || !isMouseOver ? 1 : 0.3};"
                        />
                      {/each}
                    {/if}
                  </g>
                {/each}

                <!-- Time tooltip -->
                {#if isMouseOver}
                  <g transform="translate({highlightedEpisodeTimePosition}, 0)" class="pointer-events-none">
                    <line
                      x1={0}
                      y1={-12}
                      x2={0}
                      y2={visualizationsInnerHeight + 12}
                      stroke="#12020A"
                      stroke-width={2}
                    />
                    <g class="number" fill="#12020A" text-anchor="middle">
                      <text
                        x={0}
                        y={-18}
                      >
                        {highlightedEpisodeTimeLabel}
                      </text>
                      <text
                        x={0}
                        y={visualizationsInnerHeight + 16}
                        dominant-baseline="hanging"
                      >
                        {highlightedEpisodeTimeLabel}
                      </text>
                    </g>
                  </g>
                {/if}
              </g>

              <!-- Episode overviews -->
              <g transform="translate({visualizationsWidth - episodesOverviewWidth}, {margin.top})">
                <rect
                  class="pointer-events-none"
                  x={0}
                  y={0}
                  width={episodesOverviewWidth - marginEnd}
                  height={visualizationsInnerHeight}
                  fill="#EEECED"
                  fill-opacity={isMouseOver ? 0.3 : 1}
                />
                <!-- Vertical Axes -->
                {#each overviewLabels as overviewLabel}
                  <g transform="translate({episodeOverviewScale(overviewLabel / 100)}, 0)" class="pointer-events-none">
                    <line
                      x1={0}
                      y1={-12}
                      x2={0}
                      y2={visualizationsInnerHeight + 12}
                      stroke="#928D90"
                    />
                    <g class="number" fill="#928D90" text-anchor="middle" fill-opacity={isMouseOver ? 0.3 : 1}>
                      <text
                        x={0}
                        y={-18}
                      >
                        {`${overviewLabel}%`}
                      </text>
                      <text
                        x={0}
                        y={visualizationsInnerHeight + 16}
                        dominant-baseline="hanging"
                      >
                        {`${overviewLabel}%`}
                      </text>
                    </g>
                  </g>
                {/each}

                {#each charData[activeCharacter] as d}
                  <g transform="translate(0, {episodesVerticalScale(`${d.season}-${d.episode}`)})">
                    {#if activeFilter === FILTER.SCREEN_TIME}
                      <!-- Screen time -->
                      {#if episodeOverviewScale((d.aggregatedOnScreen.length * 5) / d.duration)}
                        <rect
                          class="pointer-events-none"
                          x={0}
                          y={0}
                          width={episodeOverviewScale((d.aggregatedOnScreen.reduce((acc, value) => acc + value.duration, 0)) / d.duration)}
                          height={episodesVerticalScale.bandwidth()}
                          fill={characters.find(char => char.id === activeCharacter)?.color}
                          fill-opacity={activeFilter === FILTER.LAUGHS ? 0.3 : (isMouseOver && highlightedEpisode === `${d.season}-${d.episode}`) || !isMouseOver ? 1 : 0.3}
                        />
                      {/if}
                    {:else}
                      <!-- Laugh rate -->
                      {#if episodeOverviewScale(d.causesLaughs.length / d.episodeLaughs.length)}
                      <rect
                        class="pointer-events-none"
                        x={0}
                        y={0}
                        width={episodeOverviewScale(d.causesLaughs.length / d.episodeLaughs.length)}
                        height={episodesVerticalScale.bandwidth()}
                        fill={characters.find(char => char.id === activeCharacter)?.color}
                        fill-opacity={(isMouseOver && highlightedEpisode === `${d.season}-${d.episode}`) || !isMouseOver ? 1 : 0.3}
                      />
                      {/if}
                    {/if}
                  </g>
                {/each}

                <!-- Overview tooltip -->
                {#if isMouseOver}
                  <g transform="translate({episodeOverviewScale(highlightedEpisodeOverviewPercentage / 100)}, 0)">
                    <line
                      x1={0}
                      y1={-12}
                      x2={0}
                      y2={visualizationsInnerHeight + 12}
                      stroke="#12020A"
                      stroke-width={2}
                    />
                    <g class="number" fill="#12020A" text-anchor="middle">
                      <text
                        x={0}
                        y={-18}
                      >
                        {`${highlightedEpisodeOverviewPercentage}%`}
                      </text>
                      <text
                        x={0}
                        y={visualizationsInnerHeight + 16}
                        dominant-baseline="hanging"
                      >
                        {`${highlightedEpisodeOverviewPercentage}%`}
                      </text>
                    </g>
                  </g>
                {/if}
              </g>
            </svg>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Texts -->
  <div class="z-10 relative" style="top: 100vh;">
   <MainCharsTexts {charData} />
  </div>
</div>

<style>
  .character {
    transition: opacity 0.3s ease-out;
  }
  .character-button:hover .character,
  .character-button.active .character {
    opacity: 1;
  }
  .character-button.active .character {
    cursor: default;
  }
  rect {
    transition: fill-opacity 0.2s ease-out;
  }
</style>
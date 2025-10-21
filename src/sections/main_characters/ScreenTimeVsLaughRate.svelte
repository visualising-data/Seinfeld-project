<script>
  import { onMount } from 'svelte';
	import { gsap } from 'gsap/dist/gsap';
  import { scaleLinear, scaleBand } from 'd3-scale';
  import { max, sum } from 'd3-array';
  import { area } from 'd3-shape';
	import * as Tone from 'tone';

  import { episodesInfo, clipShows } from '$lib/data/episodesInfo';
  import { characters } from '$lib/data/characters';
  import { getCharacterImagePath } from '../../utils/getCharacterImagePath';
  import { getLocationIconPath } from '../../utils/getLocationIconPath';
  import { seasons, totalNumEpisodes } from '$lib/data/seasons';
  import { formatTimeLabel } from '../../utils/formatTime';
  import { sonificationFiles, getCharSoundFileName } from '$lib/data/sonificationFilesMapping';
  import { soundIsAuth } from '../../stores/soundAuthStore';
  import Toggle from '../supporting_characters/Toggle.svelte';
  import HelpIcon from '../../icons/HelpIcon.svelte';
  import ArrowDown from '../../icons/ArrowDown.svelte';
  import SeasonsStripSingle from '../../UI/SeasonsStripSingle.svelte';
  import EpisodeTooltip from '../../UI/EpisodeTooltip.svelte';
  import MainCharsTexts from './texts/MainCharsTexts.svelte';
  import ScreenTimeVsLaughRateLegend from './ScreenTimeVsLaughRateLegend.svelte';

  let { episodesData, currentSection } = $props();

  let innerWidth = $state(1600);
  let innerHeight = $state(800);
  let headerHeight = $state(200);

  let currentChars = characters.slice(0, 4);
  let activeCharacter = $state("JERRY");

  export const FILTER = {
    SCREEN_TIME: 'screenTime',
    LAUGHS: 'causesLaughs'
  }
  let activeFilter = $state(FILTER.SCREEN_TIME);

  /**
	 * @type {Tone.Players}
	 */
	let soundtrack;
	const preload = () => {
		soundtrack = new Tone.Players(sonificationFiles).toDestination(); //connects to the system sound output
    soundtrack.volume.value = -3
  };

  let soundtrackCanPlay = false
  /**
	 * @type {number | undefined}
	 */
  let playRythmTimeout
  /**
	 * @type {number | undefined}
	 */
  let playCharTimeout
  /**
	 * @type {string}
	 */
  let playingFile

  const updatePlayingFile = (char) => {
    playingFile = getCharSoundFileName(char, '1')
  }
  updatePlayingFile(activeCharacter)

  const playRythm = () => {
    if ($soundIsAuth) {
      soundtrack.player('rythm').start();

      playRythmTimeout = setTimeout(() => {
				playRythm()
			}, 8727.272727);
    }
  }
  const playChar = () => {
    if ($soundIsAuth) {
      soundtrack.player(playingFile).start();

      playCharTimeout = setTimeout(() => {
				playChar()
			}, 8727.272727);
    }
  }

  const playAudio = () => {
    playRythm()
    playChar()
  }

  const stopAudio = () => {
		soundtrack.stopAll();
    clearTimeout(playRythmTimeout);
    clearTimeout(playCharTimeout);
  }

  $effect(() => {
    if ($soundIsAuth && soundtrackCanPlay && soundtrack?.state !== 'started') {
      playAudio()
    } else if (!$soundIsAuth && soundtrackCanPlay && soundtrack?.state === 'started') {
      stopAudio()
    }
  })

  const handleCharacterClick = (char) => {
    if (char.id !== activeCharacter) {
      if ($soundIsAuth && soundtrackCanPlay && soundtrack?.state === 'started') {
        soundtrack.player(playingFile).stop();
        clearTimeout(playCharTimeout);
        updatePlayingFile(char)
        playChar();
      }

      activeCharacter = char;
    }
  }

  const resetFilters = (char) => {
    activeCharacter = char
    activeFilter = FILTER.SCREEN_TIME
  }

  let visualizationsWidth = $state(800);
  const episodesOverviewWidth = 150;
  const marginEnd = 25;
  let episodeDetailsWidth = $derived(visualizationsWidth - episodesOverviewWidth);
  let visualizationsContainerHeight = $state(800);
  let visualizationsHeight = $derived(innerHeight - 110);

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
  let isTextOver = false;
  let highlightedEpisode = $state('');
  let highlightedEpisodeInfo = $state();
  let highlightedEpisodeOverviewPercentage = $state(0);
  let highlightedEpisodeTimePosition = $state(0);
  let highlightedEpisodeTimeLabel = $state('');
  let episodeTooltipPosition = $state();

  const handleOverviewMouseEnter = () => {
    if (isTextOver) {
      return
    }

    isMouseOver = true;
  }
  const handleMouseMove = (/** @type {MouseEvent & { currentTarget: EventTarget & SVGRectElement; }} */ e) => {
    if (isTextOver) {
      isMouseOver = false;
      return
    }

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
    highlightedEpisodeOverviewPercentage = activeFilter === FILTER.SCREEN_TIME
      ? Math.round(data.aggregatedOnScreen.reduce((acc, value) => acc + value.duration, 0) / data.duration * 100)
      : Math.round(data.causesLaughs.length / data.aggregatedOnScreen.reduce((acc, value) => acc + value.duration, 0) * 100)

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
    // Preload audio files
		preload();

    // Pin visualization
    gsap.timeline({
      scrollTrigger: {
        trigger: '#lead-chars-episodes-container',
        start: `top top-=${headerHeight}`,
        end: 'bottom bottom',
        pin: '#lead-chars-episodes-viz',
        onEnter: () => {
          soundtrackCanPlay = true
          playAudio()
        },
        onEnterBack: () => {
          soundtrackCanPlay = true
          playAudio()
        },
        onLeave: () => {
          soundtrackCanPlay = false
          stopAudio()
        },
        onLeaveBack: () => {
          soundtrackCanPlay = false
          stopAudio()
        },
      }
    });

    // Prevent mouse over effect while text is scrolling
    gsap.timeline({
      scrollTrigger: {
        trigger: '#lead-chars-episodes-texts',
        start: `top center`,
        end: 'bottom bottom',
        onEnter: () => {
          isMouseOver = false;
          isTextOver = true;
          resetFilters('JERRY')
        },
        onEnterBack: () => {
          isMouseOver = false;
          isTextOver = true;
        },
        onLeave: () => { isTextOver = false },
        onLeaveBack: () => { isTextOver = false }
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
        start: 'top center',
        end: 'bottom center',
				// toggleActions: 'play reverse play reverse'
      }
    });
    tlJerryText2
      .to('.JERRY-onscreen', { opacity: 0.3 })
      .to('.jerry-at-work', { opacity: 1 }, 0)
      .to('#jerry-text-2 .highlight', highlightAnimation, "<-0.7")

    const tlJerryText3 = gsap.timeline({
      scrollTrigger: {
        trigger: '#jerry-text-3',
        start: 'top center',
        end: 'bottom center',
        // toggleActions: 'play reverse play reverse'
      }
    });
    tlJerryText3
      .to('.jerry-at-work', { opacity: 0 })
      .to('.without-jerry', { opacity: 1 }, 0)
      .to('#jerry-text-3 .highlight', highlightAnimation, "<-0.7")

    const tlJerryText4 = gsap.timeline({
      scrollTrigger: {
        trigger: '#jerry-text-4',
        start: 'top center',
        end: 'bottom center',
        // toggleActions: 'play reverse play reverse'
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
        start: 'top center',
        end: 'bottom center',
        // toggleActions: 'play reverse play reverse'
      }
    });
    tlJerryText5
      .to('.JERRY-onscreen', { opacity: 0.3 })
      .to('.first-scene-without-jerry', { opacity: 1 }, 0)
      .to('#jerry-text-5 .highlight', highlightAnimation, "<-0.7")

    const tlJerryText6 = gsap.timeline({
      scrollTrigger: {
        trigger: '#jerry-text-6',
        start: 'top center',
        end: 'bottom center',
        // toggleActions: 'play reverse play reverse'
      }
    });
    tlJerryText6
      .to('.first-scene-without-jerry', { opacity: 0 })
      .to('.JERRY-laugh', { opacity: 0 }, 0)
      .to('.JERRY-onscreen, .JERRY-onscreen.season-1', { opacity: 1, stroke: '#F9F5F7'}, 0)
      .to('#jerry-text-6 .highlight', highlightAnimation, "<-0.7")

    const tlJerryText7 = gsap.timeline({
      scrollTrigger: {
        trigger: '#jerry-text-7',
        start: 'top center',
        end: 'bottom center',
        // toggleActions: 'play reverse play reverse',
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
        start: 'top center',
        end: 'bottom center',
        // toggleActions: 'play reverse play reverse',
      }
    });
    tlJerryText8
      .to('#jerry-text-8 .highlight', highlightAnimation, "<-0.7")

    // George
    const tlGeorgeText1 = gsap.timeline({
      scrollTrigger: {
        trigger: '#george-text-1',
        start: 'top center',
        end: 'bottom center',
        // toggleActions: 'play reverse play reverse',
        onEnter: () => {
          handleCharacterClick('GEORGE')
          activeFilter = FILTER.SCREEN_TIME
        },
        onLeaveBack: () => {
          handleCharacterClick('JERRY')
          activeFilter = FILTER.LAUGHS
        },
      }
    });

    const tlGeorgeText2 = gsap.timeline({
      scrollTrigger: {
        trigger: '#george-text-2',
        start: 'top center',
        end: 'bottom center',
        // toggleActions: 'play reverse play reverse'
      }
    });
    tlGeorgeText2
      .to('#george-text-2 .highlight', highlightAnimation, "<-0.7")
    
    const tlGeorgeText3 = gsap.timeline({
      scrollTrigger: {
        trigger: '#george-text-3',
        start: 'top center',
        end: 'bottom center',
        // toggleActions: 'play reverse play reverse',
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
        start: 'top center',
        end: 'bottom center',
        // toggleActions: 'play reverse play reverse',
        onEnter: () => {
          handleCharacterClick('ELAINE')
          activeFilter = FILTER.SCREEN_TIME
        },
        onLeaveBack: () => {
          handleCharacterClick('GEORGE')
          activeFilter = FILTER.LAUGHS
        },
      }
    });

    const tlElaineText2 = gsap.timeline({
      scrollTrigger: {
        trigger: '#elaine-text-2',
        start: 'top center',
        end: 'bottom center',
        // toggleActions: 'play reverse play reverse'
      }
    });
    tlElaineText2
      .to('.episode-duration.season-1-episode-1, .episode-duration.season-4-episode-1, .episode-duration.season-4-episode-2, .episode-duration.season-4-episode-3, .episode-duration.season-4-episode-4', { fill: '#E71D80' })
      .to('#elaine-text-2 .highlight', highlightAnimation, "<-0.7")

    const tlElaineText3 = gsap.timeline({
      scrollTrigger: {
        trigger: '#elaine-text-3',
        start: 'top center',
        end: 'bottom center',
        // toggleActions: 'play reverse play reverse'
      }
    });
    tlElaineText3
      .to('.episode-duration.season-1-episode-1, .episode-duration.season-4-episode-1, .episode-duration.season-4-episode-2, .episode-duration.season-4-episode-3, .episode-duration.season-4-episode-4', { fill: '#F9F5F7' })
      .to('#elaine-text-3 .highlight', highlightAnimation, "<-0.7")

    const tlElaineText4 = gsap.timeline({
      scrollTrigger: {
        trigger: '#elaine-text-4',
        start: 'top center',
        end: 'bottom center',
        // toggleActions: 'play reverse play reverse',
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
        start: 'top center',
        end: 'bottom center',
        // toggleActions: 'play reverse play reverse',
        onEnter: () => {
          handleCharacterClick('KRAMER')
          activeFilter = FILTER.SCREEN_TIME
        },
        onLeaveBack: () => {
          handleCharacterClick('ELAINE')
          activeFilter = FILTER.LAUGHS
        },
      }
    });

    const tlKramerText2 = gsap.timeline({
      scrollTrigger: {
        trigger: '#kramer-text-2',
        start: 'top center',
        end: 'bottom center',
        // toggleActions: 'play reverse play reverse'
      }
    });
    tlKramerText2
      .to('#kramer-text-2 .highlight', highlightAnimation, "<-0.7")

    const tlKramerText3 = gsap.timeline({
      scrollTrigger: {
        trigger: '#kramer-text-3',
        start: 'top center',
        end: 'bottom center',
        // toggleActions: 'play reverse play reverse',
        onEnter: () => {
          activeFilter = FILTER.LAUGHS
        },
        onEnterBack: () => {
          resetFilters('KRAMER')
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
        start: 'top center'
      }
    });
    gsap.set('#lead-chars-episodes .hint', { opacity: 0, translateY: 30 })
    tlHint
      .to('#lead-chars-episodes .hint', { opacity: 1, translateY: 0, ease: 'bounce.out', duration: 1 })
  })

  const pointsForEpisodesDuration = []
  episodesInfo.forEach((e, i) => {
    pointsForEpisodesDuration.push({
      season: e.season,
      episode: e.episode,
      duration: e.duration,
      position: 'start'
    })
    pointsForEpisodesDuration.push({
      season: e.season,
      episode: e.episode,
      duration: e.duration,
      position: 'end'
    })
  })

  const episodesDurationPathGenerator = $derived.by(() => area()
    .x0(() => 0)
    .x1(d => episodeTimeScale(d.duration))
    .y(d => episodesVerticalScale(`${d.season}-${d.episode}`) + (d.position === 'end' ? episodesVerticalScale.bandwidth() : 0)))
</script>

<svelte:window bind:innerWidth bind:innerHeight />

<div id="lead-chars-episodes-container" class="relative mt-20 mb-52" style="padding-bottom: 250vh;">
  <div 
    id="lead-chars-episodes" 
    class="absolute w-screen top-0 left-0" 
    style="height: {innerHeight + headerHeight}px">
    <div class="container">
      <!-- Header -->
      <div class="mb-8" bind:clientHeight={headerHeight}>
        <h3>Screen time vs laughter rate</h3>
        <div style="max-width: 900px;">Intro goes here...</div>
      </div>

      <!-- Visualization -->
      <div id="lead-chars-episodes-viz" class="grid grid-cols-12 md:gap-8">
        <div class="col-span-2 flex flex-col items-center relative">
          <div class="hint small flex items-center gap-2 mb-6" style="max-width: 320px;">
            <span class="shrink"><HelpIcon color="#E71D80" /></span>
            <span class="relative top-1">Select a character to explore their screen time and laughter rate.</span>
          </div>
          <ul class="grid gap-6 flex-wrap {currentSection === 'main_chars' ? 'grid-cols-1' : 'grid-cols-2'}">
            {#each currentChars as char}
              <li class="flex justify-center">
                <button 
                  class="character-button flex flex-col items-center max-w-28 {activeCharacter === char.id ? 'active' : ''}"
                  onclick={() => handleCharacterClick(char.id)}>
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

        <div class="col-span-10 md:mt-1" bind:clientHeight={visualizationsContainerHeight}>
          <div class="flex gap-10">
            <Toggle bind:activeFilter />
            <ScreenTimeVsLaughRateLegend activeCharacter={activeCharacter} activeFilter={activeFilter} />
          </div>

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
                  <SeasonsStripSingle width={visualizationsWidth} height={visualizationsInnerHeight} />
                </g>
              </g>

              <!-- Background to detect mouse events -->
              <g transform="translate({margin.left}, {margin.top})">
                <rect
                  x={0}
                  y={0}
                  width={visualizationsWidth - margin.left}
                  height={visualizationsInnerHeight}
                  fill="transparent"
                  role="document"
                  onmouseenter={handleOverviewMouseEnter}
                  onmousemove={(e) => handleMouseMove(e)}
                  onmouseleave={handleOverviewMouseLeave}
                />
              </g>

              <g class="pointer-events-none">

              <g transform="translate({margin.left}, {margin.top})">
                <g fill-opacity={isMouseOver ? 0.3 : 1}>
                  <text 
                    x={3}
                    y={-4}
                    class="small accent">Duration</text>
                  <g transform="rotate(-90) translate(4, 62)">
                    <ArrowDown />
                  </g>
                </g>
                <!-- Time labels -->
                {#each timeLabels as timeLabel}
                  <g transform="translate({episodeTimeScale(timeLabel * 60)}, 0)" class="pointer-events-none">
                    <line
                      x1={0}
                      y1={-12}
                      x2={0}
                      y2={visualizationsInnerHeight + 12}
                      stroke="#303843"
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

                <path
                  d={episodesDurationPathGenerator(pointsForEpisodesDuration)}
                  fill="#F9F5F7"
                  fill-opacity={isMouseOver ? 0.3 : 0.9}
                />
                {#each clipShows as episode}
                  <g transform="translate(0, {episodesVerticalScale(`${episode.season}-${episode.episode}`)})">
                    <!-- Episode durations for clip shows -->
                    <rect
                      class="pointer-events-none episode-duration season-{episode.season}-episode-{episode.episode}"
                      x={0}
                      y={0}
                      width={episodeTimeScale(episode.duration)}
                      height={episodesVerticalScale.bandwidth()}
                      fill="#928D90"
                      fill-opacity={(isMouseOver && highlightedEpisode === `${episode.season}-${episode.episode}`) || !isMouseOver ? 1 : 0.3}
                    />
                  </g>
                {/each}

                {#each charData[activeCharacter] as d}
                  <g transform="translate(0, {episodesVerticalScale(`${d.season}-${d.episode}`)})">
                    {#if isMouseOver && highlightedEpisode === `${d.season}-${d.episode}`}
                      <rect
                        class="pointer-events-none episode-duration season-{d.season}-episode-{d.episode}"
                        x={0}
                        y={0}
                        width={episodeTimeScale(d.duration)}
                        height={episodesVerticalScale.bandwidth()}
                        fill="#F9F5F7"
                        stroke="transparent"
                      />
                    {/if}

                    <!-- Screen time -->
                    {#each d.aggregatedOnScreen as screenMoment}
                      <rect
                        class="pointer-events-none {activeCharacter}-onscreen season-{d.season}"
                        x={episodeTimeScale(screenMoment.start)}
                        y={0}
                        width={episodeTimeScale(screenMoment.duration)}
                        height={episodesVerticalScale.bandwidth()}
                        fill={characters.find(char => char.id === activeCharacter)?.color}
                        rx={3}
                        ry={3}
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
                          stroke={'#F9F5F7'}
                          stroke-width={1}
                          rx={3}
                          ry={3}
                          style="opacity: 0;"
                        />
                      {/each}

                      <!-- Lead characters on screen without Jerry -->
                      {#each d.withoutJerry as screenMoment}
                        <rect
                          class="pointer-events-none without-jerry"
                          x={episodeTimeScale(screenMoment.start)}
                          y={-2}
                          width={episodeTimeScale(screenMoment.duration)}
                          height={episodesVerticalScale.bandwidth() + 4}
                          fill="#E71D80"
                          stroke={'#F9F5F7'}
                          stroke-width={2}
                          rx={3}
                          ry={3}
                          style="opacity: 0;"
                        />
                      {/each}

                      <!-- First scene without Jerry -->
                      {#each d.firstSceneWithoutJerry as screenMoment}
                        <rect
                          class="pointer-events-none first-scene-without-jerry"
                          x={episodeTimeScale(screenMoment.start)}
                          y={-2}
                          width={episodeTimeScale(screenMoment.duration)}
                          height={episodesVerticalScale.bandwidth() + 4}
                          fill="#E71D80"
                          stroke={'#F9F5F7'}
                          stroke-width={2}
                          rx={3}
                          ry={3}
                          style="opacity: 0;"
                        />
                      {/each}
                    {/if}

                    <!-- Laughs -->
                    {#if activeFilter === FILTER.LAUGHS}
                      {#each d.aggregatedLaughs as screenMoment}
                        <rect
                          class="pointer-events-none {activeCharacter}-laugh"
                          x={episodeTimeScale(screenMoment.start) - (isMouseOver && highlightedEpisode === `${d.season}-${d.episode}` ? 2 : 0)}
                          y={isMouseOver && highlightedEpisode === `${d.season}-${d.episode}` ? -2 : 0}
                          width={episodeTimeScale(screenMoment.duration) + (isMouseOver && highlightedEpisode === `${d.season}-${d.episode}` ? 4 : 0)}
                          height={episodesVerticalScale.bandwidth() + (isMouseOver && highlightedEpisode === `${d.season}-${d.episode}` ? 4 : 0)}
                          fill={characters.find(char => char.id === activeCharacter)?.color}
                          style="opacity: {(isMouseOver && highlightedEpisode === `${d.season}-${d.episode}`) || !isMouseOver ? 1 : 0.3};"
                          stroke={isMouseOver && highlightedEpisode === `${d.season}-${d.episode}` ? '#F9F5F7' : 'none'}
                          stroke-width={2}
                          rx={3}
                          ry={3}
                        />
                      {/each}
                    {/if}
                  </g>
                {/each}

                <!-- Time tooltip -->
                {#if isMouseOver}
                  {#each charData[activeCharacter] as d}
                     <!-- Screen time -->
                    {#each d.aggregatedOnScreen as screenMoment}
                      {#if isMouseOver && highlightedEpisode === `${d.season}-${d.episode}`}
                        <rect
                          class="pointer-events-none {activeCharacter}-onscreen season-{d.season}"
                          x={episodeTimeScale(screenMoment.start)}
                          y={episodesVerticalScale(`${d.season}-${d.episode}`) - 2}
                          width={episodeTimeScale(screenMoment.duration)}
                          height={episodesVerticalScale.bandwidth() + 4}
                          fill={characters.find(char => char.id === activeCharacter)?.color}
                          fill-opacity={activeFilter === FILTER.LAUGHS ? 0.6 : 1}
                          stroke={activeFilter === FILTER.LAUGHS ? 'none' : '#F9F5F7'}
                          stroke-width={2}
                          rx={3}
                          ry={3}
                        />
                      {/if}
                    {/each}

                    <!-- Laughs -->
                    {#if activeFilter === FILTER.LAUGHS}
                      {#each d.aggregatedLaughs as screenMoment}
                        {#if isMouseOver && highlightedEpisode === `${d.season}-${d.episode}`}
                          <rect
                            class="pointer-events-none {activeCharacter}-laugh"
                            x={episodeTimeScale(screenMoment.start) - 2}
                            y={episodesVerticalScale(`${d.season}-${d.episode}`) - 2}
                            width={episodeTimeScale(screenMoment.duration) + 4}
                            height={episodesVerticalScale.bandwidth() + 4}
                            fill={characters.find(char => char.id === activeCharacter)?.color}
                            stroke={'#F9F5F7'}
                            stroke-width={2}
                            rx={3}
                            ry={3}
                          />
                        {/if}
                      {/each}
                    {/if}
                  {/each}

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
              <g transform="translate({visualizationsWidth - episodesOverviewWidth}, {margin.top})" fill-opacity={isMouseOver ? 0.3 : 1}>
                <text 
                  x={3}
                  y={-4}
                  class="small accent">{activeFilter === FILTER.SCREEN_TIME ? 'Screen time' : 'Laugh rate'}</text>
                <g transform="rotate(-90) translate(4, 77)">
                  <ArrowDown />
                </g>
                <rect
                  class="pointer-events-none"
                  x={0}
                  y={0}
                  width={episodesOverviewWidth - marginEnd}
                  height={visualizationsInnerHeight}
                  fill="#F9F5F7"
                  fill-opacity={isMouseOver ? 0.3 : 0.9}
                />
                <!-- Vertical Axes -->
                {#each overviewLabels as overviewLabel}
                  <g transform="translate({episodeOverviewScale(overviewLabel / 100)}, 0)" class="pointer-events-none">
                    <line
                      x1={0}
                      y1={-12}
                      x2={0}
                      y2={visualizationsInnerHeight + 12}
                      stroke="#303843"
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
                      {#if episodeOverviewScale((d.aggregatedOnScreen.length * 60) / d.duration)}
                        <rect
                          class="pointer-events-none"
                          x={0}
                          y={0}
                          width={episodeOverviewScale((d.aggregatedOnScreen.reduce((acc, value) => acc + value.duration, 0)) / d.duration)}
                          height={episodesVerticalScale.bandwidth()}
                          fill={characters.find(char => char.id === activeCharacter)?.color}
                          fill-opacity={activeFilter === FILTER.LAUGHS ? 0.3 : (isMouseOver && highlightedEpisode === `${d.season}-${d.episode}`) || !isMouseOver ? 1 : 0.3}
                          rx={3}
                          ry={3}
                        />
                      {/if}
                    {:else}
                      <!-- Laugh rate -->
                      {#if episodeOverviewScale(d.causesLaughs.length / (d.aggregatedOnScreen.reduce((acc, value) => acc + value.duration, 0)))}
                        <rect
                          class="pointer-events-none"
                          x={0}
                          y={0}
                          width={episodeOverviewScale(d.causesLaughs.length / (d.aggregatedOnScreen.reduce((acc, value) => acc + value.duration, 0)))}
                          height={episodesVerticalScale.bandwidth()}
                          fill={characters.find(char => char.id === activeCharacter)?.color}
                          fill-opacity={(isMouseOver && highlightedEpisode === `${d.season}-${d.episode}`) || !isMouseOver ? 1 : 0.3}
                          rx={3}
                          ry={3}
                        />
                      {/if}
                    {/if}
                  </g>
                {/each}

                {#each charData[activeCharacter] as d}
                  {#if isMouseOver && highlightedEpisode === `${d.season}-${d.episode}`}
                    <g transform="translate(0, {episodesVerticalScale(`${d.season}-${d.episode}`)})">
                      <rect
                        class="pointer-events-none"
                        x={0}
                        y={0}
                        width={episodesOverviewWidth - marginEnd}
                        height={episodesVerticalScale.bandwidth()}
                        fill="#F9F5F7"
                        rx={3}
                        ry={3}
                      />

                      {#if activeFilter === FILTER.SCREEN_TIME}
                        <rect
                          class="pointer-events-none"
                          x={0}
                          y={-2}
                          width={episodeOverviewScale((d.aggregatedOnScreen.reduce((acc, value) => acc + value.duration, 0)) / d.duration)}
                          height={episodesVerticalScale.bandwidth() + 4}
                          fill={characters.find(char => char.id === activeCharacter)?.color}
                          stroke={'#F9F5F7'}
                          stroke-width={2}
                          rx={3}
                          ry={3}
                        />
                      {:else}
                        <rect
                          class="pointer-events-none"
                          x={0}
                          y={-2}
                          width={episodeOverviewScale(d.causesLaughs.length / (d.aggregatedOnScreen.reduce((acc, value) => acc + value.duration, 0)))}
                          height={episodesVerticalScale.bandwidth() + 4}
                          fill={characters.find(char => char.id === activeCharacter)?.color}
                          stroke={'#F9F5F7'}
                          stroke-width={2}
                          rx={3}
                          ry={3}
                        />
                      {/if}
                    </g>
                  {/if}
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
                    <g class="number" fill="#12020A" fill-opacity={1} text-anchor="middle">
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


              <!-- Season separators -->
              <g transform="translate(14, {margin.top})" class="pointer-events-none">
                <line
                    x1={0}
                    y1={0}
                    x2={visualizationsWidth - 14}
                    y2={0}
                    stroke="#303843"
                    stroke-opacity={isMouseOver ? 0 : 1}
                  />
                {#each seasons as season, i}
                  <line
                    x1={0}
                    y1={seasonScale(sum(seasons.slice(0, i), (d) => d.numEpisodes)) + seasonScale(season.numEpisodes)}
                    x2={visualizationsWidth - 14}
                    y2={seasonScale(sum(seasons.slice(0, i), (d) => d.numEpisodes)) + seasonScale(season.numEpisodes)}
                    stroke="#303843"
                    stroke-opacity={isMouseOver ? 0 : 1}
                  />
                {/each}
              </g>
              </g>
            </svg>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Texts -->
  <div id="lead-chars-episodes-texts" class="z-10 relative pointer-events-none" style="top: calc(100vh + {headerHeight}px);">
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
</style>
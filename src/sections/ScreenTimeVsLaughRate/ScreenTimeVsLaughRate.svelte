<script>
  import { onMount } from 'svelte';
  import { gsap } from 'gsap/dist/gsap';
  import * as Tone from 'tone';

  import { sonificationFiles, getCharSoundFileName } from '$lib/data/sonificationFilesMapping';
  import { soundIsAuth } from '../../stores/soundAuthStore';
  import { characters } from '$lib/data/characters';
  import { locations } from '$lib/data/locations';
  import { FILTER } from '../../types/filter';

  import Header from './Header.svelte';
  import Selectors from './Selectors.svelte';

  import Toggle from '../supporting_characters/Toggle.svelte';
  import VisualizationContainer from './VisualizationContainer.svelte';
  import MainCharsTexts from '../main_characters/texts/MainCharsTexts.svelte';
  import ScreenTimeVsLaughRateLegend from './ScreenTimeVsLaughRateLegend.svelte';

  let { episodesData, currentSection } = $props();

  let innerWidth = $state(1600);
  let innerHeight = $state(800);
  let headerHeight = $state(200);
  let visualizationsContainerHeight = $state(800);

  let currentChars = $derived.by(() => {
    switch (currentSection) {
      case 'supporting_chars':
        return characters.slice(4, characters.length - 1);
      case 'locations':
        return locations;
      default:
        return characters.slice(0, 4);
    }
  });

  let activeCharacter = $state(
    currentSection === 'locations'
      ? "Jerry's home"
      : currentSection === 'main_chars'
        ? 'JERRY'
        : "Jerry's family",
  );

  let isMouseOver = $state(false);
  let isTextOver = $state(false);

  let activeFilter = $state(FILTER.SCREEN_TIME);

  /**
   * @type {Tone.Players}
   */
  let soundtrack;
  const preload = () => {
    soundtrack = new Tone.Players(sonificationFiles).toDestination(); //connects to the system sound output
    soundtrack.volume.value = -3;
  };

  let soundtrackCanPlay = false;
  /**
   * @type {number | undefined}
   */
  let playRythmTimeout;
  /**
   * @type {number | undefined}
   */
  let playCharTimeout;
  /**
   * @type {string}
   */
  let playingFile;

  const updatePlayingFile = (/** @type {string} */ char) => {
    playingFile = getCharSoundFileName(char, '1');
  };
  updatePlayingFile(activeCharacter);

  const playRythm = () => {
    if ($soundIsAuth) {
      soundtrack.player('rythm').start();

      playRythmTimeout = setTimeout(() => {
        playRythm();
      }, 8727.272727);
    }
  };
  const playChar = () => {
    if ($soundIsAuth) {
      soundtrack.player(playingFile).start();

      playCharTimeout = setTimeout(() => {
        playChar();
      }, 8727.272727);
    }
  };

  const playAudio = () => {
    if (soundtrack.state === 'started') return; // already playing
    playRythm();
    playChar();
  };

  const stopAudio = () => {
    if (soundtrack.state !== 'started') return; // already stopped
    soundtrack.stopAll();
    clearTimeout(playRythmTimeout);
    clearTimeout(playCharTimeout);
  };

  $effect(() => {
    if ($soundIsAuth && soundtrackCanPlay && soundtrack?.state !== 'started') {
      playAudio();
    } else if (!$soundIsAuth && soundtrackCanPlay && soundtrack?.state === 'started') {
      stopAudio();
    }
  });

  const handleCharacterClick = (/** @type {string} */ char) => {
    if (char !== activeCharacter) {
      if ($soundIsAuth && soundtrackCanPlay && soundtrack?.state === 'started') {
        soundtrack.player(playingFile).stop();
        clearTimeout(playCharTimeout);
        updatePlayingFile(char);
        playChar();
      }

      activeCharacter = char;
    }
  };

  /**
   * @param {FILTER} filter
   */
  function switchFilter(filter) {
    if ($soundIsAuth && soundtrackCanPlay) {
      const toggleAudioFile = filter === FILTER.SCREEN_TIME ? 'buzz' : 'laugh';
      soundtrack.player(toggleAudioFile).start();
    }

    activeFilter = filter;
  }

  const resetFilters = (/** @type {string} */ char) => {
    activeCharacter = char;
    switchFilter(FILTER.SCREEN_TIME);
  };

  // TODO: Those data manipulation don't need to happen live
  let charData = $derived.by(() => {
    const mainCharsData = {};

    currentChars.forEach((char) => {
      /**
       * @type {{ season: any; episode: any; duration: any; onScreen: any[]; aggregatedOnScreen: any[]; onScreenAtWork: any[]; causesLaughs: any[]; episodeLaughs: any; aggregatedLaughs: any[]; withoutJerry: any[]; firstSceneWithoutJerry: any[]; }[]}
       */
      const breakdown = [];

      episodesData.forEach(
        (
          /** @type {{ data: any[]; season: any; episode: any; duration: any; laughs: any; }} */ episode,
        ) => {
          /**
           * @type {any[]}
           */
          const onScreen = [];
          /**
           * @type {any[]}
           */
          const onScreenAtWork = [];
          /**
           * @type {{ start: number; duration: number; }[]}
           */
          const aggregatedScreenTime = [];
          /**
           * @type {{ start: number; duration: number; }[]}
           */
          const aggregatedScreenTimeAtWork = [];
          /**
           * @type {any[]}
           */
          const causesLaughs = [];
          /**
           * @type {{ start: number; duration: number; }[]}
           */
          const aggregatedLaughs = [];
          /**
           * @type {any[]}
           */
          const withoutJerry = [];
          /**
           * @type {{ start: number; duration: number; }[]}
           */
          const aggregatedWithoutJerry = [];
          /**
           * @type {any[]}
           */
          const firstSceneWithoutJerry = [];
          /**
           * @type {{ start: number; duration: number; }[]}
           */
          const aggregatedFirstSceneWithoutJerry = [];

          episode.data.forEach((d) => {
            // Main characters
            if (d.eventCategory === 'CHARACTERS' && d.eventAttribute.includes(char.id)) {
              onScreen.push(d);
            }

            if (
              currentSection === 'main_chars' &&
              char.id === 'JERRY' &&
              d.eventCategory === 'LOCATION' &&
              d.eventAttribute === 'Workplace'
            ) {
              onScreenAtWork.push(d);
            }

            if (
              currentSection === 'main_chars' &&
              char.id === 'JERRY' &&
              d.eventCategory === 'CHARACTERS' &&
              d.eventAttribute === 'GEORGE' &&
              episode.data.find(
                (e) => e.eventAttribute === 'ELAINE' && e.eventTimeSeconds === d.eventTimeSeconds,
              ) &&
              episode.data.find(
                (e) => e.eventAttribute === 'KRAMER' && e.eventTimeSeconds === d.eventTimeSeconds,
              ) &&
              !episode.data.find(
                (e) => e.eventAttribute === 'JERRY' && e.eventTimeSeconds === d.eventTimeSeconds,
              )
            ) {
              withoutJerry.push(d);
            }

            if (
              currentSection === 'main_chars' &&
              char.id === 'JERRY' &&
              +d.sceneNumber === 1 &&
              !episode.data.find((e) => +e.sceneNumber === 1 && e.eventAttribute === 'JERRY')
            ) {
              firstSceneWithoutJerry.push(d);
            }

            if (d.eventCategory === 'CAUSES THE LAUGH' && d.eventAttribute.includes(char.id)) {
              causesLaughs.push(d);
            }

            // Locations
            if (
              (currentSection === 'locations'
                ? d.eventCategory === 'LOCATION'
                : d.eventCategory === 'CHARACTERS') &&
              d.eventAttribute.includes(activeCharacter)
            ) {
              onScreen.push(d);

              const time = d.eventTimeSeconds;
              if (
                currentSection === 'locations' &&
                episode.data.find(
                  (e) => e.eventCategory === 'CAUSES THE LAUGH' && e.eventTimeSeconds === time,
                )
              ) {
                causesLaughs.push(
                  episode.data.find(
                    (e) => e.eventCategory === 'CAUSES THE LAUGH' && e.eventTimeSeconds === time,
                  ),
                );
              }
            }

            if (
              currentSection !== 'locations' &&
              d.eventCategory === 'CAUSES THE LAUGH' &&
              d.eventAttribute.includes(activeCharacter)
            ) {
              causesLaughs.push(d);
            }
          });

          /**
           * @type {number | undefined}
           */
          let start;
          /**
           * @type {number | undefined}
           */
          let currentTime;
          onScreen.forEach((d, i) => {
            if (!start && !currentTime) {
              start = +d.eventTimeSeconds;
              currentTime = +d.eventTimeSeconds;
            } else if (+d.eventTimeSeconds > currentTime + 5 || i === onScreen.length - 1) {
              aggregatedScreenTime.push({
                start: start - 5,
                duration: currentTime - start,
              });
              start = +d.eventTimeSeconds;
              currentTime = +d.eventTimeSeconds;
            } else if (+d.eventTimeSeconds === currentTime + 5) {
              currentTime = +d.eventTimeSeconds;
            }
          });

          start = undefined;
          currentTime = undefined;
          onScreenAtWork.forEach((d, i) => {
            if (!start && !currentTime) {
              start = +d.eventTimeSeconds;
              currentTime = +d.eventTimeSeconds;
            } else if (+d.eventTimeSeconds > currentTime + 5 || i === onScreenAtWork.length - 1) {
              aggregatedScreenTimeAtWork.push({
                start: start - 5,
                duration: currentTime - start,
              });
              start = +d.eventTimeSeconds;
              currentTime = +d.eventTimeSeconds;
            } else if (+d.eventTimeSeconds === currentTime + 5) {
              currentTime = +d.eventTimeSeconds;
            }
          });

          start = undefined;
          currentTime = undefined;
          withoutJerry.forEach((d, i) => {
            if (!start && !currentTime) {
              start = +d.eventTimeSeconds;
              currentTime = +d.eventTimeSeconds;
            } else if (+d.eventTimeSeconds > currentTime + 5 || i === withoutJerry.length - 1) {
              aggregatedWithoutJerry.push({
                start: start - 5,
                duration: currentTime - start,
              });
              start = +d.eventTimeSeconds;
              currentTime = +d.eventTimeSeconds;
            } else if (+d.eventTimeSeconds === currentTime + 5) {
              currentTime = +d.eventTimeSeconds;
            }
          });

          start = undefined;
          currentTime = undefined;
          firstSceneWithoutJerry.forEach((d, i) => {
            if (!start && !currentTime) {
              start = +d.eventTimeSeconds;
              currentTime = +d.eventTimeSeconds;
            } else if (
              +d.eventTimeSeconds > currentTime + 5 ||
              i === firstSceneWithoutJerry.length - 1
            ) {
              aggregatedFirstSceneWithoutJerry.push({
                start: start - 5,
                duration: currentTime - start,
              });
              start = +d.eventTimeSeconds;
              currentTime = +d.eventTimeSeconds;
            } else if (+d.eventTimeSeconds === currentTime + 5) {
              currentTime = +d.eventTimeSeconds;
            }
          });

          start = undefined;
          currentTime = undefined;
          causesLaughs.forEach((d, i) => {
            if (!start && !currentTime) {
              start = +d.eventTimeSeconds;
              currentTime = +d.eventTimeSeconds;
            } else if (+d.eventTimeSeconds > currentTime + 5 || i === onScreenAtWork.length - 1) {
              aggregatedLaughs.push({
                start: start - 5,
                duration: currentTime - start,
              });
              start = +d.eventTimeSeconds;
              currentTime = +d.eventTimeSeconds;
            } else if (+d.eventTimeSeconds === currentTime + 5) {
              currentTime = +d.eventTimeSeconds;
            }
          });

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
            firstSceneWithoutJerry: aggregatedFirstSceneWithoutJerry,
          });
        },
      );

      mainCharsData[char.id] = breakdown;
    });

    return mainCharsData;
  });
  $inspect('charData', charData);

  onMount(() => {
    // Preload audio files
    preload();

    if (currentSection === 'main_chars') {
      // Pin visualization
      gsap.timeline({
        scrollTrigger: {
          trigger: '#main_chars-episodes-container',
          start: `top top-=${headerHeight}`,
          end: 'bottom bottom',
          pin: '#lead-chars-episodes-viz',
          onEnter: () => {
            soundtrackCanPlay = true;
            playAudio();
          },
          onEnterBack: () => {
            soundtrackCanPlay = true;
            playAudio();
          },
          onLeave: () => {
            soundtrackCanPlay = false;
            stopAudio();
          },
          onLeaveBack: () => {
            soundtrackCanPlay = false;
            stopAudio();
          },
        },
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
            resetFilters('JERRY');
          },
          onEnterBack: () => {
            isMouseOver = false;
            isTextOver = true;
          },
          onLeave: () => {
            isTextOver = false;
          },
          onLeaveBack: () => {
            isTextOver = false;
          },
        },
      });

      const highlightAnimation = {
        webkitTextFillColor: 'transparent',
        backgroundPosition: '200% center',
        duration: 2,
        delay: 1,
        ease: 'power3.out',
      };

      // Jerry
      const tlJerryText2 = gsap.timeline({
        scrollTrigger: {
          trigger: '#jerry-text-2',
          start: 'top center',
          end: 'bottom center',
          //toggleActions: 'play reverse play reverse'
        },
      });
      tlJerryText2
        .to('.JERRY-onscreen', { opacity: 0.3 })
        .to('.jerry-at-work', { opacity: 1 }, 0)
        .to('#jerry-text-2 .highlight', highlightAnimation, '<-0.7');

      const tlJerryText3 = gsap.timeline({
        scrollTrigger: {
          trigger: '#jerry-text-3',
          start: 'top center',
          end: 'bottom center',
          //toggleActions: 'play reverse play reverse'
        },
      });
      tlJerryText3
        .to('.jerry-at-work', { opacity: 0 })
        .to('.without-jerry', { opacity: 1 }, 0)
        .to('#jerry-text-3 .highlight', highlightAnimation, '<-0.7');

      const tlJerryText4 = gsap.timeline({
        scrollTrigger: {
          trigger: '#jerry-text-4',
          start: 'top center',
          end: 'bottom center',
          //toggleActions: 'play reverse play reverse'
        },
      });
      tlJerryText4
        .to('.without-jerry', { opacity: 0 })
        .to('.JERRY-onscreen', { opacity: 0.3 }, 0)
        .to('.JERRY-onscreen.season-1', { opacity: 1 }, 0)
        .to('#jerry-text-4 .highlight', highlightAnimation, '<-0.7');

      const tlJerryText5 = gsap.timeline({
        scrollTrigger: {
          trigger: '#jerry-text-5',
          start: 'top center',
          end: 'bottom center',
          //toggleActions: 'play reverse play reverse'
        },
      });
      tlJerryText5
        .to('.JERRY-onscreen', { opacity: 0.3 })
        .to('.first-scene-without-jerry', { opacity: 1 }, 0)
        .to('#jerry-text-5 .highlight', highlightAnimation, '<-0.7');

      const tlJerryText6 = gsap.timeline({
        scrollTrigger: {
          trigger: '#jerry-text-6',
          start: 'top center',
          end: 'bottom center',
          //toggleActions: 'play reverse play reverse'
        },
      });
      tlJerryText6
        .to('.first-scene-without-jerry', { opacity: 0 })
        .to('.JERRY-laugh', { opacity: 0 }, 0)
        .to('.JERRY-onscreen, .JERRY-onscreen.season-1', { opacity: 1, stroke: '#F9F5F7' }, 0)
        .to('#jerry-text-6 .highlight', highlightAnimation, '<-0.7');

      const tlJerryText7 = gsap.timeline({
        scrollTrigger: {
          trigger: '#jerry-text-7',
          start: 'top center',
          end: 'bottom center',
          //toggleActions: 'play reverse play reverse',
          onEnter: () => switchFilter(FILTER.LAUGHS),
          onLeaveBack: () => switchFilter(FILTER.SCREEN_TIME),
        },
      });
      tlJerryText7
        .to('.JERRY-onscreen', { opacity: 0.3 })
        .to('.JERRY-laugh', { opacity: 1 }, 0)
        .to('#jerry-text-7 .highlight', highlightAnimation, '<-0.7');

      const tlJerryText8 = gsap.timeline({
        scrollTrigger: {
          trigger: '#jerry-text-8',
          start: 'top center',
          end: 'bottom center',
          //toggleActions: 'play reverse play reverse'
        },
      });
      tlJerryText8.to('#jerry-text-8 .highlight', highlightAnimation, '<-0.7');

      // George
      const tlGeorgeText1 = gsap.timeline({
        scrollTrigger: {
          trigger: '#george-text-1',
          start: 'top center',
          end: 'bottom center',
          //toggleActions: 'play reverse play reverse',
          onEnter: () => {
            handleCharacterClick('GEORGE');
            switchFilter(FILTER.SCREEN_TIME);
          },
          onLeaveBack: () => {
            handleCharacterClick('JERRY');
            switchFilter(FILTER.LAUGHS);
          },
        },
      });

      const tlGeorgeText2 = gsap.timeline({
        scrollTrigger: {
          trigger: '#george-text-2',
          start: 'top center',
          end: 'bottom center',
          //toggleActions: 'play reverse play reverse'
        },
      });
      tlGeorgeText2.to('#george-text-2 .highlight', highlightAnimation, '<-0.7');

      const tlGeorgeText3 = gsap.timeline({
        scrollTrigger: {
          trigger: '#george-text-3',
          start: 'top center',
          end: 'bottom center',
          //toggleActions: 'play reverse play reverse',
          onEnter: () => {
            switchFilter(FILTER.LAUGHS);
          },
          onLeaveBack: () => {
            switchFilter(FILTER.SCREEN_TIME);
          },
        },
      });

      // Elaine
      const tlElaineText1 = gsap.timeline({
        scrollTrigger: {
          trigger: '#elaine-text-1',
          start: 'top center',
          end: 'bottom center',
          //toggleActions: 'play reverse play reverse',
          onEnter: () => {
            handleCharacterClick('ELAINE');
            switchFilter(FILTER.SCREEN_TIME);
          },
          onLeaveBack: () => {
            handleCharacterClick('GEORGE');
            switchFilter(FILTER.LAUGHS);
          },
        },
      });

      const tlElaineText2 = gsap.timeline({
        scrollTrigger: {
          trigger: '#elaine-text-2',
          start: 'top center',
          end: 'bottom center',
          //toggleActions: 'play reverse play reverse'
        },
      });
      tlElaineText2
        .to(
          '.episode-duration.season-1-episode-1, .episode-duration.season-4-episode-1, .episode-duration.season-4-episode-2, .episode-duration.season-4-episode-3, .episode-duration.season-4-episode-4',
          { fill: '#E71D80' },
        )
        .to('#elaine-text-2 .highlight', highlightAnimation, '<-0.7');

      const tlElaineText3 = gsap.timeline({
        scrollTrigger: {
          trigger: '#elaine-text-3',
          start: 'top center',
          end: 'bottom center',
          //toggleActions: 'play reverse play reverse'
        },
      });
      tlElaineText3
        .to(
          '.episode-duration.season-1-episode-1, .episode-duration.season-4-episode-1, .episode-duration.season-4-episode-2, .episode-duration.season-4-episode-3, .episode-duration.season-4-episode-4',
          { fill: '#F9F5F7' },
        )
        .to('#elaine-text-3 .highlight', highlightAnimation, '<-0.7');

      const tlElaineText4 = gsap.timeline({
        scrollTrigger: {
          trigger: '#elaine-text-4',
          start: 'top center',
          end: 'bottom center',
          //toggleActions: 'play reverse play reverse',
          onEnter: () => {
            switchFilter(FILTER.LAUGHS);
          },
          onLeaveBack: () => {
            switchFilter(FILTER.SCREEN_TIME);
          },
        },
      });
      tlElaineText4.to('#elaine-text-3 .highlight', highlightAnimation, '<-0.7');

      // Kramer
      const tlKramerText1 = gsap.timeline({
        scrollTrigger: {
          trigger: '#kramer-text-1',
          start: 'top center',
          end: 'bottom center',
          //toggleActions: 'play reverse play reverse',
          onEnter: () => {
            handleCharacterClick('KRAMER');
            switchFilter(FILTER.SCREEN_TIME);
          },
          onLeaveBack: () => {
            handleCharacterClick('ELAINE');
            switchFilter(FILTER.LAUGHS);
          },
        },
      });

      const tlKramerText2 = gsap.timeline({
        scrollTrigger: {
          trigger: '#kramer-text-2',
          start: 'top center',
          end: 'bottom center',
          //toggleActions: 'play reverse play reverse'
        },
      });
      tlKramerText2.to('#kramer-text-2 .highlight', highlightAnimation, '<-0.7');

      const tlKramerText3 = gsap.timeline({
        scrollTrigger: {
          trigger: '#kramer-text-3',
          start: 'top center',
          end: 'bottom center',
          //toggleActions: 'play reverse play reverse',
          onEnter: () => {
            switchFilter(FILTER.LAUGHS);
          },
          onEnterBack: () => {
            resetFilters('KRAMER');
          },
          onLeaveBack: () => {
            switchFilter(FILTER.SCREEN_TIME);
          },
        },
      });
      tlKramerText3.to('#kramer-text-3 .highlight', highlightAnimation, '<-0.7');
    }
  });
</script>

<svelte:window bind:innerWidth bind:innerHeight />

<div
  id="{currentSection}-episodes-container"
  class="relative mt-20 mb-52"
  style="padding-bottom: {currentSection === 'main_chars' ? '250vh' : '150vh'};"
>
  <div
    id="lead-chars-episodes"
    class="absolute w-screen top-0 left-0"
    style="height: {innerHeight + headerHeight}px"
  >
    <div class="container">
      <!-- Header -->
      <Header bind:headerHeight />

      <!-- Visualization -->
      <div id="lead-chars-episodes-viz" class="grid grid-cols-12 md:gap-8">
        <div class="col-span-2 flex flex-col items-center relative">
          <Selectors
            {currentSection}
            selectors={currentChars}
            activeSelector={activeCharacter}
            {handleCharacterClick}
          />
        </div>

        <div class="col-span-10 md:mt-1" bind:clientHeight={visualizationsContainerHeight}>
          <div class="flex gap-10">
            <Toggle bind:switchFilter {activeFilter} />
            <ScreenTimeVsLaughRateLegend {activeCharacter} {activeFilter} />
          </div>

          <VisualizationContainer
            {episodesData}
            {charData}
            activeSelector={activeCharacter}
            {activeFilter}
            {isMouseOver}
            {isTextOver}
          />
        </div>
      </div>
    </div>
  </div>

  <!-- Texts -->
  {#if currentSection === 'main_chars'}
    <div
      id="lead-chars-episodes-texts"
      class="z-10 relative pointer-events-none"
      style="top: calc(100vh + {headerHeight}px);"
    >
      <MainCharsTexts {charData} />
    </div>
  {/if}
</div>

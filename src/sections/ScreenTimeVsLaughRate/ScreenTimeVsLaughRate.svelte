<script>
  import { onMount, onDestroy } from 'svelte';
  import { get } from 'svelte/store';
  import { gsap } from 'gsap/dist/gsap';
  import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
  import { navigationAnchor } from '../../stores/scrollAnchor';
  import * as Tone from 'tone';

  import {
    sonificationFiles,
    getCharSoundFileName,
    getLocationSoundFileName,
  } from '$lib/data/sonificationFilesMapping';
  import { soundIsAuth } from '../../stores/soundAuthStore';
  import { enterSoundSection, leaveSoundSection } from '../../stores/soundSectionIsInView';
  import { mainCharsTextsDone } from '../../stores/mainCharsTextsDone';
  import { characters } from '$lib/data/characters';
  import { locations } from '$lib/data/locations';
  import { FILTER } from '../../types/filter';

  import Header from './Header.svelte';
  import Selectors from './Selectors.svelte';

  import Toggle from '../supporting_characters/Toggle.svelte';
  import VisualizationContainer from './VisualizationContainer.svelte';
  import MainCharsTexts from '../main_characters/texts/MainCharsTexts.svelte';
  import ScreenTimeVsLaughRateLegend from './ScreenTimeVsLaughRateLegend.svelte';
  import MobileCharDrawer from './MobileCharDrawer.svelte';

  let { episodesData, currentSection } = $props();

  let innerWidth = $state(1600);
  let innerHeight = $state(800);
  let headerHeight = $state(200);
  let isMobile = $derived(innerWidth < 1024);
  let visualizationsContainerHeight = $state(800);
  let drawerOpen = $state(false);
  const activeCharLabel = $derived(
    characters.find((c) => c.id === activeCharacter)?.label ?? activeCharacter,
  );

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
  let showSelectorHint = $state(false);

  let activeFilter = $state(FILTER.SCREEN_TIME);

  const charBgColors = {
    JERRY: 'rgba(95, 168, 211, 0.3)',
    GEORGE: 'rgba(235, 100, 71, 0.3)',
    ELAINE: 'rgba(251, 186, 58, 0.3)',
    KRAMER: 'rgba(131, 200, 195, 0.3)',
  };

  let bgColor = $derived(
    isTextOver || isMouseOver
      ? (charBgColors[/** @type {keyof typeof charBgColors} */ (activeCharacter)] ?? 'transparent')
      : 'transparent',
  );

  /**
   * @type {Tone.Players}
   */
  let soundtrack;
  const preload = () => {
    if (soundtrack) return; // already loaded — guard against double-init
    soundtrack = new Tone.Players(sonificationFiles).toDestination(); //connects to the system sound output
    soundtrack.volume.value = -3;
  };

  let soundtrackCanPlay = $state(false);
  /**
   * @type {number | undefined}
   */
  let playbackTimeout;
  /**
   * @type {string | null}
   */
  let playingFile;

  const suppCharToSonificationKey = (/** @type {string} */ id) => {
    switch (id) {
      case 'Love interest':
        return 'loveinterest';
      case 'Friend/Acquaintance':
      case 'Neighbour':
      case 'Work colleague':
        return 'fnc';
      case "Jerry's family":
      case "George's family":
      case "Elaine's family":
      case "Kramer's family":
        return 'families';
      case 'Other':
        return 'other';
      case 'The situation':
        return 'Situation';
      default:
        return id;
    }
  };

  const locationToSonificationKey = (/** @type {string} */ id) => {
    switch (id) {
      case "Jerry's home":
      case "George's home":
      case "Elaine's home":
      case "Kramer's home":
        return 'CharacterHome';
      case 'Other family home':
        return 'OtherFamilyHome';
      case 'Diner':
        return 'Diner';
      case 'Place of leisure':
        return 'Leisure';
      case 'Workplace':
        return 'Workplace';
      case 'Transport':
        return 'Transport';
      case 'Outside':
        return 'Outside';
      default:
        return 'other';
    }
  };

  const updatePlayingFile = (/** @type {string} */ char) => {
    if (currentSection === 'locations') {
      playingFile = getLocationSoundFileName(locationToSonificationKey(char));
    } else if (currentSection === 'supporting_chars') {
      playingFile = getCharSoundFileName(suppCharToSonificationKey(char), '1');
    } else {
      playingFile = getCharSoundFileName(char, '1');
    }
  };
  $effect(() => {
    updatePlayingFile(activeCharacter);
  });

  // Single bar loop: rhythm and character always start at the exact same AudioContext
  // timestamp so they land on the same downbeat regardless of how playback was triggered.
  const _playBar = () => {
    if (!$soundIsAuth || !soundtrackCanPlay || !soundtrack) return;
    const startTime = Tone.now();
    soundtrack.player('rythm').start(startTime);
    if (playingFile) soundtrack.player(playingFile).start(startTime);
    playbackTimeout = setTimeout(_playBar, 8727.272727);
  };

  const playAudio = () => {
    // Clear any running loop and stop all clips so the next bar starts clean.
    clearTimeout(playbackTimeout);
    if (!soundtrack) return;
    soundtrack.stopAll();
    _playBar();
  };

  const stopAudio = () => {
    clearTimeout(playbackTimeout);
    soundtrack?.stopAll();
  };

  $effect(() => {
    if ($soundIsAuth && soundtrackCanPlay) {
      playAudio();
    } else if (!$soundIsAuth) {
      stopAudio();
    }
  });

  const handleCharacterClick = (/** @type {string} */ char) => {
    if (char !== activeCharacter) {
      isMouseOver = false;
      updatePlayingFile(char);
      activeCharacter = char;

      if ($soundIsAuth && soundtrackCanPlay) {
        // Restart both rhythm and character from the top so they share the same downbeat.
        playAudio();
      }
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

  /**
   * @param {any[]} events
   * @returns {{ start: number; duration: number; }[]}
   */
  function aggregateTimeEvents(events) {
    const result = [];
    let start = NaN;
    let currentTime = NaN;
    events.forEach((d, i) => {
      const t = +d.eventTimeSeconds;
      if (isNaN(start)) {
        start = t;
        currentTime = t;
      } else if (t > currentTime + 5) {
        result.push({ start: start - 5, duration: currentTime - start + 5 });
        start = t;
        currentTime = t;
      } else {
        currentTime = t;
      }
      if (i === events.length - 1) {
        result.push({ start: start - 5, duration: currentTime - start + 5 });
      }
    });
    return result;
  }

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
          /** @type {any[]} */
          const causesLaughs = [];
          /** @type {any[]} */
          const withoutJerry = [];
          /** @type {any[]} */
          const firstSceneWithoutJerry = [];

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
              char.id === activeCharacter &&
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
              char.id === activeCharacter &&
              currentSection !== 'locations' &&
              d.eventCategory === 'CAUSES THE LAUGH' &&
              d.eventAttribute.includes(activeCharacter)
            ) {
              causesLaughs.push(d);
            }
          });

          breakdown.push({
            season: episode.season,
            episode: episode.episode,
            duration: episode.duration,
            onScreen: onScreen,
            aggregatedOnScreen: aggregateTimeEvents(onScreen),
            onScreenAtWork: aggregateTimeEvents(onScreenAtWork),
            causesLaughs: causesLaughs,
            episodeLaughs: episode.laughs,
            aggregatedLaughs: aggregateTimeEvents(causesLaughs),
            withoutJerry: aggregateTimeEvents(withoutJerry),
            firstSceneWithoutJerry: aggregateTimeEvents(firstSceneWithoutJerry),
          });
        },
      );

      mainCharsData[char.id] = breakdown;
    });

    return mainCharsData;
  });
  /** @type {gsap.MatchMedia | undefined} */
  let mm;

  onMount(() => {
    mm = gsap.matchMedia();

    if (currentSection === 'main_chars') {
      // Pin visualization — desktop only (pin:true is problematic on iOS)
      mm.add('(min-width: 1024px)', () => {
        const st = gsap.timeline({
          scrollTrigger: {
            trigger: '#main_chars-episodes-container',
            // Function form so it reads the live headerHeight on every refresh,
            // not the stale initial value from onMount.
            start: () => `top top-=${headerHeight}`,
            end: 'bottom bottom',
            invalidateOnRefresh: true,
            pin: '#lead-chars-episodes-viz',
            onEnter: () => {
              preload();
              soundtrackCanPlay = true;
              playAudio();
              enterSoundSection();
            },
            onEnterBack: () => {
              preload();
              soundtrackCanPlay = true;
              playAudio();
              enterSoundSection();
            },
            onLeave: () => {
              soundtrackCanPlay = false;
              stopAudio();
              leaveSoundSection();
              soundtrack?.dispose();
              soundtrack = undefined;
            },
            onLeaveBack: () => {
              soundtrackCanPlay = false;
              stopAudio();
              leaveSoundSection();
              soundtrack?.dispose();
              soundtrack = undefined;
            },
          },
        });
        return () => {
          st.scrollTrigger?.kill();
          st.kill();
        };
      });

      // Mobile/tablet: IntersectionObserver for audio section tracking (no pin)
      mm.add('(max-width: 1023px)', () => {
        const containerEl = document.getElementById('main_chars-episodes-container');
        if (!containerEl) return;
        const obs = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) {
              preload(); // lazy-load audio on first viewport entry (mobile only)
              soundtrackCanPlay = true;
              playAudio();
              enterSoundSection();
            } else {
              soundtrackCanPlay = false;
              stopAudio();
              leaveSoundSection();
              // Free the 71 decoded WebAudio buffers when out of view; preload() recreates on re-entry.
              soundtrack?.dispose();
              soundtrack = undefined;
            }
          },
          { threshold: 0 },
        );
        obs.observe(containerEl);
        return () => {
          obs.disconnect();
          soundtrackCanPlay = false;
          stopAudio();
          leaveSoundSection();
          soundtrack?.dispose();
          soundtrack = undefined;
        };
      });

      mm.add('(min-width: 1024px)', () => {
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
              mainCharsTextsDone.set(false);
              showSelectorHint = false;
            },
            onLeave: () => {
              isTextOver = false;
              mainCharsTextsDone.set(true);
              showSelectorHint = true;
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
        tlElaineText4.to('#elaine-text-4 .highlight', highlightAnimation, '<-0.7');

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
      }); // end desktop-only text triggers
    } else {
      gsap.timeline({
        scrollTrigger: {
          trigger: `#${currentSection}-episodes-container`,
          start: 'top bottom',
          end: 'bottom top',
          onEnter: () => {
            preload(); // lazy-load audio on first viewport entry
            soundtrackCanPlay = true;
            playAudio();
            enterSoundSection();
            showSelectorHint = true;
          },
          onEnterBack: () => {
            preload(); // recreate buffers after out-of-view dispose
            soundtrackCanPlay = true;
            playAudio();
            enterSoundSection();
            showSelectorHint = true;
          },
          onLeave: () => {
            soundtrackCanPlay = false;
            stopAudio();
            leaveSoundSection();
            // Free 71 decoded WebAudio buffers; preload() recreates on re-entry.
            soundtrack?.dispose();
            soundtrack = undefined;
          },
          onLeaveBack: () => {
            soundtrackCanPlay = false;
            stopAudio();
            leaveSoundSection();
            showSelectorHint = false;
            // Free 71 decoded WebAudio buffers; preload() recreates on re-entry.
            soundtrack?.dispose();
            soundtrack = undefined;
          },
        },
      });
    }

    // On mobile there is no scroll-driven text sequence, so the "texts done"
    // gate that controls PeakPerformances visibility must be set here.
    if (currentSection === 'main_chars' && window.matchMedia('(max-width: 1023px)').matches) {
      mainCharsTextsDone.set(true);
    }
  });

  // Reactively refresh ScrollTrigger when headerHeight changes — bind:clientHeight
  // fires via ResizeObserver after onMount, so the initial $state(200) is stale.
  $effect(() => {
    void headerHeight; // must be first — registers reactive dependency before any early return
    if (!mm || currentSection !== 'main_chars') return;
    if (window.matchMedia('(max-width: 1023px)').matches) return;
    ScrollTrigger.refresh();
    const navAnchor = get(navigationAnchor);
    if (navAnchor) {
      const el = document.getElementById(navAnchor);
      if (el) window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY);
    }
  });

  onDestroy(() => {
    mm?.revert();
    soundtrackCanPlay = false;
    stopAudio();
    soundtrack?.dispose();
    leaveSoundSection();
  });

  // position:fixed breaks inside content-visibility:auto containers. Move the
  // drawer to document.body so it's always positioned relative to the viewport.
  /** @param {HTMLElement} node */
  function portal(node) {
    document.body.appendChild(node);
    return {
      destroy() {
        node.remove();
      },
    };
  }
</script>

<svelte:window bind:innerWidth bind:innerHeight />

<div
  id="{currentSection}-episodes-container"
  class="relative mt-20 mb-8 lg:mb-52"
  style="padding-bottom: {isMobile
    ? '0'
    : currentSection === 'main_chars'
      ? '250vh'
      : '150vh'}; background-color: {bgColor}; transition: background-color 1s ease;"
>
  <div
    id="lead-chars-episodes"
    class="w-screen left-0"
    style="position: {isMobile ? 'relative' : 'absolute'}; top: 0; height: {isMobile
      ? 'auto'
      : `${innerHeight + headerHeight}px`};"
  >
    <div class="container">
      <!-- Header -->
      <Header bind:headerHeight {currentSection} />

      <!-- Visualization -->
      <div
        id="lead-chars-episodes-viz"
        class="flex flex-col lg:grid lg:grid-cols-12 lg:gap-8"
        class:pointer-events-none={currentSection === 'main_chars' && isTextOver}
      >
        <div class="lg:col-span-2 lg:flex lg:flex-col lg:items-center lg:relative">
          <Selectors
            {currentSection}
            selectors={currentChars}
            activeSelector={activeCharacter}
            {handleCharacterClick}
            {isMobile}
            showHint={showSelectorHint}
          />
        </div>

        {#if isMobile && currentSection === 'main_chars'}
          <div class="flex justify-center pt-3">
            <button
              onclick={() => (drawerOpen = true)}
              class="px-6 py-3 rounded-full text-sm font-medium"
              style="border: 1px solid #E71D80; color: #E71D80;"
            >
              Learn more about {activeCharLabel}
            </button>
          </div>
        {/if}

        <div class="lg:col-span-10 lg:mt-1" bind:clientHeight={visualizationsContainerHeight}>
          <div class="flex justify-center lg:justify-start gap-10 mt-3 lg:mt-0">
            <Toggle {switchFilter} {activeFilter} {innerWidth} {currentSection} />
            {#if !isMobile}
              <ScreenTimeVsLaughRateLegend {activeCharacter} {activeFilter} />
            {/if}
          </div>

          <VisualizationContainer
            {episodesData}
            {charData}
            activeSelector={activeCharacter}
            {activeFilter}
            {isMouseOver}
            {isTextOver}
            {innerWidth}
          />
        </div>
      </div>
    </div>
  </div>

  <!-- Texts (desktop only — mobile uses the drawer) -->
  {#if currentSection === 'main_chars' && !isMobile}
    <div
      id="lead-chars-episodes-texts"
      class="z-10 relative pointer-events-none"
      style="top: calc(100vh + {headerHeight}px);"
    >
      <MainCharsTexts {charData} />
    </div>
  {/if}
</div>

{#if isMobile && currentSection === 'main_chars'}
  <div use:portal>
    <MobileCharDrawer
      {charData}
      {activeCharacter}
      isOpen={drawerOpen}
      onClose={() => (drawerOpen = false)}
    />
  </div>
{/if}

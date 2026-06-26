<script>
  import { onMount, onDestroy, tick } from 'svelte';
  import * as Tone from 'tone';
  // @ts-ignore
  import { gsap } from 'gsap/dist/gsap';
  // @ts-ignore
  import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
  gsap.registerPlugin(ScrollTrigger);

  import Laugh from '../../icons/Laugh.svelte';
  import PlayIcon from '../../icons/PlayIcon.svelte';
  import { get } from 'svelte/store';
  import { soundIsAuth } from '../../stores/soundAuthStore';
  import { enterSoundSection, leaveSoundSection } from '../../stores/soundSectionIsInView';
  import { laughterFiles, getRandomLaughterFile } from '$lib/data/laughterFiles';

  /** @type {gsap.Context | undefined} */
  let ctx;

  // ── laughs-text-2 audio ────────────────────────────────────────────────────
  /** @type {Tone.Players | undefined} */
  let laughTracks;
  let isPlaying = $state(false);
  /** @type {ReturnType<typeof setTimeout> | undefined} */
  let debounceTimer;
  let laugh2Cancelled = false;

  const preloadLaughs = async () => {
    laughTracks = new Tone.Players(laughterFiles).toDestination();
    laughTracks.fadeIn = 0.3;
    laughTracks.fadeOut = 0.3;
    await Tone.loaded();
  };

  /** @param {string} [file] */
  function playLaugh(file = getRandomLaughterFile()) {
    if (!laughTracks || isPlaying || !$soundIsAuth) return;
    const player = laughTracks.player(file);
    player.onstop = () => {
      isPlaying = false;
    };
    player.start();
    isPlaying = true;
  }

  function stopLaugh() {
    if (!laughTracks) return;
    laughTracks.stopAll();
    isPlaying = false;
  }

  function safePlay(/** @type {string} */ file) {
    clearTimeout(debounceTimer);
    laugh2Cancelled = false;
    debounceTimer = setTimeout(() => {
      Promise.all([Tone.start(), Tone.loaded()]).then(() => {
        if (!laugh2Cancelled) playLaugh(file);
      });
    }, 50);
  }

  function safeStop() {
    clearTimeout(debounceTimer);
    laugh2Cancelled = true;
    debounceTimer = setTimeout(stopLaugh, 50);
  }

  // ── laughs-text-3 audio ────────────────────────────────────────────────────
  const laugh3Data = [
    {
      url: 'https://amdufour.github.io/hosted-data/apis/laughter/L1-Chuckle(1).m4a',
      label: 'Chuckle',
      desc: 'Quiet or soft laugh, expressing amusement',
      size: 50,
      mobileSize: 35,
      playDiameter: 20,
      mobilePlayDiameter: 16,
    },
    {
      url: 'https://amdufour.github.io/hosted-data/apis/laughter/L2-Chortle(1).m4a',
      label: 'Chortle',
      desc: 'Joyful laugh that shows gleeful pleasure',
      size: 100,
      mobileSize: 70,
      playDiameter: 28,
      mobilePlayDiameter: 22,
    },
    {
      url: 'https://amdufour.github.io/hosted-data/apis/laughter/L3-Guffaw(1).m4a',
      label: 'Guffaw',
      desc: 'Loud or boisterous "belly laugh" often prolonged in duration',
      size: 142,
      mobileSize: 100,
      playDiameter: 32,
      mobilePlayDiameter: 26,
    },
  ];

  let isMobile = $state(false);
  /** @type {HTMLElement | null} */
  let mobileContainerEl = $state(null);

  /** @type {Tone.Player[]} */
  let laugh3Players = [];
  let activeIcon3 = $state(0); // 1–3 while playing, 0 when idle
  let laugh3Stopped = false;
  /** @type {Set<number>} */
  let laugh3Started = new Set();
  /** @type {ReturnType<typeof setTimeout> | undefined} */
  let debounceTimer3;
  /** @type {Promise<void>} */
  let laugh3ReadyPromise;

  const preloadLaughs3 = () => {
    laugh3ReadyPromise = Promise.all(
      laugh3Data.map(async (d) => {
        const player = new Tone.Player().toDestination();
        await player.load(d.url);
        return player;
      }),
    ).then((players) => {
      laugh3Players = players;
    });
  };

  /**
   * @param {number} index
   * @param {boolean} [chain]
   */
  function playLaugh3(index, chain = false) {
    if (laugh3Stopped || index >= laugh3Data.length || !$soundIsAuth || !laugh3Players[index])
      return;
    const player = laugh3Players[index];
    activeIcon3 = index + 1;
    player.onstop = () => {
      laugh3Started.delete(index);
      activeIcon3 = 0;
      if (chain && !laugh3Stopped && index < laugh3Data.length - 1) {
        setTimeout(() => playLaugh3(index + 1, true), 500);
      }
    };
    laugh3Started.add(index);
    try {
      player.start();
    } catch (e) {
      laugh3Started.delete(index);
      console.warn(e);
    }
  }

  function startLaugh3Sequence() {
    if (!$soundIsAuth) return;
    laugh3Stopped = false;
    playLaugh3(0, true);
  }

  function stopLaugh3Sequence() {
    laugh3Stopped = true;
    laugh3Started.forEach((index) => {
      try {
        laugh3Players[index]?.stop();
      } catch (e) {
        console.warn(e);
      }
    });
    laugh3Started.clear();
    activeIcon3 = 0;
  }

  function safeLaugh3Start() {
    clearTimeout(debounceTimer3);
    laugh3Stopped = false;
    debounceTimer3 = setTimeout(() => {
      Promise.all([Tone.start(), laugh3ReadyPromise]).then(() => {
        if (!laugh3Stopped) startLaugh3Sequence();
      });
    }, 300);
  }

  function safeLaugh3Stop() {
    clearTimeout(debounceTimer3);
    debounceTimer3 = setTimeout(stopLaugh3Sequence, 50);
  }

  // Tracks whether the desktop scroll section is currently in view. Guards the
  // auto-played tracks (guffaw2/chuckle2) whose play is deferred behind a
  // promise, so a promise that resolves after we leave doesn't start audio.
  let laughsInView = false;

  function stopAllLaughsAudio() {
    laughsInView = false;

    // Cancel any pending/debounced playback so nothing restarts after we leave.
    clearTimeout(debounceTimer);
    laugh2Cancelled = true;
    clearTimeout(debounceTimer3);
    laugh3Stopped = true;

    stopLaugh();
    stopLaugh3Sequence();
    try {
      guffaw2Player?.stop();
    } catch (e) {
      console.warn(e);
    }
    try {
      chuckle2Player?.stop();
    } catch (e) {
      console.warn(e);
    }
  }

  // ── laughs-text-5 audio ────────────────────────────────────────────────────
  /** @type {Tone.Player | undefined} */
  let guffaw2Player;
  /** @type {Promise<void>} */
  let guffaw2ReadyPromise;

  const preloadGuffaw2 = () => {
    const player = new Tone.Player().toDestination();
    guffaw2ReadyPromise = player
      .load('https://amdufour.github.io/hosted-data/apis/laughter/L3-Guffaw(2).m4a')
      .then(() => {
        guffaw2Player = player;
      });
  };

  function playGuffaw2() {
    if (!guffaw2Player || !get(soundIsAuth) || !laughsInView) return;
    try {
      if (guffaw2Player.state === 'started') guffaw2Player.stop();
      guffaw2Player.start();
    } catch (e) {
      console.warn(e);
    }
  }

  // ── laughs-text-4 audio ────────────────────────────────────────────────────
  /** @type {Tone.Player | undefined} */
  let chuckle2Player;
  /** @type {Promise<void>} */
  let chuckle2ReadyPromise;

  const preloadChuckle2 = () => {
    const player = new Tone.Player().toDestination();
    chuckle2ReadyPromise = player
      .load('https://amdufour.github.io/hosted-data/apis/laughter/L1-Chuckle(2).m4a')
      .then(() => {
        chuckle2Player = player;
      });
  };

  function playChuckle2() {
    if (!chuckle2Player || !get(soundIsAuth) || !laughsInView) return;
    try {
      if (chuckle2Player.state === 'started') chuckle2Player.stop();
      chuckle2Player.start();
    } catch (e) {
      console.warn(e);
    }
  }

  onMount(async () => {
    isMobile = window.innerWidth < 1024;
    await tick();

    if (isMobile) {
      ctx = gsap.context(() => {
        gsap.utils.toArray('.highlight-reverse').forEach((el) => {
          gsap.set(el, { webkitTextFillColor: 'currentColor', backgroundPosition: '0% center' });
          gsap.to(el, {
            webkitTextFillColor: 'transparent',
            backgroundPosition: '200% center',
            duration: 1.5,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          });
        });
      });
      return;
    }

    ScrollTrigger.create({
      trigger: '#laughs-scroll-container',
      start: 'top bottom',
      end: 'bottom top',
      onEnter: () => {
        preloadLaughs();
        preloadLaughs3();
        preloadGuffaw2();
        preloadChuckle2();
        laughsInView = true;
        enterSoundSection();
      },
      onEnterBack: () => {
        laughsInView = true;
        enterSoundSection();
      },
      onLeave: () => {
        stopAllLaughsAudio();
        leaveSoundSection();
      },
      onLeaveBack: () => {
        stopAllLaughsAudio();
        leaveSoundSection();
      },
    });

    ctx = gsap.context(() => {
      const wrapper = document.querySelector('#laughs-text-wrapper');

      // Texts 2-5 are absolute so scrollHeight gives their real content height
      const heights = Array.from({ length: 5 }, (_, i) => {
        const el = document.querySelector(`#laughs-text-${i + 1}`);
        return el ? /** @type {HTMLElement} */ (el).scrollHeight : 0;
      });

      // Texts 2-5 start hidden; wrapper height is driven by GSAP (text 1 is in flow)
      for (let i = 2; i <= 5; i++) {
        gsap.set(`#laughs-text-${i}`, { opacity: 0, pointerEvents: 'none' });
      }
      gsap.set('#text4-laugh-icon', { opacity: 0 });
      gsap.set(['#text5-icon-1', '#text5-icon-2', '#text5-icon-3', '#text5-icon-4'], {
        opacity: 0,
      });
      gsap.set(
        [
          '#laughs-text-1 .highlight',
          '#laughs-text-2 .highlight',
          '#laughs-text-3 .highlight',
          '#laughs-text-4 .highlight',
          '#laughs-text-5 .highlight',
        ],
        {
          webkitTextFillColor: 'currentColor',
          backgroundPosition: '0% center',
        },
      );

      gsap.to('#laughs-text-1 .highlight', {
        webkitTextFillColor: 'transparent',
        backgroundPosition: '200% center',
        duration: 1.5,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '#laughs-scroll-container',
          start: 'top center',
          toggleActions: 'play none none reverse',
        },
      });

      for (let i = 1; i < 5; i++) {
        // tlRef lets the onRefresh closure reference the timeline after it's created
        /** @type {gsap.core.Timeline | undefined} */
        let tlRef;

        /** @type {ScrollTrigger.Vars} */
        const stConfig = {
          trigger: `#laughs-step-${i + 1}`,
          start: 'top top',
          toggleActions: 'play none none reverse',
          invalidateOnRefresh: true,
          // After an instant scroll jump (e.g. SectionProgressBar navigation),
          // ScrollTrigger.refresh() fires but animated reversals from multiple
          // timelines conflict and leave panels overlapping. Snap to the correct
          // progress instantly instead.
          onRefresh: (/** @type {any} */ self) => {
            if (!tlRef) return;
            if (self.progress <= 0) tlRef.progress(0, true);
            else if (self.progress >= 1) tlRef.progress(1, true);
          },
        };

        if (i + 1 === 2) {
          stConfig.onEnter = () => safePlay('laughter_1');
          stConfig.onEnterBack = () => safePlay('laughter_1');
          stConfig.onLeave = () => safeStop();
          stConfig.onLeaveBack = () => safeStop();
        }

        if (i + 1 === 3) {
          stConfig.onEnter = () => safeLaugh3Start();
          stConfig.onEnterBack = () => safeLaugh3Start();
          stConfig.onLeave = () => safeLaugh3Stop();
          stConfig.onLeaveBack = () => safeLaugh3Stop();
        }

        tlRef = gsap
          .timeline({ scrollTrigger: stConfig })
          .to(`#laughs-text-${i}`, {
            opacity: 0,
            pointerEvents: 'none',
            duration: 0.2,
            ease: 'power2.in',
          })
          .to(wrapper, { height: heights[i], duration: 0.25, ease: 'power2.inOut' }, '<')
          .to(`#laughs-text-${i + 1}`, {
            opacity: 1,
            pointerEvents: 'auto',
            duration: 0.2,
            ease: 'power2.out',
          });

        if (i + 1 === 2 || i + 1 === 3 || i + 1 === 4 || i + 1 === 5) {
          tlRef.to(`#laughs-text-${i + 1} .highlight`, {
            webkitTextFillColor: 'transparent',
            backgroundPosition: '200% center',
            duration: 1.5,
            ease: 'power3.out',
            delay: 0.3,
          });
        }

        if (i + 1 === 5) {
          tlRef
            .to('#text5-icon-1', {
              opacity: 1,
              duration: 0.3,
              ease: 'power2.out',
              delay: 0.3,
              onStart: () => {
                Promise.all([Tone.start(), guffaw2ReadyPromise]).then(() => playGuffaw2());
              },
            })
            .to('#text5-icon-2', { opacity: 1, duration: 0.3, ease: 'power2.out' }, '>+4.7')
            .to('#text5-icon-3', { opacity: 1, duration: 0.3, ease: 'power2.out' }, '>+4.7')
            .to('#text5-icon-4', { opacity: 1, duration: 0.3, ease: 'power2.out' }, '>+4.7');
        }

        if (i + 1 === 4) {
          tlRef.to('#text4-laugh-icon', {
            opacity: 1,
            duration: 0.4,
            ease: 'power2.out',
            delay: 0.5,
            onStart: () => {
              Promise.all([Tone.start(), chuckle2ReadyPromise]).then(() => playChuckle2());
            },
          });
        }
      }
    });
  });

  // Mobile: preload once on first viewport entry
  $effect(() => {
    if (!mobileContainerEl) return;
    let loaded = false;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !loaded) {
          loaded = true;
          preloadLaughs();
          preloadLaughs3();
          preloadGuffaw2();
          preloadChuckle2();
          obs.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(mobileContainerEl);
    return () => obs.disconnect();
  });

  onDestroy(() => {
    ctx?.revert();
    laughTracks?.dispose();
    laugh3Players.forEach((p) => p.dispose());
    guffaw2Player?.dispose();
    chuckle2Player?.dispose();
  });
</script>

<!-- Mobile/tablet layout: normal stacked flow -->
<div class="lg:hidden" bind:this={mobileContainerEl}>
  <img
    src="https://amdufour.github.io/hosted-data/apis/images/data_gathering_1.jpg"
    alt=""
    class="w-full h-auto block"
  />
  <div class="divide-y divide-white/20">
    <!-- Panel 1 -->
    <div class="px-6 py-8">
      Whilst tracking the episode's time elapsed on screen, a detailed spreadsheet template was used
      to <span class="highlight-reverse">quantify</span>
      and <span class="highlight-reverse">classify</span> data that would aid the analysis of the show's
      rhythm and texture.
    </div>

    <!-- Panel 2 -->
    <div class="px-6 py-8 flex flex-col gap-6">
      <div class="relative w-[100px] shrink-0">
        <Laugh width={100} height={100} color="black" isActive={isPlaying} />
        <button
          class="absolute bottom-[-10px] right-[-10px] transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
          disabled={isPlaying || !$soundIsAuth}
          onclick={() => {
            Promise.all([Tone.start(), Tone.loaded()]).then(() => playLaugh());
          }}
          aria-label="Play laughter"
        >
          <PlayIcon color="black" diameter={26} />
        </button>
      </div>
      <p>
        It doesn't take a genius to recognise the main goal of a situation comedy is to be funny.
        Therefore, a reliable indicator of a sitcom being funny is to measure the reaction of an
        audience's laughter through the laugh track. It is rare to find laugh tracks on modern
        sitcoms, but Seinfeld had one. With the show always being filmed in front of a <span
          class="highlight-reverse">live studio audience</span
        > (any scenes filmed outside were played back in the studio) it meant the laughter heard is an
        authentic measure of the audience's reaction.
      </p>
    </div>

    <!-- Panel 3 -->
    <div class="px-6 py-8 flex flex-col gap-8">
      <p>
        Measuring laughter was the most subjective and, therefore, challenging data collection
        activity. Laughing can occur at different levels, from the subtle smile characterising
        'inner' laughter, through to more external giggles, and up to howling belly laughs. To
        establish a standard and consistent measurement, any audience laughter heard would be
        considered as a <span class="highlight-reverse">laughter moment</span>, regardless of its
        level.
      </p>
      <div class="flex flex-row justify-between items-end">
        {#each laugh3Data as item, i}
          <div class="flex flex-col items-center gap-1 text-center">
            <div class="relative shrink-0 flex items-end mb-2" style="height: 100px">
              <Laugh
                width={item.mobileSize}
                height={item.mobileSize}
                color="black"
                isActive={activeIcon3 === i + 1}
              />
              <button
                class="absolute bottom-[-10px] right-[-10px] transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
                disabled={activeIcon3 > 0 || !$soundIsAuth}
                onclick={() => {
                  Promise.all([Tone.start(), laugh3ReadyPromise]).then(() => playLaugh3(i));
                }}
                aria-label="Play {item.label}"
              >
                <PlayIcon color="black" diameter={item.mobilePlayDiameter} />
              </button>
            </div>
            <div class="font-semibold small">{item.label}</div>
          </div>
        {/each}
      </div>
    </div>

    <!-- Panel 4 -->
    <div class="px-6 py-8 flex flex-col gap-6">
      <p>
        For consistency, each observed laughter moment was recorded against an associated
        <span class="highlight-reverse">5&#8209;second</span> block of time, determined by in which period
        the laughter was heard and/or most associated. When testing out the data collection approach over
        three sample episodes, the 5-second duration proved to be the most reliable and representative
        'average' duration, from the gag's delivery to the audience's laughter subsiding.
      </p>
      <div
        class="self-start border border-black/40 lg:border-white/40 text-xs"
        role="img"
        aria-label="Spreadsheet showing a single laughter moment logged at 18:40"
      >
        <div class="grid grid-cols-5 border-b border-black/40 lg:border-white/40">
          {#each ['18:35', '18:40', '18:45', '18:50', '18:55'] as time, ti}
            <div
              class="px-4 py-2 number text-center text-black/70 lg:text-white/70 {ti < 4
                ? 'border-r border-black/40 lg:border-white/40'
                : ''}"
            >
              {time}
            </div>
          {/each}
        </div>
        <div class="grid grid-cols-5">
          <div class="px-4 py-3 border-r border-black/40 lg:border-white/40"></div>
          <div
            class="px-4 py-3 border-r border-black/40 lg:border-white/40 flex justify-center items-center"
            aria-hidden="true"
          >
            <Laugh width={30} height={30} color="black" />
          </div>
          <div class="px-4 py-3 border-r border-black/40 lg:border-white/40"></div>
          <div class="px-4 py-3 border-r border-black/40 lg:border-white/40"></div>
          <div class="px-4 py-3"></div>
        </div>
      </div>
    </div>

    <!-- Panel 5 -->
    <div class="px-6 py-8 flex flex-col gap-6">
      <p>
        On rare occasions, laughter would run for longer than 5 seconds, sometimes persisting for 10
        and even 15 seconds. This might have been a single sustained period of laughing or waves of
        renewed laughter caused by a character's glance or change in expression, perhaps in reaction
        to the laughter itself. In such cases, distinct laughter moments would be logged for each
        consecutive <span class="highlight-reverse">5-second block</span> of the laughing duration.
      </p>
      <div
        class="self-start border border-black/40 lg:border-white/40 text-xs"
        role="img"
        aria-label="Spreadsheet showing laughter logged across four consecutive 5-second blocks: 18:40, 18:45, 18:50, and 18:55"
      >
        <div class="grid grid-cols-5 border-b border-black/40 lg:border-white/40">
          {#each ['18:35', '18:40', '18:45', '18:50', '18:55'] as time, ti}
            <div
              class="px-4 py-2 number text-center text-black/70 lg:text-white/70 {ti < 4
                ? 'border-r border-black/40 lg:border-white/40'
                : ''}"
            >
              {time}
            </div>
          {/each}
        </div>
        <div class="grid grid-cols-5" aria-hidden="true">
          <div class="px-4 py-3 border-r border-black/40 lg:border-white/40"></div>
          <div
            class="px-4 py-3 border-r border-black/40 lg:border-white/40 flex justify-center items-center"
          >
            <Laugh width={30} height={30} color="black" />
          </div>
          <div
            class="px-4 py-3 border-r border-black/40 lg:border-white/40 flex justify-center items-center"
          >
            <Laugh width={30} height={30} color="black" />
          </div>
          <div
            class="px-4 py-3 border-r border-black/40 lg:border-white/40 flex justify-center items-center"
          >
            <Laugh width={30} height={30} color="black" />
          </div>
          <div class="px-4 py-3 flex justify-center items-center">
            <Laugh width={30} height={30} color="black" />
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- Desktop layout: sticky scroll-animated panels -->
<div id="laughs-scroll-container" class="relative hidden lg:block">
  <div class="sticky h-[100dvh] self-start" style="top: calc(100lvh - 100dvh);">
    <!-- Background image -->
    <div
      class="absolute inset-0 bg-cover bg-center"
      style="background-image: url('https://amdufour.github.io/hosted-data/apis/images/data_gathering_1.jpg');"
    ></div>

    <!-- Text panels at the bottom -->
    <div class="absolute bottom-0 left-0 right-0 bg-black/70 text-white overflow-hidden">
      <!-- wrapper: text 1 in flow sets natural height; texts 2-5 are absolute -->
      <div id="laughs-text-wrapper" class="relative container">
        <div id="laughs-text-1" class="py-8 md:py-12 max-w-[840px] pointer-events-none">
          Whilst tracking the episode's time elapsed on screen, a detailed spreadsheet template was
          used to <span class="highlight">quantify</span>
          and <span class="highlight">classify</span> data that would aid the analysis of the show's rhythm
          and texture.
        </div>
        <div id="laughs-text-2" class="absolute inset-x-0 top-0 px-6 md:px-12 py-8 md:py-12">
          <div class="flex flex-col md:grid md:grid-cols-[142px_1fr] gap-6 md:gap-8 items-start">
            <!-- Icon + play button -->
            <div class="relative w-[142px] shrink-0">
              <Laugh width={142} height={142} color="white" isActive={isPlaying} />
              <button
                class="absolute bottom-[-10px] right-[-10px] transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
                disabled={isPlaying || !$soundIsAuth}
                onclick={() => playLaugh()}
                aria-label="Play laughter"
              >
                <PlayIcon color="white" diameter={32} />
              </button>
            </div>
            <!-- Text -->
            <div class="max-w-[984px]">
              It doesn't take a genius to recognise the main goal of a situation comedy is to be
              funny. Therefore, a reliable indicator of a sitcom being funny is to measure the
              reaction of an audience's laughter through the laugh track. It is rare to find laugh
              tracks on modern sitcoms, but Seinfeld had one. With the show always being filmed in
              front of a <span class="highlight">live studio audience</span> (any scenes filmed outside
              were played back in the studio) it meant the laughter heard is an authentic measure of the
              audience's reaction.
            </div>
          </div>
        </div>
        <div id="laughs-text-3" class="absolute inset-x-0 top-0 px-6 lg:px-12 py-8 lg:py-12">
          <div class="flex flex-col lg:grid lg:grid-cols-[1fr_auto] gap-6 lg:gap-8 items-end">
            <!-- Text -->
            <div class="self-center max-w-[984px]">
              Measuring laughter was the most subjective and, therefore, challenging data collection
              activity. Laughing can occur at different levels, from the subtle smile characterising
              'inner' laughter, through to more external giggles, and up to howling belly laughs. To
              establish a standard and consistent measurement, any audience laughter heard would be
              considered as a <span class="highlight">laughter moment</span>, regardless of its
              level.
            </div>
            <!-- Icons -->
            <div
              class="w-full lg:px-4 flex flex-row justify-between md:justify-start lg:justify-between items-end lg:gap-4 xl:gap-10 shrink-0"
            >
              {#each laugh3Data as item, i}
                {@const s = isMobile ? item.mobileSize : item.size}
                {@const pd = isMobile ? item.mobilePlayDiameter : item.playDiameter}
                <div class="flex flex-col items-center gap-1 text-center w-[142px]">
                  <div
                    class="relative shrink-0 flex items-end mb-2"
                    style="height: {isMobile ? 100 : 142}px"
                  >
                    <Laugh width={s} height={s} color="white" isActive={activeIcon3 === i + 1} />
                    <button
                      class="absolute bottom-[-10px] right-[-10px] transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
                      disabled={activeIcon3 > 0 || !$soundIsAuth}
                      onclick={() => playLaugh3(i)}
                      aria-label="Play {item.label}"
                    >
                      <PlayIcon color="white" diameter={pd} />
                    </button>
                  </div>
                  <div class="font-semibold">{item.label}</div>
                  {#if !isMobile}
                    <div class="small leading-normal">{item.desc}</div>
                  {/if}
                </div>
              {/each}
            </div>
          </div>
        </div>
        <div id="laughs-text-4" class="absolute inset-x-0 top-0 px-6 md:px-12 py-8 md:py-12">
          <div class="flex flex-col md:grid md:grid-cols-[1fr_auto] gap-6 md:gap-10 items-center">
            <!-- Text -->
            <div class="max-w-[984px]">
              For consistency, each observed laughter moment was recorded against an associated
              <span class="highlight">5&#8209;second</span> block of time, determined by in which period
              the laughter was heard and/or most associated. When testing out the data collection approach
              over three sample episodes, the 5-second duration proved to be the most reliable and representative
              'average' duration, from the gag's delivery to the audience's laughter subsiding.
            </div>
            <!-- Excel-like grid -->
            <div
              class="shrink-0 border border-white/40 text-xs"
              role="img"
              aria-label="Spreadsheet showing a single laughter moment logged at 18:40"
            >
              <!-- Time headers -->
              <div class="grid grid-cols-5 border-b border-white/40">
                {#each ['18:35', '18:40', '18:45', '18:50', '18:55'] as time, ti}
                  <div
                    class="px-4 py-2 number text-center text-white/70 {ti < 4
                      ? 'border-r border-white/40'
                      : ''}"
                  >
                    {time}
                  </div>
                {/each}
              </div>
              <!-- Laugh row -->
              <div class="grid grid-cols-5">
                <div class="px-4 py-3 border-r border-white/40"></div>
                <div class="px-4 py-3 border-r border-white/40 flex justify-center items-center">
                  <div id="text4-laugh-icon" aria-hidden="true">
                    <Laugh width={30} height={30} color="white" />
                  </div>
                </div>
                <div class="px-4 py-3 border-r border-white/40"></div>
                <div class="px-4 py-3 border-r border-white/40"></div>
                <div class="px-4 py-3"></div>
              </div>
            </div>
          </div>
        </div>
        <div id="laughs-text-5" class="absolute inset-x-0 top-0 px-6 md:px-12 py-8 md:py-12">
          <div class="flex flex-col md:grid md:grid-cols-[1fr_auto] gap-6 md:gap-10 items-center">
            <!-- Text -->
            <div class="max-w-[984px]">
              On rare occasions, laughter would run for longer than 5 seconds, sometimes persisting
              for 10 and even 15 seconds. This might have been a single sustained period of laughing
              or waves of renewed laughter caused by a character's glance or change in expression,
              perhaps in reaction to the laughter itself. In such cases, distinct laughter moments
              would be logged for each consecutive <span class="highlight">5-second block</span> of the
              laughing duration.
            </div>
            <!-- Excel-like grid -->
            <div
              class="shrink-0 border border-white/40 text-xs"
              role="img"
              aria-label="Spreadsheet showing laughter logged across four consecutive 5-second blocks: 18:40, 18:45, 18:50, and 18:55"
            >
              <!-- Time headers -->
              <div class="grid grid-cols-5 border-b border-white/40">
                {#each ['18:35', '18:40', '18:45', '18:50', '18:55'] as time, ti}
                  <div
                    class="px-4 py-2 number text-center text-white/70 {ti < 4
                      ? 'border-r border-white/40'
                      : ''}"
                  >
                    {time}
                  </div>
                {/each}
              </div>
              <!-- Laugh row -->
              <div class="grid grid-cols-5">
                <div class="px-4 py-3 border-r border-white/40"></div>
                <div class="px-4 py-3 border-r border-white/40 flex justify-center items-center">
                  <div id="text5-icon-1" aria-hidden="true"><Laugh width={30} height={30} color="white" /></div>
                </div>
                <div class="px-4 py-3 border-r border-white/40 flex justify-center items-center">
                  <div id="text5-icon-2" aria-hidden="true"><Laugh width={30} height={30} color="white" /></div>
                </div>
                <div class="px-4 py-3 border-r border-white/40 flex justify-center items-center">
                  <div id="text5-icon-3" aria-hidden="true"><Laugh width={30} height={30} color="white" /></div>
                </div>
                <div class="px-4 py-3 flex justify-center items-center">
                  <div id="text5-icon-4" aria-hidden="true"><Laugh width={30} height={30} color="white" /></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Scroll spacers: one per transition + extra at end -->
  <div id="laughs-step-2" class="h-[100dvh]"></div>
  <div id="laughs-step-3" class="h-[100dvh]"></div>
  <div id="laughs-step-4" class="h-[100dvh]"></div>
  <div id="laughs-step-5" class="h-[100dvh]"></div>
  <div class="h-[100dvh]"></div>
</div>

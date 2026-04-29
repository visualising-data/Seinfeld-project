<script lang="ts">
  import { json } from 'd3-fetch';
  import { onMount, tick } from 'svelte';
  import { inview } from 'svelte-inview';
  // @ts-ignore
  import { gsap } from 'gsap/dist/gsap';
  // @ts-ignore
  import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
  gsap.registerPlugin(ScrollTrigger);

  import { navBarColor } from '../stores/navbarColor';
  import { pendingScrollAnchor, isScrollLoading } from '../stores/scrollAnchor';
  import { lazyLoadAll } from '../stores/lazyLoadTrigger';
  import ScrollLoader from '../UI/ScrollLoader.svelte';
  import SectionProgressBar from '../UI/SectionProgressBar.svelte';
  import { soundAuthModaleIsOpen } from '../stores/soundAuthStore';
  import Navbar from '../UI/Navbar.svelte';
  import Prologue from '../sections/prologue/Prologue.svelte';
  import SoundAuthPopup from '../UI/SoundAuthPopup.svelte';
  import Title from '../sections/Title.svelte';
  import Warning from '../sections/Warning.svelte';
  import TitleTransition from '../sections/TitleTransition.svelte';
  // @ts-ignore
  import Calendar from '../sections/calendar/Calendar.svelte';
  import Quotes from '../sections/quotes/Quotes.svelte';
  import MethodologyAndCredits from '../sections/MethodologyAndCredits.svelte';
  import Footer from '../sections/Footer.svelte';

  // ── Lazy-loaded sections ──────────────────────────────────────────────────
  // Wave 1: loaded when the sentinel after Calendar enters viewport
  let DataGathering: any = null;
  let IntroEnd: any = null;
  // Wave 2: loaded when the sentinel after IntroEnd enters viewport
  let MainCharsSection: any = null;
  let SupportingCharsSection: any = null;
  // Wave 3: loaded when the sentinel after SupportingCharsSection enters viewport
  let LocationsSection: any = null;
  let LaughsExploration: any = null;

  const episodesDataUrl = 'https://amdufour.github.io/hosted-data/apis/episodes_laughs.min.json';

  let episodesData: any = null;

  let soundAuthWasShown = false;
  const showSoundAuth = () => {
    if (!soundAuthWasShown) {
      $soundAuthModaleIsOpen = true;
      soundAuthWasShown = true;
    }
  };
  const EPISODES_CACHE_KEY = 'seinfeld_episodes_v1';

  // Debounce rapid refresh calls (e.g. waves 1+2+3 mounting in quick succession)
  // into a single ScrollTrigger.refresh() so pin spacers are only recalculated once.
  let _refreshTimer: ReturnType<typeof setTimeout> | null = null;
  function scheduleRefresh() {
    if (_refreshTimer) clearTimeout(_refreshTimer);
    _refreshTimer = setTimeout(() => {
      ScrollTrigger.refresh();
      _refreshTimer = null;
    }, 150);
  }

  async function loadWave1() {
    if (DataGathering) return;
    [DataGathering, IntroEnd] = await Promise.all([
      import('../sections/data_gathering/DataGathering.svelte').then((m) => m.default),
      import('../sections/IntroEnd.svelte').then((m) => m.default),
    ]);
    // Wait for Svelte to insert the new sections into the DOM, then tell
    // ScrollTrigger the page height has changed so all pins recalculate.
    await tick();
    scheduleRefresh();
  }

  async function loadWave2() {
    if (MainCharsSection) return;
    [MainCharsSection, SupportingCharsSection] = await Promise.all([
      import('../sections/main_characters/MainCharsSection.svelte').then((m) => m.default),
      import('../sections/supporting_characters/SupportingCharsSection.svelte').then((m) => m.default),
    ]);
    await tick();
    scheduleRefresh();
  }

  async function loadWave3() {
    if (LocationsSection) return;
    [LocationsSection, LaughsExploration] = await Promise.all([
      import('../sections/locations/locationsSection.svelte').then((m) => m.default),
      import('../sections/laughs-exploration/LaughsExploration.svelte').then((m) => m.default),
    ]);
    await tick();
    scheduleRefresh();
  }

  onMount(() => {
    // Load episodes data — use localStorage cache for instant repeat visits
    const cached = localStorage.getItem(EPISODES_CACHE_KEY);
    if (cached) {
      try {
        episodesData = JSON.parse(cached);
      } catch {
        localStorage.removeItem(EPISODES_CACHE_KEY);
      }
    }
    if (!episodesData) {
      json(episodesDataUrl).then((data) => {
        episodesData = data;
        try {
          localStorage.setItem(EPISODES_CACHE_KEY, JSON.stringify(data));
        } catch {
          // Storage quota exceeded — ignore
        }
      });
    }

    // Show sound auth
    ScrollTrigger.create({
      trigger: '#prologue-end',
      start: 'top bottom',
      onEnter: () => showSoundAuth(),
    });

    // Force-load all waves immediately when triggered by menu/sidebar navigation
    const unsubLazy = lazyLoadAll.subscribe(async (shouldLoad) => {
      if (!shouldLoad) return;
      await Promise.all([loadWave1(), loadWave2(), loadWave3()]);
    });

    // If the page loads with a non-zero scroll position (browser scroll restoration
    // or URL hash), the lazy sentinels are already above the viewport and will never
    // fire. Load all waves eagerly so sections are present when scrolling up.
    requestAnimationFrame(() => {
      if (window.scrollY > 0) {
        loadWave1();
        loadWave2();
        loadWave3();
      }
    });

    // Poll for pending scroll target — works across async child mounts
    let scrollPollId: ReturnType<typeof setInterval> | null = null;
    const unsubscribe = pendingScrollAnchor.subscribe((anchor) => {
      if (scrollPollId !== null) {
        clearInterval(scrollPollId);
        scrollPollId = null;
      }
      if (anchor) {
        scrollPollId = setInterval(() => {
          const target = document.getElementById(anchor);
          if (target) {
            clearInterval(scrollPollId!);
            scrollPollId = null;
            // getBoundingClientRect().top + scrollY gives a true document-offset
            // that's correct even when the target is inside a positioned ancestor.
            const targetY = target.getBoundingClientRect().top + window.scrollY;
            window.scrollTo(0, targetY);
            pendingScrollAnchor.set(null);
            isScrollLoading.set(false);
            // iOS defers programmatic scroll rendering asynchronously, so a fixed
            // rAF count can still read the old scrollY. Poll until scrollY is
            // stable for 3 consecutive frames before refreshing ScrollTrigger.
            let lastY = -1;
            let stableCount = 0;
            const waitForSettle = () => {
              const y = window.scrollY;
              if (y === lastY) {
                if (++stableCount >= 3) {
                  ScrollTrigger.refresh();
                  return;
                }
              } else {
                stableCount = 0;
                lastY = y;
              }
              requestAnimationFrame(waitForSettle);
            };
            requestAnimationFrame(waitForSettle);
          }
        }, 50);
      }
    });

    return () => {
      unsubscribe();
      unsubLazy();
      if (scrollPollId !== null) clearInterval(scrollPollId);
    };
  });
</script>

<main>
  <Navbar />
  <SectionProgressBar />
  {#if $isScrollLoading}
    <ScrollLoader />
  {/if}
  <div
    class="text-white"
    use:inview={{}}
    oninview_change={(/** @type {{ detail: { inView: any; }; }} */ event) => {
      const { inView } = event.detail;
      $navBarColor = inView ? 'white' : 'pink';
    }}
  >
    <Prologue />
    {#if $soundAuthModaleIsOpen}
      <SoundAuthPopup />
    {/if}
    <Title />
    <TitleTransition>
      <Warning />
    </TitleTransition>
  </div>
  <div style="background: #F9F5F7; min-height: 100dvh;"></div>
  <div class="text-black" style="background: #F9F5F7;">
    <Calendar {ScrollTrigger} />

    <!-- Wave 1 sentinel: triggers DataGathering + IntroEnd -->
    <div
      id="lazy-load-sentinel"
      use:inview={{ rootMargin: '500px' }}
      oninview_change={async (/** @type {{ detail: { inView: any; }; }} */ event) => {
        if (event.detail.inView) await loadWave1();
      }}
    ></div>

    {#if episodesData && DataGathering && IntroEnd}
      <svelte:component this={DataGathering} {episodesData} {ScrollTrigger} />
      <svelte:component this={IntroEnd} />
      <Quotes />

      <!-- Wave 2 sentinel: triggers MainCharsSection + SupportingCharsSection -->
      <div
        id="lazy-load-sentinel-2"
        use:inview={{ rootMargin: '500px' }}
        oninview_change={async (/** @type {{ detail: { inView: any; }; }} */ event) => {
          if (event.detail.inView) await loadWave2();
        }}
      ></div>

      {#if MainCharsSection && SupportingCharsSection}
        <svelte:component this={MainCharsSection} {episodesData} />
        <svelte:component this={SupportingCharsSection} {episodesData} />

        <!-- Wave 3 sentinel: triggers LocationsSection + LaughsExploration -->
        <div
          id="lazy-load-sentinel-3"
          use:inview={{ rootMargin: '500px' }}
          oninview_change={async (/** @type {{ detail: { inView: any; }; }} */ event) => {
            if (event.detail.inView) await loadWave3();
          }}
        ></div>

        {#if LocationsSection && LaughsExploration}
          <svelte:component this={LocationsSection} {episodesData} />
          <svelte:component this={LaughsExploration} {episodesData} />
          <Quotes />
        {/if}
      {/if}
    {/if}
    <MethodologyAndCredits />
    <Footer />
  </div>
</main>

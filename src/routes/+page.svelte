<script lang="ts">
  import { json } from 'd3-fetch';
  import { onMount, tick } from 'svelte';
  import { inview } from 'svelte-inview';
  // @ts-ignore
  import { gsap } from 'gsap/dist/gsap';
  // @ts-ignore
  import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
  gsap.registerPlugin(ScrollTrigger);
  // Prevent ScrollTrigger from recalculating pin positions when the iOS Chrome
  // toolbar shows/hides (which changes window.innerHeight). Without this, GSAP
  // pins drift up behind the browser URL bar on iPhone.
  ScrollTrigger.config({ ignoreMobileResize: true });

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
  // import MethodologyAndCredits from '../sections/MethodologyAndCredits.svelte';
  // import Footer from '../sections/Footer.svelte';

  // ── Lazy-loaded sections ──────────────────────────────────────────────────
  // Wave 1: loaded when the sentinel after Calendar enters viewport
  let DataGathering: any = null;
  let IntroEnd: any = null;
  // Wave 2: MainCharsSection loaded by sentinel after IntroEnd;
  // SupportingCharsSection loaded by a nested sentinel after MainCharsSection mounts.
  let MainCharsSection: any = null;
  let SupportingCharsSection: any = null;
  // Wave 3: loaded sequentially via nested sentinels after SupportingCharsSection
  let LocationsSection: any = null;
  let LaughsExploration: any = null;
  let MethodologyAndCredits: any = null;
  let Footer: any = null;

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
    MainCharsSection = await import('../sections/main_characters/MainCharsSection.svelte').then(
      (m) => m.default,
    );
    await tick();
    scheduleRefresh();
  }

  async function loadSupportingChars() {
    if (SupportingCharsSection) return;
    SupportingCharsSection = await import(
      '../sections/supporting_characters/SupportingCharsSection.svelte'
    ).then((m) => m.default);
    await tick();
    scheduleRefresh();
  }

  async function loadLocations() {
    if (LocationsSection) return;
    LocationsSection = await import('../sections/locations/locationsSection.svelte').then(
      (m) => m.default,
    );
    await tick();
    scheduleRefresh();
  }

  async function loadLaughsExploration() {
    if (LaughsExploration) return;
    LaughsExploration = await import(
      '../sections/laughs-exploration/LaughsExploration.svelte'
    ).then((m) => m.default);
    await tick();
    scheduleRefresh();
  }

  async function loadMethodology() {
    if (MethodologyAndCredits) return;
    [MethodologyAndCredits, Footer] = await Promise.all([
      import('../sections/MethodologyAndCredits.svelte').then((m) => m.default),
      import('../sections/Footer.svelte').then((m) => m.default),
    ]);
    await tick();
    scheduleRefresh();
  }

  onMount(() => {
    // Track the iOS Chrome URL-bar offset via the Visual Viewport API and expose
    // it as --vv-top on :root. Sticky sections use `top: var(--vv-top, 0px)`
    // so they always anchor to the bottom of the URL bar, not behind it.
    const setVvTop = () => {
      const offset = window.visualViewport?.offsetTop ?? 0;
      document.documentElement.style.setProperty('--vv-top', `${offset}px`);
    };
    setVvTop();
    window.visualViewport?.addEventListener('resize', setVvTop);
    window.visualViewport?.addEventListener('scroll', setVvTop);

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
      trigger: '#video-scroll-container',
      start: 'top bottom',
      onEnter: () => showSoundAuth(),
    });

    // Force-load all waves immediately when triggered by menu/sidebar navigation
    const unsubLazy = lazyLoadAll.subscribe(async (shouldLoad) => {
      if (!shouldLoad) return;
      await Promise.all([loadWave1(), loadWave2(), loadSupportingChars(), loadLocations(), loadLaughsExploration(), loadMethodology()]);
    });

    // If the page loads with a non-zero scroll position (browser scroll restoration
    // or URL hash), the lazy sentinels are already above the viewport and will never
    // fire. Load all waves eagerly so sections are present when scrolling up.
    requestAnimationFrame(() => {
      if (window.scrollY > 0) {
        loadWave1();
        loadWave2();
        loadSupportingChars();
        loadLocations();
        loadLaughsExploration();
        loadMethodology();
      }
    });

    // On viewport resize (e.g. going fullscreen), GSAP recalculates pin spacers
    // which shifts all section positions. Capture the nearest section anchor
    // before the layout changes, then scroll back to it after refresh.
    const SECTION_ANCHORS = [
      'intro',
      'intro-calendar-container',
      'catalog-section',
      'lead-chars',
      'supporting-chars',
      'locations',
      'laughs-exploration',
      'methodology',
    ];
    let _resizeAnchorId: string | null = null;
    let _resizeDebounce: ReturnType<typeof setTimeout> | null = null;
    let _prevWidth = window.innerWidth;

    const onResize = () => {
      const newWidth = window.innerWidth;
      // Ignore height-only changes (e.g. iOS URL bar hiding/showing)
      if (newWidth === _prevWidth) return;
      _prevWidth = newWidth;

      // Snapshot the closest section on the first resize event in a sequence
      if (_resizeAnchorId === null) {
        let bestId: string | null = null;
        let bestDist = Infinity;
        for (const id of SECTION_ANCHORS) {
          const el = document.getElementById(id);
          if (!el) continue;
          const dist = Math.abs(el.getBoundingClientRect().top);
          if (dist < bestDist) {
            bestDist = dist;
            bestId = id;
          }
        }
        _resizeAnchorId = bestId;
      }

      if (_resizeDebounce) clearTimeout(_resizeDebounce);
      _resizeDebounce = setTimeout(() => {
        ScrollTrigger.refresh();
        if (_resizeAnchorId) {
          const el = document.getElementById(_resizeAnchorId);
          if (el) {
            window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY);
          }
        }
        _resizeAnchorId = null;
        _resizeDebounce = null;
      }, 200);
    };

    window.addEventListener('resize', onResize);

    // Poll for pending scroll target — works across async child mounts
    let scrollPollId: ReturnType<typeof setInterval> | null = null;
    const unsubscribe = pendingScrollAnchor.subscribe((anchor) => {
      if (scrollPollId !== null) {
        clearInterval(scrollPollId);
        scrollPollId = null;
      }
      if (anchor) {
        // Safety timeout: if the target element never mounts (e.g. a section that
        // is currently disabled), bail out after 5 s so the loader doesn't hang forever.
        const pollTimeout = setTimeout(() => {
          if (scrollPollId !== null) {
            clearInterval(scrollPollId);
            scrollPollId = null;
          }
          pendingScrollAnchor.set(null);
          isScrollLoading.set(false);
        }, 5000);

        scrollPollId = setInterval(() => {
          const target = document.getElementById(anchor);
          if (target) {
            clearTimeout(pollTimeout);
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
                  // After refresh, GSAP recalculates pin spacers (e.g. Calendar),
                  // which shifts content. Re-scroll to the target so we land correctly.
                  const reTarget = document.getElementById(anchor);
                  if (reTarget) {
                    const newY = reTarget.getBoundingClientRect().top + window.scrollY;
                    window.scrollTo(0, newY);
                  }
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
      window.removeEventListener('resize', onResize);
      if (_resizeDebounce) clearTimeout(_resizeDebounce);
      window.visualViewport?.removeEventListener('resize', setVvTop);
      window.visualViewport?.removeEventListener('scroll', setVvTop);
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
      use:inview={{ rootMargin: '2000px' }}
      oninview_change={async (/** @type {{ detail: { inView: any; }; }} */ event) => {
        if (event.detail.inView) await loadWave1();
      }}
    ></div>

    {#if episodesData && DataGathering && IntroEnd}
      <svelte:component this={DataGathering} {episodesData} {ScrollTrigger} />
      <svelte:component this={IntroEnd} />
      <Quotes />

      <!-- Wave 2 sentinel: loads MainCharsSection -->
      <div
        id="lazy-load-sentinel-2"
        use:inview={{ rootMargin: '2000px' }}
        oninview_change={async (/** @type {{ detail: { inView: any; }; }} */ event) => {
          if (event.detail.inView) await loadWave2();
        }}
      ></div>

      {#if MainCharsSection}
        <svelte:component this={MainCharsSection} {episodesData} {ScrollTrigger} />

        <!-- Supporting chars sentinel: loads SupportingCharsSection -->
        <div
          use:inview={{ rootMargin: '1000px' }}
          oninview_change={async (/** @type {{ detail: { inView: any; }; }} */ event) => {
            if (event.detail.inView) await loadSupportingChars();
          }}
        ></div>

        {#if SupportingCharsSection}
          <svelte:component this={SupportingCharsSection} {episodesData} {ScrollTrigger} />

          <!-- Wave 3a sentinel: loads LocationsSection -->
          <div
            use:inview={{ rootMargin: '1000px' }}
            oninview_change={async (/** @type {{ detail: { inView: any; }; }} */ event) => {
              if (event.detail.inView) await loadLocations();
            }}
          ></div>

          {#if LocationsSection}
            <svelte:component this={LocationsSection} {episodesData} {ScrollTrigger} />

            <!-- Wave 3b sentinel: loads LaughsExploration -->
            <div
              use:inview={{ rootMargin: '1000px' }}
              oninview_change={async (/** @type {{ detail: { inView: any; }; }} */ event) => {
                if (event.detail.inView) await loadLaughsExploration();
              }}
            ></div>

            {#if LaughsExploration}
              <svelte:component this={LaughsExploration} {episodesData} />

              <!-- Wave 3c sentinel: loads MethodologyAndCredits + Footer -->
              <div
                use:inview={{ rootMargin: '1000px' }}
                oninview_change={async (/** @type {{ detail: { inView: any; }; }} */ event) => {
                  if (event.detail.inView) await loadMethodology();
                }}
              ></div>

              {#if MethodologyAndCredits && Footer}
                <Quotes />
                <svelte:component this={MethodologyAndCredits} />
                <svelte:component this={Footer} />
              {/if}
            {/if}
          {/if}
        {/if}
      {/if}
    {/if}
  </div>
</main>

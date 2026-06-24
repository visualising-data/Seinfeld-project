<script lang="ts">
  import { json } from 'd3-fetch';
  import { onMount, tick } from 'svelte';
  import { get } from 'svelte/store';
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
  import { pendingScrollAnchor, isScrollLoading, navigationAnchor } from '../stores/scrollAnchor';
  import { lazyLoadAll } from '../stores/lazyLoadTrigger';
  import ScrollLoader from '../UI/ScrollLoader.svelte';
  import SectionProgressBar from '../UI/SectionProgressBar.svelte';
  import { soundAuthModaleIsOpen } from '../stores/soundAuthStore';
  import Navbar from '../UI/Navbar.svelte';
  import Prologue from '../sections/prologue/Prologue.svelte';
  import SoundAuthPopup from '../UI/SoundAuthPopup.svelte';
  import Title from '../sections/Title.svelte';
  import Warning from '../sections/Warning.svelte';
  import Definition from '../sections/Definition.svelte';
  // @ts-ignore
  import Calendar from '../sections/calendar/Calendar.svelte';
  import DVDSet from '../sections/DVDSet.svelte';
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
  let WhatHaveWeLearned: any = null;
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
      _refreshTimer = null;
      if (window.matchMedia('(max-width: 1023px)').matches) return;
      ScrollTrigger.refresh();
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
    SupportingCharsSection =
      await import('../sections/supporting_characters/SupportingCharsSection.svelte').then(
        (m) => m.default,
      );
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
    LaughsExploration =
      await import('../sections/laughs-exploration/LaughsExploration.svelte').then(
        (m) => m.default,
      );
    await tick();
    scheduleRefresh();
  }

  async function loadMethodology() {
    if (MethodologyAndCredits) return;
    [WhatHaveWeLearned, MethodologyAndCredits, Footer] = await Promise.all([
      import('../sections/WhatHaveWeLearned.svelte').then((m) => m.default),
      import('../sections/MethodologyAndCredits.svelte').then((m) => m.default),
      import('../sections/Footer.svelte').then((m) => m.default),
    ]);
    await tick();
    scheduleRefresh();
  }

  // Maps each navigable anchor to the minimum number of outer waves that must be
  // loaded for that section's element to exist in the DOM. Unknown anchors default
  // to 6 (full load) so nothing gets silently skipped.
  const ANCHOR_WAVE_LEVEL: Record<string, number> = {
    'bridge-to-catalog': 1,
    'data-gathering': 1,
    'lead-chars': 2,
    'supporting-chars': 3,
    'locations': 4,
    'laughs-exploration': 5,
    'methodology': 6,
  };

  // Loads outer waves in strict order — each wave renders inside the previous
  // wave's DOM condition, so they must be awaited sequentially.
  async function loadWavesUpToAnchor(anchor: string | null) {
    const level = anchor ? (ANCHOR_WAVE_LEVEL[anchor] ?? 6) : 6;
    if (level >= 1) await loadWave1();
    if (level >= 2) await loadWave2();
    if (level >= 3) await loadSupportingChars();
    if (level >= 4) await loadLocations();
    if (level >= 5) await loadLaughsExploration();
    if (level >= 6) await loadMethodology();
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
    let lazyTriggered = false;
    const unsubLazy = lazyLoadAll.subscribe(async (shouldLoad) => {
      if (!shouldLoad) return;
      lazyTriggered = true;
      if (window.matchMedia('(max-width: 1023px)').matches) {
        // Mobile: load only the outer waves needed to reach the target anchor.
        // Sub-sections within each wave load naturally via sentinels as the user
        // scrolls. This prevents OOM from mounting 20+ heavy chart components.
        await loadWavesUpToAnchor(get(pendingScrollAnchor));
      } else {
        await Promise.all([
          loadWave1(),
          loadWave2(),
          loadSupportingChars(),
          loadLocations(),
          loadLaughsExploration(),
          loadMethodology(),
        ]);
      }
    });

    // If the page loads with a non-zero scroll position (browser scroll restoration
    // or URL hash), the lazy sentinels are already above the viewport and will never
    // fire. On desktop, load all waves eagerly so sections are present when scrolling up.
    // On mobile, skip — all-at-once loading causes OOM; sentinels fire as the user scrolls.
    requestAnimationFrame(() => {
      if (window.scrollY > 0 && !window.matchMedia('(max-width: 1023px)').matches) {
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
      'title-screen',
      'intro',
      'intro-calendar-container',
      'episodes',
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
        if (!window.matchMedia('(max-width: 1023px)').matches) ScrollTrigger.refresh();
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
        // is currently disabled), bail out after 10 s so the loader doesn't hang forever.
        const pollTimeout = setTimeout(() => {
          if (scrollPollId !== null) {
            clearInterval(scrollPollId);
            scrollPollId = null;
          }
          pendingScrollAnchor.set(null);
          isScrollLoading.set(false);
        }, 10000);

        scrollPollId = setInterval(() => {
          const target = document.getElementById(anchor);
          // When lazy loading was triggered, wait for all sections (Footer is last)
          // before scrolling; otherwise GSAP pin spacers shift mid-flight and we
          // land at the wrong position.
          const onMobile = window.matchMedia('(max-width: 1023px)').matches;
          const allLoaded = !lazyTriggered || onMobile || Footer !== null;
          if (target && allLoaded) {
            clearTimeout(pollTimeout);
            clearInterval(scrollPollId!);
            scrollPollId = null;

            if (lazyTriggered) {
              if (_refreshTimer) {
                clearTimeout(_refreshTimer);
                _refreshTimer = null;
              }
              if (!onMobile) {
                // Desktop: refresh GSAP to recalculate pin spacers before scrolling.
                ScrollTrigger.refresh();
              }
              const scrollTarget = document.getElementById(anchor) ?? target;
              const targetY = scrollTarget.getBoundingClientRect().top + window.scrollY;
              window.scrollTo(0, targetY);
              pendingScrollAnchor.set(null);
              if (!onMobile) {
                // Expose the anchor so child-section scheduleRefresh() calls can
                // re-scroll to its updated position after pin spacers are resized.
                navigationAnchor.set(anchor);
              }
              // Keep isScrollLoading true — the loader stays on screen until child
              // sections finish their own lazy loads (which cause layout shifts and
              // GSAP scroll-restoration jumps). Only hide it once the layout is stable.

              // Child sections (SupportingChars, Locations…) have their own nested
              // lazy loaders. When we jump to the target, their inview sentinels fire,
              // loading sub-components. Their scheduleRefresh() calls ScrollTrigger.refresh()
              // ~150 ms later — GSAP saves scrollY, scrolls to 0, recalculates spacers,
              // then restores to the saved scrollY. But the page is now taller, so the
              // saved scrollY lands us in the wrong section.
              // ResizeObserver catches each layout change and re-scrolls using
              // BCR.top + scrollY (= element's absolute document position, always correct).
              // The loader is hidden only after the layout stays stable for STABLE_MS.
              const STABLE_MS = 600;
              let resizeDebounce: ReturnType<typeof setTimeout> | null = null;
              let loaderHideTimer: ReturnType<typeof setTimeout> | null = null;
              let bodyObserver: ResizeObserver | null = null;
              let hardTimeout: ReturnType<typeof setTimeout> | null = null;

              const stopBodyObserver = () => {
                if (hardTimeout) { clearTimeout(hardTimeout); hardTimeout = null; }
                bodyObserver?.disconnect();
                bodyObserver = null;
                if (resizeDebounce) {
                  clearTimeout(resizeDebounce);
                  resizeDebounce = null;
                }
                if (loaderHideTimer) {
                  clearTimeout(loaderHideTimer);
                  loaderHideTimer = null;
                }
                // One final re-scroll while the loader still covers the screen,
                // to correct any drift from sub-section mounts. Avoid calling
                // ScrollTrigger.refresh() here — on low-end mobile it's expensive
                // enough to crash the tab. The poll's earlier explicit refresh
                // already handled spacers; child-section refreshes are deferred
                // via the isScrollLoading guard in their scheduleRefresh().
                requestAnimationFrame(() => {
                  const finalTarget = document.getElementById(anchor);
                  if (finalTarget) {
                    window.scrollTo(0, finalTarget.getBoundingClientRect().top + window.scrollY);
                  }
                  isScrollLoading.set(false);
                  // Keep navigationAnchor set so late-loading sub-sections can
                  // still correct scroll drift after a GSAP refresh. Clear it
                  // on first user scroll interaction, or after 5 s at most.
                  const clearNavAnchor = () => {
                    navigationAnchor.set(null);
                    window.removeEventListener('touchstart', clearNavAnchor, true);
                    window.removeEventListener('wheel', clearNavAnchor, true);
                  };
                  setTimeout(clearNavAnchor, 5000);
                  // Small delay before listening so loader close animation doesn't
                  // immediately trigger a touchstart that clears the anchor.
                  setTimeout(() => {
                    window.addEventListener('touchstart', clearNavAnchor, { capture: true });
                    window.addEventListener('wheel', clearNavAnchor, { capture: true });
                  }, 300);
                });
              };

              const scheduleLoaderHide = () => {
                if (loaderHideTimer) clearTimeout(loaderHideTimer);
                loaderHideTimer = setTimeout(() => {
                  loaderHideTimer = null;
                  // Disconnect observer so later body resizes (from user-triggered lazy
                  // loads as they scroll) don't re-scroll them back to the anchor.
                  stopBodyObserver();
                }, STABLE_MS);
              };

              bodyObserver = new ResizeObserver(() => {
                // New content loaded — cancel pending loader-hide and debounce re-scroll.
                if (loaderHideTimer) {
                  clearTimeout(loaderHideTimer);
                  loaderHideTimer = null;
                }
                if (resizeDebounce) clearTimeout(resizeDebounce);
                resizeDebounce = setTimeout(() => {
                  resizeDebounce = null;
                  // Desktop only: re-scroll to anchor on each sub-section mount.
                  // GSAP pin spacers shift absolute positions on desktop; the mobile
                  // layout has no pins so intermediate re-scrolls are unnecessary —
                  // they cause the scroll-back bug when sub-components mount after
                  // the loader hides. stopBodyObserver's final rAF scroll lands the
                  // user at the correct position once everything has settled.
                  if (!onMobile) {
                    const reTarget = document.getElementById(anchor);
                    if (reTarget) {
                      window.scrollTo(0, reTarget.getBoundingClientRect().top + window.scrollY);
                    }
                  }
                  // Schedule loader hide — if no more resizes arrive, we're settled.
                  scheduleLoaderHide();
                }, 300);
              });
              bodyObserver.observe(document.body);
              // Fallback: if no child resize fires, hide loader after STABLE_MS.
              scheduleLoaderHide();
              // Hard timeout: give up after 8 s.
              hardTimeout = setTimeout(stopBodyObserver, 8000);
            } else {
              // Non-lazy path: target already in DOM, scroll immediately.
              const targetY = target.getBoundingClientRect().top + window.scrollY;
              window.scrollTo(0, targetY);
              pendingScrollAnchor.set(null);
              isScrollLoading.set(false);
              if (!onMobile) {
                // Desktop: wait for scroll to settle, then refresh pin spacers and re-scroll.
                let lastY = -1;
                let stableCount = 0;
                const waitForSettle = () => {
                  const y = window.scrollY;
                  if (y === lastY) {
                    if (++stableCount >= 3) {
                      ScrollTrigger.refresh();
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
            }
          }
        }, 50);
      }
    });

    // Handle an initial URL hash (e.g. /#episodes). The target section is almost
    // always lazy-loaded and not yet in the DOM on first paint, so the browser's
    // native anchor jump finds nothing and leaves us at the top. Feed the hash
    // into the same pendingScrollAnchor flow the menu uses: set the anchor, and
    // if its element isn't mounted yet, show the loader and force all waves to load.
    const initialHash = decodeURIComponent(window.location.hash.slice(1));
    if (initialHash) {
      pendingScrollAnchor.set(initialHash);
      if (!document.getElementById(initialHash)) {
        isScrollLoading.set(true);
        lazyLoadAll.set(true);
      }
    }

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

<main id="main-content">
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
    <Prologue {scheduleRefresh} />
    {#if $soundAuthModaleIsOpen}
      <SoundAuthPopup />
    {/if}
    <Title />
  </div>
  <Definition />
  <Warning />
  <div class="text-black" style="background: #F9F5F7;">
    <Calendar {ScrollTrigger} />
    <DVDSet />

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
      <!-- <Quotes /> -->

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
            if (event.detail.inView && !get(isScrollLoading)) await loadSupportingChars();
          }}
        ></div>

        {#if SupportingCharsSection}
          <svelte:component this={SupportingCharsSection} {episodesData} {ScrollTrigger} />

          <!-- Wave 3a sentinel: loads LocationsSection -->
          <div
            use:inview={{ rootMargin: '1000px' }}
            oninview_change={async (/** @type {{ detail: { inView: any; }; }} */ event) => {
              if (event.detail.inView && !get(isScrollLoading)) await loadLocations();
            }}
          ></div>

          {#if LocationsSection}
            <svelte:component this={LocationsSection} {episodesData} {ScrollTrigger} />

            <!-- Wave 3b sentinel: loads LaughsExploration -->
            <div
              use:inview={{ rootMargin: '1000px' }}
              oninview_change={async (/** @type {{ detail: { inView: any; }; }} */ event) => {
                if (event.detail.inView && !get(isScrollLoading)) await loadLaughsExploration();
              }}
            ></div>

            {#if LaughsExploration}
              <svelte:component this={LaughsExploration} {episodesData} />

              <!-- Wave 3c sentinel: loads MethodologyAndCredits + Footer -->
              <div
                use:inview={{ rootMargin: '1000px' }}
                oninview_change={async (/** @type {{ detail: { inView: any; }; }} */ event) => {
                  if (event.detail.inView && !get(isScrollLoading)) await loadMethodology();
                }}
              ></div>

              {#if WhatHaveWeLearned && MethodologyAndCredits && Footer}
                <svelte:component this={WhatHaveWeLearned} />
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

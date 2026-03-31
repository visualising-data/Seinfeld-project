<script lang="ts">
  import { json } from 'd3-fetch';
  import { onMount } from 'svelte';
  import { inview } from 'svelte-inview';
  // @ts-ignore
  import { gsap } from 'gsap/dist/gsap';
  // @ts-ignore
  import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
  gsap.registerPlugin(ScrollTrigger);

  import { navBarColor } from '../stores/navbarColor';
  import { pendingScrollAnchor, isScrollLoading } from '../stores/scrollAnchor';
  import ScrollLoader from '../UI/ScrollLoader.svelte';
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
  import MainCharsSection from '../sections/main_characters/MainCharsSection.svelte';
  import SupportingCharsSection from '../sections/supporting_characters/SupportingCharsSection.svelte';
  import LocationsSection from '../sections/locations/locationsSection.svelte';

  // Lazy-loaded sections — imported dynamically when sentinel enters viewport
  let DataGathering: any = null;
  let IntroEnd: any = null;

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
            target.scrollIntoView({ behavior: 'instant' });
            pendingScrollAnchor.set(null);
            isScrollLoading.set(false);
            ScrollTrigger.refresh();
          }
        }, 50);
      }
    });

    return () => {
      unsubscribe();
      if (scrollPollId !== null) clearInterval(scrollPollId);
    };
  });

  const showOnlyLatest = false;
</script>

<main>
  <Navbar />
  {#if $isScrollLoading}
    <ScrollLoader />
  {/if}
  {#if showOnlyLatest}
    {#if episodesData && DataGathering && IntroEnd}
      <div class="bg-white text-black">
        <svelte:component this={DataGathering} {episodesData} {ScrollTrigger} />
        <svelte:component this={IntroEnd} />
      </div>
    {/if}
  {:else}
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
      <div
        id="lazy-load-sentinel"
        use:inview={{ rootMargin: '500px' }}
        oninview_change={async (/** @type {{ detail: { inView: any; }; }} */ event) => {
          if (event.detail.inView && !DataGathering) {
            [DataGathering, IntroEnd] = await Promise.all([
              import('../sections/data_gathering/DataGathering.svelte').then((m) => m.default),
              import('../sections/IntroEnd.svelte').then((m) => m.default),
            ]);
          }
        }}
      ></div>
      {#if episodesData && DataGathering && IntroEnd}
        <svelte:component this={DataGathering} {episodesData} {ScrollTrigger} />
        <svelte:component this={IntroEnd} />
        <Quotes />
        <MainCharsSection {episodesData} />
        <SupportingCharsSection {episodesData} />
        <LocationsSection {episodesData} />
        <!-- <LaughsExploration {episodesData} /> -->
      {/if}
      <!-- <Quotes /> -->
      <!-- <MethodologyAndCredits /> -->
      <!-- <Footer /> -->
    </div>
  {/if}
</main>

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
  // @ts-ignore
  import DataGathering from '../sections/data_gathering/DataGathering.svelte';
  import IntroEnd from '../sections/IntroEnd.svelte';
  import Quotes from '../sections/quotes/Quotes.svelte';
  // @ts-ignore
  import MainCharsSection from '../sections/main_characters/MainCharsSection.svelte';
  // @ts-ignore
  import SupportingCharsSection from '../sections/supporting_characters/SupportingCharsSection.svelte';
  // @ts-ignore
  import LocationsSection from '../sections/locations/locationsSection.svelte';
  // @ts-ignore
  import LaughsExploration from '../sections/laughs-exploration/LaughsExploration.svelte';
  import MethodologyAndCredits from '../sections/MethodologyAndCredits.svelte';
  import Footer from '../sections/Footer.svelte';

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
    <IntroEnd />
    <Quotes />
    {#if episodesData}
      <DataGathering {episodesData} {ScrollTrigger} />
      <MainCharsSection {episodesData} />
      <SupportingCharsSection {episodesData} />
      <LocationsSection {episodesData} />
      <LaughsExploration {episodesData} />
      <Quotes />
    {/if}
    <MethodologyAndCredits />
    <Footer />
  </div>
</main>

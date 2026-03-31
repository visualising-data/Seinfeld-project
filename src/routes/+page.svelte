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
  onMount(async () => {
    // Fetch episodes data client-side only
    episodesData = await json(episodesDataUrl);

    // Show sound auth
    ScrollTrigger.create({
      trigger: '#prologue-end',
      start: 'top bottom',
      onEnter: () => showSoundAuth(),
    });
  });

  const showOnlyLatest = false;
</script>

<main>
  <Navbar />
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

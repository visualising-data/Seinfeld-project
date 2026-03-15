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
  import DataGathering from '../sections/data_gathering/DataGathering.svelte';
  import IntroEnd from '../sections/IntroEnd.svelte';
  // Other sections are commented out — re-add imports when re-enabling each one.
  // Use dynamic imports + svelte-inview sentinel to lazy-load on scroll:
  // e.g. Calendar = (await import('../sections/calendar/Calendar.svelte')).default
  import Warning from '../sections/Warning.svelte';
  import TitleTransition from '../sections/TitleTransition.svelte';

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
    {#if episodesData}
      <div class="bg-white text-black">
        <DataGathering {episodesData} {ScrollTrigger} />
        <IntroEnd />
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
    <!-- <div class="bg-white text-black">
      <Calendar {ScrollTrigger} />
      {#if episodesData}
        <DataGathering {episodesData} {ScrollTrigger} />
        <IntroEnd />
        <Quotes />
        <MainCharsSection {episodesData} />
        <SupportingCharsSection {episodesData} />
        <LocationsSection {episodesData} />
        <LaughsExploration {episodesData} />
      {/if}
      <Quotes />
      <MethodologyAndCredits />
      <Footer />
    </div> -->
  {/if}
</main>

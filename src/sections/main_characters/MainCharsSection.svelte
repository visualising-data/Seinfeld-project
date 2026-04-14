<script>
  import SectionTitle from '../SectionTitle.svelte';
  import Marimekko from './Marimekko.svelte';
  import PeakPerformances from './PeakPerformances.svelte';
  import Intro from './Intro.svelte';
  import ScreenTimeVsLaughRate from '../ScreenTimeVsLaughRate/ScreenTimeVsLaughRate.svelte';
  let { episodesData } = $props();
</script>

<section id="lead-chars">
  <div class="bg-black">
    <SectionTitle section="main_char" title="Lead Characters" />
  </div>
  <Intro />
  <ScreenTimeVsLaughRate {episodesData} currentSection="main_chars" />
  <Marimekko />
  <PeakPerformances />
</section>

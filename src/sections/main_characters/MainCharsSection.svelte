<script>
	import Lazy from 'svelte-lazy';
	import SectionTitle from '../SectionTitle.svelte';
	import Marimekko from './Marimekko.svelte';
	import PeakPerformances from './PeakPerformances.svelte';
	import Intro from './Intro.svelte';
	import ScreenTimeVsLaughRate from './ScreenTimeVsLaughRate.svelte';
	import CombinedPerformances from './CombinedPerformances.svelte';

	let { episodesData } = $props();
</script>

<section id="lead-chars">
	<!-- <Lazy keep={true} height="100vh" offset="100vh"> -->
		<div class="bg-black">
			<SectionTitle section="main_char" title="Lead Characters" />
		</div>
	<!-- </Lazy> -->
	<Intro/>
	<ScreenTimeVsLaughRate {episodesData} currentSection="main_chars" />
	<Marimekko />
	<PeakPerformances />
	<!-- TODO: Lazy load pr perform calc on worker? -->
	<!-- <CombinedPerformances {episodesData} /> -->
</section>

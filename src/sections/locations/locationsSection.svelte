<script>
	import Lazy from 'svelte-lazy';
	import SectionTitle from '../SectionTitle.svelte';
	import Intro from './Intro.svelte';
	import Marimekko from './Marimekko.svelte';
	import ScreenTimeVsLaughRate from '../supporting_characters/ScreenTimeVsLaughRate.svelte';

	let { episodesData } = $props();
</script>

<section id="locations">
	<!-- <Lazy keep={true} height="100vh" offset="100vh"> -->
		<div class="bg-black">
			<SectionTitle section="locations" title="Locations" />
		</div>
	<!-- </Lazy> -->
	<Intro />
	<ScreenTimeVsLaughRate {episodesData} currentSection="locations" />
	<Marimekko />
</section>

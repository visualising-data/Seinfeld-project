<script>
	import Lazy from 'svelte-lazy';
	import SectionTitle from '../SectionTitle.svelte';
	import Intro from './Intro.svelte';
	import ScreenTimeVsLaughRate from './ScreenTimeVsLaughRate.svelte';
	import Marimekko from './Marimekko.svelte';

	let { episodesData } = $props();
</script>

<section id="supporting-chars">
	<!-- <Lazy keep={true} height="100vh" offset="100vh"> -->
		<div class="bg-black">
			<SectionTitle section="supp_char" title="Supporting Characters" />
		</div>
	<!-- </Lazy> -->
	<Intro />
	<ScreenTimeVsLaughRate {episodesData} currentSection="supporting_chars" />
	<Marimekko />
</section>

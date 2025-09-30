<script>
	import PrologueLateArrival from './PrologueLateArrival.svelte';
	import PrologueTimeline from './PrologueTimeline.svelte';
	import PrologueTheShow from './PrologueTheShow.svelte';
	import PrologueVideo from './PrologueVideo.svelte';
	import PrologueRythmAndTexture from './PrologueRythmAndTexture.svelte';
	import PrologueBook from './PrologueBook.svelte';

	let { ScrollTrigger } = $props();
</script>

<section id="intro">
	<PrologueLateArrival />
	<PrologueTimeline {ScrollTrigger} />
	<PrologueVideo />
	<PrologueTheShow />
	<PrologueRythmAndTexture {ScrollTrigger} />
	<PrologueBook {ScrollTrigger} />
</section>

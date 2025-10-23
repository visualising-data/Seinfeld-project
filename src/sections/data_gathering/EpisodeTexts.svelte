<script>
	import { inview } from 'svelte-inview';
	export let episodeStepChange;

	const options = {};
</script>

<!-- Text 1 -->
<div
	class="flex w-screen items-center justify-center"
	style="height: calc(150vh + 260px);"
>
	<div class="text-overlay" use:inview={options} oninview_enter={() => episodeStepChange(1)}>
		Let’s take <span class="em">The Marine Biologist</span>, episode 14 of Season 5, as a worked
		example.
	</div>
</div>

<!-- Text 2 -->
<div class="flex h-screen w-screen items-center justify-center">
	<div class="text-overlay" use:inview={options} oninview_enter={() => episodeStepChange(2)}>
		This episode has a duration of about 21m45s.
	</div>
</div>

<!-- Text 3 -->
<div class="flex h-screen w-screen items-center justify-center">
	<div class="text-overlay" use:inview={options} oninview_enter={() => episodeStepChange(3)}>
		Across every sequential block of 5 seconds, we recorded the moments of <span class="highlight">laughter</span> heard from the
		studio audience.
	</div>
</div>

<!-- Text 4 -->
<div class="flex h-screen w-screen items-center justify-center">
	<div class="text-overlay" use:inview={options} oninview_enter={() => episodeStepChange(4)}>
		We also recorded the number of discrete <span class="highlight">scenes</span>, when they started, finished, and their duration.
	</div>
</div>

<!-- Text 5 -->
<div class="flex h-screen w-screen items-center justify-center">
	<div class="text-overlay" use:inview={options} oninview_enter={() => episodeStepChange(5)}>
		We recorded which <span class="highlight">characters</span> were present and active on screen and when.
	</div>
</div>

<!-- Text 6 -->
<div class="flex h-screen w-screen items-center justify-center">
	<div class="text-overlay" use:inview={options} oninview_enter={() => episodeStepChange(6)}>
		We logged which <span class="highlight">characters caused</span> each moment of audience laughter.
	</div>
</div>

<!-- Text 7 -->
<div class="flex h-screen w-screen items-center justify-center">
	<div class="text-overlay" use:inview={options} oninview_enter={() => episodeStepChange(7)}>
		We also categorised the specific or type of <span class="highlight">location</span> in which each scene was taking place.
	</div>
</div>

<!-- Text 8 -->
<div class="flex h-screen w-screen items-center justify-center">
	<div id="episode-example-text-8" class="text-overlay" use:inview={options} oninview_enter={() => episodeStepChange(8)}>
		<p>We repeated this visualisation approach for each of the <span class="em highlight">176 original episodes</span>  - ie. those that were written, discounting any clip/highlight shows.</p> 
		<p>You’ll be able to see and explore them later, as well as hearing the translation of the data patterns into sound representation or ‘sonification’.</p> 
	</div>
</div>

<div class="flex h-screen w-screen items-center justify-center"></div>

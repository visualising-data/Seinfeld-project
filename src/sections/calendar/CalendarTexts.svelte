<script>
	import { inview } from 'svelte-inview';
	export let showEpisodes;

	const options = {};
</script>

<!-- Text 1 -->
<div
	class="flex w-screen items-center justify-center"
	style="height: calc(150vh + 260px); padding-top: calc(50vh + 260px);"
>
	<div class="text-overlay" use:inview={options} oninview_enter={() => showEpisodes(1)}>
		Let’s go back to the start. Seinfeld aired on US TV for the first time on Wednesday 5th July
		1989, with a pilot episode titled <span class="em">Good News, Bad News</span> (it was also known
		as The Seinfeld Chronicles, the inspiration for the title of this project).
	</div>
</div>

<!-- Text 2 -->
<div class="flex h-screen w-screen items-center justify-center">
	<div class="text-overlay" use:inview={options} oninview_enter={() => showEpisodes(2)}>
		Though it was watched by 15.4M viewers, the early reviews were mixed - test audiences hated, TV
		critics liked it - so its future was initially uncertain. However, thanks to the perseverance
		and persuasion of NBC executive Rick Ludwin, four more episodes were belatedly ordered to
		complete the unusually short first season.
	</div>
</div>

<!-- Text 3 -->
<div class="flex h-screen w-screen items-center justify-center">
	<div class="text-overlay" use:inview={options} oninview_enter={() => showEpisodes(3)}>
		This opening season belatedly wrapped a year later, in the summer of 1990, and was received with
		healthy ratings from critics and audiences alike. This response was positive enough to convince
		NBC to commission a second season, this time comprising 12 episodes.
	</div>
</div>

<!-- Text 4 -->
<div class="flex h-screen w-screen items-center justify-center">
	<div class="text-overlay" use:inview={options} oninview_enter={() => showEpisodes(4)}>
		Despite a slightly rocky start with Season Two, critical reviews and audience ratings continued
		to improve giving NBC reason to not only green-light a third season but to move the show into
		the sought-after Fall schedule, where buzz, anticipation, and advertising revenues peak.
	</div>
</div>

<!-- Text 5 -->
<div class="flex h-screen w-screen items-center justify-center">
	<div class="text-overlay" use:inview={options} oninview_enter={() => showEpisodes(5)}>
		Towards the middle of Season Four the show was moved to Thursdays, straight after Cheers, in the
		most popular prime-time slot. When the final episode was broadcast, on 14th May 1998, it brought
		to an end <span class="em">nine seasons</span> and a total of
		<span class="em">176 episodes</span> (plus four specials).
	</div>
</div>

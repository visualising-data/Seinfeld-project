<script>
	import Characters from './characters/Characters.svelte';
	import Timeline from './Timeline.svelte';
	import Locations from './locations/Locations.svelte';

	let {
		width,
		statsWidth = 0,
		labelsWidth,
		scenes,
		xScale,
		episodeData,
		isPlaying = false,
		playingScene = null,
		sonificationCharactersData = null,
		sonificationLocationData = null
	} = $props();

	let innerWidth = $state(1200);

	let episodeDuration = $derived(+episodeData[episodeData.length - 1].eventTimeSeconds);

	let isHover = $state(false);
	let hoveredPosition = $state(0);
	let hoveredTime = $state(0);

	const handleMouseEnter = () => {
		if (innerWidth > 1000 && sonificationCharactersData) {
			isHover = true;
		}
	};
	const handleMouseLeave = () => {
		if (sonificationCharactersData) {
			isHover = false;
		}
	};
	const handleMouseOver = (/** @type {MouseEvent} */ e) => {
		if (innerWidth > 1000 && sonificationCharactersData) {
			const x = e.clientX - 198;
			hoveredPosition = x >= 0 ? x : 0;
			hoveredTime = xScale.invert(hoveredPosition);
		}
	};
</script>

<svelte:window bind:innerWidth />

<div
	style="width: {statsWidth > 0 ? `${width + statsWidth}px` : 'auto'}; max-width: 100vw;"
	role="document"
	onmouseenter={handleMouseEnter}
	onmouseleave={handleMouseLeave}
	onmousemove={handleMouseOver}
>
	<Characters
		{width}
		{statsWidth}
		{labelsWidth}
		{scenes}
		{xScale}
		{episodeData}
		{episodeDuration}
		{isHover}
		{hoveredPosition}
		{hoveredTime}
		{isPlaying}
		{playingScene}
		{sonificationCharactersData}
	/>
	<div style="max-width: {innerWidth}px; overflow: scroll;">
		<Timeline
			{labelsWidth}
			{xScale}
			{episodeDuration}
			{isHover}
			{hoveredTime}
			{hoveredPosition}
			{scenes}
			{playingScene}
		/>
	</div>
	<Locations
		{width}
		{statsWidth}
		{labelsWidth}
		{scenes}
		{xScale}
		{episodeData}
		{episodeDuration}
		{isHover}
		{hoveredPosition}
		{hoveredTime}
		{isPlaying}
		{playingScene}
		{sonificationLocationData}
	/>
</div>

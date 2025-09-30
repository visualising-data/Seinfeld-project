<script>
	// @ts-nocheck

	import { scaleBand } from 'd3-scale';
	import { locations } from '$lib/data/locations';
	import { getLocationId } from '../../../../utils/sonificationToIds';
	import Scenes from '../Scenes.svelte';
	import LocationsList from './LocationsList.svelte';
	import LocationsOnScreen from './LocationsOnScreen.svelte';
	import LocationsStats from './LocationsStats.svelte';

	let {
		width,
		statsWidth,
		labelsWidth,
		xScale,
		scenes,
		episodeData,
		episodeDuration,
		isHover,
		hoveredPosition,
		hoveredTime,
		isPlaying,
		playingScene,
		sonificationLocationData
	} = $props();

	let innerWidth = $state(1200);

	const locationsData = $derived(episodeData.filter((e) => e.eventCategory === 'LOCATION'));
	const locationsOnScreen = $derived.by(() => {
		const locationsArray = locations.map((c) => {
			return { id: c.id, label: c.label, timesOnScreen: [] };
		});
		locationsData.forEach((d) => {
			locationsArray.find((c) => c.id === d.eventAttribute).timesOnScreen.push(+d.eventTimeSeconds);
		});

		const locationsOnScreen = locationsArray.filter((c) => c.timesOnScreen.length > 0);

		return locationsOnScreen;
	});

	const hoveredLocations = $derived.by(() => {
		let hoveredLocationsArray = [];

		if (isPlaying) {
			const playingLocations = sonificationLocationData
				.filter((d) => +d.SceneNumber === playingScene)
				.map((d) => d.Location);
			playingLocations.forEach((loc) => {
				const ids = getLocationId(loc);
				hoveredLocationsArray = hoveredLocationsArray.concat(ids);
			});
		} else {
			const time = Math.floor(hoveredTime / 5) * 5;
			locationsOnScreen.forEach((location) => {
				if (location.timesOnScreen && location.timesOnScreen.includes(time)) {
					hoveredLocationsArray.push(location.id);
				}
			});
		}

		return hoveredLocationsArray;
	});

	const vizHeight = $derived(locationsOnScreen.length * 48 + 32);

	const yScale = $derived(
		scaleBand()
			.domain(locationsOnScreen.map((char) => char.id))
			.range([0, vizHeight - 32])
			.padding(0.6)
	);
</script>

<svelte:window bind:innerWidth />

<div class="flex">
	<LocationsList
		{labelsWidth}
		locations={locationsOnScreen}
		{yScale}
		{isHover}
		{hoveredLocations}
		{isPlaying}
	/>
	<div
		class="flex-shrink-0"
		style="max-width: {innerWidth >= 1280 ? width : innerWidth - 63}px; overflow: scroll;"
	>
		<svg
			{width}
			height={vizHeight}
			style="transform: translateX({playingScene && innerWidth <= 1000
				? xScale(scenes.find((s) => s.sceneNum === playingScene).startTime) * -1
				: 0}px);"
		>
			<Scenes
				{scenes}
				{xScale}
				height={vizHeight}
				isNumbersUp={false}
				{isHover}
				{hoveredTime}
				{isPlaying}
				{playingScene}
			/>
			<LocationsOnScreen
				locations={locationsOnScreen}
				{xScale}
				{yScale}
				{isHover}
				{hoveredTime}
				{scenes}
				{isPlaying}
				{playingScene}
			/>
			{#if isHover}
				<line x1={hoveredPosition} y1={0} x2={hoveredPosition} y2={vizHeight} stroke="#12020A" />
			{/if}
		</svg>
	</div>
	{#if statsWidth > 0}
		<LocationsStats
			width={statsWidth}
			height={vizHeight}
			{yScale}
			{locationsOnScreen}
			{episodeDuration}
		/>
	{/if}
</div>

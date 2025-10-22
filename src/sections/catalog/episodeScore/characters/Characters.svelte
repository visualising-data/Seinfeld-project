<script>
	// @ts-nocheck

	import { scaleBand } from 'd3-scale';
	import { characters } from '$lib/data/characters';
	import { getCharacterId } from '../../../../utils/sonificationToIds';
	import CharactersList from './CharactersList.svelte';
	import Scenes from '../Scenes.svelte';
	import PresenceOnScreen from './PresenceOnScreen.svelte';
	import CausedLaughs from './CausedLaughs.svelte';
	import CharactersStats from './CharactersStats.svelte';

	let {
		width,
		statsWidth,
		labelsWidth,
		scenes,
		xScale,
		episodeData,
		episodeDuration,
		isHover,
		hoveredPosition,
		hoveredTime,
		isPlaying,
		playingScene,
		sonificationCharactersData
	} = $props();

	let innerWidth = $state(1200);

	const charactersOnScreen = $derived.by(() => {
		const data = episodeData.filter((e) => e.eventCategory === 'CHARACTERS');
		const charactersArray = characters.map((c) => {
			return { id: c.id, label: c.label, color: c.color, timesOnScreen: [] };
		});
		data.forEach((d) => {
			charactersArray
				.find((c) => c.id === d.eventAttribute)
				.timesOnScreen.push(+d.eventTimeSeconds);
		});

		const charactersOnScreen = charactersArray.filter((c) => c.timesOnScreen.length > 0);

		if (
			episodeData.find(
				(d) => d.eventCategory === 'CAUSES THE LAUGH' && d.eventAttribute === 'The situation'
			)
		) {
			charactersOnScreen.push({ id: 'The situation', label: 'The situation', color: '#5443B0' });
		}

		return charactersOnScreen;
	});

	const charactersCausedLaughs = $derived.by(() => {
		const data = episodeData.filter((e) => e.eventCategory === 'CAUSES THE LAUGH');
		const charactersArray = characters.map((c) => {
			return { id: c.id, label: c.label, color: c.color, causedLaughs: [] };
		});
		data.forEach((d) => {
			charactersArray.find((c) => c.id === d.eventAttribute).causedLaughs.push(+d.eventTimeSeconds);
		});

		return charactersArray.filter((c) => c.causedLaughs.length > 0);
	});

	const hoveredCharacters = $derived.by(() => {
		let hoveredCharactersArray = [];

		if (isPlaying) {
			const playingChars = sonificationCharactersData
				.filter((d) => +d.SceneNumber === playingScene)
				.map((d) => d.Character);
			playingChars.forEach((char) => {
				const ids = getCharacterId(char);
				hoveredCharactersArray = hoveredCharactersArray.concat(ids);
			});
		} else {
			const time = Math.floor(hoveredTime / 5) * 5;

			charactersOnScreen.forEach((char) => {
				if (char.timesOnScreen && char.timesOnScreen.includes(time)) {
					hoveredCharactersArray.push(char.id);
				}
			});

			const situationLaughs = charactersCausedLaughs.find(
				(char) => char.id === 'The situation'
			)?.causedLaughs;
			if (situationLaughs && situationLaughs.includes(time)) {
				hoveredCharactersArray.push('The situation');
			}
		}

		return hoveredCharactersArray;
	});

	const vizHeight = $derived(charactersOnScreen.length * 48 + 32);

	const yScale = $derived(
		scaleBand()
			.domain(charactersOnScreen.map((char) => char.id))
			.range([32, vizHeight])
			.padding(0.6)
	);
</script>

<svelte:window bind:innerWidth />

<div class="flex">
	<CharactersList
		{labelsWidth}
		characters={charactersOnScreen}
		{yScale}
		{isHover}
		{isPlaying}
		{hoveredCharacters}
	/>
	<div
		class="flex-col flex-shrink-0"
		style="max-width: {innerWidth >= 1280 ? width : innerWidth - 63}px; overflow: scroll; margin-top: -18px;"
	>
		<svg height={18}>
			<g transform="translate(0, 9)">
				<text class="small accent" alignment-baseline="middle">Scene number</text>
				<g transform="translate({102}, {-3})">
					<path d="M30 3L25 0.113249V5.88675L30 3ZM0 3V3.5H25.5V3V2.5H0V3Z" fill="#E71D80"/>
				</g>
			</g>
		</svg>
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
				{isHover}
				{hoveredTime}
				{isPlaying}
				{playingScene}
			/>
			<PresenceOnScreen
				characters={charactersOnScreen}
				{xScale}
				{yScale}
				{scenes}
				{isHover}
				{hoveredTime}
				{isPlaying}
				{playingScene}
			/>
			<CausedLaughs
				characters={charactersCausedLaughs}
				{xScale}
				{yScale}
				{isHover}
				{hoveredTime}
				{isPlaying}
				{playingScene}
				{scenes}
			/>
			{#if isHover}
				<line x1={hoveredPosition} y1={0} x2={hoveredPosition} y2={vizHeight} stroke="#12020A" />
			{/if}
		</svg>
	</div>
	{#if innerWidth >= 1280 && statsWidth > 0}
		<CharactersStats
			width={statsWidth}
			height={vizHeight}
			{yScale}
			{charactersOnScreen}
			{charactersCausedLaughs}
			{episodeDuration}
		/>
	{/if}
</div>

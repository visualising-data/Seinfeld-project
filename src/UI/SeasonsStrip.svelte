<script>
	import { scaleLinear } from 'd3-scale';
	import { sum } from 'd3-array';
	import { seasons, totalNumEpisodes } from '$lib/data/seasons';

	/**
	 * @type {number}
	 */
	const width = 25;
	let innerHeight = $state(800);

	let { stripHeight } = $props();
	let topSpace = $derived(stripHeight < innerHeight ? (innerHeight - stripHeight) / 2 : 0);

	let seasonScale = $derived(
		scaleLinear()
			.domain([0, totalNumEpisodes])
			.range([topSpace, innerHeight - topSpace])
	);
</script>

<svelte:window bind:innerHeight />

<div id="seasons-strip">
	<svg {width} height={innerHeight}>
		{#each seasons as season, i}
			<rect
				x={0}
				y={seasonScale(sum(seasons.slice(0, i), (d) => d.numEpisodes))}
				width={25}
				height={seasonScale(season.numEpisodes) - topSpace}
				fill={season.color}
			/>
		{/each}
	</svg>
</div>

<style>
	#seasons-strip rect {
		transition: all 1s ease-out;
	}
</style>

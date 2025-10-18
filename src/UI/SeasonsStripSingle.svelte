<script>
	import { scaleLinear } from 'd3-scale';
	import { sum } from 'd3-array';
	import { seasons, totalNumEpisodes } from '$lib/data/seasons';

	let { width = 25, height } = $props();

	let seasonScale = $derived(
		scaleLinear()
			.domain([0, totalNumEpisodes])
			.range([0, height])
	);
</script>

{#each seasons as season, i}
	<rect
		x={0}
		y={seasonScale(sum(seasons.slice(0, i), (d) => d.numEpisodes))}
		width={width}
		height={seasonScale(season.numEpisodes)}
		fill={season.color}
	/>
{/each}
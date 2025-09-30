<script>
	import { getLocationIconPath } from '../../../../utils/getLocationIconPath';

	let { labelsWidth, locations, yScale, isHover, hoveredLocations, isPlaying } = $props();

	let innerWidth = $state(1200);
</script>

<svelte:window bind:innerWidth />

<ul class="relative z-10 shrink-0 pt-4" style="width: {labelsWidth}px; background-color: #F9F5F7;">
	{#each locations as location}
		<li
			class="mask absolute w-full"
			style="top: {yScale(location.id) +
				yScale.bandwidth() / 2 -
				16}px; right: 16px; opacity: {(!isHover && !isPlaying) ||
			((isHover || isPlaying) && hoveredLocations.includes(location.id))
				? 1
				: 0.2}"
		>
			<div class="catalog-location-label flex justify-end">
				{#if innerWidth >= 1280}
					<div class="small flex items-center justify-end pr-2">{location.label}</div>
				{/if}
				<div
					class="image h-8 w-8 rounded-full"
					style="background-image: url({getLocationIconPath(location.id, true)});"
				></div>
			</div>
		</li>
	{/each}
</ul>

<style>
	li {
		transition: opacity 150ms ease-out;
	}
	.image {
		background-repeat: no-repeat;
		background-position: center;
		background-size: cover;
	}
</style>

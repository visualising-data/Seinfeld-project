<script>
	// @ts-nocheck

	import { getCharacterImagePath } from '../../../../utils/getCharacterImagePath';

	let { labelsWidth, characters, yScale, isHover, hoveredCharacters, isPlaying } = $props();

	let innerWidth = $state(1200);

	const isHighlight = $derived.by(() => {
		return !isPlaying && !isHover ? false : true;
	});
</script>

<svelte:window bind:innerWidth />

<ul class="relative z-10 shrink-0 pt-8" style="width: {labelsWidth}px; background-color: #F9F5F7;">
	{#each characters as char}
		<li
			class="mask absolute w-full"
			style="top: {yScale(char.id) +
				yScale.bandwidth() / 2 -
				16}px; right: 16px; opacity: {!isHighlight ||
			(isHighlight && hoveredCharacters.includes(char.id))
				? 1
				: 0.2}"
		>
			<div class="catalog-character-label flex justify-end">
				{#if innerWidth >= 1280}
					<div class="small flex items-center justify-end pr-2">{char.label}</div>
				{/if}
				<div
					class="image h-8 w-8 rounded-full"
					style="background-image: url({getCharacterImagePath(char.id)});"
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

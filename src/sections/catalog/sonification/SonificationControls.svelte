<script>
	import PlayIcon from '../../../icons/PlayIcon.svelte';
	import StopIcon from '../../../icons/StopIcon.svelte';
	import BackwardIcon from '../../../icons/BackwardIcon.svelte';
	import ForwardIcon from '../../../icons/ForwardIcon.svelte';
	import InfoIcon from '../../../icons/Info.svelte';
	import SonificationLegend from './SonificationLegend.svelte';
	import { soundIsAuth } from '../../../stores/soundAuthStore';

	let { scenesWidth, isPlaying, playingScene, numScenes, play, playNext, playPrev, stop } =
		$props();

	let innerWidth = $state(1200);
	let sonificationLegendIsOpen = $state(false);

	const toggleSonificationLegend = () => {
		sonificationLegendIsOpen = !sonificationLegendIsOpen;
	};
</script>

<svelte:window bind:innerWidth />

<div
	class="relative"
	style="max-width: {innerWidth >= 1280 ? scenesWidth : innerWidth - 75}px; margin-top: -4px;"
>
	<div
		class="small absolute left-0"
		style="margin-top: {innerWidth >= 1280 ? 0 : 16}px; top: {innerWidth >= 1280
			? 0
			: -67}px; line-height: 24px; color: {$soundIsAuth ? '#E71D80' : '#BEBABC'};"
	>
		Listen to this episode's data
	</div>
	<div class="mr-8 mt-2 flex justify-start lg:justify-center">
		<button
			class="mx-2"
			onclick={playPrev}
			disabled={!isPlaying || !$soundIsAuth || playingScene <= 1}
			><BackwardIcon
				color={isPlaying && $soundIsAuth && playingScene > 1 ? '#E71D80' : '#BEBABC'}
			/></button
		>
		{#if isPlaying}
			<button class="mx-2" onclick={stop}><StopIcon color="#E71D80" /></button>
		{:else}
			<button class="mx-2" onclick={play} disabled={!$soundIsAuth}
				><PlayIcon color={$soundIsAuth ? '#E71D80' : '#BEBABC'} /></button
			>
		{/if}
		<button
			class="mx-2"
			onclick={playNext}
			disabled={!isPlaying || !$soundIsAuth || playingScene == numScenes}
			><ForwardIcon
				color={isPlaying && $soundIsAuth && playingScene < numScenes ? '#E71D80' : '#BEBABC'}
			/></button
		>
	</div>
	<div class="absolute right-0 top-1">
		<button onclick={toggleSonificationLegend}><InfoIcon /></button>
	</div>
</div>

{#if sonificationLegendIsOpen}
	<SonificationLegend toggleLegend={toggleSonificationLegend} />
{/if}

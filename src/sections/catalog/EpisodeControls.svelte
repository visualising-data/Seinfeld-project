<script>
	import { inview } from 'svelte-inview';
	import { navBarColor } from '../../stores/navbarColor';
	import { seasons } from '$lib/data/seasons';
	import { isEpisodeValid } from '../../utils/isEpisodeValid';
	import { getRandomEpisode } from '../../utils/getRandom';
	import Dropdown from '../../UI/Dropdown.svelte';
	import Prev from '../../icons/Prev.svelte';
	import Next from '../../icons/Next.svelte';
	import Random from '../../icons/Random.svelte';

	let { episodes, currentSeason = $bindable(), currentEpisode = $bindable() } = $props();

	let innerWidth = $state(1200);
	const seasonNums = seasons.map((s) => s.seasonNum);

	let availableEpisodes = $derived(
		episodes
			.filter((/** @type {{ season: any; }} */ e) => e.season === currentSeason)
			.map((/** @type {{ episode: any; }} */ e) => e.episode)
	);

	const handleGoToPrevEpisode = () => {
		/**
		 * @type {number}
		 */
		let newSeason;
		let newEpisode;
		if (currentEpisode === 1) {
			newSeason = currentSeason - 1;
			const seasonEpisodes = episodes.filter(
				(/** @type {{ season: any; }} */ e) => e.season === newSeason
			);
			newEpisode = seasonEpisodes[seasonEpisodes.length - 1].episode;
		} else {
			newSeason = currentSeason;
			newEpisode = currentEpisode - 1;
		}

		currentSeason = newSeason;
		currentEpisode = isEpisodeValid(newSeason, newEpisode) ? newEpisode : newEpisode - 2;
	};

	const handleGoToNextEpisode = () => {
		/**
		 * @type {number}
		 */
		let newSeason;
		let newEpisode;
		const seasonEpisodes = episodes.filter(
			(/** @type {{ season: any; }} */ e) => e.season === currentSeason
		);
		const seasonLastEpisode = seasonEpisodes[seasonEpisodes.length - 1].episode;
		if (currentEpisode === seasonLastEpisode) {
			newSeason = currentSeason + 1;
			newEpisode = 1;
		} else {
			newSeason = currentSeason;
			newEpisode = currentEpisode + 1;
		}

		currentSeason = newSeason;
		currentEpisode = isEpisodeValid(newSeason, newEpisode) ? newEpisode : newEpisode + 2;
	};

	const handleGoToRandomEpisode = () => {
		const randomEpisode = getRandomEpisode();
		currentSeason = randomEpisode?.newSeason;
		currentEpisode = randomEpisode?.newEpisode;
	};
</script>

<svelte:window bind:innerWidth />

<div
	style="width: {innerWidth >= 1280 ? 'calc(100vw - 425px)' : '100vw'}; background-color: #E71D80;"
	use:inview={{}}
	oninview_change={(/** @type {{ detail: { inView: any; }; }} */ event) => {
		const { inView } = event.detail;
		$navBarColor = inView ? 'white' : 'pink';
	}}
>
	<div
		class="flex flex-nowrap items-center justify-between px-4 py-3"
		style="max-width: {innerWidth >= 750 ? 600 : 400}px; margin-left: {innerWidth >= 1280
			? 12
			: 0}px;"
	>
		<!-- Previous episode -->
		<button
			class="my-1"
			onclick={handleGoToPrevEpisode}
			disabled={currentSeason === 1 && currentEpisode === 1}
			style="opacity: {currentSeason === 1 && currentEpisode === 1 ? 0.3 : 1};"
		>
			<Prev />
		</button>

		<!-- Seasons dropdown -->
		<div class="my-1">
			<Dropdown options={seasonNums} bind:value={currentSeason} prefix="s" />
		</div>

		<!-- Episodes dropdown -->
		<div class="my-1">
			<Dropdown options={availableEpisodes} bind:value={currentEpisode} prefix="e" />
		</div>

		<!-- Next episode -->
		<button
			class="my-1"
			onclick={handleGoToNextEpisode}
			disabled={currentSeason === 9 && currentEpisode === 24}
			style="opacity: {currentSeason === 9 && currentEpisode === 24 ? 0.3 : 1};"
		>
			<Next />
		</button>

		<!-- Random episode -->
		<div class="flex items-center" style="color: #F9F5F7; font-weight: 600;">
			{#if innerWidth >= 750}
				<div class="small">OR</div>
			{/if}
			<button class="ml-1 flex items-center lg:ml-5" onclick={handleGoToRandomEpisode}>
				<div class="flex items-center justify-center"><Random /></div>
				{#if innerWidth >= 750}
					<div class="small ml-2 text-left leading-tight" style="width: 120px;">
						Go to a random episode
					</div>
				{/if}
			</button>
		</div>
	</div>
</div>

<style>
</style>

<script>
	// @ts-nocheck
	import { onMount } from 'svelte';
	import * as Tone from 'tone';

	import HelpIcon from '../../../icons/HelpIcon.svelte';
	import { getCharacterImagePath } from '../../../utils/getCharacterImagePath';
	import { getLocationIconPath } from '../../../utils/getLocationIconPath';
	import {
		sonificationFiles,
		getCharSoundFileName,
		getLocationSoundFileName
	} from '$lib/data/sonificationFilesMapping';

	const characters = $state([
		{ id: 'Jerry', imageId: 'JERRY', currentLevel: 0 },
		{ id: 'George', imageId: 'GEORGE', currentLevel: 0 },
		{ id: 'Elaine', imageId: 'ELAINE', currentLevel: 0 },
		{ id: 'Kramer', imageId: 'KRAMER', currentLevel: 0 },
		{ id: 'LoveInterest', imageId: 'Love interest', currentLevel: 0 },
		{ id: 'Families', imageId: "Jerry's family", currentLevel: 0 },
		{ id: 'FNC', imageId: 'Friend/Acquaintance', currentLevel: 0 },
		{ id: 'Other', imageId: 'Other', currentLevel: 0 }
	]);
	const locations = $state([
		{ id: 'CharacterHome', imageId: "Jerry's home", currentLevel: 0 },
		{ id: 'Diner', imageId: 'Diner', currentLevel: 0 },
		{ id: 'Leisure', imageId: 'Place of leisure', currentLevel: 0 },
		{ id: 'OtherFamilyHome', imageId: 'Other family home', currentLevel: 0 },
		{ id: 'Outside', imageId: 'Outside', currentLevel: 0 },
		{ id: 'Transport', imageId: 'Transport', currentLevel: 0 },
		{ id: 'Workplace', imageId: 'Workplace', currentLevel: 0 },
		{ id: 'Other', imageId: 'Other', currentLevel: 0 }
	]);
	let isSelection = $derived.by(() => {
		const playingChars = characters.filter((char) => char.currentLevel > 0);
		const playingLocations = locations.filter((loc) => loc.currentLevel > 0);

		return playingChars.length > 0 || playingLocations.length > 0;
	});

	/**
	 * @type {Tone.Players}
	 */
	let soundtrack;
	const preload = () => {
		soundtrack = new Tone.Players(sonificationFiles).toDestination(); //connects to the system sound output
	};

	let playLegendTimeout;
	const playLegend = () => {
		characters
			.filter((char) => char.currentLevel > 0)
			.forEach((char) => {
				const player = getCharSoundFileName(char.id, char.currentLevel.toString());
				if (player) {
					soundtrack.player(player).start();
				}
			});
		locations
			.filter((loc) => loc.currentLevel > 0)
			.forEach((loc) => {
				const player = getLocationSoundFileName(loc.id);
				if (player) {
					soundtrack.player(player).start();
				}
			});

		playLegendTimeout = setTimeout(() => {
			playLegend();
		}, 8727.272727);
	};

	const handleClickOnChar = (/** @type {string} */ id) => {
		const char = characters.find((char) => char.id === id);
		if (char.currentLevel === 3) {
			char.currentLevel = 0;
		} else {
			char.currentLevel += 1;
		}

		clearTimeout(playLegendTimeout);
		soundtrack.stopAll();
		playLegend();
	};

	const handleClickOnLocation = (/** @type {string} */ id) => {
		const loc = locations.find((loc) => loc.id === id);
		if (loc.currentLevel === 1) {
			loc.currentLevel = 0;
		} else {
			loc.currentLevel += 1;
		}

		clearTimeout(playLegendTimeout);
		soundtrack.stopAll();
		playLegend();
	};

	const clearAll = () => {
		clearTimeout(playLegendTimeout);
		soundtrack.stopAll();

		characters.forEach((char) => (char.currentLevel = 0));
		locations.forEach((loc) => (loc.currentLevel = 0));
	};

	onMount(() => {
		// Preload audio files
		preload();
	});
</script>

<div class="mt-12 flex items-center">
	<HelpIcon />
	<div class="small accent ml-2">
		<div>Click on a character or a location to listen to its sound.</div>
		<div>Click again to bump intensity or stop.</div>
	</div>
</div>
<div class="mt-2 flex justify-end">
	<button class="btn btn-primary small clear-btn" disabled={!isSelection} onclick={clearAll}
		>Clear selection</button
	>
</div>
<div class="mt-2 flex text-black">
	<div class="pr-16">
		<div class="mb-4">Characters</div>
		<ul>
			{#each characters as char}
				<li class="mb-6 flex items-center">
					<button
						aria-label="toggle-sound"
						class="image mr-4 h-16 w-16 rounded-full"
						style="background-image: url({getCharacterImagePath(char.imageId)});"
						onclick={() => handleClickOnChar(char.id)}
					></button>
					<div class="flex">
						<div
							class="level-indicator mr-2"
							style="background: {char.currentLevel > 0 ? '#E71D80' : '#BEBABC'};"
						></div>
						<div
							class="level-indicator mr-2"
							style="background: {char.currentLevel > 1 ? '#E71D80' : '#BEBABC'};"
						></div>
						<div
							class="level-indicator"
							style="background: {char.currentLevel > 2 ? '#E71D80' : '#BEBABC'};"
						></div>
					</div>
				</li>
			{/each}
		</ul>
	</div>
	<div>
		<div class="mb-4">Locations</div>
		<ul>
			{#each locations as loc}
				<li class="mb-6 flex items-center">
					<button
						aria-label="toggle-sound"
						class="image image-location mr-4 h-16 w-16 rounded-full"
						style="background-image: url({getLocationIconPath(loc.imageId)});"
						onclick={() => handleClickOnLocation(loc.id)}
					></button>
					<div class="flex">
						<div
							class="level-indicator mr-2"
							style="background: {loc.currentLevel > 0 ? '#E71D80' : '#BEBABC'};"
						></div>
					</div>
				</li>
			{/each}
		</ul>
	</div>
</div>

<style>
	.image {
		background-repeat: no-repeat;
		background-size: cover;
		background-position: center;
	}
	.image-location {
		border: 2.5px solid #12020a;
		background-size: 60px 60px;
	}
	.level-indicator {
		width: 20px;
		height: 20px;
		border-radius: 10px;
	}
	.clear-btn {
		padding: 4px 8px;
	}
</style>

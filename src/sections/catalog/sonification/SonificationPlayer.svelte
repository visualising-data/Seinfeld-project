<script>
	import { onMount } from 'svelte';
	import * as Tone from 'tone';

	import SonificationControls from './SonificationControls.svelte';
	import SonificationTrack from './SonificationTrack.svelte';
	import {
		sonificationFiles,
		getCharSoundFileName,
		getLocationSoundFileName
	} from '$lib/data/sonificationFilesMapping';
	import { soundIsAuth } from '../../../stores/soundAuthStore';
	import ExposesCompressorSettings from './ExposesCompressorSettings.svelte';

	let {
		labelsWidth,
		scenesWidth,
		scenes,
		xScale,
		sonificationCharactersData,
		sonificationLocationData,
		isPlaying,
		playingScene,
		updatePlayingData
	} = $props();

	let innerWidth = $state(1200);

	/**
	 * @type {Tone.Players}
	 */
	let soundtrack;

	/**
	 * @type {Tone.Compressor}
	 */
	let compressor
	// --- 🎚️ Reactive compressor state ---
	let threshold = $state(-24);
	let ratio = $state(12);
	let attack = $state(0.003);
	let release = $state(0.25);
	const preload = () => {
		soundtrack = new Tone.Players(sonificationFiles);

		compressor = new Tone.Compressor({
			threshold: threshold,
			ratio: ratio,
			attack: attack,
			release: release,
		});

		soundtrack.connect(compressor);
		compressor.toDestination();
	};

	// --- ⚡ Reactive audio parameter updates ---
	function updateThreshold(value) {
		compressor.threshold.value = value
		console.log('threshold', compressor.threshold.value)
	}
	function updateRatio(value) {
		compressor.ratio.value = value
		console.log('ratio', compressor.ratio.value)
	}
	function updateAttack(value) {
		compressor.attack.value = value
		console.log('attack', compressor.attack.value)
	}
	function updateRelease(value) {
		compressor.release.value = value
		console.log('release', compressor.release.value)
	}

	// function play(name: string) {
	// 	players?.player(name).start();
	// }

	/**
	 * @type {number | undefined}
	 */
	let playSceneTimeout;
	const playScene = (/** @type {number} */ sceneNum) => {
		if (isPlaying && $soundIsAuth && playingScene === sceneNum) {
			let chars = sonificationCharactersData.filter(
				(/** @type {{ SceneNumber: string; }} */ d) => +d.SceneNumber === sceneNum
			);
			let locations = sonificationLocationData.filter(
				(/** @type {{ SceneNumber: string; }} */ d) => +d.SceneNumber === sceneNum
			);

			// Play audio files
			soundtrack.player('rythm').start();
			chars.forEach((/** @type {{ Character: string; laughBinFull: string; }} */ charData) => {
				const player = getCharSoundFileName(charData.Character, charData.laughBinFull);
				if (player) {
					soundtrack.player(player).start();
				}
			});
			locations.forEach((/** @type {{ Location: string; }} */ locData) => {
				const player = getLocationSoundFileName(locData.Location);
				if (player) {
					soundtrack.player(player).start();
				}
			});

			playSceneTimeout = setTimeout(() => {
				if (sceneNum < scenes.length) {
					updatePlayingData(true, sceneNum + 1);
					playScene(sceneNum + 1);
				} else {
					updatePlayingData(false, 0);
					soundtrack.player('end').start();
				}
			}, 8727.272727);
		}
	};

	const playFirstScene = () => {
		soundtrack.player('start').start();
		setTimeout(() => {
			playScene(1);
		}, 500);
	};

	const play = () => {
		updatePlayingData(true, 1);
		playFirstScene();
	};

	const playNext = () => {
		updatePlayingData(true, playingScene + 1);
		clearTimeout(playSceneTimeout);
		soundtrack.stopAll(); // Stop currently playing scenes
		playScene(playingScene);
	};

	const playPrev = () => {
		updatePlayingData(true, playingScene - 1);
		clearTimeout(playSceneTimeout);
		soundtrack.stopAll(); // Stop currently playing scenes
		playScene(playingScene);
	};

	const stop = () => {
		updatePlayingData(false, 0);
		clearTimeout(playSceneTimeout);
		soundtrack.stopAll();
	};

	const handleClickOnScene = (/** @type {number} */ sceneNum) => {
		updatePlayingData(true, sceneNum);
		clearTimeout(playSceneTimeout);
		soundtrack.stopAll(); // Stop currently playing scenes

		if (sceneNum === 1) {
			playFirstScene();
		} else {
			playScene(sceneNum);
		}
	};

	onMount(() => {
		// Preload audio files
		preload();
	});
</script>

<svelte:window bind:innerWidth />

<div class="mb-4" style="margin-left: {labelsWidth}px;">
	<div style="max-width: {innerWidth - 63}px; overflow: scroll;">
		<SonificationTrack {scenesWidth} {scenes} {xScale} {playingScene} {handleClickOnScene} />
	</div>
	<SonificationControls
		{scenesWidth}
		{isPlaying}
		{playingScene}
		numScenes={scenes.length}
		{play}
		{playNext}
		{playPrev}
		{stop}
	/>
	<div>
		<ExposesCompressorSettings 
			bind:threshold 
			bind:ratio 
			bind:attack 
			bind:release 
			bind:updateThreshold 
			bind:updateRatio
			bind:updateAttack
			bind:updateRelease
		/>
	</div>
</div>

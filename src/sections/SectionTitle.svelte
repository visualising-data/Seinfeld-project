<script>
	import { onMount } from 'svelte';
	import { gsap } from 'gsap/dist/gsap';

	import { supportingCharacterTiles, characters, mainCharacterTiles } from '$lib/data/characters';
	import { locationsTiles } from '$lib/data/locations';
	import { getRandom } from '../utils/getRandom';
	import { soundIsAuth } from '../stores/soundAuthStore';
  import tv_noise from '$lib/assets/tv_noise.png';

	let { section, title } = $props();

	let innerWidth = $state(1600);
	let innerHeight = $state(800);
	const numColumns = $derived.by(() => {
		switch (true) {
			case innerWidth >= 1024:
				return 4;
			case innerWidth >= 768:
				return 3;
			default:
				return 2;
		}
	});
	const numRows = $derived.by(() => {
		switch (true) {
			case innerHeight >= 800:
				return 3;
			case innerHeight >= 600:
				return 2;
			default:
				return 2;
		}
	});

	const numTiles = $derived(numColumns * numRows);
	const tilesData = $derived.by(() => {
		switch (section) {
			case 'supp_char':
				return supportingCharacterTiles;
			case 'locations':
				return locationsTiles;
			default:
				return mainCharacterTiles;
		}
	});

	// @ts-ignore
	const tiles = $derived(getRandom(tilesData, numTiles));
	const tilesWidth = $derived(innerWidth / numColumns);
	const tilesHeight = $derived(innerHeight / numRows);

	// Play video on hover
	let videoIsPlaying = $state(false);
	const handlePlayVideo = (/** @type {string} */ tileId, /** @type {number} */ index) => {
		// Pause all loading videos
		document.querySelectorAll('video').forEach((video) => video.pause());

		if (index < numColumns) {
			videoIsPlaying = true;
		}

		/**
		 * @type {HTMLVideoElement | null}
		 */
		const video = document.querySelector(`#${tileId} video`);
		// @ts-ignore
		video.muted = !$soundIsAuth;
		video?.play();
	};
	const handlePauseVideo = (/** @type {string} */ tileId) => {
		videoIsPlaying = false;

		/**
		 * @type {HTMLVideoElement | null}
		 */
		const video = document.querySelector(`#${tileId} video`);
		video?.pause();
	};

	onMount(() => {
		// Reveal section title
		const tl = gsap.timeline({
			scrollTrigger: {
				trigger: `#tiles-container-${section}`,
				start: 'top center',
				preventOverlaps: true
			}
		});
		tl.from(`.tile-container-${section}`, {
			scale: 0,
			opacity: 0,
			ease: 'power3.out',
			duration: 2,
			stagger: {
				from: 'random',
				amount: 0.4
			}
		}).from(
			`#section-title-${section} h2`,
			{
				translateY: 100,
				opacity: 0,
				ease: 'power3.out',
				duration: 2
			},
			'-=1'
		);
	});

	const getOverlayColor = (/** @type {{ category: string; name: string }} */ tile) => {
		switch (section) {
			case 'supp_char':
				return characters.find((char) => char.label === tile.category)?.color;
			case 'main_char':
				return characters.find((char) => char.label === tile.name)?.color;
			default:
				return '#12020A';
		}
	};
</script>

<svelte:window bind:innerWidth bind:innerHeight />

<div
	id={`tiles-container-${section}`}
	class="tiles-container relative h-screen w-screen bg-black text-white"
>
	<div class="tiles absolute z-0 flex flex-wrap">
		{#each tiles as tile, i}
			<div
				id={tile.id}
				class={`tile-container tile-container-${section} relative`}
				role="group"
				onfocus={() => handlePlayVideo(tile.id)}
				onmouseover={() => handlePlayVideo(tile.id, i)}
				onmouseleave={() => handlePauseVideo(tile.id)}
			>
				<div
					class="tile relative z-10"
					style="width: {tilesWidth}px; height: {tilesHeight}px; background-image: url('https://amdufour.github.io/hosted-data/apis/thumbnails/{tile.thumbnail}');"
				></div>
				<!-- svelte-ignore a11y_media_has_caption -->
				<video
					class="absolute bottom-0 left-0 right-0 z-0"
					playsinline
					preload="none"
					data-object-fit="cover"
					style="width: {tilesWidth}px; height: {tilesHeight}px;"
					poster="https://amdufour.github.io/hosted-data/apis/thumbnails/{tile.thumbnail}"
				>
					<source
						src="https://amdufour.github.io/hosted-data/apis/videos/{tile.video}"
						type="video/mp4"
					/>
				</video>
				<div class="z-1 absolute bottom-0 left-0 right-0 top-0" style="background: rgba(18, 2, 10, 0.3); width: {tilesWidth}px;"></div>
				<div
					class="absolute z-10 bottom-0 left-0 right-0 top-0"
					style="background-image: url('{tv_noise}'); width: {tilesWidth}px;"
				></div>
				<div class="info absolute bottom-0 left-0 right-0 z-20">
					<div
						class="details px-4"
						style="color: {section === 'locations'
							? '#F9F5F7'
							: '#12020A'}; background-color: {getOverlayColor(tile)};"
					>
						<div>
							<span class="name">{tile.name}</span>
							{#if tile.category}
								<span class="category small">{tile.category}</span>
							{/if}
						</div>
						<div class="small">{`s${tile.season}e${tile.episode} ${tile.episodeTitle}`}</div>
					</div>
				</div>
				<div
					class="overlay absolute left-0 right-0 top-0 z-30"
				>
					<div class="absolute left-0 right-0 top-0 bottom-0"
						style="background: rgba(18, 2, 10, 0.4);"></div>
					<div class="absolute left-0 right-0 top-0 bottom-0 opacity-30"
						style="background-color: {getOverlayColor(tile)};"></div>
				</div>
			</div>
		{/each}
	</div>
	<div
		id={`section-title-${section}`}
		class={`section-title absolute left-0 right-0 z-10 flex items-center ${videoIsPlaying ? 'hide-title' : ''}`}
		style="top: {tilesHeight - 146}px;"
	>
		<div class="container">
			<h2 class="mask">{title}</h2>
		</div>
	</div>
</div>

<style>
	/* Tiles */
	.tile,
	.overlay,
	.info .details,
	.section-title {
		transition: all 300ms ease-out;
	}
	.tile {
		border: 1px solid #f9f5f7;
		background-repeat: no-repeat;
		background-position: center;
		background-size: cover;
		opacity: 1;
	}
	.overlay {
		height: 100%;
		max-height: 100%;
	}
	.info {
		height: 100%;
		display: flex;
		align-items: flex-end;
	}
	.info .details {
		padding-top: 0;
		padding-bottom: 0;
		width: 100%;
		max-height: 0;
		overflow: hidden;
		font-size: 1.125rem;
		line-height: 1.1;
	}
	.info .details .name {
		font-weight: 600;
	}
	.tile-container:hover .tile {
		opacity: 0;
	}
	.tile-container:hover .overlay {
		max-height: 0;
	}
	.tile-container:hover .info .details {
		padding-top: 8px;
		padding-bottom: 8px;
		max-height: 54px;
	}

	/* Title */
	.section-title {
		height: 228px;
		background: rgb(18, 2, 10);
		background: linear-gradient(
			0deg,
			rgba(18, 2, 10, 0) 0%,
			rgba(18, 2, 10, 0.3) 30%,
			rgba(18, 2, 10, 0.3) 50%,
			rgba(18, 2, 10, 0.3) 70%,
			rgba(18, 2, 10, 0) 100%
		);
		pointer-events: none;
		transform: translateY(0);
		opacity: 1;
	}
	.section-title.hide-title {
		transform: translateY(50px);
		opacity: 0;
	}
	.section-title h2 {
		line-height: 1.2;
	}
</style>

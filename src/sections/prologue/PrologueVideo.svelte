<script>
	import { onMount } from 'svelte';
	import { gsap } from 'gsap/dist/gsap';
	import { soundIsAuth } from '../../stores/soundAuthStore';
	import tv_noise from '$lib/assets/tv_noise.png';

	let innerWidth = $state(1200);
	let innerHeight = $state(800);
	let isMouseOn = $state(false);
	let isMuted = $state(true);

	$effect(() => {
		isMuted = !(isMouseOn && $soundIsAuth);
	});

	const handleMouseEnter = () => {
		isMouseOn = true;
	};
	const handleMouseLeave = () => {
		isMouseOn = false;
	};

	onMount(() => {
		const tl = gsap.timeline({
			scrollTrigger: {
				trigger: '#prologue-video',
				start: 'top top'
			}
		});
		tl.from('#stroked-title-s4e4', {
			translateY: -50,
			ease: 'power3.out',
			duration: 1
		});
	});
</script>

<svelte:window bind:innerWidth bind:innerHeight />

<div
	id="prologue-video"
	class="relative flex h-screen items-center"
	role="presentation"
	onmouseenter={handleMouseEnter}
	onmouseleave={handleMouseLeave}
>
	<div class="relative">
		<!-- svelte-ignore a11y_media_has_caption -->
		<video playsinline autoplay bind:muted={isMuted} loop>
			<source
				src="https://amdufour.github.io/hosted-data/apis/videos/1a.ElaineArrives.mp4"
				type="video/mp4"
			/>
		</video>
		<div class="readable-layer z-1 absolute bottom-0 left-0 right-0 top-0"></div>
		<div
			class="absolute bottom-0 left-0 right-0 top-0"
			style="background-image: url('{tv_noise}')"
		></div>
	</div>

	<div
		class="mask z-2 absolute left-0"
		style="bottom: {innerWidth >= 768 ? 0 : innerHeight / 2 - 0.38 * innerWidth}px;"
	>
		<h5 id="stroked-title-s4e4" class="p-2">S4E4 - The Wallet</h5>
	</div>
</div>

<style>
	video {
		object-fit: cover;
		width: 100vw;
		height: auto;
	}
	@media screen and (min-width: 768px) {
		video {
			height: 100vh;
		}
	}
</style>

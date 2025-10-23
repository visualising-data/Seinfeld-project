<script>
	// @ts-nocheck

	import { onMount } from 'svelte';
	import { gsap } from 'gsap/dist/gsap';
	import { soundIsAuth } from '../../stores/soundAuthStore';
	import Lenis from 'lenis';
	import tv_noise from "$lib/assets/tv_noise.png";

	let { ScrollTrigger } = $props();

	onMount(() => {
		// Pin text
		ScrollTrigger.create({
			trigger: '#prologue-videos',
			start: 'top bottom',
			end: 'bottom bottom',
			pin: '#prologue-videos-text',
			preventOverlaps: true
		});

		// Highlight keywords
		const tl = gsap.timeline({
			scrollTrigger: {
				trigger: '#prologue-videos-text',
				start: 'top center',
				toggleActions: 'play reverse play reverse'
			}
		});
		tl.to('.highlight', {
			webkitTextFillColor: 'transparent',
			backgroundPosition: '200% center',
			duration: 2,
			delay: 1,
			stagger: 0.5,
			ease: 'power3.out'
		});

		// Add parallax effect to videos
		let videos = gsap.utils.toArray('.parallax');
		videos.forEach((video) => {
			const speed = video.dataset.speed;
			gsap.to(video, {
				yPercent: speed * 50,
				ease: 'none',
				scrollTrigger: {
					trigger: video,
					start: 'top bottom',
					scrub: true
				}
			});
		});

		// Smooth scroll
		const lenis = new Lenis();

		/**
		 * @param {number} time
		 */
		function raf(time) {
			lenis.raf(time);
			requestAnimationFrame(raf);
		}

		requestAnimationFrame(raf);
	});

	const videos = $state([
		{
			id: 'parallax-2',
			isMuted: true,
			position: 'top: 0px; right: 150px; width: 500px;',
			height: 500 * 349 / 604,
			fileName: '8.KramerCigarette',
			episode: ' S5E4 - The Sniffing Accountant'
		},
		{
			id: 'parallax-3',
			isMuted: true,
			position: 'top: 350px; left: 50%; width: 280px;',
			height: 280 * 349 / 604,
			fileName: 'Elaine1b',
			episode: 'S8E12 - The Money'
		},
		{
			id: 'parallax-4',
			isMuted: true,
			position: 'top: 600px; right: 0; width: 300px;',
			height: 300 * 349 / 604,
			fileName: '26.JerryFriend',
			episode: 'S1E4 - Male Unbonding'
		},
		{
			id: 'parallax-1',
			isMuted: true,
			position: 'top: 800px; left: 70%; width: 400px;',
			height: 600 * 349 / 604,
			fileName: '24b.Jerrys',
			episode: 'S3E2 - The Truth'
		},
		{
			id: 'parallax-5',
			isMuted: true,
			position: 'top: 1200px; right: 50px; width: 300px;',
			height: 300 * 349 / 604,
			fileName: 'KramerJeans2',
			episode: 'S7E21 - The Wait Out'
		}
	]);

	const handleVideoMouseEnter = (/** @type {{ target: any; }} */ e) => {
		if ($soundIsAuth) {
			videos.find((vid) => vid.id === e.target.classList[1]).isMuted = false;
		}
	};
	const handleVideoMouseLeave = (/** @type {{ target: any; }} */ e) => {
		videos.find((vid) => vid.id === e.target.classList[1]).isMuted = true;
	};
</script>


<div style="margin-top: 500px; padding-bottom: 300px;">
	<div class="relative">
		<div id="prologue-videos-text" class="relative flex h-screen items-center">
			<div class="container grid grid-cols-1 lg:grid-cols-2">
				<div class="col-span-1 px-4">
					<p>
						As I progressed through the episodes my fascination with the creative process behind the
						show grew. It was the <span class="highlight">musicality</span> of the writing and its delivery that I particularly
						loved, orchestrated by the comedic talents of co-creators Jerry Seinfeld and Larry
						David.
					</p>
					<p>
						Like music, situation comedy has rhythm and it has texture: <span class="highlight"
							>rhythm</span
						>
						is shaped by a show’s timing, its scene-structures, and its pacing;
						<span class="highlight">textures</span> are created by the ‘instruments’ of characters and
						their locations, which amalgamate to create the situations from which the comedy manifests.
					</p>
				</div>
			</div>
		</div>
		<div
			id="prologue-videos"
			class="z-1 absolute"
			style="height: 1400px; top: 100vh; left: 0; right: 0;"
		>
			{#each videos as video}
				<div
					class={`parallax ${video.id} absolute w-80`}
					data-speed={Math.floor(Math.random() * 3 + 1)}
					style={video.position}
					role="presentation"
					onmouseenter={handleVideoMouseEnter}
					onmouseleave={handleVideoMouseLeave}
				>
					<!-- svelte-ignore a11y_media_has_caption -->
					<video playsinline autoplay loop bind:muted={video.isMuted}>
						<source
							src={`https://amdufour.github.io/hosted-data/apis/videos/${video.fileName}.mp4`}
							type="video/mp4"
						/>
					</video>
					<div class="readable-layer z-1 absolute bottom-0 left-0 right-0 top-0"></div>
					<div
						class="absolute z-10 bottom-0 left-0 right-0 top-0"
						style="background-image: url('{tv_noise}')"
					></div>
					<div class="episode">{video.episode}</div>
				</div>
			{/each}
		</div>
	</div>
</div>

<style>
	.parallax {
		box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;
	}
	.episode {
		position: absolute;
		z-index: 2;
		left: 5px;
		bottom: 0;
		font-size: 1.125rem;
		line-height: 1.2;
		font-weight: 600;
		transform: translateY(15px);
		opacity: 0;
		transition: all 350ms cubic-bezier(0.165, 0.84, 0.44, 1);
	}
	.parallax:hover .episode {
		transform: translateY(0);
		opacity: 1;
	}
</style>

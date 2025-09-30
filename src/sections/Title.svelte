<script>
	import { onMount } from 'svelte';
	import { gsap } from 'gsap/dist/gsap';
	import { scaleLinear } from 'd3-scale';
	import { max } from 'd3-array';

	import { seasons } from '$lib/data/seasons';

	let innerWidth = $state(1600);
	const gridContainer = $derived.by(() => {
		switch (true) {
			case innerWidth >= 1536:
				return 1536;
			case innerWidth >= 1280:
				return 1280;
			case innerWidth >= 1024:
				return 1024;
			case innerWidth >= 768:
				return 768;
			default:
				return 640;
		}
	});
	const padding = 30;

	/**
	 * @type {number}
	 */
	let svgWidth = $derived(
		innerWidth >= gridContainer
			? gridContainer + (innerWidth - gridContainer) / 2
			: innerWidth > 0
				? innerWidth - 2 * padding
				: 0
	);

	let seasonScale = $derived(
		scaleLinear()
			.domain([0, max(seasons, (/** @type {{ numEpisodes: any; }} */ d) => d.numEpisodes)])
			.range([0, svgWidth])
	);

	onMount(() => {
		const tl = gsap.timeline({
			scrollTrigger: {
				trigger: '#title-screen',
				start: 'top 20%'
			}
		});
		tl.from('.season-rect', {
			width: 0,
			height: 0,
			stagger: 0.15,
			duration: 2,
			ease: 'power3.out'
		})
			.from(
				['h1', '#subtitle'],
				{
					yPercent: 140,
					duration: 1.5,
					stagger: 0.07,
					opacity: 0,
					ease: 'power3.out'
				},
				'-=1.5'
			)
			.to(
				'.name',
				{
					webkitTextFillColor: 'transparent',
					backgroundPosition: '10% center',
					duration: 2,
					stagger: 0.3,
					ease: 'power3.out'
				},
				'-=.5'
			)
			.to(
				'.name',
				{
					webkitTextFillColor: 'inherit',
					duration: 5,
					ease: 'sine.out'
				},
				'+=.3'
			);
	});
</script>

<svelte:window bind:innerWidth />

<section id="title-screen" class="h-screen mb-80" style="margin-top: 1200px;">
	<svg width={svgWidth} height="132">
		{#each seasons as season, i}
			<rect
				class="season-rect"
				x={0}
				y={i * 12}
				width={seasonScale(season.numEpisodes)}
				height={8}
				fill={season.accessibleOverDarkColor}
			/>
		{/each}
	</svg>
	<div class="container">
		<div style="margin-top: -25px; max-width: 940px;">
			<h1>The Seinfeld Chronicles</h1>
		</div>
		<div id="subtitle" class="subtitle number mt-6">
			An unnecessary data exploration by
			<span class="name">
				<span class="highlight">Andy Kirk</span>
				<img
					id="portrait-andy"
					class="portrait"
					alt="Portrait of Andy Kirk"
					src="https://amdufour.github.io/hosted-data/apis/portraits/andy.jpg"
				/>
			</span>
			<br />
			<span>...unleashed in digital form by</span>
			<span class="name">
				<span class="highlight">Anne-Marie Dufour</span>
				<img
					id="portrait-am"
					class="portrait"
					alt="Portrait of Anne-Marie Dufour"
					src="https://amdufour.github.io/hosted-data/apis/portraits/annemarie_square_closeup.jpg"
				/>
			</span>
			<span style="margin-left: -10px;">, </span>
			<span class="name">
				<span class="highlight">Miriam Quick</span>
				<img
					id="portrait-mq"
					class="portrait"
					alt="Portrait of Miriam Quick"
					src="https://amdufour.github.io/hosted-data/apis/portraits/miriam_quick.jpg"
				/>
			</span>
			<span style="margin-left: -10px;">, and </span>
			<span class="name">
				<span class="highlight">Duncan Geere</span>
				<img
					id="portrait-dg"
					class="portrait"
					alt="Portrait of Duncan Geere"
					src="https://amdufour.github.io/hosted-data/apis/portraits/duncan_geere.jpeg"
				/>
			</span>
			<span>{' { '}</span>
			<span class="name">
				<span class="highlight">Loud Numbers</span>
				<img
					id="portrait-ln"
					class="portrait"
					alt="Loud Numbers logo"
					src="https://amdufour.github.io/hosted-data/apis/portraits/loud_numbers.jpg"
				/>
			</span>
			<span>{' }'}</span>
		</div>
	</div>
</section>

<style>
	section {
		padding-top: 100px;
	}
	.subtitle {
		font-size: 1rem;
		line-height: 2;
	}
	.name {
		position: relative;
		z-index: 1;
		transition: color 350ms cubic-bezier(0.165, 0.84, 0.44, 1);
	}
	.name:hover {
		color: transparent;
		-webkit-text-fill-color: 'transparent';
		background-position: '100% center';
		background-size: 100% auto;
	}
	.portrait {
		position: absolute;
		z-index: 2;
		left: 50%;
		top: -50px;
		transform: translateX(-50%);
		width: 75px;
		height: auto;
		border-radius: 50%;
		border: 5px solid #f9f5f7;
		opacity: 0;
		transition: all 350ms cubic-bezier(0.165, 0.84, 0.44, 1);
		pointer-events: none;
	}
	.name:hover .portrait {
		opacity: 1;
		transform: translate(-50%, -40px) scale(1.2);
	}
	.portrait#portrait-am {
		left: 0;
		top: 70px;
		transform: translateX(0%);
	}
	.name:hover .portrait#portrait-am {
		opacity: 1;
		transform: translate(0%, -35px) scale(1.2);
	}
	.portrait#portrait-mq {
		left: auto;
		right: -60px;
		top: -60px;
		transform: translateX(0%);
	}
	.name:hover .portrait#portrait-mq {
		opacity: 1;
		transform: translate(0%, -5px) scale(1.2);
	}
	.portrait#portrait-dg {
		left: -75px;
		top: -60px;
		transform: translateX(0%);
	}
	.name:hover .portrait#portrait-dg {
		opacity: 1;
		transform: translate(0%, 75px) scale(1.2);
	}
	@media screen and (min-width: 996px) {
		.subtitle {
			font-size: 1.1rem;
		}
	}
</style>

<script>
	import { onMount } from 'svelte';
	import { scaleLinear } from 'd3-scale';
	import { gsap } from 'gsap/dist/gsap';

	import { formatTime } from '../../utils/formatTime';
	import EpisodeDetails from '../catalog/EpisodeDetails.svelte';
	import EpisodeScore from '../catalog/episodeScore/EpisodeScore.svelte';
	import EpisodeTexts from './EpisodeTexts.svelte';

	let { episodeInfo, episodeData, laughData, ScrollTrigger } = $props();

	let innerWidth = $state(1200);
	let innerHeight = $state(800);
	let episodeWidth = $derived(innerWidth > 793 ? innerWidth - 273 : innerWidth - 98);
	
	const timeScale = $derived(
		scaleLinear()
			.domain([0, +laughData[laughData.length - 1].eventTimeSeconds + 5])
			.range([0, episodeWidth])
	);
	const laughWidth = $derived(timeScale(5));
	const labelsWidth = $derived(innerWidth >= 1280 ? 176 : 60);
	const extraPadding = $derived(innerWidth >= 1280 ? 60 : 10);
	let vizWidth = $derived(
		innerWidth > 1000
			? innerWidth - 25 - extraPadding
			: Math.max(innerWidth - 25 - extraPadding, 1000)
	);
	let scenesWidth = $derived(vizWidth - labelsWidth);
	const scenesData = $derived(
		episodeData.filter((/** @type { any } */ d) => d.eventCategory === 'SCENE')
	);
	const scenes = $derived.by(() => {
		const scenesArray = [];
		const lastSceneNumber = +scenesData[scenesData.length - 2].sceneNumber;
		for (let i = 1; i <= lastSceneNumber; i++) {
			const sceneData = scenesData.filter((/** @type { any } */ d) => +d.sceneNumber === i);
			const startTime = sceneData[0].eventTime;
			const endTime = sceneData[sceneData.length - 1].eventTime;
			scenesArray.push({
				sceneNum: i,
				startTime: formatTime(startTime),
				endTime: formatTime(endTime) + 5
			});
		}

		return scenesArray;
	});
	const xScale = $derived(
		scaleLinear()
			.domain([0, scenes[scenes.length - 1].endTime])
			.range([0, scenesWidth])
	);

	onMount(() => {
		// Pin Episode viz
		ScrollTrigger.create({
			trigger: '#episode-example-container',
			start: 'top top',
			end: 'bottom bottom',
			pin: '#episode-example',
			preventOverlaps: true
		});

		gsap.set('#episode-detail-container', {
			translateY: 260,
			opacity: 0
		});
		gsap.set('#episode-length', {
			translateX: -30,
			opacity: 0
		});
		gsap.set(
			'#episode-example-container .catalog-character-on-screen, #episode-example-container .catalog-location-on-screen, #episode-example-container .catalog-character-label, #episode-example-container .catalog-location-label',
			{
				translateX: -30,
				opacity: 0
			}
		);
		gsap.set('#duration-example .episode-start-end', {
			translateY: 20,
			opacity: 0
		});
		gsap.set('#duration-example .laugh-bar, #episode-example-container .catalog-laugh-bar', {
			translateY: 100,
			opacity: 0
		});
		gsap.set('#duration-example .label, .score-wrapper', {
			translateY: -30,
			opacity: 0
		});
	});

	const reveal1 = () => {
		gsap.to('#episode-detail-container', {
			translateY: 0,
			opacity: 1,
			ease: 'power3.out',
			duration: 2
		});
	};

	const reveal2 = () => {
		gsap.to('#episode-length', {
			translateX: 0,
			opacity: 1,
			ease: 'power3.out',
			duration: 1
		});
		gsap.to('#duration-example .episode-start-end', {
			translateY: 0,
			opacity: 1,
			ease: 'power3.out',
			duration: 0.5,
			delay: 0.7
		});
	};

	const reveal3 = () => {
		gsap.to('#duration-example .laugh-bar', {
			translateY: 0,
			opacity: 1,
			ease: 'power3.out',
			duration: 1
		});
		gsap.to('#duration-example .label', {
			translateY: 0,
			opacity: 1,
			ease: 'power3.out',
			duration: 1,
			delay: 0.5
		});
	};

	const reveal4 = () => {
		gsap.to(
			'#episode-length, #duration-example .episode-start-end, #duration-example .laugh-bar, #duration-example .label',
			{
				translateY: 100,
				opacity: 0,
				ease: 'power3.out',
				duration: 1
			}
		);
		gsap.to('.score-wrapper', {
			translateY: 0,
			opacity: 1,
			ease: 'power3.out',
			duration: 1,
			delay: 0.7
		});
	};

	const reveal5 = () => {
		gsap.to('#episode-example-container .catalog-character-label', {
			translateX: 0,
			opacity: 1,
			ease: 'power3.out',
			duration: 2
		});
		gsap.to('#episode-example-container .catalog-character-on-screen', {
			translateX: 0,
			opacity: 1,
			ease: 'power3.out',
			duration: 1
		});
	};

	const reveal6 = () => {
		gsap.to('#episode-example-container .catalog-laugh-bar', {
			translateY: 0,
			opacity: 1,
			ease: 'power3.out',
			duration: 1
		});
	};

	const reveal7 = () => {
		gsap.to('#episode-example-container .catalog-location-label', {
			translateX: 0,
			opacity: 1,
			ease: 'power3.out',
			duration: 2
		});
		gsap.to('#episode-example-container .catalog-location-on-screen', {
			translateX: 0,
			opacity: 1,
			ease: 'power3.out',
			duration: 0.3
		});
	};

	/**
	 * @param {number} number
	 */
	function episodeStepChange(number) {
		switch (number) {
			case 1:
				reveal1();
				break;
			case 2:
				reveal2();
				break;
			case 3:
				reveal3();
				break;
			case 4:
				reveal4();
				break;
			case 5:
				reveal5();
				break;
			case 6:
				reveal6();
				break;
			case 7:
				reveal7();
				break;
			default:
				return null;
		}
	}
</script>

<svelte:window bind:innerWidth bind:innerHeight />

<div id="episode-example-container" class="relative" style="width: calc(100vw - 25px); height: auto;">
	<div id="episode-example" class="absolute">
		<div class="relative">
			<!-- Episode details -->
			<div class="mask self-start">
				<div id="episode-detail-container">
					<EpisodeDetails {episodeInfo} />
				</div>
			</div>

			<!-- Episode duration and laughs -->
			<div
				id="duration-example"
				class="flex items-center justify-center"
				style="width: {innerWidth - 25}px; height: {innerHeight - 254}px;"
			>
				<svg width={innerWidth > 793 ? innerWidth - 225 : innerWidth - 50} height="130">
					<g transform="translate(0, 40)">
						<rect
							id="episode-length"
							x={24}
							y={10}
							width={episodeWidth}
							height={50}
							fill="#DDDBDC"
						/>
						<text class="number episode-start-end" y={90}>00:00</text>
						<text class="number episode-start-end" x={episodeWidth} y={90}>21:45</text>

						<!-- Laughs -->
						<g transform="translate(24, 0)">
							{#each laughData as laugh}
								<rect
									class="laugh-bar"
									x={timeScale(+laugh.eventTimeSeconds)}
									y={0}
									width={laughWidth}
									height={70}
									fill="#12020A"
									stroke="#F9F5F7"
									stroke-width={innerWidth > 793 ? 1.5 : 0.5}
								/>
							{/each}
							<text class="mid label" x={timeScale(+laughData[0].eventTimeSeconds)} y={-20}
								>Each bar represents a block of 5s with laughter.</text
							>
							<line
								class="label"
								x1={timeScale(+laughData[0].eventTimeSeconds) + laughWidth / 2}
								y1={-15}
								x2={timeScale(+laughData[0].eventTimeSeconds) + laughWidth / 2}
								y2={-4}
								stroke="#E71D80"
							/>
						</g>
					</g>
				</svg>
			</div>

			<!-- Episode data -->
			<div class="score-wrapper absolute left-0" style="top: 270px;">
				<EpisodeScore {episodeData} width={scenesWidth} {labelsWidth} {scenes} {xScale} />
			</div>
		</div>
	</div>

	<!-- Scrolling Texts -->
	<div class="z-1000 relative" style="pointer-events: none">
		<EpisodeTexts bind:episodeStepChange />
	</div>
</div>

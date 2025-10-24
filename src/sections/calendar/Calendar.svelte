<script>
	import { onMount } from 'svelte';
	import { scaleTime } from 'd3-scale';
	import { forceSimulation, forceX, forceY, forceCollide } from 'd3-force';
	import d3ForceLimit from 'd3-force-limit';
	import { range } from 'd3-array';
	import { gsap } from 'gsap/dist/gsap';
	import * as Tone from 'tone';
	import { soundIsAuth } from '../../stores/soundAuthStore';

	import { seasons } from '$lib/data/seasons';
	import { episodesInfo } from '$lib/data/episodesInfo';
	import EpisodeTooltip from '../../UI/EpisodeTooltip.svelte';
	import CalendarTexts from './CalendarTexts.svelte';

	let { ScrollTrigger } = $props();

	/**
	 * @type {number}
	 */
	let innerWidth = $state(1600);
	let innerHeight = $state(800);
	let screenSize = $derived({ width: innerWidth, height: innerHeight });
	let seasonsWidth = $derived(innerWidth >= 793 ? 130 : 100);
	let headersHeight = $derived(innerWidth >= 768 ? 80 : 40);
	let episodeRadius = $derived(innerWidth >= 1400 ? 15 : innerWidth > 540 ? 12 : 10);

	const tvSeasons = [
		{
			season: 'Fall',
			months: ['Sep', 'Oct', 'Nov', 'Dec']
		},
		{
			season: 'Winter/Spring',
			months: ['Jan', 'Feb', 'Mar', 'Apr']
		},
		{
			season: 'Summer',
			months: ['May', 'Jun', 'Jul', 'Aug']
		}
	];

	/**
	 * @type {any[]}
	 */
	let nodes = $state([]);

	const getTimeDomain = (/** @type {number} */ season, /** @type {string} */ date) => {
		switch (season) {
			case 1:
				return date === 'July 5 1989'
					? [new Date(1988, 8, 1), new Date(1989, 7, 31)]
					: [new Date(1989, 8, 1), new Date(1990, 7, 31)];
			case 2:
				return [new Date(1990, 8, 1), new Date(1991, 7, 31)];
			case 3:
				return [new Date(1991, 8, 1), new Date(1992, 7, 31)];
			case 4:
				return date === 'August 12 1992' || date === 'August 19 1992'
					? [new Date(1991, 8, 1), new Date(1992, 7, 31)]
					: [new Date(1992, 8, 1), new Date(1993, 7, 31)];
			case 5:
				return [new Date(1993, 8, 1), new Date(1994, 7, 31)];
			case 6:
				return [new Date(1994, 8, 1), new Date(1995, 7, 31)];
			case 7:
				return [new Date(1995, 8, 1), new Date(1996, 7, 31)];
			case 8:
				return [new Date(1996, 8, 1), new Date(1997, 7, 31)];
			default:
				return [new Date(1997, 8, 1), new Date(1998, 7, 31)];
		}
	};

	const timeScale = $derived(
		scaleTime()
			.domain(getTimeDomain(1, 'July 6 1989')) // [new Date(1989, 8, 1), new Date(1990, 7, 31)]
			.range([15, screenSize.width - seasonsWidth - 15])
	);

	const globalTimeScale = (/** @type {string} */ month) => {
		switch (month) {
			case 'Sep':
				return timeScale(new Date('October 1 1989'));
			case 'Oct':
				return timeScale(new Date('November 1 1989'));
			case 'Nov':
				return timeScale(new Date('December 1 1989'));
			case 'Dec':
				return timeScale(new Date('January 1 1990'));
			case 'Jan':
				return timeScale(new Date('February 1 1990'));
			case 'Feb':
				return timeScale(new Date('March 1 1990'));
			case 'Mar':
				return timeScale(new Date('April 1 1990'));
			case 'Apr':
				return timeScale(new Date('May 1 1990'));
			case 'May':
				return timeScale(new Date('June 1 1990'));
			case 'Jun':
				return timeScale(new Date('July 1 1990'));
			case 'Jul':
				return timeScale(new Date('August 1 1990'));
			default:
				return timeScale(new Date('August 31 1990'));
		}
	};

	const monthScale = (/** @type {string} */ month) => {
		let date1;
		let date2;
		switch (month) {
			case 'Sep':
				date1 = timeScale(new Date('September 15 1989'));
				date2 = timeScale(new Date('September 15 1989'));
				break;
			case 'Oct':
				date1 = timeScale(new Date('October 15 1989'));
				date2 = timeScale(new Date('October 16 1989'));
				break;
			case 'Nov':
				date1 = timeScale(new Date('November 15 1989'));
				date2 = timeScale(new Date('November 15 1989'));
				break;
			case 'Dec':
				date1 = timeScale(new Date('December 15 1989'));
				date2 = timeScale(new Date('December 16 1989'));
				break;
			case 'Jan':
				date1 = timeScale(new Date('January 15 1990'));
				date2 = timeScale(new Date('January 16 1990'));
				break;
			case 'Feb':
				date1 = timeScale(new Date('February 14 1990'));
				date2 = timeScale(new Date('February 14 1990'));
				break;
			case 'Mar':
				date1 = timeScale(new Date('March 15 1990'));
				date2 = timeScale(new Date('March 16 1990'));
				break;
			case 'Apr':
				date1 = timeScale(new Date('April 15 1990'));
				date2 = timeScale(new Date('April 15 1990'));
				break;
			case 'May':
				date1 = timeScale(new Date('May 15 1990'));
				date2 = timeScale(new Date('May 16 1990'));
				break;
			case 'Jun':
				date1 = timeScale(new Date('June 15 1990'));
				date2 = timeScale(new Date('June 15 1990'));
				break;
			case 'Jul':
				date1 = timeScale(new Date('July 15 1990'));
				date2 = timeScale(new Date('July 16 1990'));
				break;
			default:
				date1 = timeScale(new Date('August 15 1990'));
				date2 = timeScale(new Date('August 16 1990'));
				break;
		}

		return date1 + (date2 - date1) / 2;
	};

	const getXPosition = (/** @type {number} */ season, /** @type {string} */ date) => {
		const timeScale = scaleTime()
			.domain(getTimeDomain(season, date))
			.range([15, screenSize.width - seasonsWidth - 15]);
		return timeScale(new Date(date));
	};

	const getYPosition = (/** @type {number} */ season, /** @type {string} */ date, /** @type {number} */ verticalStack) => {
		const seasonBlockTop = document
			.getElementById(
				`catalog-season-${date === 'August 12 1992' || date === 'August 19 1992' ? season - 1 : season}`
			)
			?.offsetTop;
		const seasonBlockHeight = document
			.getElementById(
				`catalog-season-${date === 'August 12 1992' || date === 'August 19 1992' ? season - 1 : season}`
			)
			?.offsetHeight;
		
		if (season === 1) {
			return date === 'July 5 1989' ? 20 + headersHeight : seasonBlockHeight / 2 + headersHeight + 10;
		} else {
			const yPosition = seasonBlockTop + seasonBlockHeight / 2 + verticalStack * 2 * episodeRadius;
			return yPosition;
		}
	};

	const wallForce = $derived(d3ForceLimit()
		.radius(episodeRadius)
		.x0(15)
		.x1(screenSize.width - seasonsWidth - 15)
		.y0(headersHeight)
		.y1(innerHeight))

	let isTooltipVisible = $state(false);
	let hoveredEpisode = $state();
	let mousePosition = $state();
	const handleMouseEnter = (
		/** @type {MouseEvent & { currentTarget: EventTarget & SVGGElement; }} */ e,
		/** @type {any} */ episode
	) => {
		mousePosition = [e.clientX, e.clientY];
		isTooltipVisible = true;
		hoveredEpisode = episode;
	};
	const handleMouseLeave = () => {
		isTooltipVisible = false;
	};

	const episodesShow1 = ['s1e1'];
	const episodesShow2 = ['s1e2', 's1e3', 's1e4', 's1e5'];
	const twelveArray = range(1, 13);
	const twentyTwoArray = range(1, 23);
	const twentyThreeArray = range(1, 24);
	const twentyFourArray = range(1, 25);
	const episodesShow3 = twelveArray.map((e) => `s2e${e}`);
	const episodesShow4 = twentyThreeArray.map((e) => `s3e${e}`);
	const episodesShow5 = twentyFourArray
		.map((e) => `s4e${e}`)
		.concat(twentyTwoArray.map((e) => `s5e${e}`))
		.concat(twentyFourArray.map((e) => `s6e${e}`))
		.concat(twentyFourArray.map((e) => `s7e${e}`))
		.concat(twentyTwoArray.map((e) => `s8e${e}`))
		.concat(twentyFourArray.map((e) => `s9e${e}`));

	const getSelectors = (/** @type {number} */ number) => {
		switch (number) {
			case 1:
				return episodesShow1.map((e) => `#calendar-${e}`).join(',');
			case 2:
				return episodesShow2.map((e) => `#calendar-${e}`).join(',');
			case 3:
				return episodesShow3.map((e) => `#calendar-${e}`).join(',');
			case 4:
				return episodesShow4.map((e) => `#calendar-${e}`).join(',');
			default:
				return episodesShow5.map((e) => `#calendar-${e}`).join(',');
		}
	}

	/**
	 * @type {Tone.Player}
	 */
	let soundtrack;
	let isSoundPlaying = $state(false)

	const playSound = () => {
		if (!$soundIsAuth || !soundtrack) return;
		// prevent duplicate starts
		if (isSoundPlaying) return;
		soundtrack.start();
		isSoundPlaying = true;
	};
	
	/**
	 * @param {number} number
	 */
	function showEpisodes(number) {
		const selectors = getSelectors(number);
		gsap.to(selectors, {
			scale: 1,
			opacity: 1,
			ease: 'back.out(3)',
			duration: 1,
			pointerEvents: 'auto',
			onEnter: playSound,
			stagger: {
				from: 'random',
				amount: 0.4,
				ease: 'power2'
			}
		});
	}
	/**
	 * @param {number} number
	 */
	function hideEpisodes(number) {
		const selectors = getSelectors(number);
		gsap.to(selectors, {
			scale: 0,
			opacity: 0,
			pointerEvents: 'none'
		});
	}

	/**
	 * @type {import("d3-force").Simulation<import("d3-force").SimulationNodeDatum, undefined>}
	 */
	let simulation
	const initializeSimulation = () => {
		simulation = forceSimulation(episodesInfo);
		simulation.on('tick', () => {
			nodes = simulation.nodes();
		});

		simulation
			.force('x', forceX((d) => getXPosition(d.season, d.date_aired)).strength(1))
			.force('y', forceY((d) => getYPosition(d.season, d.date_aired, d.verticalStack ? d.verticalStack : 0)).strength(0.5))
			.force('collide', forceCollide().radius(episodeRadius).strength(1))
			.force('walls', wallForce)
			.alpha(0.5)
			.alphaDecay(0.1)
	}

	const handleWindowResize = () => {
		initializeSimulation()
	}

	onMount(() => {
		// Preload Plip sound
		const preload = async () => {
			await Tone.start();
  		await Tone.loaded();
			soundtrack = new Tone.Player('https://amdufour.github.io/hosted-data/apis/sonification/20250925_Seinfeld_Intro_Plip.mp3').toDestination(); //connects to the system sound output
			soundtrack.onstop = () => (isSoundPlaying = false);
		};
		preload()

		// Run simulation
		initializeSimulation()
		simulation.on('end', () => {
				gsap.set('.calendar-episode', {
					scale: 0.1,
					opacity: 0,
					transformOrigin: 'center',
					pointerEvents: 'none'
				});
			});

		// Pin calendar
		ScrollTrigger.create({
			trigger: '#intro-calendar-container',
			start: 'top top',
			end: 'bottom bottom',
			pin: '#intro-calendar',
			preventOverlaps: true
		});

		// Reveal episodes
		gsap.timeline({
			scrollTrigger: {
				trigger: '#calendar-text-overlay-1',
				start: 'center bottom',
        onEnter: () => showEpisodes(1),
        onEnterBack: () => showEpisodes(1),
        onLeaveBack: () => {
					hideEpisodes(1)
					hideEpisodes(2)
					hideEpisodes(3)
					hideEpisodes(4)
					hideEpisodes(5)
				}
			}
		});
		gsap.timeline({
			scrollTrigger: {
				trigger: '#calendar-text-overlay-2',
				start: 'center bottom',
        onEnter: () => showEpisodes(2),
        onEnterBack: () => showEpisodes(2)
			}
		});
		gsap.timeline({
			scrollTrigger: {
				trigger: '#calendar-text-overlay-3',
				start: 'center bottom',
        onEnter: () => showEpisodes(3),
        onEnterBack: () => showEpisodes(3)
			}
		});
		gsap.timeline({
			scrollTrigger: {
				trigger: '#calendar-text-overlay-4',
				start: 'center bottom',
        onEnter: () => showEpisodes(4),
        onEnterBack: () => showEpisodes(4)
			}
		});
		gsap.timeline({
			scrollTrigger: {
				trigger: '#calendar-text-overlay-5',
				start: 'center bottom',
        onEnter: () => showEpisodes(5),
				onEnterBack: () => showEpisodes(5)
			}
		});
		gsap.timeline({
			scrollTrigger: {
				trigger: '#calendar-text-overlay-6',
				start: 'center bottom',
        onLeave: () => {
					hideEpisodes(1)
					hideEpisodes(2)
					hideEpisodes(3)
					hideEpisodes(4)
					hideEpisodes(5)
				}
			}
		});
	});
</script>

<svelte:window bind:innerWidth bind:innerHeight onresize={handleWindowResize} />

<div id="intro-calendar-container" class="relative">
	<div id="intro-calendar" class="absolute flex h-screen w-screen">
		<!-- Seasons -->
		<div class="flex flex-col" style="width: {seasonsWidth}px;">
			<div class="relative px-4" style="height: {headersHeight}px;">
				<div class="relative" style="top: {12}px;">Schedule</div>
			</div>
			{#each seasons as season, i}
				<div
					id={`catalog-season-${i + 1}`}
					class="flex flex-col justify-center px-4"
					style="flex-grow: 1; color: {i > 1
						? '#F9F5F7'
						: '#12020A'}; background: {season.color};
          font-size: {innerWidth >= 793 ? '1.125rem' : '0.875rem'};"
				>
					<div class="uppercase">{season.id}</div>
					<div>{season.years}</div>
				</div>
			{/each}
		</div>

		<svg
			class="absolute"
			width={innerWidth - seasonsWidth}
			height={innerHeight}
			style="top: 0px; left: {seasonsWidth}px;"
		>
			<!-- Seasons and Months -->
			{#each tvSeasons as tvSeason, i}
				<!-- Season labels -->
				<text
					x={i === 0
						? timeScale(new Date('November 1 1989'))
						: i === 1
							? timeScale(new Date('March 1 1990'))
							: timeScale(new Date('July 1 1990'))}
					y={26}
					text-anchor="middle"
					dominant-baseline="middle"
				>
					{#if tvSeason.season === 'Winter/Spring' && innerWidth < 640}
						<tspan x={timeScale(new Date('March 1 1990'))} dy="-8" text-anchor="middle">Winter/</tspan>
						<tspan x={timeScale(new Date('March 1 1990'))} dy="18" text-anchor="middle">Spring</tspan>
					{:else}
						{tvSeason.season}
					{/if}
				</text>

				<!-- Month labels -->
				{#if innerWidth >= 768}
					{#each tvSeason.months as month}
						<text
							class="text-base"
							x={monthScale(month)}
							y={66}
							text-anchor="middle"
							dominant-baseline="middle"
						>
							{month}
						</text>
					{/each}
				{/if}
			{/each}

			<!-- Month separators -->
			{#if innerWidth >= 768}
				{#each tvSeasons as season}
					{#each season.months as month}
						{#if month !== 'Aug'}
							<line
								x1={globalTimeScale(month)}
								y1={month === 'Dec' || month === 'Apr' ? 0 : 50}
								x2={globalTimeScale(month)}
								y2={innerHeight}
								stroke="#BEBABC"
							/>
						{/if}
					{/each}
				{/each}
			{:else}
				{#each tvSeasons as season}
					{#each season.months as month}
						{#if month === 'Dec' || month === 'Apr'}
							<line
								x1={globalTimeScale(month)}
								y1={0}
								x2={globalTimeScale(month)}
								y2={innerHeight}
								stroke="#BEBABC"
							/>
						{/if}
					{/each}
				{/each}		
			{/if}

			<!-- Episodes -->
			{#each nodes as node}
				<g
					id={`calendar-s${node.season}e${node.episode}`}
					class="calendar-episode"
					transform={`translate(${node.x}, ${node.y})`}
					style="cursor: default;"
					role="document"
					onmouseenter={(e) => handleMouseEnter(e, node)}
					onmouseleave={handleMouseLeave}
				>
					<circle
						r={episodeRadius}
						fill={node.isSpecial
							? '#BEBABC'
							: seasons.find((s) => s.seasonNum === node.season)?.color}
					/>
					<text
						class="number"
						text-anchor="middle"
						dominant-baseline="middle"
						dy={1}
						fill={node.season > 2 && !node.isSpecial ? '#F9F5F7' : '#12020A'}
						style="font-size: {screenSize.width >= 793 ? 15 : 12}px;">
						{node.episode}
					</text>
				</g>
			{/each}
		</svg>
	</div>

	<!-- Scrolling Texts -->
	<div class="z-10 relative pointer-events-none">
		<CalendarTexts />
	</div>

	<!-- Tooltip -->
	{#if isTooltipVisible}
		<div class="fixed z-20 top-0 left-0 right-0 bottom-0 pointer-events-none">
			<EpisodeTooltip episode={hoveredEpisode} position={mousePosition} />
		</div>
	{/if}
</div>


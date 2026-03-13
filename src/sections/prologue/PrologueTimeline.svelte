<script>
	import { onMount, onDestroy } from 'svelte';
	import { gsap } from 'gsap/dist/gsap';
	import { scaleLinear } from 'd3-scale';

	let { ScrollTrigger } = $props();

	/**
	 * @type {number}
	 */
	let innerWidth = $state(1600);
	let innerHeight = $state(800);

	/** @type {gsap.Context | undefined} */
	let ctx;

	onMount(() => {
		ctx = gsap.context(() => {
			// One scale per expansion step — baked in at mount time, same as original strategy.
			const scale2012 = scaleLinear().domain([1989, 2012]).range([0, innerHeight - 240]);
			const scale2015 = scaleLinear().domain([1989, 2015]).range([0, innerHeight - 240]);
			const scale2021 = scaleLinear().domain([1989, 2021]).range([0, innerHeight - 240]);

			// translateY helpers.
			// Dates at the BOTTOM container (top: H-120+30) use bottomY().
			// 1989 and 1993 have their own container tops (1/3 and 2/3).
			const H = innerHeight;
			const bottomY = /** @param {(year: number) => number} scale */ (year, scale) =>
				-(H - 120) + 60 + scale(year);
			const y1989 = -(H - 120) / 3 + 60; // constant regardless of scale
			const y1993 = /** @param {(year: number) => number} scale */ (scale) =>
				(-(H - 120) / 3) * 2 + 60 + scale(1993);

			ScrollTrigger.create({
				trigger: '#timeline-container',
				start: 'top top',
				end: 'bottom top',
				pin: '#timeline',
				preventOverlaps: true,
				invalidateOnRefresh: true
			});

			// Initial states — same as original: gsap.set for date-us/date-uk,
			// inline style="opacity:0" in HTML for all other hidden dates.
			gsap.set('#prologue-1', { translateY: 30, opacity: 0 });
			gsap.set('#timeline-line', { height: 30, opacity: 0 });
			gsap.set(['#date-us', '#date-uk'], { translateY: 50, opacity: 0 });

			// tl1: Reveal prologue-1, timeline line, 1989 and 1993
			const tl1 = gsap.timeline({
				scrollTrigger: {
					trigger: '#timeline-container',
					start: 'top 20%',
					toggleActions: 'play none none reverse',
					invalidateOnRefresh: true
				}
			});
			tl1
				.to('#prologue-1', { translateY: 0, opacity: 1, ease: 'power3.out', duration: 2 })
				.to(
					'#timeline-line',
					{ height: H - 120, opacity: 1, ease: 'power3.out', duration: 2 },
					'-=2'
				)
				.to(['#date-us', '#date-uk'], { translateY: 0, opacity: 1, ease: 'power3.out', duration: 2 }, '-=2');

			// tl2: Reveal prologue-2, 2012 appears, all dates move to [1989, 2012] positions
			const tl2 = gsap.timeline({
				scrollTrigger: {
					trigger: '#prologue-2',
					start: 'top bottom',
					toggleActions: 'play none none reverse',
					invalidateOnRefresh: true
				}
			});
			tl2
				.from('#prologue-2', { translateY: 30, opacity: 0, ease: 'power3.out', duration: 2 })
				.to('#date-us', { translateY: y1989, opacity: 1, ease: 'power3.out', duration: 3 }, '-=1')
				.to('#date-uk', { translateY: y1993(scale2012), opacity: 1, ease: 'power3.out', duration: 3 }, '-=3')
				.to(
					'#date-andy',
					{ translateY: bottomY(2012, scale2012), opacity: 1, ease: 'power3.out', duration: 3 },
					'-=3'
				);

			// tl3: Reveal prologue-3, 2015 appears, dates move to [1989, 2015] positions
			const tl3 = gsap.timeline({
				scrollTrigger: {
					trigger: '#prologue-3',
					start: 'top bottom',
					toggleActions: 'play none none reverse',
					invalidateOnRefresh: true
				}
			});
			tl3
				.from('#prologue-3', { translateY: 30, opacity: 0, ease: 'power3.out', duration: 2 })
				.to(
					'#date-hulu',
					{ translateY: bottomY(2015, scale2015), opacity: 1, ease: 'power3.out', duration: 3 },
					'-=1'
				)
				.to('#date-uk', { translateY: y1993(scale2015), opacity: 1, ease: 'power3.out', duration: 3 }, '-=3')
				.to(
					'#date-andy',
					{ translateY: bottomY(2012, scale2015), opacity: 1, ease: 'power3.out', duration: 3 },
					'-=3'
				);

			// tl4: Reveal prologue-4, 2021 appears, dates move to [1989, 2021] positions
			const tl4 = gsap.timeline({
				scrollTrigger: {
					trigger: '#prologue-4',
					start: 'top bottom',
					toggleActions: 'play none none reverse',
					invalidateOnRefresh: true
				}
			});
			tl4
				.from('#prologue-4', { translateY: 30, opacity: 0, ease: 'power3.out', duration: 2 })
				.to(
					'#date-netflix',
					{ translateY: bottomY(2021, scale2021), opacity: 1, ease: 'power3.out', duration: 3 },
					'-=1'
				)
				.to('#date-uk', { translateY: y1993(scale2021), opacity: 1, ease: 'power3.out', duration: 3 }, '-=3')
				.to(
					'#date-andy',
					{ translateY: bottomY(2012, scale2021), opacity: 1, ease: 'power3.out', duration: 3 },
					'-=3'
				)
				.to(
					'#date-hulu',
					{ translateY: bottomY(2015, scale2021), opacity: 1, ease: 'power3.out', duration: 3 },
					'-=3'
				);
		});
	});

	onDestroy(() => {
		ctx?.revert();
	});
</script>

<svelte:window bind:innerWidth bind:innerHeight />

<div id="timeline-container" class="container mt-20 grid grid-cols-3 md:grid-cols-2">
	<div class="col-span-2 px-4 md:col-span-1 bg-black">
		<div class="flex h-screen flex-col justify-center">
			<p id="prologue-1">
				Though the first episode was aired in the US in 1989, there would be a four-year delay until
				it was broadcast in the UK. As a teenager, and with the show lurking in the shadows of BBC's
				late-night schedules, it passed me by.
			</p>
		</div>
		<div class="flex h-screen flex-col justify-center">
			<p id="prologue-2">
				It wasn't until the 2010s when Seinfeld reappeared on UK TV in a prime-time slot.
				Fully aware of the show's standing in the canon of popular culture, this was my
				opportunity to tune in.
			</p>
		</div>
		<div class="flex h-screen flex-col justify-center">
			<p id="prologue-3">
				During the 2010s Seinfeld was also shown on cable networks, like Comedy Central, and then
				from 2015 became available on-demand in the USA on Hulu.
			</p>
		</div>
		<div class="flex h-screen flex-col justify-center">
			<p id="prologue-4">
				In 2019, Netflix spent over $500 million for the global streaming rights to broadcast
				Seinfeld from 2021 through to 2026. This propelled the show to a whole new generation of
				audiences.
			</p>
		</div>
	</div>
	<div id="timeline" class="relative col-span-1 px-4">
		<div
			id="timeline-line"
			class="absolute bg-white"
			style="left: {innerWidth >= 768 ? 213 : 85}px; width: 2px; height: {innerHeight -
				120}px; border-radius: 1px; top: 60px;"
		></div>

		<div
			id="date-1"
			class="absolute w-full"
			style={`top: ${(innerHeight - 120) / 3 + 30}px; left: 0`}
		>
			<div id="date-us" class="flex items-center">
				<div id="year-us" class="year" style="width: {innerWidth >= 768 ? 176 : 60}px;">1989</div>
				<div class="circle bg-white"></div>
				{#if innerWidth >= 996}
					<div class="timeline-description" style="margin-left: 24px">Seinfeld first aired on NBC in the USA</div>
				{/if}
			</div>
		</div>

		<div
			id="date-2"
			class="absolute w-full"
			style={`top: ${((innerHeight - 120) / 3) * 2 + 30}px; left: 0`}
		>
			<div id="date-uk" class="flex items-center">
				<div id="year-uk" class="year" style="width: {innerWidth >= 768 ? 176 : 60}px;">1993</div>
				<div class="circle bg-white"></div>
				{#if innerWidth >= 996}
					<div class="timeline-description" style="margin-left: 24px">Seinfeld first aired on BBC2 in the UK</div>
				{/if}
			</div>
		</div>

		<div id="date-3" class="absolute w-full" style={`top: ${innerHeight - 120 + 30}px; left: 0`}>
			<div id="date-andy" class="flex items-center" style="opacity: 0">
				<div id="year-andy" class="year" style="width: {innerWidth >= 768 ? 176 : 60}px;">2012</div>
				<div class="pulse circle bg-accent"></div>
				{#if innerWidth >= 996}
					<div class="timeline-description" style="margin-left: 24px">Seinfeld returns to UK prime-time on Sky TV</div>
				{/if}
			</div>
		</div>

		<div id="date-4" class="absolute w-full" style={`top: ${innerHeight - 120 + 30}px; left: 0`}>
			<div id="date-hulu" class="flex items-center" style="opacity: 0">
				<div class="year" style="width: {innerWidth >= 768 ? 176 : 60}px;">2015</div>
				<div class="circle bg-white"></div>
				{#if innerWidth >= 996}
					<div class="timeline-description" style="margin-left: 24px">Seinfeld available on-demand on Hulu in the USA</div>
				{/if}
			</div>
		</div>

		<div id="date-5" class="absolute w-full" style={`top: ${innerHeight - 120 + 30}px; left: 0`}>
			<div id="date-netflix" class="flex items-center" style="opacity: 0">
				<div class="year" style="width: {innerWidth >= 768 ? 176 : 60}px;">2021</div>
				<div class="circle bg-white"></div>
				{#if innerWidth >= 996}
					<div class="timeline-description" style="margin-left: 24px">Seinfeld launches on Netflix with worldwide streaming</div>
				{/if}
			</div>
		</div>
	</div>
</div>

<style>
	#prologue-1,
	#date-us,
	#date-uk {
		opacity: 0;
	}
	#prologue-1,
	#prologue-2,
	#prologue-3,
	#prologue-4 {
		background-color: #12020a;
	}
	.year {
		margin-right: 12px;
		text-align: right;
		font-size: 1.5rem;
		font-weight: 600;
	}
	@media screen and (min-width: 768px) {
		.year {
			margin-right: 24px;
			font-size: 1.875rem;
		}
	}
	@media screen and (min-width: 996px) {
		#timeline-line {
			left: 213px;
		}
		.year {
			width: 176px;
			min-width: 176px;
		}
	}
	.circle {
		width: 28px;
		min-width: 28px;
		height: 28px;
		border-radius: 50%;
	}
	.timeline-description {
		line-height: 1.4;
	}
	.pulse {
		animation: pulse-animation 2s infinite;
	}

	@keyframes pulse-animation {
		0% {
			box-shadow: 0 0 0 0px rgba(231, 29, 128, 0.5);
		}
		100% {
			box-shadow: 0 0 0 20px rgba(231, 29, 128, 0);
		}
	}
</style>

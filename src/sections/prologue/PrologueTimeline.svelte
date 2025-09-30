<script>
	import { onMount } from 'svelte';
	import { gsap } from 'gsap/dist/gsap';
	import { scaleLinear } from 'd3-scale';

	let { ScrollTrigger } = $props();

	/**
	 * @type {number}
	 */
	let innerWidth = $state(1600);
	let innerHeight = $state(800);

	onMount(() => {
		const yearsScale = scaleLinear()
			.domain([1989, 2012])
			.range([0, innerHeight - 240]);

		if (innerWidth >= 768) {
			// Pin timeline
			ScrollTrigger.create({
				trigger: '#timeline-container',
				start: 'top top',
				end: 'bottom top',
				pin: '#timeline',
				preventOverlaps: true
			});
		}

		// Reveal text 1 and timeline
		gsap.set('#prologue-1', {
			translateY: 30,
			opacity: 0
		});
		gsap.set('#timeline-line', {
			height: 30,
			opacity: 0
		});
		gsap.set(['#date-us', '#date-uk'], {
			translateY: 50,
			opacity: 0
		});
		const tl1 = gsap.timeline({
			scrollTrigger: {
				trigger: '#timeline-container',
				start: 'top 20%',
				toggleActions: 'play reverse play reverse'
			}
		});
		tl1
			.to('#prologue-1', {
				translateY: 0,
				opacity: 1,
				ease: 'power3.out',
				duration: 2
			})
			.to(
				'#timeline-line',
				{
					height: innerHeight - 120,
					opacity: 1,
					ease: 'power3.out',
					duration: 2
				},
				'-=2'
			)
			.to(
				['#date-us', '#date-uk'],
				{
					translateY: 0,
					opacity: 1,
					ease: 'power3.out',
					duration: 2
				},
				'-=2'
			);

		// Reveal text 2 and animate timeline
		const tl2 = gsap.timeline({
			scrollTrigger: {
				trigger: '#prologue-2',
				start: 'top bottom',
				toggleActions: 'play reverse play reverse'
			}
		});
		tl2
			.from('#prologue-2', {
				translateY: 30,
				opacity: 0,
				ease: 'power3.out',
				duration: 2
			})
			.to(
				'#date-us',
				{
					translateY: -(innerHeight - 120) / 3 + 60,
					ease: 'power3.out',
					duration: 3
				},
				'-=1'
			)
			.to(
				'#date-uk',
				{
					translateY: (-(innerHeight - 120) / 3) * 2 + 60 + yearsScale(1993),
					ease: 'power3.out',
					duration: 3
				},
				'-=3'
			)
			.to(
				'#date-andy',
				{
					translateY: -(innerHeight - 120) + 60 + yearsScale(2012),
					opacity: 1,
					ease: 'power3.out',
					duration: 3
				},
				'-=3'
			);
	});
</script>

<svelte:window bind:innerWidth bind:innerHeight />

<div id="timeline-container" class="container mt-20 grid grid-cols-3 md:grid-cols-2">
	<div class="col-span-2 px-4 md:col-span-1">
		<div class="flex h-screen flex-col justify-center">
			<p id="prologue-1">
				Though the first episode was aired in the US in 1989, there would be a four-year delay until
				it was broadcast in the UK. As a teenager, and with the show lurking in the shadows of BBC’s
				late-night schedules, it passed me by.
			</p>
		</div>
		<div class="flex h-screen flex-col justify-center">
			<p id="prologue-2">
				It wasn't until the 2010s when Seinfeld reappeared on UK TV in a prime-time slot.
				Fully aware of the show's standing in the canon of popular culture this was my best
				opportunity to tune in.
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
				<div id="circle-us" class="circle bg-white"></div>
				{#if innerWidth >= 996}
					<div id="desc-us" class="timeline-description" style={`margin-left: 24px`}>Seinfeld first aired on NBC in the USA</div>
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
				<div id="circle-uk" class="circle bg-white"></div>
				{#if innerWidth >= 996}
					<div id="desc-uk" class="timeline-description" style={`margin-left: 24px`}>Seinfeld first aired on BBC2 in the UK</div>
				{/if}
			</div>
		</div>
		<div id="date-3" class="absolute w-full" style={`top: ${innerHeight - 120 + 30}px; left: 0`}>
			<div id="date-andy" class="flex items-center" style="opacity: 0">
				<div id="year-andy" class="year" style="width: {innerWidth >= 768 ? 176 : 60}px;">2012</div>
				<div id="circle-andy" class="pulse circle bg-accent"></div>
				{#if innerWidth >= 996}
					<div id="desc-andy" class="timeline-description" style={`margin-left: 24px`}>
						Seinfeld returns to UK prime-time on Sky TV
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>

<style>
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

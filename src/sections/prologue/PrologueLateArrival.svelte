<script>
	import { onMount } from 'svelte';
	import { gsap } from 'gsap/dist/gsap';

	import DownIcon from '../../icons/DownIcon.svelte';

	onMount(() => {
		// Reveal first sentence and down icon
		const tl = gsap.timeline();
		tl
			.to('#prologue-1', {
				translateY: -30,
				opacity: 1,
				ease: 'power3.out',
				duration: 2,
				delay: 1
			})
			.to(
				'#down-icons',
				{
					translateY: 0,
					opacity: 1,
					duration: 2,
					ease: 'power3.out'
				},
				'-=0.5'
			);

		// Hide down icons
		const tl2 = gsap.timeline({
			scrollTrigger: {
				trigger: '#prologue-container',
				start: 'bottom center',
				// end: 'bottom center',
				// toggleActions: 'play reverse play reverse',
				// markers: true
			}
		});
		tl2.to('#down-icons', {
			translateY: -40,
			opacity: 0,
			duration: 2,
			ease: 'power3.out'
		});
	});
</script>

<div id="prologue-container" class="relative flex h-screen items-center">
	<div class="container">
		<div id="prologue-1">I was a late arrival to Seinfeld fandom.</div>
	</div>
	<div id="down-icons" class="down-icons-container flex justify-center gap-4 absolute bottom-4 number w-full">
		<div class="flex flex-col items-center gap-4">
			<svg width="41" height="64" viewBox="0 0 41 64">
				<rect x="1" y="0.5" width="39" height="63" rx="19.5" stroke="#F9F5F7" stroke-opacity="0.5"/>
				<rect id="mouse-rect" x="18.5" y="12" width="4" height="12" rx="2" fill="#F9F5F7"/>
			</svg>
			<div class="w-32 text-center opacity-50">Scroll down</div>
		</div>
		<div class="flex flex-col items-center opacity-50">
			<div style="padding-top: 80px;">or</div>
		</div>
		<div class="flex flex-col items-center gap-4">
			<svg width="65" height="64" viewBox="0 0 65 64" fill="none" xmlns="http://www.w3.org/2000/svg">
				<rect x="1" y="0.5" width="63" height="29" rx="7.5" stroke="#F9F5F7" stroke-opacity="0.5"/>
				<path d="M31.7465 11.8605L26.9505 17.3415C26.3845 17.9885 26.8445 19.0005 27.7035 19.0005H37.2955C37.4878 19.0007 37.676 18.9454 37.8376 18.8414C37.9993 18.7373 38.1275 18.5889 38.207 18.4138C38.2864 18.2388 38.3137 18.0445 38.2856 17.8543C38.2575 17.6642 38.1752 17.4861 38.0485 17.3415L33.2525 11.8615C33.1587 11.7541 33.0429 11.668 32.913 11.609C32.7832 11.55 32.6422 11.5195 32.4995 11.5195C32.3569 11.5195 32.2159 11.55 32.086 11.609C31.9561 11.668 31.8404 11.7531 31.7465 11.8605Z" fill="#F9F5F7" fill-opacity="0.5"/>
				<rect x="64" y="63.5" width="63" height="29" rx="7.5" transform="rotate(-180 64 63.5)" stroke="#F9F5F7" stroke-opacity="0.5"/>
				<path id="arrow-down" d="M33.2535 52.1395L38.0495 46.6585C38.6155 46.0115 38.1555 44.9995 37.2965 44.9995L27.7045 44.9995C27.5122 44.9993 27.324 45.0546 27.1624 45.1586C27.0007 45.2627 26.8725 45.4111 26.793 45.5862C26.7136 45.7612 26.6863 45.9555 26.7144 46.1457C26.7425 46.3358 26.8248 46.5139 26.9515 46.6585L31.7475 52.1385C31.8413 52.2459 31.9571 52.332 32.087 52.391C32.2168 52.45 32.3578 52.4805 32.5005 52.4805C32.6431 52.4805 32.7841 52.45 32.914 52.391C33.0439 52.332 33.1596 52.2469 33.2535 52.1395Z" fill="#F9F5F7"/>
			</svg>
			<div class="w-32 text-center opacity-50">Use keyboard arrows</div>
		</div>
	</div>
</div>

<style>
	#prologue-1 {
		opacity: 0;
		transform: translateY(30px);
	}
	#down-icons {
		opacity: 0;
		transform: translateY(40px);
	}

	#mouse-rect {
		animation: scroll-down 2s infinite;
	}
	#arrow-down {
		animation: click-down 2s infinite;
	}

	@keyframes scroll-down {
		0% {
			transform: translateY(0px);
			opacity: 0;
		}
		10% {
			transform: translateY(0px);
			opacity: 1;
		}
		75% {
			opacity: 1;
		}
		100% {
			height: 4px;
			transform: translateY(39px);
			opacity: 0;
		}
	}
	@keyframes click-down {
		0% {
			transform: translateY(-5px);
			opacity: 0;
		}
		10% {
			opacity: 1;
		}
		75% {
			opacity: 1;
		}
		100% {
			transform: translateY(5px);
			opacity: 0;
		}
	}
</style>

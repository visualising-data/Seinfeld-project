<script>
	import { onMount } from 'svelte';
	import { gsap } from 'gsap/dist/gsap';
	import Lenis from 'lenis';

	import BookCover from '$lib/assets/book/book_cover.jpg';
	import BookIntro from '$lib/assets/book/book_intro.jpg';
	import BookCalendar from '$lib/assets/book/book_calendar.jpg';
	import BookLaughs from '$lib/assets/book/book_laughs.jpg';
	import BookScatterplot from '$lib/assets/book/book_scatterplot.jpg';
	import BookQuotes from '$lib/assets/book/book_quotes.jpg';
	import BookCatalog1 from '$lib/assets/book/book_catalog1.png';
	import BookCatalog2 from '$lib/assets/book/book_catalog2.png';

	let { ScrollTrigger } = $props();

	let innerWidth = $state(1600);
	let innerHeight = $state(800);

	onMount(() => {
		// Pin text and book cover
		ScrollTrigger.create({
			trigger: '#books-inner-container',
			start: 'bottom bottom',
			pin: '#book-cover-container',
			preventOverlaps: true
		});

		// Handle horizontal scroll
		let imgSlider = document.getElementById('books-inner-container');
		let imgSliderMain = document.getElementById('books-outer-container');

		if (imgSlider) {
			let calculateSliderX = 3000;

			let imgSliderTimeline = gsap.timeline({
				default: {
					ease: 'none'
				},
				scrollTrigger: {
					trigger: imgSliderMain,
					pin: true,
					start: 'bottom bottom',
					scrub: 1
				}
			});
			imgSliderTimeline
				.to(imgSlider, {
					x: -calculateSliderX
				})
				.to(
					'#book-cover',
					{
						scale: 1.08
					},
					0
				)
				.from(
					'#accent-line',
					{
						width: 0
					},
					0
				);
		}

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
</script>

<svelte:window bind:innerWidth bind:innerHeight />

<div id="book-section-container" class="flex h-screen flex-col justify-between">
	<div
		id="book-cover-container"
		class="container grid grid-cols-1 lg:grid-cols-2"
		style="margin-top: {innerHeight / 6}px;"
	>
		<div class="col-span-1 flex h-full items-center px-4">
			<div>
				<p>
					My curiosity transcended just <a
						href="https://jenniferkarmstrong.com/books/seinfeldia/"
						target="_blank">reading more about the show</a
					>, it was now time to go deep. I decided to immerse myself in an entirely unnecessary,
					self-motivated, long-running, data-driven exploration of every episode of Seinfeld. Why
					not!
				</p>
				<p>
					The first product of this work was my 2020 publishing of The Seinfeld Chronicles, a
					limited-edition printed book presenting all my extensive analysis. With 176 copies
					released, matching the number of written episodes, this reached a small but exclusive - and passionate - 
					audience. In 2024 I decided it was time to work on a new product, to reach a wider
					audience with a completely new format: The Seinfeld Chronicles digital edition.
				</p>
			</div>
		</div>
		<div class="col-span-1 px-4">
			<img id="book-cover" src={BookCover} alt="Cover of the book The Seinfeld Chronicles." />
		</div>
	</div>
	<div id="books-outer-container">
		<div id="accent-line" class="mb-3 h-2 w-full" style="background-color: #E71D80;"></div>
		<div id="books-inner-container" class="flex">
			<img
				class="mx-4"
				style="height: {innerHeight / 3.5}px;"
				src={BookIntro}
				alt="Introduction of the book."
			/>
			<img
				class="mx-4"
				style="height: {innerHeight / 3.5}px;"
				src={BookCalendar}
				alt="Calendar of the nine seasons of Seinfeld."
			/>
			<img
				class="mx-4"
				style="height: {innerHeight / 3.5}px;"
				src={BookLaughs}
				alt="Data visualizations of the laughs caused by the four main characters."
			/>
			<img
				class="mx-4"
				style="height: {innerHeight / 3.5}px;"
				src={BookScatterplot}
				alt="Data visualizations of the peak performances of the four main characters."
			/>
			<img
				class="mx-4"
				style="height: {innerHeight / 3.5}px;"
				src={BookQuotes}
				alt="Famous quotes from each episode."
			/>
			<img
				class="mx-4"
				style="height: {innerHeight / 3.5}px;"
				src={BookCatalog1}
				alt="Data visualization of season 4 episode 11 'The Contest'."
			/>
			<img
				class="mx-4"
				style="height: {innerHeight / 3.5}px;"
				src={BookCatalog2}
				alt="Data visualization of season 7 episode 6 'The Soup Nazi'."
			/>
		</div>
	</div>
</div>

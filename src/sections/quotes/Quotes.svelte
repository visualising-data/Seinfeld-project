<script>
	import { quotes } from '$lib/data/quotes';
	import { seasons } from '$lib/data/seasons';
	import Quote from './Quote.svelte';

	let widthQuotesSeason1 = $state()
	let widthQuotesSeason2 = $state()
	let widthQuotesSeason3 = $state()
	let widthQuotesSeason4 = $state()
	let widthQuotesSeason5 = $state()
	let widthQuotesSeason6 = $state()
	let widthQuotesSeason7 = $state()
	let widthQuotesSeason8 = $state()
	let widthQuotesSeason9 = $state()

</script>

<div class="bg-black text-white py-80">
	<div class="flex h-screen items-center overflow-x-auto">
		<div>
			<!-- Season 1 -->
				<ul class="quotes-list flex flex-nowrap">
					<div bind:clientWidth={widthQuotesSeason1} class="flex scrolling-text-right" style="animation-duration: {widthQuotesSeason1 / 50}s;">
						{#each quotes.filter((quote) => quote.season === 1) as quote}
							<Quote {quote} />
						{/each}
					</div>
					<!-- Repeat for infinite scroll effect -->
					<div class="flex scrolling-text-right" style="animation-duration: {widthQuotesSeason1 / 50}s;">
						{#each quotes.filter((quote) => quote.season === 1) as quote}
							<Quote {quote} />
						{/each}
					</div>
				</ul>
				
			<!-- Season 2 -->
				<ul class="quotes-list flex flex-nowrap">
					<div bind:clientWidth={widthQuotesSeason2} class="flex scrolling-text-left" style="animation-duration: {widthQuotesSeason2 / 50}s;">
						{#each quotes.filter((quote) => quote.season === 2) as quote}
							<Quote {quote} />
						{/each}
					</div>
					<!-- Repeat for infinite scroll effect -->
					<div class="flex scrolling-text-left" style="animation-duration: {widthQuotesSeason2 / 50}s;">
						{#each quotes.filter((quote) => quote.season === 2) as quote}
							<Quote {quote} />
						{/each}
					</div>
				</ul>

			<!-- Season 3 -->
				<ul class="quotes-list flex flex-nowrap">
					<div bind:clientWidth={widthQuotesSeason3} class="flex scrolling-text-right" style="animation-duration: {widthQuotesSeason3 / 50}s;">
						{#each quotes.filter((quote) => quote.season === 3) as quote}
							<Quote {quote} />
						{/each}
					</div>
					<!-- Repeat for infinite scroll effect -->
					<div class="flex scrolling-text-right" style="animation-duration: {widthQuotesSeason3 / 50}s;">
						{#each quotes.filter((quote) => quote.season === 3) as quote}
							<Quote {quote} />
						{/each}
					</div>
				</ul>
				
			<!-- Season 4 -->
				<ul class="quotes-list flex flex-nowrap">
					<div bind:clientWidth={widthQuotesSeason4} class="flex scrolling-text-left" style="animation-duration: {widthQuotesSeason4 / 50}s;">
						{#each quotes.filter((quote) => quote.season === 4) as quote}
							<Quote {quote} />
						{/each}
					</div>
					<!-- Repeat for infinite scroll effect -->
					<div class="flex scrolling-text-left" style="animation-duration: {widthQuotesSeason4 / 50}s;">
						{#each quotes.filter((quote) => quote.season === 4) as quote}
							<Quote {quote} />
						{/each}
					</div>
				</ul>

			<!-- Season 5 -->
				<ul class="quotes-list flex flex-nowrap">
					<div bind:clientWidth={widthQuotesSeason5} class="flex scrolling-text-right" style="animation-duration: {widthQuotesSeason5 / 50}s;">
						{#each quotes.filter((quote) => quote.season === 5) as quote}
							<Quote {quote} />
						{/each}
					</div>
					<!-- Repeat for infinite scroll effect -->
					<div class="flex scrolling-text-right" style="animation-duration: {widthQuotesSeason5 / 50}s;">
						{#each quotes.filter((quote) => quote.season === 5) as quote}
							<Quote {quote} />
						{/each}
					</div>
				</ul>
				
			<!-- Season 6 -->
				<ul class="quotes-list flex flex-nowrap">
					<div bind:clientWidth={widthQuotesSeason6} class="flex scrolling-text-left" style="animation-duration: {widthQuotesSeason6 / 50}s;">
						{#each quotes.filter((quote) => quote.season === 6) as quote}
							<Quote {quote} />
						{/each}
					</div>
					<!-- Repeat for infinite scroll effect -->
					<div class="flex scrolling-text-left" style="animation-duration: {widthQuotesSeason6 / 50}s;">
						{#each quotes.filter((quote) => quote.season === 6) as quote}
							<Quote {quote} />
						{/each}
					</div>
				</ul>

			<!-- Season 7 -->
				<ul class="quotes-list flex flex-nowrap">
					<div bind:clientWidth={widthQuotesSeason7} class="flex scrolling-text-right" style="animation-duration: {widthQuotesSeason7 / 50}s;">
						{#each quotes.filter((quote) => quote.season === 7) as quote}
							<Quote {quote} />
						{/each}
					</div>
					<!-- Repeat for infinite scroll effect -->
					<div class="flex scrolling-text-right" style="animation-duration: {widthQuotesSeason7 / 50}s;">
						{#each quotes.filter((quote) => quote.season === 7) as quote}
							<Quote {quote} />
						{/each}
					</div>
				</ul>
				
			<!-- Season 8 -->
				<ul class="quotes-list flex flex-nowrap">
					<div bind:clientWidth={widthQuotesSeason8} class="flex scrolling-text-left" style="animation-duration: {widthQuotesSeason8 / 50}s;">
						{#each quotes.filter((quote) => quote.season === 8) as quote}
							<Quote {quote} />
						{/each}
					</div>
					<!-- Repeat for infinite scroll effect -->
					<div class="flex scrolling-text-left" style="animation-duration: {widthQuotesSeason8 / 50}s;">
						{#each quotes.filter((quote) => quote.season === 8) as quote}
							<Quote {quote} />
						{/each}
					</div>
				</ul>

			<!-- Season 9 -->
			<ul class="quotes-list flex flex-nowrap">
				<div bind:clientWidth={widthQuotesSeason9} class="flex scrolling-text-right" style="animation-duration: {widthQuotesSeason9 / 50}s;">
					{#each quotes.filter((quote) => quote.season === 9) as quote}
						<Quote {quote} />
					{/each}
				</div>
				<!-- Repeat for infinite scroll effect -->
				<div class="flex scrolling-text-right" style="animation-duration: {widthQuotesSeason9 / 50}s;">
					{#each quotes.filter((quote) => quote.season === 9) as quote}
						<Quote {quote} />
					{/each}
				</div>
			</ul>

		</div>
	</div>
</div>

<style>
	.quotes-list {
		line-height: 2.5;
	}
	.quotes-list:hover .scrolling-text-right,
	.quotes-list:hover .scrolling-text-left {
		animation-play-state: paused;
	}
	.scrolling-text-right {
		transform: translateX(0);
    animation: text-scroll-right linear infinite;
	}
	@keyframes text-scroll-right {
    0% { transform: translate3d(-100%, 0, 0); }
    100% { transform: translate3d(0%, 0, 0); }
	}
	.scrolling-text-left {
		transform: translateX(0);
    animation: text-scroll-left linear infinite;
	}
	@keyframes text-scroll-left {
    0% { transform: translate3d(0, 0, 0); }
    100% { transform: translate3d(-100%, 0, 0); }
	}
</style>

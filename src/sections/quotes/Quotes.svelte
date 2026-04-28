<script lang="ts">
  import { quotes } from '$lib/data/quotes';
  import { getIllustrationForEpisode } from '$lib/data/illustrations';
  import Quote from './Quote.svelte';

  let widthQuotesSeason1 = $state(0);
  let widthQuotesSeason2 = $state(0);
  let widthQuotesSeason3 = $state(0);
  let widthQuotesSeason4 = $state(0);
  let widthQuotesSeason5 = $state(0);
  let widthQuotesSeason6 = $state(0);
  let widthQuotesSeason7 = $state(0);
  let widthQuotesSeason8 = $state(0);
  let widthQuotesSeason9 = $state(0);

  const positions = [
    'top: 5%; left: 5%;',
    'top: 5%; left: 50%; transform: translateX(-50%);',
    'top: 5%; right: 5%;',
    'bottom: 5%; left: 5%;',
    'bottom: 5%; left: 50%; transform: translateX(-50%);',
    'bottom: 5%; right: 5%;',
  ];

  let activeIllustration: { url: string; positionStyle: string; rotation: number } | null =
    $state(null);

  function handleQuoteHover(quote: { season: number; episode: number }) {
    const url = getIllustrationForEpisode(quote.season, quote.episode);
    if (!url) {
      activeIllustration = null;
      return;
    }
    const positionStyle = positions[Math.floor(Math.random() * positions.length)];
    const rotation = (Math.random() - 0.5) * 30;
    activeIllustration = { url, positionStyle, rotation };
  }

  function handleQuoteLeave() {
    activeIllustration = null;
  }
</script>

{#if activeIllustration}
  <div
    class="illustration-overlay"
    style="{activeIllustration.positionStyle} --rotation: {activeIllustration.rotation}deg;"
  >
    <img src={activeIllustration.url} alt="" />
  </div>
{/if}

<div class="bg-black text-white py-80">
  <div class="flex h-screen items-center overflow-x-hidden">
    <div>
      <!-- Season 1 -->
      <div class="quotes-list flex flex-nowrap">
        <div
          bind:clientWidth={widthQuotesSeason1}
          class="flex scrolling-text-right"
          style="animation-duration: {widthQuotesSeason1 / 50}s;"
        >
          {#each quotes.filter((quote) => quote.season === 1) as quote}
            <Quote {quote} onillustrationhover={handleQuoteHover} onillustrationleave={handleQuoteLeave} />
          {/each}
        </div>
        <!-- Repeat for infinite scroll effect -->
        <div
          class="flex scrolling-text-right"
          style="animation-duration: {widthQuotesSeason1 / 50}s;"
        >
          {#each quotes.filter((quote) => quote.season === 1) as quote}
            <Quote {quote} onillustrationhover={handleQuoteHover} onillustrationleave={handleQuoteLeave} />
          {/each}
        </div>
      </div>

      <!-- Season 2 -->
      <div class="quotes-list flex flex-nowrap">
        <div
          bind:clientWidth={widthQuotesSeason2}
          class="flex scrolling-text-left"
          style="animation-duration: {widthQuotesSeason2 / 50}s;"
        >
          {#each quotes.filter((quote) => quote.season === 2) as quote}
            <Quote {quote} onillustrationhover={handleQuoteHover} onillustrationleave={handleQuoteLeave} />
          {/each}
        </div>
        <!-- Repeat for infinite scroll effect -->
        <div
          class="flex scrolling-text-left"
          style="animation-duration: {widthQuotesSeason2 / 50}s;"
        >
          {#each quotes.filter((quote) => quote.season === 2) as quote}
            <Quote {quote} onillustrationhover={handleQuoteHover} onillustrationleave={handleQuoteLeave} />
          {/each}
        </div>
      </div>

      <!-- Season 3 -->
      <div class="quotes-list flex flex-nowrap">
        <div
          bind:clientWidth={widthQuotesSeason3}
          class="flex scrolling-text-right"
          style="animation-duration: {widthQuotesSeason3 / 50}s;"
        >
          {#each quotes.filter((quote) => quote.season === 3) as quote}
            <Quote {quote} onillustrationhover={handleQuoteHover} onillustrationleave={handleQuoteLeave} />
          {/each}
        </div>
        <!-- Repeat for infinite scroll effect -->
        <div
          class="flex scrolling-text-right"
          style="animation-duration: {widthQuotesSeason3 / 50}s;"
        >
          {#each quotes.filter((quote) => quote.season === 3) as quote}
            <Quote {quote} onillustrationhover={handleQuoteHover} onillustrationleave={handleQuoteLeave} />
          {/each}
        </div>
      </div>

      <!-- Season 4 -->
      <div class="quotes-list flex flex-nowrap">
        <div
          bind:clientWidth={widthQuotesSeason4}
          class="flex scrolling-text-left"
          style="animation-duration: {widthQuotesSeason4 / 50}s;"
        >
          {#each quotes.filter((quote) => quote.season === 4) as quote}
            <Quote {quote} onillustrationhover={handleQuoteHover} onillustrationleave={handleQuoteLeave} />
          {/each}
        </div>
        <!-- Repeat for infinite scroll effect -->
        <div
          class="flex scrolling-text-left"
          style="animation-duration: {widthQuotesSeason4 / 50}s;"
        >
          {#each quotes.filter((quote) => quote.season === 4) as quote}
            <Quote {quote} onillustrationhover={handleQuoteHover} onillustrationleave={handleQuoteLeave} />
          {/each}
        </div>
      </div>

      <!-- Season 5 -->
      <div class="quotes-list flex flex-nowrap">
        <div
          bind:clientWidth={widthQuotesSeason5}
          class="flex scrolling-text-right"
          style="animation-duration: {widthQuotesSeason5 / 50}s;"
        >
          {#each quotes.filter((quote) => quote.season === 5) as quote}
            <Quote {quote} onillustrationhover={handleQuoteHover} onillustrationleave={handleQuoteLeave} />
          {/each}
        </div>
        <!-- Repeat for infinite scroll effect -->
        <div
          class="flex scrolling-text-right"
          style="animation-duration: {widthQuotesSeason5 / 50}s;"
        >
          {#each quotes.filter((quote) => quote.season === 5) as quote}
            <Quote {quote} onillustrationhover={handleQuoteHover} onillustrationleave={handleQuoteLeave} />
          {/each}
        </div>
      </div>

      <!-- Season 6 -->
      <div class="quotes-list flex flex-nowrap">
        <div
          bind:clientWidth={widthQuotesSeason6}
          class="flex scrolling-text-left"
          style="animation-duration: {widthQuotesSeason6 / 50}s;"
        >
          {#each quotes.filter((quote) => quote.season === 6) as quote}
            <Quote {quote} onillustrationhover={handleQuoteHover} onillustrationleave={handleQuoteLeave} />
          {/each}
        </div>
        <!-- Repeat for infinite scroll effect -->
        <div
          class="flex scrolling-text-left"
          style="animation-duration: {widthQuotesSeason6 / 50}s;"
        >
          {#each quotes.filter((quote) => quote.season === 6) as quote}
            <Quote {quote} onillustrationhover={handleQuoteHover} onillustrationleave={handleQuoteLeave} />
          {/each}
        </div>
      </div>

      <!-- Season 7 -->
      <div class="quotes-list flex flex-nowrap">
        <div
          bind:clientWidth={widthQuotesSeason7}
          class="flex scrolling-text-right"
          style="animation-duration: {widthQuotesSeason7 / 50}s;"
        >
          {#each quotes.filter((quote) => quote.season === 7) as quote}
            <Quote {quote} onillustrationhover={handleQuoteHover} onillustrationleave={handleQuoteLeave} />
          {/each}
        </div>
        <!-- Repeat for infinite scroll effect -->
        <div
          class="flex scrolling-text-right"
          style="animation-duration: {widthQuotesSeason7 / 50}s;"
        >
          {#each quotes.filter((quote) => quote.season === 7) as quote}
            <Quote {quote} onillustrationhover={handleQuoteHover} onillustrationleave={handleQuoteLeave} />
          {/each}
        </div>
      </div>

      <!-- Season 8 -->
      <div class="quotes-list flex flex-nowrap">
        <div
          bind:clientWidth={widthQuotesSeason8}
          class="flex scrolling-text-left"
          style="animation-duration: {widthQuotesSeason8 / 50}s;"
        >
          {#each quotes.filter((quote) => quote.season === 8) as quote}
            <Quote {quote} onillustrationhover={handleQuoteHover} onillustrationleave={handleQuoteLeave} />
          {/each}
        </div>
        <!-- Repeat for infinite scroll effect -->
        <div
          class="flex scrolling-text-left"
          style="animation-duration: {widthQuotesSeason8 / 50}s;"
        >
          {#each quotes.filter((quote) => quote.season === 8) as quote}
            <Quote {quote} onillustrationhover={handleQuoteHover} onillustrationleave={handleQuoteLeave} />
          {/each}
        </div>
      </div>

      <!-- Season 9 -->
      <div class="quotes-list flex flex-nowrap">
        <div
          bind:clientWidth={widthQuotesSeason9}
          class="flex scrolling-text-right"
          style="animation-duration: {widthQuotesSeason9 / 50}s;"
        >
          {#each quotes.filter((quote) => quote.season === 9) as quote}
            <Quote {quote} onillustrationhover={handleQuoteHover} onillustrationleave={handleQuoteLeave} />
          {/each}
        </div>
        <!-- Repeat for infinite scroll effect -->
        <div
          class="flex scrolling-text-right"
          style="animation-duration: {widthQuotesSeason9 / 50}s;"
        >
          {#each quotes.filter((quote) => quote.season === 9) as quote}
            <Quote {quote} onillustrationhover={handleQuoteHover} onillustrationleave={handleQuoteLeave} />
          {/each}
        </div>
      </div>
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
    0% {
      transform: translate3d(-100%, 0, 0);
    }
    100% {
      transform: translate3d(0%, 0, 0);
    }
  }
  .scrolling-text-left {
    transform: translateX(0);
    animation: text-scroll-left linear infinite;
  }
  @keyframes text-scroll-left {
    0% {
      transform: translate3d(0, 0, 0);
    }
    100% {
      transform: translate3d(-100%, 0, 0);
    }
  }

  .illustration-overlay {
    position: fixed;
    z-index: 100;
    pointer-events: none;
    animation: float 3s ease-in-out infinite;
  }
  .illustration-overlay img {
    display: block;
    max-width: 320px;
    height: auto;
    transform: rotate(var(--rotation));
  }
  @keyframes float {
    0%,
    100% {
      translate: 0 0;
    }
    50% {
      translate: 0 -16px;
    }
  }
</style>

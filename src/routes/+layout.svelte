<script lang="ts">
  import '../app.css';
  import { onMount } from 'svelte';
  let { children } = $props();

  onMount(() => {
    // Always start a fresh page load at the top, ignoring the browser's
    // restored scroll position (important for the scrollytelling flow).
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
  });
</script>

<svelte:head>
  <title>The Seinfeld Chronicles</title>
  <meta
    name="description"
    content="The Seinfeld Chronicles digital edition visually and sonically presents an entirely unnecessary data-driven exploration of every episode of Seinfeld."
  />

  <!-- Open Graph (social sharing) -->
  <meta property="og:title" content="The Seinfeld Chronicles" />
  <meta
    property="og:description"
    content="The Seinfeld Chronicles digital edition visually and sonically presents an entirely unnecessary data-driven exploration of every episode of Seinfeld."
  />
  <meta
    property="og:image"
    content="https://seinfeld.visualisingdata.com/og-image.jpg"
  />
  <meta property="og:url" content="https://seinfeld.visualisingdata.com/" />
  <meta property="og:type" content="website" />

  <!-- Twitter/X Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="The Seinfeld Chronicles" />
  <meta
    name="twitter:description"
    content="The Seinfeld Chronicles digital edition visually and sonically presents an entirely unnecessary data-driven exploration of every episode of Seinfeld."
  />
  <meta
    name="twitter:image"
    content="https://seinfeld.visualisingdata.com/og-image-twitter.jpg"
  />
</svelte:head>

<a href="#intro" class="skip-link">Skip to main content</a>
{@render children()}

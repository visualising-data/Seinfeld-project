<script lang="ts">
  import '../app.css';
  let { children } = $props();
</script>

<svelte:head>
  <title>The Seinfeld Chronicles</title>
  <meta name="description" content="An unnecessary data exploration" />

  <!-- Open Graph (social sharing) -->
  <meta property="og:title" content="The Seinfeld Chronicles" />
  <meta property="og:description" content="An unnecessary data exploration" />
  <meta
    property="og:image"
    content="https://amdufour.github.io/hosted-data/apis/images/og-image.jpg"
  />
  <meta property="og:url" content="https://yoursite.com" />
  <meta property="og:type" content="website" />

  <!-- Twitter/X Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="The Seinfeld Chronicles" />
  <meta name="twitter:description" content="An unnecessary data exploration" />
  <meta
    name="twitter:image"
    content="https://amdufour.github.io/hosted-data/apis/images/og-image-twitter.jpg"
  />
</svelte:head>

{@render children()}

<script>
  import { seasons } from '$lib/data/seasons';

  let { quote } = $props();
</script>

<li class="flex mx-6 whitespace-nowrap quote quote-${quote.audio_clip_id}">
  <div
    class={`quote quote-${quote.audio_clip_id} relative inline`}
    style={`color: ${seasons.find((s) => s.seasonNum === quote.season)?.accessibleOverDarkColor}`}
  >
    {#if quote.revised_quote_text.length > 0}
      {quote.revised_quote_text}
    {:else}
      {quote.quote}
    {/if}
    <span class="quote-info small absolute left-0 top-9 lg:top-11" role="contentinfo"
      >{`s${quote.season}e${quote.episode} ${quote.episode_title}, ${quote.who}`}</span
    >
  </div>
</li>

<style>
  .quote {
    transition: color 250ms ease-out;
  }
  .quote.playing {
    color: #e71d80 !important;
  }
  .quote-info {
    transform: translateY(-10px);
    opacity: 0;
    transition: all 250ms ease-out;
  }
  .quote:hover .quote-info,
  .quote.playing .quote-info {
    transform: translateY(0);
    opacity: 1;
  }
</style>

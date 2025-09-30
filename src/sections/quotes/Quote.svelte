<script>
  import * as Tone from 'tone';
  import { seasons } from "$lib/data/seasons";
  import PlayQuoteIcon from "./PlayQuoteIcon.svelte";

  let { quote } = $props()

  let isQuoteHovered = $state(false)
  let isQuotePlaying = $state(false)

  /**
	 * @type {Tone.Player}
	 */
  let audio
  const playQuote = () => {
		isQuotePlaying = true
    // @ts-ignore
		audio = new Tone.Player().toDestination()
    audio.load(`https://amdufour.github.io/hosted-data/apis/audio_quotes/${quote.audio_clip_id}.m4a`).then(() => {
      audio.fadeIn = 1
      audio.fadeOut = 1
      audio.start()
    });

		setTimeout(
			() => {
				isQuotePlaying = false
			},
			(quote.duration + 1) * 1000
		);
	};
  const stopQuote = () => {
    audio.stop()
    isQuotePlaying = false
  }

	const handleMouseEnter = (/** @type {number} */ id) => {
		isQuoteHovered = true
	}
	const handleMouseLeave = () => {
		isQuoteHovered = false
	}
</script>

<li 
	class="flex whitespace-nowrap quote quote-${quote.audio_clip_id}"
	onmouseenter={() => handleMouseEnter(quote.audio_clip_id)}
	onmouseleave={handleMouseLeave}
>
  <button class="flex cursor-pointer" onclick={isQuotePlaying ? stopQuote : playQuote}>
    <div class="pr-2 pt-2 lg:pt-3 flex justify-end" style={"width: 54px;"}>
      {#if isQuoteHovered}
        <PlayQuoteIcon isPlaying={isQuotePlaying} />
      {/if}
    </div>
    <div
      class={`quote quote-${quote.audio_clip_id} relative inline ${isQuotePlaying ? 'playing' : ''}`}
      style={`color: ${seasons.find((s) => s.seasonNum === quote.season)?.accessibleOverDarkColor}`}
    >
      {#if quote.revised_quote_text.length > 0}
        {quote.revised_quote_text}
      {:else}
        {quote.quote}
      {/if}
      <span
        class="quote-info small absolute left-0 top-9 lg:top-11"
        role="contentinfo"
        >{`s${quote.season}e${quote.episode} ${quote.episode_title}, ${quote.who}`}</span
      >
    </div>
  </button>
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
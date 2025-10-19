<script>
  import { soundIsAuth } from "../stores/soundAuthStore";
  import PlayLineIcon from "../icons/PlayLineIcon.svelte";
  import StopLineIcon from "../icons/StopLineIcon.svelte";

  let { isPlaying, handleClickOnReplay = $bindable() } = $props()
</script>

<button 
  class="replay-button relative flex justify-center items-center w-8 h-8 rounded-full"
  onclick={handleClickOnReplay}
  disabled={!$soundIsAuth}>
  {#if isPlaying}
    <StopLineIcon />
  {:else}
    <PlayLineIcon />
  {/if}
</button>

<style>
  .replay-button {
    background: #E71D80;
    transition: all 0.5s ease;
    overflow: hidden;
  }
  .replay-button:hover {
    background: linear-gradient(
		  90deg,
		  rgba(253, 232, 36, 1) 0%,
		  rgba(184, 206, 50, 1) 6.25%,
		  rgba(125, 186, 87, 1) 12.5%,
		  rgba(76, 178, 120, 1) 18.75%,
		  rgba(29, 163, 136, 1) 25%,
		  rgba(34, 138, 141, 1) 31.25%,
		  rgba(47, 112, 142, 1) 37.5%,
		  rgba(57, 87, 141, 1) 43.75%,
		  rgba(69, 55, 130, 1) 50%,
		  rgba(57, 87, 141, 1) 56.25%,
      rgba(47, 112, 142, 1) 62.5%,
      rgba(34, 138, 141, 1) 68.75%,
      rgba(29, 163, 136, 1) 75%,
      rgba(76, 178, 120, 1) 81.5%,
      rgba(125, 186, 87, 1) 87.75%,
      rgba(184, 206, 50, 1) 94%,
      rgba(253, 232, 36, 1) 100%
	  );
    background-size: 500% auto;
    animation: slidebg 5s linear infinite;
  }
  .replay-button:disabled {
    background: #BEBABC;
    cursor: not-allowed;
  }

  @keyframes slidebg {
    to {
      background-position: 320px;
    }
  }
</style>
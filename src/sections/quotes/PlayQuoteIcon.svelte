<script>
  import { fly } from 'svelte/transition';
  import PlayIcon from "../../icons/PlayIcon.svelte";
  import StopIcon from '../../icons/StopIcon.svelte';

  let { isPlaying } = $props()
</script>

<div
  in:fly={{ duration: 250, x: 10 }}
	out:fly={{ duration: 250, x: 10 }}
>
  {#if isPlaying}
    <StopIcon diameter={28} color="#E71D80" />
  {:else}
    <PlayIcon diameter={28} color="#F9F5F7" />
  {/if}
</div>
<script>
  import { fly } from 'svelte/transition';
  import SonificationLegendContent from './SonificationLegendContent.svelte';

  let { top, width, toggleSonificationLegend } = $props();
</script>

<div
  in:fly={{ duration: 250, x: 500 }}
  out:fly={{ duration: 250, x: 500 }}
  class="sonification-legend-container absolute right-0 z-50 px-4 py-4 bg-accent text-white"
  style="top: {top}px; width: {width}px;"
>
  <SonificationLegendContent {toggleSonificationLegend} />
</div>

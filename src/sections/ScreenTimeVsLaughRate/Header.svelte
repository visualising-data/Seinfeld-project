<script>
  let { headerHeight = $bindable() } = $props();
</script>

<div class="mb-4 md:mb-8" bind:clientHeight={headerHeight}>
  <h3>Lead character usage: On screen, being funny</h3>
  <div class="hidden md:block" style="max-width: 900px;">
    This analysis looks at the periods during an episode’s overall run-time in which the lead
    characters were on-screen and involved in a scene. It extends to then mark out the laughter
    moments they caused during their time on-screen, with the summary laughter rate values
    indicating what proportion of their overall screen-time in each episode were they being funny
    (eg. causing 12 laughter moments - 60 seconds - whilst on screen for a total of duration of 10
    minutes = 10% laughter rate)
  </div>
</div>

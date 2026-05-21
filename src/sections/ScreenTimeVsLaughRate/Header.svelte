<script>
  let { headerHeight = $bindable(), currentSection } = $props();

  const content = {
    main_chars: {
      title: 'Lead character usage: On screen, being funny',
      intro:
        "This analysis looks at the periods during an episode's overall run-time in which the lead characters were on-screen and involved in a scene. It extends to then mark out the laughter moments they caused during their time on-screen, with the summary laughter rate values indicating what proportion of their overall screen-time in each episode were they being funny (eg. causing 12 laughter moments - 60 seconds - whilst on screen for a total of duration of 10 minutes = 10% laughter rate)",
    },
    supporting_chars: {
      title: 'Supporting character usage: On screen, being funny',
      intro:
        "Like you've just seen for lead characters, this analysis looks at the periods during an episode's overall run-time in which supporting characters associated with each classifying group were on-screen and involved in a scene. It extends to mark out the laughter moments they caused during their time on-screen, with the summary laughter rate values again indicating a measurement of how funny they were whilst on screen. Go and explore how these vital supporting characters were used across the nine seasons of the show.",
    },
    locations: {
      title: 'Location usage: On screen, staging the funny',
      intro:
        "Just like the character analysis, here are the periods during an episode's overall run-time in which each type of location was used to stage a scene. It extends to mark out the laughter moments that occurred during those scenes set in those locations, with the summary laughter rate values again indicating a measurement of how intense the laughter occurred when scenes were set in those locations. Browse through the different places to explore how they were used across the nine seasons of the show.",
    },
  };

  let { title, intro } = $derived(
    content[/** @type {keyof typeof content} */ (currentSection)] ?? content.main_chars,
  );
</script>

<div class="mb-4 md:mb-8" bind:clientHeight={headerHeight}>
  <h3>{title}</h3>
  <div class="hidden md:block" style="max-width: 1200px;">
    {intro}
  </div>
</div>

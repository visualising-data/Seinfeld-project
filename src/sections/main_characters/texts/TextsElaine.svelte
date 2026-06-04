<script>
  import { characters } from '$lib/data/characters';
  import Sparkline from '../Sparkline.svelte';

  let { charData } = $props();

  let sparklinesContainerWidth = $state(1000);
  const sparklineWidth = $derived(
    Math.min(160, Math.max(80, Math.floor((sparklinesContainerWidth - 12) / 2))),
  );

  const color = characters.find((char) => char.id === 'ELAINE')?.color;
</script>

<!-- Text 1 -->
<div id="elaine-text-1" class="flex h-[100dvh] w-screen items-center justify-end md:pr-6">
  <div class="text-overlay flex flex-col">
    <div class="mb-4">
      <span class="em" style="color: {color};">Elaine Benes</span> was the lead female character. The
      general trends of her appearance levels match the shape of George's, albeit with slightly lower
      absolute levels.
    </div>
    <div class="small mb-2">Average screen-time per season</div>
    <Sparkline
      charData={charData.ELAINE}
      showLabels={true}
      charId="ELAINE"
      showMax={false}
      yAxisLabels={[0, 0.5, 1]}
    />
  </div>
</div>

<!-- Text 2 -->
<div id="elaine-text-2" class="flex h-[100dvh] w-screen items-center justify-end md:pr-6">
  <div class="text-overlay flex flex-col">
    <div>
      She did not appear in the <span class="highlight">first episode</span> and also missed filming
      for the <span class="highlight">start of Season 4</span>, when she was on maternity leave: her
      absence in the show explained by her apparently holidaying in Europe.
    </div>
  </div>
</div>

<!-- Text 3 -->
<div id="elaine-text-3" class="flex h-[100dvh] w-screen items-center justify-end md:pr-6">
  <div class="text-overlay" style="max-width: 800px;">
    In the book Seinfeldia, author Jennifer Keishin Armstrong reports that, at the start of Season
    3, Julia Louis-Dreyfus (who played Elaine) was unhappy with her lack of quality screen time -
    being on-screen and being funny. In the absence of women writers, this was perhaps an
    unsurprising effect of there being a male-dominated staff, but it was also a consequence of the
    grounded role her character played within the group of leads, considering Jerry's omnipresence
    as the gag-man, George with his neuroticism and Kramer bringing the slapstick. Elaine, as
    arguably the strongest actor, took on more of the role <span class="highlight"
      >holding the main stories together</span
    >.
  </div>
</div>

<!-- Text 4 -->
<div id="elaine-text-4" class="flex h-[100dvh] w-screen items-center justify-end md:pr-6">
  <div class="text-overlay" style="max-width: 800px; min-width: 0;">
    Things changed in Season 5 when Carol Leifer joined the show as a writer and became responsible
    for pitching most of Elaine's subsequent stories and character development. Though her laughter
    share only <span class="highlight">rose gradually</span>, her laughter rates jumped from 15% in
    Season 1 to a peak of 25% by Season 8.
    <div bind:clientWidth={sparklinesContainerWidth} style="height: 0; overflow: hidden;"></div>
    <div class="flex flex-col md:flex-row gap-8 md:gap-4 mt-4">
      <div class="">
        <div class="small mb-2">Average laughter share per season</div>
        <Sparkline
          charData={charData.ELAINE}
          showLabels={true}
          charId="ELAINE"
          showMax={false}
          isScreenTime={false}
          yAxisLabels={[0, 0.5, 1]}
        />
      </div>
      <div class="">
        <div class="small mb-2">Average laughter rate per season</div>
        <Sparkline
          charData={charData.ELAINE}
          showLabels={true}
          charId="ELAINE"
          showMax={false}
          isScreenTime={false}
          isLaughRate={true}
          yAxisLabels={[0, 0.5, 1]}
        />
      </div>
    </div>
  </div>
</div>

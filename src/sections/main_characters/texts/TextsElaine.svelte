<script>
  import { characters } from '$lib/data/characters';
  import Sparkline from '../Sparkline.svelte';

  let { charData } = $props()

  const color = characters.find(char => char.id === 'ELAINE')?.color;
</script>

<!-- Text 1 -->
<div id="elaine-text-1" class="flex h-screen w-screen items-center justify-end pr-6">
  <div class="text-overlay flex flex-col">
    <div class="mb-4">
      <span class="em" style="color: {color};">Elaine Benes</span> was the lead female character. The general trends of her appearance levels match the shape of George's, albeit with slightly lower absolute levels.
    </div>
    <div class="small mb-2">Average screen-time per season</div>
    <Sparkline charData={charData.ELAINE} showLabels={true} charId="GEORGE" showMax={true} yAxisLabels={[0, 1]} />
  </div>
</div>

<!-- Text 2 -->
<div id="elaine-text-2" class="flex h-screen w-screen items-center justify-end pr-6">
  <div class="text-overlay flex flex-col">
    <div>
      She did not appear in the <span class="highlight">first episode</span> and also missed filming for the <span class="highlight">start of Season 4</span>, when she was on maternity leave: her absence in the show explained by her apparently holidaying in Europe.
    </div>
  </div>
</div>

<!-- Text 3 -->
<div id="elaine-text-3" class="flex h-screen w-screen items-center justify-end pr-6">
  <div class="text-overlay flex gap-4" style="max-width: 1000px;">
    <div class="shrink-0">
      <img src="https://amdufour.github.io/hosted-data/apis/images/seinfeldia.jpg" alt="Cover of the book Seinfeldia by Jennifer Keishin Armstrong" style="height: 350px;" />
      <div class="number text pt-2">Photo source: <a href="https://www.goodreads.com/book/show/27171845-seinfeldia" target="_blank">goodreads</a></div>
    </div>
    <div>
      In the book 'Seinfeldia', author Jennifer Keishin Armstrong reports that, at the start of Season 3, Julia Louis-Dreyfus (who played Elaine) was unhappy with her lack of quality screen time - being on-screen and being funny. In the absence of women writers, this was perhaps an unsurprising effect of there being a male-dominated staff, but it was also a consequence of the grounded role her character played within the group of leads, considering Jerry's omnipresence as the gag-man, George's with his neuroticism and Kramer bringing the slapstick. Elaine, as arguably the strongest actor, took on more of the role <span class="highlight">holding the main stories together</span>.
    </div>
  </div>
</div>

<!-- Text 4 -->
<div id="elaine-text-4" class="flex h-screen w-screen items-center justify-end pr-6">
  <div class="text-overlay" style="max-width: 800px;">
    <div class="flex gap-4 mb-4">
      <div>
        Things changed in Season 5 when Carol Leifer joined the show as a writer and became responsible for pitching most of Elaine's subsequent stories and character development. Though her laughter share only <span class="highlight">rose gradually</span>, her laughter rates jumped from 13% in Season 1 to a peak of 24% by Season 8.
      </div>
      <div class="shrink-0">
        <img src="https://amdufour.github.io/hosted-data/apis/images/Carol_Leifer.jpg" alt="Carol Leifer" style="height: 200px;" />
        <div class="number text pt-2">Photo source: <a href="https://en.wikipedia.org/wiki/Carol_Leifer" target="_blank">Wikipedia</a></div>
      </div>
    </div>
    <div class="small mb-2">Average laughter share per season</div>
    <Sparkline charData={charData.ELAINE} showLabels={true} charId="GEORGE" showMax={true} isScreenTime={false} yAxisLabels={[0, 1]} />
  </div>
</div>
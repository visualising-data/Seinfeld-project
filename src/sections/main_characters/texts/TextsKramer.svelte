<script>
  import { characters } from '$lib/data/characters';
  import Sparkline from '../Sparkline.svelte';

  let { charData } = $props()

  const color = characters.find(char => char.id === 'KRAMER')?.color;
</script>

<!-- Text 1 -->
<div class="flex h-screen w-screen items-center justify-center">
  <div id="kramer-text-1" class="text-overlay flex gap-4" style="max-width: 800px;">
    <div>
      <span class="em" style="color: {color};">Cosmo Kramer</span>, based on Kenny Kramer, the real-life friend of Larry David, was Jerry's friend and neighbour and the fourth lead character. Kramer was often used more sparingly than the other leads, in terms of screen time, as he was effectively the clown of the group, a role which works best when used somewhat sparingly.
    </div>
    <img src="https://amdufour.github.io/hosted-data/apis/images/the_real_kramer.jpg" alt="The real Kramer" style="height: 215px;" />
  </div>
</div>

<!-- Text 2 -->
<div class="flex h-screen w-screen items-center justify-center">
  <div id="kramer-text-2" class="text-overlay flex flex-col">
    <div class="mb-4">
      As one of the most popular characters amongst fans and critics alike, you can see his scene appearances and screen time <span class="highlight">trend upward season after season</span>, achieving parity with George and Elaine by Season 8.
    </div>
    <div class="small mb-2">Average screen-time per season</div>
    <Sparkline charData={charData.KRAMER} showLabels={true} charId="KRAMER" showMax={true} yAxisLabels={[0]} />
  </div>
</div>

<!-- Text 3 -->
<div class="flex h-screen w-screen items-center justify-center">
  <div id="kramer-text-3" class="text-overlay flex flex-col" style="max-width: 800px;">
    <div class="mb-4">
      Also, as the most naturally slapstick physical comedian, Kramer often got the most wacky gags, sometimes picking up spare stories that had been intended for Jerry, but were instead repackaged for Kramer. Moreover, Keishin Armstrong mentions that Seinfeld was inspired by the burlesque qualities of Abbot and Costello, and when he took over as Head Writer and Executive Producer (and appointed young writers on staff), the show went in a slightly different, more absurd or cartoonish direction. By contrast, under Larry David's stewardship, the stories had, at times, been somewhat darker. As Jerry and George drop in their laughter share, Kramer's rises, and he arguably <span class="highlight">emerges to become the show's central comic force</span>.
    </div>
    <div class="small mb-2">Average laughter share per season</div>
    <Sparkline charData={charData.KRAMER} showLabels={true} isScreenTime={false} charId="KRAMER" showMax={true} yAxisLabels={[0]} />
  </div>
</div>
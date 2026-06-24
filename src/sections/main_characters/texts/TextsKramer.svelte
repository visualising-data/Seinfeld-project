<script>
  import { characters } from '$lib/data/characters';
  import Sparkline from '../Sparkline.svelte';

  let { charData, inline = false } = $props();

  const wrapClass = $derived(inline ? 'mb-6' : 'flex h-[100dvh] w-screen items-center justify-end md:pr-6');
  const color = characters.find((char) => char.id === 'KRAMER')?.color;
</script>

<!-- Text 1 -->
<div id="kramer-text-1" class={wrapClass}>
  <div class="text-overlay" style="max-width: 800px;">
    <span class="em" style="color: {color};">Cosmo Kramer</span>, based on Kenny Kramer, the
    real-life friend of Larry David, was Jerry's friend and neighbour and the fourth lead character.
    Kramer was often used more sparingly than the other leads, in terms of screen time, as he was
    effectively the clown of the group, a role which works best when used somewhat sparingly.
  </div>
</div>

<!-- Text 2 -->
<div id="kramer-text-2" class={wrapClass}>
  <div class="text-overlay flex flex-col">
    <div class="mb-4">
      As one of the most popular characters amongst fans and critics alike, you can see his scene
      appearances and screen time <span class="highlight">trend upward season after season</span>,
      achieving parity with George and Elaine by Season 8.
    </div>
    <div class="small mb-2">Average screen-time per season</div>
    <Sparkline
      charData={charData.KRAMER}
      showLabels={true}
      charId="KRAMER"
      showMax={false}
      yAxisLabels={[0, 0.5, 1]}
    />
  </div>
</div>

<!-- Text 3 -->
<div id="kramer-text-3" class={wrapClass}>
  <div class="text-overlay flex flex-col" style="max-width: 800px;">
    <div class="mb-4">
      Also, as the most naturally slapstick physical comedian, Kramer often got the most wacky gags,
      sometimes picking up spare stories that had been intended for Jerry, but were instead
      repackaged for Kramer. Moreover, Jennifer Keishin Armstrong mentions that Seinfeld was
      inspired by the burlesque qualities of Abbot and Costello, and when he took over as Head
      Writer and Executive Producer (and appointed young writers on staff), the show went in a
      slightly different, more absurd or cartoonish direction. By contrast, under Larry David's
      stewardship, the stories had, at times, been somewhat darker. As Jerry and George drop in
      their laughter share, Kramer's rises, and he arguably <span class="highlight"
        >emerges to become the show's central comic force</span
      >.
    </div>
    <div class="small mb-2">Average laughter share per season</div>
    <Sparkline
      charData={charData.KRAMER}
      showLabels={true}
      isScreenTime={false}
      charId="KRAMER"
      showMax={false}
      yAxisLabels={[0, 0.5, 1]}
    />
  </div>
</div>

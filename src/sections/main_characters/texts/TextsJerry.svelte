<script>
  import { characters } from '$lib/data/characters';
  import Sparkline from '../Sparkline.svelte';

  let { charData } = $props()

  const color = characters.find(char => char.id === 'JERRY')?.color;
</script>

<!-- Text 1 -->
<div class="flex h-screen w-screen items-center justify-center">
	<div id="jerry-text-1" class="text-overlay">
		When you are the co-creator of a show, it is named after you, and you play a semi-fictionalised version of yourself, it is no surprise that <span class="em" style="color: {color};">Jerry Seinfeld</span> was the dominant lead character, appearing in every episode as well as a high proportion of scenes and screen-time.
	</div>
</div>

<!-- Text 2 -->
<div class="flex h-screen w-screen items-center justify-center">
  <div id="jerry-text-2" class="text-overlay flex flex-col items-center">
    <div class="mb-4">
      With episode scenes typically opening (up to Season 8) and closing (up to Season 6) with Jerry doing a <span class="highlight">short stand-up monologue</span>, his prolific on-screen presence marked him as the main protagonist.
    </div>
    <img src="https://amdufour.github.io/hosted-data/apis/images/jerry_on_stage_2.jpg" alt="Jerry on stage delivering a monologue" />
  </div>
</div>

<!-- Text 3 -->
<div class="flex h-screen w-screen items-center justify-center">
  <div id="jerry-text-3" class="text-overlay flex flex-col items-center">
    <div class="mb-4">
      Indeed, it is noticeable that across just <span class="highlight">0.2%</span> of the show's entire run-time would George, Elaine, and Kramer find themselves on screen together but without Jerry.
    </div>
    <img src="https://amdufour.github.io/hosted-data/apis/images/george_elaine_kramer.jpg" alt="Jerry on stage delivering a monologue" />
  </div>
</div>

<!-- Text 4 -->
<div class="flex h-screen w-screen items-center justify-center">
  <div id="jerry-text-4" class="text-overlay flex flex-col items-center">
    <div class="mb-4">
      Perhaps inevitably Jerry appeared in all scenes and <span class="highlight">almost every second</span> of run-time during episodes in Season 1, offering a safe pair of hands as the show was establishing itself.
    </div>
  </div>
</div>

<!-- Text 5 -->
<div class="flex h-screen w-screen items-center justify-center">
  <div id="jerry-text-5" class="text-overlay flex flex-col items-center">
    <div class="mb-4">
      Other than in S3E18 "The Boyfriend (Part 2)", which was the second episode of a two-part storyline, S7E1 "The Engagement" was the first in which Jerry did not appear in the opening scene. It happened again in S7E11 "The Rye". Although skewed by the absence of his opening monologues, across Season 8 and 9, when he had taken over from Larry David as the show's Executive Producer, there were <span class="highlight">11 episodes in which he did not appear in the opening scene</span> (and, in S8E5 "The Package", not until scene 4).
    </div>
  </div>
</div>

<!-- Text 6 -->
<div class="flex h-screen w-screen items-center justify-center">
  <div id="jerry-text-6" class="text-overlay flex flex-col">
    <div class="mb-4">
      Although his absolute screen-time levels continued to be high, you can see a <span class="highlight">clear trend of reduction</span> as the seasons pass.
    </div>
    <div class="small mb-2">Average screen-time per season</div>
    <Sparkline charData={charData.JERRY} showLabels={true} charId="JERRY" showMax={true} yAxisLabels={[0, 0.5]} />
  </div>
</div>

<!-- Text 7 -->
<div class="flex h-screen w-screen items-center justify-center">
  <div id="jerry-text-7" class="text-overlay flex flex-col">
    <div class="mb-4">
      This is mirrored in the trends for his share of <span class="highlight">episode laughs</span>, which peaked in Season 1 at 54% but dropped by Season 9 to around 20%.
    </div>
    <div class="small mb-2">Average laughter share per season</div>
    <Sparkline charData={charData.JERRY} isScreenTime={false} showLabels={true} charId="JERRY" showMax={true} yAxisLabels={[0]} />
  </div>
</div>

<!-- Text 8 -->
<div class="flex h-screen w-screen items-center justify-center">
  <div id="jerry-text-8" class="text-overlay flex flex-col">
    <div class="mb-4">
      Perhaps this came about as the <span class="highlight">other lead characters found their voice</span> and the supporting cast grew. There was an up-tick during Season 9, as seen across almost all character groups.
    </div>
    <div>
      <div class="small mb-2">Average screen-time per season</div>
      <div class="flex items-end gap-3">
        <Sparkline charData={charData.JERRY} showLabels={true} charId="JERRY" yAxisLabels={[0, 0.5, 1]} />
        <Sparkline charData={charData.GEORGE} charId="GEORGE" />
        <Sparkline charData={charData.ELAINE} charId="ELAINE" />
        <Sparkline charData={charData.KRAMER} charId="KRAMER" />
      </div>
      <div class="mt-8">
        <div class="small mb-2">Average laughter share per season</div>
        <div class="flex items-end gap-3">
          <Sparkline charData={charData.JERRY} isScreenTime={false} showLabels={true} showCharBadge={true} charId="JERRY" yAxisLabels={[0, 0.5]} />
          <Sparkline charData={charData.GEORGE} isScreenTime={false} showCharBadge={true} charId="GEORGE" />
          <Sparkline charData={charData.ELAINE} isScreenTime={false} showCharBadge={true} charId="ELAINE" />
          <Sparkline charData={charData.KRAMER} isScreenTime={false} showCharBadge={true} charId="KRAMER" />
        </div>
      </div>
    </div>
  </div>
</div>
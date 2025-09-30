<script>
  import { characters } from '$lib/data/characters';
  import Sparkline from '../Sparkline.svelte';

  let { charData } = $props()

  const color = characters.find(char => char.id === 'GEORGE')?.color;
</script>

<!-- Text 1 -->
<div class="flex h-screen w-screen items-center justify-center">
  <div id="george-text-1" class="text-overlay flex gap-4">
    <div>
      <span class="em" style="color: {color};">George Costanza</span>, who was essentially based on co-creator Larry David, was the second most-seen character, appearing in all but one episode and a little under half of all scenes and screen time.
    </div>
    <img src="https://amdufour.github.io/hosted-data/apis/images/larry_david.jpg" alt="Larry David" style="height: 200px;" />
  </div>
</div>

<!-- Text 2 -->
<div class="flex h-screen w-screen items-center justify-center">
  <div id="george-text-2" class="text-overlay flex flex-col">
    <div class="mb-4">
      George's relative appearance rates <span class="highlight">dropped gradually</span> through the middle and later seasons before a Season 9 increase.
    </div>
    <div class="small mb-2">Average screen-time per season</div>
    <Sparkline charData={charData.GEORGE} showLabels={true} charId="GEORGE" showMax={true} yAxisLabels={[0]} />
  </div>
</div>

<!-- Text 3 -->
<div class="flex h-screen w-screen items-center justify-center">
  <div id="george-text-3" class="text-overlay flex flex-col">
    <div class="mb-4">
      This directly matches the shape of his laughter share patterns, which had peaked by Season 2.
    </div>
    <div class="small mb-2">Average laughter share per season</div>
    <Sparkline charData={charData.GEORGE} showLabels={true} charId="GEORGE" showMax={true} isScreenTime={false} yAxisLabels={[0]} />
  </div>
</div>
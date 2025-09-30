<script lang="ts">
  import { scaleLinear } from "d3-scale";

  import { characters } from "$lib/data/characters";
  import { charsScreenTime } from "$lib/data/onScreen";
  import { getCharacterImagePath } from "../../utils/getCharacterImagePath";
  import ArrowHead from "../../icons/ArrowHead.svelte";

  let innerWidth = $state(1600);
  let innerHeight = $state(800);
  let containerWidth = $state(1200);
  let headerHeight = $state(100);

  const mainCharsScreenTime = charsScreenTime.slice(0, 4);
  let chartWidth = $derived(containerWidth - 64 <= 1200 ? containerWidth - 64 : 1200);
  let chartHeight = $derived(innerHeight - headerHeight - 60);
  let imageHeight = $derived(chartHeight / 5.5);

  // Calculate the total width of the Marimekko bars
  let totalBarsScreenTime = $derived(
    mainCharsScreenTime.reduce((acc, char) => acc + char.screenTime, 0)
  );
  let widthCoverage = $derived(chartWidth - 80 - 150);

  let screenTimeScale = $derived(
    scaleLinear()
      .domain([0, totalBarsScreenTime])
      .range([0, widthCoverage])
  );

  const laughsScale = $derived(
    scaleLinear()
      .domain([0, Math.max(...mainCharsScreenTime.map((char) => char.onScreenWithoutLaughs))])
      .range([0, chartHeight / 2 - 8])
  );

  const charsData = $derived.by(() => {
    const array = mainCharsScreenTime;
    array.forEach((char, i) => {
      char['screenTimeWidth'] = screenTimeScale(char.screenTime);
      char['paddingLeft'] = i === 0 ? 0 : mainCharsScreenTime.slice(0, i).reduce((acc, c) => acc + c.screenTimeWidth + 50, 0);
      char['laughsWidth'] = laughsScale(char.causeLaughsWhileOnScreen);
      char['noLaughsWidth'] = laughsScale(char.onScreenWithoutLaughs);
    });

    return array;
  })
</script>

<svelte:window bind:innerWidth={innerWidth} bind:innerHeight={innerHeight} />

<div class="h-screen w-screen mb-60">
  <div class="container" bind:clientWidth={containerWidth}>
    <!-- Header -->
    <div bind:clientHeight={headerHeight} class="mb-8">
      <h3>Screen time vs laughter rate</h3>
      <div style="max-width: 900px;">If we compare the relative screen time of each of the four lead characters with how much of that screen time they generated laughs we can draw a few conclusions.</div>
    </div>

    <!-- Marimekko chart -->
    <div class="relative">
      <svg width={chartWidth} height={chartHeight}>
        <g transform='translate(40, {chartHeight / 2})'>
          {#each charsData as char, i}
            <g transform='translate({char.paddingLeft}, 0)'>
              <!-- Name and Image -->
              <g transform='translate({char.screenTimeWidth / 2 - imageHeight / 2}, {-chartHeight / 2})'>
                <foreignobject width={imageHeight} height={imageHeight}>
                  <img src="{getCharacterImagePath(char.id)}" alt={char.label} style="width: 100%; height: auto; border-radius: 50%;" />
                </foreignobject>
                <text
                  x={imageHeight / 2}
                  y={imageHeight + 22}
                  text-anchor="middle"
                >{char.label}</text>
              </g>

              <!-- Labels -->
              <line 
                x1={0} 
                y1={-char.laughsWidth - 6} 
                x2={char.screenTimeWidth} 
                y2={-char.laughsWidth - 6} 
                stroke={i === 0 ? '#E71D80' : '#12020A'} 
              />
              <line 
                x1={-6} 
                y1={-char.laughsWidth} 
                x2={-6} 
                y2={char.noLaughsWidth} 
                stroke={i === 0 ? '#E71D80' : '#12020A'} 
              />
              <line 
                x1={-12} 
                y1={0} 
                x2={0} 
                y2={0} 
                stroke={i === 0 ? '#E71D80' : '#12020A'} 
              />
              <g transform={`translate(${char.screenTimeWidth - 7}, ${-char.laughsWidth - 11.5})`}>
                <ArrowHead color={i === 0 ? '#E71D80' : '#12020A'} />
              </g>
              <g transform={`translate(${-11.5}, ${-char.laughsWidth + 7.5}) rotate(-90)`}>
                <ArrowHead color={i === 0 ? '#E71D80' : '#12020A'} />
              </g>
              <g transform={`translate(${-0.5}, ${char.noLaughsWidth - 7}) rotate(90)`}>
                <ArrowHead color={i === 0 ? '#E71D80' : '#12020A'} />
              </g>
              <g class="number" style="font-size: 0.875rem;">
                <text 
                  x={char.screenTimeWidth - 10}
                  y={-char.laughsWidth - 10}
                  text-anchor="end"
                >{char.screenTime * 100}%</text>
                <text 
                  x={-10}
                  y={-char.laughsWidth + 6}
                  text-anchor="end"
                  dominant-baseline="hanging"
                >{Math.floor(char.causeLaughsWhileOnScreen * 100)}%</text>
                <text 
                  x={-10}
                  y={char.noLaughsWidth - 8}
                  text-anchor="end"
                >{Math.floor(char.onScreenWithoutLaughs * 100)}%</text>
              </g>

              {#if i === 0}
                <text
                  class="small accent"
                  x={0}
                  y={-char.laughsWidth}
                >Relative screen time</text>
                <text
                  class="small accent"
                  style="transform: translateX(94px) translateY(-4px) rotate(-90deg); transform-origin: 0 0;"
                  x={0}
                  y={-char.laughsWidth + 4}
                >Laughter</text>
                <text
                  class="small accent"
                  style="transform: translateX(94px) translateY(4px) rotate(-90deg); transform-origin: 0 0;"
                  x={0}
                  y={-char.laughsWidth + 4}
                  text-anchor="end"
                >Non-laughter</text>
              {/if}

              <!-- Laughs -->
              <rect
                x={0}
                y={-char.laughsWidth}
                width={char.screenTimeWidth}
                height={char.laughsWidth}
                fill={characters.find(c => c.id === char.id)?.color || 'gray'}
              />

              <!-- No Laugh -->
              <rect
                x={0}
                y={0}
                width={char.screenTimeWidth}
                height={char.noLaughsWidth}
                fill={characters.find(c => c.id === char.id)?.color || 'gray'}
                fill-opacity="0.5"
              />

              <!-- Text -->
              <foreignobject width={char.screenTimeWidth} height={char.noLaughsWidth}>
                <div class="px-4 py-2">
                  <div class="small">{char.text}</div>
                </div>
              </foreignobject>
            </g>
          {/each}
        </g>
      </svg>
    </div>
  </div>
</div>
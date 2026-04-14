<script lang="ts">
  import { scaleLinear } from 'd3-scale';

  import { characters } from '$lib/data/characters';
  import { locationsScreenTime } from '$lib/data/onScreen';
  import { getLocationIconPath } from '../../utils/getLocationIconPath';
  import ArrowHead from '../../icons/ArrowHead.svelte';

  let innerWidth = $state(1600);
  let innerHeight = $state(800);
  let containerWidth = $state(1200);
  let headerHeight = $state(100);

  let chartWidth = $derived(containerWidth - 64);
  let chartHeight = $derived(
    innerHeight - headerHeight - 60 > 700 ? innerHeight - headerHeight - 60 : 700,
  );
  let chartMidPoint = $derived(chartHeight - chartHeight / 3.5);
  let imageHeight = 60;

  // Calculate the total width of the Marimekko bars
  let totalBarsScreenTime = $derived(
    locationsScreenTime.reduce((acc, char) => acc + char.screenTime, 0),
  );
  let widthCoverage = $derived(chartWidth - 110 - 10 * 50);

  let screenTimeScale = $derived(
    scaleLinear().domain([0, totalBarsScreenTime]).range([0, widthCoverage]),
  );

  const laughsScale = $derived(
    scaleLinear()
      .domain([0, Math.max(...locationsScreenTime.map((char) => char.onScreenWithoutLaughs))])
      .range([0, chartHeight / 3.5]),
  );

  let hoveredChar = $state<string | null>(null);
  const LABEL_CIRCLE_R = 16;
  let firstLaughsWidth = $derived(laughsScale(locationsScreenTime[0].causeLaughsWhileOnScreen));

  const charsData = $derived.by(() => {
    const array = locationsScreenTime;
    array.forEach((char, i) => {
      char['screenTimeWidth'] = screenTimeScale(char.screenTime);
      char['paddingLeft'] =
        i === 0
          ? 0
          : locationsScreenTime.slice(0, i).reduce((acc, c) => acc + c.screenTimeWidth + 50, 0);
      char['laughsWidth'] = laughsScale(char.causeLaughsWhileOnScreen);
      char['noLaughsWidth'] = laughsScale(char.onScreenWithoutLaughs);
    });

    return array;
  });
</script>

<svelte:window bind:innerWidth bind:innerHeight />

<div class="w-screen pb-24">
  <div class="container" bind:clientWidth={containerWidth}>
    <!-- Header -->
    <div bind:clientHeight={headerHeight} class="mb-8">
      <h3>Screen time vs laughter rate</h3>
      <div style="max-width: 900px;">
        If we compare the relative screen time of each of the four lead characters with how much of
        that screen time they generated laughs we can draw a few conclusions.
      </div>
    </div>

    <!-- Marimekko chart -->
    <div class="relative">
      <svg width={chartWidth} height={chartHeight}>
        <g transform="translate(70, {chartMidPoint})">
          {#each charsData as char, i}
            <g
              transform="translate({char.paddingLeft}, 0)"
              opacity={hoveredChar === null || hoveredChar === char.id ? 1 : 0.3}
              class="transition-opacity duration-200 ease-out"
            >
              <g
                transform="translate({char.screenTimeWidth / 2 -
                  imageHeight / 2 -
                  10}, {-chartMidPoint + (i % 2 == 0 ? 0 : imageHeight + 16)})"
              >
                <line
                  x1={imageHeight / 2 + 10}
                  y1={imageHeight + 10}
                  x2={imageHeight / 2 + 10}
                  y2={chartMidPoint - char.laughsWidth - (i % 2 == 0 ? 30 : imageHeight + 50)}
                  stroke="#12020A"
                />
                <foreignobject width={imageHeight + 20} height={2 * imageHeight}>
                  <div class="small text-center bg-white py-1" style="margin-top: {imageHeight}px;">
                    {char.label}
                  </div>
                </foreignobject>
              </g>
            </g>
          {/each}
          {#each charsData as char, i}
            <g
              transform="translate({char.paddingLeft}, 0)"
              opacity={hoveredChar === null || hoveredChar === char.id ? 1 : 0.3}
              class="transition-opacity duration-200 ease-out"
              style="cursor: pointer;"
              role="presentation"
              onmouseenter={() => (hoveredChar = char.id)}
              onmouseleave={() => (hoveredChar = null)}
            >
              <!-- Name and Image -->
              <g
                transform="translate({char.screenTimeWidth / 2 -
                  imageHeight / 2 -
                  10}, {-chartMidPoint + (i % 2 == 0 ? 0 : imageHeight + 16)})"
              >
                <foreignobject width={imageHeight + 20} height={2 * imageHeight}>
                  <img
                    loading="lazy"
                    src={getLocationIconPath(char.id)}
                    alt={char.label}
                    style="width: {imageHeight}px; height: {imageHeight}px; border-radius: 50%; margin: 0 auto;"
                  />
                </foreignobject>
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
              <line x1={-12} y1={0} x2={0} y2={0} stroke={i === 0 ? '#E71D80' : '#12020A'} />
              <g transform={`translate(${char.screenTimeWidth - 7}, ${-char.laughsWidth - 11.5})`}>
                <ArrowHead color={i === 0 ? '#E71D80' : '#12020A'} />
              </g>
              <g transform={`translate(${-11.5}, ${-char.laughsWidth + 7.5}) rotate(-90)`}>
                <ArrowHead color={i === 0 ? '#E71D80' : '#12020A'} />
              </g>
              <g transform={`translate(${-0.5}, ${char.noLaughsWidth - 7}) rotate(90)`}>
                <ArrowHead color={i === 0 ? '#E71D80' : '#12020A'} />
              </g>
              <!-- Percentage labels: circle + text, shown on hover only -->
              <g
                class="transition-opacity duration-200 ease-out"
                opacity={hoveredChar === char.id ? 1 : 0}
              >
                <circle
                  cx={char.screenTimeWidth}
                  cy={-char.laughsWidth - 6 - LABEL_CIRCLE_R - 6}
                  r={LABEL_CIRCLE_R}
                  fill="#F9F5F7"
                  stroke="#12020A"
                />
                <text
                  x={char.screenTimeWidth}
                  y={-char.laughsWidth - 6 - LABEL_CIRCLE_R - 6}
                  dy="1px"
                  text-anchor="middle"
                  dominant-baseline="middle"
                  class="text-xs font-semibold"
                  fill="#12020A"
                  >{char.screenTime === 0.0 ? '<1' : Math.round(char.screenTime * 100)}%</text
                >
                <circle
                  cx={-(LABEL_CIRCLE_R + 14)}
                  cy={-char.laughsWidth}
                  r={LABEL_CIRCLE_R}
                  fill="#F9F5F7"
                  stroke="#12020A"
                />
                <text
                  x={-(LABEL_CIRCLE_R + 14)}
                  y={-char.laughsWidth}
                  dy="1px"
                  text-anchor="middle"
                  dominant-baseline="middle"
                  class="text-xs font-semibold"
                  fill="#12020A">{Math.floor(char.causeLaughsWhileOnScreen * 100)}%</text
                >
                <circle
                  cx={-(LABEL_CIRCLE_R + 14)}
                  cy={char.noLaughsWidth}
                  r={LABEL_CIRCLE_R}
                  fill="#F9F5F7"
                  stroke="#12020A"
                />
                <text
                  x={-(LABEL_CIRCLE_R + 14)}
                  y={char.noLaughsWidth}
                  dy="1px"
                  text-anchor="middle"
                  dominant-baseline="middle"
                  class="text-xs font-semibold"
                  fill="#12020A">{Math.floor(char.onScreenWithoutLaughs * 100)}%</text
                >
              </g>

              <!-- Laughs -->
              <rect
                x={0}
                y={-char.laughsWidth}
                width={char.screenTimeWidth === 0 ? 1 : char.screenTimeWidth}
                height={char.laughsWidth}
                fill={characters.find((c) => c.id === char.id)?.color || '#12020A'}
              />

              <!-- No Laugh -->
              <rect
                x={0}
                y={0}
                width={char.screenTimeWidth === 0 ? 1 : char.screenTimeWidth}
                height={char.noLaughsWidth}
                fill={characters.find((c) => c.id === char.id)?.color || '#12020A'}
                fill-opacity="0.5"
              />
            </g>
          {/each}

          <!-- Accent labels: always full opacity, outside the dimming group -->
          {#if charsData.length > 0}
            <text class="small accent" x={0} y={-firstLaughsWidth - 12}>Relative screen time</text>
            <text
              class="small accent"
              text-anchor="middle"
              transform="rotate(-90, -12, -40)"
              x={-12}
              y={-40}>Laughter</text
            >
            <text
              class="small accent"
              text-anchor="middle"
              transform="rotate(-90, -12, 50)"
              x={-12}
              y={50}>Non-laughter</text
            >
          {/if}
        </g>
      </svg>
    </div>
  </div>
</div>

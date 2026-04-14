<script lang="ts">
  import { scaleLinear } from 'd3-scale';

  import { characters } from '$lib/data/characters';
  import { charsScreenTime } from '$lib/data/onScreen';
  import { getCharacterImagePath } from '../../utils/getCharacterImagePath';
  import ArrowHead from '../../icons/ArrowHead.svelte';

  let innerWidth = $state(1600);
  let innerHeight = $state(800);
  let containerWidth = $state(1200);
  let headerHeight = $state(100);

  // Layout constants
  const BAR_GAP = 50;
  const CHART_PADDING_LEFT = 80;
  const LABEL_CIRCLE_R = 16;
  const LABEL_SPACE = 150 + LABEL_CIRCLE_R + 8; // extra room for screen time circle on last bar
  const IMAGE_SIZE_DIVISOR = 5.5;

  const mainCharsScreenTime = charsScreenTime.slice(0, 4);
  let chartWidth = $derived(containerWidth - 64);
  let chartHeight = $derived(innerHeight - headerHeight - 60);
  let imageHeight = $derived(Math.min(chartHeight / IMAGE_SIZE_DIVISOR, 120));

  let totalBarsScreenTime = $derived(
    mainCharsScreenTime.reduce((acc, char) => acc + char.screenTime, 0),
  );
  let widthCoverage = $derived(chartWidth - CHART_PADDING_LEFT - LABEL_SPACE);

  let screenTimeScale = $derived(
    scaleLinear().domain([0, totalBarsScreenTime]).range([0, widthCoverage]),
  );

  let laughsScale = $derived(
    scaleLinear()
      .domain([0, Math.max(...mainCharsScreenTime.map((char) => char.onScreenWithoutLaughs))])
      .range([0, chartHeight / 2 - 8]),
  );

  // Position the midpoint so the tallest upward bar sits flush under the images
  const IMAGE_LABEL_OFFSET = 54; // label baseline (y = imageHeight + 22) + 32px gap to bar top
  let maxLaughsWidth = $derived(
    Math.max(...mainCharsScreenTime.map((c) => laughsScale(c.causeLaughsWhileOnScreen))),
  );
  let midpointY = $derived(maxLaughsWidth + imageHeight + IMAGE_LABEL_OFFSET);

  let hoveredChar = $state<string | null>(null);

  let charsData = $derived.by(() =>
    mainCharsScreenTime.map((char, i) => {
      const screenTimeWidth = screenTimeScale(char.screenTime);
      const precedingChars = mainCharsScreenTime.slice(0, i);
      return {
        ...char,
        screenTimeWidth,
        paddingLeft: precedingChars.reduce(
          (acc, c) => acc + screenTimeScale(c.screenTime) + BAR_GAP,
          0,
        ),
        laughsWidth: laughsScale(char.causeLaughsWhileOnScreen),
        noLaughsWidth: laughsScale(char.onScreenWithoutLaughs),
        color: characters.find((c) => c.id === char.id)?.color ?? 'gray',
        lineColor: i === 0 ? '#E71D80' : '#12020A',
      };
    }),
  );
</script>

<svelte:window bind:innerWidth bind:innerHeight />

<div class="h-screen w-screen mb-60">
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
      <svg width={chartWidth} height={chartHeight} viewBox="0 0 {chartWidth} {chartHeight}">
        <g transform="translate({CHART_PADDING_LEFT}, {midpointY})">
          {#each charsData as char}
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
              <g transform="translate({char.screenTimeWidth / 2 - imageHeight / 2}, {-midpointY})">
                <foreignobject width={imageHeight} height={imageHeight}>
                  <img
                    loading="lazy"
                    src={getCharacterImagePath(char.id)}
                    alt={char.label}
                    style="width: 100%; height: auto; border-radius: 50%;"
                  />
                </foreignobject>
                <text x={imageHeight / 2} y={imageHeight + 22} text-anchor="middle"
                  >{char.label}</text
                >
              </g>

              <!-- Labels -->
              <line
                x1={0}
                y1={-char.laughsWidth - 6}
                x2={char.screenTimeWidth}
                y2={-char.laughsWidth - 6}
                stroke={char.lineColor}
              />
              <line
                x1={-6}
                y1={-char.laughsWidth}
                x2={-6}
                y2={char.noLaughsWidth}
                stroke={char.lineColor}
              />
              <line x1={-12} y1={0} x2={0} y2={0} stroke={char.lineColor} />
              <g transform={`translate(${char.screenTimeWidth - 7}, ${-char.laughsWidth - 11.5})`}>
                <ArrowHead color={char.lineColor} />
              </g>
              <g transform={`translate(${-11.5}, ${-char.laughsWidth + 7.5}) rotate(-90)`}>
                <ArrowHead color={char.lineColor} />
              </g>
              <g transform={`translate(${-0.5}, ${char.noLaughsWidth - 7}) rotate(90)`}>
                <ArrowHead color={char.lineColor} />
              </g>
              <!-- Percentage labels: circle + text, shown on hover only -->
              <g
                class="transition-opacity duration-200 ease-out"
                opacity={hoveredChar === char.id ? 1 : 0}
              >
                <!-- Relative screen time % — above the arrowhead at the right end of the horizontal line -->
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
                  fill="#12020A">{Math.round(char.screenTime * 100)}%</text
                >
                <!-- Laughter % — at the top tip of the vertical annotation line -->
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
                <!-- Non-laughter % — at the bottom tip of the vertical annotation line -->
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
              <g transform="translate(0, {-char.laughsWidth})">
                <rect
                  x={0}
                  y={0}
                  width={char.screenTimeWidth}
                  height={char.laughsWidth}
                  fill={char.color}
                />
              </g>

              <!-- No Laugh -->
              <rect
                x={0}
                y={0}
                width={char.screenTimeWidth}
                height={char.noLaughsWidth}
                fill={char.color}
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

          <!-- Accent labels: always full opacity, outside the dimming group -->
          {#if charsData.length > 0}
            {@const first = charsData[0]}
            <text
              class="small accent"
              text-anchor="start"
              transform="rotate(-90, -12, -8)"
              x={-12}
              y={-8}>Laughter</text
            >
            <text
              class="small accent"
              text-anchor="end"
              transform="rotate(-90, -12, 8)"
              x={-12}
              y={8}>Non-laughter</text
            >
            <text
              class="small accent"
              x={0}
              y={-first.laughsWidth - 12}>Relative screen time</text
            >
          {/if}
        </g>
      </svg>
    </div>
  </div>
</div>

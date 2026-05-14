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

  // Mobile layout
  const MOBILE_BAR_GAP = 16;
  const MOBILE_IMAGE_SIZE = 32;
  const MOBILE_TEXT_WIDTH = 72; // label text area next to icon
  const MOBILE_BAR_INDENT = 16; // gap from text right edge to bars
  const MOBILE_TOP_PADDING = 36;

  let isMobile = $derived(containerWidth < 640);
  let mobileBarsStart = $derived(MOBILE_IMAGE_SIZE + 6 + MOBILE_TEXT_WIDTH + MOBILE_BAR_INDENT);
  let mobileMaxLaughRate = $derived(
    Math.max(...mainCharsScreenTime.map((c) => c.causeLaughsWhileOnScreen)),
  );
  let mobileMaxNoLaughRate = $derived(
    Math.max(...mainCharsScreenTime.map((c) => c.onScreenWithoutLaughs)),
  );
  // Place midX so the widest laugh bar reaches mobileBarsStart and the widest no-laugh bar reaches chartWidth
  let mobileHalfWidth = $derived(
    (chartWidth - mobileBarsStart) / (1 + mobileMaxLaughRate / mobileMaxNoLaughRate),
  );
  let mobileMidX = $derived(chartWidth - mobileHalfWidth);
  let mobileInnerHeight = $derived(mainCharsScreenTime.length * 60);
  // Computed after mobileCharsData so minimum-height overrides are reflected
  let mobileChartHeight = $derived.by(() => {
    const last = mobileCharsData[mobileCharsData.length - 1];
    return last ? MOBILE_TOP_PADDING + last.barY + last.barHeight + 24 : MOBILE_TOP_PADDING + 16;
  });
  let mobileScreenTimeScale = $derived(
    scaleLinear().domain([0, totalBarsScreenTime]).range([0, mobileInnerHeight]),
  );
  let mobileLaughsScale = $derived(
    scaleLinear()
      .domain([0, Math.max(...mainCharsScreenTime.map((c) => c.onScreenWithoutLaughs))])
      .range([0, mobileHalfWidth]),
  );
  let mobileCharsData = $derived.by(() => {
    let y = 0;
    return mainCharsScreenTime.map((char) => {
      const barHeight = Math.max(mobileScreenTimeScale(char.screenTime), MOBILE_IMAGE_SIZE);
      const barY = y;
      y += barHeight + MOBILE_BAR_GAP;
      return {
        ...char,
        barY,
        barHeight,
        mobileLaughsWidth: mobileLaughsScale(char.causeLaughsWhileOnScreen),
        mobileNoLaughsWidth: mobileLaughsScale(char.onScreenWithoutLaughs),
        color: characters.find((c) => c.id === char.id)?.color ?? 'gray',
      };
    });
  });
</script>

<svelte:window bind:innerWidth bind:innerHeight />

<div class={isMobile ? 'w-screen pb-16' : 'h-[100dvh] w-screen mb-60'}>
  <div class="container" bind:clientWidth={containerWidth}>
    <!-- Header -->
    <div bind:clientHeight={headerHeight} class="mb-8">
      <h3>Comparing lead characters</h3>
      <div style="max-width: 900px;">
        In summary, if we compare the relative amount of screen time of each of the four lead
        characters with how much of that screen time they caused laughter we can form some general
        remarks.
      </div>
    </div>

    <!-- Marimekko chart -->
    <div class="relative">
      {#if isMobile}
        <svg width={chartWidth} height={mobileChartHeight}>
          <!-- Axis labels -->
          <text class="small accent" x={mobileBarsStart - 50} y={10}>Relative screen time</text>
          <text class="small accent" text-anchor="end" x={mobileMidX - 4} y={30}>Laughter</text>
          <text class="small accent" x={mobileMidX + 4} y={30}>Non-laughter</text>

          {#if mobileCharsData.length > 0}
            {@const firstBar = mobileCharsData[0]}
            {@const annotX = mobileBarsStart - 20}
            {@const annotEndY = MOBILE_TOP_PADDING + firstBar.barY + firstBar.barHeight / 2}
            {@const barLeftEdge = mobileMidX - firstBar.mobileLaughsWidth}
            <line
              x1={annotX}
              y1={16}
              x2={annotX}
              y2={annotEndY}
              stroke="#E71D80"
              stroke-opacity="0.4"
              stroke-width="1"
            />
            <line
              x1={annotX}
              y1={annotEndY}
              x2={barLeftEdge - 8}
              y2={annotEndY}
              stroke="#E71D80"
              stroke-opacity="0.4"
              stroke-width="1"
            />
          {/if}

          <g transform="translate(0, {MOBILE_TOP_PADDING})">
            <!-- Center guideline -->
            <line
              x1={mobileMidX}
              y1={0}
              x2={mobileMidX}
              y2={mobileInnerHeight + (mainCharsScreenTime.length - 1) * MOBILE_BAR_GAP}
              stroke="#12020A"
              stroke-opacity="0.15"
              stroke-width="1"
            />

            {#each mobileCharsData as char}
              <g
                opacity={hoveredChar === null || hoveredChar === char.id ? 1 : 0.3}
                class="transition-opacity duration-200 ease-out"
                role="presentation"
                style="cursor: pointer;"
                onclick={() => (hoveredChar = hoveredChar === char.id ? null : char.id)}
                onmouseenter={() => (hoveredChar = char.id)}
                onmouseleave={() => (hoveredChar = null)}
              >
                <!-- Image -->
                <foreignobject
                  x={0}
                  y={char.barY + char.barHeight / 2 - MOBILE_IMAGE_SIZE / 2}
                  width={MOBILE_IMAGE_SIZE}
                  height={MOBILE_IMAGE_SIZE}
                >
                  <img
                    loading="lazy"
                    src={getCharacterImagePath(char.id)}
                    alt={char.label}
                    style="width: 100%; height: auto; border-radius: 50%;"
                  />
                </foreignobject>
                <!-- Name: beside the icon, same vertical position -->
                <foreignobject
                  x={MOBILE_IMAGE_SIZE + 6}
                  y={char.barY + char.barHeight / 2 - MOBILE_IMAGE_SIZE / 2}
                  width={MOBILE_TEXT_WIDTH}
                  height={MOBILE_IMAGE_SIZE}
                >
                  <div style="display: flex; align-items: center; height: 100%;">
                    <div
                      style="font-size: 14px; line-height: 1.2; overflow: hidden; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; word-break: break-word;"
                    >
                      {char.label}
                    </div>
                  </div>
                </foreignobject>

                <!-- Laugh bar -->
                <rect
                  x={mobileMidX - char.mobileLaughsWidth}
                  y={char.barY}
                  width={char.mobileLaughsWidth}
                  height={char.barHeight}
                  fill={char.color}
                />
                <!-- No-laugh bar -->
                <rect
                  x={mobileMidX}
                  y={char.barY}
                  width={char.mobileNoLaughsWidth}
                  height={char.barHeight}
                  fill={char.color}
                  fill-opacity="0.5"
                />

                <!-- Percentage labels on hover/tap -->
                <g
                  class="transition-opacity duration-200 ease-out pointer-events-none"
                  opacity={hoveredChar === char.id ? 1 : 0}
                >
                  <!-- Screen time % — left of the bar -->
                  <circle
                    cx={mobileMidX - char.mobileLaughsWidth - LABEL_CIRCLE_R - 6}
                    cy={char.barY + char.barHeight / 2}
                    r={LABEL_CIRCLE_R}
                    fill="#F9F5F7"
                    stroke="#12020A"
                  />
                  <text
                    x={mobileMidX - char.mobileLaughsWidth - LABEL_CIRCLE_R - 6}
                    y={char.barY + char.barHeight / 2}
                    dy="1px"
                    text-anchor="middle"
                    dominant-baseline="middle"
                    class="text-xs font-semibold"
                    fill="#12020A">{Math.round(char.screenTime * 100)}%</text
                  >
                  <!-- Laugh % -->
                  <circle
                    cx={mobileMidX - char.mobileLaughsWidth / 2}
                    cy={char.barY - LABEL_CIRCLE_R - 4}
                    r={LABEL_CIRCLE_R}
                    fill="#F9F5F7"
                    stroke="#12020A"
                  />
                  <text
                    x={mobileMidX - char.mobileLaughsWidth / 2}
                    y={char.barY - LABEL_CIRCLE_R - 4}
                    dy="1px"
                    text-anchor="middle"
                    dominant-baseline="middle"
                    class="text-xs font-semibold"
                    fill="#12020A">{Math.floor(char.causeLaughsWhileOnScreen * 100)}%</text
                  >
                  <!-- No-laugh % -->
                  <circle
                    cx={mobileMidX + char.mobileNoLaughsWidth / 2}
                    cy={char.barY - LABEL_CIRCLE_R - 4}
                    r={LABEL_CIRCLE_R}
                    fill="#F9F5F7"
                    stroke="#12020A"
                  />
                  <text
                    x={mobileMidX + char.mobileNoLaughsWidth / 2}
                    y={char.barY - LABEL_CIRCLE_R - 4}
                    dy="1px"
                    text-anchor="middle"
                    dominant-baseline="middle"
                    class="text-xs font-semibold"
                    fill="#12020A">{Math.floor(char.onScreenWithoutLaughs * 100)}%</text
                  >
                </g>
              </g>
            {/each}
          </g>
        </svg>
      {:else}
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
                <g
                  transform="translate({char.screenTimeWidth / 2 - imageHeight / 2}, {-midpointY})"
                >
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
                <g
                  transform={`translate(${char.screenTimeWidth - 7}, ${-char.laughsWidth - 11.5})`}
                >
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
              <text class="small accent" x={0} y={-first.laughsWidth - 12}
                >Relative screen time</text
              >
            {/if}
          </g>
        </svg>
      {/if}
    </div>
  </div>
</div>

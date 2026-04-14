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

  let chartWidth = $derived(containerWidth - 64);
  let chartHeight = $derived(
    innerHeight - headerHeight - 60 > 700 ? innerHeight - headerHeight - 60 : 700,
  );
  let imageHeight = 60;

  const laughsScale = $derived(
    scaleLinear()
      .domain([0, Math.max(...charsScreenTime.map((char) => char.onScreenWithoutLaughs))])
      .range([0, chartHeight / 2 - 8]),
  );

  const LEAD_CHAR_IDS = ['JERRY', 'GEORGE', 'ELAINE', 'KRAMER'];
  let showLeadChars = $state(false);

  let filteredCharsScreenTime = $derived(
    showLeadChars ? charsScreenTime : charsScreenTime.filter((c) => !LEAD_CHAR_IDS.includes(c.id)),
  );

  let hoveredChar = $state<string | null>(null);
  const LABEL_CIRCLE_R = 16;

  let totalBarsScreenTime = $derived(
    filteredCharsScreenTime.reduce((acc, char) => acc + char.screenTime, 0),
  );
  let widthCoverage = $derived(chartWidth - 110 - (filteredCharsScreenTime.length - 1) * 50);

  let screenTimeScale = $derived(
    scaleLinear().domain([0, totalBarsScreenTime]).range([0, widthCoverage]),
  );

  let firstLaughsWidth = $derived(
    laughsScale(filteredCharsScreenTime[0]?.causeLaughsWhileOnScreen ?? 0),
  );

  type ChartChar = (typeof charsScreenTime)[number] & {
    screenTimeWidth: number;
    paddingLeft: number;
    laughsWidth: number;
    noLaughsWidth: number;
  };

  const charsData = $derived.by(() => {
    const array: ChartChar[] = filteredCharsScreenTime.map((char) => ({
      ...char,
      screenTimeWidth: 0,
      paddingLeft: 0,
      laughsWidth: 0,
      noLaughsWidth: 0,
    }));
    array.forEach((char, i) => {
      char.screenTimeWidth = screenTimeScale(char.screenTime);
      char.paddingLeft =
        i === 0 ? 0 : array.slice(0, i).reduce((acc, c) => acc + c.screenTimeWidth + 50, 0);
      char.laughsWidth = laughsScale(char.causeLaughsWhileOnScreen);
      char.noLaughsWidth = laughsScale(char.onScreenWithoutLaughs);
    });

    return array;
  });

  // Mobile layout
  const MOBILE_BAR_GAP = 16;
  const MOBILE_IMAGE_SIZE = 32;
  const MOBILE_TEXT_WIDTH = 72; // label text area next to icon
  const MOBILE_BAR_INDENT = 16; // gap from text right edge to bars
  const MOBILE_TOP_PADDING = 36;

  let isMobile = $derived(containerWidth < 640);
  let mobileBarsStart = $derived(MOBILE_IMAGE_SIZE + 6 + MOBILE_TEXT_WIDTH + MOBILE_BAR_INDENT);
  let mobileMaxLaughRate = $derived(
    Math.max(...filteredCharsScreenTime.map((c) => c.causeLaughsWhileOnScreen)),
  );
  let mobileMaxNoLaughRate = $derived(
    Math.max(...filteredCharsScreenTime.map((c) => c.onScreenWithoutLaughs)),
  );
  // Place midX so the widest laugh bar reaches mobileBarsStart and the widest no-laugh bar reaches chartWidth
  let mobileHalfWidth = $derived(
    (chartWidth - mobileBarsStart) / (1 + mobileMaxLaughRate / mobileMaxNoLaughRate),
  );
  let mobileMidX = $derived(chartWidth - mobileHalfWidth);
  let mobileInnerHeight = $derived(filteredCharsScreenTime.length * 48);
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
      .domain([0, Math.max(...filteredCharsScreenTime.map((c) => c.onScreenWithoutLaughs))])
      .range([0, mobileHalfWidth]),
  );
  let mobileCharsData = $derived.by(() => {
    let y = 0;
    return filteredCharsScreenTime.map((char) => {
      const barHeight = Math.max(mobileScreenTimeScale(char.screenTime), MOBILE_IMAGE_SIZE);
      const barY = y;
      y += barHeight + MOBILE_BAR_GAP;
      return {
        ...char,
        barY,
        barHeight,
        mobileLaughsWidth: mobileLaughsScale(char.causeLaughsWhileOnScreen),
        mobileNoLaughsWidth: mobileLaughsScale(char.onScreenWithoutLaughs),
        color: characters.find((c) => c.id === char.id)?.color || 'gray',
      };
    });
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
      <div class="mt-4 flex items-center gap-3">
        <span class="small">Include lead characters</span>
        <button
          class="lead-chars-toggle flex items-center gap-2"
          class:active={showLeadChars}
          onclick={() => (showLeadChars = !showLeadChars)}
          aria-pressed={showLeadChars}
        >
          <div class="char-avatars flex items-center gap-1">
            {#each LEAD_CHAR_IDS as id}
              <img src={getCharacterImagePath(id)} alt={id} class="char-avatar" />
            {/each}
          </div>
          <span class="pill">{showLeadChars ? '× remove' : '+ add'}</span>
        </button>
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
              y2={mobileInnerHeight + (filteredCharsScreenTime.length - 1) * MOBILE_BAR_GAP}
              stroke="#12020A"
              stroke-opacity="0.15"
              stroke-width="1"
            />

            {#each mobileCharsData as char, i}
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
                  width={char.mobileLaughsWidth === 0 ? 1 : char.mobileLaughsWidth}
                  height={char.barHeight}
                  fill={char.color}
                />
                <!-- No-laugh bar -->
                <rect
                  x={mobileMidX}
                  y={char.barY}
                  width={char.mobileNoLaughsWidth === 0 ? 1 : char.mobileNoLaughsWidth}
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
        <svg width={chartWidth} height={chartHeight}>
          <g transform="translate(70, {chartHeight / 2})">
            {#each charsData as char, i}
              <g
                transform="translate({char.paddingLeft}, 0)"
                opacity={hoveredChar === null || hoveredChar === char.id ? 1 : 0.3}
                class="transition-opacity duration-200 ease-out"
              >
                <g
                  transform="translate({char.screenTimeWidth / 2 -
                    imageHeight / 2 -
                    10}, {-chartHeight / 2 + (i % 2 == 0 ? 0 : imageHeight + 16)})"
                >
                  <line
                    x1={imageHeight / 2 + 10}
                    y1={imageHeight + 10}
                    x2={imageHeight / 2 + 10}
                    y2={chartHeight / 2 - char.laughsWidth - (i % 2 == 0 ? 30 : imageHeight + 50)}
                    stroke="#12020A"
                  />
                  <foreignobject width={imageHeight + 20} height={2 * imageHeight}>
                    <div
                      class="small text-center bg-white py-1"
                      style="margin-top: {imageHeight}px;"
                    >
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
                    10}, {-chartHeight / 2 + (i % 2 == 0 ? 0 : imageHeight + 16)})"
                >
                  <foreignobject width={imageHeight + 20} height={2 * imageHeight}>
                    <img
                      loading="lazy"
                      src={getCharacterImagePath(char.id)}
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
                <g
                  transform={`translate(${char.screenTimeWidth - 7}, ${-char.laughsWidth - 11.5})`}
                >
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
                  fill={characters.find((c) => c.id === char.id)?.color || 'gray'}
                />

                <!-- No Laugh -->
                <rect
                  x={0}
                  y={0}
                  width={char.screenTimeWidth === 0 ? 1 : char.screenTimeWidth}
                  height={char.noLaughsWidth}
                  fill={characters.find((c) => c.id === char.id)?.color || 'gray'}
                  fill-opacity="0.5"
                />
              </g>
            {/each}

            <!-- Accent labels: always full opacity, outside the dimming group -->
            {#if charsData.length > 0}
              {#if showLeadChars}
                <text class="small accent" x={0} y={-firstLaughsWidth - 12}
                  >Relative screen time</text
                >
              {:else}
                <rect x={-3} y={-firstLaughsWidth - 42} width={90} height={33} fill="#F9F5F7" />
                <text class="small accent" x={0} y={-firstLaughsWidth - 26}>
                  <tspan x={0} dy="0">Relative</tspan>
                  <tspan x={0} dy="14">screen time</tspan>
                </text>
              {/if}
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
      {/if}
    </div>
  </div>
</div>

<style>
  button {
    cursor: pointer;
    background: none;
    border: none;
    padding: 0;
    color: inherit;
  }

  .lead-chars-toggle {
    cursor: pointer;
  }

  .char-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: block;
    opacity: 0.25;
    transition: opacity 200ms ease-out;
  }

  @media (max-width: 639px) {
    .char-avatars {
      gap: 0;
    }
    .char-avatar + .char-avatar {
      margin-left: -10px;
    }
  }

  .lead-chars-toggle:hover .char-avatar {
    opacity: 0.55;
  }

  .lead-chars-toggle.active .char-avatar {
    opacity: 1;
  }

  .lead-chars-toggle.active:hover .char-avatar {
    opacity: 0.75;
  }

  .pill {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.03em;
    padding: 2px 8px;
    border-radius: 999px;
    border: 1.5px solid #12020a;
    color: #12020a;
    transition:
      background-color 200ms ease-out,
      color 200ms ease-out;
    white-space: nowrap;
  }

  .lead-chars-toggle.active .pill {
    background-color: #12020a;
    color: #f9f5f7;
  }
</style>

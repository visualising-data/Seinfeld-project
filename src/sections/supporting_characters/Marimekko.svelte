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
              <text class="small accent" x={0} y={-firstLaughsWidth - 12}>Relative screen time</text
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

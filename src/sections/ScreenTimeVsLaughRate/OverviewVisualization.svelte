<script>
  import { scaleLinear } from "d3-scale";

  import FILTER from "./ScreenTimeVsLaughRate.svelte";
  import ArrowDown from "../../icons/ArrowDown.svelte";

  let { 
    visualizationsWidth,
    visualizationsInnerHeight,
    episodesOverviewWidth,
    margin,
    marginEnd,
    activeFilter,
    isMouseOver,
    charData,
    activeSelector,
    highlightedEpisode,
    highlightedEpisodeOverviewPercentage,
    episodesVerticalScale
  } = $props();

  const overviewLabels = [0, 100];

  let episodeOverviewScale = $derived(
		scaleLinear()
			.domain([0, 1])
			.range([0, episodesOverviewWidth - marginEnd])
	);
</script>

<g transform="translate({visualizationsWidth - episodesOverviewWidth}, {margin.top})">
  <!-- Label -->
  <text 
    x={3}
    y={-4}
    class="small accent">{activeFilter === FILTER.SCREEN_TIME ? 'Screen time' : 'Laugh rate'}</text>
  <g transform="rotate(-90) translate(4, {activeFilter === FILTER.SCREEN_TIME ? 88 : 77})">
    <ArrowDown />
  </g>
  <rect
    class="pointer-events-none"
    x={0}
    y={0}
    width={episodesOverviewWidth - marginEnd}
    height={visualizationsInnerHeight}
    fill="#F9F5F7"
    fill-opacity={isMouseOver ? 0.3 : 0.9}
  />

  <!-- Vertical Axes -->
  {#each overviewLabels as overviewLabel}
    <g transform="translate({episodeOverviewScale(overviewLabel / 100)}, 0)" class="pointer-events-none">
      <line
        x1={0}
        y1={-12}
        x2={0}
        y2={visualizationsInnerHeight + 12}
        stroke="#303843"
      />
      <g class="number" fill="#928D90" text-anchor="middle" fill-opacity={isMouseOver ? 0.3 : 1}>
        <text
          x={0}
          y={-18}
        >
          {`${overviewLabel}%`}
        </text>
        <text
          x={0}
          y={visualizationsInnerHeight + 16}
          dominant-baseline="hanging"
        >
          {`${overviewLabel}%`}
        </text>
      </g>
    </g>
  {/each}

  {#each charData[activeSelector] as d}
    <!-- Bars -->
    <g transform="translate(0, {episodesVerticalScale(`${d.season}-${d.episode}`)})">
      {#if activeFilter === FILTER.SCREEN_TIME}
        <!-- Screen time -->
        {#if episodeOverviewScale((d.aggregatedOnScreen.length * 60) / d.duration)}
          <rect
            class="pointer-events-none"
            x={0}
            y={0}
            width={episodeOverviewScale((d.aggregatedOnScreen.reduce((/** @type {any} */ acc, /** @type {{ duration: any; }} */ value) => acc + value.duration, 0)) / d.duration)}
            height={episodesVerticalScale.bandwidth()}
            fill="#303843"
            fill-opacity={activeFilter === FILTER.LAUGHS ? 0.3 : (isMouseOver && highlightedEpisode === `${d.season}-${d.episode}`) || !isMouseOver ? 1 : 0.3}
            rx={3}
            ry={3}
          />
        {/if}
      {:else}
        <!-- Laugh rate -->
        {#if episodeOverviewScale(d.causesLaughs.length / (d.aggregatedOnScreen.reduce((/** @type {any} */ acc, /** @type {{ duration: any; }} */ value) => acc + value.duration, 0)))}
          <rect
            class="pointer-events-none"
            x={0}
            y={0}
            width={episodeOverviewScale(d.causesLaughs.length / d.onScreen.length)}
            height={episodesVerticalScale.bandwidth()}
            fill="#303843"
            fill-opacity={(isMouseOver && highlightedEpisode === `${d.season}-${d.episode}`) || !isMouseOver ? 1 : 0.3}
            rx={3}
            ry={3}
          />
        {/if}
      {/if}
    </g>

    <!-- Highlight tooltip -->
    {#if isMouseOver && highlightedEpisode === `${d.season}-${d.episode}`}
      <g transform="translate(0, {episodesVerticalScale(`${d.season}-${d.episode}`)})">
        <rect
          class="pointer-events-none"
          x={0}
          y={0}
          width={episodesOverviewWidth - marginEnd}
          height={episodesVerticalScale.bandwidth()}
          fill="#F9F5F7"
          rx={3}
          ry={3}
        />

        {#if activeFilter === FILTER.SCREEN_TIME}
          <rect
            class="pointer-events-none"
            x={0}
            y={-2}
            width={episodeOverviewScale((d.aggregatedOnScreen.reduce((/** @type {any} */ acc, /** @type {{ duration: any; }} */ value) => acc + value.duration, 0)) / d.duration)}
            height={episodesVerticalScale.bandwidth() + 4}
            fill="#303843"
            stroke={'#F9F5F7'}
            stroke-width={2}
            rx={3}
            ry={3}
          />
        {:else}
          <rect
            class="pointer-events-none"
            x={0}
            y={-2}
            width={episodeOverviewScale(d.causesLaughs.length / d.onScreen.length)}
            height={episodesVerticalScale.bandwidth() + 4}
            fill="#303843"
            stroke={'#F9F5F7'}
            stroke-width={2}
            rx={3}
            ry={3}
          />
        {/if}
      </g>
    {/if}
  {/each}

  <!-- Overview percentage tooltip -->
  {#if isMouseOver}
    <g transform="translate({episodeOverviewScale(highlightedEpisodeOverviewPercentage / 100)}, 0)">
      <line
        x1={0}
        y1={-12}
        x2={0}
        y2={visualizationsInnerHeight + 12}
        stroke="#12020A"
        stroke-width={2}
      />
      <g class="number" fill="#12020A" fill-opacity={1} text-anchor="middle">
        <text
          x={0}
          y={-18}
        >
          {`${highlightedEpisodeOverviewPercentage}%`}
        </text>
        <text
          x={0}
          y={visualizationsInnerHeight + 16}
          dominant-baseline="hanging"
        >
          {`${highlightedEpisodeOverviewPercentage}%`}
        </text>
      </g>
    </g>
  {/if}
</g>
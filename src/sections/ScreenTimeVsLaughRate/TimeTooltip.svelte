<script>
  import { FILTER } from '../../types/filter';

  let { 
    charData,
    activeSelector,
    highlightedEpisode,
    activeFilter,
    highlightedEpisodeTimePosition,
    highlightedEpisodeTimeLabel,
    visualizationsInnerHeight,
    episodeTimeScale,
    episodesVerticalScale 
  } = $props();
</script>

{#each charData[activeSelector] as d}
  {#each d.aggregatedOnScreen as screenMoment}
    {#if highlightedEpisode === `${d.season}-${d.episode}`}
      <!-- Highlight on episode -->

      <!-- Time on screen -->
      <rect
        class="pointer-events-none {activeSelector}-onscreen season-{d.season}"
        x={episodeTimeScale(screenMoment.start)}
        y={episodesVerticalScale(`${d.season}-${d.episode}`) - 2}
        width={episodeTimeScale(screenMoment.duration)}
        height={episodesVerticalScale.bandwidth() + 4}
        fill="#303843"
        fill-opacity={activeFilter === FILTER.LAUGHS ? 0.6 : 1}
        stroke={activeFilter === FILTER.LAUGHS ? 'none' : '#F9F5F7'}
        stroke-width={2}
        rx={3}
        ry={3}
      />

      <!-- Time being funny -->
      {#if activeFilter === FILTER.LAUGHS}
        <rect
          class="pointer-events-none {activeSelector}-laugh"
          x={episodeTimeScale(screenMoment.start) - 2}
          y={episodesVerticalScale(`${d.season}-${d.episode}`) - 2}
          width={episodeTimeScale(screenMoment.duration) + 4}
          height={episodesVerticalScale.bandwidth() + 4}
          fill="#303843"
          stroke={'#F9F5F7'}
          stroke-width={2}
          rx={3}
          ry={3}
        />
      {/if}      
    {/if}
  {/each}
{/each}

<!-- Time label -->
<g transform="translate({highlightedEpisodeTimePosition}, 0)" class="pointer-events-none">
  <line
    x1={0}
    y1={-12}
    x2={0}
    y2={visualizationsInnerHeight + 12}
    stroke="#12020A"
    stroke-width={2}
  />
  <g class="number" fill="#12020A" text-anchor="middle">
    <text
      x={0}
      y={-18}
    >
      {highlightedEpisodeTimeLabel}
    </text>
    <text
      x={0}
      y={visualizationsInnerHeight + 16}
      dominant-baseline="hanging"
    >
      {highlightedEpisodeTimeLabel}
    </text>
  </g>
</g>
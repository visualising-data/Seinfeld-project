<script>
  // @ts-ignore
  import { area } from 'd3-shape';

  import { episodesInfo } from "$lib/data/episodesInfo";
  import { getIfClipShow } from "../../utils/getIfClipShow";
  import { characters } from '$lib/data/characters';

  import { FILTER } from '../../types/filter';

  let { 
    isMouseOver, 
    episodeTimeScale, 
    episodesVerticalScale, 
    charData, 
    activeSelector, 
    highlightedEpisode, 
    activeFilter
  } = $props();

  /**
	 * @type {{ season: number; episode: number; duration: number; position: string; }[]}
	 */
  const pointsForEpisodesDuration = []
  episodesInfo.forEach((e) => {
    pointsForEpisodesDuration.push({
      season: e.season,
      episode: e.episode,
      duration: getIfClipShow(e.season, e.episode) ? 0 : e.duration,
      position: 'start'
    })
    pointsForEpisodesDuration.push({
      season: e.season,
      episode: e.episode,
      duration: getIfClipShow(e.season, e.episode) ? 0 : e.duration,
      position: 'end'
    })
  })

  const episodesDurationPathGenerator = $derived.by(() => area()
    .x0(() => 0)
    .x1((/** @type {{ duration: any; }} */ d) => episodeTimeScale(d.duration))
    .y((/** @type {{ season: any; episode: any; position: string; }} */ d) => episodesVerticalScale(`${d.season}-${d.episode}`) + (d.position === 'end' ? episodesVerticalScale.bandwidth() : 0)))
</script>

<!-- Episodes duration -->
<path
  d={episodesDurationPathGenerator(pointsForEpisodesDuration)}
  fill="#F9F5F7"
  fill-opacity={isMouseOver ? 0.3 : 0.9}
/>

{#each charData[activeSelector] as d}
  <g transform="translate(0, {episodesVerticalScale(`${d.season}-${d.episode}`)})">

    <!-- Mouse over highlight -->
    {#if isMouseOver && highlightedEpisode === `${d.season}-${d.episode}`}
      <rect
        class="pointer-events-none episode-duration season-{d.season}-episode-{d.episode}"
        x={0}
        y={0}
        width={episodeTimeScale(d.duration)}
        height={episodesVerticalScale.bandwidth()}
        fill="#F9F5F7"
        stroke="transparent"
      />
    {/if}

    <!-- Screen time -->
    {#each d.aggregatedOnScreen as screenMoment}
      <rect
        class="pointer-events-none {activeSelector}-onscreen season-{d.season}"
        x={episodeTimeScale(screenMoment.start)}
        y={0}
        width={episodeTimeScale(screenMoment.duration)}
        height={episodesVerticalScale.bandwidth()}
        fill="#303843"
        rx={3}
        ry={3}
        style="opacity: {activeFilter === FILTER.LAUGHS ? 0.3 : (isMouseOver && highlightedEpisode === `${d.season}-${d.episode}`) || !isMouseOver ? 1 : 0.3};"
      />
    {/each}

    {#if activeSelector === 'JERRY'}
      <!-- Screen time at work -->
      {#each d.onScreenAtWork as screenMoment}
        <rect
          class="pointer-events-none jerry-at-work"
          x={episodeTimeScale(screenMoment.start)}
          y={0}
          width={episodeTimeScale(screenMoment.duration)}
          height={episodesVerticalScale.bandwidth()}
          fill="#303843"
          stroke={'#F9F5F7'}
          stroke-width={1}
          rx={3}
          ry={3}
          style="opacity: 0;"
        />
      {/each}

      <!-- Lead characters on screen without Jerry -->
      {#each d.withoutJerry as screenMoment}
        <rect
          class="pointer-events-none without-jerry"
          x={episodeTimeScale(screenMoment.start)}
          y={0}
          width={episodeTimeScale(screenMoment.duration)}
          height={episodesVerticalScale.bandwidth()}
          fill="#E71D80"
          stroke={'#F9F5F7'}
          stroke-width={1}
          rx={3}
          ry={3}
          style="opacity: 0;"
        />
      {/each}

      <!-- First scene without Jerry -->
      {#each d.firstSceneWithoutJerry as screenMoment}
        <rect
          class="pointer-events-none first-scene-without-jerry"
          x={episodeTimeScale(screenMoment.start)}
          y={0}
          width={episodeTimeScale(screenMoment.duration)}
          height={episodesVerticalScale.bandwidth()}
          fill="#303843"
          stroke={'#F9F5F7'}
          stroke-width={1}
          rx={3}
          ry={3}
          style="opacity: 0;"
        />
      {/each}
    {/if}

    <!-- Laughs -->
    {#if activeFilter === FILTER.LAUGHS}
      {#each d.aggregatedLaughs as screenMoment}
        <rect
          class="pointer-events-none {activeSelector}-laugh"
          x={episodeTimeScale(screenMoment.start) - (isMouseOver && highlightedEpisode === `${d.season}-${d.episode}` ? 2 : 0)}
          y={isMouseOver && highlightedEpisode === `${d.season}-${d.episode}` ? -2 : 0}
          width={(screenMoment.duration > 0 ? Math.max(2, episodeTimeScale(screenMoment.duration)) : 0) + (isMouseOver && highlightedEpisode === `${d.season}-${d.episode}` ? 4 : 0)}
          height={episodesVerticalScale.bandwidth() + (isMouseOver && highlightedEpisode === `${d.season}-${d.episode}` ? 4 : 0)}
          fill="#12020A"
          style="opacity: {(isMouseOver && highlightedEpisode === `${d.season}-${d.episode}`) || !isMouseOver ? 1 : 0.3};"
          stroke={isMouseOver && highlightedEpisode === `${d.season}-${d.episode}` ? '#F9F5F7' : 'none'}
          stroke-width={2}
          rx={3}
          ry={3}
        />
      {/each}
    {/if}
  </g>
{/each}
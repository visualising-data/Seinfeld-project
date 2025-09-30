<script lang="ts">
  import { mean } from "d3-array";
  import type { Episode } from "$lib/types/episode";
  import type { ScaleBand, ScaleLinear } from "d3-scale";
  import PercentageAxes from "./PercentageAxes.svelte";
  import { episodesInfo } from "$lib/data/episodesInfo";

  let { 
        episodesData,
        barsHeight, 
        width, 
        topMargin, 
        episodeVerticalPositionScale, 
        percentageScale, 
        handleMouseEnter = $bindable(), 
        handleMouseLeave = $bindable() 
      } : { 
        episodesData: Episode[];
        barsHeight: number; 
        width: number; topMargin: number; 
        episodeVerticalPositionScale: ScaleBand<string>; 
        percentageScale: ScaleLinear<number, number>, 
        handleMouseEnter: (e: MouseEvent & { currentTarget: EventTarget & SVGRectElement; }, episode: Episode) => void, 
        handleMouseLeave: () => void 
      } = $props();

  const imdbRatings = [] as number[];
    episodesInfo.forEach(episode => {
        const laughRate = episode.IMDB_rating
            ? +episode.IMDB_rating.replace(',', '.')
            : 0;
        imdbRatings.push(laughRate);
    });
    const meanIMDbRating = Math.round((mean(imdbRatings) ?? 0) * 10) / 10;
</script>

<div id="imdb-rating" class="relative ml-8">
    <svg width={width + 40} height={barsHeight + 70} style="margin-top: -35px; padding-top: {topMargin}px;">
        <g transform="translate(20, 0)">
            <!-- Background -->
            <rect 
                x={0} 
                y={35} 
                width={width} 
                height={barsHeight} 
                fill="rgba(231, 28, 128, 0.15)" />
                
            <!-- Percentages -->
            <PercentageAxes {barsHeight} {width} secondLabel="10" />

            <!-- Label -->
            <text 
                class="small accent label" 
                x={6} 
                y={30}>IMDb rating</text>

            <g transform="translate(0, 35)">
                <!-- IMDb rating bars -->
                {#each episodesData as episode}
                    <rect
                      class="bar"
                      x={0}
                      y={episodeVerticalPositionScale(`${episode.season}-${episode.episode}`)}
                      width={
                        (() => {
                          const info = episodesInfo.find(e => e.season === episode.season && e.episode === episode.episode);
                          return info && info.IMDB_rating
                            ? percentageScale(+info.IMDB_rating.replace(',', '.') / 10)
                            : 0;
                        })()
                      }
                      height={episodeVerticalPositionScale.bandwidth()}
                      fill="#E71D80"
                      role="document"
					            onmouseenter={(e) => handleMouseEnter(e, episode)}
					            onmouseleave={handleMouseLeave}
                    />
                {/each}

                <!-- Mean -->
                <line
                  class="avg-line"
                  x1={percentageScale(meanIMDbRating / 10)}
                  y1={0}
                  x2={percentageScale(meanIMDbRating / 10)}
                  y2={barsHeight}
                  stroke="#12020A"
                  stroke-width={2} />
            </g>
        </g>
    </svg>

    <!-- Average label -->
    <div class="avg-label small absolute text-center px-2 py-1 rounded-md"
         style="
            top: {100}px; 
            left: {percentageScale(meanIMDbRating / 10) - 53}px; 
            background-color: rgba(249, 245, 247, 0.9);"
    >
        <div>avg</div>
        <div>{`${meanIMDbRating}/10`}</div>
    </div>
</div>